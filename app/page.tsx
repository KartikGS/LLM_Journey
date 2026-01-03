import Link from "next/link";

export default function Home() {
  const journeyStages = [
    {
      title: "Transformer",
      href: "/transformer",
      description: "Start with the foundation - a decoder-only transformer model trained on Shakespeare",
      stage: 1,
    },
    {
      title: "LLM",
      href: "/llm",
      description: "Explore large language models and their capabilities",
      stage: 2,
    },
    {
      title: "Fine-tuning",
      href: "/fine-tuning",
      description: "Learn how to adapt pre-trained models for specific tasks",
      stage: 3,
    },
    {
      title: "Tools",
      href: "/tools",
      description: "Integrate external tools and APIs with LLMs",
      stage: 4,
    },
    {
      title: "RAG",
      href: "/rag",
      description: "Retrieval-Augmented Generation for enhanced context-aware responses",
      stage: 5,
    },
    {
      title: "Agents",
      href: "/agents",
      description: "Build advanced agent systems with reasoning capabilities",
      stage: 6,
    },
    {
      title: "MCP",
      href: "/mcps",
      description: "Model Context Protocol for structured model interactions",
      stage: 7,
    },
    {
      title: "Deployment",
      href: "/deployment",
      description: "Best practices for deploying LLM applications in production",
      stage: 8,
    },
    {
      title: "Safety",
      href: "/safety",
      description: "Safety considerations and guardrails for LLM applications",
      stage: 9,
    },
    {
      title: "Evaluation",
      href: "/evaluation",
      description: "Methods and metrics for evaluating LLM performance",
      stage: 10,
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
          A comprehensive exploration of Large Language Models, from basic transformer architectures to advanced agent systems.
          Learn about the evolution of LLM technology.
        </p>
      </div>

      {/* Main CTA */}
      <div className="w-full flex flex-col items-center justify-center gap-4">
        <Link
          href="/transformer"
          className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Start Your Journey →
        </Link>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center">
          Begin with the foundational Transformer model
        </p>
      </div>

      {/* Journey Overview */}
      <div className="w-full flex flex-col gap-6 sm:gap-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center">
          The Journey Ahead
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto">
          Follow the progression from basic models to sophisticated AI systems. Each stage builds upon the previous,
          introducing new concepts, techniques, and capabilities.
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