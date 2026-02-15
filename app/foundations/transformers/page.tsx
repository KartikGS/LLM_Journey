import BaseLLMChat from './components/BaseLLMChat';
import FrontierBaseChat from './components/FrontierBaseChat';
import { GlowBackground } from '@/app/ui/components/GlowBackground';
import { GlassCard } from '@/app/ui/components/GlassCard';
import { JourneyStageHeader } from '@/app/ui/components/JourneyStageHeader';
import { JourneyContinuityLinks } from '@/app/ui/components/JourneyContinuityLinks';
import { BookOpen, CircleAlert, Compass, Sparkles } from 'lucide-react';

export default function BaseLLMPage() {
  return (
    <div className="relative flex w-full flex-1 flex-col gap-8 overflow-y-auto p-4 sm:gap-12 sm:p-8 md:gap-16 md:p-12">
      <GlowBackground />

      <JourneyStageHeader
        testId="transformers-hero"
        title="Decoder-Only Transformer"
        description="Start with tiny transformer mechanics, then bridge to frontier base behavior to see why adaptation is the next stage."
      />

      <section data-testid="transformers-how" className="w-full">
        <GlassCard className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <Compass className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">What Are Transformers?</h2>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
            <p>
              A Transformer is a neural-network architecture introduced in 2017 in the paper{' '}
              <a
                href="https://arxiv.org/abs/1706.03762"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Attention Is All You Need
              </a>
              . The key idea is attention: each token can focus on other relevant tokens in the same input.
            </p>
            <p>
              The tiny demo below is intentionally small so you can inspect the mechanics directly. It uses a short context window and predicts the next character,
              which makes the generation process easy to see step by step.
            </p>
            <p>
              If you want to train one yourself, start with{' '}
              <a
                href="https://www.youtube.com/watch?v=kCc8FmEb1nY"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                this YouTube walkthrough
              </a>{' '}
              and{' '}
              <a
                href="https://colab.research.google.com/drive/1B6ZeJNR0eiDCEUbexOj6beXZ-qMiH-3B?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                this Colab notebook
              </a>
              . The in-browser model below runs with{' '}
              <a
                href="https://onnxruntime.ai/docs/get-started/with-javascript.html"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                ONNX Runtime Web
              </a>
              .
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-black/[0.08] bg-black/[0.02] px-3 py-2 text-sm text-gray-700 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-300">
            <BookOpen className="h-4 w-4" />
            Try the tiny transformer demo below.
          </div>
        </GlassCard>
      </section>

      <section data-testid="transformers-try" className="w-full">
        <BaseLLMChat />
      </section>

      <section data-testid="transformers-frontier" className="w-full space-y-4">
        <div className="rounded-xl border border-black/[0.08] bg-white/70 p-5 dark:border-white/[0.08] dark:bg-[#111111]/70 sm:p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">What Happens When You Scale the Transformer Architecture?</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
            <p>
              When you scale the same architecture with more parameters, more training data, and more compute, the model can store much more general knowledge and produce richer answers.
            </p>
            <p>
              These larger base models are usually trained on internet-scale text corpora. If you want deeper context, see{' '}
              <a
                href="https://arxiv.org/abs/2001.08361"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Scaling Laws for Neural Language Models
              </a>{' '}
              and{' '}
              <a
                href="https://arxiv.org/abs/2005.14165"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                GPT-3 (Language Models are Few-Shot Learners)
              </a>
              .
            </p>
            <p>You can interact with a base-model endpoint in the chat below.</p>
          </div>
        </div>

        <FrontierBaseChat />

        <GlassCard data-testid="transformers-comparison" className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Model Comparison Template</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Use this template when you lock concrete model choices.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-black/[0.08] dark:border-white/[0.08]">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-black/[0.03] dark:bg-white/[0.03] text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Dimension</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Tiny Transformer Demo</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Scaled Base Model</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-black/[0.08] dark:border-white/[0.08]">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Tokenization method</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Character-level</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">TBD (depends on selected model)</td>
                </tr>
                <tr className="border-t border-black/[0.08] dark:border-white/[0.08]">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Context window</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">32 characters</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">TBD</td>
                </tr>
                <tr className="border-t border-black/[0.08] dark:border-white/[0.08]">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Model size</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">~0.2M parameters</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">TBD</td>
                </tr>
                <tr className="border-t border-black/[0.08] dark:border-white/[0.08]">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Training data scope</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Tiny Shakespeare subset</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Internet-scale corpus</td>
                </tr>
                <tr className="border-t border-black/[0.08] dark:border-white/[0.08]">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Runtime</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Browser via ONNX Runtime Web</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Remote inference API</td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>
      </section>

      <section data-testid="transformers-issues" className="w-full">
        <GlassCard className="space-y-4 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <CircleAlert className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">What we don&apos;t have yet?</h2>
          </div>

          <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300 sm:text-base">
            <li className="rounded-lg border border-black/[0.08] bg-black/[0.02] p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
              Reliable instruction-following every single time. Ask for five constraints and the model may still miss one.
            </li>
            <li className="rounded-lg border border-black/[0.08] bg-black/[0.02] p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
              Stable tone and safety behavior by default. Tone can drift between responses without adaptation.
            </li>
            <li className="rounded-lg border border-black/[0.08] bg-black/[0.02] p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
              Consistent task formatting. For example, strict JSON or schema-shaped output can still break.
            </li>
          </ul>

          <div data-testid="transformers-next-stage" className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-gray-700 dark:text-gray-300 sm:text-base">
            Next up, we fix these gaps with adaptation methods (instruction tuning, task tuning, and alignment workflows) so behavior becomes more reliable, not just more fluent.
            The continuation card below takes you there.
          </div>
        </GlassCard>
      </section>

      <JourneyContinuityLinks
        testId="transformers-continuity-links"
        previous={{
          href: '/',
          eyebrow: 'Previous Stage',
          title: 'Journey Home',
          description: 'Revisit the full map before diving deeper into model specialization.',
          cta: 'Back to overview',
          testId: 'transformers-link-home',
        }}
        next={{
          href: '/models/adaptation',
          eyebrow: 'Next Stage',
          title: 'Model Adaptation',
          description: 'Bridge unresolved base-model issues into alignment and specialization strategies.',
          cta: 'Continue to Stage 2',
          testId: 'transformers-link-adaptation',
        }}
      />
    </div>
  );
}
