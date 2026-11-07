# Harris Abid — Brand & Operations Portfolio, V2

A complete personal-brand website with a scroll-driven build sequence, an editorial portrait, and real historical work screenshots from the supplied portfolio.

## Publishing with GitHub Pages

This repository is ready to publish as it is: `index.html` at the root loads `styles.css`, `script.js`, `swarm.js` and the `assets/` folder, and `.nojekyll` tells GitHub Pages to serve the files untouched.

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, then branch **main** and folder **/ (root)**.
3. Save, wait a minute or two, and open the URL GitHub shows.

Keep the files where they are. Don't rename `standalone.html` to `index.html`; that would replace the editable page.

## Editing

Edit `index.html`, `styles.css`, `script.js` (hero, studio canvas, marketplaces, interactions) and `swarm.js` (the agent build layer). Images live in `assets/`; the page uses the WebP versions, and the original PNGs are kept for reference.

## Portable single file

`standalone.html` is a one-file copy with the styles, scripts and images embedded, for sharing or offline viewing. It is generated, so don't edit it by hand. Rebuild it after any change:

```
python3 build_standalone.py
```

Open either HTML version locally to preview it. Images and contact links work without a server. Browser support for some features may vary; modern Chrome, Edge, Safari and Firefox are the intended targets.

## What the animation does

- On load, a swarm of small cursor "agents" (18 on desktop, 10 on phones) gathers around a scanning tile, then spreads across the page.
- Every element starts as a wireframe placeholder (grey text bars, dashed boxes, X-boxes for images). As you scroll, an agent claims each piece: it drags out a coloured selection box with a live size badge, types text in behind a caret, snaps headings into place from a ghosted copy, and flashes alignment guides.
- A control bar at the bottom shows agents and built layers, and has **Tour** (auto-scroll that waits for each screen to finish building), a **1×/2×/4×** speed switch and **×** to stop the effects. This layer lives in `swarm.js`.
- Cursors only appear while working: each launches from the control bar, builds its piece, then fades out. At the bottom of the page all of them gather into a ring, spin like a wheel around a check mark, burst outward and fade away.
- Systems in production: eight cards from the current role (account-health monitor, escalations tracker, proof-of-value recovery, vendor-portal pipeline, multi-channel checks, deal auditor, casework, enablement), each with a mock-up, result, tools and an expandable “How it works”. Mock-ups use sample data with company details anonymized.
- Marketplaces: eight cards (Amazon, Walmart, Shopify, Etsy, eBay, noon, Macy’s, Ulta) are dealt into a deck, fanned out, laid into a row one by one by a single cursor, then connected to a “Your brand” hub. Logos are styled text marks that identify each platform.
- The Approach diagram is live: a spinning arc and tick ring around the brand core, pulse waves, satellites on the orbits, curved connectors with data flowing in, node cards with real figures, and a LIVE readout that pings one system at a time.
- Returning visitors (same browser) skip the scanning intro and get a 4× build. Nothing is sent anywhere; one flag is kept in the visitor's browser storage.
- The studio canvas assembles a real case study (nearly 3× sales vs. the same dates last year) with the sales dashboard it came from; the product visual is an inline SVG illustration rather than a photo. Click a Layers row or a step to jump to it; once built, drag the portrait with a mouse and it snaps back.

- A title is revealed with a caret, then its selection frame is adjusted.
- The "Watch the pieces" studio is a design-tool workspace: toolbar, Layers panel, rulers, a labelled artboard, a live Inspector (position, size, type, constraints, editing agent) and pink spacing redlines, with a four-step progress stepper underneath.
- The live canvas writes a title character by character as you scroll.
- A cursor places and resizes the portrait from its corner, with snapping guides and size labels.
- A work screenshot moves into position while an arrow draws onto the canvas.
- Five decorative cursors assemble other sections, then follow the real mouse and fade away near the ending.
- Pause effects, replay and system reduced-motion preferences are supported.

This is a designed visual effect, not real AI agents editing the site. It collects no visitor data and has no analytics. Optional Google Fonts request font files from Google.

## Evidence and images

The portrait is AI-created from the supplied reference photos. The work screenshots are historical examples rendered from the supplied PDF with its existing redactions preserved. Click a screenshot to inspect it in the viewer. No screenshots were generated, repainted, or invented.

Read **DESIGN_NOTES.md** for palette research, colour contrast ratios, animation details, asset provenance and testing limits.

## Customize

- `index.html`: positioning, experience, outcomes, email and LinkedIn.
- `styles.css`: palette, typography, spacing, responsive rules and effects.
- `script.js`: timing, cursor roles, scroll choreography and screenshot viewer.
- `assets/`: portrait and historical screenshots.
- `build_standalone.py`: after source edits, run `python3 build_standalone.py` to rebuild the one-file option (standard library only).

Professional email and LinkedIn are from the current supplied CV. Your phone number and exact location were not added. Confirm employment dates and contact details remain current before publishing.

## Interactive edition (V3)
- Grow my brand / Hire Harris changes the introduction, suggested route, and enquiry topic; all evidence and experience remain available.
- Select Catalog, Orders, Ads, or Automation to explore a workflow and relevant evidence or reported impact.
- Open any screenshot and select numbered markers for interpretive review notes. These do not claim undocumented historical actions.
- Choose an enquiry topic and optionally add context to generate an email draft. Requires an email app; there is no backend or automatic submission.
- Pointer cues and subtle button movement supplement visible labels. Touch and keyboard users use the same buttons. Pause effects and reduced-motion settings suppress decorative movement.
- The automatic scroll-driven build is preserved. No visitor editing canvas was added.

Validation: JavaScript syntax, HTML IDs/anchors/assets, standalone embedding, and ZIP integrity checked. V3 browser interaction and responsive visual QA could not run because the preview service timed out; validate in your browser before publishing.


Review update: desktop browser checks now passed for audience selection, workflow detail/evidence routing, numbered annotations, enquiry topic/context encoding, dialog focus return, and pause effects. No broken loaded images or desktop horizontal overflow observed. Fixed initial hero CTA routing, dialog focus origin, connector alignment, reduced-motion control messaging, and arrow glyph fallback. Mobile-device and screen-reader testing remain outstanding.

Motion polish: see MOTION_REVIEW.md for implemented fixes, responsive checks, research, and remaining real-device performance testing.

Marketplace motion: Amazon, Etsy and eBay wordmark cards rotate in CSS 3D, resize, stack, and fan out with attached decorative cursors. No Blender render or WebGL dependency is required. Etsy listing creation and SEO experience (three years) was confirmed directly by Harris.
