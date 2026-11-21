# Editor review requirements

Keep the editor in one viewport. Never add page or panel scrolling as the default layout, or hide overflowing controls without another way to reach them. Fit the canvas while preserving its aspect ratio; paginate long layer lists and settings.

Before finishing every UI change, check for horizontal and vertical scrollbars and unreachable content. Cover 1440×900, 1280×720, 1024×768, 390×844, 375×667, and 844×390. Check the default image, selected/rotated object, many layers, all tool/property tabs, open split settings, and mobile drawers. `window.checkEditorLayout()` must return `ok: true` for each visible state. Verify next/previous pages expose every layer and setting, and controls remain usable with keyboard and pointer.

Use the supported browser QA path from the Sites skill. When browser tooling is unavailable, run the available logic checks, explicitly report that browser layout verification was unavailable, and do not claim the viewport checks passed.

Cover the Text tab, polygon lasso, selection resize/rotation handles, grouping controls, sensitivity live preview, delayed tooltips and the video page when checking layouts. New controls must remain reachable through pagination on short windows.

For every delivered application version, provide a short numbered user acceptance checklist and a short video with Russian voiceover explaining what to verify. Send the links/files through the email channel when authorized in the conversation. Keep recipient contact information out of the public repository. The right-hand list shows applied layers only; live sensitivity previews stay on the canvas until applied.

Keep automatic-splitting settings in one module above its Apply button. Re-splitting a selected layer must preserve all other layers and its complete affine transform. Selected-object frames are bright cyan with small handles: proportional corners, independent side stretching and rotation. Cropping-selection points must remain visually small with a usable invisible hit area.

When testing pointer selection, cover overlapping layers: the active visible selected layer has priority on its painted pixels, even under a higher layer. Transparent pixels inside its transformed bounds pass the click through to painted objects behind it. Outside those bounds, normal picking applies. Preserve explicit layer-list selection and modifier-based multiselection.

User-facing tutorial videos must be actual recordings of the current editor UI with the whole program visible, a visible cursor, real interactions and synchronized Russian voiceover. Do not substitute static illustrated slides. Show sensitivity 35/70/100 and real object counts before/after applying; include moving, color, uniform and independent sizing, rotation, grouping/ungrouping and image import. Keep the welcome page links to editor.html, current APK and video instructions working.

The public root/index.html is the welcome page. Open editor.html (or click «Редактировать в браузере») for editor flows and layout checks; Android starts editor.html directly.
