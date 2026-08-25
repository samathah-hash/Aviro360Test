import { Page, expect } from '@playwright/test';
import { CustomersLocators } from '../Locators/customerLocators';

function randomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';

    return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');
}

export class CustomerPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto(CustomersLocators.url);
        await this.page.waitForLoadState('networkidle');
    }

    // =========================================================
    // CREATE / INVITE CUSTOMER
    // =========================================================

    async inviteCustomer(): Promise<string> {
        await this.page
            .getByRole('button', {
                name: CustomersLocators.inviteCustomerButton
            })
            .click();

        const companyName = 'Test' + randomString(6);
        const contactName =
            randomString(5) + ' ' + randomString(5);
        const email = `${randomString(8)}@gmail.com`;
        const phone = randomString(8);
        const address = randomString(10) + ' Street';

        // Inputs inside the drawer
        const drawer = this.page.locator(
            CustomersLocators.drawerContainer
        );

        const inputs = drawer.locator('input');

        // Company name
        await inputs.nth(0).fill(companyName);

        // Primary contact name
        await inputs.nth(1).fill(contactName);

        // Primary contact email
        await inputs.nth(2).fill(email);

        // Phone
        await inputs.nth(3).fill(phone);

        // Primary business address
        await inputs.nth(4).fill(address);

        // Open Locations
        await this.page
            .getByRole('button', {
                name: CustomersLocators.locationsButton
            })
            .click();

        // Select first location
        await this.page
            .locator(CustomersLocators.locationOption)
            .first()
            .click();

        // Close location popup
        await this.page
            .locator(CustomersLocators.popoverBackdrop)
            .click();

        // Submit / Invite Customer
        const submitBtn = this.page.locator(
            CustomersLocators.submitButton
        );

        await submitBtn.scrollIntoViewIfNeeded();

        await expect(submitBtn).toBeEnabled();

        await submitBtn.click();

        return companyName;
    }

    // =========================================================
    // VALIDATION 1
    // COMPANY NAME IS MANDATORY
    // =========================================================

    async verifyCompanyNameIsMandatory() {
        // Open Invite Customer drawer
        await this.page
            .getByRole('button', {
                name: CustomersLocators.inviteCustomerButton
            })
            .click();

        const drawer = this.page.locator(
            CustomersLocators.drawerContainer
        );

        const inputs = drawer.locator('input');

        // Do NOT enter Company Name.

        // Select a location so that Location is not the reason
        // for the button being disabled.
        await this.page
            .getByRole('button', {
                name: CustomersLocators.locationsButton
            })
            .click();

        await this.page
            .locator(CustomersLocators.locationOption)
            .first()
            .click();

        // Close location popup
        await this.page
            .locator(CustomersLocators.popoverBackdrop)
            .click();

        // Invite button must remain disabled
        const submitBtn = this.page.locator(
            CustomersLocators.submitButton
        );

        await expect(submitBtn).toBeDisabled();
    }

    // =========================================================
    // VALIDATION 2
    // LOCATION IS MANDATORY
    // =========================================================

    async verifyLocationIsMandatory() {
        // Open Invite Customer drawer
        await this.page
            .getByRole('button', {
                name: CustomersLocators.inviteCustomerButton
            })
            .click();

        const drawer = this.page.locator(
            CustomersLocators.drawerContainer
        );

        const inputs = drawer.locator('input');

        // Enter Company Name
        await inputs
            .nth(0)
            .fill('Test Company');

        // Do NOT select any location.

        // Invite button must remain disabled
        const submitBtn = this.page.locator(
            CustomersLocators.submitButton
        );

        await expect(submitBtn).toBeDisabled();
    }

    // =========================================================
    // VERIFY INVITATION TOAST
    // =========================================================

    async getInvitedCustomerName(): Promise<string> {
        const toast = this.page.locator(
            'text=/has been invited/'
        );

        await expect(toast).toBeVisible({
            timeout: 15000
        });

        const text =
            (await toast.textContent()) ?? '';

        // Toast format:
        // "TestCompany has been invited"
        return text
            .replace(/\s*has been invited.*/, '')
            .trim();
    }

    async dismissInviteToast() {
        const toast = this.page.locator(
            'text=/has been invited/'
        );

        await toast
            .locator('xpath=ancestor::div[2]')
            .getByRole('button')
            .click();

        await expect(toast).toBeHidden();
    }

    // =========================================================
    // SEARCH CUSTOMER
    // =========================================================

    async searchCustomer(name: string) {
        await this.page
            .getByPlaceholder(
                CustomersLocators.searchPlaceholder
            )
            .fill(name);

        await this.page.waitForLoadState(
            'networkidle'
        );
    }

    // =========================================================
    // VERIFY CUSTOMER CREATED
    // =========================================================

    async assertCustomerCreated(name: string) {
        await expect(
            this.page.getByText(name)
        ).toHaveCount(1, {
            timeout: 15000
        });
    }

    // =========================================================
    // VERIFY CUSTOMER STATUS
    // =========================================================

    async assertCustomerInviteSent() {
        await expect(
            this.page.getByText('Invite Sent', {
                exact: true
            })
        ).toBeVisible({
            timeout: 15000
        });
    }
}