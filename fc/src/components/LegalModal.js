import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Cookie, Scale } from 'lucide-react';

const legalContent = {
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    lastUpdated: 'July 25, 2026',
    content: `
      <h3>1. Introduction</h3>
      <p>FileFlex ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle your data when you use our file conversion service.</p>

      <h3>2. Data Processing Philosophy</h3>
      <p><strong>We do not collect, store, or process your files on our servers.</strong> FileFlex is designed as a client-side application. All file conversion operations are performed entirely within your web browser using JavaScript and WebAssembly technologies.</p>

      <h3>3. What Data We Collect</h3>
      <p><strong>We collect absolutely no personal data.</strong> We do not require registration, email addresses, or any personal information to use our service. We do not use analytics trackers, cookies for tracking purposes, or any form of user surveillance.</p>

      <h3>4. How Your Files Are Processed</h3>
      <p>When you use FileFlex:</p>
      <ul>
        <li>Your files are read directly by your browser</li>
        <li>All conversion logic executes locally on your device</li>
        <li>Your files are never transmitted over the network</li>
        <li>No copies of your files are stored anywhere</li>
        <li>Once you close your browser tab, all temporary data is automatically cleared</li>
      </ul>

      <h3>5. Local Storage</h3>
      <p>We use localStorage solely to remember your cookie preferences. This is a small text value stored on your device that you can clear at any time through your browser settings.</p>

      <h3>6. Third-Party Services</h3>
      <p>FileFlex does not integrate with any third-party analytics, advertising, or tracking services. We use no external APIs for file processing. All libraries used (jsPDF, pdf-lib, JSZip) run entirely client-side.</p>

      <h3>7. Data Security</h3>
      <p>Since your files never leave your device, there is no risk of data interception, unauthorized access, or data breaches on our end. Your privacy is absolute and inherent to our architecture.</p>

      <h3>8. Children's Privacy</h3>
      <p>Our service is safe for all ages as we collect no data from any user, including children under 13.</p>

      <h3>9. Changes to This Policy</h3>
      <p>We may update this Privacy Policy occasionally. Any changes will be posted on this page with an updated revision date.</p>

      <h3>10. Contact</h3>
      <p>If you have questions about this Privacy Policy, please contact us through our GitHub repository.</p>
    `
  },
  terms: {
    title: 'Terms & Conditions',
    icon: Scale,
    lastUpdated: 'July 25, 2026',
    content: `
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing or using FileFlex, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our service.</p>

      <h3>2. Service Description</h3>
      <p>FileFlex provides a client-side file conversion tool that operates entirely within your web browser. We do not store, transmit, or process files on any server.</p>

      <h3>3. User Responsibilities</h3>
      <p>You agree to:</p>
      <ul>
        <li>Use the service only for lawful purposes</li>
        <li>Not attempt to reverse-engineer or abuse the service</li>
        <li>Not use the service to convert copyrighted material without authorization</li>
        <li>Not attempt to upload malicious code or files</li>
      </ul>

      <h3>4. Intellectual Property</h3>
      <p>FileFlex and its original content, features, and functionality are owned by us and are protected by applicable copyright and intellectual property laws.</p>

      <h3>5. Limitation of Liability</h3>
      <p>FileFlex is provided "as is" without warranties of any kind. We shall not be liable for any damages arising from the use or inability to use our service. Since all processing is client-side, we have no control over the files you convert or the results produced.</p>

      <h3>6. No Guarantee of Results</h3>
      <p>While we strive for accurate conversions, we do not guarantee that converted files will be error-free or meet specific requirements. Users should verify important conversions.</p>

      <h3>7. Prohibited Uses</h3>
      <p>You may not use FileFlex for any illegal purpose, to harass others, to distribute malware, or in any way that could damage our service or impair others' use.</p>

      <h3>8. Termination</h3>
      <p>We reserve the right to modify or discontinue the service at any time without notice. We are not liable to you or any third party for any modification or discontinuation.</p>

      <h3>9. Governing Law</h3>
      <p>These terms shall be governed by applicable international laws. Any disputes shall be resolved through binding arbitration.</p>

      <h3>10. Changes to Terms</h3>
      <p>We reserve the right to update these terms at any time. Continued use of the service after changes constitutes acceptance of new terms.</p>
    `
  },
  cookies: {
    title: 'Cookie Policy',
    icon: Cookie,
    lastUpdated: 'July 25, 2026',
    content: `
      <h3>1. What Are Cookies</h3>
      <p>Cookies are small text files stored on your device by your web browser. They are used to remember preferences and improve user experience.</p>

      <h3>2. How We Use Cookies</h3>
      <p>FileFlex uses a minimal approach to cookies:</p>
      <ul>
        <li><strong>Essential Cookies:</strong> We use localStorage (not traditional cookies) to remember your cookie preference selection. This is strictly functional and required for the cookie consent banner to work.</li>
        <li><strong>No Analytics Cookies:</strong> We do not use Google Analytics, Facebook Pixel, or any analytics services.</li>
        <li><strong>No Marketing Cookies:</strong> We do not serve ads or use marketing trackers.</li>
        <li><strong>No Session Tracking:</strong> We do not track your browsing behavior or session activity.</li>
      </ul>

      <h3>3. Types of Cookies We Use</h3>
      <p><strong>Essential/Necessary Cookies:</strong></p>
      <ul>
        <li>Name: fileflex-cookie-consent</li>
        <li>Purpose: Stores your cookie preference selection</li>
        <li>Duration: Persistent until cleared</li>
        <li>Type: localStorage (not a traditional cookie)</li>
      </ul>

      <h3>4. Third-Party Cookies</h3>
      <p>We do not use any third-party cookies. Our service is self-contained and does not embed external tracking scripts.</p>

      <h3>5. Managing Cookies</h3>
      <p>You can control cookie preferences through our cookie consent banner. You may also clear localStorage through your browser settings at any time. Disabling essential cookies may affect the functionality of the cookie consent banner.</p>

      <h3>6. Your Choices</h3>
      <p>When you first visit FileFlex, you are presented with three options:</p>
      <ul>
        <li><strong>Accept All:</strong> Accepts essential cookies</li>
        <li><strong>Essential Only:</strong> Accepts only essential cookies</li>
        <li><strong>Preferences:</strong> Opens detailed cookie settings</li>
      </ul>

      <h3>7. Updates</h3>
      <p>We may update this Cookie Policy as needed. Changes will be reflected with an updated date.</p>
    `
  }
};

export default function LegalModal({ isOpen, onClose, type }) {
  const content = legalContent[type];
  if (!content) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-surface-border px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <content.icon className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{content.title}</h2>
                  <p className="text-xs text-gray-400">Last updated: {content.lastUpdated}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              <div 
                className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2 prose-p:text-gray-600 prose-p:leading-relaxed prose-ul:text-gray-600 prose-li:leading-relaxed prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-surface-border px-6 py-4 flex justify-end">
              <button onClick={onClose} className="btn-primary">
                I Understand
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}