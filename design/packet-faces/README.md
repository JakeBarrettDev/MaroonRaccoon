# Packet expression art

`face-template.png` is Packet's own face, flattened into the exact frame the 3D overlay
uses (1024 x 509). Anything painted on it lands on the same spot on his head.

## Making an expression
1. Start from `face-template.png` (same size, don't crop or resize).
2. Change only the eyes, eyelids/brows and mouth. Leave the fur, eye-mask outer edges and
   the outer border untouched so the overlay blends invisibly into the model.
3. Export a PNG at 1024 x 509. Transparency outside the face is fine.

### With ChatGPT (or another AI image editor)
ChatGPT can't return 1024 x 509, and it tends to nudge things when editing, so use
`face-template-gpt.png` instead: the same face on a flat green 1536 x 1024 canvas.

1. Start a fresh edit from `face-template-gpt.png` for each expression (don't chain edits).
2. Save the result here, e.g. `design/packet-faces/wink-gpt.png`.
3. Import it, which re-aligns, colour-matches, removes the green and feathers the edge:
   `node design/packet-pipeline/gpt_faces.mjs import design/packet-faces/wink-gpt.png wink`

Prompt (swap in the expression line):

> Edit this image. It is a flattened cartoon raccoon face on a flat green background.
> Keep the canvas 1536x1024, keep the green background, and keep the face exactly the
> same size and position. Do not redraw the fur, the red and white markings, the dark
> eye-mask shapes, the nose or the outer outline. Only change the eyes and the mouth, in
> the same flat cartoon style, line weight and colours. Expression: <EXPRESSION>.

## Wanted
- `wink.png`: one eye closed in a happy arc, smiling mouth (start of the wave)
- `happy.png`: open-mouth smile, tongue showing (end of the wave)
- `worried.png`: eyes glancing to one side, small frown (distracted glance)
- `blink.png` (optional): both eyes closed, neutral mouth, for idle blinking

Drop finished files in `frontend/public/models/faces/`. If the model is re-exported,
regenerate the template with `design/packet-pipeline/face_template.mjs`.
