'use client';

import React from 'react';
import { Square, Circle, Minus } from 'lucide-react';

interface ShapesPanelProps {
  onAddShape: (shape: string) => void;
}

const shapes = [
  { id: 'rect', icon: Square, label: 'Rectangle', color: '#6c5ce7' },
  { id: 'circle', icon: Circle, label: 'Circle', color: '#00cec9' },
  { id: 'line', icon: Minus, label: 'Line', color: '#fdcb6e' },
];

export default function ShapesPanel({ onAddShape }: ShapesPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div
        className="px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          Shapes
        </h2>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Add shapes to your canvas
        </p>
      </div>

      {/* Shape Buttons */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-2">
          {shapes.map((shape) => {
            const Icon = shape.icon;
            return (
              <button
                key={shape.id}
                onClick={() => onAddShape(shape.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 hover:scale-[1.05] hover:border-[var(--accent)]"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--bg-tertiary)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${shape.color}20` }}
                >
                  <Icon size={22} style={{ color: shape.color }} />
                </div>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {shape.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
