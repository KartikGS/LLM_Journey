'use client';

import React, { useEffect, useState } from 'react';

interface BrowserGuardProps {
    children: React.ReactNode;
}

export const BrowserGuard: React.FC<BrowserGuardProps> = ({ children }) => {
    const [isSupported, setIsSupported] = useState<boolean | null>(null);

    useEffect(() => {
        /**
         * Verifies if the browser supports WebAssembly and if the Content Security Policy (CSP)
         * allows for its execution. 
         * 
         * We specifically use `new WebAssembly.Module(...)` because it triggers a 
         * 'wasm-unsafe-eval' violation if blocked by CSP. Simple feature detection 
         * like `typeof WebAssembly !== 'undefined'` is insufficient as it doesn't 
         * account for runtime security restrictions which are critical for our ONNX execution.
         */
        const checkWasmSupport = () => {
            try {
                if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
                    // Minimal WASM binary: magic number and version
                    const wasmModule = new WebAssembly.Module(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]));
                    if (wasmModule instanceof WebAssembly.Module) {
                        return true;
                    }
                }
            } catch (e) {
                console.warn('WASM Support check failed (likely CSP or hardware limitation):', e);
                return false;
            }
            return false;
        };

        setIsSupported(checkWasmSupport());
    }, []);

    if (isSupported === null) {
        // Initializing check - show nothing to avoid flicker
        return <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#0a0a0a]" />;
    }

    if (isSupported) {
        return <>{children}</>;
    }

    return (
        <div
            id="browser-support-fallback"
            className="min-h-screen bg-[#fcfcfc] dark:bg-[#0a0a0a] flex items-center justify-center p-6 font-sans transition-colors duration-700 overflow-hidden animate-fade-in"
        >
            {/* Premium Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="max-w-md w-full relative group">
                {/* Dynamic Gradient Border Glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-[2rem] blur opacity-20 dark:opacity-30 group-hover:opacity-40 transition duration-1000" />

                <div className="relative bg-white/80 dark:bg-[#111111]/80 border border-black/5 dark:border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:shadow-blue-500/5">
                    <div className="flex flex-col items-center text-center space-y-8">

                        {/* Hero Icon with Pulse Status */}
                        <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-inner">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="36"
                                    height="36"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-red-500 drop-shadow-sm"
                                >
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 border-4 border-white dark:border-[#111111] rounded-full shadow-lg">
                                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight leading-tight">
                                High-Performance <br /> Environment Required
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-[280px] mx-auto">
                                To safely execute on-device LLMs, we require advanced WebAssembly features.
                            </p>
                        </div>

                        <div className="w-full space-y-5">
                            <div className="p-6 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/5 dark:border-white/5 text-left transition-all hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Verified Standards</span>
                                    <div className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">Incompatible</div>
                                </div>
                                <ul className="space-y-3">
                                    {[
                                        { name: 'Chrome 95+', brand: 'bg-blue-500' },
                                        { name: 'Firefox 102+', brand: 'bg-orange-500' },
                                        { name: 'Safari 17.4+', brand: 'bg-blue-400' },
                                    ].map((browser) => (
                                        <li key={browser.name} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{browser.name}</span>
                                            <div className={`w-1.5 h-1.5 rounded-full ${browser.brand} shadow-[0_0_8px_currentColor] opacity-60`} />
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex items-start gap-3 px-2">
                                <div className="mt-1 w-4 h-4 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                </div>
                                <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-normal italic">
                                    Security extensions or &quot;Lockdown Mode&quot; may prevent execution even on supported hardware.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 px-6 bg-black dark:bg-white text-white dark:text-black font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_20px_-5px_rgba(255,255,255,0.05)]"
                        >
                            Retry Environment Audit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

