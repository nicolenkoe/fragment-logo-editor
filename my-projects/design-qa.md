# Design QA 1.12
Source: /workspace/generated_images/exec-c986a9fc-c19f-4937-bdee-fd080ec29102.png; alternatives exec-30202d9f-8405-4655-bc88-7bd13f26ea58.png and exec-e9b22f32-5b6e-4db3-98ca-66f59fff6848.png.
Implementation: tests/implementation-1.12-mode-3.png (390x844 CSS px, DPR 1). Source normalized to 390x844; app content only. Full-view side-by-side: tests/design-qa-1.12.png. Row controls are readable at this scale; focused checks used browser geometry assertions.
Pass 1: P2 compact rows too tall (84px), resulting in excessive vertical space compared with reference. Fixed compact row height to 76px and reduced top spacing. Pass 2: inspected combined comparison after fix. No remaining P0/P1/P2 findings.
Typography: local Roboto retained; Codex English, titles above logos and do not overflow at 320/360/390/768. Layout: original assets, compact default and two alternatives, exact 88px Site/copy and Launch width. Colors: original dark/lime tokens retained. Image quality: authentic assets from APK retained; no new generated marks. Content: six original projects, original destinations, shorter Codex copy.
Browser interactions: all three layouts persist through reload, search/settings separate, filters/reset, copy, six Codex links, desktop Launch explanation; no JS errors. Physical Android install and native layout/launch require device verification; native compile/signature checks passed.
P3: browser text uses native platform rasterization, which differs slightly from generated reference. Controls have a deliberate 32px visual height to match approved compact design.
final result: passed


Version 1.14: inspected tests/implementation-1.14-mode-3.png. Added English GitHub beside Codex using same row height, original icons retained. Browser geometry asserts both links fit without overlap at 320/360/390/768 in all three layouts. Native build passed; physical Android verification remains pending.

Version 1.15: accessibility fix for Android fixed title/card heights; original Hvost 0.59 launcher logo extracted. Web regression passed. Android large-font behavior requires physical-device confirmation; compile/sign verification only.
