import { test, expect } from './support/telemetry';
import { submitLogin } from './support/flows';

test('invalid credentials show an error and do not open inventory', async ({ page }) => {
  await submitLogin(page, 'standard_user', 'incorrect-demo-password');

  await expect(page.getByRole('alert')).toContainText(
    'Username and password do not match any user in this service',
  );
  await expect(page).toHaveURL('https://www.saucedemo.com/');
  await expect(page.getByTestId('inventory-list')).toHaveCount(0);
});

test('locked-out account is denied access with the published password', async ({ page }) => {
  await submitLogin(page, 'locked_out_user');

  await expect(page.getByRole('alert')).toContainText('Sorry, this user has been locked out.');
  await expect(page).toHaveURL('https://www.saucedemo.com/');
  await expect(page.getByTestId('inventory-list')).toHaveCount(0);
});
