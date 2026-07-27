import React from 'react';
import { 
  FileBox, Globe, Shield, 
  ArrowUpRight, Heart
} from 'lucide-react';

const popularTools = [
  { name: 'Image to PDF', action: 'image-to-pdf' },
  { name: 'JPG to PNG', action: 'jpg-to-png' },
  { name: 'PNG to WEBP', action: 'png-to-webp' },
  { name: 'PDF to Image', action: 'pdf-to-image' },
  { name: 'WebP Converter', action: 'webp-converter' },
];

const company = [
  { name: 'About Us', action: 'about' },
  { name: 'Security & Encryption', action: 'security' },
  { name: 'How It Works', action: 'how-it-works' },
  { name: 'System Status', action: 'status' },
];

const legal = [
  { name: 'Terms & Conditions', action: 'terms' },
  { name: 'Privacy Policy', action: 'privacy' },
  { name: 'Cookie Policy', action: 'cookies' },
  { name: 'GDPR Compliance', action: 'gdpr' },
];

export default function Footer({ onLegalClick }) {
  const scrollToSection = (id) => {
    if (id === 'converter' || id === 'how-it-works' || id === 'features' || id === 'security') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else if (['terms', 'privacy', 'cookies', 'gdpr'].includes(id)) {
      if (onLegalClick) onLegalClick(id);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
                  <FileBox className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  File<span className="text-brand-400">Flex</span>
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                Convert files instantly in your browser. 100% client-side processing 
                means your files never leave your device. Fast, private, and free.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3 mt-6">
                <button className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-brand-600 transition-colors group">
                  <Globe className="w-4.5 h-4.5 text-gray-400 group-hover:text-white" />
                </button>
                <button className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-brand-600 transition-colors group">
                  <Globe className="w-4.5 h-4.5 text-gray-400 group-hover:text-white" />
                </button>
              </div>

              {/* Security Badge */}
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-900/30 border border-emerald-800/50">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">100% Client-Side & Secure</span>
              </div>
            </div>

            {/* Popular Tools */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Popular Tools
              </h3>
              <ul className="space-y-3">
                {popularTools.map((tool) => (
                  <li key={tool.name}>
                    <button
                      onClick={() => scrollToSection('converter')}
                      className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1 group"
                    >
                      {tool.name}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Company & Security
              </h3>
              <ul className="space-y-3">
                {company.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => scrollToSection(item.action)}
                      className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1 group"
                    >
                      {item.name}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {legal.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => scrollToSection(item.action)}
                      className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1 group"
                    >
                      {item.name}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} FileFlex. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for privacy
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}