---
name: Alayn Suppliers
description: The supplier's own purchase-order pad, made digital.
colors:
  ink-red: "#C41E2A"
  ink-red-deep: "#A81822"
  ink-navy: "#1B2A4A"
  carbon-pink: "#F4D3D6"
  carbon-yellow: "#F3E4A8"
  desk: "#E9ECF1"
  pad-paper: "#FBFAF6"
  white: "#FFFFFF"
  ink-soft: "#46556C"
  muted: "#56657C"
  pad-rule: "rgba(27, 42, 74, 0.10)"
  pad-rule-strong: "rgba(27, 42, 74, 0.22)"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.35rem, 6.4vw, 4.25rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2rem, 4.4vw, 3.1rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  headline-step:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(1.6rem, 3vw, 2.1rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.375
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.625
    fontFeature: "\"cv02\", \"cv03\", \"cv04\", \"cv11\""
  body-lead:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.625
  label-printed:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    letterSpacing: "0.12em"
  mono-line:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    fontFeature: "\"tnum\""
  stamp-heading:
    fontFamily: "Big Shoulders, Arial Narrow, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    letterSpacing: "0.16em"
  stamp-button:
    fontFamily: "Big Shoulders, Arial Narrow, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    letterSpacing: "0.1em"
  hand:
    fontFamily: "Kalam, Comic Sans MS, cursive"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1
rounded:
  check: "3px"
  stamp: "4px"
  button: "5px"
  binding: "6px"
spacing:
  gutter-mobile: "16px"
  gutter: "24px"
  sheet-x-mobile: "16px"
  sheet-x: "24px"
  section-y-mobile: "96px"
  section-y: "128px"
  container: "72rem"
components:
  button-stamp-primary:
    backgroundColor: "{colors.ink-red}"
    textColor: "{colors.white}"
    typography: "{typography.stamp-button}"
    rounded: "{rounded.button}"
    height: "52px"
    padding: "0 28px"
  button-stamp-primary-hover:
    backgroundColor: "{colors.ink-red-deep}"
    textColor: "{colors.white}"
  button-stamp-outline:
    backgroundColor: "{colors.pad-paper}"
    textColor: "{colors.ink-red}"
    typography: "{typography.stamp-button}"
    rounded: "{rounded.button}"
    height: "56px"
    padding: "0 28px"
  button-stamp-outline-hover:
    backgroundColor: "{colors.ink-red}"
    textColor: "{colors.white}"
  link-underline:
    textColor: "{colors.ink-navy}"
    height: "44px"
  pad-binding:
    backgroundColor: "{colors.ink-navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.binding}"
    height: "36px"
    padding: "0 24px"
  pad-sheet:
    backgroundColor: "{colors.pad-paper}"
    textColor: "{colors.ink-navy}"
    typography: "{typography.mono-line}"
    padding: "12px 24px 40px"
  stamp:
    textColor: "{colors.ink-red}"
    rounded: "{rounded.stamp}"
    padding: "5px 12px 4px"
  index-tab:
    backgroundColor: "{colors.pad-paper}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.binding}"
    height: "44px"
    padding: "0 16px 0 20px"
  faq-row:
    textColor: "{colors.ink-navy}"
    height: "64px"
---

# Design System: Alayn Suppliers

Scope: the public landing page at `/`, the "order pad" world. The logged-in app UI (`/orders`, `/catalog`, `/profile`) is out of scope and follows its own styles.

## Overview

**Creative North Star: "The Order Pad"**

The page is the supplier's own purchase-order book, seen from above on a grey desk. Each section shows a piece of stationery that a vendor already handles: an off-white top sheet bound in navy, pink and yellow carbon copies showing underneath, a perforated tear line, a torn bottom edge, pre-printed crimson order numbers, line items in a typewriter mono, rubber stamps that land in crimson or navy ink, and notes in a shopkeeper's hand. Features are shown as the slip of paper they replace (dispatch slip, out-of-stock carbon, price tag, delivery slip, a binder of divider tabs), never as icon tiles.

Density is calm: one paper object per idea, wide desk around it, with editorial serif headlines carrying the argument and the paper carrying the proof. Colour stays inside the Alayn brand pair (logo navy and crimson). The pinks and yellows are carbon-copy paper, not decoration. Motion is physical: lines type in from left to right, stamps come down large and settle hard, the pad takes the knock, and a sheet tears off along its perforation.

All order data on paper is sample data, and the pad's binding says so ("Example").

**Key Characteristics:**
- Paper objects on a grey desk, alternating with white and navy bands.
- Navy and crimson ink only; pink and yellow appear only as carbon paper.
- Five type voices, each with one job: serif headline, sans body, mono line item, condensed stamp lettering, handwriting.
- Paper is slightly rotated (-3° to +2°); nothing on the desk sits perfectly square.
- One soft, navy-tinted shadow under each paper stack; no other elevation.

## Colors

Two inks (navy, crimson) on three papers (off-white, pink carbon, yellow carbon), set on a cool grey desk.

### Primary
- **Ink Crimson** (`ink-red`): the brand crimson. Pre-printed order numbers (Nº 1042), red stamps, handwritten corrections and notes, the struck-through old price, the primary call to action, the second line of the hero headline, focus rings. Hover deepens it to **Deep Crimson** (`ink-red-deep`).

### Secondary
- **Ink Navy** (`ink-navy`): the logo navy. All headings and line-item text, the pad's binding strip, navy stamps, the "To do" tab, the Who It's For band, the footer, the phone frame in the search demo, and the scrollbar thumb.

### Tertiary
- **Carbon Pink** (`carbon-pink`): the first carbon copy under the pad (offset 6px/8px, rotated 1.1°), the out-of-stock slip, and every third divider tab.
- **Carbon Yellow** (`carbon-yellow`): the second carbon copy (offset 12px/15px, rotated 2.2°), the shop price tag, and every third divider tab.

### Neutral
- **Desk Grey** (`desk`): the background for the hero, features and final CTA sections, and the scrollbar track.
- **Pad Paper** (`pad-paper`): every top sheet, slip and FAQ "exercise book" page. Warm off-white, never pure white.
- **White** (`white`): the How It Works band and text on navy.
- **Soft Ink** (`ink-soft`): body copy and section leads on desk, white and paper (6.4:1 on desk).
- **Muted Slate** (`muted`): pre-printed form labels (FROM, DATE, QTY), secondary meta, captions, the sample-data disclaimer. Use it on paper, white or desk only (see Do's and Don'ts).
- **Rule** (`pad-rule`) and **Strong Rule** (`pad-rule-strong`): navy hairlines between line items and the heavier rules above and below form blocks. The total sits under a 3px double rule in the strong colour.

On the navy band, body text is a pale blue-grey (#C9D3E5, 9.4:1).

### Named Rules
**The Two Inks Rule.** Anything that reads as printed, written or stamped is in navy or crimson ink. No third hue appears on paper.

**The Carbon Is Paper Rule.** Pink and yellow exist only as paper surfaces (carbons, slips, tags, divider tabs), never as text, borders or accents.

**The Crimson Means Ink-on-Purpose Rule.** Crimson marks something the supplier or the press put there on purpose: an order number, a stamp, a correction, the call to action. It is not a general highlight colour.

## Typography

**Display Font:** Playfair Display (with Georgia, serif)
**Body Font:** Inter (with system-ui), with feature settings cv02, cv03, cv04, cv11
**Title Font:** Plus Jakarta Sans (the default for unclassed h1–h6)
**Label/Mono Font:** Geist Mono (with ui-monospace), tabular numerals
**Stamp Font:** Big Shoulders 700/800 (with Arial Narrow)
**Hand Font:** Kalam 400/700 (with Comic Sans MS, cursive)

**Character:** A high-contrast editorial serif does the persuading. The paper speaks in the voices of a real order book: mono for typed lines, condensed caps for pre-printed headings and rubber stamps, and a quick marker hand for what a person added.

### Hierarchy
- **Display** (Playfair 700, clamp 2.35–4.25rem, 1.04, -0.025em): the hero H1 only. The second clause turns crimson.
- **Headline** (Playfair 700, clamp 2–3.1rem, 1.08, -0.02em): section H2s, balanced. The final CTA uses a larger variant (clamp 2.2–3.6rem, 1.05).
- **Headline-step** (Playfair 700, clamp 1.6–2.1rem): How It Works step titles, prefixed by a handwritten crimson numeral ("1.").
- **Title** (Plus Jakarta 700, 18px, snug): feature captions under each slip.
- **Body** (Inter 400, 16–17px, 1.625): leads and step bodies in Soft Ink, max about 28–36rem wide. FAQ answers use a 2rem line height at 62ch to sit on the ruled lines.
- **Label – printed** (Inter 600, 10–11px, 0.12em, uppercase, Muted Slate): the pre-printed field names on forms (FROM, DATE, ITEM, QTY, TOTAL).
- **Mono line** (Geist Mono, 13–15px, tabular): every item, quantity, rate, amount, name and address written on paper. Order numbers are mono 600 in crimson.
- **Stamp heading** (Big Shoulders 700, 13–15px, uppercase, 0.16–0.22em): sheet titles ("Purchase order", "Price list", "Dispatch") and the binding title.
- **Stamp button** (Big Shoulders 800, 20–22px, uppercase, 0.1em): "Join as a supplier".
- **Hand** (Kalam 700, 15–19px; 30px on the price tag): notes, corrections and dates ("rest on 14 Nov", "out of stock"), rotated -2° to -4°.

### Named Rules
**The Right Voice Rule.** Each face has one job. Data on paper is mono; headings printed on paper are stamp caps; human additions are hand; arguments are serif; explanation is sans. Don't swap them.

**The Hand Is Short Rule.** Kalam is limited to short notes of a few words. It never sets a paragraph or a heading.

## Layout

- **Container:** 72rem max width, centred, with 16px gutters on phones and 24px from 640px up.
- **Section rhythm:** 96px vertical padding on phones, 128px from 640px up (the hero and the navy band are slightly tighter). Bands alternate: desk (hero) → white (How It Works) → desk (features) → navy (Who It's For) → ruled paper (FAQ) → desk (final CTA) → navy footer.
- **Copy and pad split:** at 1024px and up, the hero, How It Works, Who It's For and the final CTA use a two-column grid, about 1fr text to 1.05fr paper. On phones they stack: copy first, then paper.
- **Hero first viewport:** on phones, H1, a short lead and the CTA, then the pad fills the rest (the from/date block is hidden so the lines and stamp fit). On desktop, copy on the left and the pad on the right, tilted -2°.
- **How It Works:** on desktop the pad stays sticky (top: 50vh − 15rem) while three 64vh steps scroll past, and inactive steps fade to 35%. On phones each step carries its own pad that stamps when 60% of it is in view.
- **Features:** a 12-column grid with an irregular 7/5 then 4/4/4 split and staggered top offsets (pt 10/14/4), so slips sit like objects dropped on a desk rather than a tile grid. The search demo spans all 12 columns.
- **Sheet interior:** 16px side padding (24px from 640px), 12px top, 32–40px bottom to leave room for the torn edge. The line-item grid uses fixed numeric columns (item, 3.6rem, 3.4rem, 5.2rem), right-aligned.
- **Phones:** a pad with carbons gets 12px right margin so the copies can peek out without causing horizontal scroll.

## Elevation & Depth

Depth comes from stacked paper, not from a shadow scale. The pad casts one soft, navy-tinted, two-layer drop shadow that follows the torn mask. Carbons show depth by offset and rotation. Loose slips and tags carry a short, tight, navy-tinted under-shadow.

### Shadow Vocabulary
- **Pad cast** (`filter: drop-shadow(0 22px 26px rgba(27,42,74,0.16)) drop-shadow(0 2px 3px rgba(27,42,74,0.10))`): every PadStack and every torn slip. It must be a filter, not a box-shadow, so it follows the torn edge.
- **Loose slip** (`box-shadow: 0 10px 20px -14px rgba(27,42,74,0.5)`, with the price tag at `0 14px 24px -16px rgba(27,42,74,0.55)`): fanned inbox orders and the price tag.
- **Divider tab** (`box-shadow: 0 6px 10px -6px rgba(0,0,0,0.45)`): index tabs on the navy band.
- **CTA lift** (`0 10px 20px -12px rgba(27,42,74,0.6)`, under the inset double rule): the hero button.

### Named Rules
**The One Light Rule.** All shadows fall straight down and are tinted navy. No coloured glows and no hard offset shadows.

## Shapes

Paper is nearly square: the binding has 6px top corners only, stamps 4px, buttons 5px, tick boxes 3px. Paper edges carry the character instead of radius:
- **Torn edge:** a 12px × 7px zigzag mask along the bottom of every sheet and carbon (`--pad-torn`).
- **Perforation:** a row of 1.3px dots every 9px directly under the binding.
- **Double rule:** stamps and both CTAs draw an outer 2.5–3px border plus an inset inner rule, separated by a paper-coloured gap.
- **Ruled paper:** the FAQ background has a crimson margin line at 28px (64px from 640px) at 35% opacity.
- **Rotation:** paper sits between -3° and +2.2°; stamps between -9° and +5°.

The only rounded silhouettes are object-true: the phone frame (34px outer, 26px inner) and the price tag with its clipped top-left corner (10px with a 34px corner) and punched hole.

## Components

### Buttons
Rubber-stamped and physical.
- **Shape:** sharp-cornered (5px radius) with a double-ruled frame.
- **Primary (`.btn-stamp` in globals.css; used by the hero, nav, mobile menu and auth forms):** solid crimson with white Big Shoulders 800 caps, 48–52px tall (`.btn-stamp-sm` is the 44px nav size), 28px side padding, an inset 1.5px white rule inside a 3px crimson inset, and the CTA lift shadow. A trailing arrow nudges 2px right on hover.
- **Hover / Active:** deepens to Deep Crimson; pressing moves it down 1px.
- **Outline stamp (final CTA):** a crimson-ink stamp on pad paper, 56px tall, 3px border with an inner rule, rotated -3°. On hover it straightens to 0° and fills crimson with white text; pressing scales it to 0.97. Easing is cubic-bezier(0.16, 1, 0.3, 1) over 300ms.
- **Text link (`.link-ruled`):** navy semibold with a 2px underline at 25% navy, offset 6px, at least 44px tall. The underline turns crimson on hover. Secondary actions such as "See how it works", "Back" and "Home" use it.
- **Focus:** a 2px crimson outline, offset 3px, everywhere on the landing.

### The Order Pad (signature)
The core object, built from PadStack and PadSheet.
- **Binding:** a 36px navy strip with a faint top gloss. The left side reads "ALAYN · {title}" in white stamp caps at 85% opacity; the right side carries a small "EXAMPLE" tag on white at 15% opacity.
- **Carbons:** yellow and pink sheets under the top sheet, offset and rotated. They are optional and turned off for single-step sheets.
- **Top sheet:** pad paper with a perforation, a stamp-caps title, a crimson mono order number, a printed-label form block, mono line items over hairline rules, and a total under a double rule. The foot is left empty for stamps.
- **Motion:** lines reveal left to right with a clip-path over 0.5s (ease 0.16, 1, 0.3, 1), 380ms apart. On desktop the top sheet tears off: it stays opaque and on top (z-index 2) while it moves up and right (y -70, x 120, rotate 11°) over 0.55s with an ease-in, fading only in the last 30%. The next sheet is already underneath and does not fade in.

### Rubber Stamp (signature)
- **Style:** Big Shoulders 800 caps (1.35rem main, 0.68rem sub), double-ruled frame, crimson ink at 90% or navy ink at 88%, multiply blend, roughened and speckled by the shared `#stamp-ink` SVG filter.
- **Landing:** comes down from scale 1.7 and 9° more rotation, then settles on a stiff spring (560/26, mass 0.7). The pad drops 4px when the stamp lands.
- **Vocabulary:** NEW ORDER, PACKING, PART SENT, 2 OF 3 DELIVERED, OUT OF STOCK, READY FOR ORDERS (signup success). These are status words from the product, never slogans.

### Slips and Tags
Torn-edge slips (dispatch, out of stock, deliver to) on paper or carbon pink. The fanned inbox stack sits under a navy "To do · 2" tab. The yellow price tag shows a crimson strike over the old price and the new price in hand.

### Index Tabs
44px tabs with 6px left corners in the three papers, cycled in order and stepped right 1.25rem per row (repeating every 5). They bleed past the right edge of the navy band and slide 10px right on hover (0.35s). Reduced motion turns this off.

### FAQ Rows
Native `<details>` on ruled paper, under a 2px navy top rule with 15% navy row dividers. Summaries are 17px semibold, at least 64px tall, and turn crimson on hover. The crimson plus rotates 45° on open (300ms).

### Navigation and Footer
- **Nav:** a white bar with a 1px navy hairline at 10% opacity, which gains a soft shadow on scroll.
- **Portal label:** on the nav, login and signup, the TM logo is followed by a 1px divider (navy at 20%) and "Supplier portal" in 12–13px semibold Muted Slate. The label keeps clear space from the logo and is never set as a badge or inside the mark. Section links and "Log in" are plain text with a crimson underline on hover. "Join as a supplier" uses `.btn-stamp-sm`. The mobile menu uses a full-width `.btn-stamp`, then the links, then a `.link-ruled` "Log in".
- **Footer:** navy, opening with a 7px desk-coloured torn edge so the page ends like a sheet torn off the pad. Links are #C9D3E5 and turn #FF8A8F on hover. Headings and the copyright line are #9FAECB. The TM logo stays on its white panel.

### Auth Pages (login, signup)
Task pages: the form stays native and plain, and the order-pad world lives around it.
- **Shell (`AuthShell`):** a plain white form pane. The h1 is Playfair. Inputs have 5px corners. The primary action is `.btn-stamp` and Back/Home are `.link-ruled`.
- **Status slips:**
  - **Warnings:** carbon-yellow paper with navy text.
  - **Errors:** carbon-pink paper with #7A0F18 text.
  - **Success:** pad paper with a navy tick.
- **Signup progress:** two 4px bars. The current bar is crimson, the done bar navy with a navy tick, and upcoming steps are navy at 15%.
- **Login panel (`AuthShowcase`):** on the desk ground, a Playfair headline, one sentence, and the shared `InboxStack` labelled "Example orders."
- **Letterhead Pad (signup panel, signature):** the supplier's own price-list pad, tagged "PREVIEW". It prints what they type: business name in stamp caps, category in crimson mono, dispatch address, GSTIN, "Orders: name · phone", and delivery terms in Kalam. Blank fields wait as dashed Kalam hints. It never shows email or password. The empty product rows read "your first product goes here", and a navy READY FOR ORDERS stamp lands on success.
- **Loader (`AuthLoader`):** desk ground, the TM logo, and nine tear-line dots inking crimson in turn (static under reduced motion).

## Do's and Don'ts

### Do:
- **Do** show every feature as the piece of paper or screen it replaces in the supplier's day, with sample data, and label it as an example.
- **Do** keep all text on paper in navy or crimson ink, with data in Geist Mono and numbers tabular and right-aligned.
- **Do** tilt paper slightly (-3° to +2°) and give it the torn edge, perforation and single pad-cast shadow.
- **Do** use stamp words from the order lifecycle (New order, Packing, Part sent, Delivered, Out of stock).
- **Do** render `<InkDefs />` once per page whenever stamps are used.
- **Do** honour reduced motion: show the finished, stamped state immediately and turn off the tab slide.
- **Do** keep Muted Slate on pad paper, white or desk (5.0:1 on desk). On pink carbon, use navy for small text.

### Don't:
- **Don't** use pink or yellow as text, borders or highlight colour; they are paper.
- **Don't** set paragraphs or headings in Kalam, or use stamp caps for running text.
- **Don't** use icon tiles, feature cards with glyph icons, or a SaaS hero-and-grid layout.
- **Don't** add coloured glows, gradients on paper, or hard offset shadows.
- **Don't** show real restaurant logos, supplier counts, order counts or testimonials on the pad.
- **Don't** use the perforation dots on their own (under the nav, as page borders or as progress). Away from a pad they read as a random dotted line, not a tear line. They belong only between a pad's binding and its sheet.
- **Don't** write "challan"; say purchase order, order pad or delivery slip.
- **Don't** put small Muted Slate (4.3:1) or crimson (4.2:1) text on carbon pink.
