'use client'

import { FormEvent, useState, useRef, useEffect } from "react";
import { generate } from "@/lib/llm/generateClient";
import { ModelMeta } from "@/types/llm";
import { GlassCard } from "@/app/ui/components/GlassCard";
import { Send, Terminal, Play, Cpu, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

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
            .then(res => res.json())
            .then(data => setMeta(data))
            .catch(() => {
                setResponse("Error loading model metadata");
            });
    }, []);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!meta) {
            setResponse("Model metadata not loaded yet...");
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

        try {
            const result = await generate({
                meta,
                prompt: inputText,
                maxNewTokens: 200,
            });
            setResponse(result || "Error generating text");
            setHasGeneratedText(true);
        } catch (error) {
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
        <GlassCard className="w-full flex flex-col lg:flex-row gap-6 md:gap-8 p-6 sm:p-8 overflow-visible">
            {/* Left Col: Instructions & Samples */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4 sm:gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                        <Terminal className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Try the Model</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Interact with the raw probability distribution</p>
                    </div>
                </div>

                {/* Sample Inputs */}
                <div className="flex flex-col gap-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                        <Play className="w-3 h-3" />
                        Sample Inputs (Tiny Shakespeare)
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {sampleInputs.map((sample, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => sampleInput(sample)}
                                disabled={isLoading}
                                className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left max-w-full truncate"
                            >
                                {sample.length > 32 ? `${sample.substring(0, 32)}...` : sample}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Col: Console Interface */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
                {/* Input Area */}
                <form
                    onSubmit={onSubmit}
                    className="w-full relative group"
                >
                    <label htmlFor="chat" className="sr-only">Your message</label>
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            id="chat"
                            name="chat"
                            rows={2}
                            maxLength={32}
                            onChange={handleInputChange}
                            className="w-full p-4 pr-12 text-base rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all resize-none shadow-inner"
                            placeholder="Type raw text (max 32 chars)..."
                            disabled={isLoading || !meta}
                        ></textarea>

                        <div className="absolute top-1/2 -translate-y-1/2 right-2">
                            <button
                                type="submit"
                                disabled={isLoading || !meta}
                                className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-blue-600/20"
                            >
                                {isLoading ? (
                                    <Cpu className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-1 px-1">
                        <span className="text-xs text-gray-400">Context Window: 32 chars</span>
                        <span className="text-xs text-gray-400 font-mono">ONNX Runtime Web</span>
                    </div>
                </form>

                {/* Output Console */}
                <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-900 shadow-inner min-h-[160px] flex flex-col">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border-b border-white/5">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                        </div>
                        <span className="text-xs text-gray-400 font-mono ml-2">model_output.txt</span>
                    </div>

                    <div className="p-4 font-mono text-sm leading-relaxed overflow-y-auto flex-1">
                        {isLoading ? (
                            <span className="animate-pulse text-blue-400">Processing input tensors...</span>
                        ) : hasGeneratedText ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-green-400 whitespace-pre-wrap"
                            >
                                <span className="text-gray-500 select-none mr-2">$</span>
                                {response}
                                <span className="animate-pulse inline-block w-2 h-4 bg-green-400 ml-1 align-middle" />
                            </motion.div>
                        ) : (
                            <div className="text-gray-500 space-y-2">
                                <p className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> System ready.</p>
                                <p className="opacity-70">Model: Decoder-only Transformer</p>
                                <p className="opacity-70">Params: ~0.2M (Tiny Shakespeare)</p>
                                <p className="opacity-70">Warn: Output may be hallucinatory.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </GlassCard>
    )
}
