import { test } from '@playwright/test';
import { LoginPage } from '../../Pages/LoginPage';
import { BookingsPage } from '../../Pages/BookingsPage';

test('User can login successfully', async ({ page, context }) => {
  const bookingsPage = new BookingsPage(page);
  const loginPage = new LoginPage(page);

  await bookingsPage.goto();
  await loginPage.loginIfNeeded(context);
  await bookingsPage.assertPageLoaded();
});
