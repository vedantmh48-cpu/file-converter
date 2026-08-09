import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FileArchive, Link2, Upload, X, Download, 
  Loader2, CheckCircle2, Copy, FileDown, 
  FileText, File
} from 'lucide-react';
import { 
  formatFileSize, getFileExtension, compressFile, 
  fileToLink, copyToClipboard, downloadFile 
} from '../utils/conversionUtils';

export default function ExtraTools() {
  return (
    <section id="extra-tools" className="relative py-20 lg:py-28 bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="badge-info mb-4">More Tools</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-3">
              Compress & Share Files
            </h2>
            <p className="mt-3 text-gray-500 text-lg max-w-xl mx-auto">
              Reduce file sizes and generate shareable links — all in your browser.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FileCompressor />
          <FileToLink />
        </div>
      </div>
    </section>
  );
}

// ============ File Compressor Component ============

function FileCompressor() {
  const [files, setFiles] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [results, setResults] = useState([]);
  const [quality, setQuality] = useState(0.7);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

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
    }));
    setFiles(prev => [...prev, ...newFiles]);
    setResults([]);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setResults([]);
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
  };

  const handleCompress = async () => {
    if (files.length === 0) return;
    setCompressing(true);
    setResults([]);

    try {
      const compressedResults = [];
      for (const fileData of files) {
        const result = await compressFile(fileData.file, quality);
        compressedResults.push(result);
      }
      setResults(compressedResults);
    } catch (error) {
      console.error('Compression error:', error);
      alert('Compression failed: ' + error.message);
    } finally {
      setCompressing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="card-floating p-6 lg:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
          <FileArchive className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">File Compressor</h3>
          <p className="text-sm text-gray-500">Compress images, PDFs & text files</p>
        </div>
      </div>

      {/* Quality Slider */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Compression Quality: <span className="text-emerald-600 font-semibold">{Math.round(quality * 100)}%</span>
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={quality}
          onChange={(e) => setQuality(parseFloat(e.target.value))}
          className="w-full accent-emerald-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Smaller size</span>
          <span>Better quality</span>
        </div>
      </div>

      {/* Dropzone */}
      <div
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
          accept=".jpg,.jpeg,.png,.webp,.bmp,.gif,.tiff,.pdf,.txt,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
            dragActive ? 'bg-emerald-100 scale-110' : 'bg-gray-50'
          }`}>
            <Upload className={`w-8 h-8 transition-colors ${
              dragActive ? 'text-emerald-600' : 'text-gray-400'
            }`} />
          </div>
          <div>
            <p className="text-base font-medium text-gray-700">
              {dragActive ? 'Drop files here' : 'Drag & drop files to compress'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              or <span className="text-emerald-600 font-medium hover:underline">browse files</span>
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Supports: JPG, PNG, WEBP, BMP, GIF, TIFF, PDF, TXT, CSV
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

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {files.map((file) => (
              <div key={file.id} className="file-item group">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <File className="w-5 h-5 text-emerald-600" />
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
              </div>
            ))}
          </div>

          <button
            onClick={handleCompress}
            disabled={compressing}
            className="btn-primary w-full gap-2 !bg-emerald-600 hover:!bg-emerald-700"
          >
            {compressing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Compressing...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Compress {files.length > 1 ? `All (${files.length})` : 'File'}
              </>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-800">
              Compression Complete! ({results.length} file{results.length > 1 ? 's' : ''})
            </p>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {results.map((result, i) => {
              const savings = result.originalSize ? Math.round((1 - result.size / result.originalSize) * 100) : 0;
              return (
                <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border border-emerald-100">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileDown className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700 truncate">{result.fileName}</p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(result.originalSize)} → {formatFileSize(result.size)}
                        {savings > 0 && <span className="text-emerald-600 font-medium"> ({savings}% smaller)</span>}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadFile(result.blob, result.fileName)}
                    className="btn-ghost text-emerald-600 hover:text-emerald-700 flex-shrink-0"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============ File to Link Component ============

function FileToLink() {
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const inputRef = useRef(null);

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
    }));
    setFiles(prev => [...prev, ...newFiles]);
    setLinks([]);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setLinks([]);
  };

  const clearAll = () => {
    setFiles([]);
    setLinks([]);
  };

  const handleGenerateLinks = async () => {
    if (files.length === 0) return;
    setGenerating(true);
    setLinks([]);

    try {
      const generatedLinks = [];
      for (const fileData of files) {
        const result = await fileToLink(fileData.file);
        generatedLinks.push(result);
      }
      setLinks(generatedLinks);
    } catch (error) {
      console.error('Link generation error:', error);
      alert('Failed to generate links: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (index) => {
    try {
      await copyToClipboard(links[index].link);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy link. Please copy manually.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="card-floating p-6 lg:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
          <Link2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">File to Link</h3>
          <p className="text-sm text-gray-500">Generate shareable links for any file</p>
        </div>
      </div>

      {/* Dropzone */}
      <div
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
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
            dragActive ? 'bg-blue-100 scale-110' : 'bg-gray-50'
          }`}>
            <Link2 className={`w-8 h-8 transition-colors ${
              dragActive ? 'text-blue-600' : 'text-gray-400'
            }`} />
          </div>
          <div>
            <p className="text-base font-medium text-gray-700">
              {dragActive ? 'Drop files here' : 'Drag & drop any file'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              or <span className="text-blue-600 font-medium hover:underline">browse files</span>
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Supports any file type — images, documents, videos, and more
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

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {files.map((file) => (
              <div key={file.id} className="file-item group">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
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
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerateLinks}
            disabled={generating}
            className="btn-primary w-full gap-2 !bg-blue-600 hover:!bg-blue-700"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Links...
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                Generate {files.length > 1 ? `Links (${files.length})` : 'Link'}
              </>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {links.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-semibold text-blue-800">
              Links Generated! ({links.length} link{links.length > 1 ? 's' : ''})
            </p>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {links.map((link, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Link2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 truncate">{link.fileName}</p>
                    <p className="text-xs text-gray-400 truncate">{link.link.substring(0, 60)}...</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(i)}
                  className={`btn-ghost flex-shrink-0 ${
                    copiedIndex === i 
                      ? 'text-emerald-600' 
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  {copiedIndex === i ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}