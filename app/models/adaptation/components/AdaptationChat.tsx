'use client';

import { FormEvent, useRef, useState } from 'react';
import { AlertCircle, BookOpen, Loader2, Play, Send, Sparkles, TriangleAlert, Zap } from 'lucide-react';
import { GlassCard } from '@/app/ui/components/GlassCard';
import { type StrategyId } from './strategy-data';

type AdaptationStatus = 'idle' | 'live' | 'fallback' | 'error';
type AdaptationRequestErrorCode = 'invalid_json' | 'invalid_prompt';

const DEFAULT_STATUS = 'Ready. Select a tab and type a prompt to see how this adaptation strategy responds.';

type TabConfig = {
  id: StrategyId;
  label: string;
  testId: string;
  modelId: string;
  origin: string;
  adaptation: string;
  purpose: string;
  callout?: string;
  examplePrompts: string[];
  terminalLabel: string;
};

const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'full-finetuning',
    label: 'Full Fine-Tuning',
    testId: 'adaptation-chat-tab-full-finetuning',
    modelId: 'meta-llama/Meta-Llama-3-8B-Instruct',
    origin: 'Meta AI — hundreds of engineers, multi-million GPU-hour training run',
    adaptation: 'All 8B parameters retrained on instruction-following + RLHF data',
    purpose: 'General-purpose assistant; the high-quality, high-cost benchmark of adaptation',
    examplePrompts: [
      'Explain the difference between supervised and unsupervised learning.',
      'Write a concise summary of the transformer architecture.',
      'What are three practical uses for fine-tuned language models?',
    ],
    terminalLabel: 'full_finetuning_output.txt',
  },
  {
    id: 'lora-peft',
    label: 'LoRA / PEFT',
    testId: 'adaptation-chat-tab-lora-peft',
    modelId: 'swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA',
    origin: 'University of Bari Aldo Moro (SWAP-Uniba research group) — small academic team',
    adaptation: 'LoRA + DPO on top of Meta-Llama-3-8B-Instruct, targeting Italian language tasks',
    purpose: 'Italian-language specialist — demonstrates how a small team can produce a domain expert at a fraction of full fine-tune cost',
    callout: 'This model was fine-tuned primarily for Italian. Try asking in Italian for best results.',
    examplePrompts: [
      'Spiega la differenza tra apprendimento supervisionato e non supervisionato.',
      'Cos\'è il LoRA e perché è efficiente?',
      'Scrivi un breve riassunto dell\'architettura transformer.',
    ],
    terminalLabel: 'lora_peft_output.txt',
  },
  {
    id: 'prompt-prefix',
    label: 'Prompt / Prefix Tuning',
    testId: 'adaptation-chat-tab-prompt-prefix',
    modelId: 'meta-llama/Meta-Llama-3-8B',
    origin: 'Meta AI',
    adaptation: 'Zero parameter changes. A system prompt is prepended to every query server-side.',
    purpose: 'Shows what prompt steering can and cannot achieve on a non-instruct base model. Response reliability is lower — this is intentional and educational.',
    examplePrompts: [
      'Describe what a language model is in simple terms.',
      'What is the difference between a base model and an instruct model?',
      'Explain why prompt engineering has limits.',
    ],
    terminalLabel: 'prompt_prefix_output.txt',
  },
];

function toRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return 'Unexpected client error while requesting the adaptation model.';
}

export function AdaptationChat() {
  const [activeTab, setActiveTab] = useState<StrategyId>('full-finetuning');
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<AdaptationStatus>('idle');
  const [statusText, setStatusText] = useState(DEFAULT_STATUS);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasFirstToken, setHasFirstToken] = useState(false);
  const [hasGeneratedText, setHasGeneratedText] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConfig = TAB_CONFIGS.find((t) => t.id === activeTab) ?? TAB_CONFIGS[0];

  function handleTabChange(tabId: StrategyId) {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
    setPrompt('');
    setOutput('');
    setStatus('idle');
    setStatusText(DEFAULT_STATUS);
    setHasGeneratedText(false);
    setHasFirstToken(false);
  }

  function handleSamplePrompt(sample: string) {
    setPrompt(sample);
    setOutput('');
    setStatus('idle');
    setStatusText(DEFAULT_STATUS);
    setHasGeneratedText(false);
    setHasFirstToken(false);
    textareaRef.current?.focus();
  }

  function handleInputChange(value: string) {
    setPrompt(value);
    if ((hasGeneratedText || hasFirstToken) && !isStreaming) {
      setOutput('');
      setHasGeneratedText(false);
      setHasFirstToken(false);
      setStatus('idle');
      setStatusText(DEFAULT_STATUS);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length === 0) {
      setStatus('error');
      setStatusText('Validation error (invalid_prompt): Prompt cannot be empty.');
      setOutput('');
      setHasGeneratedText(false);
      return;
    }

    async function readSseStream(response: Response): Promise<void> {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      // For statusText finalization on done — capture modelId locally
      let streamModelId = 'model-unknown';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          let currentEvent = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              let data: Record<string, unknown> = {};
              try {
                data = JSON.parse(dataStr);
              } catch {
                continue;
              }

              if (currentEvent === 'start') {
                const metadata = toRecord(data.metadata);
                const mid = typeof metadata?.modelId === 'string' ? metadata.modelId : 'model-unknown';
                streamModelId = mid;
                // mode is always 'live' for SSE — no status text change yet
              } else if (currentEvent === 'token') {
                const text = typeof data.text === 'string' ? data.text : '';
                if (text) {
                  setHasFirstToken(true);
                  setOutput((prev) => prev + text);
                }
              } else if (currentEvent === 'done') {
                setStatus('live');
                setStatusText(`Mode: live. Response from ${streamModelId}.`);
                return;
              } else if (currentEvent === 'error') {
                const message =
                  typeof data.message === 'string' ? data.message : 'Streaming was interrupted.';
                setStatus('error');
                setStatusText(message);
                setOutput('');
                setHasFirstToken(false);
                return;
              }
              currentEvent = '';
            }
          }
        }
      } finally {
        try {
          reader.releaseLock();
        } catch {
          /* already released */
        }
      }
    }

    setIsStreaming(true);
    setHasFirstToken(false);
    setStatus('idle');
    setStatusText(`Loading: querying ${activeConfig.label} model...`);
    setOutput('');
    setHasGeneratedText(false);

    try {
      const response = await fetch('/api/adaptation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmedPrompt, strategy: activeTab }),
      });

      if (!response.ok) {
        let payload: unknown;
        try {
          payload = await response.json();
        } catch {
          setStatus('error');
          setStatusText('Adaptation endpoint returned unreadable JSON.');
          setOutput('');
          setHasGeneratedText(false);
          return;
        }

        const payloadRecord = toRecord(payload);
        const errorRecord = toRecord(payloadRecord?.error);
        const errorCode =
          (errorRecord?.code as AdaptationRequestErrorCode | undefined) ?? 'invalid_prompt';
        const errorMessage =
          typeof errorRecord?.message === 'string' && errorRecord.message.trim().length > 0
            ? errorRecord.message
            : 'Adaptation request validation failed.';

        setStatus('error');
        setStatusText(`Validation error (${errorCode}): ${errorMessage}`);
        setOutput('');
        setHasGeneratedText(false);
        return;
      }

      const contentType = response.headers.get('content-type') ?? '';

      if (!contentType.includes('text/event-stream')) {
        let payload: unknown;
        try {
          payload = await response.json();
        } catch {
          setStatus('error');
          setStatusText('Adaptation endpoint returned unreadable JSON.');
          setOutput('');
          setHasGeneratedText(false);
          return;
        }

        const payloadRecord = toRecord(payload);
        const outputText =
          typeof payloadRecord?.output === 'string' ? payloadRecord.output.trim() : '';
        if (outputText.length === 0) {
          setStatus('error');
          setStatusText('Adaptation endpoint returned empty output.');
          setOutput('');
          setHasGeneratedText(false);
          return;
        }

        const metadataRecord = toRecord(payloadRecord?.metadata);
        const responseModelId =
          typeof metadataRecord?.modelId === 'string' && metadataRecord.modelId.trim().length > 0
            ? metadataRecord.modelId
            : activeConfig.modelId;

        if (payloadRecord?.mode === 'live') {
          setStatus('live');
          setStatusText(`Mode: live. Response from ${responseModelId}.`);
          setOutput(outputText);
          setHasGeneratedText(true);
          return;
        }

        if (payloadRecord?.mode === 'fallback') {
          const reasonRecord = toRecord(payloadRecord.reason);
          const reasonCode =
            typeof reasonRecord?.code === 'string' && reasonRecord.code.trim().length > 0
              ? reasonRecord.code
              : 'unknown_fallback';
          const reasonMessage =
            typeof reasonRecord?.message === 'string' && reasonRecord.message.trim().length > 0
              ? reasonRecord.message
              : 'Fallback output returned without provider details.';

          setStatus('fallback');
          setStatusText(`Mode: fallback (${reasonCode}). ${reasonMessage}`);
          setOutput(outputText);
          setHasGeneratedText(true);
          return;
        }

        setStatus('error');
        setStatusText('Unexpected response mode from adaptation endpoint.');
        setOutput('');
        setHasGeneratedText(false);
        return;
      }

      // SSE streaming path
      await readSseStream(response);
    } catch (error) {
      setStatus('error');
      setStatusText(`Request failed: ${getErrorMessage(error)}`);
      setOutput('');
      setHasGeneratedText(false);
      setHasFirstToken(false);
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <section data-testid="adaptation-chat" className="flex flex-col gap-4">
      {/* Tab selector */}
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Adaptation strategy tabs"
      >
        {TAB_CONFIGS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-testid={tab.testId}
              onClick={() => handleTabChange(tab.id)}
              className={[
                'rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                  : 'border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.02] text-gray-700 dark:text-gray-300 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Split panel */}
      <GlassCard className="w-full flex flex-col lg:flex-row gap-6 md:gap-8 p-6 sm:p-8 overflow-visible">
        {/* Left panel: model info + example prompts + status */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 sm:gap-6">
          {/* Model info card */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg shrink-0">
              <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                {activeConfig.label}
              </h2>
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
                {activeConfig.modelId}
              </p>
            </div>
          </div>

          {/* Model detail fields */}
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" />
                Origin
              </span>
              <p className="text-gray-700 dark:text-gray-300">{activeConfig.origin}</p>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3 h-3" />
                Adaptation
              </span>
              <p className="text-gray-700 dark:text-gray-300">{activeConfig.adaptation}</p>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                Purpose
              </span>
              <p className="text-gray-700 dark:text-gray-300">{activeConfig.purpose}</p>
            </div>
          </div>

          {/* Callout (LoRA/PEFT Italian notice) */}
          {activeConfig.callout && (
            <div className="rounded-lg border border-amber-400/30 bg-amber-50/80 dark:bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{activeConfig.callout}</span>
            </div>
          )}

          {/* Example prompts */}
          <div className="flex flex-col gap-3">
            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Play className="w-3 h-3" />
              Example Prompts
            </p>
            <div className="flex flex-wrap gap-2">
              {activeConfig.examplePrompts.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => handleSamplePrompt(sample)}
                  disabled={isStreaming}
                  className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Status indicator */}
          <div
            data-testid="adaptation-chat-status"
            role="status"
            aria-live="polite"
            className="rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] p-3 text-sm text-gray-700 dark:text-gray-300"
          >
            {status === 'fallback' ? (
              <span className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <TriangleAlert className="w-4 h-4" />
                {statusText}
              </span>
            ) : status === 'error' ? (
              <span className="inline-flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4" />
                {statusText}
              </span>
            ) : status === 'live' ? (
              <span className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <Sparkles className="w-4 h-4" />
                {statusText}
              </span>
            ) : (
              <span>{statusText}</span>
            )}
          </div>
        </div>

        {/* Right panel: input form + terminal output */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <form data-testid="adaptation-chat-form" onSubmit={onSubmit} className="w-full relative">
            <label htmlFor="adaptation-chat-textarea" className="sr-only">
              Adaptation prompt
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                id="adaptation-chat-textarea"
                data-testid="adaptation-chat-input"
                rows={3}
                value={prompt}
                onChange={(event) => handleInputChange(event.target.value)}
                maxLength={2000}
                className="w-full p-4 pr-12 text-base rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all resize-none shadow-inner"
                placeholder="Type a prompt or click an example above..."
                disabled={isStreaming}
              />
              <div className="absolute top-1/2 -translate-y-1/2 right-2">
                <button
                  data-testid="adaptation-chat-submit"
                  type="submit"
                  disabled={isStreaming}
                  className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-600/20"
                >
                  {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end items-center mt-1 px-1">
              <span className="text-xs text-gray-400 font-mono">{activeConfig.modelId}</span>
            </div>
          </form>

          {/* Terminal output */}
          <div
            data-testid="adaptation-chat-output"
            className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-900 shadow-inner min-h-[180px] flex flex-col"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              </div>
              <span className="text-xs text-gray-400 font-mono ml-2">{activeConfig.terminalLabel}</span>
            </div>

            <div className="p-4 font-mono text-sm leading-relaxed overflow-y-auto flex-1">
              {isStreaming && !hasFirstToken ? (
                <span className="animate-pulse text-indigo-300 inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Querying adaptation endpoint...
                </span>
              ) : hasGeneratedText || hasFirstToken ? (
                <div
                  className={`${status === 'fallback' ? 'text-amber-300' : 'text-emerald-300'
                    } whitespace-pre-wrap`}
                >
                  <span className="text-gray-500 select-none mr-2">$</span>
                  {output}
                  {isStreaming && hasFirstToken && (
                    <span className="animate-pulse inline-block w-2 h-4 bg-emerald-300 ml-1 align-middle" />
                  )}
                </div>
              ) : (
                <div className="text-gray-500 space-y-2">
                  <p className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> System ready.
                  </p>
                  <p className="opacity-70">Strategy: {activeConfig.label}</p>
                  <p className="opacity-70">Model: {activeConfig.modelId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
