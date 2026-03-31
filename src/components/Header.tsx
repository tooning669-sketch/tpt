'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  Save,
  Settings,
  FileDown,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onExportPDF: () => void;
  onExportPNG: () => void;
  onSaveTemplate: () => void;
}

export default function Header({
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onExportPDF,
  onExportPNG,
  onSaveTemplate,
}: HeaderProps) {
  const { zoomLevel, canUndoCount, canRedoCount, setSettingsOpen } = useAppStore();
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  return (
    <header
      className="flex items-center justify-between h-14 px-4 border-b shrink-0 relative z-50"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Left Section - Logo + Undo/Redo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <Sparkles size={18} className="text-white" />
          </div>
          <span
            className="font-semibold text-base tracking-tight"
            style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}
          >
            Worksheet Studio
          </span>
        </div>

        <div className="w-px h-6" style={{ background: 'var(--border)' }} />

        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={canUndoCount === 0}
            className="p-2 rounded-lg transition-smooth hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo2 size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <button
            onClick={onRedo}
            disabled={canRedoCount === 0}
            className="p-2 rounded-lg transition-smooth hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo2 size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
      </div>

      {/* Center - Zoom Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onZoomOut}
          className="p-2 rounded-lg transition-smooth hover:bg-white/5"
          title="Zoom Out"
        >
          <ZoomOut size={18} style={{ color: 'var(--text-secondary)' }} />
        </button>
        <span
          className="text-sm font-medium w-14 text-center tabular-nums"
          style={{ color: 'var(--text-primary)' }}
        >
          {zoomLevel}%
        </span>
        <button
          onClick={onZoomIn}
          className="p-2 rounded-lg transition-smooth hover:bg-white/5"
          title="Zoom In"
        >
          <ZoomIn size={18} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* Right Section - Export + Settings */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSaveTemplate}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth hover:bg-white/5"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Save size={16} />
          Save
        </button>

        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-smooth"
            style={{ background: 'var(--accent)' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'var(--accent-hover)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'var(--accent)')
            }
          >
            <Download size={16} />
            Export
          </button>

          {showExportMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowExportMenu(false)}
              />
              <div
                className="absolute right-0 top-full mt-2 w-48 rounded-xl border p-1 z-50"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <button
                  onClick={() => {
                    onExportPDF();
                    setShowExportMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-smooth hover:bg-white/5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <FileDown size={16} style={{ color: 'var(--accent)' }} />
                  Export as PDF
                </button>
                <button
                  onClick={() => {
                    onExportPNG();
                    setShowExportMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-smooth hover:bg-white/5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <ImageIcon size={16} style={{ color: 'var(--accent-secondary)' }} />
                  Export as PNG
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-lg transition-smooth hover:bg-white/5"
          title="Settings"
        >
          <Settings size={18} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>
    </header>
  );
}
