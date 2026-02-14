import Link from 'next/link';
import { journeyStages } from '@/lib/journey-stages';
import { GlowBackground } from '@/app/ui/components/GlowBackground';
import { GlassCard } from '@/app/ui/components/GlassCard';
import { GradientText } from '@/app/ui/components/GradientText';

const mentalModelPhases = [
  {
    phases: '1-3',
    paradigm: 'The Model',
    question: 'How do we turn math into language?',
  },
  {
    phases: '4',
    paradigm: 'Context',
    question: 'How do we stop the model from forgetting or hallucinating?',
  },
  {
    phases: '5-7',
    paradigm: 'The System',
    question: 'How do we give the model hands and partners?',
  },
  {
    phases: '8-10',
    paradigm: 'Production',
    question: 'How do we make it safe, fast, and measurable?',
  },
];

export default function Home() {
  return (
    <div className="w-full flex-1 flex flex-col gap-6 sm:gap-8 md:gap-16 p-4 sm:p-8 md:p-12 overflow-y-auto relative">
      <GlowBackground />

      <div className="w-full">
        <GlassCard variant="hero" className="p-6 sm:p-8 md:p-12">
          <div className="flex flex-col justify-around items-center gap-4 sm:gap-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center">
              <GradientText>LLM Journey</GradientText>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 text-center max-w-3xl">
              Instead of teaching APIs, LLM Journey teaches the{' '}
              <strong>architectural ideas</strong> that led from transformers to agents.
              Learn the <em>mechanics, trade-offs, and failure modes</em> that matter in production.
            </p>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-500 text-center max-w-2xl">
              <strong>Learn with Tiny, Build with Large:</strong> Use small models to understand mechanics,
              large models to build real applications.
            </p>
          </div>
        </GlassCard>
      </div>

      <div className="w-full flex flex-col items-center justify-center gap-4">
        <Link href="/foundations/transformers" className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300" />

          <span className="relative flex px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg bg-black dark:bg-white text-white dark:text-black transition-transform duration-150 group-hover:scale-[1.02] group-active:scale-[0.98]">
            Start Your Journey →
          </span>
        </Link>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center">
          Begin with the foundational Transformer architecture
        </p>
      </div>

      <div className="w-full flex flex-col gap-4 sm:gap-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center text-gray-900 dark:text-white">
          From Tensors to Teams
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto">
          Each phase exists because the previous one failed at a specific task.
          This is a conceptual dependency chain, not just a list of topics.
        </p>

        <div className="w-full max-w-3xl mx-auto">
          <GlassCard variant="default">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-black/[0.08] dark:border-white/[0.145] bg-black/[0.02] dark:bg-white/[0.02]">
                    <th className="py-4 px-4 text-left font-semibold text-gray-900 dark:text-white">Phase</th>
                    <th className="py-4 px-4 text-left font-semibold text-gray-900 dark:text-white">Paradigm</th>
                    <th className="py-4 px-4 text-left font-semibold text-gray-900 dark:text-white">Solving The Problem of...</th>
                  </tr>
                </thead>
                <tbody>
                  {mentalModelPhases.map((phase, index) => (
                    <tr
                      key={phase.phases}
                      className={`border-b border-black/[0.05] dark:border-white/[0.08] transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02] ${index === mentalModelPhases.length - 1 ? 'border-b-0' : ''}`}
                    >
                      <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">{phase.phases}</td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{phase.paradigm}</td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{phase.question}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="w-full flex flex-col gap-6 sm:gap-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center text-gray-900 dark:text-white">
          The 10-Stage Journey
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto">
          Follow the progression from foundational models to production systems.
          Each stage builds upon the previous, addressing real engineering challenges.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {journeyStages.map((stage) => (
          <div key={stage.href}>
            <Link href={stage.href} className="block h-full">
              <GlassCard variant="interactive" className="h-full p-4 sm:p-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-sm font-semibold text-gray-900 dark:text-white">
                    {stage.stage}
                  </span>
                  <h3 className="text-lg sm:text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-gray-900 dark:text-white">
                    {stage.title}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {stage.description}
                </p>
              </GlassCard>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
