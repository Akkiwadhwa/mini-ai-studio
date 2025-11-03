import path from 'node:path';
import { expect, test } from '@playwright/test';

test.describe('Mini AI Studio workflow', () => {
  test('signup, login, generate, history restore', async ({ page }) => {
    const timestamp = Date.now();
    const email = `e2e-user-${timestamp}@test.com`;
    const password = 'secret123';
    const fixturePath = path.resolve(__dirname, '../../backend/tests/fixtures/tiny.png');

    await page.goto('/auth/signup');

    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Workspace')).toBeVisible();

    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page).toHaveURL(/auth\/login/);

    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText(/image upload/i)).toBeVisible();

    const uploadInput = page.locator('input[type="file"]');
    await uploadInput.setInputFiles(fixturePath);

    const promptField = page.getByLabel(/creative prompt/i);
    await promptField.fill('Bold outerwear editorial on city rooftop');

    await page.getByLabel(/select style/i).selectOption('Vintage');

    const generateButton = page.getByRole('button', { name: /generate look/i });
    await generateButton.click();

    const statusRegion = page.locator('div[aria-live="polite"]');
    await expect(statusRegion).toContainText(/generating image/i);

    await expect(page.getByText(/latest output/i)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/prompt:\s*bold outerwear editorial/i)).toBeVisible();
    await expect(statusRegion).toContainText(/ready/i);
    await expect(generateButton).toHaveAttribute('aria-busy', 'false');

    const historyList = page.getByRole('list', { name: /recent generations/i });
    await expect(historyList).toBeVisible();
    const historyItems = historyList.locator('li');
    await expect(historyItems).toHaveCount(1);

    await historyItems.first().click();

    await expect(promptField).toHaveValue(/bold outerwear editorial/i);
    await expect(page.getByLabel(/select style/i)).toHaveValue('Vintage');
  });
});
