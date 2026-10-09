import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Shield, Image, Download,
  Lock, Infinity, Merge,
  Palette
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Instant, in-browser processing.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: '100% Private',
    description: 'Files never leave your device.',
    color: 'from-emerald-500 to-green-500',
  },
  {
    icon: Image,
    title: 'Image to PDF',
    description: 'Merge images into polished PDFs.',
    color: 'from-brand-500 to-violet-500',
  },
  {
    icon: Palette,
    title: 'Format Converter',
    description: 'JPG, PNG, WEBP, ICO & more.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Merge,
    title: 'Batch Processing',
    description: 'Bulk convert & download as ZIP.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Lock,
    title: 'No Sign-Up',
    description: 'Just open the page and convert.',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    icon: Infinity,
    title: 'Unlimited & Free',
    description: 'No trial caps, no limits — ever.',
    color: 'from-teal-500 to-emerald-500',
  },
  {
    icon: Download,
    title: 'High Quality',
    description: 'Lossless, original quality kept.',
    color: 'from-red-500 to-pink-500',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-info">Why FileFlex</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-50 mt-4">
            Everything You Need
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Fast. Private. Unlimited.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="card p-6 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg transition-all duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
