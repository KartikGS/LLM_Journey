import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
    test('should load and display key elements @critical', async ({ page }) => {
        await page.goto('/');

        // Assert title
        await expect(page).toHaveTitle(/LLM Journey/);

        // Assert h1 text
        const heading = page.getByRole('heading', { level: 1, name: 'LLM Journey' });
        await expect(heading).toBeVisible();

        // Assert 10 journey stage cards are present
        const stageCards = page.locator('div.grid > a');
        await expect(stageCards).toHaveCount(10);

        // Assert "Start Your Journey →" link exists and points to /transformer
        const startLink = page.getByRole('link', { name: 'Start Your Journey →' });
        await expect(startLink).toBeVisible();
        await expect(startLink).toHaveAttribute('href', '/transformer');
    });
});
