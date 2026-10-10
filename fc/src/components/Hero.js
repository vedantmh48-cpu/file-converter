import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, FileBox } from 'lucide-react';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

export default function Hero({ onNavigate }) {
  return (
    <section id="home" className="relative min-h-[92vh] flex items-center pt-24 lg:pt-28 pb-20 overflow-hidden">
      {/* Cinematic background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-brand-100/60 dark:bg-brand-500/10 rounded-full blur-3xl glow-pulse" />
        <div className="absolute -bottom-44 -left-44 w-[28rem] h-[28rem] bg-violet-100/60 dark:bg-violet-500/10 rounded-full blur-3xl glow-pulse" style={{ animationDelay: '1.4s' }} />
        <div className="absolute top-1/3 left-1/4 w-44 h-44 bg-fuchsia-200/50 dark:bg-fuchsia-500/10 rounded-full blur-2xl glow-drift" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:56px_56px] dark:bg-[linear-gradient(rgba(129,140,248,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(129,140,248,0.05)_1px,transparent_1px)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div variants={container} initial="hidden" animate="show" className="text-center lg:text-left">
            <motion.h1
              variants={item}
              className="mt-0 text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-[4.25rem] font-extrabold text-gray-900 dark:text-gray-50"
            >
              Convert files{' '}
              <span className="animated-gradient-text bg-gradient-to-r from-brand-600 via-violet-600 to-brand-500 dark:from-brand-400 dark:via-violet-400 dark:to-brand-300 bg-clip-text text-transparent">
                beautifully
              </span>{' '}
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-5 text-lg lg:text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto lg:mx-0"
            >
              Images, PDFs &amp; docs — converted instantly. Nothing leaves your device.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('converter')}
                className="btn-primary gap-2 px-8 py-4 text-base"
              >
                Start Converting Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('converter')}
                className="btn-secondary gap-2 px-8 py-4 text-base"
              >
                <FileBox className="w-5 h-5" />
                Try Drag &amp; Drop
              </motion.button>
            </motion.div>
          </motion.div>
{/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.25 }}
            className="hidden lg:flex"
          >
            <div className="relative w-full max-w-lg mx-auto">
              <div className="relative aspect-square">
                {/* Glass file card — intentionally text-free */}
                <div className="absolute inset-4 rounded-[3rem] bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border border-white/60 dark:border-white/10 hero-card-glow flex flex-col items-center justify-center gap-10 float-animation">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-brand-600/30">
                    <FileBox className="w-12 h-12 text-white" />
                  </div>

                  <div className="w-4/5 space-y-5">
                    {[
                      { dot: 'bg-emerald-400', width: '100%', delay: 0 },
                      { dot: 'bg-brand-400', width: '70%', delay: 0.15 },
                      { dot: 'bg-amber-400', width: '40%', delay: 0.3 },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className={`w-3 h-3 rounded-full ${row.dot} shadow-sm`} />
                        <div className="relative flex-1 h-2 rounded-full bg-gray-200/80 dark:bg-gray-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: row.width }}
                            transition={{ type: 'spring', stiffness: 120, damping: 22, delay: 0.6 + i * 0.2 }}
                            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${
                              i === 0
                                ? 'from-emerald-400 to-emerald-500'
                                : i === 1
                                ? 'from-brand-400 to-brand-500'
                                : 'from-amber-400 to-amber-500'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating stat chips */}
                <div className="absolute top-8 -right-2 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg px-4 py-2.5 flex items-center gap-2 float-animation-delayed">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">2× Faster</span>
                </div>
                <div className="absolute bottom-10 -left-2 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg px-4 py-2.5 flex items-center gap-2 float-animation">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">100% Private</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
