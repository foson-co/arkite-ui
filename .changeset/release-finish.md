---
---

Release tooling only: `pnpm release:cut` now pushes to GitLab only, and the new `pnpm release:finish` approves the staged npm version, confirms it is installable, then syncs the GitHub mirror and runs the starter canary. No change to the published package.
