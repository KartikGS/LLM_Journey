import { GlowBackground } from '@/app/ui/components/GlowBackground';
import { GlassCard } from '@/app/ui/components/GlassCard';
import { JourneyStageHeader } from '@/app/ui/components/JourneyStageHeader';
import { JourneyContinuityLinks } from '@/app/ui/components/JourneyContinuityLinks';
import Link from 'next/link';
import { AdaptationChat } from './components/AdaptationChat';
import { strategies } from './components/strategy-data';

export default function ModelAdaptationPage() {
  return (
    <div
      className="w-full flex-1 flex flex-col gap-6 sm:gap-8 md:gap-10 p-4 sm:p-8 md:p-12 overflow-y-auto relative"
      data-testid="adaptation-page"
    >
      <GlowBackground />

      <JourneyStageHeader
        testId="adaptation-hero"
        title="Model Adaptation"
        description="Base LLMs understand language broadly. Adaptation is how we make them reliable for a specific domain, policy, or tone without rebuilding everything from scratch."
      />

      <section data-testid="adaptation-why-adapt">
        <GlassCard variant="default" className="p-6 sm:p-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Why We Adapt LLMs</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Base models are generalists. Adaptation is the process of specializing a model for a particular role, domain, or style. This is necessary for several reasons:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">1</span>
                  Instruction-following
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Base models are trained to complete text. Adaptation teaches them to answer questions, follow complex instructions, and maintain a consistent assistant persona.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">2</span>
                  Domain Expertise
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  General data doesn&apos;t guarantee accuracy in specialized fields like medicine, law, or engineering. Adaptation infuses the model with domain-specific knowledge.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs">3</span>
                  Knowledge Cutoff
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Large models have a training knowledge cutoff. While not as dynamic as RAG, adaptation helps align models with newer facts or specialized private data.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center text-xs">4</span>
                  Output Format Control
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reliable production applications often require structured outputs (like JSON). Adaptation teaches the model to strictly adhere to these formatting rules.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      <section
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5"
        data-testid="adaptation-strategy-comparison"
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
                <li className="text-gray-700 dark:text-gray-300"><span className="font-semibold text-gray-900 dark:text-white">Best for:</span> {strategy.bestFor}</li>
                <li className="text-gray-700 dark:text-gray-300"><span className="font-semibold text-gray-900 dark:text-white">Caution:</span> {strategy.caution}</li>
              </ul>
            </div>
          </GlassCard>
        ))}
      </section>

      <AdaptationChat />

      <section data-testid="adaptation-limitations">
        <GlassCard variant="default" className="p-6 sm:p-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Limitations &amp; What&apos;s Next</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
              <div className="space-y-2 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03]">
                <h3 className="font-semibold text-gray-900 dark:text-white italic">Full Fine-Tuning</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Best quality, but massive compute costs. Risk of <span className="text-indigo-600 dark:text-indigo-400">catastrophic forgetting</span> of base knowledge.
                </p>
              </div>
              <div className="space-y-2 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03]">
                <h3 className="font-semibold text-gray-900 dark:text-white italic">LoRA / PEFT</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Fast and accessible, but still requires highly clean specialist data and doesn&apos;t solve knowledge cutoffs dynamically.
                </p>
              </div>
              <div className="space-y-2 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03]">
                <h3 className="font-semibold text-gray-900 dark:text-white italic">Prompt / Prefix Tuning</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Zero compute for training, yet weights are frozen — preventing the model from learning new factual knowledge at its core.
                </p>
              </div>
            </div>
            <div className="mt-4 p-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-900 dark:text-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm font-medium">
                All three strategies share one unsolved limitation: they cannot adapt to new information in real-time. Check out the next stage to learn about context engineering techniques that can fill this gap by controlling model behavior at inference time without changing weights.
              </p>
            </div>
          </div>
        </GlassCard>
      </section>

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
    </div>
  );
}
