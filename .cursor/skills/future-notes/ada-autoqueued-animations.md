# Quiz draft: ADA-compliant back-to-back animations

Hybrid **question → teach → question → teach**. Use this as a future Quiz Power item (or a training doc). The learner is a developer whose boss assigned two auto-queued animations that must be ADA compliant.

**Correct destination:** You can ship both animations, including a sequence that lasts more than five seconds, but you need an **accessible dismiss** (WCAG 2.2.2 “hide”). A 1-second pause between clips is not a legal off-switch.

This is not legal advice. ADA web work in the US generally maps to **WCAG 2.1 Level AA** (DOJ Title II rule, 2024). The motion-duration criterion below is **Level A**, so it is in AA.

---

## The assignment (read this first)

Your boss wants a celebration overlay:

1. **Animation A** — a toast that explains the unlock (title, blurb, points). It holds, then flies toward a score icon.
2. **Animation B** — after A ends, a **second, similar toast** awards the trading card (every unlock gets a card). Same overlay, auto-queued by the page. No extra click.

Constraints from the boss:

- Both must play. Do not drop the card toast.
- It has to be **ADA compliant**.
- People should have time to **read** the copy (so a tiny hold that vanishes in ~3 seconds is a bad UX, even if someone claims it is “safer”).

You may add a hold-duration **progress bar** on each toast. You may add a pause between A and B. You may add UI chrome. You may **not** pretend WCAG has a rule it does not have.

---

## Round 1 — Which clock even exists?

### Q1. WCAG’s duration rule for moving / blinking / scrolling information uses:

- A. 3 seconds  
- B. 5 seconds  
- C. 8 seconds  
- D. There is no duration; all motion is forbidden  

**Answer: B.** **2.2.2 Pause, Stop, Hide** uses **five seconds** for moving, blinking, or scrolling information.

### Q2. Where does the “3 seconds” rumor usually come from? (pick the best)

- A. ADA Title III has a unique 3-second animation statute  
- B. WCAG **2.3.1 Three Flashes** (seizure)  
- C. An unpublished / early draft idea for “significant” interaction animation, plus people mixing it up with **3 flashes per second**  
- D. `prefers-reduced-motion` requires all motion under 3 seconds  

**Answer: C** (B is the other common mix-up). **2.3.1** is **no more than three flashes in any one-second period**, not “animations must last 3 seconds.” Early **Animation from Interactions** discussion floated a 3-second “significant animation” idea. Published **2.3.3 Animation from Interactions** (Level **AAA**) has **no time cap** — only that non-essential motion animation triggered by interaction can be disabled.

### Q3. For typical ADA / DOJ WCAG 2.1 **AA**, which is in scope?

- A. 2.2.2 Pause, Stop, Hide (A)  
- B. 2.3.3 Animation from Interactions (AAA)  
- C. Both equally required  
- D. Neither; ADA ignores WCAG  

**Answer: A.** AA includes all A + AA. **2.3.3 is AAA**, so it is not required by a 2.1 AA bar. Still follow **`prefers-reduced-motion`** as good practice (and this portfolio’s ADA Guy theme). Dismiss does not replace reduced-motion.

### Teach 1

There is **no WCAG/ADA “3-second animation rule”** for this assignment.

**2.2.2** (paraphrase):

**Moving / blinking / scrolling:** if it (1) **starts automatically**, (2) **lasts more than five seconds**, and (3) is **presented in parallel with other content**, there must be a mechanism to **pause, stop, or hide** it, unless the motion is **essential**.

**Auto-updating** (tickers, live scores): starts automatically **and** parallel with other content → pause/stop/hide **or** control update frequency, unless essential. **No “under 5 seconds so it’s fine” exception** for auto-updating.

**Not the same thing:**

| Rule | What it actually is |
|---|---|
| 2.2.2 five seconds | How long **continuous moving/blinking/scrolling info** may run without pause/stop/hide |
| 2.3.1 three flashes | **Flash rate** (seizure), not toast length |
| 2.3.3 (AAA) | Turn off non-essential **interaction** motion; no 5s/3s clock |
| Stay under 5s with no dismiss | A **valid strategy**, not a requirement to vanish at 4.9s |

A one-shot CSS `scaleX` fill on a toast is **moving** information, not a news ticker. Do **not** live-announce every tick (`aria-valuenow` spam). Hide a decorative duration bar from AT; the toast copy can be `aria-live`.

---

## Round 2 — Does splitting or pausing reset the clock?

### Q4. You implement A as three named tweens (fade photo, fill bar, fade button), each 2 seconds. Total 6 seconds of continuous motion. Does 2.2.2 see:

- A. Three legal 2-second animations (under 5s each)  
- B. One 6-second moving experience  
- C. Only the progress bar counts  
- D. Named GSAP/CSS animations are exempt  

**Answer: B.** WCAG counts the **user’s experience of moving information**, not how many files or `animationend` handlers you authored. `2s + 2s + 2s` with no real rest is **six seconds**.

### Q5. Animation A finishes. You wait **one second** of stillness, then auto-queue Animation B (same corner, same chrome, no new click). WCAG defines that gap as:

- A. A legal reset: two separate 5-second clocks  
- B. A reset only if the gap is ≥ 5 seconds  
- C. **Nothing.** The spec does **not** define a pause length that splits auto-queued motion  
- D. Illegal; sequels are always one animation  

**Answer: C.** There is **no legal way to define the pause** (1s, 3s, 5s) as an official clock reset. Understanding docs and techniques do not add one. DOJ points at WCAG as written.

You can *argue* two episodes if motion **actually stopped** and each clip is clearly over. A 1-second beat in the same overlay is a **weak** split. Nothing **guarantees** that argument.

### Q6. Even if a reviewer accepts A and B as separate, when does **each** toast still need pause/stop/hide?

- A. Never, because they are “two animations”  
- B. When **that** toast’s own motion lasts more than 5 seconds (and the other 2.2.2 conditions hold)  
- C. Only Animation B, because sequels are stricter  
- D. Only if there is a progress bar  

**Answer: B.** A long hold on A (read time) plus a fly can exceed 5s **with or without** a gap before B. The pause does not shrink A.

### Q7. The page auto-queues B after A. Does B “start automatically”?

- A. No; finishing A was a user gesture  
- B. Yes; the **page** starts B without a new user action  
- C. Only if B uses `animation: infinite`  
- D. Only on first visit  

**Answer: B.** User clicked something **earlier** (unlocked a quest). The sequel toast is still script-started.

### Teach 2

**Do not hang compliance on a gap.** A pause is a UX beat (breathing room between messages), not a statute.

Other 2.2.2 facts worth teaching here:

- **Parallel with other content:** a toast over the live portfolio **is** parallel. A full-page preloader that is the **only** content can be out of scope even if it runs >5s (Understanding 2.2.2 example).
- **Essential:** removing it would fundamentally change the activity (e.g. a real download progress that *is* the status). A decorative celebration and a fake “hold clock” bar are **not** essential.
- **Infinite 2-second loop:** still >5s of moving information. Iteration length ≠ duration.
- **Starts on hover/click of this toast:** often fails “starts automatically.” Auto-queue after unlock **meets** “starts automatically.”

---

## Round 3 — Stay under 5s vs dismiss

### Q8. 2.2.2 requires that auto-started parallel motion:

- A. Must always end by 5 seconds  
- B. May last longer than 5 seconds **if** the user can pause, stop, **or hide** it (unless essential)  
- C. Requires captions  
- D. Is only about video  

**Answer: B.** Five seconds is the threshold for needing a **mechanism**, not a hard cap.

### Q9. Boss wants people to **read** title + blurb, then see the card toast. Best AA-aligned approach:

- A. Keep each hold at 2.8s so the whole chain stays under 5s (unreadable, and the chain still adds up)  
- B. Lengthen the hold(s) as needed and provide **accessible dismiss** that **stops/hides** the current motion  
- C. Insert a 1-second pause and skip dismiss  
- D. Ship only the card toast  

**Answer: B.**

### Q10. “Hide” in 2.2.2 is satisfied by:

- A. A close/dismiss control that **actually** stops the overlay, bar, and fly  
- B. An `aria-hidden` on a toast that keeps animating  
- C. A comment in the code: `// ada: user can look away`  
- D. Prize Animations default-on in settings, with no in-toast control  

**Answer: A.** A global pref that is off by default can reduce exposure, but **2.2.2 wants a mechanism while the moving info is on screen** — typically pause/stop/hide **on that content** (Understanding also allows one control that stops **all** moving items on the page). A settings flag the user already passed on a splash screen is not a substitute for hide **now**.

### Q11. For dismiss to count as accessible (not just “a click target exists”):

- A. Mouse-only X is enough because WCAG is about contrast  
- B. It must be **perceivable**, **keyboard-operable**, **named**, and it must **stop the motion**  
- C. It must be a modal `role="dialog"`  
- D. It must appear only after 5 seconds  

**Answer: B.** 2.2.2 does not require a dialog. It does require a **usable** mechanism:

- Visible (not `opacity: 0` until hover-only)
- In **keyboard tab order**; **Enter/Space** activate it  
- Accessible **name** (“Dismiss unlock”, not a blank icon)  
- Contrast / focus ring per 1.4.x / 2.4.7  
- **`pointer-events`** actually hit the button (a `pointer-events-none` overlay that never re-enables the chrome fails)  
- Escape is **nice**, not a replacement for a named control (and must not steal Escape from an open dialog without a plan)

If the toast vanishes in 2.8s, many keyboard users never reach dismiss in time — another reason a **longer hold + dismiss** is the coherent design, not “short so we skip the button.”

### Q12. A hold-duration progress bar should:

- A. Update `role="progressbar"` `aria-valuenow` every frame  
- B. Be treated as **moving** decoration; keep it **out of the live region valuetext loop**; reduced-motion should not smear-fill  
- C. Use auto-updating 2.2.2 because all bars are tickers  
- D. Replace the dismiss button  

**Answer: B.** One-shot fill ≠ stock ticker. Dismiss still covers the toast if the whole hold is >5s.

### Teach 3

**Mechanism options** (any one can satisfy “pause, stop, or hide” if it works):

| Control | What it does |
|---|---|
| **Hide / dismiss** | Removes the overlay; motion gone. Fits a toast. |
| **Stop** | Motion ends; content may remain static. |
| **Pause** | Can resume; extra work; rarely needed for a celebration. |

**Reduced motion (teach even though 2.3.3 is AAA):**

- Skip the **fly**
- Do not **animate** the bar fill (static track is enough)
- Still **show both messages** (quest, then card) so the award is announced  
- `aria-live="polite"` on the toast text; swapping A → B should announce the new copy, not the bar

**Flashing:** keep the celebration free of strobing. Unrelated to hold length.

---

## Round 4 — Put the assignment together

### Q13. True or false: “We cannot legally do two auto-queued animations and be ADA compliant.”

**Answer: False.** You can. Compliance is about **2.2.2 conditions + a mechanism (and the rest of AA)**, not a ban on sequels.

### Q14. True or false: “If we add a 1-second pause, we do not need dismiss.”

**Answer: False.** No defined pause reset. Each long toast still needs hide if **that** motion >5s. The chained show is still a weak “two clocks” story.

### Q15. The assignment-complete design is:

- A. Two auto-queued toasts, readable holds, optional 1s beat, hold-only duration bar, **accessible dismiss on each**, reduced-motion skips fly/fill  
- B. One 4.9-second clip, no card toast  
- C. Card toast only if they click the first toast  
- D. Infinite loop until they open Options  

**Answer: A.** Boss gets both animations. Readers get time. AA gets **hide**. Reduced-motion users get the information without the vestibular fly.

---

## Conclusion (the line the quiz should land on)

**You can do the two back-to-back, auto-queued animations.**

**You cannot rely on:** a 3-second myth, splitting tweens, or an undefined pause to reset 2.2.2.

**You can last longer than 5 seconds** if the user can **hide** the moving overlay with an **accessible dismiss** that actually stops it.

That is the correct thing to do for this boss assignment.

---

## Answer key (quick)

| Q | Answer |
|---|---|
| 1 | B — 5 seconds |
| 2 | C — rumor / flashes mix-up / draft 2.3.3 |
| 3 | A — 2.2.2 is in AA; 2.3.3 is AAA |
| 4 | B — one 6s experience |
| 5 | C — no legal pause length |
| 6 | B — each clip timed on its own if split |
| 7 | B — sequel still auto-starts |
| 8 | B — longer OK with pause/stop/hide |
| 9 | B — longer hold + dismiss |
| 10 | A — real hide |
| 11 | B — perceivable, keyboard, named, stops motion |
| 12 | B — decorative moving bar, no AT spam |
| 13 | False — sequels are allowed |
| 14 | False — pause ≠ dismiss |
| 15 | A — both toasts + accessible dismiss |

---

## Source conversation (this repo)

Worked example that produced this quiz: main-site **prize unlock toast** (`MilestoneUnlockCelebration`) — originally **2.8s hold + 1.2s fly**, no dismiss, under 5s so 2.2.2 would not require a control. Goal discussed: lengthen hold, hold progress bar, second identical toast for the **card** (`cardPrizeForMilestone`; every milestone has a card), ADA-safe.

Not implemented from that thread; this file is the teaching seed.

Primary spec: [Understanding SC 2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html)
