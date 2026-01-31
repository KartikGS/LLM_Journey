'use client';

import React, { useEffect, useState } from 'react';

interface BrowserGuardProps {
    children: React.ReactNode;
}

export const BrowserGuard: React.FC<BrowserGuardProps> = ({ children }) => {
    const [isSupported, setIsSupported] = useState<boolean | null>(null);

    useEffect(() => {
        const checkWasmSupport = () => {
            try {
                if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
                    // Attempt to create a minimal WASM module to verify CSP allows wasm-unsafe-eval
                    const wasmModule = new WebAssembly.Module(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]));
                    if (wasmModule instanceof WebAssembly.Module) {
                        return true;
                    }
                }
            } catch (e) {
                console.warn('WASM Support check failed:', e);
                return false;
            }
            return false;
        };

        setIsSupported(checkWasmSupport());
    }, []);

    if (isSupported === null) {
        // Initializing check - show nothing or a minimal loader to avoid flicker
        return <div className="min-h-screen bg-white dark:bg-[#0a0a0a]" />;
    }

    if (isSupported) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-6 font-sans transition-colors duration-500">
            <div className="max-w-md w-full relative">
                {/* Decorative background glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-10 dark:opacity-20" />

                <div className="relative bg-[#fcfcfc] dark:bg-[#111111] border border-black/5 dark:border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-red-500"
                            >
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight">Unsupported Browser</h1>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                LLM Journey requires WebAssembly and specific security features to run high-performance models directly in your browser.
                            </p>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 text-left">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">Required Browsers</span>
                                <ul className="mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                    {[
                                        { name: 'Chrome 95+', color: 'bg-blue-500' },
                                        { name: 'Firefox 102+', color: 'bg-orange-500' },
                                        { name: 'Safari 17.4+', color: 'bg-blue-400' },
                                    ].map((browser) => (
                                        <li key={browser.name} className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${browser.color}`} />
                                            {browser.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="text-xs text-gray-500 italic">
                                Note: &quot;Lockdown Mode&quot; or restrictive security extensions may block WebAssembly execution.
                            </div>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:bg-black/90 dark:hover:bg-gray-200 transition-colors duration-200 shadow-lg"
                        >
                            Retry Detection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
