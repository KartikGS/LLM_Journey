import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
    test('should navigate from Home to Transformer @smoke', async ({ page }) => {
        await page.goto('/');

        // Click "Start Your Journey →"
        const startLink = page.getByRole('link', { name: 'Start Your Journey →' });
        await expect(startLink).toBeVisible();
        await startLink.click();

        // Verify URL
        await expect(page).toHaveURL(/\/transformer/);
        await expect(page.getByText('Interactive Decoder-Only Transformer')).toBeVisible();
    });

    test('should navigate from Transformer to LLM @smoke', async ({ page }) => {
        await page.goto('/transformer');

        // Click "Explore LLM →"
        const nextLink = page.getByRole('link', { name: 'Explore LLM →' });
        await expect(nextLink).toBeVisible();
        await nextLink.click();

        // Verify URL
        await expect(page).toHaveURL(/\/llm/);

        // Since the LLM page might be under development, we just check if we landed on the path.
        // If it 404s, this test still passes the URL check, but we could check for a 404 header if desired.
        // For now, adhering to the plan which just says "Verify navigation".
    });
});
