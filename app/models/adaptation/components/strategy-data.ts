export type StrategyId = 'full-finetuning' | 'lora-peft' | 'prompt-prefix';

export type Strategy = {
  id: StrategyId;
  name: string;
  summary: string;
  quality: string;
  cost: string;
  speed: string;
  bestFor: string;
  caution: string;
};

export const strategies: Strategy[] = [
  {
    id: 'full-finetuning',
    name: 'Full Fine-Tuning',
    summary: 'Update most or all model weights to deeply specialize behavior.',
    quality: 'Highest ceiling on domain alignment',
    cost: 'High GPU + storage cost',
    speed: 'Slow iteration cycle',
    bestFor: 'Large-scale products with stable data and strict domain behavior',
    caution: 'Higher risk of overfitting and expensive rollback if data quality is weak.',
  },
  {
    id: 'lora-peft',
    name: 'LoRA / PEFT',
    summary: 'Train small adapter weights while keeping the base model mostly frozen.',
    quality: 'Strong quality/cost balance',
    cost: 'Moderate training + deployment cost',
    speed: 'Fast iteration cycle',
    bestFor: 'Teams that need specialization with practical infrastructure budgets',
    caution: 'Adapter/base mismatch can hurt quality if versioning is inconsistent.',
  },
  {
    id: 'prompt-prefix',
    name: 'Prompt / Prefix Tuning',
    summary: 'Steer behavior through structured prompts or learned prefix vectors.',
    quality: 'Lowest implementation overhead',
    cost: 'Low cost, minimal retraining',
    speed: 'Fastest experimentation loop',
    bestFor: 'Rapid prototyping and changing requirements',
    caution: 'Behavior can drift across prompts and is less robust than weight adaptation.',
  },
];
