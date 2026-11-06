# Design, evidence & motion notes

## Personal brand

**Build your brand. I'll build the systems behind it.**

Harris is positioned as the operator who connects marketplace visibility, fulfillment, advertising, and automation. The content uses the supplied current CV for employment history and outcomes, and the older portfolio PDF for historical work examples.

## Colour decisions

Charcoal and warm off-white establish a clear editorial hierarchy. Muted sage connects the portrait, canvas, and supporting elements. Orange is reserved for emphasis, selected steps, and calls to action. These are design judgements, not claims that a particular colour guarantees trust, higher sales, or conversions.

The 2025 review by Jonauskaite and Mohr synthesizes 132 studies and reports associations between orange/yellow and higher-arousal positive emotions, and blue/green/white and lower-arousal positive emotions. It also distinguishes abstract associations from demonstrated effects in specific real-world contexts. The palette uses that evidence cautiously rather than promising universal colour psychology.

Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC12325498/

## Text contrast

WCAG minimum contrast is 4.5:1 for normal text and 3:1 for large text. Those thresholds informed the palette. This is not a complete WCAG conformance certification.

Source: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html

Calculated sRGB contrast ratios:

| Use | Foreground | Background | Ratio |
| --- | --- | --- | --- |
| Main text on charcoal | #efefe7 | #101210 | 16.28:1 |
| Secondary text on charcoal | #aebfa0 | #101210 | 9.64:1 |
| Body text on off-white | #536147 | #efefe7 | 5.73:1 |
| Orange headline on charcoal | #ff693d | #101210 | 6.58:1 |
| Text on orange buttons/surfaces | #151814 | #ff693d | 6.26:1 |
| Large secondary contact heading | #602812 | #ff693d | 4.06:1 |

A browser audit of settled page text, with effects paused, found no below-threshold text pairs in the checked desktop rendering. Decorative overlays and the original screenshot contents were excluded from that audit. Portrait text over photography requires visual review as well as palette calculations.

## Choreography

1. The hero title reveals line by line, with a caret and following decorative cursor; a temporary bounding box and corner cursor accompany a scale adjustment.
2. A sticky scroll scene writes the title character by character.
3. The portrait is placed, then resized while an animated cursor tracks its corner handle. Guides and a changing dimension label make the action legible.
4. An original work screenshot moves into place. An SVG arrow draws its connector.
5. Other page sections assemble with staggered content and editor-style selection borders.
6. At the ending, cursors gather around the real mouse, follow briefly, and disappear. Touch input uses a fixed gathering point.

These are scripted animations, not live AI editing or a collaborative design backend. Pause, replay and reduced-motion support keep the content usable. With scripts disabled the page remains readable and the canvas shows its completed composition.

## Portrait

`assets/harris-editorial-portrait.webp` is an AI-created editorial portrait based on the two supplied reference photos. Its purpose is presentation, not independent evidence of work history. The original reference photos are not bundled.

Production brief: preserve the man's recognizable facial structure, medium skin tone, broad build, clear round glasses, beard and silver-streaked dark hair; create a chest-up professional portrait with black blazer, dark crewneck, soft window lighting and a muted sage-grey studio background; remove the phone and mirror; avoid excessive retouching, slimming or de-aging. Created with the built-in image-generation tool, then encoded as a web asset.

## Work samples

The four work images were rendered from their placements on the supplied PDF pages so existing redaction overlays remain present. Raw embedded images that omit those overlays are not included.

| File | Source | Presentation |
| --- | --- | --- |
| catalog-management.png | Portfolio page 5 | Inventory and catalog screen; product/SKU redactions retained |
| advertising-performance.png | Portfolio page 6 | Historical lifetime account view; not attributed wholly to Harris |
| search-term-analysis.png | Portfolio page 8 | 2023 query-analysis sheet; existing query redactions retained |
| account-monitoring.png | Portfolio page 9 | Historical 2023 operational tracking |

The PDF's nearby sales-increase caption is not repeated as a verified outcome: its dashboard alone does not establish that increase. The older PDF's dates, skill percentages and LinkedIn URL do not replace the newer CV.

## Verification scope

Checked JavaScript syntax, local assets and fragment links, desktop layout without horizontal overflow, typing/placement/resizing/arrow states, screenshot loading in a modal, pause and replay controls, and settled text contrast. Physical mobile and assistive-technology testing remain outstanding. Responsive and reduced-motion styles are included; the design should be reviewed on the intended devices before a broad launch.

## V3: Guided exploration
Implemented audience routing, four-node operations exploration, two annotations per evidence image, a local email-draft builder, and supplemental cursor labels. Annotations are interpretive prompts, not evidence of unrecorded actions. Original screenshots remain unchanged. No visitor-controlled editing canvas.
Existing palette retained; controls have visible selected and keyboard-focus states. Coarse-pointer targets are at least 44px. Reduced-motion and the page pause control suppress new decorative movement.
New browser QA remains unverified: managed preview startup timed out with an empty log. Source structure, asset references, JavaScript syntax, standalone output and ZIP checks passed.


Review update: desktop browser checks now passed for audience selection, workflow detail/evidence routing, numbered annotations, enquiry topic/context encoding, dialog focus return, and pause effects. No broken loaded images or desktop horizontal overflow observed. Fixed initial hero CTA routing, dialog focus origin, connector alignment, reduced-motion control messaging, and arrow glyph fallback. Mobile-device and screen-reader testing remain outstanding.
