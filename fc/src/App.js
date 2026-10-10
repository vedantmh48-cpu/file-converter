import React, { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Converter from './components/Converter';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import ExtraTools from './components/ExtraTools';
import OCRScanner from './components/OCRScanner';
import PageLoader from './components/PageLoader';
import CookieConsent from './components/CookieConsent';
import LegalModal from './components/LegalModal';
import SettingsPanel from './components/Settings';
import BottomNav from './components/BottomNav';
import { useSettings } from './context/SettingsContext';
import ErrorBoundary from './components/ErrorBoundary';

const SECTIONS = ['home', 'converter', 'ocr-scanner', 'how-it-works', 'features', 'extra-tools'];

function AppContent() {
  const { settings } = useSettings();
  const [pageLoading, setPageLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [legalModal, setLegalModal] = useState({ isOpen: false, type: 'privacy' });
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setPageLoading(false), 550);
    return () => window.clearTimeout(timer);
  }, []);

  // Scroll to a section instead of switching pages — everything lives on one page.
  const scrollToSection = (id) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection('home');
      return;
    }
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Scroll spy — highlight the section currently in view in the bottom nav.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
        if (window.scrollY < 10) setActiveSection('home');
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pageLoading]);

  const openLegalModal = (type) => setLegalModal({ isOpen: true, type });
  const closeLegalModal = () => setLegalModal({ isOpen: false, type: 'privacy' });

  return (
    <MotionConfig reducedMotion={settings.reduceMotion ? 'always' : 'never'}>
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <AnimatePresence mode="wait">
          {pageLoading && <PageLoader key="loader" page="home" />}
        </AnimatePresence>

        {!pageLoading && (
          <>
            <Navbar active={activeSection} onNavigate={scrollToSection} onOpenSettings={() => setSettingsOpen(true)} />
            <main className="min-h-screen pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0">
              <Hero onNavigate={scrollToSection} />
              <Converter />
              <OCRScanner />
              <HowItWorks />
              <Features />
              <ExtraTools />
            </main>
            <BottomNav
              active={activeSection}
              onNavigate={scrollToSection}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          </>
        )}

        {/* Settings panel */}
        <SettingsPanel
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onOpenLegal={(type) => {
            setSettingsOpen(false);
            openLegalModal(type);
          }}
        />

        <CookieConsent onOpenPreferences={() => openLegalModal('cookies')} />

        <LegalModal
          isOpen={legalModal.isOpen}
          onClose={closeLegalModal}
          type={legalModal.type}
        />
      </div>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
