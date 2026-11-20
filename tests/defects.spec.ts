import { type Page, type TestInfo } from '@playwright/test';
import { test, expect } from './support/telemetry';
import { fillCheckoutInformation, loginAsStandardUser, submitLogin } from './support/flows';

async function capture(page: Page, info: TestInfo, name: string) {
  const path = info.outputPath(`${name}.png`);
  await page.screenshot({ path, animations: 'disabled' });
  await info.attach(name, { path, contentType: 'image/png' });
}

test.describe('Known behavior reproductions', { tag: '@known-defect' }, () => {
  test('SD-01: an empty cart reaches order confirmation', async ({ page }, info) => {
    await loginAsStandardUser(page);
    await page.getByTestId('shopping-cart-link').click();
    await expect(page.getByTestId('cart-contents-container')).toBeVisible();
    await expect(page.getByTestId('inventory-item')).toHaveCount(0);
    await page.getByRole('button', { name: 'Checkout', exact: true }).click();
    await expect(page.getByTestId('checkout-info-container')).toBeVisible();
    await fillCheckoutInformation(page);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByTestId('checkout-summary-container')).toBeVisible();
    await expect(page.getByTestId('inventory-item')).toHaveCount(0);
    await expect(page.getByTestId('total-label')).toHaveText('Total: $0.00');
    await capture(page, info, 'sd-01-empty-overview');
    await page.getByRole('button', { name: 'Finish', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
    await capture(page, info, 'sd-01-confirmation');
  });

  test('SD-02: the required-field error persists after checkout fields are filled', async ({ page }, info) => {
    await loginAsStandardUser(page);
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await page.getByTestId('shopping-cart-link').click();
    const cart = page.getByTestId('cart-contents-container');
    await expect(cart).toBeVisible();
    await expect(cart.getByTestId('inventory-item-name')).toHaveText(['Sauce Labs Backpack']);
    await page.getByRole('button', { name: 'Checkout', exact: true }).click();
    const continueButton = page.getByRole('button', { name: 'Continue', exact: true });
    await continueButton.click();
    const error = page.getByRole('alert');
    await expect(error).toContainText('First Name is required');
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    await fillCheckoutInformation(page);
    await expect(page.getByRole('textbox', { name: 'First Name', exact: true })).toHaveValue('Demo');
    await expect(error).toContainText('First Name is required');
    await capture(page, info, 'sd-02-stale-validation');
    await continueButton.click();
    await expect(page.getByTestId('checkout-summary-container')).toBeVisible();
  });

  test('SD-03: adding the fleece jacket silently fails for problem_user', async ({ page, browser }, info) => {
    const standard = await browser.newContext({ baseURL: info.project.use.baseURL });
    try {
      const control = await standard.newPage();
      await loginAsStandardUser(control);
      await control.getByTestId('add-to-cart-sauce-labs-fleece-jacket').click();
      await expect(control.getByTestId('remove-sauce-labs-fleece-jacket')).toBeVisible();
      await expect(control.getByTestId('shopping-cart-badge')).toHaveText('1');
    } finally {
      await standard.close();
    }

    await submitLogin(page, 'problem_user');
    await expect(page.getByTestId('inventory-list')).toBeVisible();
    const add = page.getByTestId('add-to-cart-sauce-labs-fleece-jacket');
    await add.click();
    await expect(add).toBeVisible();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
    await expect(page.getByRole('alert')).toHaveCount(0);
    await capture(page, info, 'sd-03-catalog-after-click');
    await page.getByTestId('shopping-cart-link').click();
    await expect(page.getByTestId('cart-contents-container')).toBeVisible();
    await expect(page.getByTestId('inventory-item')).toHaveCount(0);
    await capture(page, info, 'sd-03-empty-cart');
  });
});
