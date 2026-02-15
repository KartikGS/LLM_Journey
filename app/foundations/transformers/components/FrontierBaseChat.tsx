'use client';

import { FormEvent, useRef, useState } from 'react';
import { AlertCircle, Loader2, Play, Send, Sparkles, TriangleAlert } from 'lucide-react';
import { GlassCard } from '@/app/ui/components/GlassCard';

type FrontierStatus = 'idle' | 'live' | 'fallback' | 'error';
type FrontierRequestErrorCode = 'invalid_json' | 'invalid_prompt';

const DEFAULT_STATUS =
  'Ready. This endpoint returns either a live frontier-base response or a deterministic fallback.';

const sampleInputs = [
  'Explain in simple terms why eclipses happen.',
  'Compare SQL and NoSQL in 4 bullet points.',
  'Summarize the causes of World War I for a beginner.',
  'Write a short, friendly study plan for learning TypeScript.',
];

function toRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Unexpected client error while requesting the frontier model.';
}

export default function FrontierBaseChat() {
  const [prompt, setPrompt] = useState(sampleInputs[0]);
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<FrontierStatus>('idle');
  const [statusText, setStatusText] = useState(DEFAULT_STATUS);
  const [modelId, setModelId] = useState('frontier-base-unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGeneratedText, setHasGeneratedText] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function sampleInput(sample: string) {
    setPrompt(sample);
    setOutput('');
    setStatus('idle');
    setStatusText(DEFAULT_STATUS);
    setHasGeneratedText(false);
    textareaRef.current?.focus();
  }

  function handleInputChange(value: string) {
    setPrompt(value);
    if (hasGeneratedText && !isLoading) {
      setOutput('');
      setHasGeneratedText(false);
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

    setIsLoading(true);
    setStatus('idle');
    setStatusText('Loading: querying frontier base model...');
    setOutput('');
    setHasGeneratedText(false);

    try {
      const response = await fetch('/api/frontier/base-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmedPrompt }),
      });

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        setStatus('error');
        setStatusText('Frontier endpoint returned unreadable JSON.');
        setOutput('');
        setHasGeneratedText(false);
        return;
      }

      const payloadRecord = toRecord(payload);

      if (!response.ok) {
        const errorRecord = toRecord(payloadRecord?.error);
        const errorCode = (errorRecord?.code as FrontierRequestErrorCode | undefined) ?? 'invalid_prompt';
        const errorMessage =
          typeof errorRecord?.message === 'string' && errorRecord.message.trim().length > 0
            ? errorRecord.message
            : 'Frontier request validation failed.';

        setStatus('error');
        setStatusText(`Validation error (${errorCode}): ${errorMessage}`);
        setOutput('');
        setHasGeneratedText(false);
        return;
      }

      const outputText = typeof payloadRecord?.output === 'string' ? payloadRecord.output.trim() : '';
      if (outputText.length === 0) {
        setStatus('error');
        setStatusText('Frontier endpoint returned empty output.');
        setOutput('');
        setHasGeneratedText(false);
        return;
      }

      const metadataRecord = toRecord(payloadRecord?.metadata);
      const responseModelId =
        typeof metadataRecord?.modelId === 'string' && metadataRecord.modelId.trim().length > 0
          ? metadataRecord.modelId
          : 'frontier-base-unknown';
      setModelId(responseModelId);

      if (payloadRecord?.mode === 'live') {
        setStatus('live');
        setStatusText(`Mode: live. Response came from configured frontier base model (${responseModelId}).`);
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
      setStatusText('Unexpected response mode from frontier endpoint.');
      setOutput('');
      setHasGeneratedText(false);
    } catch (error) {
      setStatus('error');
      setStatusText(`Request failed: ${getErrorMessage(error)}`);
      setOutput('');
      setHasGeneratedText(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <GlassCard className="w-full flex flex-col lg:flex-row gap-6 md:gap-8 p-6 sm:p-8 overflow-visible">
      <div className="w-full lg:w-1/2 flex flex-col gap-4 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Frontier Transformer Playground</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Explore what larger base models can do with broader world knowledge</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Play className="w-3 h-3" />
            Example Prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleInputs.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => sampleInput(sample)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left max-w-full truncate"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        <div
          data-testid="frontier-status"
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

      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        <form data-testid="frontier-form" onSubmit={onSubmit} className="w-full relative group">
          <label htmlFor="frontier-input-textarea" className="sr-only">Frontier prompt</label>
          <div className="relative">
            <textarea
              ref={textareaRef}
              id="frontier-input-textarea"
              data-testid="frontier-input"
              rows={3}
              value={prompt}
              onChange={(event) => handleInputChange(event.target.value)}
              maxLength={2000}
              className="w-full p-4 pr-12 text-base rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all resize-none shadow-inner"
              placeholder="Ask a broad knowledge or synthesis question..."
              disabled={isLoading}
            />

            <div className="absolute top-1/2 -translate-y-1/2 right-2">
              <button
                data-testid="frontier-submit"
                type="submit"
                disabled={isLoading}
                className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-600/20"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center mt-1 px-1">
            <span className="text-xs text-gray-400">Profile: frontier base model (no assistant tuning)</span>
            <span className="text-xs text-gray-400 font-mono">{modelId}</span>
          </div>
        </form>

        <div
          data-testid="frontier-output"
          className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-900 shadow-inner min-h-[180px] flex flex-col"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            <span className="text-xs text-gray-400 font-mono ml-2">frontier_base_output.txt</span>
          </div>

          <div className="p-4 font-mono text-sm leading-relaxed overflow-y-auto flex-1">
            {isLoading ? (
              <span className="animate-pulse text-indigo-300 inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Querying frontier endpoint...
              </span>
            ) : hasGeneratedText ? (
              <div className={`${status === 'fallback' ? 'text-amber-300' : 'text-emerald-300'} whitespace-pre-wrap`}>
                <span className="text-gray-500 select-none mr-2">$</span>
                {output}
                <span className="animate-pulse inline-block w-2 h-4 bg-emerald-300 ml-1 align-middle" />
              </div>
            ) : (
              <div className="text-gray-500 space-y-2">
                <p className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> System ready.</p>
                <p className="opacity-70">Model type: Frontier base model</p>
                <p className="opacity-70">Data profile: Internet-scale pretraining</p>
                <p className="opacity-70">Note: Helpful, but not yet fully assistant-aligned.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
