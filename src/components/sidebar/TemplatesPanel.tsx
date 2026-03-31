'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Plus, Trash2, Crown } from 'lucide-react';
import { PRESET_TEMPLATES } from '@/lib/presetTemplates';

interface TemplatesPanelProps {
  onLoadTemplate: (templateId: string | null) => void;
  onLoadPreset: (presetId: string) => void;
}

export default function TemplatesPanel({ onLoadTemplate, onLoadPreset }: TemplatesPanelProps) {
  const {
    savedTemplates,
    selectedTemplateId,
    setSelectedTemplateId,
    removeTemplate,
  } = useAppStore();

  const handleSelect = (id: string | null) => {
    setSelectedTemplateId(id);
    onLoadTemplate(id);
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedTemplateId(null);
    onLoadPreset(presetId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div
        className="px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <h2
          className="text-sm font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Templates
        </h2>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Select a template or start blank
        </p>
      </div>

      {/* Template Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* ── Built-in TPT Templates ─── */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Crown size={12} style={{ color: 'var(--warning)' }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Built-in Templates
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_TEMPLATES.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] relative"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--bg-tertiary)',
                }}
              >
                {/* Badge */}
                <div
                  className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-wider z-10"
                  style={{
                    background: preset.badge === 'Best Seller' ? 'var(--warning)' : 'var(--accent)',
                    color: preset.badge === 'Best Seller' ? '#333' : '#fff',
                  }}
                >
                  {preset.badge}
                </div>

                {/* Preview */}
                <div
                  className="w-full aspect-[8.5/11] rounded-lg flex flex-col items-center justify-center gap-1"
                  style={{ background: '#ffffff', border: '1px solid var(--border)' }}
                >
                  <span className="text-2xl">{preset.icon}</span>
                  <span className="text-[8px] font-semibold" style={{ color: '#666' }}>
                    {preset.name}
                  </span>
                </div>
                <span
                  className="text-[9px] font-semibold truncate w-full text-center"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Separator ─── */}
        <div className="h-px my-3" style={{ background: 'var(--border)' }} />

        {/* ── Custom Templates ─── */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            My Templates
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* Blank Template */}
          <button
            onClick={() => handleSelect(null)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]"
            style={{
              borderColor: selectedTemplateId === null ? 'var(--accent)' : 'var(--border)',
              background: selectedTemplateId === null ? 'rgba(108, 92, 231, 0.08)' : 'var(--bg-tertiary)',
            }}
          >
            <div
              className="w-full aspect-[8.5/11] rounded-lg flex items-center justify-center text-2xl"
              style={{ background: '#ffffff', border: '1px solid var(--border)' }}
            >
              <Plus size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <span
              className="text-[10px] font-semibold truncate w-full text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              Blank
            </span>
          </button>

          {/* Saved Templates */}
          {savedTemplates.map((tpl) => (
            <div key={tpl.id} className="relative group">
              <button
                onClick={() => handleSelect(tpl.id)}
                className="w-full flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]"
                style={{
                  borderColor: selectedTemplateId === tpl.id ? 'var(--accent)' : 'var(--border)',
                  background: selectedTemplateId === tpl.id ? 'rgba(108, 92, 231, 0.08)' : 'var(--bg-tertiary)',
                }}
              >
                <div
                  className="w-full aspect-[8.5/11] rounded-lg overflow-hidden"
                  style={{ border: '1px solid var(--border)', background: '#ffffff' }}
                >
                  {tpl.thumbnail ? (
                    <img
                      src={tpl.thumbnail}
                      alt={tpl.name}
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      📄
                    </div>
                  )}
                </div>
                <span
                  className="text-[10px] font-semibold truncate w-full text-center"
                  style={{ color: 'var(--text-secondary)' }}
                  title={tpl.name}
                >
                  {tpl.name.replace('Template — ', '')}
                </span>
              </button>

              {/* Delete button on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTemplate(tpl.id);
                }}
                className="absolute top-1 right-1 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'rgba(255, 107, 107, 0.9)',
                }}
                title="Delete template"
              >
                <Trash2 size={12} className="text-white" />
              </button>
            </div>
          ))}
        </div>

        {savedTemplates.length === 0 && (
          <p
            className="text-[11px] text-center mt-4 px-2"
            style={{ color: 'var(--text-muted)' }}
          >
            No custom templates yet. Generate a worksheet, then save it as a template.
          </p>
        )}
      </div>
    </div>
  );
}
