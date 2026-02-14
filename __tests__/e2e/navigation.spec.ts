import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
    test('should navigate from Home to Foundations/Transformers @smoke', async ({ page }) => {
        await page.goto('/');

        // Click "Start Your Journey →"
        const startLink = page.getByRole('link', { name: 'Start Your Journey →' });
        await expect(startLink).toBeVisible();
        await startLink.click();

        // Verify URL - updated to new vision-aligned route (CR-004)
        await expect(page).toHaveURL(/\/foundations\/transformers/);
        // Page may not have content yet - just verify navigation occurred
    });

    test('should navigate to Models/Adaptation @smoke', async ({ page }) => {
        await page.goto('/models/adaptation');

        await expect(page).toHaveURL(/\/models\/adaptation/);
        await expect(page.getByTestId('adaptation-page')).toBeVisible();
        await expect(page.getByTestId('adaptation-hero')).toBeVisible();
        await expect(page.getByTestId('adaptation-strategy-comparison')).toBeVisible();
        await expect(page.getByTestId('adaptation-interaction')).toBeVisible();
        await expect(page.getByTestId('adaptation-strategy-selector')).toBeVisible();
        await expect(page.getByTestId('adaptation-interaction-output')).toBeVisible();
        await expect(page.getByTestId('adaptation-continuity-links')).toBeVisible();
    });

    test('should update adaptation output when strategy changes @critical', async ({ page }) => {
        await page.goto('/models/adaptation');

        const output = page.getByTestId('adaptation-interaction-output');
        await expect(output).toContainText('LoRA / PEFT');
        await expect(output).toContainText('Strong quality/cost balance');

        await page.getByTestId('strategy-button-full-finetuning').click();
        await expect(output).toContainText('Full Fine-Tuning');
        await expect(output).toContainText('Highest ceiling on domain alignment');
    });

    test('should expose continuity links for previous and next stages @smoke', async ({ page }) => {
        await page.goto('/models/adaptation');

        const transformersLink = page.getByTestId('adaptation-link-transformers');
        const contextLink = page.getByTestId('adaptation-link-context');

        await expect(transformersLink).toBeVisible();
        await expect(contextLink).toBeVisible();
        await expect(transformersLink).toHaveAttribute('href', '/foundations/transformers');
        await expect(contextLink).toHaveAttribute('href', '/context/engineering');
    });
});
