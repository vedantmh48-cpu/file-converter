import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Converter from './components/Converter';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Security from './components/Security';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import LegalModal from './components/LegalModal';

function App() {
  const [legalModal, setLegalModal] = useState({ isOpen: false, type: 'privacy' });

  const openLegalModal = (type) => {
    setLegalModal({ isOpen: true, type });
  };

  const closeLegalModal = () => {
    setLegalModal({ isOpen: false, type: 'privacy' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <Hero />
        <Converter />
        <HowItWorks />
        <Features />
        <Security />
      </main>

      <Footer onLegalClick={openLegalModal} />
      
      <CookieConsent onOpenPreferences={() => openLegalModal('cookies')} />
      
      <LegalModal 
        isOpen={legalModal.isOpen} 
        onClose={closeLegalModal} 
        type={legalModal.type} 
      />
    </div>
  );
}

export default App;