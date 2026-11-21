# Version 1.19 verification
No Android layout change: download selection and cache handling fixed. Android native APK compile/signature passed; physical DownloadManager and font-scale testing remain pending.

Web: user-supplied descriptions shared through descriptions.js in public and personal catalogs. Captures: tests/public-1.19.png and tests/implementation-1.19-mode-3.png. No new image mockup generated or pixel-level visual comparison performed.

Browser checks: all three personal modes at four widths, public at five widths; versions and URLs, shared descriptions, clipboard and links; no catalog/Codex/repository links in public. Actual APK click verified with cached 0.64 resolving 0.67; outdated/error responses and repeat taps tested. No JS errors.

All five other project APKs downloaded and Android package/version manifests verified. Published SHA-256 compared where provided. Same signing certificate retained for hub. Freshness rules documented in RELEASE_RULES.md and linked from AGENTS.md.
