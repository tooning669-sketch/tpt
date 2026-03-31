'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Sparkles, Upload, FileText, X, Settings } from 'lucide-react';
import { getDecryptedKey } from '@/lib/crypto';

interface AIPanelProps {
  onGenerate: () => void;
  onSaveTemplate: () => void;
}

const subjects = [
  { value: 'math', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'english', label: 'English Language Arts' },
  { value: 'social-studies', label: 'Social Studies' },
  { value: 'reading', label: 'Reading Comprehension' },
  { value: 'vocabulary', label: 'Vocabulary' },
];

const gradeLevels = [
  { value: 'k', label: 'Kindergarten' },
  { value: '1', label: '1st Grade' },
  { value: '2', label: '2nd Grade' },
  { value: '3', label: '3rd Grade' },
  { value: '4', label: '4th Grade' },
  { value: '5', label: '5th Grade' },
  { value: '6', label: '6th Grade' },
  { value: '7', label: '7th Grade' },
  { value: '8', label: '8th Grade' },
  { value: '9-12', label: 'High School' },
];

const questionTypes = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'fill-blank', label: 'Fill in the Blank' },
  { value: 'short-answer', label: 'Short Answer' },
  { value: 'true-false', label: 'True / False' },
  { value: 'matching', label: 'Matching' },
  { value: 'word-problem', label: 'Word Problems' },
  { value: 'open-ended', label: 'Open Ended' },
];

export default function AIPanel({ onGenerate, onSaveTemplate }: AIPanelProps) {
  const {
    generating,
    generationParams,
    setGenerationParams,
    setSettingsOpen,
    activeProvider,
    colorMode,
    setColorMode,
    contextFileName,
    contextFileText,
    setContextFile,
    clearContextFile,
    addToast,
  } = useAppStore();

  const [hasKey, setHasKey] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasKey(!!getDecryptedKey(activeProvider));
  }, [activeProvider]);

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    borderColor: 'var(--border)',
  };

  const processFile = useCallback(async (file: File) => {
    const allowedTypes = ['.txt', '.csv', '.pdf', '.docx'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(ext)) {
      addToast({ type: 'error', message: 'Supported formats: .txt, .csv, .pdf, .docx' });
      return;
    }

    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        addToast({ type: 'error', message: data.error || 'Failed to extract text' });
        return;
      }

      const data = await res.json();
      setContextFile(data.text, data.fileName);
      addToast({ type: 'success', message: `Loaded "${data.fileName}" as context` });
    } catch {
      addToast({ type: 'error', message: 'Failed to process file' });
    } finally {
      setIsExtracting(false);
    }
  }, [addToast, setContextFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div
        className="px-4 py-3 border-b shrink-0 flex items-center justify-between"
        style={{ borderColor: 'var(--border)' }}
      >
        <div>
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            AI Generator
          </h2>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Generate worksheets with AI
          </p>
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-smooth"
          title="API Key Settings"
        >
          <Settings size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {/* API Key Warning */}
        {!hasKey && (
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-2 p-2.5 rounded-xl border text-[11px] text-left transition-smooth hover:border-amber-500/40"
            style={{
              background: 'rgba(253, 203, 110, 0.08)',
              borderColor: 'rgba(253, 203, 110, 0.2)',
              color: 'var(--warning)',
            }}
          >
            <Settings size={14} className="shrink-0" />
            <span>No API key. Tap to configure.</span>
          </button>
        )}

        {/* Color Mode */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Color Mode
          </label>
          <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {(['bw', 'color'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setColorMode(mode)}
                className="flex-1 py-2 text-[11px] font-semibold transition-smooth"
                style={{
                  background: colorMode === mode ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: colorMode === mode ? '#fff' : 'var(--text-muted)',
                }}
              >
                {mode === 'bw' ? '⬛ B&W' : '🎨 Color'}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: 'var(--border)' }} />

        {/* Subject */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Subject
          </label>
          <select
            value={generationParams.subject}
            onChange={(e) => setGenerationParams({ subject: e.target.value })}
            className="px-2.5 py-2 rounded-xl border text-xs outline-none transition-smooth focus:ring-2 focus:ring-[var(--accent)]/30"
            style={selectStyle}
          >
            {subjects.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Grade Level */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Grade Level
          </label>
          <select
            value={generationParams.gradeLevel}
            onChange={(e) => setGenerationParams({ gradeLevel: e.target.value })}
            className="px-2.5 py-2 rounded-xl border text-xs outline-none transition-smooth focus:ring-2 focus:ring-[var(--accent)]/30"
            style={selectStyle}
          >
            {gradeLevels.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>

        {/* Question Type */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Question Type
          </label>
          <select
            value={generationParams.questionType}
            onChange={(e) => setGenerationParams({ questionType: e.target.value })}
            className="px-2.5 py-2 rounded-xl border text-xs outline-none transition-smooth focus:ring-2 focus:ring-[var(--accent)]/30"
            style={selectStyle}
          >
            {questionTypes.map((q) => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
        </div>

        {/* Number of Questions */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Questions
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={generationParams.numberOfQuestions}
            onChange={(e) =>
              setGenerationParams({ numberOfQuestions: parseInt(e.target.value) || 6 })
            }
            className="px-2.5 py-2 rounded-xl border text-xs outline-none transition-smooth focus:ring-2 focus:ring-[var(--accent)]/30"
            style={selectStyle}
          />
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: 'var(--border)' }} />

        {/* Context File Upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            📎 Upload Context File
          </label>

          {contextFileName ? (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
              style={{
                background: 'rgba(108, 92, 231, 0.06)',
                borderColor: 'var(--accent)',
              }}
            >
              <FileText size={16} style={{ color: 'var(--accent)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {contextFileName}
                </p>
                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {contextFileText.length.toLocaleString()} chars extracted
                </p>
              </div>
              <button
                onClick={clearContextFile}
                className="p-1 rounded-lg hover:bg-white/10 transition-smooth"
                title="Remove file"
              >
                <X size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="dropzone-area flex flex-col items-center gap-2 px-3 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200"
              style={{
                borderColor: isDragOver ? 'var(--accent)' : 'var(--border)',
                background: isDragOver ? 'rgba(108, 92, 231, 0.08)' : 'transparent',
              }}
            >
              {isExtracting ? (
                <>
                  <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    Extracting text…
                  </span>
                </>
              ) : (
                <>
                  <Upload size={20} style={{ color: isDragOver ? 'var(--accent)' : 'var(--text-muted)' }} />
                  <span className="text-[10px] font-medium text-center" style={{ color: 'var(--text-muted)' }}>
                    Drag & drop or click to upload
                  </span>
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                    .pdf, .txt, .csv, .docx
                  </span>
                </>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.csv,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Bottom Actions */}
      <div
        className="shrink-0 p-4 border-t flex flex-col gap-2"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={onGenerate}
          disabled={generating || !hasKey}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white transition-smooth disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: generating
              ? 'var(--bg-tertiary)'
              : 'linear-gradient(135deg, var(--accent), #a855f7)',
            boxShadow: generating ? 'none' : '0 4px 16px var(--accent-glow)',
          }}
        >
          {generating ? (
            <>
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Generating…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Worksheet
            </>
          )}
        </button>
        <button
          onClick={onSaveTemplate}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[11px] font-semibold border transition-smooth hover:bg-white/5"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          Save Current as Template
        </button>
      </div>
    </div>
  );
}
