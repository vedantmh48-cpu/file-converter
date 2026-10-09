import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Settings, Sun, Moon,
  Image, FileImage, FileType,
  ArrowRight, FileUp, FileArchive, Link2
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import logo from '../logo.png';

const tools = [
  { name: 'Image to PDF', icon: Image, desc: 'Convert images to PDF' },
  { name: 'Convert to JPG', icon: FileImage, desc: 'Convert any image to JPG' },
  { name: 'Convert to PNG', icon: FileImage, desc: 'Convert any image to PNG' },
  { name: 'Compress PDF', icon: FileType, desc: 'Reduce PDF file size' },
  { name: 'File Extender', icon: FileUp, desc: 'Convert between formats' },
  { name: 'File Compressor', icon: FileArchive, desc: 'Compress images, PDFs & more' },
  { name: 'File to Link', icon: Link2, desc: 'Generate shareable file links' },
];

export default function Navbar({ active, onNavigate, onOpenSettings }) {
  const { settings, update } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    update({ theme: isDark ? 'light' : 'dark' });
  };

  const scrollToTool = (toolName) => {
    onNavigate(['File Compressor', 'File to Link'].includes(toolName) ? 'extra-tools' : 'converter');
    setToolsOpen(false);
  };

  const navLinkClass = (id) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active === id
        ? 'text-brand-600 dark:text-brand-400'
        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
    }`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-300 ${
      scrolled
        ? 'bg-white/85 dark:bg-gray-950/80 backdrop-blur-2xl shadow-sm border-b border-surface-border dark:border-gray-800'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-[4.5rem]">
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group">
            <img src={logo} alt="FileFlex" className="w-9 h-9 rounded-xl object-contain group-hover:scale-105 transition-transform" />
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              File<span className="text-brand-600">Flex</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            <div className="relative"
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
            >
              <button className="btn-ghost">
                <span className="flex items-center gap-1.5">
                  Tools
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} />
                </span>
              </button>
              <AnimatePresence>
                {toolsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 p-2 rounded-2xl bg-white dark:bg-gray-900 border border-surface-border dark:border-gray-800 shadow-xl"
                  >
                    {tools.map((tool) => (
                      <button
                        key={tool.name}
                        onClick={() => scrollToTool(tool.name)}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-500/20 transition-colors">
                          <tool.icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{tool.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{tool.desc}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => onNavigate('converter')} className={navLinkClass('converter')}>Convert</button>
            <button onClick={() => onNavigate('features')} className={navLinkClass('features')}>Features</button>
            <button onClick={() => onNavigate('extra-tools')} className={navLinkClass('extra-tools')}>All Tools</button>
          </div>
{/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Open settings"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={() => onNavigate('converter')} className="btn-primary hidden sm:inline-flex gap-2">
              Convert Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
