# How I used AI

I used Codex to narrow the exercise to the main shopping journey, draft and run the Playwright tests, and capture evidence from the live demo. I focused on outcomes a shopper can verify, such as which products reach checkout and whether the total adds up.

## How I prompted Codex

These examples paraphrase the instructions used during the exercise.

1. **Scope the exercise.** “Use the take-home brief to prioritize the shopping flows. Check assumptions against the live demo. Keep setup simple and capture evidence for three reproducible shopper issues.” [Scope and run instructions](../README.md)
2. **Verify one behavior at a time.** “Compare the fleece jacket add-to-cart action in fresh sessions as `standard_user` and `problem_user`. Record the button state, cart badge, any visible error, and cart contents. Capture the product card and cart in the failing session.” [SD-03 reproduction](../tests/defects.spec.ts) · [Shopper findings and screenshots](ux-review.md)
3. **Diagnose the CI failure.** “Read the Linux failure log and identify which page the assertion was on when it failed. Wait for the cart and scope the assertion to its item list. Rerun locally and on Linux.” [Linux failure](https://github.com/slvdrvncntjvr/saucedemo-qa/actions/runs/44517481936) · [Verified fix](https://github.com/slvdrvncntjvr/saucedemo-qa/actions/runs/44517912513)

I started with a shopper outcome, used Codex to draft and run the check, and used the browser results to decide what to keep or revise. GitHub Actions runs the same suite on Linux.

## Where AI needed correction

| Where AI helped | What needed correction | How it was checked |
| --- | --- | --- |
| Drafting the test architecture | The initial strategy described telemetry as automatic even though its fixture was lazy. The final fixture declares `auto: true`. | The generated test report has telemetry attached to every scenario. |
| Investigating browser logs | The first AI-written logger captured HTTP 401 console messages without enough context to identify the failing request. The next version records the resource status and URL. | A rerun identified a Backtrace events request. The shopper findings each have visible symptoms and separate test evidence. |
| Exploring and writing up defects | The proposed strategy treated a broader defect list as established. I kept the three behaviors I could reproduce with Playwright on the live site. | Each finding has an ID, observed result, screenshot, and corresponding Playwright test. |
| Stabilizing the checkout reproduction | The first AI-written version checked a product name immediately after opening the cart. On Linux, that selector still matched all six catalog cards during navigation. I used Codex to revise the check so it waits for the cart and looks inside it. | The Linux failure log identified the catalog matches. The revised assertion checks the exact item list inside the visible cart. |
| Checking repeatability | A local recheck timed out before login. The trace showed one connection taking about 21 seconds, beyond the original 20-second navigation budget. I used Codex to extend that budget to 35 seconds and make the login controls the readiness check. | With the connection restored and the readiness change in place, all 16 checks in a two-repeat local run passed. |

Playwright executes the checks using selectors and assertions. Running the repo requires Node.js, Chromium, and internet access to SauceDemo. AI assistance took place during preparation and interpretation.
