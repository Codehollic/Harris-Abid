# Motion review — 6 November 2026

Implemented fixes:
- Unified phase boundaries: write 0–25%, place 25–46%, refine 46–73%, connect 73–100%.
- Added a 70ms exponential scroll-follow filter with smoothstep object interpolation. Scroll remains native and reversible.
- Portrait and resize cursor use shared geometry; eliminated the post-transform measurement dependency inside the studio.
- Cursor travels between portrait and evidence during the handoff instead of teleporting.
- Reduced portrait entry offset to prevent edge clipping; constrained the cursor to the canvas.
- Repeat section visits no longer fade the content out again.
- Corrected mobile sticky offset and reduced the mobile sequence length.
- Added a visible Skip animation link; kept pause and OS reduced-motion behavior.
- Suspended the RAF loop while the document is hidden.
- Reduced mobile canvas title size to prevent interference with the rule and supporting copy.

Browser checks:
- 320px, 390px, and 768px responsive iframe layouts: no horizontal overflow observed. This tests responsive layout, not physical device behavior.
- Tablet resize phase: cursor/portrait bottom-right discrepancy measured -0.1px horizontally and +0.2px vertically; phase label and active step both indicated refine.
- Reversing the test scroll from refine to write returned the writing phase.
- Desktop and narrow-layout screenshot inspection used to find clipping and title wrapping issues.
- Frame cadence instrumentation was inconclusive: the cloud browser produced roughly one-second gaps alongside normal 16.7ms samples. No reliable FPS improvement claim can be made from this environment. Instrumentation is excluded from the deliverable.
- Physical Android/iOS scrolling, OS reduced-motion toggling, CPU-throttled profiling, and assistive technology testing remain outstanding.

Suggested next upgrades (not implemented):
1. Move simple progress/reveal effects to native CSS scroll timelines behind feature detection; retain a fallback. Keep tightly coordinated cursor choreography in one shared timeline.
2. Add a brief crossfade to workflow details and evidence dialogs, using opacity/transform and respecting reduced motion.
3. Add a compact recruiter summary with direct experience, tools, and evidence links, preserving the full animated route for visitors who want it.

Research:
- https://web.dev/articles/animations-guide — favor transform and opacity; avoid unnecessary layout/paint work.
- https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/motion — native scroll timelines and progressive entry/exit transitions.
- https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions — allow users to disable non-essential interaction animation.

Final checks: 320px connect phase has clear title/rule separation; Skip animation landed at 74.5px below the mobile header; ending status reached the convergence message and all five agent opacities settled to zero; Pause effects produced a complete static canvas.

Marketplace update: desktop stack verified visually; 320px final fan checked and horizontal clipping corrected; pause settles all three cards visibly. Physical-device frame-rate verification remains outstanding.
