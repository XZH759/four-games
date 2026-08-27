# Portal companion asset slots

Replace these files with final transparent PNGs when ready.
Layout uses fixed aspect-ratio containers (`object-fit: cover`) — swapping assets does not require CSS changes.

| Enum | Slot path |
|------|-----------|
| `researcher` | `researcher.svg` → prefer `researcher.png` later |
| `explorer` | `explorer.svg` → prefer `explorer.png` later |
| `creator` | `creator.svg` → prefer `creator.png` later |

After dropping PNGs, update `asset` paths in `js/portal-auth.js` (`PORTAL_COMPANIONS`).
