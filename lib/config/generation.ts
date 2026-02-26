/**
 * Versioned generation configuration.
 *
 * Non-secret runtime settings for frontier and adaptation generation routes.
 * FRONTIER_API_KEY is intentionally absent — it must remain as an environment secret.
 *
 * Source of truth: this file. Generation routes must not read provider URLs, model IDs,
 * timeouts, or output caps from environment variables. See agent-docs/api/ for the full
 * env contract.
 */

export type FrontierProvider = 'openai' | 'huggingface';

export const FRONTIER_GENERATION_CONFIG = {
    provider: 'huggingface' as FrontierProvider,
    apiUrl: 'https://router.huggingface.co/featherless-ai/v1/completions',
    modelId: 'meta-llama/Meta-Llama-3-8B',
    timeoutMs: 8000,
} as const;

export const ADAPTATION_GENERATION_CONFIG = {
    apiUrl: 'https://router.huggingface.co/featherless-ai/v1/chat/completions',
    timeoutMs: 8000,
    outputMaxChars: 4000,
    models: {
        'full-finetuning': 'meta-llama/Meta-Llama-3-8B-Instruct',
        'lora-peft': 'swap-uniba/LLaMAntino-3-ANITA-8B-Inst-DPO-ITA',
        'prompt-prefix': 'meta-llama/Meta-Llama-3-8B',
    },
} as const;
