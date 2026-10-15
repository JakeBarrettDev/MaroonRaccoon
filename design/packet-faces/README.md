# Packet expression art

`face-template.png` is Packet's own face, flattened into the exact frame the 3D overlay
uses (1024 x 509). Anything painted on it lands on the same spot on his head.

## Making an expression
1. Start from `face-template.png` (same size, don't crop or resize).
2. Change only the eyes, eyelids/brows and mouth. Leave the fur, eye-mask outer edges and
   the outer border untouched so the overlay blends invisibly into the model.
3. Export a PNG at 1024 x 509. Transparency outside the face is fine.

With an AI image editor: upload the template and ask it to "edit only the eyes and mouth
to <expression>; keep every other pixel, the framing and the canvas size identical".

## Wanted
- `wink.png`: one eye closed in a happy arc, smiling mouth (start of the wave)
- `happy.png`: open-mouth smile, tongue showing (end of the wave)
- `worried.png`: eyes glancing to one side, small frown (distracted glance)
- `blink.png` (optional): both eyes closed, neutral mouth, for idle blinking

Drop finished files in `frontend/public/models/faces/`. If the model is re-exported,
regenerate the template with `design/packet-pipeline/face_template.mjs`.
