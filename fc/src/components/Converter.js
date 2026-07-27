import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, File, X, Download, CheckCircle2,
  ArrowRight, Settings2, Merge, 
  Split, FileDown, Loader2, Maximize2, Minimize2
} from 'lucide-react';
import { formatFileSize, getFileExtension, SUPPORTED_IMAGE_FORMATS, convertMultipleFiles, downloadFile, downloadAsZip } from '../utils/conversionUtils';

const FROM_FORMATS = [
  { value: 'jpg', label: 'JPG', group: 'image' },
  { value: 'png', label: 'PNG', group: 'image' },
  { value: 'webp', label: 'WEBP', group: 'image' },
  { value: 'bmp', label: 'BMP', group: 'image' },
  { value: 'tiff', label: 'TIFF', group: 'image' },
  { value: 'gif', label: 'GIF', group: 'image' },
  { value: 'svg', label: 'SVG', group: 'image' },
  { value: 'ico', label: 'ICO', group: 'image' },
  { value: 'pdf', label: 'PDF', group: 'document' },
  { value: 'txt', label: 'TXT', group: 'document' },
  { value: 'doc', label: 'DOC', group: 'document' },
  { value: 'docx', label: 'DOCX', group: 'document' },
  { value: 'xls', label: 'XLS', group: 'document' },
  { value: 'xlsx', label: 'XLSX', group: 'document' },
  { value: 'csv', label: 'CSV', group: 'document' },
  { value: 'ppt', label: 'PPT', group: 'document' },
  { value: 'pptx', label: 'PPTX', group: 'document' },
];

const TO_FORMATS = [
  { value: 'jpg', label: 'JPG', group: 'image' },
  { value: 'png', label: 'PNG', group: 'image' },
  { value: 'webp', label: 'WEBP', group: 'image' },
  { value: 'bmp', label: 'BMP', group: 'image' },
  { value: 'tiff', label: 'TIFF', group: 'image' },
  { value: 'ico', label: 'ICO', group: 'image' },
  { value: 'pdf', label: 'PDF', group: 'document' },
  { value: 'txt', label: 'TXT', group: 'document' },
  { value: 'docx', label: 'DOCX', group: 'document' },
  { value: 'xlsx', label: 'XLSX', group: 'document' },
  { value: 'csv', label: 'CSV', group: 'document' },
];

export default function Converter() {
  const [files, setFiles] = useState([]);
  const [fromFormat, setFromFormat] = useState('jpg');
  const [toFormat, setToFormat] = useState('png');
  const [converting, setConverting] = useState(false);
  const [convertedResults, setConvertedResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [mergeMode, setMergeMode] = useState('single');
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      name: file.name,
      size: file.size,
      extension: getFileExtension(file.name),
      preview: URL.createObjectURL(file),
    }));
    setFiles(prev => [...prev, ...newFiles]);
    setConvertedResults([]);
    setProgress(0);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setConvertedResults([]);
  };

  const clearAll = () => {
    setFiles([]);
    setConvertedResults([]);
    setProgress(0);
  };

  const getAcceptString = () => {
    const extMap = {
      jpg: '.jpg,.jpeg', jpeg: '.jpg,.jpeg', png: '.png', webp: '.webp',
      bmp: '.bmp', tiff: '.tiff,.tif', gif: '.gif', svg: '.svg', ico: '.ico',
      pdf: '.pdf', txt: '.txt', doc: '.doc', docx: '.docx',
      xls: '.xls', xlsx: '.xlsx', csv: '.csv', ppt: '.ppt', pptx: '.pptx',
    };
    return extMap[fromFormat] || '*/*';
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setConverting(true);
    setProgress(0);
    setConvertedResults([]);

    try {
      const totalFiles = files.length;
      const results = [];

      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        const result = await convertMultipleFiles(
          [fileData.file], 
          fileData.extension || fromFormat, 
          toFormat, 
          { mergeMode }
        );
        results.push(...result);
        setProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      setConvertedResults(results);
    } catch (error) {
      console.error('Conversion error:', error);
      alert('Conversion failed: ' + error.message);
    } finally {
      setConverting(false);
      setProgress(100);
    }
  };

  const handleDownloadAll = () => {
    if (convertedResults.length === 1) {
      downloadFile(convertedResults[0].blob, convertedResults[0].fileName);
    } else if (convertedResults.length > 1) {
      downloadAsZip(convertedResults);
    }
  };

  return (
    <section id="converter" className="relative py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="badge-info mb-4">Free & Secure</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-3">
              Convert Your Files Instantly
            </h2>
            <p className="mt-3 text-gray-500 text-lg max-w-xl mx-auto">
              Drag & drop or select files. Everything runs in your browser — 100% private.
            </p>
          </motion.div>
        </div>

        {/* Converter Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card-floating p-6 lg:p-8"
        >
          {/* Format Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-3 items-end mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Convert From</label>
              <select
                value={fromFormat}
                onChange={(e) => { setFromFormat(e.target.value); setConvertedResults([]); }}
                className="input-field"
              >
                <optgroup label="Image Formats">
                  {FROM_FORMATS.filter(f => f.group === 'image').map(f => (
                    <option key={f.value} value={f.value}>{f.label.toUpperCase()}</option>
                  ))}
                </optgroup>
                <optgroup label="Document Formats">
                  {FROM_FORMATS.filter(f => f.group === 'document').map(f => (
                    <option key={f.value} value={f.value}>{f.label.toUpperCase()}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="flex justify-center pb-1">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-brand-600" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Convert To</label>
              <select
                value={toFormat}
                onChange={(e) => { setToFormat(e.target.value); setConvertedResults([]); }}
                className="input-field"
              >
                <optgroup label="Image Formats">
                  {TO_FORMATS.filter(f => f.group === 'image').map(f => (
                    <option key={f.value} value={f.value}>{f.label.toUpperCase()}</option>
                  ))}
                </optgroup>
                <optgroup label="Document Formats">
                  {TO_FORMATS.filter(f => f.group === 'document').map(f => (
                    <option key={f.value} value={f.value}>{f.label.toUpperCase()}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Options Toggle */}
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            Advanced Options
            {showOptions ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-gray-50 rounded-xl mb-4 space-y-3">
                  {toFormat === 'pdf' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PDF Mode</label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setMergeMode('single')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            mergeMode === 'single' 
                              ? 'bg-brand-600 text-white shadow-sm' 
                              : 'bg-white border border-surface-border text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Merge className="w-4 h-4" />
                          Merge to Single PDF
                        </button>
                        <button
                          onClick={() => setMergeMode('separate')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            mergeMode === 'separate' 
                              ? 'bg-brand-600 text-white shadow-sm' 
                              : 'bg-white border border-surface-border text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Split className="w-4 h-4" />
                          Separate PDFs
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dropzone */}
          <div
            ref={dropRef}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`dropzone ${dragActive ? 'dropzone-active' : ''} ${files.length > 0 ? 'pb-6' : ''}`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={getAcceptString()}
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                dragActive ? 'bg-brand-100 scale-110' : 'bg-gray-50'
              }`}>
                <Upload className={`w-8 h-8 transition-colors ${
                  dragActive ? 'text-brand-600' : 'text-gray-400'
                }`} />
              </div>
              <div>
                <p className="text-base font-medium text-gray-700">
                  {dragActive ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  or <span className="text-brand-600 font-medium hover:underline">browse files</span>
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Supports: JPG, PNG, WEBP, BMP, TIFF, GIF, SVG, ICO, PDF, TXT, DOC, DOCX, XLS, XLSX, CSV, PPT, PPTX
              </p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  {files.length} file{files.length > 1 ? 's' : ''} selected
                </p>
                <button onClick={clearAll} className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
                  Clear all
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="file-item group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <File className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Progress */}
              {converting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Converting...</span>
                    <span className="text-brand-600 font-medium">{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Convert Button */}
              <button
                onClick={handleConvert}
                disabled={converting}
                className="btn-primary w-full gap-2 mt-2"
              >
                {converting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    Convert {files.length > 1 ? `All (${files.length})` : 'File'}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results */}
          {convertedResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-800">
                  Conversion Complete! ({convertedResults.length} file{convertedResults.length > 1 ? 's' : ''})
                </p>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {convertedResults.map((result, i) => (
                  <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border border-emerald-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileDown className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{result.fileName}</span>
                      <span className="text-xs text-gray-400">({formatFileSize(result.size)})</span>
                    </div>
                    <button
                      onClick={() => downloadFile(result.blob, result.fileName)}
                      className="btn-ghost text-brand-600 hover:text-brand-700 flex-shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {convertedResults.length > 1 && (
                <button onClick={handleDownloadAll} className="btn-primary w-full mt-3 gap-2">
                  <Download className="w-4 h-4" />
                  Download All as ZIP
                </button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            100% Client-Side
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            No File Upload
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            End-to-End Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Free & Unlimited
          </span>
        </div>
      </div>
    </section>
  );
}