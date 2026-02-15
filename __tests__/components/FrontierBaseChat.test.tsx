import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import FrontierBaseChat from '@/app/foundations/transformers/components/FrontierBaseChat';

describe('Integration: FrontierBaseChat UI', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    it('should render stable frontier contracts', () => {
        render(<FrontierBaseChat />);

        expect(screen.getByTestId('frontier-form')).toBeInTheDocument();
        expect(screen.getByTestId('frontier-input')).toBeInTheDocument();
        expect(screen.getByTestId('frontier-submit')).toBeInTheDocument();
        expect(screen.getByTestId('frontier-status')).toBeInTheDocument();
        expect(screen.getByTestId('frontier-output')).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent(/Ready\./i);
    });

    it('should submit prompt and render live mode output', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                mode: 'live',
                output: 'Live frontier response',
                metadata: { modelId: 'frontier-base-test' },
            }),
        });

        render(<FrontierBaseChat />);

        fireEvent.click(screen.getByTestId('frontier-submit'));

        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/frontier/base-generate',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
        );

        const status = screen.getByTestId('frontier-status');
        await waitFor(() => expect(status).toHaveTextContent(/Mode: live\./i));
        expect(status).toHaveTextContent(/frontier-base-test/i);
        expect(screen.getByTestId('frontier-output')).toHaveTextContent(/Live frontier response/i);
    });

    it('should render fallback mode output and reason when backend returns fallback envelope', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                mode: 'fallback',
                output: 'Deterministic fallback output',
                reason: {
                    code: 'quota_limited',
                    message: 'Quota unavailable for live provider.',
                },
                metadata: { modelId: 'frontier-base-fallback' },
            }),
        });

        render(<FrontierBaseChat />);

        fireEvent.change(screen.getByTestId('frontier-input'), { target: { value: 'Explain transformers' } });
        fireEvent.click(screen.getByTestId('frontier-submit'));

        const status = screen.getByTestId('frontier-status');
        await waitFor(() => expect(status).toHaveTextContent(/Mode: fallback/i));
        expect(status).toHaveTextContent(/quota_limited/i);
        expect(status).toHaveTextContent(/Quota unavailable for live provider\./i);
        expect(screen.getByTestId('frontier-output')).toHaveTextContent(/Deterministic fallback output/i);
    });

    it('should render validation error from backend 400 payload', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({
                error: {
                    code: 'invalid_prompt',
                    message: 'prompt must be a non-empty string up to 2000 characters.',
                },
            }),
        });

        render(<FrontierBaseChat />);

        fireEvent.change(screen.getByTestId('frontier-input'), { target: { value: 'bad input' } });
        fireEvent.click(screen.getByTestId('frontier-submit'));

        const status = screen.getByTestId('frontier-status');
        await waitFor(() =>
            expect(status).toHaveTextContent(
                /Validation error \(invalid_prompt\): prompt must be a non-empty string up to 2000 characters\./i
            )
        );
    });

    it('should show client validation error and skip request when prompt is empty', async () => {
        render(<FrontierBaseChat />);

        fireEvent.change(screen.getByTestId('frontier-input'), { target: { value: '   ' } });
        fireEvent.click(screen.getByTestId('frontier-submit'));

        expect(global.fetch).not.toHaveBeenCalled();
        expect(screen.getByTestId('frontier-status')).toHaveTextContent(
            /Validation error \(invalid_prompt\): Prompt cannot be empty\./i
        );
    });
});
