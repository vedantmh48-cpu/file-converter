import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Settings, CheckCircle2 } from 'lucide-react';

export default function CookieConsent({ onOpenPreferences }) {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('fileflex-cookie-consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('fileflex-cookie-consent', 'all');
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('fileflex-cookie-consent', 'essential');
    setVisible(false);
  };

  const handleOpenPreferences = () => {
    if (onOpenPreferences) {
      onOpenPreferences();
    }
    localStorage.setItem('fileflex-cookie-consent', 'preferences');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[95] p-4"
        >
          <div className="max-w-4xl mx-auto">
            <div className="glass-banner rounded-2xl p-4 lg:p-6 border border-surface-border">
              <div className="flex flex-col lg:flex-row items-start gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Cookie Preferences</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
                      We use essential cookies to ensure the website functions properly. 
                      We do not use analytics or tracking cookies. 
                      <button 
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium ml-1"
                      >
                        {showDetails ? 'Show less' : 'Learn more'}
                      </button>
                    </p>
                    
                    <AnimatePresence>
                      {showDetails && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl text-xs text-gray-600 dark:text-gray-300 space-y-2">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">Essential Cookies</p>
                                <p>Required for basic functionality. No user tracking.</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">Analytics Cookies</p>
                                <p>We do not use analytics cookies. Your activity is not tracked.</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">Marketing Cookies</p>
                                <p>We do not use marketing cookies. No ads, no tracking.</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-2 lg:flex-shrink-0 w-full lg:w-auto">
                  <button
                    onClick={handleEssentialOnly}
                    className="btn-ghost text-xs px-4 py-2.5 flex-1 lg:flex-none"
                  >
                    Essential Only
                  </button>
                  <button
                    onClick={handleOpenPreferences}
                    className="btn-secondary text-xs px-4 py-2.5 gap-1.5 flex-1 lg:flex-none"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Preferences
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="btn-primary text-xs px-4 py-2.5 flex-1 lg:flex-none"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}