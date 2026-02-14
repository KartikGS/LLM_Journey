import { GlowBackground } from '@/app/ui/components/GlowBackground';
import { GlassCard } from '@/app/ui/components/GlassCard';
import { JourneyStageHeader } from '@/app/ui/components/JourneyStageHeader';
import { JourneyContinuityLinks } from '@/app/ui/components/JourneyContinuityLinks';
import { AdaptationStrategySelector } from './components/AdaptationStrategySelector';
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
        description="Base transformers understand language broadly. Adaptation is how we make them reliable for a specific domain, policy, or tone without rebuilding everything from scratch."
      />

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
              </ul>
            </div>
          </GlassCard>
        ))}
      </section>

      <AdaptationStrategySelector />

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
