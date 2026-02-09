'use client'

import Link from "next/link";
import { journeyStages } from "@/lib/journey-stages";
import { motion, useReducedMotion } from "framer-motion";

export default function Home() {
  const shouldReduceMotion = useReducedMotion();

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

  // Animation variants
  const fadeInUp = shouldReduceMotion
    ? {}
    : {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
    };

  const staggerContainer = shouldReduceMotion
    ? {}
    : {
      animate: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    };

  const cardHover = shouldReduceMotion
    ? {}
    : {
      whileHover: { scale: 1.02, y: -4 },
      transition: { type: "spring", stiffness: 300, damping: 20 },
    };

  return (
    <div className="w-full flex-1 flex flex-col gap-6 sm:gap-8 md:gap-16 p-4 sm:p-8 md:p-12 overflow-y-auto relative">
      {/* Premium Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/5 blur-[120px] rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Hero Section with Glassmorphism */}
      <motion.div
        className="w-full relative group"
        {...fadeInUp}
      >
        {/* Gradient border glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-[2rem] blur opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition duration-1000" />

        <div className="relative bg-white/80 dark:bg-[#111111]/80 backdrop-blur-2xl rounded-[2rem] border border-black/5 dark:border-white/10 p-6 sm:p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col justify-around items-center gap-4 sm:gap-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
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
        </div>
      </motion.div>

      {/* Main CTA */}
      <motion.div
        className="w-full flex flex-col items-center justify-center gap-4"
        {...fadeInUp}
      >
        <Link href="/foundations/transformers" className="relative group">
          {/* Gradient border glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300" />

          <motion.span
            className="relative flex px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg bg-black dark:bg-white text-white dark:text-black transition-all duration-200"
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
          >
            Start Your Journey →
          </motion.span>
        </Link>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center">
          Begin with the foundational Transformer architecture
        </p>
      </motion.div>

      {/* Mental Model: From Tensors to Teams */}
      <motion.div
        className="w-full flex flex-col gap-4 sm:gap-6"
        {...fadeInUp}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center">
          From Tensors to Teams
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto">
          Each phase exists because the previous one failed at a specific task.
          This is a conceptual dependency chain, not just a list of topics.
        </p>

        {/* Glassmorphism Table Container */}
        <div className="w-full max-w-3xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/50 via-indigo-500/50 to-purple-600/50 rounded-2xl blur opacity-10 dark:opacity-15 group-hover:opacity-20 transition duration-500" />

          <div className="relative bg-white/60 dark:bg-[#111111]/60 backdrop-blur-xl rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-black/[0.08] dark:border-white/[0.145] bg-black/[0.02] dark:bg-white/[0.02]">
                    <th className="py-4 px-4 text-left font-semibold">Phase</th>
                    <th className="py-4 px-4 text-left font-semibold">Paradigm</th>
                    <th className="py-4 px-4 text-left font-semibold">Solving The Problem of...</th>
                  </tr>
                </thead>
                <tbody>
                  {mentalModelPhases.map((phase, index) => (
                    <tr
                      key={phase.phases}
                      className={`border-b border-black/[0.05] dark:border-white/[0.08] transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02] ${index === mentalModelPhases.length - 1 ? "border-b-0" : ""
                        }`}
                    >
                      <td className="py-4 px-4 font-medium">{phase.phases}</td>
                      <td className="py-4 px-4">{phase.paradigm}</td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{phase.question}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Journey Overview */}
      <motion.div
        className="w-full flex flex-col gap-6 sm:gap-8"
        {...fadeInUp}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center">
          The 10-Stage Journey
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto">
          Follow the progression from foundational models to production systems.
          Each stage builds upon the previous, addressing real engineering challenges.
        </p>
      </motion.div>

      {/* Journey Stages Grid */}
      <motion.div
        className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        {...staggerContainer}
        initial="initial"
        animate="animate"
      >
        {journeyStages.map((stage, index) => (
          <motion.div
            key={stage.href}
            {...fadeInUp}
            transition={{ delay: shouldReduceMotion ? 0 : index * 0.05 }}
          >
            <Link href={stage.href} className="block relative group h-full">
              {/* Gradient border glow on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 dark:group-hover:opacity-30 transition duration-300" />

              <motion.div
                className="relative flex flex-col gap-3 p-4 sm:p-6 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-[#111111]/70 backdrop-blur-md transition-all duration-300 group-hover:shadow-2xl group-hover:border-black/[0.12] dark:group-hover:border-white/[0.15] h-full"
                {...cardHover}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-500/20 text-sm font-semibold">
                    {stage.stage}
                  </span>
                  <h3 className="text-lg sm:text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {stage.title}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {stage.description}
                </p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}