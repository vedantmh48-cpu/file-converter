import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, FileDown, ImagePlus, Loader2, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function CameraToPDF() {
  const [stream, setStream] = useState(null);
  const [pages, setPages] = useState([]);
  const [latestCapture, setLatestCapture] = useState('');
  const [shutterActive, setShutterActive] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const videoRef = useRef(null);
  const fileRef = useRef(null);

  const stopCamera = useCallback(() => {
    setStream((current) => {
      current?.getTracks().forEach((track) => track.stop());
      return null;
    });
  }, []);

  useEffect(() => {
    if (!stream || !videoRef.current) return undefined;
    const video = videoRef.current;
    video.srcObject = stream;
    video.play().catch(() => setError('Could not start the camera preview. Check browser camera permissions.'));
    return () => { video.srcObject = null; };
  }, [stream]);

  useEffect(() => () => {
    stream?.getTracks().forEach((track) => track.stop());
  }, [stream]);

  const startCamera = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access requires HTTPS (or localhost) and a browser with camera support.');
      return;
    }
    try {
      let cameraStream;
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        });
      } catch (firstError) {
        if (firstError.name !== 'OverconstrainedError' && firstError.name !== 'NotFoundError') throw firstError;
        cameraStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      }
      setStream(cameraStream);
    } catch (cameraError) {
      const messages = {
        NotAllowedError: 'Camera permission was denied. Allow camera access in your browser settings and try again.',
        NotFoundError: 'No camera was found on this device.',
        NotReadableError: 'The camera is already in use by another app.',
        SecurityError: 'Camera access requires a secure connection (HTTPS or localhost).',
      };
      setError(messages[cameraError.name] || 'Camera could not be opened. Check permissions and try again.');
    }
  };

  const addPage = (dataUrl) => setPages((current) => [...current, dataUrl]);

  const capturePage = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      setError('Camera is still focusing. Wait for the preview, then capture again.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) { setError('Could not capture a camera frame.'); return; }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const capture = canvas.toDataURL('image/jpeg', 0.94);
    addPage(capture);
    setLatestCapture(capture);
    setShutterActive(true);
    window.setTimeout(() => setShutterActive(false), 220);
    setError('');
  };

  const addFiles = (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const image = new Image();
          image.src = reader.result;
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          canvas.getContext('2d').drawImage(image, 0, 0);
          addPage(canvas.toDataURL('image/jpeg', 0.94));
        } catch {
          setError(`Could not read ${file.name}. Please choose another image.`);
        }
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  };

  const createPDF = async () => {
    if (!pages.length) return;
    setSaving(true);
    try {
      let pdf;
      for (let index = 0; index < pages.length; index += 1) {
        const src = pages[index];
        const image = new Image();
        image.src = src;
        if (image.decode) await image.decode();
        else await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; });
        const landscape = image.width > image.height;
        if (index === 0) pdf = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
        else pdf.addPage('a4', landscape ? 'landscape' : 'portrait');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const scale = Math.min(pageWidth / image.width, pageHeight / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        pdf.addImage(src, 'JPEG', (pageWidth - width) / 2, (pageHeight - height) / 2, width, height, undefined, 'FAST');
      }
      pdf.save('camera-scan.pdf');
    } catch (pdfError) {
      setError('Could not create the PDF. Please try capturing the pages again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="camera-to-pdf" className="relative overflow-hidden bg-gray-50/80 py-20 dark:bg-gray-900/40 lg:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center">
          <span className="badge-info mb-4 inline-flex items-center gap-2"><Camera className="h-4 w-4" /> Camera scanner</span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100 lg:text-4xl">Scan pages straight to PDF</h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-gray-500 dark:text-gray-400">Capture multiple pages or add images, arrange your scan, and save one clean PDF. Text extraction is a separate tool below.</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="card-floating space-y-4 p-5 lg:p-6">
            {stream ? (
              <div className="fixed inset-0 z-[120] flex h-[100dvh] flex-col bg-black text-white">
                <div className="flex items-center justify-between px-5 pb-4 pt-[max(env(safe-area-inset-top),1rem)]">
                  <div><p className="font-semibold">Camera scan</p><p className="text-xs text-white/65">Turn your device to adjust the preview</p></div>
                  <button onClick={stopCamera} aria-label="Close camera" className="rounded-full bg-white/15 p-3 text-white hover:bg-white/25"><X className="h-5 w-5" /></button>
                </div>
                <div className="relative min-h-0 flex-1 overflow-hidden">
                  <video ref={videoRef} className="absolute inset-0 h-full w-full object-contain" playsInline muted />
                  {shutterActive && <div className="camera-shutter-flash" aria-hidden="true" />}
                  <div className="pointer-events-none absolute inset-[8%] rounded-2xl border border-white/50" />
                  {latestCapture && <div className="absolute bottom-4 right-4 z-10 w-20 overflow-hidden rounded-xl border-2 border-white/80 bg-black/70 shadow-xl sm:w-24">
                    <img src={latestCapture} alt="Most recently captured page" className="aspect-[3/4] w-full object-cover" />
                    <span className="block px-1.5 py-1 text-center text-[10px] font-medium">Latest · {pages.length}</span>
                  </div>}
                </div>
                <div className="flex justify-center px-5 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-5">
                  <button onClick={capturePage} className="flex min-h-14 min-w-56 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-violet-600 px-8 font-semibold text-white shadow-xl shadow-black/30 active:scale-95"><Camera className="h-5 w-5" /> Capture page</button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white/70 p-7 text-center dark:border-gray-700 dark:bg-gray-950/50">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lg shadow-brand-600/25"><Camera className="h-8 w-8" /></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Build a multi-page scan</h3>
                <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">Use your device camera or add existing images. Each image becomes a page in the PDF.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button onClick={startCamera} className="btn-primary gap-2"><Camera className="h-4 w-4" /> Open camera</button>
                  <button onClick={() => fileRef.current?.click()} className="btn-secondary gap-2"><ImagePlus className="h-4 w-4" /> Add images</button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={addFiles} className="hidden" />
              </div>
            )}
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
          </div>

          <div className="card-floating flex min-h-64 flex-col p-5 lg:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div><h3 className="font-semibold text-gray-900 dark:text-gray-100">Your pages</h3><p className="text-sm text-gray-500 dark:text-gray-400">{pages.length} {pages.length === 1 ? 'page' : 'pages'} ready</p></div>
              {pages.length > 0 && <button onClick={() => setPages([])} className="btn-ghost gap-1.5 text-xs"><RotateCcw className="h-3.5 w-3.5" /> Clear</button>}
            </div>
            {pages.length ? (
              <div className="grid flex-1 grid-cols-2 content-start gap-3 sm:grid-cols-3">
                {pages.map((src, index) => <div key={`${index}-${src.slice(-16)}`} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                  <img src={src} alt={`PDF page ${index + 1}`} className="aspect-[3/4] w-full object-contain" />
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-xs font-medium text-white">Page {index + 1}</span>
                  <button onClick={() => setPages((current) => current.filter((_, i) => i !== index))} aria-label={`Remove page ${index + 1}`} className="absolute right-2 top-2 rounded-lg bg-black/65 p-2 text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
                </div>)}
                <button onClick={() => fileRef.current?.click()} className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-500 transition hover:border-brand-400 hover:text-brand-600 dark:border-gray-700"><Plus className="h-6 w-6" /> Add page<input ref={fileRef} type="file" accept="image/*" multiple onChange={addFiles} className="hidden" /></button>
              </div>
            ) : <div className="flex flex-1 flex-col items-center justify-center text-center text-sm text-gray-400"><ImagePlus className="mb-2 h-8 w-8" /><span>Captured or uploaded pages appear here.</span></div>}
            <button onClick={createPDF} disabled={!pages.length || saving} className="btn-primary mt-5 w-full gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}{saving ? 'Creating PDF…' : 'Create PDF'}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
