---
"@oviceinc/excalidraw": patch
---

Fix white screen caused by tunnel-rat infinite update loop on Electron (ZERO-9972)

Patch tunnel-rat's useLayoutEffect cleanup to defer zustand set() via queueMicrotask,
preventing cascading re-renders when multiple tunnel instances unmount simultaneously.
