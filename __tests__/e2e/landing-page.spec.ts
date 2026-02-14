import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
    test('should load and display key elements @critical', async ({ page }) => {
        await page.goto('/');

        // Assert title
        await expect(page).toHaveTitle(/LLM Journey/);

        // Assert h1 text
        const heading = page.getByRole('heading', { level: 1, name: 'LLM Journey' });
        await expect(heading).toBeVisible();

        // Assert "Start Your Journey →" CTA points to canonical route
        const startLink = page.getByRole('link', { name: 'Start Your Journey →' });
        await expect(startLink).toBeVisible();
        await expect(startLink).toHaveAttribute('href', '/foundations/transformers');

        // Assert key stage links exist via stable href contracts (no grid structure dependency)
        await expect(page.locator('a[href="/models/adaptation"]').first()).toBeVisible();
        await expect(page.locator('a[href="/context/engineering"]').first()).toBeVisible();
        await expect(page.locator('a[href="/ops/deployment"]').first()).toBeVisible();
    });
});
