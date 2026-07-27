import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Settings2, Download, Shield, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Your File',
    description: 'Drag & drop or select files from your device. We support images, PDFs, and text files.',
    color: 'from-brand-500 to-violet-500',
  },
  {
    icon: Settings2,
    title: 'Choose Format',
    description: 'Select your target format from our wide range of supported conversion options.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Download,
    title: 'Download Instantly',
    description: 'Your converted file is ready immediately. All processing happens locally in your browser.',
    color: 'from-purple-500 to-brand-500',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-surface-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-info">Simple Process</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-4">
            How It Works
          </h2>
          <p className="mt-3 text-gray-500 text-lg max-w-xl mx-auto">
            Three simple steps to convert your files. No sign-up, no uploads, no hassle.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-brand-200 to-brand-300">
                  <ArrowRight className="absolute right-0 -top-2 w-4 h-4 text-brand-400" />
                </div>
              )}

              <div className="card p-8 text-center relative">
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center shadow-md">
                  {index + 1}
                </div>

                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-surface-border shadow-sm">
            <Shield className="w-6 h-6 text-emerald-500" />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Your Privacy Matters</p>
              <p className="text-xs text-gray-500">Files never leave your device. 100% client-side processing.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}