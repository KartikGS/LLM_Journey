'use client';

import React from 'react';
import BaseLLMChat from "./components/BaseLLMChat";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { GlowBackground } from '@/app/ui/components/GlowBackground';
import { GlassCard } from '@/app/ui/components/GlassCard';
import { GradientText } from '@/app/ui/components/GradientText';
import { BookOpen, Cpu, Database, Play, Layers, Activity } from 'lucide-react';

export default function BaseLLMPage() {
  const shouldReduceMotion = useReducedMotion();

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

  return (
    <div className="w-full flex-1 flex flex-col gap-8 sm:gap-12 md:gap-16 p-4 sm:p-8 md:p-12 overflow-y-auto relative">
      <GlowBackground />

      {/* Hero Section */}
      <motion.div
        className="w-full flex flex-col justify-around items-center gap-6"
        {...fadeInUp}
      >
        <div className="flex flex-col items-center gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium uppercase tracking-wider mb-2"
          >
            Interactive Demo
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center leading-tight">
            <GradientText>Decoder-Only Transformer</GradientText>
          </h1>
        </div>
        <p className="w-full max-w-2xl text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 text-center leading-relaxed">
          A small, character-level GPT-style model trained on Tiny Shakespeare and running fully in the browser.
        </p>
      </motion.div>


      {/* Chat Interface */}
      <motion.div {...fadeInUp}>
        <BaseLLMChat />
      </motion.div>

      {/* Details Grid */}
      <motion.div
        className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4"
        {...staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Model Overview */}
        <GlassCard variant="default" className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Overview</h2>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Specs</h3>
              <div className="grid grid-cols-2 gap-2">
                <SpecTag label="Ctx" value="32" />
                <SpecTag label="Heads" value="4" />
                <SpecTag label="Layers" value="4" />
                <SpecTag label="Embed" value="64" />
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              This model predicts the next character given the previous ones using causal self-attention (no future peeking).
            </p>

            <div className="mt-auto pt-4">
              <a
                href="https://jalammar.github.io/illustrated-gpt2/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                <BookOpen className="w-4 h-4" /> Learn more
              </a>
            </div>
          </div>
        </GlassCard>

        {/* How Self-Attention Works */}
        <GlassCard variant="default" className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Self-Attention</h2>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Characters look at past context only</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Attention scores weight relevance</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Causal mask blocks future tokens</span>
              </li>
            </ul>

            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
              <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                <strong>Key idea:</strong> Allows autoregressive generation one token at a time.
              </p>
            </div>

            <div className="mt-auto pt-4">
              <a
                href="https://jalammar.github.io/illustrated-transformer/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                <BookOpen className="w-4 h-4" /> Visual Guide
              </a>
            </div>
          </div>
        </GlassCard>

        {/* Training Setup */}
        <GlassCard variant="default" className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Training</h2>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Dataset</span>
                <span className="font-medium text-gray-900 dark:text-white">Tiny Shakespeare</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Objective</span>
                <span className="font-medium text-gray-900 dark:text-white">Next-Char Pred</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Optimizer</span>
                <span className="font-medium text-gray-900 dark:text-white">AdamW</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-black/5 dark:border-white/5">
              Goal: Learn character-level structure and rhythm, not just memorization.
            </p>

            <div className="mt-auto pt-4">
              <a
                href="https://github.com/karpathy/char-rnn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                <Database className="w-4 h-4" /> Dataset Source
              </a>
            </div>
          </div>
        </GlassCard>

        {/* Browser Runtime */}
        <GlassCard variant="default" className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600 dark:text-orange-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Browser Runtime</h2>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex gap-2">
                <span className="text-orange-500">✓</span>
                <span><strong>ONNX Runtime Web</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">✓</span>
                <span>No Server / API</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">✓</span>
                <span>WASM Accelerated</span>
              </li>
            </ul>

            <div className="mt-auto pt-4">
              <a
                href="https://onnxruntime.ai/docs/get-started/with-javascript.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                <Cpu className="w-4 h-4" /> ONNX Docs
              </a>
            </div>
          </div>
        </GlassCard>
      </motion.div>


      {/* Reference Materials */}
      <motion.div
        className="w-full flex flex-col sm:flex-row gap-6 justify-center items-center py-8"
        {...fadeInUp}
      >
        <Link
          href="https://www.youtube.com/watch?v=kCc8FmEb1nY"
          target="_blank"
          className="group flex items-center gap-3 px-6 py-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <Play className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
          <span className="text-gray-900 dark:text-white font-medium">Watch on YouTube</span>
        </Link>

        <Link
          href="https://colab.research.google.com/drive/1B6ZeJNR0eiDCEUbexOj6beXZ-qMiH-3B?usp=sharing"
          target="_blank"
          className="group flex items-center gap-3 px-6 py-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
        >
          <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-600 text-xs font-bold">C</div>
          <span className="text-gray-900 dark:text-white font-medium">Open Colab</span>
        </Link>
      </motion.div>

      {/* Next page redirection*/}
      <motion.div
        className="w-full flex flex-col lg:flex-row items-center justify-between gap-6 p-8 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-200/20 dark:border-blue-500/10"
        {...fadeInUp}
      >
        <div className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 text-center lg:text-left max-w-2xl">
          Small transformers produce meaningless text, but when scaled we get LLMs which produces text that makes sense.
        </div>
        <Link
          href="/llm"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 whitespace-nowrap"
        >
          Explore LLM →
        </Link>
      </motion.div>
    </div>
  );
}

function SpecTag({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col items-center p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{label}</span>
      <span className="font-mono font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}