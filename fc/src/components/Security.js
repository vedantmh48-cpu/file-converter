import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Server, Eye, FileSearch, Cpu, CheckCircle2 } from 'lucide-react';

const points = [
  {
    icon: Cpu,
    title: 'Client-Side Processing',
    description: 'All file conversions happen entirely in your browser using JavaScript and WebAssembly. Your files never touch any server.',
  },
  {
    icon: Server,
    title: 'Zero Data Transfer',
    description: 'No uploads, no storage, no data transmission. Your files stay on your device from start to finish.',
  },
  {
    icon: Eye,
    title: 'No Tracking',
    description: 'We do not track, store, or analyze your files. No cookies are used for file processing. Your privacy is absolute.',
  },
  {
    icon: Lock,
    title: 'End-to-End Privacy',
    description: 'Even we cannot access your files. The entire conversion process is contained within your browser session.',
  },
  {
    icon: FileSearch,
    title: 'Open & Transparent',
    description: 'Our conversion logic runs in plain sight. No hidden processes, no background services, no data collection.',
  },
  {
    icon: Shield,
    title: 'Enterprise-Grade Security',
    description: 'Built with modern web security best practices. HTTPS enforced, no third-party scripts for file processing.',
  },
];

export default function Security() {
  return (
    <section id="security" className="py-20 lg:py-28 bg-surface-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Your Privacy is Our Priority
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-4">
            Security & Privacy
          </h2>
          <p className="mt-3 text-gray-500 text-lg max-w-2xl mx-auto">
            We take your privacy seriously. FileFlex is designed from the ground up to ensure your files remain yours and yours alone.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {points.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="card p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <point.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">{point.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{point.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certification badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap justify-center gap-8"
        >
          {[
            { label: '100% Client-Side', desc: 'No server processing' },
            { label: 'Zero Data Storage', desc: 'Files never saved' },
            { label: 'Open Source', desc: 'Transparent code' },
            { label: 'GDPR Compliant', desc: 'Privacy by design' },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white border border-surface-border shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{badge.label}</p>
                <p className="text-xs text-gray-400">{badge.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}