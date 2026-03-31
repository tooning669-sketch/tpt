'use client';

import React from 'react';
import { Heading1, Heading2, AlignLeft } from 'lucide-react';

interface TextPanelProps {
  onAddText: (preset: 'heading' | 'subheading' | 'body') => void;
}

const presets = [
  {
    id: 'heading' as const,
    icon: Heading1,
    label: 'Add Heading',
    desc: 'Large bold title text',
    preview: 'Heading Text',
    fontSize: '18px',
    fontWeight: '700',
  },
  {
    id: 'subheading' as const,
    icon: Heading2,
    label: 'Add Subheading',
    desc: 'Medium section header',
    preview: 'Subheading',
    fontSize: '15px',
    fontWeight: '600',
  },
  {
    id: 'body' as const,
    icon: AlignLeft,
    label: 'Add Body Text',
    desc: 'Regular paragraph text',
    preview: 'Body text here...',
    fontSize: '13px',
    fontWeight: '400',
  },
];

export default function TextPanel({ onAddText }: TextPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div
        className="px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          Text
        </h2>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Click to add text to canvas
        </p>
      </div>

      {/* Text Presets */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {presets.map((preset) => {
          const Icon = preset.icon;
          return (
            <button
              key={preset.id}
              onClick={() => onAddText(preset.id)}
              className="flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:border-[var(--accent)] hover:bg-white/[0.03] text-left"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-tertiary)',
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(108, 92, 231, 0.12)' }}
              >
                <Icon size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="min-w-0">
                <p
                  className="font-semibold truncate"
                  style={{
                    color: 'var(--text-primary)',
                    fontSize: preset.fontSize,
                    fontWeight: preset.fontWeight,
                  }}
                >
                  {preset.preview}
                </p>
                <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {preset.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
