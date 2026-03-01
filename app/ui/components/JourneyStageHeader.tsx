import { GlassCard } from '@/app/ui/components/GlassCard';
import { GradientText } from '@/app/ui/components/GradientText';

interface JourneyStageHeaderProps {
  title: string;
  description: string;
  testId?: string;
}

export function JourneyStageHeader({ title, description, testId }: JourneyStageHeaderProps) {
  return (
    <section data-testid={testId}>
      <GlassCard variant="hero" className="p-6 sm:p-8 md:p-10">
        <div className="flex flex-col items-center gap-4 text-center sm:gap-5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
            <GradientText from="from-blue-600 dark:from-blue-400" via="via-indigo-500 dark:via-indigo-300" to="to-purple-600 dark:to-purple-300">
              {title}
            </GradientText>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
            {description}
          </p>
        </div>
      </GlassCard>
    </section>
  );
}
