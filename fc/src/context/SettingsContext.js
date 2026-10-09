import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SettingsContext = createContext(null);
const STORAGE_KEY = 'fileflex-settings';

const getSystemTheme = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

const resolveTheme = (theme) => (theme === 'system' ? getSystemTheme() : theme);

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { theme: 'system', reduceMotion: false, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load settings', e);
  }
  return { theme: 'system', reduceMotion: false };
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  // Persist + apply settings whenever they change
  useEffect(() => {
    const root = document.documentElement;
    const resolved = resolveTheme(settings.theme);
    root.classList.toggle('dark', resolved === 'dark');
    root.style.colorScheme = resolved;
    root.classList.toggle('reduce-motion', settings.reduceMotion === true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to persist settings', e);
    }
  }, [settings]);

  // Follow OS scheme changes when in "system" mode
  useEffect(() => {
    if (settings.theme !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      const resolved = getSystemTheme();
      const root = document.documentElement;
      root.classList.toggle('dark', resolved === 'dark');
      root.style.colorScheme = resolved;
    };
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [settings.theme]);

  const update = (patch) => setSettings((prev) => ({ ...prev, ...patch }));
  const value = useMemo(() => ({ settings, update }), [settings]);

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}