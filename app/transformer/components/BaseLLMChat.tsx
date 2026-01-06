'use client'

import { FormEvent, useState, useRef, useEffect } from "react";
import { generate } from "@/lib/llm/generateClient";
import { ModelMeta } from "@/types/llm";
import { loggerClient } from "@/lib/observability/logger/client";
import { metricsRegistry } from "@/lib/observability/metrics";

const sampleInputs = [
    "Before we proceed any further, hear me speak.",
    "You are all resolved rather to die than to famish?",
    "First, you know Caius Marcius is chief enemy to the people.",
    "Let us kill him, and we'll have corn at our own price.",
    "We are accounted poor citizens, the patricians good.",
    "What authority surfeits on would relieve us: if they",
    "Speak, speak.",
    "No more talking on't; let it be done: away, away!"
];

export default function BaseLLMChat() {
    const [response, setResponse] = useState("Model Response ...");
    const [isLoading, setIsLoading] = useState(false);
    const [meta, setMeta] = useState<ModelMeta | null>(null);
    const [hasGeneratedText, setHasGeneratedText] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        // Load meta.json on client side
        fetch('/tokenizer/meta.json')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Failed to load metadata: ${res.status} ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => {
                setMeta(data);
                loggerClient.debug('Model metadata loaded successfully', {
                    component: 'BaseLLMChat',
                    blockSize: data.block_size,
                    vocabSize: Object.keys(data.itos).length,
                });
            })
            .catch(err => {
                loggerClient.error('Failed to load meta.json', err, {
                    component: 'BaseLLMChat',
                    url: '/tokenizer/meta.json',
                    action: 'metadata_load',
                });
                setResponse("Error loading model metadata");
            });
    }, []);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!meta) {
            setResponse("Model metadata not loaded yet...");
            loggerClient.warn('Generation attempted before metadata loaded', {
                component: 'BaseLLMChat',
                action: 'submit_form',
            });
            return;
        }

        setIsLoading(true);
        setHasGeneratedText(false);

        const formData = new FormData(event.currentTarget);
        const inputText = formData.get('chat') as string;

        if (!inputText || inputText.trim() === '') {
            setIsLoading(false);
            return;
        }

        const startTime = Date.now();
        const inputLength = inputText.length;

        // Track user interaction
        loggerClient.debug('Generation started', {
            component: 'BaseLLMChat',
            action: 'generate_text',
            inputLength,
            maxNewTokens: 200,
        });

        try {
            const result = await generate({
                meta,
                prompt: inputText,
                maxNewTokens: 200,
            });

            const duration = Date.now() - startTime;
            const outputLength = result?.length || 0;

            setResponse(result || "Error generating text");
            setHasGeneratedText(true);

            loggerClient.debug('Generation completed successfully', {
                component: 'BaseLLMChat',
                action: 'generate_text',
                inputLength,
                outputLength,
                duration,
                status: 'success',
            });
        } catch (error) {
            const duration = Date.now() - startTime;

            loggerClient.error('Generation error', error, {
                component: 'BaseLLMChat',
                action: 'generate_text',
                inputLength,
                duration,
                status: 'error',
                errorType: error instanceof Error ? error.name : 'Unknown',
                errorMessage: error instanceof Error ? error.message : String(error),
            });

            setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setHasGeneratedText(true);
        } finally {
            setIsLoading(false);
        }
    }

    function sampleInput(sample: string) {
        if (textareaRef.current) {
            // Truncate to 32 characters if needed
            const truncated = sample.substring(0, 32);
            textareaRef.current.value = truncated;
            textareaRef.current.focus();
            // Clear output when sample input is selected
            setResponse("");
            setHasGeneratedText(false);

            loggerClient.debug('Sample input selected', {
                component: 'BaseLLMChat',
                action: 'select_sample',
                sampleLength: sample.length,
                truncatedLength: truncated.length,
            });
        }
    }

    function handleInputChange() {
        // Clear output when new text is entered
        if (hasGeneratedText && !isLoading) {
            setResponse("");
            setHasGeneratedText(false);
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 w-full justify-around items-start lg:items-center">
            <div className="w-full lg:w-1/2 flex flex-col gap-3 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-center lg:text-left">Try the Model</h2>

                {/* Sample Inputs */}
                <div className="flex flex-col gap-2 align-center lg:align-start">
                    <p className="w-full text-center lg:text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Sample Inputs:</p>
                    <div className="flex lg:flex-row flex-wrap gap-2 justify-center lg:justify-start">
                        {sampleInputs.map((sample, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => sampleInput(sample)}
                                disabled={isLoading}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sample.length > 32 ? `${sample.substring(0, 32)}...` : sample}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col min-h-[200px] gap-4">
                {/* The Form: Always visible, but can shift slightly if you want */}
                <form
                    onSubmit={onSubmit}
                    className="w-full will-change-transform transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                    <label htmlFor="chat" className="sr-only">Your message</label>
                    <div className="flex items-center px-1.5 sm:px-2 py-1.5 rounded-lg border border-gray-300/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-800/30 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all duration-300 ease-out">
                        <textarea
                            ref={textareaRef}
                            id="chat"
                            name="chat"
                            rows={1}
                            maxLength={32}
                            onChange={handleInputChange}
                            className="block mx-1 sm:mx-2 p-1.5 sm:p-2 w-full text-sm text-gray-900 bg-transparent rounded-lg border-0 focus:ring-0 focus:outline-none dark:text-white dark:placeholder-gray-400 resize-none"
                            placeholder="Your message..."
                            disabled={isLoading || !meta}
                        ></textarea>
                        <button
                            type="submit"
                            disabled={isLoading || !meta}
                            className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-all duration-200"
                        >
                            <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 18 20"><path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" /></svg>
                        </button>
                    </div>
                </form>

                <div
                    className={`p-3 sm:p-4 text-xs sm:text-sm text-gray-900 dark:text-white min-h-[100px] border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/30 dark:bg-gray-900/30 whitespace-pre-wrap transition-all duration-500`}
                >
                    {isLoading ? (
                        <span className="animate-pulse text-blue-500">Generating...</span>
                    ) : hasGeneratedText ? (
                        response
                    ) : (
                        <div className="text-gray-600 dark:text-gray-400">
                            <p>Very small model → limited coherence.</p>
                            <p>Short context window (32 characters), hence input limited to 32 characters.</p>
                            <p>No instruction following, no factual knowledge.</p>
                            <p>This demo is meant for learning and experimentation, not production use.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}