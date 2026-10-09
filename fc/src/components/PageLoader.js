import React from 'react';
import { motion } from 'framer-motion';
import { FileBox, FileUp, Wrench, Sparkles } from 'lucide-react';

const PAGE_LOADING_STATES = {
  home: {
    title: 'Preparing your workspace',
    message: 'Getting FileFlex ready for you.',
    icon: Sparkles,
    color: 'from-violet-500 to-brand-500',
    accent: 'bg-violet-400',
  },
  convert: {
    title: 'Opening file converter',
    message: 'Preparing your private, in-browser conversion tools.',
    icon: FileUp,
    color: 'from-brand-500 to-cyan-500',
    accent: 'bg-brand-400',
  },
  tools: {
    title: 'Loading file tools',
    message: 'Getting your compression and sharing tools ready.',
    icon: Wrench,
    color: 'from-emerald-500 to-teal-500',
    accent: 'bg-emerald-400',
  },
};

export default function PageLoader({ page = 'home' }) {
  const state = PAGE_LOADING_STATES[page] || PAGE_LOADING_STATES.home;
  const Icon = state.icon;

  return (
    <motion.main
      key={page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[100svh] flex items-center justify-center overflow-hidden px-6 bg-gray-50 dark:bg-gray-950"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative w-full max-w-sm text-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className={`relative z-10 mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br ${state.color} shadow-xl shadow-brand-900/15`}
        >
          <Icon className="h-9 w-9 text-white" strokeWidth={1.8} />
        </motion.div>

        <div className="absolute left-1/2 top-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="mb-2 flex items-center justify-center gap-2 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
          <FileBox className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          FileFlex
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{state.title}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{state.message}</p>

        <div className="mx-auto mt-8 flex w-32 items-center justify-center gap-2" role="presentation">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              animate={{ y: [0, -7, 0], opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: dot * 0.14, ease: 'easeInOut' }}
              className={`h-2 w-2 rounded-full ${state.accent}`}
            />
          ))}
        </div>
      </div>
    </motion.main>
  );
}
