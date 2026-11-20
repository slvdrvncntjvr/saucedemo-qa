# SauceDemo QA

[![Playwright tests](https://github.com/slvdrvncntjvr/saucedemo-qa/actions/workflows/tests.yml/badge.svg)](https://github.com/slvdrvncntjvr/saucedemo-qa/actions/workflows/tests.yml)

I used Playwright and TypeScript to test the main shopping flow on [SauceDemo](https://www.saucedemo.com/). Codex helped me draft and run the checks, investigate a CI failure, and capture screenshots.

- [One-page report](REPORT.md)
- [UX review with steps and screenshots](docs/ux-review.md)
- [AI prompts, verification workflow, and corrections](docs/ai-workflow.md)

## Run the tests

Use Node.js 24, npm, and internet access to SauceDemo. From the cloned repository:

```sh
npm ci
npx playwright install chromium
npm test
```

On Linux, use `npx playwright install --with-deps chromium` if you need browser system dependencies. In PowerShell, use `npm.cmd` and `npx.cmd` if the `.ps1` launchers are blocked.

The suite has five checks for login, sorting, cart removal, and checkout, plus three tagged `@known-defect`. A passing test with that tag means the issue was reproduced. The UX review has the screenshots and reproduction steps.
