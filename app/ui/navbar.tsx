'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Transformer', href: '/transformer' },
  { name: 'Training', href: '/training' },
  { name: 'Fine-tuning', href: '/fine-tuning' },
  { name: 'Tools', href: '/tools' },
  { name: 'RAG', href: '/rag' },
  { name: 'Agents', href: '/agents' },
  { name: 'MCP', href: '/mcps' },
  { name: 'Deployment', href: '/deployment' },
  { name: 'Safety', href: '/safety' },
  { name: 'Evaluation', href: '/evaluation' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [showHamburger, setShowHamburger] = useState(true)

  // Close menu when pathname changes (on mobile)
  useEffect(() => {
    if (isOpen) {
      handleClose()
    }
  }, [pathname])

  const handleClose = () => {
    setIsOpen(false)
    setShowHamburger(false)
    // Show hamburger after navbar closes (300ms matches transition duration)
    setTimeout(() => {
      setShowHamburger(true)
    }, 300)
  }

  const handleOpen = () => {
    setShowHamburger(false)
    setIsOpen(true)
  }

  return (
    <>
      {/* Hamburger Button - visible only on small screens when navbar is closed */}
      {showHamburger && !isOpen && (
        <button
          onClick={handleOpen}
          className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-white/[.8] dark:bg-black/[.8] backdrop-blur-sm border border-black/[.08] dark:border-white/[.145] hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Backdrop - visible only on small screens when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={handleClose}
        />
      )}

      {/* Navbar */}
      <nav
        className={`fixed md:static h-full w-64 border-r border-black/[.08] dark:border-white/[.145] bg-white/[.8] dark:bg-black/[.8] backdrop-blur-sm flex flex-col z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="p-4 border-b border-black/[.08] dark:border-white/[.145] flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold px-3 py-2 rounded-md hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors block"
          >
            LLM Journey
          </Link>
          {/* Close Button - visible only on small screens when navbar is open */}
          {isOpen && (
            <button
              onClick={handleClose}
              className="md:hidden p-2 rounded-md hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="flex flex-col space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                      ? 'bg-black/[.05] dark:bg-white/[.06] text-foreground'
                      : 'text-foreground/70 hover:text-foreground hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]'
                    }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}