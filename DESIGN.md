---
name: Divyangana Bhave Portfolio
description: A UX designer's portfolio built as her own live design canvas.
colors:
  bg: "#EBEBE7"
  bg-2: "#F5F4F0"
  panel: "#FBFBF9"
  card: "#FFFFFF"
  ink: "#111113"
  ink-2: "#44444A"
  ink-3: "#5C5C63"
  line: "rgba(17, 17, 19, .09)"
  line-2: "rgba(17, 17, 19, .17)"
  sel: "#3B30F0"
  sel-soft: "rgba(59, 48, 240, .10)"
  coral: "#D33B1E"
  mint: "#086444"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(76px, 13.4vw, 216px)"
    fontWeight: 600
    lineHeight: 0.92
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(42px, 5vw, 80px)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.042em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(26px, 2.4vw, 36px)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  statement:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(19px, 1.75vw, 27px)"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.022em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
  mono:
    fontFamily: "'Geist Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    fontFeature: "tnum"
  case-study:
    fontFamily: "Manrope, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(38px, 4.4vw, 66px)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.045em"
  accent-serif:
    fontFamily: "'Instrument Serif', 'Times New Roman', serif"
    fontSize: "clamp(22px, 2vw, 31px)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.01em"
rounded:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "14px"
  xl: "18px"
  xxl: "20px"
  pill: "999px"
spacing:
  dot: "22px"
  gutter: "24px"
  card: "24px"
  section: "148px"
  section-mobile: "112px"
  container: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
    rounded: "{rounded.md}"
    padding: "0 20px 0 22px"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "48px"
  button-ghost-hover:
    backgroundColor: "{colors.card}"
  button-connect:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
    rounded: "10px"
    padding: "0 14px 0 16px"
    height: "40px"
  button-connect-hover:
    backgroundColor: "{colors.sel}"
  chip-space:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 26px 0 22px"
    height: "60px"
  chip-tool:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink-2}"
    rounded: "11px"
    padding: "0 16px 0 8px"
    height: "42px"
  tab:
    backgroundColor: "rgba(255, 255, 255, .45)"
    textColor: "{colors.ink-2}"
    rounded: "10px"
    padding: "0 13px"
    height: "36px"
  tab-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  layer-row-selected:
    backgroundColor: "{colors.sel}"
    textColor: "{colors.card}"
    rounded: "{rounded.xs}"
    padding: "6px 8px 6px 22px"
  dimension-badge:
    backgroundColor: "{colors.sel}"
    textColor: "{colors.card}"
    rounded: "5px"
    padding: "2px 7px"
    typography: "{typography.mono}"
---

# Design System: Divyangana Bhave Portfolio

## Overview

**Creative North Star: "The Working File"**

The whole site is a design file that is open and being edited. The ground is a light canvas grey carrying a 22px dot grid. Every section is a named frame on that canvas, and the interface vocabulary of a design tool (rulers, selection boxes with eight handles, dimension badges, layer rows, property panels, comment pins, multiplayer cursors, auto-layout gap badges) is the decoration. There is no ornament from outside the tool. Type is near-black Geist, set heavy and tightly tracked, so the work and the headlines carry the page.

Colour is rationed. Electric indigo means "selected / being edited" and is the only accent that belongs to the world. Coral belongs to the other people in the file: multiplayer cursors, comment pins, the hand-drawn underline. Green means presence ("online", "you", copied). Each case study brings its own accent and tint, and those stay inside its own frame and case file. Motion is exponential ease-out: things glide to a stop the way a selection box snaps to an object.

**Key Characteristics:**
- Dot-grid canvas ground (22px pitch) in the hero, every section frame, the sticky work stage and the case-file sheet.
- One world accent, indigo, used for selection, handles, rulers, focus, and a few deliberate fills.
- Geist 600 with tight negative tracking for every heading. Instrument Serif italic only for single accent words and subtitles.
- Panels and cards are white or near-white with hairline borders and soft, long, low-opacity shadows.
- Speech-bubble geometry (one 4px corner, the rest rounded) marks anything a person said.

## Colors

A warm-neutral canvas with near-black ink, one electric indigo, and two "people" colours (coral for collaborators, green for presence).

### Primary
- **Selection Indigo** (sel): the world's one accent. Used for selection outlines and the eight handles, ruler bands, dimension and text-type badges, the pen cursor label, the focus ring, `::selection`, selected layer rows, active toolbar tool, the current-version dot, the hover state of the nav Connect button, and three amended fills: the about-portrait ground, the open principle card, and selected key words in headings.
- **Selection Wash** (sel-soft): the 10% indigo wash for hover rows, auto-layout badges, chip index squares and version tags.

### Secondary
- **Collaborator Coral** (coral): other people in the file. Multiplayer cursor and its name label, comment pins, the hand-drawn underline scribble, the hero sparkles, the middle bar of the brand mark.

### Tertiary
- **Presence Green** (mint): the "online" dot and its pulse, the "you" cursor label, reaction pins, the "Hi" tag, and the copied state of the email button.

### Neutral
- **Canvas Grey** (bg): page ground and the hero canvas; also the translucent nav (86% opacity).
- **Paper** (bg-2): alternate section ground for full-bleed bands (spaces, principles, the default work stage).
- **Panel White** (panel): property panels, version-history and education panels, the case-file title bar.
- **Card White** (card): cards, comment bodies, toolbar, the nav glider, hover fill on ghost buttons.
- **Ink** (ink): all headings and body text, primary buttons, selected tabs, tooltips and toasts.
- **Ink Secondary** (ink-2): paragraphs, nav links at rest, secondary card text.
- **Ink Tertiary** (ink-3): metadata, frame labels, timestamps, captions.
- **Hairline** (line) and **Hairline Strong** (line-2): borders and dividers; line-2 for ghost-button strokes, tab strokes and timeline rails.

### Per-project accents
Each case file defines `--accent`, `--accent2` and `--tint` in data.js (for example Aggregator Portal navy #0B2D5B on #E6EEF8, Hestia violet #7B55F0 on #EFEAFF). They colour that project's subtitle, tags, numbered markers, fact figures, comment pins and the Open button's hover, and the tint fills its work stage and case hero. They are not world tokens.

### Named Rules
**The Selection Means Editing Rule.** Indigo marks what is selected or being edited. Outside the three amended fills (portrait ground, open principle, key word), do not use it as decoration or as a general brand fill.

**The Frame Containment Rule.** A project's accent and tint appear only inside that project's own frame, tab, chip or case file, never in shared chrome.

**The People Colours Rule.** Coral is for collaborators and their marks; green is for presence and success. Neither is used for structural UI.

## Typography

**Display Font:** Geist (with ui-sans-serif, system-ui)
**Body Font:** Geist
**Label/Mono Font:** Geist Mono (tabular numerals) for coordinates, dimensions, counts, file metadata
**Accent Font:** Instrument Serif, italic, 400
**Case-file Font:** Manrope (400 to 700), used only inside the case-file sheet, matching the designer's own Figma Make case-study layout

**Character:** A tool-native grotesque used heavy and tight, so headlines read like named layers, with a soft italic serif as a second hand that only ever writes a word or a short line.

### Hierarchy
- **Display** (600, clamp(76px, 13.4vw, 216px), 0.92, -0.045em): the drawn name in the hero. Related display sizes: project titles (clamp(52px, 6.6vw, 112px), 0.9) and the outlined closing name (clamp(64px, 17.4vw, 320px), 0.82, -0.05em, stroked outline with an indigo spotlight fill).
- **Headline** (600, clamp(42px, 5vw, 80px), 0.98, -0.042em): section headings. Sibling steps: journey/principles clamp(38px, 4.2vw, 64px) at line-height 1; about clamp(34px, 3.7vw, 56px) at 1.08; contact clamp(44px, 5.6vw, 92px).
- **Title** (600, clamp(26px, 2.4vw, 36px), 1.05, -0.035em): case-file section heads. Card titles sit at 16 to 21px, 600, -0.015 to -0.03em.
- **Statement** (500, clamp(19px, 1.75vw, 27px), 1.3, -0.022em): the hero statement, max 21em, centred.
- **Body** (400, 16px, 1.55): running text. Lead paragraphs 17px in ink-2 capped at 44 to 48ch; case-file notes at 62ch.
- **Label** (400 to 500, 11 to 13.5px): frame labels, panel keys, metadata, captions, in ink-3.
- **Mono** (Geist Mono 400, 9 to 12px, tabular): ruler numbers, W × H readouts, dimension badges, counts.
- **Accent Serif** (Instrument Serif italic 400, clamp(22px, 2vw, 31px), 1.1): project subtitles in the project accent, the principle sign-offs (24px), the portrait lettering, and one key word in a headline.

- **Case file** (Manrope 500, headings clamp(38px, 4.4vw, 66px) at 1.02 and -0.045em; titles clamp(64px, 8.2vw, 128px); closing line clamp(46px, 6.4vw, 104px); labels 11 to 12px uppercase at 0.14em): the case-study sheet, themed per project with its own ground, dark, soft and accent colours.

### Named Rules
**The Case File Rule.** Manrope lives only inside the case-file sheet; the canvas site stays in Geist.

**The Second Hand Rule.** Instrument Serif italic writes a word, a subtitle or a sign-off, never a whole headline.

**The Tight Ink Rule.** Every heading is Geist 600 with negative tracking (between -0.015em and -0.05em, tighter as it gets larger) and a line-height at or below 1.1.

## Layout

The content column is `min(1240px, 100% - 48px)`, narrowing to `100% - 40px` under 680px. Sections are full-bleed bands with generous vertical air: 148px top padding on about, work, journey, principles and contact (112px under 680px), with alternating Canvas Grey and Paper grounds separated by hairlines. Each section frame carries the dot grid and a frame label pinned at 44px from its top-left that turns indigo when the frame scrolls into view.

The hero is a full-viewport canvas (min 800px) with a 22px ruler on the top and left, a centred column (name, statement, primary action), absolutely placed draggable objects, a Layers panel left, a Design panel right and a floating toolbar bottom centre. Split layouts use 5/7 or 7/5 fractional columns. The work section is a sticky stage, one viewport tall per project, with tabs and a 2px progress bar. Principles are an auto-layout row of cards where the open card grows to 2.7×.

Responsive: at 1180px the Layers panel drops; at 980px nav links collapse to a burger, the canvas loses its vertical ruler, panels, toolbar and layout grid, its objects reflow into a two-column grid, every split becomes one column, and the work stage unpins into stacked tinted frames. Reduced motion stops the marquee and collapses all transitions.

## Elevation & Depth

Mostly flat surfaces on a flat canvas, lifted by soft, long, low-opacity ambient shadows whose spread is negative so they pool beneath an object rather than haloing it. Floating tool UI (panels, toolbar, canvas objects) takes the deeper shadow; content cards in sections usually rely on a hairline border alone. Pins, cursors and badges carry small tinted shadows in their own colour.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 1px 2px rgba(17,17,19,.06), 0 8px 24px -12px rgba(17,17,19,.22)`): version-history and education panels, reactions, image pins, case goal cards, screen strips.
- **Floating** (`box-shadow: 0 2px 4px rgba(17,17,19,.05), 0 24px 56px -24px rgba(17,17,19,.34)`): hero panels, toolbar, canvas objects, mobile menu, persona and test images.
- **Lift** (`box-shadow: 0 14px 28px -14px rgba(17,17,19,.6)`): the primary button on hover, paired with a 2px rise.
- **Coloured contact shadow** (e.g. `0 6px 14px -6px rgba(211,59,30,.55)`): under cursor labels and comment pins, in the element's own hue.

### Named Rules
**The Pooled Shadow Rule.** Shadows always use a negative spread and ink-tinted low alpha. No hard offset shadows and no zero-blur shadows.

## Shapes

Gently rounded rectangles throughout, stepping up with size: 6px for layer rows and small tags, 8px for toolbar and nav-link targets, 10 to 12px for buttons and tabs, 14px for panels and cards, 16 to 18px for case-file blocks and history panels, 20px for the auto-layout row and the case-file sheet's top corners. Pills (999px) are reserved for the large space chips and project tags. Selection marks are the opposite: square 1.5px indigo outlines with 8px white handles at 1px radius. Speech shapes (comments, quotes, reactions, image pins) round three corners and leave the top-left at 4px; comment pins are teardrops (`50% 50% 50% 4px`). Hand-drawn strokes (scribble underline, arrow, heart, glyph outlines) are round-capped SVG paths that draw on with a dash offset.

## Components

### Buttons
Solid, dark and confident, with a small physical lift.
- **Shape:** gently rounded (12px), 48px tall, 15px Geist 500 with a trailing 16px stroke icon.
- **Primary:** Ink fill, white text. Hover rises 2px with the Lift shadow; active settles with scale .98. On project frames the Open button turns to the project accent on hover; the nav Connect button (40px, 10px radius) turns indigo and rotates its arrow 45°.
- **Ghost:** transparent with a Hairline Strong stroke; hover fills Card White, darkens the stroke to ink and rises 2px.
- **Focus:** 2px indigo outline, 3px offset.

### Chips
- **Space chip:** 60px pill, Card White, hairline, 18 to 22px Geist 500 with a 10px dot in its own colour. Hover floods the chip with that colour, turns the text white and tips it -1.5°. Runs in paused-on-hover marquees.
- **Tool chip:** 42px, 11px radius, Canvas Grey with an indigo-wash mono index square; hover turns the stroke and square indigo.

### Cards / Containers
- **Corner Style:** 14px (cards, panels), 16 to 18px (case blocks, history panels).
- **Background:** Card White or Panel White on the canvas.
- **Shadow Strategy:** Floating for tool UI on the canvas, Resting for panels in sections, border-only for grids of content cards.
- **Border:** 1px Hairline; project cards use the accent at 30 to 45% mixed into transparent.
- **Internal Padding:** 20 to 24px; panel sections 10 to 12px.

### Navigation
Fixed 64px bar on translucent Canvas Grey with a 14px backdrop blur; a hairline appears once scrolled. Brand (three-bar indigo/coral/ink mark plus name and file path) left, a segmented pill of links centre with a white glider that slides to the active section, Connect button right. Under 980px a dark burger opens a full-width sheet of 30px links.

### Selection Box (signature)
A 1.5px indigo outline with eight 8px white handles and an indigo mono dimension badge centred beneath. It glides (0.55s, exponential ease-out) to whichever canvas object is clicked or dragged, while ruler bands and the Design panel update to match. The same outline and handles mark selected words in headings, with a small indigo type badge (e.g. "Text · 112").

### Property Panels and Layer Rows
Panel White, 14px radius, hairline, Floating shadow, 12px text. Tab strip on top, sections divided by hairlines, key/value fields on #EFEEEA at 6px radius. Layer rows are 6px-radius rows with 13px stroke icons; hover shows the indigo wash, selected is solid indigo with white text.

### Comment Pins and Cursors
Teardrop pins in coral (collaborators), green (reactions) or the project accent (persona quotes), paired with a speech-shape bubble. Multiplayer cursors are a filled arrow with a rounded name label in coral (others), indigo (the pen) or green (you), drifting slowly on a 9 to 10s loop.

### Version History
A panel listing roles as versions: a vertical hairline rail with 13px ring dots, the current version filled indigo with a soft indigo halo, details expanding on hover or focus, timestamps in ink-3 and an indigo-wash "Current" tag.

## Do's and Don'ts

### Do:
- **Do** put the 22px dot grid on every section frame and label each frame in the canvas's own voice (name plus mono W × H), turning the label indigo when the frame is in view.
- **Do** keep indigo for selection, handles, rulers, focus and the three amended fills; use the 10% indigo wash for hover.
- **Do** set headings in Geist 600 with negative tracking, and let Instrument Serif italic write only single words, subtitles and sign-offs.
- **Do** use exponential ease-out (`cubic-bezier(.16, 1, .3, 1)`) for glides and reveals, and the in-out curve (`cubic-bezier(.65, 0, .35, 1)`) only for ambient loops.
- **Do** give anything a person said the speech shape: 4px top-left corner, 10 to 12px elsewhere.
- **Do** keep a project's accent and tint inside its own frame and case file.

### Don't:
- **Don't** use indigo as a general decorative or brand fill outside the amended fills.
- **Don't** set a whole headline in Instrument Serif.
- **Don't** use hard offset or zero-blur shadows; shadows pool with negative spread.
- **Don't** add uppercase tracked kicker or eyebrow lines above headings; frame labels, layer names and badges already name things.
- **Don't** let a project's accent leak into shared chrome (nav, hero, footer, toolbar).
- **Don't** reuse the source PDF's fonts or slide styling.
