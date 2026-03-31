'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Trash2,
  Copy,
} from 'lucide-react';

interface PropertiesPanelProps {
  onUpdateProperty: (prop: string, value: unknown) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const fontFamilies = [
  'Inter',
  'Outfit',
  'Arial',
  'Georgia',
  'Comic Sans MS',
  'Courier New',
  'Times New Roman',
  'Verdana',
  'Trebuchet MS',
];

export default function PropertiesPanel({
  onUpdateProperty,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onDelete,
  onDuplicate,
}: PropertiesPanelProps) {
  const { selectedObject } = useAppStore();

  if (!selectedObject) {
    return (
      <div
        className="w-[280px] shrink-0 border-l flex items-center justify-center p-6"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          Select an object on the canvas to edit its properties
        </p>
      </div>
    );
  }

  const isText = selectedObject.type?.includes('text') || selectedObject.type?.includes('Textbox');
  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-tertiary)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)',
  };

  return (
    <div
      className="w-[280px] shrink-0 border-l overflow-y-auto"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="p-4 flex flex-col gap-4">
        {/* Object Type Label */}
        <div
          className="flex items-center justify-between pb-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            {selectedObject.type || 'Object'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onDuplicate}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-smooth"
              title="Duplicate"
            >
              <Copy size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-500/10 transition-smooth"
              title="Delete"
            >
              <Trash2 size={14} style={{ color: 'var(--error)' }} />
            </button>
          </div>
        </div>

        {/* Position & Size */}
        <section>
          <h3 className="text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Position & Size
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'X', prop: 'left', value: selectedObject.left },
              { label: 'Y', prop: 'top', value: selectedObject.top },
              { label: 'W', prop: 'width', value: selectedObject.width },
              { label: 'H', prop: 'height', value: selectedObject.height },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <label className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  {item.label}
                </label>
                <input
                  type="number"
                  value={Math.round(item.value || 0)}
                  onChange={(e) => onUpdateProperty(item.prop, parseFloat(e.target.value) || 0)}
                  className="px-2 py-1.5 rounded-lg border text-xs outline-none"
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
          <div className="mt-2">
            <label className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
              Rotation
            </label>
            <input
              type="number"
              value={Math.round(selectedObject.angle || 0)}
              onChange={(e) => onUpdateProperty('angle', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1.5 rounded-lg border text-xs outline-none mt-1"
              style={inputStyle}
            />
          </div>
        </section>

        {/* Text Properties */}
        {isText && (
          <section>
            <h3 className="text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Text
            </h3>
            <div className="flex flex-col gap-2">
              <div>
                <label className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  Font Family
                </label>
                <select
                  value={selectedObject.fontFamily || 'Inter'}
                  onChange={(e) => onUpdateProperty('fontFamily', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border text-xs outline-none mt-1"
                  style={inputStyle}
                >
                  {fontFamilies.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    Size
                  </label>
                  <input
                    type="number"
                    value={selectedObject.fontSize || 14}
                    onChange={(e) => onUpdateProperty('fontSize', parseInt(e.target.value) || 14)}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs outline-none mt-1"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    Weight
                  </label>
                  <select
                    value={selectedObject.fontWeight || 400}
                    onChange={(e) => onUpdateProperty('fontWeight', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs outline-none mt-1"
                    style={inputStyle}
                  >
                    <option value="300">Light</option>
                    <option value="400">Regular</option>
                    <option value="600">Semi Bold</option>
                    <option value="700">Bold</option>
                    <option value="800">Extra Bold</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  Alignment
                </label>
                <div className="flex gap-1 mt-1">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      onClick={() => onUpdateProperty('textAlign', align)}
                      className="flex-1 py-1.5 rounded-lg border text-[10px] font-medium capitalize transition-smooth"
                      style={{
                        borderColor:
                          selectedObject.textAlign === align ? 'var(--accent)' : 'var(--border)',
                        background:
                          selectedObject.textAlign === align
                            ? 'rgba(108,92,231,0.15)'
                            : 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Appearance */}
        <section>
          <h3 className="text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Appearance
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-medium w-12 shrink-0" style={{ color: 'var(--text-muted)' }}>
                Fill
              </label>
              <input
                type="color"
                value={typeof selectedObject.fill === 'string' ? selectedObject.fill : '#000000'}
                onChange={(e) => onUpdateProperty('fill', e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0"
                style={{ background: 'transparent' }}
              />
              <input
                type="text"
                value={typeof selectedObject.fill === 'string' ? selectedObject.fill : '#000000'}
                onChange={(e) => onUpdateProperty('fill', e.target.value)}
                className="flex-1 px-2 py-1.5 rounded-lg border text-xs outline-none"
                style={inputStyle}
              />
            </div>
            {!isText && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-medium w-12 shrink-0" style={{ color: 'var(--text-muted)' }}>
                    Stroke
                  </label>
                  <input
                    type="color"
                    value={selectedObject.stroke || '#000000'}
                    onChange={(e) => onUpdateProperty('stroke', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0"
                    style={{ background: 'transparent' }}
                  />
                  <input
                    type="text"
                    value={selectedObject.stroke || '#000000'}
                    onChange={(e) => onUpdateProperty('stroke', e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-lg border text-xs outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    Stroke Width
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={selectedObject.strokeWidth || 0}
                    onChange={(e) => onUpdateProperty('strokeWidth', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs outline-none mt-1"
                    style={inputStyle}
                  />
                </div>
              </>
            )}
            <div>
              <label className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                Opacity
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={selectedObject.opacity ?? 1}
                onChange={(e) => onUpdateProperty('opacity', parseFloat(e.target.value))}
                className="w-full mt-1 accent-[var(--accent)]"
              />
            </div>
          </div>
        </section>

        {/* Layer Controls */}
        <section>
          <h3 className="text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Layer Order
          </h3>
          <div className="grid grid-cols-4 gap-1">
            {[
              { label: 'Front', icon: <ChevronsUp size={14} />, action: onBringToFront },
              { label: 'Up', icon: <ArrowUp size={14} />, action: onBringForward },
              { label: 'Down', icon: <ArrowDown size={14} />, action: onSendBackward },
              { label: 'Back', icon: <ChevronsDown size={14} />, action: onSendToBack },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="flex flex-col items-center gap-1 py-2 rounded-lg border transition-smooth hover:bg-white/5"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-tertiary)',
                }}
              >
                {item.icon}
                <span className="text-[9px]">{item.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
