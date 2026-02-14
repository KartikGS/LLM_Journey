'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/app/ui/components/GlassCard';

interface JourneyLinkItem {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  testId?: string;
}

interface JourneyContinuityLinksProps {
  previous: JourneyLinkItem;
  next: JourneyLinkItem;
  testId?: string;
}

export function JourneyContinuityLinks({ previous, next, testId }: JourneyContinuityLinksProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid={testId}>
      <Link href={previous.href} data-testid={previous.testId} className="block">
        <GlassCard variant="interactive" className="p-5 sm:p-6 h-full">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{previous.eyebrow}</p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{previous.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{previous.description}</p>
            <div className="mt-2 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> {previous.cta}
            </div>
          </div>
        </GlassCard>
      </Link>

      <Link href={next.href} data-testid={next.testId} className="block">
        <GlassCard variant="interactive" className="p-5 sm:p-6 h-full">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{next.eyebrow}</p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{next.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{next.description}</p>
            <div className="mt-2 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
              {next.cta} <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </GlassCard>
      </Link>
    </section>
  );
}
