import { test, expect } from '@playwright/test';

test.describe('Transformer Page', () => {
    /**
     * Policy: Observability-based E2E tests (like intercepting /api/otel/trace) are 
     * kept rare to minimize flakiness and runtime cost. They are reserved for 
     * high-value integration validation only.
     */
    test('should generate text and send OTel traces @critical', async ({ page }) => {
        // Navigate to transformer page
        await page.goto('/foundations/transformers');

        // 1. Select a sample input
        const sampleButton = page.getByRole('button', { name: 'Speak, speak.' });
        await expect(sampleButton).toBeVisible();
        await sampleButton.click();

        // 2. Assert textarea contains the sample text
        const textarea = page.locator('textarea#chat');
        await expect(textarea).toHaveValue('Speak, speak.');

        // 3. Prepare to intercept OTel trace request
        // Note: OTel traces might be sent after a short delay
        const otelRequestPromise = page.waitForRequest(request =>
            request.url().includes('/api/otel/trace') && request.method() === 'POST'
        );

        // 4. Click the send button
        const sendButton = page.locator('button[type="submit"]');
        await sendButton.click();

        // 5. Wait for submit cycle to complete (loading -> idle)
        await expect(sendButton).toBeDisabled();
        await expect(sendButton).toBeEnabled({ timeout: 60000 });

        // 6. Verify generated output is shown in terminal response area
        const responseContainer = page.locator('div.whitespace-pre-wrap');
        await expect(responseContainer).toBeVisible();
        const responseText = await responseContainer.innerText();
        expect(responseText.length).toBeGreaterThan(0);
        expect(responseText).not.toContain('Very small model');

        // 7. Verify OTel trace was sent
        const otelRequest = await otelRequestPromise;
        expect(otelRequest).toBeDefined();
    });
});
