import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, File, X, Download, CheckCircle2,
  ArrowLeftRight, Settings2, Merge,
  Split, FileDown, Loader2, Maximize2, Minimize2,
  FileText, Table, Presentation, Pencil, Check, ExternalLink, AlertTriangle
} from 'lucide-react';
import {
  formatFileSize, getFileExtension, getBaseName,
  SUPPORTED_IMAGE_FORMATS, convertMultipleFiles,
  downloadFile, downloadAsZip, openGoogleCreate, renameFile
} from '../utils/conversionUtils';

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
  { value: 'pptx', label: 'PPTX', group: 'document' },
  { value: 'csv', label: 'CSV', group: 'document' },
];

const GOOGLE_CREATE_OPTIONS = [
  { type: 'docs', label: 'Google Docs', icon: FileText, description: 'Create a new document' },
  { type: 'sheets', label: 'Google Sheets', icon: Table, description: 'Create a new spreadsheet' },
  { type: 'slides', label: 'Google Slides', icon: Presentation, description: 'Create a new presentation' },
];

export default function Converter() {
  const [files, setFiles] = useState([]);
  const [fromFormat, setFromFormat] = useState('jpg');
  const [toFormat, setToFormat] = useState('png');
  const [converting, setConverting] = useState(false);
  const [convertedResults, setConvertedResults] = useState([]);
  const [conversionError, setConversionError] = useState('');
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [mergeMode, setMergeMode] = useState('single');
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const inputRef = useRef(null);
  const dropRef = useRef(null);
  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Revoke object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
  }, []);

  const sameFormat = fromFormat === toFormat;
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
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = null;
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
    setFiles((prev) => [...prev, ...newFiles]);
    setConvertedResults([]);
    setConversionError('');
    setProgress(0);
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target && target.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });
    setConvertedResults([]);
    setConversionError('');
  };

  const clearAll = () => {
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
    setConvertedResults([]);
    setConversionError('');
    setProgress(0);
  };

  const swapFormats = () => {
    setFromFormat(toFormat);
    setToFormat(fromFormat);
    setConvertedResults([]);
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
    if (files.length === 0 || sameFormat) return;
    setConverting(true);
    setProgress(0);
    setConvertedResults([]);
    setConversionError('');

    try {
      const totalFiles = files.length;
      const results = [];

      // If converting multiple images to PDF with merge mode, pass all files at once
      if (
        toFormat === 'pdf' &&
        SUPPORTED_IMAGE_FORMATS.includes(fromFormat) &&
        mergeMode === 'single' &&
        files.length > 1
      ) {
        const result = await convertMultipleFiles(
          files.map((f) => f.file),
          fromFormat,
          toFormat,
          { mergeMode }
        );
        results.push(...result);
        setProgress(100);
      } else {
        for (let i = 0; i < files.length; i++) {
          const fileData = files[i];
          try {
            const result = await convertMultipleFiles(
              [fileData.file],
              fileData.extension || fromFormat,
              toFormat,
              { mergeMode }
            );
            results.push(...result);
          } catch (error) {
            results.push({ fileName: fileData.name, error: error.message });
          }
          setProgress(Math.round(((i + 1) / totalFiles) * 100));
        }
      }

      setConvertedResults(results);
    } catch (error) {
      console.error('Conversion error:', error);
      setConversionError(error.message || 'The selected files could not be converted.');
    } finally {
      setConverting(false);
      setProgress(100);
    }
  };

  const handleDownloadAll = () => {
    const ready = convertedResults.filter((result) => result.blob);
    if (ready.length === 1) {
      downloadFile(ready[0].blob, ready[0].fileName);
    } else if (ready.length > 1) {
      downloadAsZip(ready);
    }
  };

  const startRename = (index) => {
    setRenamingIndex(index);
    setRenameValue(getBaseName(convertedResults[index].fileName));
  };

  const handleRename = (index) => {
    if (renameValue.trim()) {
      const updated = [...convertedResults];
      updated[index] = renameFile(updated[index], renameValue.trim());
      setConvertedResults(updated);
    }
    setRenamingIndex(null);
    setRenameValue('');
  };

  const handleGoogleCreate = (type) => {
    openGoogleCreate(type);
  };
return (
    <section id="converter" className="relative py-20 lg:py-28 overflow-hidden">
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
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-50 mt-3">
              Convert Anything, Instantly
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Drag &amp; drop. Runs 100% in your browser.
            </p>
          </motion.div>
        </div>

        {/* Google Create Section */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 220, damping: 26, delay: 0.05 }}
          className="mb-8"
        >
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Create New Documents</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Open Docs, Sheets or Slides</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {GOOGLE_CREATE_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.type}
                  onClick={() => handleGoogleCreate(option.type)}
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-surface-border bg-white dark:bg-gray-900 dark:border-gray-800 hover:border-brand-400 hover:bg-brand-50/30 dark:hover:bg-brand-500/5 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-500/20 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{option.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{option.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ExternalLink className="w-3 h-3" />
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Converter Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.15 }}
          className="card-floating p-6 lg:p-8"
        >
{/* Format Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-3 items-end mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Convert From</label>
              <select
                value={fromFormat}
                onChange={(e) => { setFromFormat(e.target.value); setConvertedResults([]); }}
                className="input-field"
              >
                <optgroup label="Image Formats">
                  {FROM_FORMATS.filter((f) => f.group === 'image').map((f) => (
                    <option key={f.value} value={f.value}>{f.label.toUpperCase()}</option>
                  ))}
                </optgroup>
                <optgroup label="Document Formats">
                  {FROM_FORMATS.filter((f) => f.group === 'document').map((f) => (
                    <option key={f.value} value={f.value}>{f.label.toUpperCase()}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="flex justify-center items-end pb-1">
              <button
                onClick={swapFormats}
                title="Swap formats"
                className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors group"
              >
                <ArrowLeftRight className="w-5 h-5 text-brand-600 dark:text-brand-400 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Convert To</label>
              <select
                value={toFormat}
                onChange={(e) => { setToFormat(e.target.value); setConvertedResults([]); }}
                className="input-field"
              >
                <optgroup label="Image Formats">
                  {TO_FORMATS.filter((f) => f.group === 'image').map((f) => (
                    <option key={f.value} value={f.value}>{f.label.toUpperCase()}</option>
                  ))}
                </optgroup>
                <optgroup label="Document Formats">
                  {TO_FORMATS.filter((f) => f.group === 'document').map((f) => (
                    <option key={f.value} value={f.value}>{f.label.toUpperCase()}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Same format warning */}
          {sameFormat && (
            <div className="flex items-center gap-2.5 px-4 py-3 mb-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Source and target formats are the same. Pick a different target format to continue.</span>
            </div>
          )}
{/* Options Toggle */}
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            Advanced Options
            {showOptions ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>

          <AnimatePresence initial={false}>
            {showOptions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-gray-50 dark:bg-gray-950/40 rounded-xl mb-4 space-y-3">
                  {toFormat === 'pdf' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PDF Mode</label>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setMergeMode('single')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            mergeMode === 'single'
                              ? 'bg-brand-600 text-white shadow-sm'
                              : 'bg-white dark:bg-gray-900 border border-surface-border dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
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
                              : 'bg-white dark:bg-gray-900 border border-surface-border dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <Split className="w-4 h-4" />
                          Separate PDFs
                        </button>
                      </div>
                      {SUPPORTED_IMAGE_FORMATS.includes(fromFormat) && files.length > 1 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {mergeMode === 'single'
                            ? `All ${files.length} images will be merged into one PDF`
                            : `Each image will be converted to its own PDF`}
                        </p>
                      )}
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
                dragActive ? 'bg-brand-100 dark:bg-brand-500/20 scale-110' : 'bg-gray-50 dark:bg-gray-800'
              }`}>
                <Upload className={`w-8 h-8 transition-colors ${
                  dragActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'
                }`} />
              </div>
              <div>
                <p className="text-base font-medium text-gray-700 dark:text-gray-200">
                  {dragActive ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  or <span className="text-brand-600 dark:text-brand-400 font-medium hover:underline">browse files</span>
                </p>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                17 formats supported
              </p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                      <File className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatFileSize(file.size)} · {file.extension.toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label={`Remove ${file.name}`}
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
                    <span className="text-gray-600 dark:text-gray-300">Converting...</span>
                    <span className="text-brand-600 dark:text-brand-400 font-medium">{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Convert Button */}
              <button
                onClick={handleConvert}
                disabled={converting || sameFormat}
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
              className="mt-6 p-4 lg:p-5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/25"
            >
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    Conversion finished ({convertedResults.filter((result) => result.blob).length} of {convertedResults.length} files)
                  </p>
                </div>
                {convertedResults.some((result) => result.blob) && <button
                  onClick={handleDownloadAll}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  {convertedResults.length > 1 ? 'Download All as ZIP' : 'Download'}
                </button>}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {convertedResults.map((result, i) => (
              <div key={`${result.fileName}-${i}`} className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl p-3 border border-emerald-100 dark:border-emerald-500/20">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {result.error ? <span role="alert" className="text-sm text-red-600 dark:text-red-400">{result.fileName}: {result.error}</span> : <>
                      {renamingIndex === i ? (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(i);
                              if (e.key === 'Escape') { setRenamingIndex(null); setRenameValue(''); }
                            }}
                            className="input-field !py-1 !px-2 text-sm flex-1 min-w-0"
                            autoFocus
                          />
                          <button
                            onClick={() => handleRename(i)}
                            className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 hover:bg-emerald-200 transition-colors flex-shrink-0"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{result.fileName}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">({formatFileSize(result.size)})</span>
                        </>
                      )}
                      </>}
                    </div>
                    {result.blob && <div className="flex items-center gap-1 flex-shrink-0">
                      {renamingIndex !== i && (
                        <button
                          onClick={() => startRename(i)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                          title="Rename file"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => downloadFile(result.blob, result.fileName)}
                        className="btn-ghost text-brand-600 dark:text-brand-400 hover:text-brand-700"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {conversionError && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{conversionError}</p>}
        </motion.div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-400 dark:text-gray-500">
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
            Unlimited & Free
          </span>
        </div>
      </div>
    </section>
  );
}
