import { motion, AnimatePresence } from 'framer-motion';
import { Home, RefreshCw, Wrench, Settings, Camera } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'converter', label: 'Convert', icon: RefreshCw },
  { id: 'camera-to-pdf', label: 'Scan', icon: Camera, featured: true },
  { id: 'extra-tools', label: 'Tools', icon: Wrench },
  { id: 'settings', label: 'Settings', icon: Settings, isSettings: true },
];

export default function BottomNav({ active, onNavigate, onOpenSettings }) {
  const handleClick = (item) => {
    if (item.isSettings) {
      onOpenSettings();
      return;
    }
    onNavigate(item.id);
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[90]"
      aria-label="Mobile navigation"
    >
      <div className="px-5 pb-[max(env(safe-area-inset-bottom),0.875rem)] pt-2">
        <motion.div
          initial={false}
          className="mx-auto max-w-sm rounded-[2rem] border border-brand-200/50 bg-white/75 dark:border-white/10 dark:bg-gray-900/75 backdrop-blur-2xl shadow-2xl shadow-brand-900/10 dark:shadow-black/50"
        >
          <div className="flex items-center justify-around px-2 py-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleClick(item)}
                  className={`relative flex flex-1 flex-col items-center gap-1 py-1.5 rounded-full overflow-visible ${item.featured ? '-mt-7' : ''}`}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active pill indicator with glow */}
                  {isActive && (
                    <motion.span
                      layoutId="ios-tab-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-x-3 inset-y-0 rounded-full bg-brand-500/10 dark:bg-brand-400/15"
                    />
                  )}

                  {/* Icon */}
                  <motion.span
                    animate={
                      isActive
                        ? { scale: 1.1, y: -1 }
                        : { scale: 1, y: 0 }
                    }
                    transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                    className={`relative z-10 mt-0.5 ${item.featured
                      ? 'flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-xl shadow-brand-900/25 dark:border-gray-900'
                      : isActive
                        ? 'text-brand-600 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] dark:text-brand-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    <Icon
                      className="w-[22px] h-[22px]"
                      strokeWidth={isActive ? 2.3 : 1.8}
                    />
                  </motion.span>

                  {/* Label */}
                  <AnimatePresence mode="popLayout">
                    {isActive && (
                      <motion.span
                        initial={{ y: 4, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -4, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className={`relative z-10 text-[10px] font-semibold ${
                          isActive
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
