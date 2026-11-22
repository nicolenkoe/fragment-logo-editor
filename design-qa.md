# Fragment 1.3.14 — side panel QA

The user's latest instructions replace panel pagination with vertical touch/wheel scrolling and thin scrollbars. Page scrolling remains disabled. Both modules use the available full height and recalculate on resize/fold/rotation. View cycles directly through the three existing layouts without a dialog. Panels have two states, open and icon rail; collapse targets stay at the same outer corner. The original background checkbox is represented by a compact header icon. New automatically split parts have empty names; custom naming remains available.

Browser checks passed at 1440×900, 1280×720, 1024×768, 390×844, 375×667, 844×390, 568×260, 866×364, 690×829 and 829×690, in all three layouts. All 32 educational layers can be reached by scrolling; no page selectors remain. All tool tabs can be scrolled; page bounds remain valid. The folding dimensions are viewport simulations, not a physical Galaxy Fold test. Both collapse targets were measured before and after two clicks at every size/layout; coordinates remain within one pixel. Background toggle and custom naming pass.

Reading order is applied only to newly created disjoint parts, in the source's own coordinates. Actual re-splitting of the supplied LENINGRADSKAYA word at maximum detail passes left-to-right ordering, including a rotated/stretched parent. Other layers and base pixels remain byte-identical. Manual reordering remains unchanged by UI refresh. A shuffled two-line synthetic case also passes.

Screenshots and video are stored with the release checks. Android APK resources match the web files exactly; the existing signing certificate is retained. Native Android evidence is reported separately after the Pixel 6 / Android 15 emulator run completes.

## 1.3.15

Adds orientation-specific native system bar control and independent saved positions for open panels and icon rails. A pointer-driven browser regression confirms separately dragging both states, moving the open state again without changing the rail, and restoring both after reload. Landscape immersive/portrait restoration is validated separately on the Pixel 6 / Android 15 emulator.

## 1.3.16

Four independent layout profiles now keep open/rail module positions separately. Browser checks cover edge defaults, moving both modules in both states in all four contexts, profile restoration, reload and virtual keyboard resizing. Automatic split supports multiple selected sources, preserving affine/style and unselected layers, with one undo checkpoint and exact preview/application counts. Browser session regression restores image pixels, groups, editable curved text, selection and undo/redo after reload. Resize/View transitions preserve the same document signature. Full layout, panel-position and interaction checks pass. Android handles smallest-screen, screen-layout and density changes without recreating the WebView; full document autosave also restores a fresh process. Native Pixel 6/API 35 verification is reported in the release evidence; expanded-screen dimensions are emulated, not a physical Fold.

Upgrade note: versions through 1.3.15 did not persist the working session. Save a project file before installing 1.3.16 over an already running older version.

Small-object interaction: at a displayed edge below 72 CSS pixels, resize points are spread over an external minimum 96-pixel frame, preserving the artwork drag area. A separate move handle appears when space allows; rotation stays outside the enlarged frame. Real browser touch input passes for artwork drag, dedicated move drag and side resizing at phone portrait/landscape and expanded sizes. Existing affine resize/group/rotation tests and all layout checks pass. Starting a two-finger view gesture cancels the move-handle gesture.

Split apply UI: preview counts are explicitly labelled and do not create layers. New images start at midpoint slider values with the apply action enabled once preview is ready and a brief repeating border accent until first application. Subsequent applications require a slider edit and a ready preview; the action disables after application or target change. No explanatory text is added below the button. One-part preview offers background separation. Pointer-driven browser checks cover initial disabled state, both counts, real apply clicks, multi-source split and post-apply reset.

Android native comparison found all metadata preserved but GPU PNG re-import changed some edge pixels. Session schema 2 stores losslessly compressed raw RGBA and restores via putImageData; schema 1 remains readable. Browser pixel/history regression passes with the new format. Object color now updates on native picker input and valid palette HEX/swatch changes. Each picker interaction is one undo checkpoint.

## 1.3.17

Adds per-layer lock, selected-object eraser and restoration brush, nondestructive outline/shadow, six editable format templates, palette-quantized SVG path tracing in a Worker, and export preflight. Browser end-to-end checks pass lock/unlock and editing guard, actual brush pointer input, restoration and undo/redo, exact session round-trip including original brush pixels/effects, SVG worker output, clipping warning, editable card template and one undo. Vector logic tests cover transparent holes, immutable input and the supplied motorcycle/text logo with no embedded raster. Existing full layout and session/batch tests pass; extended open-effects/brush/modal layout checks and native Android evidence are recorded with the release.

SVG Android compatibility: the installed file origin rejects the external worker path on the emulator. Export now creates a self-contained Blob worker and falls back to the same trace routine when workers are unavailable. The complete advanced browser scenario also passes with Worker disabled. Ten viewport sizes, three workspace views, open brush/effect details, templates and SVG export dialogs pass reachability and viewport checks. Export save stays reachable through a thin-scrolling dialog.
