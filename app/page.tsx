import Link from "next/link";
import { journeyStages } from "@/lib/journey-stages";

export default function Home() {
  const mentalModelPhases = [
    {
      phases: "1-3",
      paradigm: "The Model",
      question: "How do we turn math into language?",
    },
    {
      phases: "4",
      paradigm: "Context",
      question: "How do we stop the model from forgetting or hallucinating?",
    },
    {
      phases: "5-7",
      paradigm: "The System",
      question: "How do we give the model hands and partners?",
    },
    {
      phases: "8-10",
      paradigm: "Production",
      question: "How do we make it safe, fast, and measurable?",
    },
  ];

  return (
    <div className="w-full flex-1 flex flex-col gap-6 sm:gap-8 md:gap-16 p-4 sm:p-8 md:p-12 overflow-y-auto">
      {/* Hero Section */}
      <div className="w-full flex flex-col justify-around items-center gap-4 sm:gap-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center">
          LLM Journey
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 text-center max-w-3xl">
          Instead of teaching APIs, LLM Journey teaches the{" "}
          <strong>architectural ideas</strong> that led from transformers to agents.
          Learn the <em>mechanics, trade-offs, and failure modes</em> that matter in production.
        </p>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-500 text-center max-w-2xl">
          <strong>Learn with Tiny, Build with Large:</strong> Use small models to understand mechanics,
          large models to build real applications.
        </p>
      </div>

      {/* Main CTA */}
      <div className="w-full flex flex-col items-center justify-center gap-4">
        <Link
          href="/foundations/transformers"
          className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Start Your Journey →
        </Link>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center">
          Begin with the foundational Transformer architecture
        </p>
      </div>

      {/* Mental Model: From Tensors to Teams */}
      <div className="w-full flex flex-col gap-4 sm:gap-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center">
          From Tensors to Teams
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto">
          Each phase exists because the previous one failed at a specific task.
          This is a conceptual dependency chain, not just a list of topics.
        </p>
        <div className="w-full max-w-3xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse text-sm sm:text-base">
            <thead>
              <tr className="border-b border-black/[.08] dark:border-white/[.145]">
                <th className="py-3 px-4 text-left font-semibold">Phase</th>
                <th className="py-3 px-4 text-left font-semibold">Paradigm</th>
                <th className="py-3 px-4 text-left font-semibold">Solving The Problem of...</th>
              </tr>
            </thead>
            <tbody>
              {mentalModelPhases.map((phase) => (
                <tr
                  key={phase.phases}
                  className="border-b border-black/[.08] dark:border-white/[.145]"
                >
                  <td className="py-3 px-4 font-medium">{phase.phases}</td>
                  <td className="py-3 px-4">{phase.paradigm}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{phase.question}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Journey Overview */}
      <div className="w-full flex flex-col gap-6 sm:gap-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center">
          The 10-Stage Journey
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto">
          Follow the progression from foundational models to production systems.
          Each stage builds upon the previous, addressing real engineering challenges.
        </p>
      </div>

      {/* Journey Stages Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {journeyStages.map((stage) => (
          <Link
            key={stage.href}
            href={stage.href}
            className="flex flex-col gap-3 p-4 sm:p-6 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-white/[.5] dark:bg-black/[.5] hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-all hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black/[.08] dark:bg-white/[.145] text-sm font-semibold">
                {stage.stage}
              </span>
              <h3 className="text-lg sm:text-xl font-semibold">{stage.title}</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {stage.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}