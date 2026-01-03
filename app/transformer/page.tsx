import BaseLLMChat from "./components/BaseLLMChat";
import Link from "next/link";

export default function BaseLLMPage() {
  return (
    <div className="w-full flex-1 flex flex-col gap-6 sm:gap-8 md:gap-16 p-4 sm:p-8 md:p-12 overflow-y-auto">
      {/* Title and Description */}
      <div className="w-full flex flex-col justify-around items-center gap-2">
        <div className="text-3xl sm:text-4xl md:text-5xl ml-12 md:ml-0 text-center">Interactive Decoder-Only Transformer</div>
        <div className="w-full text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 text-center">
          A small, character-level GPT-style model trained on Tiny Shakespeare and running fully in the browser.
        </div>
      </div>


      {/* Chat Interface */}
      <BaseLLMChat />

      {/* Details */}
      <div className="w-full flex flex-row flex-wrap justify-around gap-4">
        {/* Model Overview */}
        <section className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4">
          <h2 className="text-2xl sm:text-3xl font-semibold">Model Overview</h2>

          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Architecture</h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300 ml-4">
                <li>Decoder-only Transformer (GPT-style)</li>
                <li>Causal self-attention (no future token access)</li>
                <li>Character-level language model</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Key Specs</h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>Vocabulary:</strong> unique characters from Tiny Shakespeare</li>
                <li><strong>Context length (block size):</strong> 32 tokens</li>
                <li><strong>Layers:</strong> 4</li>
                <li><strong>Attention heads:</strong> 4</li>
                <li><strong>Embedding size:</strong> 64</li>
                <li><strong>Parameters:</strong> ~0.2M</li>
              </ul>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                This model predicts the next character given the previous characters.
              </p>
            </div>

            <div>
              <a
                href="https://jalammar.github.io/illustrated-gpt2/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base"
              >
                📎 Learn more: Decoder-Only Transformers →
              </a>
            </div>
          </div>
        </section>

        {/* How Self-Attention Works */}
        <section className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4">
          <h2 className="text-2xl sm:text-3xl font-semibold">How Self-Attention Works</h2>

          <div className="flex flex-col gap-3">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              <strong>In simple terms:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300 ml-4">
              <li>Each character looks at previous characters only</li>
              <li>Attention scores decide which past characters matter most</li>
              <li>A causal mask ensures no peeking into the future</li>
            </ul>

            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <strong>Key idea:</strong> This is why the model can generate text autoregressively, one token at a time.
              </p>
            </div>

            <div>
              <a
                href="https://jalammar.github.io/illustrated-transformer/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base"
              >
                📎 Learn more: Self-Attention Explained →
              </a>
            </div>
          </div>
        </section>

        {/* Training Setup */}
        <section className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4">
          <h2 className="text-2xl sm:text-3xl font-semibold">Training Setup</h2>

          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Dataset</h3>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                Tiny Shakespeare (character-level text)
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Training Objective</h3>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                Predict the next character using cross-entropy loss
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Optimization</h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300 ml-4">
                <li>AdamW optimizer</li>
                <li>Trained for several thousand steps</li>
                <li>Evaluated on a held-out validation split</li>
              </ul>
            </div>

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 italic">
              The goal is not memorization, but learning character-level structure and rhythm.
            </p>

            <div>
              <a
                href="https://github.com/karpathy/char-rnn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base"
              >
                📎 Dataset source →
              </a>
            </div>
          </div>
        </section>

        {/* Text Generation Process */}
        <section className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4">
          <h2 className="text-2xl sm:text-3xl font-semibold">Text Generation Process</h2>

          <div className="flex flex-col gap-3">
            <h3 className="text-lg sm:text-xl font-medium">Generation Loop</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 ml-4">
              <li>Take the last N characters (context window)</li>
              <li>Predict probabilities for the next character</li>
              <li>Sample one character</li>
              <li>Append and repeat</li>
            </ol>

            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <strong>Important note:</strong> Sampling (not greedy decoding) is used, so outputs vary each time.
              </p>
            </div>

            <div>
              <a
                href="https://huggingface.co/blog/how-to-generate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base"
              >
                📎 Optional reading: Greedy vs Sampling vs Temperature →
              </a>
            </div>
          </div>
        </section>

        {/* Running Fully in the Browser */}
        <section className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4">
          <h2 className="text-2xl sm:text-3xl font-semibold">Running Fully in the Browser (ONNX)</h2>

          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">How it runs</h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300 ml-4">
                <li>Model exported to ONNX</li>
                <li>Executed using onnxruntime-web</li>
                <li>No server, no Python, no GPU required</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Why ONNX?</h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300 ml-4">
                <li>Portable</li>
                <li>Lightweight</li>
                <li>Designed for inference</li>
              </ul>
            </div>

            <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">
                Everything runs locally in your browser.
              </p>
            </div>

            <div>
              <a
                href="https://onnxruntime.ai/docs/get-started/with-javascript.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base"
              >
                📎 Learn more: ONNX Runtime Web →
              </a>
            </div>
          </div>
        </section>
      </div>


      {/* Reference Materials */}
      <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-2 justify-around items-center text-center lg:text-left">
        <h2 className="text-xl sm:text-2xl font-semibold">Reference Materials</h2>

        {/* YouTube Video */}
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <h3 className="text-base sm:text-lg font-medium">YouTube Video</h3>
          <a
            href="https://www.youtube.com/watch?v=kCc8FmEb1nY"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base"
          >
            Watch on YouTube →
          </a>
        </div>

        {/* Colab Link */}
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <h3 className="text-base sm:text-lg font-medium">Colab Notebook</h3>
          <a
            href="https://colab.research.google.com/drive/1B6ZeJNR0eiDCEUbexOj6beXZ-qMiH-3B?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base"
          >
            Open in Google Colab →
          </a>
        </div>

      </div>

      {/* Next page redirection*/}
      <div className="w-full flex flex-col lg:flex-row items-center justify-around gap-4">
        <div className="text-base sm:text-2xl text-gray-700 dark:text-gray-300 text-center">
          The small transformer produces meaningless text, but when it is scaled we get LLMs which produces text that makes sence.
        </div>
        <Link
          href="/llm"
          className="text-blue-600 dark:text-blue-400 text-base sm:text-2xl hover:underline"
        >
          Explore LLM →
        </Link>
      </div>
    </div>
  );
}