#!/usr/bin/env node
/**
 * Rebuild public/archive/v1 as a nested classic-site root.
 *
 * - Vendors Bootstrap 2.3.2 + jQuery from cdnjs (not package.json)
 * - Keeps ALL inline styles + YouTube iframes + local img/* paths
 * - Expects images already in public/archive/v1/img/ (copy from classic sources)
 *
 * Usage: node scripts/snapshot-legacy-portfolio.mjs [/path/to/index.html]
 */

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public/archive/v1");

async function fetchBin(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function fetchText(url) {
  return (await fetchBin(url)).toString("utf8");
}

async function ensureVendors() {
  const files = [
    [
      "bootstrap/css/bootstrap.min.css",
      "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.3.2/css/bootstrap.min.css",
    ],
    [
      "bootstrap/css/bootstrap-responsive.min.css",
      "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.3.2/css/bootstrap-responsive.min.css",
    ],
    [
      "bootstrap/js/bootstrap.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.3.2/js/bootstrap.min.js",
    ],
    [
      "jquery/jquery-1.10.2.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/jquery/1.10.2/jquery.min.js",
    ],
    [
      "jquery/jquery-ui-1.10.3.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js",
    ],
  ];

  for (const [rel, url] of files) {
    const dest = join(OUT, rel);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, await fetchBin(url));
    console.log(`vendored ${rel}`);
  }

  const stub = "/* optional classic plugin stub */\n";
  for (const rel of [
    "jquery/pro-bars.js",
    "jquery/visible.min.js",
    "jquery/smoothscroll.js",
  ]) {
    const dest = join(OUT, rel);
    try {
      await access(dest);
    } catch {
      await writeFile(dest, stub);
    }
  }
}

async function main() {
  await mkdir(join(OUT, "css"), { recursive: true });
  await mkdir(join(OUT, "img"), { recursive: true });
  await ensureVendors();
  await readFile(join(OUT, "css/custom.css"), "utf8");

  const localHtml = process.argv[2];
  let html = localHtml
    ? await readFile(localHtml, "utf8")
    : await fetchText("https://aaronduchateau.com/");

  html = html.replace(/<div id="particles-js"><\/div>\s*/gi, "");

  // Keep real img/* paths — assets live under public/archive/v1/img/
  html = html.replace(
    /src=(["'])https?:\/\/www\.youtube\.com\/embed\//gi,
    "src=$1https://www.youtube-nocookie.com/embed/",
  );

  html = html.replace(
    /src=["']bootstrap\/js\/jquery-1\.7\.2\.min\.js["']/gi,
    'src="jquery/jquery-1.10.2.min.js"',
  );
  html = html.replace(
    /src=["']https:\/\/ajax\.googleapis\.com\/ajax\/libs\/jquery\/1\.10\.2\/jquery\.min\.js["']/gi,
    'src="jquery/jquery-1.10.2.min.js"',
  );
  html = html.replace(
    /src=["']https:\/\/ajax\.googleapis\.com\/ajax\/libs\/jqueryui\/1\.10\.3\/jquery-ui\.min\.js["']/gi,
    'src="jquery/jquery-ui-1.10.3.min.js"',
  );

  if (!/<base\b/i.test(html)) {
    html = html.replace(
      /<head([^>]*)>/i,
      '<head$1>\n    <base href="/archive/v1/">\n    <meta charset="utf-8">\n',
    );
  }

  // Redact classic footer contact (do not ship live phone/email in the archive).
  html = html
    .replace(/541-653-0973/g, "XXX-XXX-XXXX")
    .replace(/CHATEAUCONCEPT@GMAIL\.COM/gi, "XXXXXXXXXXXX@XXXXX.XXX")
    .replace(/chateauconcept@gmail\.com/gi, "XXXXXXXXXXXX@XXXXX.XXX");

  await writeFile(join(OUT, "index.html"), html, "utf8");
  await writeFile(join(OUT, "document.html"), html, "utf8");

  const imgs = [...html.matchAll(/src=["'](img\/[^"']+)["']/gi)].map((m) => m[1]);
  const missing = [];
  for (const rel of new Set(imgs)) {
    try {
      await access(join(OUT, rel));
    } catch {
      missing.push(rel);
    }
  }

  console.log(`Wrote ${OUT}/index.html + document.html`);
  console.log(
    `iframes=${(html.match(/<iframe\b/gi) || []).length} inline-styles=${(html.match(/\sstyle="/gi) || []).length} img-refs=${new Set(imgs).size}`,
  );
  if (missing.length) {
    console.warn("Missing image files:", missing.join(", "));
  } else {
    console.log("All referenced img/* files present.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
