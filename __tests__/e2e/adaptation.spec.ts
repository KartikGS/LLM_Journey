import { test, expect } from '@playwright/test';

test.describe('Adaptation Page', () => {
    test('should expose static adaptation contracts @critical', async ({ page }) => {
        await page.goto('/models/adaptation');

        await expect(page.getByTestId('adaptation-chat')).toBeVisible();
        await expect(page.getByTestId('adaptation-chat-tab-full-finetuning')).toBeVisible();
        await expect(page.getByTestId('adaptation-chat-tab-lora-peft')).toBeVisible();
        await expect(page.getByTestId('adaptation-chat-tab-prompt-prefix')).toBeVisible();
        await expect(page.getByTestId('adaptation-chat-form')).toBeVisible();
        await expect(page.getByTestId('adaptation-chat-input')).toBeVisible();
        await expect(page.getByTestId('adaptation-chat-submit')).toBeVisible();
        await expect(page.getByTestId('adaptation-chat-output')).toBeVisible();
        await expect(page.getByTestId('adaptation-chat-status')).toBeVisible();
        await expect(page.getByTestId('adaptation-why-adapt')).toBeVisible();
        await expect(page.getByTestId('adaptation-limitations')).toBeVisible();
    });

    test('should complete adaptation submit cycle (full-finetuning) @critical', async ({ page }) => {
        await page.goto('/models/adaptation');

        const submitButton = page.getByTestId('adaptation-chat-submit');
        const inputField = page.getByTestId('adaptation-chat-input');
        const statusArea = page.getByTestId('adaptation-chat-status');
        const outputArea = page.getByTestId('adaptation-chat-output');

        await page.getByTestId('adaptation-chat-tab-full-finetuning').click();
        await inputField.fill('Explain supervised learning in one sentence.');
        await submitButton.click();

        await expect(submitButton).toBeDisabled();
        await expect(submitButton).toBeEnabled({ timeout: 30000 });
        await expect(statusArea).toContainText(/Mode: (live|fallback)/i);
        await expect(outputArea).toContainText('$');
    });
});
