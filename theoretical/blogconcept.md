# Strategic Master Blueprint: Autonomous, Manipulation-Proof Conversation Engine

> **Status:** Theoretical — not implemented. This document consolidates draft notes into a single reference.

This blueprint serves as a comprehensive strategic framework for a next-generation Web3 communication platform. The system is designed to allow authentic conversational behavior, eliminate automated spam, and prevent malicious text-linking tricks without relying on traditional Web2 servers, databases, or centralized hosting teams.

---

## 1. System Vision & Objectives

Traditional digital forums struggle with a fundamental trade-off: **open access breeds spam, while heavy moderation breeds centralization.** This framework resolves that contradiction by utilizing decentralized infrastructure to enforce three core platform objectives:

* **Foster Authentic Conversation:** Create an ecosystem where human users can express ideas openly, knowing the environment is free from bot networks and corporate censorship / controlled moderation algorithms.
* **Punish Spam and Social Targeting:** Introduce absolute economic friction against sybil attacks (mass account creation) so that spamming the system becomes a losing financial transaction—including **Fibonacci-escalating per-actor fees** tied to wallet and/or IP/referer identity.
* **Disable Advanced Tricky Linking:** Eliminate the threat of malicious hyperlinks, phishing drops, or structural content injections (like hidden formatting, obfuscated code, or misleading character spacing).

---

## 2. The Three-Tiered Defensive Strategy

To achieve these objectives without a centralized backend, the platform implements a synchronized, layer-by-layer security matrix directly inside the user's browser wallet handshake.

```
[ INCOMING POST TRANSACTION ]
              │
              ▼
┌─────────────────────────────────────────┐
│ TIER 1: ECONOMIC SYBIL DEFENSE          │ --> Stops bulk spam bots instantly
│ - API3 dAPI / Pyth Oracle Floating      │     via currency-stable friction.
│   Fiat Fee + Fibonacci Escalation       │
└────────────────────┬────────────────────┘
                     │ (Fee Paid)
                     ▼
┌─────────────────────────────────────────┐
│ TIER 2: STRUCTURAL DATA GATES           │ --> Wipes out standard image injections
│ - Browser Regex + Contract Receipts       │     and direct smart contract bypasses.
└────────────────────┬────────────────────┘
                     │ (Filter Checked)
                     ▼
┌─────────────────────────────────────────┐
│ TIER 3: SEMANTIC INTEGRITY SCANNER       │ --> Catches obfuscated text tricks, jailbreaks,
│ - On-Chain AI Inference + Safe Veto      │     and provides ultimate admin curation.
└─────────────────────────────────────────┘
```

### Tier 1: Financial & Psychological Friction (Sybil Resistance)

* **The Component:** API3 dAPI First-Party Oracles (early drafts also referenced API3/Pyth oracle pricing for the same floating fiat fee).
* **The Strategy:** Every post request requires a currency-stable entry fee pegged to a specific fiat value (e.g., exactly $5.00 USD). A smart contract calculates this value dynamically in native network tokens (like ETH) by parsing real-time oracle data directly from API3 dAPI proxy contracts using the `read()` interface method.
* **The Behavioral Impact:** Legitimate human participants are willing to spend a nominal fee to secure premium visibility on a bot-free network. Conversely, automated spammers, who rely on broadcasting millions of posts to be profitable, are completely priced out. The cost of running an automated campaign on this platform instantly destroys its financial return. Furthermore, leveraging API3 captures Oracle Extractable Value (OEV), feeding arbitrage bid revenues straight back into your contract treasury.

#### Fibonacci Escalation (Per-Actor Post Pricing)

On top of the oracle-pegged base fee, the contract **escalates the required payment along the Fibonacci sequence** based on how many times a given actor has already posted. Each additional post from the same identity costs more—turning high-volume spam into exponentially expensive behavior while keeping a first post affordable for real humans.

* **The Component:** On-chain post counter keyed to an **actor identity** derived from a marriage of:
  * **Wallet address** (primary, cryptographic, SIWE-authenticated), and/or
  * **IP address / HTTP Referer fingerprint** (captured by the browser SDK, hashed client-side, and submitted alongside the `_frontendVerifiedFilter` receipt when wallet-only identity is insufficient or as a secondary sybil signal).
* **The Strategy:** The smart contract stores a per-actor `postCount`. Before accepting a new post, it computes:

  ```
  requiredFee = baseFiatFee × fib(postCount + 1)
  ```

  where `fib(n)` follows the standard sequence `1, 1, 2, 3, 5, 8, 13, 21, …` (exact indexing to be fixed at implementation time). The base fiat fee is still converted to native tokens via the API3 dAPI oracle; only the **multiplier** grows with repetition.

  | Post # (same actor) | Fibonacci multiplier | Example (base = $5 USD) |
  |---------------------|----------------------|-------------------------|
  | 1                   | 1                    | $5.00                   |
  | 2                   | 1                    | $5.00                   |
  | 3                   | 2                    | $10.00                  |
  | 4                   | 3                    | $15.00                  |
  | 5                   | 5                    | $25.00                  |
  | 6                   | 8                    | $40.00                  |
  | 7                   | 13                   | $65.00                  |

* **Identity marriage (wallet ⊕ referer):** The contract should treat identity as a **composite key** where possible—e.g. `keccak256(wallet ‖ hashedIpRefererFingerprint)`—so that:
  * A single wallet cannot cheaply farm posts from one machine while evading IP-based escalation.
  * A single IP cannot cheaply farm posts across throwaway wallets without wallet-based escalation still applying.
  * Either signal alone remains usable when the other is unavailable (wallet-only on pure on-chain paths; referer/IP hash as supplemental friction in the SDK handshake).

* **The Behavioral Impact:** A human writing occasional thoughtful posts pays near the base fee. A botnet or spammer posting dozens of times from the same wallet, IP block, or referer pattern hits Fibonacci growth quickly—each successive post costs materially more than the last, making sustained flooding economically irrational long before moderation or AI tiers even engage.

* **Open design questions (theoretical):**
  * Decay / reset window: should `postCount` roll off after N days so legitimate active users are not penalized forever?
  * Cap: maximum Fibonacci index or hard fee ceiling to avoid absurd edge-case amounts.
  * Privacy: IP/referer data should be **hashed before leaving the client**; only the hash is stored on-chain, not raw IPs.

### Tier 2: Structural Data Gates (The Hard Filters)

* **The Component:** Client-Side Regex Sanitation + Contract-Enforced Validation Receipts.
* **The Strategy:** Before data is anchored to decentralized storage, the custom NPM SDK library forces the text string through local regular expression filters in the browser. These scanners wipe out markdown image arrays `![alt](url)`, HTML media elements `<img />`, and raw hyperlink structures using four precise catching mechanisms:
  1. *Markdown Image Catch:* Deletes blocks matching `/!\[.*?\]\(.*?\)/g`.
  2. *HTML Media Block Catch:* Deletes `<img[^>]*>` tags.
  3. *Hyperlink Conversion:* Converts markdown links `[Anchor](url)` to plain text string text.
  4. *Raw URL Grab:* Substitutes loose URLs (`https?://` or `www.`) with a template string text like `[REMOVED LINK]`.
* **The Behavioral Impact:** This layer processes malicious payload removal instantly at zero gas cost. To prevent advanced users from using terminal applications or command lines to bypass the browser filter and ping the smart contract directly, the contract demands a validation boolean receipt (`_frontendVerifiedFilter == true`). If a direct execution attempt does not provide this browser-verified receipt, the blockchain protocol automatically drops the transaction.

### Tier 3: Semantic Integrity (Intent Analysis & Final Curation)

* **The Component:** On-Chain AI Inference Oracles (ORA opML / Ritual Infernet) + Multi-Sig Safe Dashboard.
* **The Strategy:** For sophisticated bad actors attempting adversarial prompt modifications or clever linguistic jailbreaks (e.g., using broken word spacing, special characters, or base64 encryption to hint at a scam link without triggering standard code patterns), the text is submitted to an on-chain AI oracle. The AI model evaluates the text's semantic intent and updates the smart contract with a verifiable manipulation risk score.
* **The Behavioral Impact:** If the text's risk metrics cross your safety threshold, the smart contract flags the entry and automatically shifts its status to a scrambled/denied paradigm—**withholding the release key** so the feed slot stays as a `⟦DENIED:⟦` pretense (see §3.1) rather than ever revealing the IPFS payload. For extreme cases, the contract may additionally overwrite on-chain release metadata with zero bytes (`0x00...`). In addition, the master administrative key can be moved to a Safe Multi-Sig board using an "M-of-N" threshold configuration. This gives your moderation group an absolute, cryptographic veto switch to manually adjust display states or premium feature flags—retaining total curatorial control over the public feed without single point of failure risk.

#### Content Rating Layer (G → PG → PG-13 → R → X)

The same on-chain AI oracle stack (ORA opML / Ritual Infernet) that today returns a single **manipulation risk score** can be extended—or prompted—to emit a **discrete content rating** alongside (or instead of) a raw risk float. This maps naturally onto a familiar **G / PG / PG-13 / R / X** ladder (theoretical naming; exact labels are policy choices).

| Rating | Enum (on-chain) | Typical meaning (draft policy) | Default feed behavior |
|--------|-----------------|--------------------------------|------------------------|
| **G** | `0` | General audience; no profanity, threats, sexual content, or manipulation | Auto-eligible for `ClientFacing` if risk score also passes |
| **PG** | `1` | Mild language or edgy tone; still broadly safe | `ClientFacing` after oracle + optional human skim |
| **PG-13** | `2` | Stronger language, mature themes, argumentative heat | `ClientFacing` with **rating badge**; may require blur-until-tap |
| **R** | `3` | Restricted: graphic, harassing, or high-manipulation intent | Stays pretense until **manual Safe approval**; restricted feed filter |
| **X** | `4` | Reject tier: spam, scams, illegal solicitation, severe abuse | Auto-route to `Scrambled` / `⟦DENIED:⟦`; no release key |

**How the oracle produces the rating**

1. Post ciphertext (or a committed hash of filtered plaintext) is sent to OAO via `requestCallback(modelId, input, …)`.
2. The **prompt template** asks the model for structured output, e.g. JSON: `{ "rating": "PG-13", "risk": 0.42, "reasonCodes": ["profanity_mild"] }`.
3. opML nodes submit the result; after the challenge window, your contract's `aiOracleCallback` parses the rating into a `uint8 contentRating` on the post struct.
4. Contract logic enforces policy **deterministically**—no trust in the frontend:

```
if (rating == X || risk > DENY_THRESHOLD) → PostState.Scrambled
else if (rating == R)                   → UnderReview (pretense until Safe signs)
else if (rating <= PG_13)               → eligible for ClientFacing (auto or fast-path)
```

**Client-side substring + rating badge**

Extend pretense prefixes so clients can substring-match **both** moderation state and rating shell before unscramble, e.g. `⟦PRETENSE:PG-13:⟦`. After approval, the card shows the real body plus an on-chain rating badge (`G` … `X`) read from contract state—not from client guesswork.

**Why this fits the existing engine**

* ORA opML already supports **LLM classification** callbacks on L2 (Base / Arbitrum)—a rating is a classification task, not a new infrastructure layer.
* Ratings are **verifiable on-chain** (challengeable during opML window), unlike a centralized mod API.
* Safe multisig remains the **override**: curators can bump rating up/down or veto `R`/`X` edge cases without breaking the oracle audit trail.
* Pairs with §3.1 pretense: `R`/`X` posts never unscramble without explicit release; `G`/`PG` can use faster auto-approval paths to reduce moderator load.

**Caveats (theoretical)**

* Model drift: rating rubric must be versioned (`ratingSchemaVersion` on-chain) and prompts updated in lockstep.
* Cultural bias: MPAA-style buckets are US-centric; document locale-specific rubrics later.
* Cost: each inference is paid from treasury (§4); high volume needs Fibonacci fees + rating fees to stay solvent.
* **X** should mean *platform reject*, not adult content only—keep definitions in policy docs to avoid ambiguity.

---

## 3. The Four-Paradigm Post Lifecycle

Instead of a simple true/false visibility toggle, user content transitions through four distinct lifecycle tracks enforced natively inside the smart contract's state machine:

1. **Paradigm 0: Under Review (`PostState.UnderReview`)** – The user has successfully paid the dynamic API3 fee and the full payload is anchored to IPFS (see §3.1), but the public feed shows only the **predictive pretense**—not the real body—until an admin approves.
2. **Paradigm 1: Client Facing (`PostState.ClientFacing`)** – The standard approved state. The admin signs a transaction that releases the unscramble signal; the frontend SDK replaces the pretense in-place with the decrypted/plaintext content already on IPFS.
3. **Paradigm 2: Verified Premium (`PostState.VerifiedClientFacing`)** – Premium approved content. The frontend SDK reads this state and elevates the item to a specialized "Featured Stories" or pinned layout UI block (content fully unscrambled).
4. **Paradigm 3: Scrambled/Denied (`PostState.Scrambled`)** – If content fails the AI check or breaks community rules, the admin triggers a deny/scramble call. The contract withholds (or revokes) the unscramble key and locks the post in a **denied pretense** state. The feed slot remains, but the body never reveals—clients continue to render the pretense shell with a denied substring marker.

### 3.1 Predictive Pretense & In-Place Feed Display

Unapproved and denied posts should **occupy real positions in the chronological feed** without exposing raw content prematurely. Instead of hiding pending items or using a separate moderation queue UI, every post renders a **predictive pretense**: a deterministic, client-computable stand-in string that looks scrambled to humans but carries a **stable substring signature** the SDK can match locally.

#### Goals

* Show posts **in place** as pending, approved, or denied without a centralized preview server.
* Let any client classify feed cards by **substring rules alone** (no need to fetch or decrypt IPFS until approval).
* Reveal the true body **only after** on-chain state moves to `ClientFacing` or `VerifiedClientFacing`.

#### Data model (per post)

| Field | Where | Purpose |
|-------|--------|---------|
| `postId` | On-chain | Primary key |
| `state` | On-chain | `UnderReview` \| `ClientFacing` \| `VerifiedClientFacing` \| `Scrambled` |
| `pretenseDigest` | On-chain | Hash of the pretense string (integrity check) |
| `contentCid` | On-chain | IPFS pointer to encrypted/filtered full payload |
| `contentRating` | On-chain | `G` (0) \| `PG` (1) \| `PG-13` (2) \| `R` (3) \| `X` (4) — from Tier 3 oracle (see §2) |
| `releaseKey` | On-chain (gated) | Emitted or stored only after approval; client uses it to unscramble |

#### Pretense generation (client-side, deterministic)

Before anchoring to IPFS, the SDK derives a **pretense string** from public metadata:

```
pretense = PREFIX + scramble(postId ‖ authorWallet ‖ submittedAt ‖ contentHash)
```

* **`PREFIX`** – A fixed, recognizable token so substring matchers work everywhere, e.g. `⟦PRETENSE:⟦` for pending and `⟦DENIED:⟦` after rejection. Clients run simple `includes()` / regex checks—no server round-trip.
* **`scramble(...)`** – A deterministic function (e.g. seeded PRNG or stream cipher using `keccak256` as seed) that produces readable noise of **fixed approximate length** matching the original post length class (short / medium / long), so layout does not jump on approval.
* **`contentHash`** – Commitment to the filtered body *before* encryption, so the pretense is bound to the eventual plaintext without revealing it.

The pretense is cheap to recompute by any client that knows `postId`, author, timestamp, and hash—hence **predictive**: watchers can anticipate what an unapproved slot will look like before the admin acts.

#### Submission flow

```
Author writes post
      │
      ▼
Tier 2 regex filters (browser)
      │
      ▼
SDK builds pretense string + encrypts body for IPFS
      │
      ▼
Anchor ciphertext → IPFS; store CID + pretenseDigest on-chain
      │
      ▼
Feed renders pretense in the post's chronological slot (UnderReview)
```

#### Approval / denial flow

```
Admin reviews (off-chain tools, AI tier, human curation)
      │
      ├─ APPROVE ──► contract sets state → ClientFacing
      │              + writes releaseKey (or approves key reveal event)
      │                    │
      │                    ▼
      │              SDK fetches IPFS ciphertext, applies releaseKey,
      │              replaces pretense substring in-place → unscrambled body
      │
      └─ DENY ─────► contract sets state → Scrambled
                     + releaseKey never published (or burned)
                           │
                           ▼
                     SDK swaps PREFIX to ⟦DENIED:⟦ (or keeps pretense
                     with denied styling); substring match drives UI
```

#### Client-side substring matching (display states)

The feed renderer does **not** need the decryption key to paint correct chrome:

| Substring detected | On-chain `state` | UI treatment |
|--------------------|------------------|--------------|
| `⟦PRETENSE:⟦` | `UnderReview` | Muted card, "Awaiting approval", body shows noise |
| `⟦PRETENSE:⟦` | `ClientFacing` / `Verified` | Transitional—client should fetch key and unscramble immediately |
| `⟦DENIED:⟦` | `Scrambled` | Struck/muted slot, "Not approved", body never revealed |
| (none — plain text) | `ClientFacing` / `Verified` | Normal approved post |

Because pretense and denied markers are **predictable from metadata**, clients can even pre-render placeholder skeletons for pending slots in the correct feed order before IPFS payloads arrive.

#### Security & abuse notes (theoretical)

* Pretense is **not secrecy**—it is a UX and moderation layer. Real confidentiality comes from **encrypted IPFS blobs** plus gated `releaseKey`.
* Substring markers must be chosen so they cannot appear accidentally in legitimate approved prose (use rare Unicode delimiters or reserved tokens stripped by Tier 2 filters on submit).
* Authors see their own pending pretense in the feed immediately after submit, reinforcing that the slot is reserved but not yet public in meaning.
* Denied posts remain visible as **negative space** in the timeline—useful transparency (something was submitted and rejected) without amplifying harmful content.

#### Open design questions (theoretical)

* Should `releaseKey` be on-chain calldata, an event, or a separate encrypted envelope per moderator?
* Length-class pretense vs exact character-count match on unscramble (layout stability).
* Whether denied slots decay/archive after N days or persist permanently as audit trail.

---

## 4. Operational Advantages of the Framework

1. **Zero Server Footprint:** The platform operates entirely serverless. The smart contract acts as the logic engine, IPFS handles storage, and the decentralized oracle network tracks token conversion valuations. There are no databases to maintain, hack, or migrate.
2. **Self-Funding Infrastructure:** Because the contract includes a 1% platform fee aggregation split, the ecosystem generates recurring maintenance revenue natively. The remaining 99% fee allocation goes straight into your curation treasury to cover the costs of running the AI oracle inference checks, allowing the platform to scale indefinitely without external funding.
3. **Low Network Gas Overhead:** By deploying on a Layer 2 network (such as Base or Arbitrum), gas costs drop to fractions of a single cent for submissions, approvals, or overrides, making the user experience centered almost completely on the oracle-pegged base fee and its Fibonacci multiplier—not gas.
4. **Complete Transparency and Safety:** By injecting these explicit boundaries directly into the initial user wallet handshake via a Sign-In With Ethereum (SIWE) request, you form an open, honest contract with your community. Users knowingly trade a small fee for guaranteed visibility in an organic, manipulation-free environment, while accepting your team's on-chain curation and moderation boundaries.
5. **In-Place Moderation UX:** Predictive pretense (§3.1) lets the feed show pending and denied slots chronologically—clients classify them via substring rules without a backend—then unscramble approved posts in the same position when the contract releases the key.

---

## 5. Solo-Owner Reality Check (Independent Blog)

This section reframes the blueprint for **one maintainer running their own blog**—not a public forum. Many “decentralized / trustless” guarantees assume operators, treasuries, and multisig committees you do not have. Below: **race conditions** (async timing bugs) and **responsibility gaps** (who is accountable when logic is ambiguous).

### 5.1 Scope shift for a personal blog

| Platform assumption | Solo blog reality |
|---------------------|-------------------|
| Many paying strangers post | You publish; **guests only comment** (low volume) |
| Safe M-of-N moderation team | **You** are the only admin (1-of-1 Safe ≈ hot wallet with extra steps) |
| Treasury funds oracle inference at scale | **You** top up treasury; each comment may cost oracle fees |
| $5 Fibonacci post fee deters spam | Prohibitive for friends; overkill if you approve manually anyway |
| “Manipulation-free environment” | **You** are the final censor—by design |

**Honest positioning:** For an indie blog, the contract is mainly **policy enforcement + audit trail + tamper-evident moderation**, not full autonomy.

### 5.2 Race conditions (timing & ordering)

These occur because submission, IPFS, oracle callbacks, opML challenge windows, and your approve/deny txs are **all asynchronous**.

| Race | What goes wrong | Solo-owner symptom |
|------|-----------------|-------------------|
| **Oracle callback vs your approve** | You `approve()` while `aiOracleCallback` is still in flight | Post goes `ClientFacing`, then oracle returns `X`—need rule: oracle can downgrade after approval? |
| **Oracle callback vs your deny** | You `scramble()` then late callback returns `G` | Denied post resurrected unless callback checks terminal state |
| **opML challenge window** | Auto-approve on first result; challenger overturns rating later | Feed showed PG-13 body; on-chain rating later becomes `X`—clients must re-scramble |
| **Fibonacci `postCount` increment** | Two comments same wallet in same block | Both read `postCount=2`, both pay fib(3)—**undercharge** unless `postCount++` in same tx as submit |
| **`postId` assignment** | Concurrent submits | Duplicate IDs or gaps unless `postId = ++nonce` atomically in contract |
| **Release key then scramble** | You approve (key on-chain), then change mind | Key may already be in indexers/cache—**scramble cannot unsee** IPFS if key leaked |
| **IPFS pin lag** | On-chain `contentCid` set before pin replicates | Approvers/clients fetch 404; you get blamed for “broken blog” |
| **Treasury vs `requestCallback`** | Submit tx succeeds; oracle request tx fails or queues | Post stuck `UnderReview` forever with no rating |
| **Client ahead of chain** | UI unscrambles on tx submit, not finality | Reader sees content that reverts or gets denied on challenge |
| **Pretense prefix in approved text** | Tier 2 fails to strip delimiter | False positive UI state (looks denied while approved) |

**Minimum state machine fix (recommended on paper):**

```
enum Phase { Submitted, OraclePending, OracleFinal, HumanPending, Terminal }

Terminal ∈ { ClientFacing, Verified, Scrambled }
```

* Only one **writer** per post: `OraclePending → OracleFinal` (after challenge window) **then** auto-policy **or** `HumanPending` for `R`.
* `approve()` / `scramble()` from you must check `phase` and refuse if oracle not `OracleFinal` (unless you explicitly set `ownerOverride` flag).
* All callbacks **idempotent**: `if (post.oracleRequestId != callbackId) revert`.

### 5.3 Responsibility & logic gaps (you as owner)

| Gap | Who is responsible in practice | Gap |
|-----|-------------------------------|-----|
| **Tier 2 `_frontendVerifiedFilter`** | You maintain the SDK | Contract cannot prove browser ran regex; **anyone** can call contract with `true` unless you add signed attestations only your SDK key can mint |
| **IP/referer Fibonacci key** | You chose to trust client hash | Trivially spoofed from CLI; **you** own false sense of sybil resistance on a blog |
| **Encryption / `releaseKey`** | You design crypto | Weak client-side key derivation = pretense security theater; **you** must audit or hire audit |
| **Content rating (G–X)** | You wrote prompt + thresholds | Model errors → you deny legitimate friends or approve harassment; **you** carry reputational liability |
| **`R` manual approval** | You on vacation | Queue freezes; **you** are SLA for moderation |
| **Denied pretense slots** | You chose UX | Timeline fills with `⟦DENIED:⟦` ghosts—**you** explain policy to confused commenters |
| **Fee refunds** | Not specified | Commenter pays $5, you deny → **you** owe refund or accept rage |
| **Your own posts** | Not specified | Same fee + oracle for author? **You** bypass or look hypocritical |
| **Contract upgrades** | You (likely `owner`) | Bug in prod → **you** migrate data / redeploy; no DAO |
| **Key loss** | You | Safe/EOA lost → **you** cannot approve or scramble |
| **Oracle bill** | You | Treasury empty → **you** pay out of pocket or comments stop |
| **Legal / ToS** | You | On-chain “not a plan” posts can still be illegal; **you** are publisher |

**Central contradiction to name explicitly:** The doc promises openness and bot-resistance, but **every approved byte passes your key or your signature**. For a personal blog that is fine—call it **curated guestbook**, not neutral protocol.

### 5.4 Simplifications worth considering (solo blog)

You do not need the full forum stack. A trimmed design reduces races and your ops burden:

1. **Two roles only:** `owner` (you) and `commenter`. Owner posts skip fee + oracle; **comments only** hit Tier 2 + optional local (off-chain) AI assist, with **your** on-chain approve.
2. **Drop Fibonacci + IP marriage** for v1—or set base fee to **$0** and rely on manual approve (it’s your blog).
3. **Skip on-chain oracle for v1**; run rating locally in your admin UI, write `contentRating` + `state` in one `ownerReview(postId, …)` tx—add opML later if volume justifies cost.
4. **No public `releaseKey` on-chain**; encrypt comment to **your** pubkey; you decrypt off-chain for review, then re-publish approved plaintext in a separate `ownerPublish` tx (simpler than pretense crypto for low volume).
5. **If keeping pretense:** treat encryption as UX only; assume determined readers could scrape IPFS ciphertext.
6. **`ownerPause()` + `oracleFinalityBlocks`** in contract so you can stop auto paths during incidents.
7. **1-of-1 Safe** → honest **single EOA admin** with hardware wallet; skip multisig theater unless you add a backup signer (friend/cold device).

### 5.5 Checklist before you deploy (solo)

- [ ] Every async path has **terminal state** rules (no downgrade/upgrade without explicit `ownerOverride`).
- [ ] Oracle callbacks are **idempotent** and ignore stale `requestId`.
- [ ] `postCount` / `postId` updated **atomically** in submit tx.
- [ ] Auto-approve waits for **opML finality**, not first callback.
- [ ] Documented **refund policy** (or zero fee) for denied comments.
- [ ] **Owner bypass** path documented for your own articles.
- [ ] Treasury **low-balance alert** (you monitoring, not a DAO).
- [ ] SDK bypass of Tier 2 acknowledged; mitigated or accepted.
- [ ] Legal: you are **editor/publisher**, not neutral infrastructure.

---
