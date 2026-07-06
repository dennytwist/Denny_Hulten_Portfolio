# Denny Hultén — Visual Design System (v18 "Swiss / Riso")

Reference for building anything on-brand for Denny: the portfolio site, CVs, portfolio cards, posters, social graphics. This is the theme that went live as `index.html` on 2026-07-05 (source concept: `v18-swiss.html`). Read this before creating any visual, then match it.

**One-line character:** Swiss/editorial poster. Strict modular grid, oversized neo-grotesque type, warm paper, one red + one electric blue, hairline rules, `N°` numbering, and a risograph overprint motif used sparingly on a single key word.

---

## 1. Color tokens

Use these exact values (CSS custom properties on `:root`):

```
--paper:    #F1ECE0   /* warm off-white background, everything sits on this */
--ink:      #15150F   /* near-black, text + borders + dark fills */
--red:      #E5241D   /* poster red, primary accent */
--blue:     #2323DC   /* electric ultramarine, secondary accent + duotone */
--rule:     rgba(21,21,15,0.20)   /* hairline dividers */
--rule-soft:rgba(21,21,15,0.12)   /* fainter hairlines */
--grey:     #726d5f   /* muted mono labels, secondary text */
```

Rules of thumb:
- Background is always `--paper`. Never pure white.
- `--ink` for all body text and structural borders.
- `--red` is the dominant accent (labels, numbers, key words, CTAs). Use it often but small.
- `--blue` is the secondary accent. Its main job is **duotone photography**. Also appears in the overprint. Do not use blue as a text accent on its own much; it mostly lives in images and the overprint.
- Selection: `background:var(--red); color:var(--paper)`.

> Note: the *previous* homepage ("overprint" design, archived as `index-overprint.html`) used different tokens (cream `#F5F1E6`, red `#FB2A1E`, cyan `#00A5E4`). That is NOT this system. If unsure which era a file uses, this v18 palette is current.

---

## 2. Typography

Two families, from Google Fonts:

```
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Archivo+Black&family=Sometype+Mono:wght@400;500&display=swap');
```

- **Archivo Black** (`font-family:'Archivo Black'`, weight 900) — display / giant headlines, section titles, big numbers, plates. Uppercase, `letter-spacing:-0.03em` to `-0.035em`, `line-height:0.84–0.86`.
- **Archivo** (variable 400–900) — body text, role lines, bold sub-labels, CTAs. Bold openers use 700–800.
- **Sometype Mono** (400/500) — all small "system" text: eyebrows, section labels, coordinates, tags, meta, footer, `N°` markers. Uppercase, `letter-spacing:0.10em–0.16em`, `font-size:0.62rem–0.74rem`, color `--grey` or `--red`.

Hierarchy pattern: a mono red eyebrow/label sits above a huge Archivo Black headline. Body follows in Archivo.

---

## 3. Signature motifs (what makes it "the theme")

### 3a. Riso overprint (the anaglyph) — use on ONE key word only
Two independent colored copies of the same text, both `mix-blend-mode:multiply` over the light paper, the red copy slightly offset. Where they overlap the ink darkens naturally (do NOT fake it with text-shadow or black offsets).

```html
<span class="op"><span class="c">word.</span><span class="r">word.</span></span>
```
```css
.op{position:relative;display:inline-block;isolation:isolate;color:transparent}
.op .c{color:var(--blue);mix-blend-mode:multiply}
.op .r{position:absolute;top:0;left:0;color:var(--red);mix-blend-mode:multiply;transform:translate(0.045em,0.05em)}
```
- The parent container (or an ancestor) needs `isolation:isolate` so the multiply blends against paper, not the page behind it.
- Offset ~`0.03em–0.05em`. Bigger = more separation and a bigger dark overlap zone.
- **Discipline:** exactly one word per statement gets this. On the site: hero `PROBLEM`, about `REBUILD.`, contact period `.`, plus the "work." / "Twice." / "Let's talk." headings. On print: CV surname `HULTÉN`, card `BRIEF.`. It is a highlight, not a texture. Reads best at large display size; avoid on small body text.
- It renders correctly in Chrome print-to-PDF (blend modes are honored).

### 3b. Blue duotone photography
All photos become a blue riso panel: grayscale image with `mix-blend-mode:lighten` over a `--blue` background.
```css
.photo{background:var(--blue);overflow:hidden}
.photo img{filter:grayscale(1) contrast(1.08) brightness(1.06);mix-blend-mode:lighten}
```
Shadows go deep blue, highlights stay light. Pair with a red vertical tab label (see 3c). Used for the hero portrait, work-preview thumbnails, case-modal headers, and the portfolio card portrait.

### 3c. Red vertical tab
A small red label rotated vertical, pinned top-left of an image: `writing-mode:vertical-rl; background:var(--red); color:var(--paper);` mono, `letter-spacing:0.16em`, uppercase. E.g. `DENNY HULTÉN` on the portrait, `CASE 01` on a modal image.

### 3d. `N°` numbering system
Everything is a numbered index. Sections carry `N°01`, `N°02`... The hero shows a centered `N°01` "cover plate" plus a giant `01` bottom-right (cover convention, deliberately distinct from section headers). Big numbers are Archivo Black; the `N°` prefix is mono. Case numbers (`01`–`08`) are red.

### 3e. Mono system labels
Small mono uppercase labels tag everything: `// the project`, `PORTFOLIO — 2026`, coordinates, tags. Red (`--red`) for active labels, grey (`--grey`) for passive meta.

### 3f. Hairline modular grid
Structure is drawn with rules: `2px solid var(--ink)` for major separators (section heads, frame, bands), `1px solid var(--rule)` for row/column dividers. The hero is wrapped in a `2px` ink **frame** with internal vertical/horizontal rules.

### 3g. Film grain + red cursor (web only)
Faint SVG turbulence overlay at `opacity:0.05; mix-blend-mode:multiply`. Custom red square cursor dot (`mix-blend-mode:multiply`) that grows over interactive elements. Web only; omit in print.

---

## 4. Layout patterns

- **Page padding:** `--pad: clamp(1.25rem,4vw,3.5rem)` on web; ~`12–14mm` in print.
- **Framed hero/poster:** bordered rectangle, a top meta row (corner coordinates: left = context, center = `N°`, right = location/availability), a body grid (giant type left, duotone portrait right split by a `2px` rule), and a foot row (intro left, big plate number right).
- **Section header:** title in Archivo Black on the left, a right-aligned mono meta block whose top line is the `N°`, with a `2px` ink rule beneath. All sections follow this identically. (Consistency matters — a number in a different position reads as a mistake.)
- **Giant statement:** stacked uppercase Archivo Black lines, `line-height:0.84`, one word overprinted.
- **Editorial index (work):** numbered rows (red number + bold title + muted 2-line result), hairline dividers, hover = full dark invert (`background:var(--ink); color:var(--paper)`, red number stays). Do NOT change row width/padding on hover (it reflows text). Two-column: list left, a **sticky duotone preview panel** right that updates on hover (never a cursor-following image over text).
- **Bands:** stat band and client marquee are full-width, bordered top/bottom `2px`, hairline internal cells; one stat number in red.
- **Buttons/CTA:** solid `--red` background, `--paper` text, Archivo 700–800 uppercase, no border (the old black outline was removed). Secondary: `2px solid var(--ink)` outline that inverts on hover.
- **Tags/chips:** mono uppercase, `1px solid var(--ink)`, small padding.

---

## 5. Motion (web)
- Elements rise + fade in on load/scroll (`translateY` + opacity, IntersectionObserver adds `.vis`).
- Hovers are quick (`.18s–.2s`), transform/background/color only — never anything that reflows text.

---

## 6. Print adaptation (CV / cards / posters)
Carries over: paper bg, Archivo/Archivo Black + Sometype Mono, red + blue, hairline grid, `N°` sections, mono labels, the red vertical tab, blue duotone, ONE overprint word. Drop: film grain, cursor, scroll animations. Generate via Chrome headless:
```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="out.pdf" "file:///abs/path/file.html"
```
Use `@page{size:A4;margin:0}` and a `.page{width:210mm;...}` container. Blend modes (overprint, duotone) render fine in print. Reference builds: `cv-project/applications/aplusa/cv-aplusa.html` and `portfolio-card-aplusa.html`.

---

## 7. Do / Don't
- DO keep the overprint to a single word per statement. DON'T splatter it or use it on body text.
- DO put one red accent per zone and let it breathe. DON'T rainbow it.
- DO use pure structure (hairlines, `N°`, mono labels) instead of decoration.
- DO keep photos blue duotone. DON'T drop in full-color photos.
- DON'T use em/en dashes in body copy (Denny's rule): use colons, commas, or restructure. (The mono labels use `—` as a typographic separator, which is a design element, not prose.)
- DON'T reintroduce the old cream/cyan overprint palette or the older Barlow Condensed + lime CV system.

---

## 8. Canonical files
- Live site: `portfolio-concepts/index.html` (concept twin: `v18-swiss.html`).
- Archived previous homepage: `index-overprint.html`. Older lime: `index-lime.html`.
- Print reference: `cv-project/applications/aplusa/cv-aplusa.html`, `portfolio-card-aplusa.html`.
