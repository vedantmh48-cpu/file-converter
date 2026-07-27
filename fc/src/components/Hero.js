import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Lock, FileBox, Sparkles } from 'lucide-react';

export default function Hero() {
  const scrollToConverter = () => {
    document.getElementById('converter')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 lg:pt-0 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-100/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-50/30 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                100% Free & Client-Side
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight"
            >
              Convert Files{' '}
              <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
                Instantly
              </span>{' '}
              in Your Browser
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg lg:text-xl text-gray-500 max-w-xl mx-auto lg:mx-0"
            >
              Convert images, documents, and more — all processed locally in your browser. 
              Zero uploads, zero servers, maximum privacy.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button onClick={scrollToConverter} className="btn-primary gap-2 px-8 py-4 text-base">
                Start Converting Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={scrollToConverter} className="btn-secondary gap-2 px-8 py-4 text-base">
                <FileBox className="w-5 h-5" />
                Try Drag & Drop
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-6 justify-center lg:justify-start"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4 text-emerald-500" />
                No data leaves your device
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Zap className="w-4 h-4 text-amber-500" />
                Lightning fast processing
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4 text-blue-500" />
                End-to-end encrypted
              </div>
            </motion.div>
          </div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Floating Cards */}
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Main card */}
                <div className="absolute inset-0 card-floating p-8 flex flex-col items-center justify-center float-animation">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-xl mb-6">
                    <FileBox className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">FileFlex</h3>
                  <p className="text-gray-500 mt-2">Convert any file, instantly</p>
                  
                  {/* Mock file items */}
                  <div className="w-full mt-8 space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full" />
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-3 h-3 rounded-full bg-brand-400" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full" />
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Floating badge 1 */}
                <div className="absolute -top-4 -right-4 card-floating px-4 py-3 float-animation-delayed">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-semibold text-gray-900">2x Faster</span>
                  </div>
                </div>

                {/* Floating badge 2 */}
                <div className="absolute -bottom-4 -left-4 card-floating px-4 py-3 float-animation">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-semibold text-gray-900">100% Private</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}