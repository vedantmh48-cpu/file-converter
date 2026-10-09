import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Cookie, Scale } from 'lucide-react';

const legalContent = {
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    lastUpdated: 'October 8, 2026',
    content: `
      <h3>1. Introduction</h3>
      <p>FileFlex ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle your data when you use our file conversion service.</p>

      <h3>2. Data Processing Philosophy</h3>
      <p><strong>We do not collect, store, or process your files on our servers.</strong> FileFlex is designed as a client-side application. All file conversion operations are performed entirely within your web browser using JavaScript and WebAssembly technologies.</p>

      <h3>3. What Data We Collect</h3>
      <p>FileFlex does not require an account and does not collect any personal data. We do not collect, store, or transmit information about the files you convert. Your theme and motion preferences are saved locally in your browser.</p>

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
      <p>We use localStorage in your browser for your theme and motion preferences. No data about your files is stored — files are processed in memory and cleared when you close the tab.</p>

      <h3>6. Third-Party Services</h3>
      <p>FileFlex does not use analytics, advertising, or tracking services. File conversion libraries run entirely in your browser and file contents are never transmitted anywhere.</p>

      <h3>7. Data Security</h3>
      <p>File contents remain on your device during conversion. Because no files or personal data are ever uploaded, there is nothing stored on our servers to secure.</p>

      <h3>8. Children's Privacy</h3>
      <p>FileFlex does not collect any personal data, so there is no data collected from children or anyone else.</p>

      <h3>9. Changes to This Policy</h3>
      <p>We may update this Privacy Policy occasionally. Any changes will be posted on this page with an updated revision date.</p>

      <h3>10. Contact</h3>
      <p>If you have questions about this Privacy Policy, please contact us through our GitHub repository.</p>
    `
  },
  terms: {
    title: 'Terms & Conditions',
    icon: Scale,
    lastUpdated: 'October 8, 2026',
    content: `
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing or using FileFlex, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our service.</p>

      <h3>2. Service Description</h3>
      <p>FileFlex converts file contents entirely within your web browser. No accounts are required and no files, personal data, or metadata are uploaded or stored.</p>

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
    lastUpdated: 'October 8, 2026',
    content: `
      <h3>1. What Are Cookies</h3>
      <p>Cookies are small text files stored on your device by your web browser. They are used to remember preferences and improve user experience.</p>

      <h3>2. How We Use Cookies</h3>
      <p>FileFlex uses a minimal approach to cookies:</p>
      <ul>
        <li><strong>Essential Browser Storage:</strong> localStorage remembers cookie preferences, theme, and motion preferences. These are functional values, not advertising trackers.</li>
        <li><strong>No Analytics Cookies:</strong> We do not use Google Analytics, Facebook Pixel, or any analytics services.</li>
        <li><strong>No Marketing Cookies:</strong> We do not serve ads or use marketing trackers.</li>
        <li><strong>No Session Tracking:</strong> We do not track your browsing behavior or session activity.</li>
      </ul>

      <h3>3. Types of Cookies We Use</h3>
      <p><strong>Essential/Necessary Cookies:</strong></p>
      <ul>
        <li>Names: FileFlex preferences</li>
        <li>Purpose: Remember essential app preferences such as theme and motion settings</li>
        <li>Duration: Preferences remain until cleared</li>
        <li>Type: localStorage only — no cookies are set on your device</li>
      </ul>

      <h3>4. Third-Party Cookies</h3>
      <p>FileFlex does not use third-party advertising or analytics trackers.</p>

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
  },
  gdpr: {
    title: 'GDPR Compliance',
    icon: Shield,
    lastUpdated: 'October 8, 2026',
    content: `
      <h3>1. Overview</h3>
      <p>FileFlex is committed to full compliance with the General Data Protection Regulation (GDPR) (EU) 2016/679. This policy outlines our compliance measures and your rights under the regulation.</p>

      <h3>2. Data Controller</h3>
      <p>All file processing occurs in your browser on your own device. FileFlex does not collect, store, or process any personal data on our servers.</p>

      <h3>3. Legal Basis for Processing</h3>
      <p>No personal data is processed because none is collected. Since no accounts are required and no files leave your device, there is nothing to store, transmit, or sell.</p>

      <h3>4. Your Rights Under GDPR</h3>
      <p>Because FileFlex does not collect or store any personal data, GDPR rights such as access, rectification, and erasure are inherently satisfied — there is no personal data held about you. Your preferences remain under your control in your browser's localStorage and can be cleared at any time.</p>

      <h3>5. Data Minimization</h3>
      <p>FileFlex implements data minimization by design: no account is required and no personal data or files are ever collected.</p>

      <h3>6. Storage Limitation</h3>
      <p>Only your browser-stored preferences (theme, motion, cookie consent) persist locally and can be cleared by you at any time.</p>

      <h3>7. International Data Transfers</h3>
      <p>No data is transferred. Files and personal information never leave your device.</p>

      <h3>8. Data Breaches</h3>
      <p>File contents are never uploaded or stored by FileFlex, so there is no server-side data to be exposed in a breach.</p>

      <h3>9. Children's Data</h3>
      <p>FileFlex does not collect personal data from anyone, including children.</p>

      <h3>10. Contact & Complaints</h3>
      <p>If you have any questions about our GDPR compliance, please contact us through our GitHub repository. You also have the right to lodge a complaint with your local data protection authority.</p>
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
            className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-surface-border dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                  <content.icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{content.title}</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Last updated: {content.lastUpdated}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              <div 
                className="prose prose-sm max-w-none prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-headings:font-bold prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2 prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-p:leading-relaxed prose-ul:text-gray-600 dark:prose-ul:text-gray-400 prose-li:leading-relaxed prose-strong:text-gray-900 dark:prose-strong:text-gray-100"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-surface-border dark:border-gray-800 px-6 py-4 flex justify-end">
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
