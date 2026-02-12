'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { journeyStages, homeNavItem } from '@/lib/journey-stages'

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [showHamburger, setShowHamburger] = useState(true)
  const isOpenRef = useRef(isOpen)
  const shouldReduceMotion = useReducedMotion()

  // Keep ref in sync with state
  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

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

  // Close menu when pathname changes (on mobile)
  useEffect(() => {
    if (isOpenRef.current) {
      handleClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Animation variants
  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 }
  const navVariants: Variants = shouldReduceMotion
    ? {
      closed: { x: '-100%' },
      open: { x: 0 },
    }
    : {
      closed: { x: '-100%', transition: springTransition },
      open: { x: 0, transition: springTransition },
    }

  const backdropVariants = shouldReduceMotion
    ? {
      closed: { opacity: 0 },
      open: { opacity: 1 },
    }
    : {
      closed: { opacity: 0, transition: { duration: 0.2 } },
      open: { opacity: 1, transition: { duration: 0.3 } },
    }

  const hamburgerVariants = shouldReduceMotion
    ? {}
    : {
      hover: { scale: 1.05 },
      tap: { scale: 0.95 },
    }

  return (
    <>
      {/* Hamburger Button - visible only on small screens when navbar is closed */}
      <AnimatePresence>
        {showHamburger && !isOpen && (
          <motion.button
            onClick={handleOpen}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={hamburgerVariants.hover}
            whileTap={hamburgerVariants.tap}
            className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-xl bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.1] shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Toggle menu"
          >
            {/* Subtle gradient glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl" />
            <svg
              className="relative w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Backdrop - visible only on small screens when menu is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Navbar - Desktop: always visible, Mobile: animated slide-in */}
      <>
        {/* Desktop Navbar - static positioning */}
        <nav className="hidden md:flex h-full w-64 border-r border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-[#111111]/80 backdrop-blur-2xl flex-col relative">
          {/* Subtle gradient accent at top */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

          <div className="p-4 border-b border-black/[0.08] dark:border-white/[0.08]">
            <Link
              href="/"
              className="text-xl font-semibold px-3 py-2 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors duration-200 block"
            >
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                LLM Journey
              </span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <div className="flex flex-col space-y-1 px-2">
              {/* Home navigation item */}
              <NavLink
                href={homeNavItem.href}
                isActive={pathname === homeNavItem.href}
                icon={homeNavItem.icon}
                title={homeNavItem.title}
                shouldReduceMotion={shouldReduceMotion}
              />
              {/* Journey stages */}
              {journeyStages.map((stage) => (
                <NavLink
                  key={stage.href}
                  href={stage.href}
                  isActive={pathname === stage.href}
                  icon={stage.icon}
                  title={stage.title}
                  shouldReduceMotion={shouldReduceMotion}
                />
              ))}
            </div>
          </div>
        </nav>

        {/* Mobile Navbar - animated */}
        <AnimatePresence>
          {(isOpen || !showHamburger) && (
            <motion.nav
              variants={navVariants}
              initial="closed"
              animate={isOpen ? 'open' : 'closed'}
              exit="closed"
              className="fixed md:hidden h-full w-64 border-r border-black/[0.08] dark:border-white/[0.08] bg-white/95 dark:bg-[#111111]/95 backdrop-blur-2xl flex flex-col z-50 shadow-2xl"
            >
              {/* Subtle gradient accent at top */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

              <div className="p-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
                <Link
                  href="/"
                  className="text-xl font-semibold px-3 py-2 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors duration-200 block"
                >
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    LLM Journey
                  </span>
                </Link>
                {/* Close Button */}
                <motion.button
                  onClick={handleClose}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors duration-200"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <div className="flex flex-col space-y-1 px-2">
                  {/* Home navigation item */}
                  <NavLink
                    href={homeNavItem.href}
                    isActive={pathname === homeNavItem.href}
                    icon={homeNavItem.icon}
                    title={homeNavItem.title}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                  {/* Journey stages */}
                  {journeyStages.map((stage) => (
                    <NavLink
                      key={stage.href}
                      href={stage.href}
                      isActive={pathname === stage.href}
                      icon={stage.icon}
                      title={stage.title}
                      shouldReduceMotion={shouldReduceMotion}
                    />
                  ))}
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </>
    </>
  )
}

// Extracted NavLink component for cleaner code and consistent styling
interface NavLinkProps {
  href: string
  isActive: boolean
  icon: React.ComponentType<{ className?: string }>
  title: string
  shouldReduceMotion: boolean | null
}

function NavLink({ href, isActive, icon: Icon, title, shouldReduceMotion }: NavLinkProps) {
  return (
    <Link href={href} className="relative group">
      {/* Active state gradient glow */}
      {isActive && (
        <motion.div
          layoutId="activeNavGlow"
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-lg"
          transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      <motion.div
        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive
            ? 'text-foreground'
            : 'text-foreground/60 hover:text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
          }`}
        whileHover={shouldReduceMotion ? {} : { x: 2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Icon className={`w-4 h-4 transition-colors duration-200 ${isActive ? 'text-blue-500' : ''}`} />
        <span>{title}</span>
      </motion.div>
    </Link>
  )
}
