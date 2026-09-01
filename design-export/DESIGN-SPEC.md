# Don't Fire Me — Design Export Kit

Everything the app currently looks like, exported for redrawing. Draw over the PNGs in any tool (Procreate, Photoshop, Figma — drop them in as locked base layers), and hand back whatever you produce: full repaints, marked-up screenshots, or just new colors/fonts. Everything on screen is rebuilt from this kit's values, so any change you mark can be applied precisely.

## What's in this folder

| Path | What it is |
|---|---|
| `png/01-home.png` … `png/10-final.png` | Every screen state, captured at iPhone size (375pt wide) at **3× resolution (1125px wide)** — same pixel density as a real iPhone screenshot |
| `png/11-components.png` | The component sheet: every UI atom isolated and labeled (1620px wide) |
| `screens/*.html` | The live replicas the PNGs were captured from — open any in a browser to inspect/measure |
| `corpmail.css` | The complete stylesheet of the current design (every color, size, and border in one file) |
| `assets-original/` | The only true image files in the app: app icon, splash, Android icons, favicon |
| `capture.mjs` | Re-captures all PNGs (`node capture.mjs`) — rerun after editing the HTML replicas |

## Screen inventory

| File | Screen | Notable elements |
|---|---|---|
| 01-home | Title screen | Hero logo (DON'T stamp over "FIRE ME"), sign-in window, footer |
| 02-home-join | Title screen, join open | Room-code input (huge letter-spaced mono) |
| 03-lobby-host | Lobby, host view | Room code, attendee badges, rounds control, red CTA |
| 04-lobby-guest | Lobby, guest view | Waiting state |
| 05-writing-compose | Writing round | Timer chip, incoming-email window, sticky-note assignment, compose window |
| 06-writing-replyall | Writing round, thread variant | Quoted thread messages (left-rule style) |
| 07-writing-outbox | After sending | SENT stamp, progress line, OVERDUE timer (red; blinks in app) |
| 08-rating | Peer review | Anonymous email cards, star row (empty/filled/own-sealed states) |
| 09-results | Round results | Winner (gold) / loser (red PIP) rows, standings table |
| 10-final | Final verdict | PROMOTED gold stamp, YOU'RE FIRED red stamp, full standings |
| 11-components | Component sheet | All 15 element families isolated with captions |

## Color palette (all of them)

| Hex | Token | Used for |
|---|---|---|
| `#DFE3EA` | `--bg` | App background; overlaid with 1px ruled lines every 28px at `rgba(30,58,110,.025)` |
| `#FFFFFF` | `--surface` | Window/card bodies, inputs |
| `#F4F5F8` | `--surface2` | Ghost buttons, badges, result rows |
| `#1A2433` | `--ink` | Primary text, toast background |
| `#5B6575` | `--muted` | Labels, captions, secondary text |
| `#C7CDD8` | `--line` | Borders and dividers (empty stars are `#C9CFDA`) |
| `#1E3A6E` | `--navy` | Window title bars, primary buttons |
| `#152A52` | `--navy-d` | Window borders + hard drop shadows |
| `#C03B2D` | `--stamp` | Rubber stamps, red buttons (pressed edge `#8F2A20`), urgency states |
| `#FFE066` | `--sticky` | Sticky note (border `#E3C337`, label text `#8A6D00`), keyboard-focus outline |
| `#2E7D5B` | `--approve` | SENT stamp, THE BOSS tag |
| `#B98A1C` | `--gold` | Filled stars, winner row (bg `#FBF4DF`), PROMOTED stamp |
| — | | Loser row bg `#F9E9E6` |

## Typography (3 faces, all IBM Plex)

| Face | Weight/size | Where |
|---|---|---|
| IBM Plex Mono | 700 · 11px · tracking .14em · UPPERCASE | Window bars, labels, buttons, eyebrows, progress lines |
| IBM Plex Mono | 700 · 44px · tracking .35em | Room code |
| IBM Plex Mono | 700 · 14–22px · tracking .18em | Rubber stamp text, timer |
| IBM Plex Sans | 400/600/700 · 13–16px | UI text, names (700), form values |
| IBM Plex Sans | 700 · ~64px · tracking −.03em | Hero "FIRE ME" |
| IBM Plex Serif | 400 · 15px / 1.65 line height | Email bodies — the "letter" voice; italic for quoted subjects |

Fonts are free (Google Fonts / IBM). If your redesign changes faces, anything with a working web font + Expo Google Fonts package can be swapped in.

## Signature construction details (what makes it look like this)

- **Window chrome**: 1px `--navy-d` border, **hard** 3px drop shadow (no blur), navy title bar with fake ●●● window dots, ZERO border radius anywhere in the app.
- **Buttons**: same hard-shadow trick — 3px solid shadow below; pressing moves the button down 2px and shrinks the shadow to 1px (fake physical press).
- **Rubber stamps**: 3px `double` border, mono uppercase, tracking .18em, rotated −5°, with a subtle radial mask for an inked look. Big variant: 4px border, 22px text.
- **Sticky note**: `--sticky` yellow, rotated +0.4°, offset hard shadow (2px/3px).
- **Background**: ruled-paper effect via repeating 1px lines.
- **Hero logo**: "FIRE ME" in huge tight sans; "DON'T" as a red stamp rotated −9° overlapping it, on a translucent white chip.

## Raster assets (assets-original/)

| File | Size | Notes for redraw |
|---|---|---|
| `icon.png` | 1024×1024 | iOS app icon. **No transparency allowed**; Apple rounds the corners for you |
| `splash-icon.png` | 1024×1024 | Launch screen art, transparent bg, shown centered on `#DFE3EA` |
| `android-icon-foreground/background/monochrome.png` | 1024×1024 | Android adaptive icon layers (from template; not yet themed) |
| `favicon.png` | 48×48 | Web favicon |

## How to hand your redesign back

Any of these work — mix freely:
1. **Draw over the PNGs** and return the painted images — the design gets rebuilt in code to match (colors, shapes, spacing lifted from your art).
2. **Annotate** (arrows + notes on the PNGs) for targeted changes.
3. **Edit values**: change hexes/fonts in `corpmail.css`, open the `screens/*.html` files in a browser to preview instantly, run `node capture.mjs` to re-export.
4. **Replace raster assets** directly (respect the size/transparency rules above).

The same design is implemented twice — web (`../index.html`) and iOS (`../mobile/src/theme.ts` + `ui.tsx` + `screens.tsx`) — so hand changes back once and both get updated together.
