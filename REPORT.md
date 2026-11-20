# SauceDemo QA report

**Salvador Vincent Javier**

## Findings and recommendations

| Reproduced behavior | Shopper impact and proposed change |
| --- | --- |
| **SD-01 · Empty order.** `standard_user` can finish checkout with zero items and a $0.00 total. [Screenshot](docs/screenshots/sd-01-empty-overview.png) | A shopper can enter their details and receive an order confirmation for an empty cart. Explain that the cart is empty, emphasize the existing Continue Shopping button, and require an item before checkout. |
| **SD-02 · Stale validation.** `standard_user` sees “First Name is required” after filling all fields. The form advances on the next attempt. [Screenshot](docs/screenshots/sd-02-stale-validation.png) | The form makes accepted input look invalid. Place messages beside the fields and clear each message as the shopper corrects it. |
| **SD-03 · Silent add failure.** `problem_user` selects Add to cart on the fleece jacket, but the cart stays empty. The same action succeeds for `standard_user`. [Screenshot](docs/screenshots/sd-03-catalog-after-click.png) | A shopper has no way to tell whether the click worked. Update the cart on success and offer clear feedback and a retry on failure. |

The [UX review](docs/ux-review.md) includes full steps and additional screenshots. SD-03 uses a deliberately faulty demo account.

## Why Playwright

I chose Playwright and TypeScript to make shopper journeys repeatable from a fresh browser session. The suite checks login, sorting, cart removal, and purchase. It verifies product identities, quantities, and total arithmetic before checking confirmation. The local run passed **five baseline checks and three known-defect reproductions** in desktop Chromium. A passing reproduction means the documented behavior was observed.

## What AI helped with and got wrong

I used Codex to plan scenarios, draft and run the tests, and capture screenshots. One AI-written check passed locally but failed on Linux because its item selector still matched the catalog during navigation. I used Codex to revise the check so it waits for the cart and verifies its item list. The next Linux run passed. I also used an automatic fixture so every test captures browser diagnostics. [AI workflow, prompts, and CI evidence](docs/ai-workflow.md)
