import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sun, Moon, Monitor, Sparkles, Cookie, Trash2, Info, FileBox, Palette, Scale, ArrowUpRight
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun, desc: 'Bright & airy' },
  { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
  { value: 'system', label: 'System', icon: Monitor, desc: 'Follow your device' },
];

function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 py-3.5 px-4 rounded-xl border border-surface-border bg-white dark:bg-gray-900 dark:border-gray-800 hover:border-brand-300 dark:hover:border-gray-700 transition-colors text-left"
    >
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <span
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${
          checked ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  );
}

export default function Settings({ isOpen, onClose, onOpenLegal }) {
  const { settings, update } = useSettings();

  const openLegal = (type) => {
    if (onOpenLegal) onOpenLegal(type);
  };

  const handleResetCookieConsent = () => {
    localStorage.removeItem('fileflex-cookie-consent');
    const msg = document.getElementById('settings-feedback');
    if (msg) {
      msg.textContent = 'Cookie consent reset. The consent banner will show again on your next visit.';
      msg.classList.remove('opacity-0');
      setTimeout(() => msg.classList.add('opacity-0'), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="absolute inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-surface-border dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-sm">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Settings</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Personalize your FileFlex experience
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close settings"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
{/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              {/* Appearance */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Appearance
                  </h3>
                </div>

                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {THEME_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = settings.theme === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => update({ theme: option.value })}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                          active
                            ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/10 shadow-sm'
                            : 'border-surface-border bg-white dark:bg-gray-900 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            active
                              ? 'text-brand-600 dark:text-brand-400'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            active
                              ? 'text-brand-700 dark:text-brand-300'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {THEME_OPTIONS.find((o) => o.value === settings.theme)?.desc} — applied instantly.
                </p>

                <div className="mt-5">
                  <Toggle
                    checked={settings.reduceMotion}
                    onChange={(v) => update({ reduceMotion: v })}
                    label="Reduce animations"
                    description="Turns off decorative motion for a calmer experience."
                  />
                </div>
              </section>
{/* Privacy */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Cookie className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Privacy & Cookies
                  </h3>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => openLegal('cookies')}
                    className="w-full flex items-center justify-between gap-4 py-3.5 px-4 rounded-xl border border-surface-border bg-white dark:bg-gray-900 dark:border-gray-800 hover:border-brand-300 dark:hover:border-gray-700 transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        Cookie preferences
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Review exactly what we store on your device.
                      </p>
                    </div>
                    <Cookie className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>

                  <button
                    onClick={handleResetCookieConsent}
                    className="w-full flex items-center justify-between gap-4 py-3.5 px-4 rounded-xl border border-surface-border bg-white dark:bg-gray-900 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-500/40 transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        Reset cookie consent
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Show the consent banner again on your next visit.
                      </p>
                    </div>
                    <Trash2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>

                  <p
                    id="settings-feedback"
                    className="text-xs font-medium text-emerald-600 dark:text-emerald-400 opacity-0 transition-opacity duration-300"
                  >
                    &nbsp;
                  </p>
                </div>
              </section>

              {/* Legal */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Legal
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { type: 'terms', label: 'Terms & Conditions' },
                    { type: 'privacy', label: 'Privacy Policy' },
                    { type: 'gdpr', label: 'GDPR Compliance' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => openLegal(item.type)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl border border-surface-border bg-white dark:bg-gray-900 dark:border-gray-800 hover:border-brand-300 dark:hover:border-gray-700 transition-colors text-left group"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </section>

              {/* About */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    About
                  </h3>
                </div>
                <div className="rounded-2xl border border-surface-border dark:border-gray-800 p-4 bg-gray-50/60 dark:bg-gray-950/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                      <FileBox className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        File<span className="text-brand-600">Flex</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Free & client-side file converter
                      </p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <li className="flex justify-between">
                      <span>Version</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">1.0.0</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Processing</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">100% in-browser</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Data transfer</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">None — ever</span>
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}