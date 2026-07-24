# Avatar Layer Extraction Report

Source: 6 AI-generated character asset sheets (1448x1086 each, client-downscaled). 
Pipeline: manual panel boxes -> frame shrink -> light-background flood removal (edge-connected) -> component filtering (dash/anchor/frame/checker-cell) -> trimmed RGBA export -> 1024x1536 canvas placement (foot baseline y=1440, figure height 1240).

## Inventory

| Character | body | outfit | hairBack | face | eyes | hairFront | accessories |
|---|---|---|---|---|---|---|---|
| engineer_m | 149x415 | 173x389 | 71x75 | 52x63 | 71x16 | 89x68 | 5 |
| engineer_f | 148x535 | 117x498 | 120x437 | 62x80 | 76x25 | 110x151 | 5 |
| programmer_m | 142x394 | 172x379 | 92x96 | 82x124 | 101x34 | 152x123 | 5 |
| programmer_f | 166x441 | 187x428 | 105x110 | 67x83 | 92x29 | 130x132 | 5 |
| researcher_m | 141x488 | 150x421 | 97x100 | 65x95 | 77x26 | 99x83 | 4 |
| researcher_f | 170x433 | 183x399 | 162x251 | 97x131 | 92x36 | 126x187 | 3 |

## Deliverable tiers

- **parts/** — trimmed transparent cutouts at native sheet scale (status: raw). Clean; the primary harvest.
- **canvas/** — contract-compliant 1024x1536 layers for body, outfit, and the full-character composite (preview cutout). Mutually foot-anchored; body+outfit assume same in-sheet scale, verified visually per character.
- **canvas_experimental/** — face/eyes/hairFront/hairBack placed by head-width heuristics plus recon_stack.png. Rough registration only; NOT production-ready. Figma refinement or per-part regeneration required.
- **preview_cutout.png** — full assembled character, background removed. Immediately usable as single-figure previewSrc for the three profession presets (researcher / programmer / engineer x m/f).

## Risk flags

- Light-on-light bites: engineer_f silver ponytail and researcher_f silver hair required per-panel threshold overrides; edges may show minor erosion where pale strands met the near-white checker. researcher coats: enclosed whites preserved, but brightest silhouette edges may nibble.
- Wispy tips near panel bottoms can be dropped by the bottom-junk filter (engineer_f tail tip).
- Soft 1px alpha feather applied; slight halo possible on dark parts over light UI backgrounds.
- researcher_f accessories merged to 3 groups (proximity clustering); split in Figma if needed.

## Structural caveats (important)

1. These sheets are *pictures of* layer breakdowns. Cross-panel scale/pose consistency is NOT guaranteed by the generator; the head-part panels are drawn at panel-local scales. Hence heads are experimental-only.
2. Native part resolution is ~65-530 px — far below the 1024x1536 contract target. Canvas files are LANCZOS-upscaled and therefore soft. For production quality, regenerate each part at full canvas via the STYLE LOCK + 'Change ONLY' pipeline using these sheets as reference, or run parts through vector/creative upscaling.
3. Durable path unchanged: golden-sample per character -> per-part regeneration -> matting -> canvas -> overlay QA. This batch serves as transition/placeholder assets and as the reference set for that pipeline.

## Suggested next steps

1. Wire preview_cutout.png into the profession-preset cards (fixes the multi-person reference image issue).
2. Optionally use canvas/composite.png as interim whole-figure avatars while the modular system matures.
3. Log any asset defects found in-app to reports/bad-assets.md per the art contract; fix assets, not code.