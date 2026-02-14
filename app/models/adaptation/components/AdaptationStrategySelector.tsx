'use client';

import { KeyboardEvent, useState } from 'react';
import { Gauge, Layers, Wallet } from 'lucide-react';
import { GlassCard } from '@/app/ui/components/GlassCard';
import { strategies, type StrategyId } from './strategy-data';

export function AdaptationStrategySelector() {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyId>('lora-peft');

  const active = strategies.find((strategy) => strategy.id === selectedStrategy) ?? strategies[1];

  const handleStrategyKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (
      event.key !== 'ArrowRight' &&
      event.key !== 'ArrowDown' &&
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowUp'
    ) {
      return;
    }

    event.preventDefault();
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = (currentIndex + direction + strategies.length) % strategies.length;
    setSelectedStrategy(strategies[nextIndex].id);
  };

  return (
    <section data-testid="adaptation-interaction">
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
                      : 'border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.02] text-gray-700 dark:text-gray-300 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]',
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
    </section>
  );
}
