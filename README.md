# Harris Abid — Brand & Operations Portfolio, V2

A complete personal-brand website with a scroll-driven build sequence, an editorial portrait, and real historical work screenshots from the supplied portfolio.

## Easiest GitHub upload: one file

1. Extract this ZIP.
2. Take `standalone.html` and rename it to **index.html**.
3. Upload that file to the root of your GitHub repository.
4. Enable GitHub Pages from your default branch and the root folder in repository **Settings → Pages**.
5. Open the URL GitHub provides after deployment.

`standalone.html` embeds the CSS, JavaScript, portrait, work screenshots, and screenshot viewer assets. No build, installation, API key, or backend is needed. Google Fonts are optional; system fonts are the fallback.

## Editable project

Upload `index.html`, `styles.css`, `script.js`, `.nojekyll`, and the **assets/** folder together if you prefer separate, easily editable files. Keep their relative paths intact. The standalone file is generated from these files; it does not need to be uploaded alongside them.

Open either HTML version locally to preview it. Images and contact links work without a server. Browser support for some features may vary; modern Chrome, Edge, Safari and Firefox are the intended targets.

## What the animation does

- A title is revealed with a caret, then its selection frame is adjusted.
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
