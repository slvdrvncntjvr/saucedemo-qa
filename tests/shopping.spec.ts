import { test, expect } from './support/telemetry';
import { loginAsStandardUser } from './support/flows';

test('sorting by lowest price reorders prices and keeps the same products', async ({ page }) => {
  await loginAsStandardUser(page);
  const names = page.getByTestId('inventory-item-name');
  const prices = page.getByTestId('inventory-item-price');
  const before = await names.allTextContents();
  const originalPrices = await prices.allTextContents();
  const ascending = [...originalPrices].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  expect(before.length).toBeGreaterThan(1);
  expect(originalPrices).not.toEqual(ascending);

  await page.getByRole('combobox', { name: 'Sort products' }).selectOption('lohi');
  await expect(prices).toHaveText(ascending);
  expect((await names.allTextContents()).sort()).toEqual([...before].sort());
});

test('removing one item leaves the other item and updates the cart badge', async ({ page }) => {
  await loginAsStandardUser(page);
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await page.getByTestId('add-to-cart-sauce-labs-bike-light').click();
  const badge = page.getByTestId('shopping-cart-badge');
  await expect(badge).toHaveText('2');

  await page.getByTestId('shopping-cart-link').click();
  const cart = page.getByTestId('cart-contents-container');
  await expect(cart).toBeVisible();
  await expect(cart.getByTestId('inventory-item-name')).toHaveText([
    'Sauce Labs Backpack', 'Sauce Labs Bike Light',
  ]);
  const backpack = cart.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' });
  await backpack.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(cart.getByTestId('inventory-item-name')).toHaveText(['Sauce Labs Bike Light']);
  await expect(badge).toHaveText('1');
});
