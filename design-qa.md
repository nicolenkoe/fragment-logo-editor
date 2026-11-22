# Fragment 1.3.14 — side panel QA

The user's latest instructions replace panel pagination with vertical touch/wheel scrolling and thin scrollbars. Page scrolling remains disabled. Both modules use the available full height and recalculate on resize/fold/rotation. View cycles directly through the three existing layouts without a dialog. Panels have two states, open and icon rail; collapse targets stay at the same outer corner. The original background checkbox is represented by a compact header icon. New automatically split parts have empty names; custom naming remains available.

Browser checks passed at 1440×900, 1280×720, 1024×768, 390×844, 375×667, 844×390, 568×260, 866×364, 690×829 and 829×690, in all three layouts. All 32 educational layers can be reached by scrolling; no page selectors remain. All tool tabs can be scrolled; page bounds remain valid. The folding dimensions are viewport simulations, not a physical Galaxy Fold test. Both collapse targets were measured before and after two clicks at every size/layout; coordinates remain within one pixel. Background toggle and custom naming pass.

Reading order is applied only to newly created disjoint parts, in the source's own coordinates. Actual re-splitting of the supplied LENINGRADSKAYA word at maximum detail passes left-to-right ordering, including a rotated/stretched parent. Other layers and base pixels remain byte-identical. Manual reordering remains unchanged by UI refresh. A shuffled two-line synthetic case also passes.

Screenshots and video are stored with the release checks. Android APK resources match the web files exactly; the existing signing certificate is retained. Native Android evidence is reported separately after the Pixel 6 / Android 15 emulator run completes.

## 1.3.15

Adds orientation-specific native system bar control and independent saved positions for open panels and icon rails. A pointer-driven browser regression confirms separately dragging both states, moving the open state again without changing the rail, and restoring both after reload. Landscape immersive/portrait restoration is validated separately on the Pixel 6 / Android 15 emulator.
