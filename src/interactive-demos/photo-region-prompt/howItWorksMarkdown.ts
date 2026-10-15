/** Static markdown shown in the “How it Works” tab. */
export const howItWorksMarkdown = `# The original problem

A sentence can name the change. It cannot point. If you only write “put this person here,” an image editor often guesses the place. It may use a painted window, a picture frame, or whatever looks like a natural spot — and ignore the location you meant.

This tool is for **precision substitution**. You draw the exact area on the photo. That drawing is the place. Words say what to put there. Together they are harder to ignore than words alone.

---

# How to use AI photo substitution

This tool does not edit the photo for you. It prepares two things you can paste into an image editor such as **ChatGPT**:

1. A copy of your photo with a see-through mask on the area you drew.
2. A short markdown prompt (the first option, labeled **“Mask (default)”**).

Nothing is uploaded from this page. The photo and the prompt stay in your browser until you copy them.

---

## What you will see

After **“Continue”**, the first tab is **“The original problem”**. That is the story of the miss. Next are **“The success”** and **“How it Works”**. The last tab is **“Try it”** — the working screen where you draw a region.

The opening screen may play a short video above that sentence. When the video ends, it fades away and leaves the sentence and **“Continue”** — the same gate as the other demos.

---

## Step 1 — Add a photo

On **“Try it”**, use the dashed box labeled **“Click or drop a photo”**. Choose a JPEG, PNG, or WebP from your device.

The picture then fills a drawing surface. A line at the top still says you are drawing on that file.

A dark overlay sits on the photo and says to click the image to make a polygon of the region you want to replace. Tap **“Continue”** to dismiss it. After that, the photo is the same drawing surface as before.

---

## Step 2 — Draw the boundary

Tap the photo to drop points around the area you want changed.

- **“Add point”** — each tap adds a corner.
- **“Delete last”** — removes the most recent corner.
- **“Complete”** — closes the shape (you need at least three points). You can also tap the first point to close.
- **“Clear”** — starts the shape over.

Draw the real region you want, even if that means crossing a painted frame or window. The mask is the boundary — not the frame you can see in the picture.

---

## Step 3 — Say what should happen

Under the photo, choose **“Add in region”** or **“Remove from region”**. After you close the shape, the box labeled **“What should happen in this area”** lights up — write the change in plain words — for example who to add, which way they should face, or what to take out.

Then tap **“Build prompt”**.

---

## Step 4 — Copy the mask photo and the first markdown

On the results screen you will see comparison frames, then a panel for the mask, then **“Region prompt for AI”**.

1. Tap **“Copy photo with mask”** (or **“Download photo with mask”** if you would rather save a file). That image is your photo with a see-through overlay on the drawn area. The original still shows through so an editor can fill the gaps.
2. Leave the prompt toggle on **“Mask (default)”** — that is the first markdown option. Do not switch to **“Coordinates”** unless you specifically want a pixel list.
3. Tap **“Copy markdown”**.

At the bottom of this results screen, just above **“Try another photo”**, a box labeled **“What to do next”** says to take the mask image and the prompt and submit both to ChatGPT or your favorite AI image editor.

---

## Step 5 — Paste into an AI editor

Open the image editor you want to use (ChatGPT’s image edit is the usual example).

1. Attach or paste the **masked photo** as the first image.
2. Paste the **Mask** markdown into the text box.
3. Send.

The prompt tells the model to expand the new subject to the confines of that overlay, not to stop at a painted frame, unless the mask only barely nicks the frame.

This page does not call an image model. **“The original problem”** shows Franklin still inside the painted frame, and the coordinates-only prompt that put him there. **“The success”** shows the same painting after a see-through mask plus a mask-only prompt — and a **“Try this image”** button that loads the original into **“Try it”**.

---

## Privacy

- The photo is read on your machine.
- Drawing and markdown stay in the browser.
- Nothing is sent anywhere until you paste it into another app.

---

## For people who want the file names

- Demo shell: \`src/interactive-demos/photo-region-prompt/\`
- Prompt builder: \`buildPromptMarkdown.ts\`
- Mask export: \`exportMaskedPhoto.ts\`
`;
