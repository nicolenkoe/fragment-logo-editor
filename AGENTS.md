# Editor review requirements

Keep the editor in one viewport. Never add page or panel scrolling as the default layout, or hide overflowing controls without another way to reach them. Fit the canvas while preserving its aspect ratio; paginate long layer lists and settings.

Before finishing every UI change, check for horizontal and vertical scrollbars and unreachable content. Cover 1440×900, 1280×720, 1024×768, 390×844, 375×667, and 844×390. Check the default image, selected/rotated object, many layers, all tool/property tabs, open split settings, and mobile drawers. `window.checkEditorLayout()` must return `ok: true` for each visible state. Verify next/previous pages expose every layer and setting, and controls remain usable with keyboard and pointer.

Use the supported browser QA path from the Sites skill. When browser tooling is unavailable, run the available logic checks, explicitly report that browser layout verification was unavailable, and do not claim the viewport checks passed.

Cover the Text tab, polygon lasso, selection resize/rotation handles, grouping controls, sensitivity live preview, delayed tooltips and the video page when checking layouts. New controls must remain reachable through pagination on short windows.
