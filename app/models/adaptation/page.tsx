'use client';

import { KeyboardEvent, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Gauge, Layers, Wallet } from 'lucide-react';
import { GlowBackground } from '@/app/ui/components/GlowBackground';
import { GlassCard } from '@/app/ui/components/GlassCard';
import { JourneyStageHeader } from '@/app/ui/components/JourneyStageHeader';
import { JourneyContinuityLinks } from '@/app/ui/components/JourneyContinuityLinks';

type StrategyId = 'full-finetuning' | 'lora-peft' | 'prompt-prefix';

type Strategy = {
  id: StrategyId;
  name: string;
  summary: string;
  quality: string;
  cost: string;
  speed: string;
  bestFor: string;
  caution: string;
};

const strategies: Strategy[] = [
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

export default function ModelAdaptationPage() {
  const shouldReduceMotion = useReducedMotion();
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyId>('lora-peft');

  const active = strategies.find((strategy) => strategy.id === selectedStrategy) ?? strategies[1];

  const handleStrategyKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowDown' && event.key !== 'ArrowLeft' && event.key !== 'ArrowUp') {
      return;
    }

    event.preventDefault();
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = (currentIndex + direction + strategies.length) % strategies.length;
    setSelectedStrategy(strategies[nextIndex].id);
  };

  const fadeInUp = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.25 },
      };

  return (
    <div
      className="w-full flex-1 flex flex-col gap-6 sm:gap-8 md:gap-10 p-4 sm:p-8 md:p-12 overflow-y-auto relative"
      data-testid="adaptation-page"
    >
      <GlowBackground />

      <motion.div {...fadeInUp}>
        <JourneyStageHeader
          testId="adaptation-hero"
          title="Model Adaptation"
          description="Base transformers understand language broadly. Adaptation is how we make them reliable for a specific domain, policy, or tone without rebuilding everything from scratch."
        />
      </motion.div>

      <motion.section
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5"
        data-testid="adaptation-strategy-comparison"
        {...fadeInUp}
      >
        {strategies.map((strategy) => (
          <GlassCard key={strategy.id} variant="default" className="p-5 sm:p-6 h-full">
            <div className="flex flex-col gap-3 h-full">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{strategy.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{strategy.summary}</p>
              <ul className="mt-1 space-y-2 text-sm">
                <li className="text-gray-700 dark:text-gray-300"><span className="font-semibold text-gray-900 dark:text-white">Quality:</span> {strategy.quality}</li>
                <li className="text-gray-700 dark:text-gray-300"><span className="font-semibold text-gray-900 dark:text-white">Cost:</span> {strategy.cost}</li>
                <li className="text-gray-700 dark:text-gray-300"><span className="font-semibold text-gray-900 dark:text-white">Speed:</span> {strategy.speed}</li>
              </ul>
            </div>
          </GlassCard>
        ))}
      </motion.section>

      <motion.section data-testid="adaptation-interaction" {...fadeInUp}>
        <GlassCard variant="default" className="p-5 sm:p-6 md:p-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Choose a Strategy</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Use one selector to see how the trade-off profile changes.
              </p>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
              role="radiogroup"
              aria-label="Adaptation strategy selector"
              data-testid="adaptation-strategy-selector"
            >
              {strategies.map((strategy, index) => {
                const selected = strategy.id === selectedStrategy;
                return (
                  <button
                    key={strategy.id}
                    type="button"
                    onClick={() => setSelectedStrategy(strategy.id)}
                    onKeyDown={(event) => handleStrategyKeyDown(event, index)}
                    role="radio"
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    data-testid={`strategy-button-${strategy.id}`}
                    className={[
                      'rounded-lg border px-4 py-3 text-sm font-medium text-left transition-colors duration-150',
                      selected
                        ? 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                        : 'border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.02] text-gray-700 dark:text-gray-300 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]'
                    ].join(' ')}
                  >
                    {strategy.name}
                  </button>
                );
              })}
            </div>

            <div
              className="rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] p-4 sm:p-5"
              data-testid="adaptation-interaction-output"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{active.name}</h3>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Best for:</span> {active.bestFor}
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Watch out:</span> {active.caution}
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2 rounded-md border border-black/[0.06] dark:border-white/[0.06] p-2">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-gray-700 dark:text-gray-300">{active.quality}</span>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-black/[0.06] dark:border-white/[0.06] p-2">
                  <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-gray-700 dark:text-gray-300">{active.cost}</span>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-black/[0.06] dark:border-white/[0.06] p-2">
                  <Gauge className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-gray-700 dark:text-gray-300">{active.speed}</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.section>

      <motion.div {...fadeInUp}>
        <JourneyContinuityLinks
          testId="adaptation-continuity-links"
          previous={{
            href: '/foundations/transformers',
            eyebrow: 'Previous Stage',
            title: 'Transformers Foundations',
            description: 'Review attention and token flow before specializing behavior.',
            cta: 'Back to Stage 1',
            testId: 'adaptation-link-transformers',
          }}
          next={{
            href: '/context/engineering',
            eyebrow: 'Next Stage',
            title: 'Context Engineering',
            description: 'Move from weight changes to prompt and context control at runtime.',
            cta: 'Stage 3 preview',
            testId: 'adaptation-link-context',
          }}
        />
      </motion.div>
    </div>
  );
}
