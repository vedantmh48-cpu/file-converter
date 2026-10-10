import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, ScanText, FileDown, FileText,
  RotateCcw, AlertTriangle, CheckCircle2, Loader2,
  X, Eye, EyeOff, ZoomIn, Copy, RefreshCw, Info
} from 'lucide-react';
import {
  preprocessImageForOCR,
  runOCR,
  assessImageQuality,
  exportToPDF,
  exportToDOCX,
  downloadBlob,
  terminateOCRWorker,
} from '../utils/ocrUtils';

const STEP = { IDLE: 'idle', PREVIEW: 'preview', PROCESSING: 'processing', DONE: 'done' };

export default function OCRScanner() {
  const [step, setStep] = useState(STEP.IDLE);
  const [imageFile, setImageFile] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [processedCanvas, setProcessedCanvas] = useState(null);
  const [showProcessed, setShowProcessed] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState(null);
  const [docTitle, setDocTitle] = useState('Extracted Document');
  const [includeImage, setIncludeImage] = useState(true);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      terminateOCRWorker();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!cameraActive || !videoRef.current || !streamRef.current) return undefined;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.play().catch(() => setCameraError('Could not start the preview. Check camera permissions and try again.'));
    return () => { video.srcObject = null; };
  }, [cameraActive]);

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access requires HTTPS (or localhost) and a supported browser.');
      return;
    }
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        });
      } catch (err) {
        if (err.name !== 'OverconstrainedError' && err.name !== 'NotFoundError') throw err;
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      }
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      const messages = {
        NotAllowedError: 'Camera permission was denied. Allow access in your browser settings and try again.',
        NotFoundError: 'No camera was found on this device.',
        NotReadableError: 'The camera is already in use by another app.',
        SecurityError: 'Camera access requires HTTPS or localhost.',
      };
      setCameraError(messages[err.name] || 'Camera could not be opened. Check permissions and try again.');
    }
  };

  const captureFromCamera = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      setCameraError('Camera is still focusing. Wait for the preview, then capture again.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      setCameraError('Could not capture a camera frame.');
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError('Could not capture the image. Please try again.');
        return;
      }
      stopCamera();
      loadImageFile(new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.94);
  };

  // ── File Loading ─────────────────────────────────────────────────────────────

  const loadImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP, etc.)');
      return;
    }
    setError(null);
    setWarnings([]);
    setOcrResult(null);
    setEditedText('');
    setImageFile(file);
    setDocTitle(file.name.replace(/\.[^.]+$/, '') || 'Extracted Document');
    const reader = new FileReader();
    reader.onload = (e) => { setImageDataUrl(e.target.result); setStep(STEP.PREVIEW); };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => { if (e.target.files?.[0]) loadImageFile(e.target.files[0]); };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadImageFile(file); // eslint-disable-line react-hooks/exhaustive-deps
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  // ── OCR Processing ───────────────────────────────────────────────────────────

  const handleProcess = async () => {
    if (!imageFile) return;
    setStep(STEP.PROCESSING);
    setError(null);
    setOcrProgress(0);
    try {
      setOcrProgress(5);
      const { blob: processedBlob, canvas } = await preprocessImageForOCR(imageFile);
      setProcessedCanvas(canvas);
      const quality = assessImageQuality(canvas);
      setWarnings(quality.warnings);
      const result = await runOCR(processedBlob, (p) => setOcrProgress(5 + Math.round(p * 0.9)));
      setOcrResult(result);
      setEditedText(result.text);
      setOcrProgress(100);
      setStep(STEP.DONE);
    } catch (err) {
      console.error('OCR error:', err);
      setError('OCR processing failed. Please try with a clearer image.');
      setStep(STEP.PREVIEW);
    }
  };

  // ── Export ───────────────────────────────────────────────────────────────────

  const handleExport = async (format) => {
    setExporting(format);
    setExportSuccess(null);
    try {
      const opts = { title: docTitle, includeImage, imageDataUrl };
      if (format === 'pdf') {
        const { blob, fileName } = exportToPDF(editedText, opts);
        downloadBlob(blob, fileName);
      } else {
        const { blob, fileName } = await exportToDOCX(editedText, opts);
        downloadBlob(blob, fileName);
      }
      setExportSuccess(format);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      setError(`Export failed: ${err.message}`);
    } finally {
      setExporting(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    stopCamera();
    setStep(STEP.IDLE);
    setImageFile(null);
    setImageDataUrl(null);
    setProcessedCanvas(null);
    setOcrResult(null);
    setEditedText('');
    setWarnings([]);
    setError(null);
    setOcrProgress(0);
    setShowProcessed(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confidenceBadge = (conf) => {
    if (conf >= 80) return { label: `${conf}% confidence`, cls: 'badge-success' };
    if (conf >= 50) return { label: `${conf}% confidence`, cls: 'badge-warning' };
    return { label: `${conf}% — review carefully`, cls: 'bg-red-50 text-red-700 border border-red-200 badge' };
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <section id="ocr-scanner" className="relative py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="badge-info mb-4">OCR · Image to Text</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-3">
              Scan &amp; Extract Text from Images
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Upload a document image. OCR extracts the text — export to PDF or Word.
              100% client-side, nothing leaves your device.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="card-floating p-6 lg:p-8 space-y-6"
        >
          {/* IDLE */}
          {step === STEP.IDLE && (
            <div className="space-y-4">
              {cameraActive ? (
                <div className="space-y-3">
                  <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
                    <video ref={videoRef} className="h-full w-full object-contain" playsInline muted />
                    <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-white/60" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={captureFromCamera} className="btn-primary flex-1 gap-2"><Camera className="h-4 w-4" /> Capture for text</button>
                    <button onClick={stopCamera} className="btn-secondary gap-2"><X className="h-4 w-4" /> Cancel</button>
                  </div>
                </div>
              ) : <>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`dropzone ${dragActive ? 'dropzone-active' : ''}`}
                  >
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${dragActive ? 'bg-brand-100 scale-110' : 'bg-gray-50 dark:bg-gray-800'}`}>
                        <ScanText className={`w-8 h-8 ${dragActive ? 'text-brand-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                          {dragActive ? 'Drop image here' : 'Drag & drop an image'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">or <span className="text-brand-600 font-medium">browse files</span></p>
                      </div>
                      <p className="text-xs text-gray-400">JPG, PNG, WEBP, BMP, TIFF — best with clear, well-lit images</p>
                    </div>
                  </div>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-400">or capture</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              </div>
              <button onClick={startCamera} className="btn-secondary w-full gap-2"><Camera className="h-4 w-4" /> Use camera to extract text</button>
              {cameraError && <p role="alert" className="text-sm text-red-500">{cameraError}</p>}
              </>}
            </div>
          )}

          {/* PREVIEW / PROCESSING */}
          {(step === STEP.PREVIEW || step === STEP.PROCESSING) && imageDataUrl && (
            <div className="space-y-5">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 max-h-80">
                <img
                  src={showProcessed && processedCanvas ? processedCanvas.toDataURL() : imageDataUrl}
                  alt="Preview"
                  className="w-full h-full object-contain max-h-80"
                />
                {processedCanvas && (
                  <button
                    onClick={() => setShowProcessed(!showProcessed)}
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 text-white text-xs backdrop-blur-sm hover:bg-black/70 transition-colors"
                  >
                    {showProcessed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showProcessed ? 'Original' : 'Preprocessed'}
                  </button>
                )}
              </div>

              {warnings.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20 space-y-1">
                  {warnings.map((w, i) => (
                    <p key={i} className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {w}
                    </p>
                  ))}
                </div>
              )}

              {step === STEP.PROCESSING && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                      {ocrProgress < 10 ? 'Preprocessing image…' : ocrProgress < 95 ? 'Extracting text…' : 'Finalizing…'}
                    </span>
                    <span className="text-brand-600 font-medium">{ocrProgress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${ocrProgress}%` }} />
                  </div>
                </div>
              )}

              {step === STEP.PREVIEW && (
                <div className="flex gap-3">
                  <button onClick={handleProcess} className="btn-primary flex-1 gap-2">
                    <ScanText className="w-4 h-4" /> Extract Text
                  </button>
                  <button onClick={handleReset} className="btn-secondary gap-2">
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                </div>
              )}
            </div>
          )}

          {/* DONE */}
          {step === STEP.DONE && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Text Extracted</span>
                  {ocrResult && (
                    <span className={confidenceBadge(ocrResult.confidence).cls}>
                      {confidenceBadge(ocrResult.confidence).label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowProcessed(!showProcessed)} className="btn-ghost text-xs gap-1.5 py-1.5">
                    <ZoomIn className="w-3.5 h-3.5" /> {showProcessed ? 'Original' : 'Preprocessed'}
                  </button>
                  <button onClick={handleReset} className="btn-ghost text-xs gap-1.5 py-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> New Scan
                  </button>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 max-h-40">
                <img
                  src={showProcessed && processedCanvas ? processedCanvas.toDataURL() : imageDataUrl}
                  alt="Scanned"
                  className="w-full h-full object-contain max-h-40"
                />
              </div>

              {warnings.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20 space-y-1">
                  {warnings.map((w, i) => (
                    <p key={i} className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {w}
                    </p>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Extracted Text <span className="text-gray-400 font-normal">(editable)</span>
                  </label>
                  <button onClick={handleCopy} className="btn-ghost text-xs gap-1.5 py-1.5">
                    {copied
                      ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                      : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={10}
                  className="input-field font-mono text-sm resize-y min-h-[200px]"
                  placeholder="Extracted text will appear here…"
                  spellCheck
                />
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Review and correct any errors before exporting.
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Export Options</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Document Title</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="input-field text-sm"
                    placeholder="Document title…"
                  />
                </div>
                <div
                  onClick={() => setIncludeImage(!includeImage)}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <div className={`relative w-10 h-6 rounded-full transition-colors ${includeImage ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${includeImage ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include original image in PDF</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleExport('pdf')} disabled={!!exporting} className="btn-primary gap-2">
                    {exporting === 'pdf' ? <><Loader2 className="w-4 h-4 animate-spin" /> Exporting…</>
                      : exportSuccess === 'pdf' ? <><CheckCircle2 className="w-4 h-4" /> Downloaded!</>
                      : <><FileDown className="w-4 h-4" /> Export PDF</>}
                  </button>
                  <button onClick={() => handleExport('docx')} disabled={!!exporting} className="btn-secondary gap-2">
                    {exporting === 'docx' ? <><Loader2 className="w-4 h-4 animate-spin" /> Exporting…</>
                      : exportSuccess === 'docx' ? <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Downloaded!</>
                      : <><FileText className="w-4 h-4" /> Export DOCX</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20"
              >
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="flex-1 text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tips */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
          {[
            { icon: '💡', tip: 'Use good lighting — avoid shadows across the text.' },
            { icon: '📐', tip: 'Hold the camera parallel to the document for best results.' },
            { icon: '🔍', tip: 'Higher resolution images produce more accurate OCR.' },
          ].map(({ icon, tip }) => (
            <div key={tip} className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
              <span className="text-base">{icon}</span>
              <p>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
