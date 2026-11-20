import { test, expect } from './support/telemetry';
import { fillCheckoutInformation, loginAsStandardUser } from './support/flows';

const products = [
  { name: 'Sauce Labs Backpack', slug: 'sauce-labs-backpack', priceCents: 2999 },
  { name: 'Sauce Labs Bike Light', slug: 'sauce-labs-bike-light', priceCents: 999 },
];

function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function readMoneyCents(label: string): number {
  const match = label.match(/\$(\d+)\.(\d{2})$/);
  expect(match, `Expected a dollar amount with two decimal places: ${label}`).not.toBeNull();
  return Number(match![1]) * 100 + Number(match![2]);
}

test('standard shopper purchases the selected products with consistent totals', async ({ page }) => {
  await test.step('Sign in and add two identified products', async () => {
    await loginAsStandardUser(page);
    for (const product of products) {
      const card = page.getByTestId('inventory-item').filter({
        has: page.getByTestId('inventory-item-name').filter({ hasText: product.name }),
      });
      await expect(card).toHaveCount(1);
      await expect(card.getByTestId('inventory-item-price')).toHaveText(dollars(product.priceCents));
      await card.getByRole('button', { name: 'Add to cart', exact: true }).click();
      await expect(card.getByRole('button', { name: 'Remove', exact: true })).toBeVisible();
    }
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');
  });

  await test.step('Verify the cart contains exactly the selected products', async () => {
    await page.getByTestId('shopping-cart-link').click();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(page.getByTestId('inventory-item-name')).toHaveText(products.map(p => p.name));
    await expect(page.getByTestId('inventory-item-price')).toHaveText(products.map(p => dollars(p.priceCents)));
    await expect(page.getByTestId('item-quantity')).toHaveText(['1', '1']);
    await page.getByRole('button', { name: 'Checkout', exact: true }).click();
    await expect(page.getByTestId('checkout-info-container')).toBeVisible();
    await fillCheckoutInformation(page);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
  });

  await test.step('Verify item identities and checkout arithmetic before paying', async () => {
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(page.getByTestId('checkout-summary-container')).toBeVisible();
    await expect(page.getByTestId('inventory-item-name')).toHaveText(products.map(p => p.name));
    await expect(page.getByTestId('inventory-item-price')).toHaveText(products.map(p => dollars(p.priceCents)));
    await expect(page.getByTestId('item-quantity')).toHaveText(['1', '1']);

    const subtotal = products.reduce((sum, product) => sum + product.priceCents, 0);
    await expect(page.getByTestId('subtotal-label')).toHaveText(`Item total: ${dollars(subtotal)}`);
    const tax = readMoneyCents(await page.getByTestId('tax-label').innerText());
    expect(tax, 'Displayed tax must be non-negative').toBeGreaterThanOrEqual(0);
    // This verifies arithmetic using the displayed tax, not an unspecified tax policy.
    await expect(page.getByTestId('total-label')).toHaveText(`Total: ${dollars(subtotal + tax)}`);
  });

  await test.step('Complete the order and verify the cart has cleared', async () => {
    await page.getByRole('button', { name: 'Finish', exact: true }).click();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.getByRole('heading', { name: 'Thank you for your order!', exact: true })).toBeVisible();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);

    await page.getByRole('button', { name: 'Back Home', exact: true }).click();
    await expect(page.getByTestId('inventory-list')).toBeVisible();
    for (const product of products) {
      await expect(page.getByTestId(`add-to-cart-${product.slug}`)).toBeVisible();
    }
    await page.getByTestId('shopping-cart-link').click();
    await expect(page.getByTestId('cart-contents-container')).toBeVisible();
    await expect(page.getByTestId('inventory-item')).toHaveCount(0);
  });
});
