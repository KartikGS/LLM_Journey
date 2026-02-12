// Note: generateClient is mocked here.
// Orchestration logic is covered in generateClient integration tests.

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BaseLLMChat from '@/app/foundations/transformers/components/BaseLLMChat';
import { generate } from '@/lib/llm/generateClient';

// Mock generateClient
jest.mock('@/lib/llm/generateClient', () => ({
    generate: jest.fn(),
}));

// Mock fetch for meta.json
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({
            dim: 64,
            n_layers: 4,
            n_heads: 4,
            n_kv_heads: 4,
            vocab_size: 100,
            max_seq_len: 32,
            block_size: 32,
            stoi: { ' ': 0 },
            itos: { '0': ' ' },
        }),
    })
) as jest.Mock;

describe('Integration: BaseLLMChat UI', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Helper to wait for component to be ready
    async function waitForReady() {
        const textarea = screen.getByRole('textbox', { name: /your message/i });
        await waitFor(() => expect(textarea).not.toBeDisabled());
        return textarea;
    }

    it('should load metadata and enable chat interactions', async () => {
        render(<BaseLLMChat />);

        await waitForReady();

        // Initial state content check
        expect(screen.getByText(/Try the Model/i)).toBeInTheDocument();
    });

    it('should handle user input, call generate, and display response', async () => {
        (generate as jest.Mock).mockResolvedValue("Generated Text Result");

        render(<BaseLLMChat />);

        const textarea = await waitForReady();

        fireEvent.change(textarea, { target: { value: 'Hello' } });

        const form = textarea.closest('form');
        if (!form) throw new Error('Form not found');
        fireEvent.submit(form);

        expect(generate).toHaveBeenCalledWith(expect.objectContaining({
            prompt: 'Hello',
            maxNewTokens: 200,
        }));

        expect(await screen.findByText("Generated Text Result")).toBeInTheDocument();
    });

    it('should display error message if generation fails', async () => {
        (generate as jest.Mock).mockRejectedValue(new Error('Generation Failed'));

        render(<BaseLLMChat />);

        const textarea = await waitForReady();

        fireEvent.change(textarea, { target: { value: 'Fail' } });
        const form = textarea.closest('form');
        fireEvent.submit(form!);

        expect(await screen.findByText(/Error: Generation Failed/i)).toBeInTheDocument();
    });

    it('should select sample input and setup for generation', async () => {
        render(<BaseLLMChat />);

        await waitForReady();

        const sampleBtn = screen.getByText(/Before we proceed/i);
        fireEvent.click(sampleBtn);

        const textarea = screen.getByRole('textbox', { name: /your message/i }) as HTMLTextAreaElement;
        expect(textarea.value).toContain('Before we proceed');

        expect(screen.queryByText("Generated Text Result")).not.toBeInTheDocument();
    });
});
