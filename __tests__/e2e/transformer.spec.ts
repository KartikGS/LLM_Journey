import { test, expect } from '@playwright/test';

test.describe('Transformer Page', () => {
    test('should expose CR-012 narrative and frontier contracts @critical', async ({ page }) => {
        await page.goto('/foundations/transformers');

        await expect(page.getByTestId('transformers-hero')).toBeVisible();
        await expect(page.getByTestId('transformers-how')).toBeVisible();
        await expect(page.getByTestId('transformers-try')).toBeVisible();
        await expect(page.getByTestId('transformers-frontier')).toBeVisible();
        await expect(page.getByTestId('transformers-issues')).toBeVisible();
        await expect(page.getByTestId('transformers-next-stage')).toBeVisible();
        await expect(page.getByTestId('transformers-comparison')).toBeVisible();

        await expect(page.getByTestId('frontier-form')).toBeVisible();
        await expect(page.getByTestId('frontier-input')).toBeVisible();
        await expect(page.getByTestId('frontier-submit')).toBeVisible();
        await expect(page.getByTestId('frontier-status')).toBeVisible();
        await expect(page.getByTestId('frontier-output')).toBeVisible();

        const continuityLinks = page.getByTestId('transformers-continuity-links');
        await expect(continuityLinks).toBeVisible();
        const adaptationLink = page.getByTestId('transformers-link-adaptation');
        await expect(adaptationLink).toBeVisible();
        await expect(adaptationLink).toHaveAttribute('href', '/models/adaptation');

    });

    test('should keep tiny transformer interaction signal functional @critical', async ({ page }) => {
        await page.goto('/foundations/transformers');

        const sampleButton = page.getByRole('button', { name: 'Speak, speak.' });
        await expect(sampleButton).toBeVisible();
        await sampleButton.click();

        const textarea = page.locator('textarea#chat');
        await expect(textarea).toHaveValue('Speak, speak.');

        const sendButton = page.locator('form:has(#chat) button[type="submit"]');
        await sendButton.click();

        await expect(sendButton).toBeDisabled();
        await expect(sendButton).toBeEnabled({ timeout: 60000 });

        const responseContainer = page.locator('div.whitespace-pre-wrap').first();
        await expect(responseContainer).toBeVisible();
        const responseText = await responseContainer.innerText();
        expect(responseText.length).toBeGreaterThan(0);
    });

    test('should complete frontier submit cycle and show output/status @critical', async ({ page }) => {
        await page.goto('/foundations/transformers');

        const frontierInput = page.getByTestId('frontier-input');
        const frontierSubmit = page.getByTestId('frontier-submit');
        const frontierStatus = page.getByTestId('frontier-status');
        const frontierOutput = page.getByTestId('frontier-output');

        await frontierInput.fill('Compare SQL and NoSQL in 4 bullet points.');
        await frontierSubmit.click();

        await expect(frontierSubmit).toBeDisabled();
        await expect(frontierSubmit).toBeEnabled({ timeout: 15000 });
        await expect(frontierStatus).toContainText(/Mode: (live|fallback)/i);
        await expect(frontierOutput).toContainText('$');
    });
});
