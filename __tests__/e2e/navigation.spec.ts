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
        await expect(page.getByTestId('adaptation-chat')).toBeVisible();
        await expect(page.getByTestId('adaptation-chat-tab-full-finetuning')).toBeVisible();
        await expect(page.getByTestId('adaptation-chat-tab-lora-peft')).toBeVisible();
        await expect(page.getByTestId('adaptation-chat-tab-prompt-prefix')).toBeVisible();
        await expect(page.getByTestId('adaptation-chat-input')).toBeVisible();
        await expect(page.getByTestId('adaptation-chat-output')).toBeVisible();
        await expect(page.getByTestId('adaptation-continuity-links')).toBeVisible();
    });

    test('should update adaptation interface when strategy tab changes @critical', async ({ page }) => {
        await page.goto('/models/adaptation');

        const loraPeftTab = page.getByTestId('adaptation-chat-tab-lora-peft');
        const promptPrefixTab = page.getByTestId('adaptation-chat-tab-prompt-prefix');
        const output = page.getByTestId('adaptation-chat-output');

        await expect(loraPeftTab).toBeVisible();
        await expect(promptPrefixTab).toBeVisible();

        // Click LoRA / PEFT tab — terminal label must update to lora_peft_output.txt
        await loraPeftTab.click();
        await expect(output).toBeVisible();
        await expect(output).toContainText('lora_peft_output.txt');

        // Click Prompt / Prefix tab — terminal label must update to prompt_prefix_output.txt
        await promptPrefixTab.click();
        await expect(output).toContainText('prompt_prefix_output.txt');
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
