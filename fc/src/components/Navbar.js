import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileBox, ChevronDown, Menu, X, 
  Image, FileImage, FileType, 
  ArrowRight, FileUp, FileArchive, Link2
} from 'lucide-react';

const tools = [
  { name: 'Image to PDF', icon: Image, desc: 'Convert images to PDF' },
  { name: 'Convert to JPG', icon: FileImage, desc: 'Convert any image to JPG' },
  { name: 'Convert to PNG', icon: FileImage, desc: 'Convert any image to PNG' },
  { name: 'Compress PDF', icon: FileType, desc: 'Reduce PDF file size' },
  { name: 'File Extender', icon: FileUp, desc: 'Convert between formats' },
  { name: 'File Compressor', icon: FileArchive, desc: 'Compress images, PDFs & more' },
  { name: 'File to Link', icon: Link2, desc: 'Generate shareable file links' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToConverter = () => {
    document.getElementById('converter')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTool = (toolName) => {
    if (toolName === 'File Compressor' || toolName === 'File to Link') {
      document.getElementById('extra-tools')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      scrollToConverter();
    }
    setToolsOpen(false);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-surface-border' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <FileBox className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              File<span className="text-brand-600">Flex</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Tools Dropdown */}
            <div className="relative"
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
            >
              <button className="btn-ghost gap-1.5">
                Tools
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {toolsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-72 card-floating p-2 shadow-xl"
                  >
                    {tools.map((tool) => (
                      <button
                        key={tool.name}
                        onClick={() => scrollToTool(tool.name)}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                          <tool.icon className="w-4.5 h-4.5 text-brand-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tool.name}</p>
                          <p className="text-xs text-gray-500">{tool.desc}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => scrollToSection('how-it-works')} className="btn-ghost">How It Works</button>
            <button onClick={() => scrollToSection('features')} className="btn-ghost">Features</button>
            <button onClick={() => scrollToSection('security')} className="btn-ghost">Security & Privacy</button>
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button onClick={scrollToConverter} className="btn-primary hidden sm:inline-flex gap-2">
              Convert Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-surface-border bg-white shadow-lg"
          >
            <div className="px-4 py-4 space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Tools</p>
              {tools.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => { scrollToTool(tool.name); setMobileOpen(false); }}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <tool.icon className="w-4.5 h-4.5 text-brand-600" />
                  <span className="text-sm font-medium text-gray-700">{tool.name}</span>
                </button>
              ))}
              <div className="border-t border-surface-border my-3" />
              <button onClick={() => scrollToSection('how-it-works')} className="btn-ghost w-full justify-start">How It Works</button>
              <button onClick={() => scrollToSection('features')} className="btn-ghost w-full justify-start">Features</button>
              <button onClick={() => scrollToSection('security')} className="btn-ghost w-full justify-start">Security & Privacy</button>
              <div className="pt-2">
                <button onClick={scrollToConverter} className="btn-primary w-full gap-2">
                  Convert Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}