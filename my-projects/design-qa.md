# Design QA — My Projects 1.9

## Scope and source visual truth

Selected first displayed ideation result, corrected only with the real Hvost icon extracted from APK 0.53.
Source: /workspace/generated_images/exec-3f9dc2c1-4917-4ca9-8ae7-ac254017abfd.png
Implementation: /workspace/work/implementation-1.9-mobile.png
Full comparison: /workspace/work/design-qa-1.9-comparison-pass2.png
Focused header/first-row comparison: /workspace/work/design-qa-1.9-focused.png
Viewport/state: 390 × 844 CSS px, closed search and settings panels, six public projects. Source pixels 852 × 1846, normalized to 390 × 844; implementation 390 × 844, deviceScaleFactor 1. No browser/OS frame is included. The image board places source and implementation together; they were inspected as a single comparison input.

## Comparison history

1. First captured implementation: list started too low and icons were slightly smaller than the reference. Before the first formal comparison, reduced list gap from 36 to 18 px, used 68 px original logos, and adjusted row padding to retain row density.
2. First full comparison: /workspace/work/design-qa-1.9-comparison-pass1.png. [P2] Project titles were visibly smaller than the reference. [P2] Legacy lime background caused an unintended outline around the header logo. Fixed titles from 18 to 20 px, allowed the label to use the small adjacent gap without colliding with actions, and removed the header image background.
3. Recaptured and inspected full and focused comparison after fixes. All six objects, names, Open/copy alignment, Codex links and toolbar order match the chosen structure; no actionable P0/P1/P2 remains.

## Required fidelity surfaces

- Typography: locally hosted Roboto 400/500/700 matches Android-style source hierarchy. Header 26 px at 390 width, project titles 20 px, Codex links 14 px, Open controls 15 px. Long Hvost title wraps into two lines. At 320 px compact responsive type is used with no overflow.
- Spacing/layout: one flat continuous list, original 68 px icons, light dividers, compact Open and adjacent copy action on one horizontal row. Search is left of the three-dot settings button. Closed-state density and major alignments were compared with the source.
- Colors/tokens: dark forest #101512, light text #eef3eb, lime #c0f19b, restrained green action tint. [P3] Flat background intentionally omits the mock's slight generated lighting/noise.
- Asset fidelity: supplied original CamaraD/Enduro/Fragment/Recorder icons; Hvost dog camera logo is extracted unchanged from res/Ug.png in its APK, not the website paw favicon. Own four-square brand asset is reused. Standard UI glyphs are official Material icon assets with color-only adaptation. [P3] Exact original brand raster/vector appearance is preferred to small generative variations in the mock.
- Copy/content: six project names and all six user-supplied Codex URLs verified. No URL guessing. No invented dashboard metrics or extra main-screen controls.

## Functional browser checks

- Search and settings collapsed initially; toolbar order verified.
- Search opens only search/filter controls; refresh is absent there.
- Settings opens separately, closes search, resets hidden search filters; repeated click closes it.
- Cyrillic search, linked/unlinked filters, empty state and copy-to-clipboard work.
- Six Codex links remain present in normal state.
- Original Hvost dog logo is used.
- Widths 320, 390 and 768 px: no horizontal overflow; Open and copy stay on one line.
- Browser page errors: none.

## Native Android scope / residual verification gap

The native APK is compiled and signed with the previous certificate. Its toolbar/panels use the same layout and original assets; the updater source is unchanged from 1.8. Preferred-browser setting defaults to com.android.chrome; chooser and missing-Chrome fallback exist. There is no attached Android device/emulator: native visual fidelity, installed Chrome dispatch and Android installation must still be confirmed on a phone. This report's visual pass applies to the browser-rendered shared design and does not claim native device QA.

## Implementation checklist

- [x] Compare source and implementation together at matching viewport.
- [x] Fix actionable typography/header differences and recapture.
- [x] Check all five fidelity surfaces and focused region.
- [x] Test search/settings separation and primary browser interactions.
- [x] Record native-device verification limit.

final result: passed
