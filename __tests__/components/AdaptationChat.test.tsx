import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdaptationChat } from '@/app/models/adaptation/components/AdaptationChat';

describe('AdaptationChat — tab locking behavior', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('strategy tabs are enabled when not streaming', () => {
    render(<AdaptationChat />);

    const fullFinetuningTab = screen.getByTestId('adaptation-chat-tab-full-finetuning');
    const loraPeftTab = screen.getByTestId('adaptation-chat-tab-lora-peft');
    const promptPrefixTab = screen.getByTestId('adaptation-chat-tab-prompt-prefix');

    expect(fullFinetuningTab).not.toBeDisabled();
    expect(loraPeftTab).not.toBeDisabled();
    expect(promptPrefixTab).not.toBeDisabled();
  });

  it('strategy tabs are disabled while streaming is active', async () => {
    global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;

    render(<AdaptationChat />);

    const input = screen.getByTestId('adaptation-chat-input');
    const submit = screen.getByTestId('adaptation-chat-submit');

    fireEvent.change(input, { target: { value: 'Explain supervised learning.' } });
    fireEvent.click(submit);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    const fullFinetuningTab = screen.getByTestId('adaptation-chat-tab-full-finetuning');
    const loraPeftTab = screen.getByTestId('adaptation-chat-tab-lora-peft');
    const promptPrefixTab = screen.getByTestId('adaptation-chat-tab-prompt-prefix');

    expect(fullFinetuningTab).toBeDisabled();
    expect(loraPeftTab).toBeDisabled();
    expect(promptPrefixTab).toBeDisabled();
  });

  it('clicking a tab while streaming does not change active strategy', async () => {
    global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;

    render(<AdaptationChat />);

    const input = screen.getByTestId('adaptation-chat-input');
    const submit = screen.getByTestId('adaptation-chat-submit');

    // Trigger streaming state
    fireEvent.change(input, { target: { value: 'Explain supervised learning.' } });
    fireEvent.click(submit);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    // The first tab (full-finetuning) should be active by default (aria-selected="true")
    const fullFinetuningTab = screen.getByTestId('adaptation-chat-tab-full-finetuning');
    const loraPeftTab = screen.getByTestId('adaptation-chat-tab-lora-peft');

    expect(fullFinetuningTab).toHaveAttribute('aria-selected', 'true');
    expect(loraPeftTab).toHaveAttribute('aria-selected', 'false');

    // Attempt to click a non-active tab while streaming
    fireEvent.click(loraPeftTab);

    // Active tab selector should not have changed
    expect(fullFinetuningTab).toHaveAttribute('aria-selected', 'true');
    expect(loraPeftTab).toHaveAttribute('aria-selected', 'false');
  });
});
