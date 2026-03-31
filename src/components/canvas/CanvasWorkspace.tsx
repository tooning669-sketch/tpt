'use client';

import React, { useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface CanvasWorkspaceProps {
  onCanvasInit: (el: HTMLCanvasElement) => void;
  onInitFirstPage: () => void;
  onAddPage: () => void;
  onSwitchPage: (idx: number) => void;
  onDeletePage: () => void;
  canvasWidth: number;
  canvasHeight: number;
}

export default function CanvasWorkspace({
  onCanvasInit,
  onInitFirstPage,
  onAddPage,
  onSwitchPage,
  onDeletePage,
  canvasWidth,
  canvasHeight,
}: CanvasWorkspaceProps) {
  const { showGrid, generating, pages, activePageIndex } = useAppStore();
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const initialized = useRef(false);
  const pageStripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasElRef.current && !initialized.current) {
      initialized.current = true;
      onCanvasInit(canvasElRef.current);
      // Small delay to ensure canvas is ready
      setTimeout(() => onInitFirstPage(), 100);
    }
  }, [onCanvasInit, onInitFirstPage]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-canvas)' }}>
      {/* Main Canvas Area */}
      <div
        className="flex-1 relative overflow-auto flex items-start justify-center py-8"
      >
        {showGrid && <div className="absolute inset-0 grid-pattern pointer-events-none z-0" />}

        {/* Paper */}
        <div className="relative" style={{ width: canvasWidth, minHeight: canvasHeight }}>
          <div className="paper-shadow rounded-sm overflow-hidden">
            <canvas ref={canvasElRef} id="worksheet-canvas" />
          </div>

          {/* Page label */}
          <div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-medium tabular-nums"
            style={{ color: 'var(--text-muted)' }}
          >
            Page {activePageIndex + 1} of {pages.length} — US Letter (8.5 × 11 in)
          </div>
        </div>

        {/* AI Generation Overlay */}
        {generating && (
          <div className="absolute inset-0 modal-backdrop z-30 flex flex-col items-center justify-center gap-4">
            <div className="spinner pulse-glow" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              AI is generating your worksheet...
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              This may take a few seconds
            </p>
          </div>
        )}
      </div>

      {/* Page Navigator Strip */}
      <div
        className="shrink-0 border-t px-4 py-3 flex items-center gap-3"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        {/* Page thumbnails */}
        <div
          ref={pageStripRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {pages.map((page, idx) => (
            <button
              key={page.id}
              onClick={() => onSwitchPage(idx)}
              className="shrink-0 flex flex-col items-center gap-1 transition-smooth"
            >
              <div
                className="w-16 h-20 rounded-lg border-2 overflow-hidden bg-white transition-smooth"
                style={{
                  borderColor: idx === activePageIndex ? 'var(--accent)' : 'var(--border)',
                  boxShadow: idx === activePageIndex ? '0 0 12px var(--accent-glow)' : 'none',
                }}
              >
                {page.thumbnail ? (
                  <img
                    src={page.thumbnail}
                    alt={`Page ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    P{idx + 1}
                  </div>
                )}
              </div>
              <span
                className="text-[10px] font-medium tabular-nums"
                style={{ color: idx === activePageIndex ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {idx + 1}
              </span>
            </button>
          ))}

          {/* Add Page Button */}
          <button
            onClick={onAddPage}
            className="shrink-0 w-16 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-smooth hover:border-[var(--accent)] hover:bg-[var(--accent-glow)]"
            style={{ borderColor: 'var(--border)' }}
          >
            <Plus size={18} style={{ color: 'var(--accent)' }} />
            <span className="text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>
              Add Page
            </span>
          </button>
        </div>

        {/* Delete current page */}
        {pages.length > 1 && (
          <button
            onClick={onDeletePage}
            className="p-2 rounded-lg hover:bg-red-500/10 transition-smooth"
            title="Delete current page"
          >
            <Trash2 size={16} style={{ color: 'var(--error)' }} />
          </button>
        )}
      </div>
    </div>
  );
}
