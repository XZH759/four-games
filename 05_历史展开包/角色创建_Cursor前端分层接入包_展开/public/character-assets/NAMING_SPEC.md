# Programmatic Naming Spec

## Canvas and anchor
- Canvas: **1024 x 1536**
- Shared anchor: **foot-center = (512, 1216)**
- Layer order: **body -> outfit -> hairBack -> face -> eyes -> hairFront -> accessory**

## File naming rule
`{gender_code}_{layer_code}_{variant:03d}.png`

Examples:
- `F_BODY_001.png`
- `F_HAIRFRONT_003.png`
- `M_OUTFIT_002.png`
- `M_ACCESSORY_005.png`

## Gender codes
- `F` = female
- `M` = male

## Layer codes
- `BODY`
- `OUTFIT`
- `HAIRBACK`
- `FACE`
- `EYES`
- `HAIRFRONT`
- `ACCESSORY`

## Runtime composition rule
Render by ascending z-index:
1. body
2. outfit
3. hairBack
4. face
5. eyes
6. hairFront
7. accessory

## Notes
- Every asset is a full transparent canvas PNG.
- Empty regions remain transparent.
- Some layers are approximate prototype splits derived from a reference board rather than original PSD source layers.
