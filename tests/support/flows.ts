import { expect, type Page } from '@playwright/test';

// These credentials are published on the public training site's login page.
export const DEMO_PASSWORD = 'secret_sauce';

export async function submitLogin(
  page: Page,
  username: string,
  password = DEMO_PASSWORD,
) {
  // The login controls establish readiness after the document response begins.
  await page.goto('/', { waitUntil: 'commit' });
  await page.getByRole('textbox', { name: 'Username', exact: true }).fill(username);
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
}

export async function loginAsStandardUser(page: Page) {
  await submitLogin(page, 'standard_user');
  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(page.getByTestId('inventory-list')).toBeVisible();
}

export async function fillCheckoutInformation(page: Page) {
  await page.getByRole('textbox', { name: 'First Name', exact: true }).fill('Demo');
  await page.getByRole('textbox', { name: 'Last Name', exact: true }).fill('Shopper');
  await page.getByRole('textbox', { name: 'Zip/Postal Code', exact: true }).fill('1634');
}
