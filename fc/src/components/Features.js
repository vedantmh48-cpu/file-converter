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
    description: 'Client-side processing means instant conversions with no waiting for uploads or server queues.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: '100% Private',
    description: 'Your files never leave your device. All processing happens locally in your browser.',
    color: 'from-emerald-500 to-green-500',
  },
  {
    icon: Image,
    title: 'Image to PDF',
    description: 'Convert single or multiple images into merged or separate PDFs with ease.',
    color: 'from-brand-500 to-violet-500',
  },
  {
    icon: Palette,
    title: 'Format Converter',
    description: 'Convert between JPG, PNG, WEBP, BMP, TIFF, ICO, and more image formats.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Merge,
    title: 'Batch Processing',
    description: 'Process multiple files at once and download them all as a single ZIP archive.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Lock,
    title: 'No Sign-Up Required',
    description: 'Start converting immediately. No accounts, no emails, no data collection.',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    icon: Infinity,
    title: 'Unlimited Usage',
    description: 'No file size limits, no daily caps, no premium tiers. Convert as much as you need.',
    color: 'from-teal-500 to-emerald-500',
  },
  {
    icon: Download,
    title: 'High Quality',
    description: 'Lossless conversions that preserve original quality and resolution.',
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
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-4">
            Powerful Features, Zero Compromise
          </h2>
          <p className="mt-3 text-gray-500 text-lg max-w-xl mx-auto">
            Everything you need for file conversion, built with privacy and performance in mind.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="card p-6 group hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-shadow`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}