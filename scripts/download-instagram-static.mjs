#!/usr/bin/env node
/**
 * Downloads recent Instagram timeline images for a public username via the
 * unauthenticated web_profile_info endpoint and saves JPEGs under public/instagram/<username>/.
 *
 * Uses Node https (not fetch) to avoid Sec-Fetch-* headers that Instagram may reject.
 *
 * Limitations:
 * - Tries to paginate via /api/v1/feed/user/{id}/ (public accounts). That feed can return 401
 *   (“require_login”) when Instagram throttles; then only web_profile_info’s first page is used.
 * - Very old full history may still need a data export or Graph API.
 * - May receive HTTP 429; wait and retry later.
 * - GraphVideo/Reels: usually only the display_url thumbnail is fetched, not full video files.
 * - Respect Instagram ToS; intended for content you own or may reuse.
 */
import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const username =
  process.argv[2] ||
  process.env.INSTAGRAM_USERNAME ||
  "aaronduchat";

const USER_AGENT = "Instagram 219.0.0.12.117 Android";
const ENDPOINT = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
const PAGE_SIZE = Math.min(
  50,
  Math.max(1, Number(process.env.INSTAGRAM_PAGE_SIZE) || 12),
);
const PAGE_DELAY_MS = Math.max(0, Number(process.env.INSTAGRAM_PAGE_DELAY_MS) || 400);

function httpsGet(url, { okStatus = (s) => s >= 200 && s < 300 } = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: "GET",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "*/*",
        ...headers,
      },
    };
    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const body = Buffer.concat(chunks);
        const statusCode = res.statusCode || 0;
        if (!okStatus(statusCode)) {
          reject(
            new Error(`HTTP ${statusCode}: ${body.toString("utf8").slice(0, 200)}`),
          );
          return;
        }
        resolve({ statusCode, body });
      });
    });
    req.on("error", reject);
    req.end();
  });
}

function httpsGetBuffer(url, headers = {}) {
  return httpsGet(url, {}, headers).then((r) => r.body);
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function bestImageUrlFromVersions(item) {
  const candidates = item?.image_versions2?.candidates;
  if (!candidates?.length) return null;
  return [...candidates].sort((a, b) => (b.width || 0) - (a.width || 0))[0]?.url ?? null;
}

/** Collect JPEG URLs from one mobile-feed item (photo, video thumbnail, or carousel). */
function collectFeedItemUrls(item) {
  if (!item) return [];
  if (item.carousel_media?.length) {
    const urls = [];
    for (const m of item.carousel_media) {
      const u = bestImageUrlFromVersions(m);
      if (u) urls.push(u);
    }
    return urls;
  }
  const u = bestImageUrlFromVersions(item);
  return u ? [u] : [];
}

function collectDisplayUrls(node) {
  const urls = [];
  if (node?.__typename === "GraphSidecar" && node.edge_media_to_children?.edges?.length) {
    for (const edge of node.edge_media_to_children.edges) {
      const u = edge?.node?.display_url;
      if (u) urls.push(u);
    }
    return urls.length ? urls : [];
  }
  if (node?.display_url) urls.push(node.display_url);
  return urls;
}

async function downloadToFile(url, destPath) {
  const buf = await httpsGetBuffer(url);
  await fs.promises.writeFile(destPath, buf);
}

async function main() {
  const outDir = path.join(__dirname, "..", "public", "instagram", username);
  await fs.promises.mkdir(outDir, { recursive: true });

  let jsonBuf;
  try {
    jsonBuf = await httpsGetBuffer(ENDPOINT);
  } catch (e) {
    console.error(String(e.message || e));
    if (String(e.message || e).includes("429")) {
      console.error("Rate limited. Wait and retry, or try another network.");
    }
    process.exit(1);
  }

  let json;
  try {
    json = JSON.parse(jsonBuf.toString("utf8"));
  } catch {
    console.error("Invalid JSON:", jsonBuf.toString("utf8").slice(0, 400));
    process.exit(1);
  }

  const user = json?.data?.user;
  if (!user) {
    console.error("Unexpected JSON:", JSON.stringify(json).slice(0, 400));
    process.exit(1);
  }

  const profilePic = user.profile_pic_url_hd || user.profile_pic_url;
  if (profilePic) {
    const dest = path.join(outDir, "profile.jpg");
    console.log("Downloading profile →", dest);
    await downloadToFile(profilePic, dest);
  }

  const userId = user.id;
  let saved = 0;
  let maxId = null;
  let feedPages = 0;
  let usedFeed = false;

  if (userId) {
    while (true) {
      const feedUrl = new URL(`https://i.instagram.com/api/v1/feed/user/${userId}/`);
      feedUrl.searchParams.set("count", String(PAGE_SIZE));
      if (maxId) feedUrl.searchParams.set("max_id", maxId);

      let statusCode;
      let body;
      try {
        ({ statusCode, body } = await httpsGet(feedUrl.toString(), {
          okStatus: () => true,
        }));
      } catch (e) {
        console.warn("Feed request failed:", String(e.message || e));
        break;
      }

      if (statusCode !== 200) {
        const snippet = body.toString("utf8").slice(0, 300);
        console.warn(
          `Feed HTTP ${statusCode}. Falling back to web_profile timeline slice only.\n${snippet}`,
        );
        break;
      }

      let feedJson;
      try {
        feedJson = JSON.parse(body.toString("utf8"));
      } catch {
        console.warn("Feed returned non-JSON; stopping pagination.");
        break;
      }

      const items = feedJson.items ?? [];
      usedFeed = true;
      feedPages += 1;

      for (const item of items) {
        const shortcode = item.code || item.id || `media-${saved}`;
        const urls = collectFeedItemUrls(item);
        if (!urls.length) continue;

        let i = 0;
        for (const url of urls) {
          const suffix = urls.length > 1 ? `-${i}` : "";
          const dest = path.join(outDir, `${shortcode}${suffix}.jpg`);
          console.log("Downloading", shortcode + suffix, "→", path.basename(dest));
          await downloadToFile(url, dest);
          i += 1;
          saved += 1;
        }
      }

      const more = feedJson.more_available && feedJson.next_max_id;
      if (!more) break;
      maxId = feedJson.next_max_id;
      if (PAGE_DELAY_MS) await delay(PAGE_DELAY_MS);
    }
  }

  if (!usedFeed) {
    const edges = user.edge_owner_to_timeline_media?.edges ?? [];
    if (!edges.length && user.is_private) {
      console.warn(
        "Account looks private: no timeline in web_profile_info. Make the profile public or use an export.",
      );
    }
    for (const edge of edges) {
      const node = edge?.node;
      if (!node) continue;
      const shortcode = node.shortcode || node.id || `media-${saved}`;
      const urls = collectDisplayUrls(node);
      if (!urls.length) continue;

      let i = 0;
      for (const url of urls) {
        const suffix = urls.length > 1 ? `-${i}` : "";
        const dest = path.join(outDir, `${shortcode}${suffix}.jpg`);
        console.log("Downloading", shortcode + suffix, "→", path.basename(dest));
        await downloadToFile(url, dest);
        i += 1;
        saved += 1;
      }
    }
  }

  console.log(
    `Done. Wrote ${saved} timeline image(s) (+ profile if present) to ${outDir}` +
      (usedFeed ? ` [feed pages: ${feedPages}]` : " [web_profile_info slice only]"),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
