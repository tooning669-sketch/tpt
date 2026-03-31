'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import TemplatesPanel from './TemplatesPanel';
import AIPanel from './AIPanel';
import UploadsPanel from './UploadsPanel';
import TextPanel from './TextPanel';
import ShapesPanel from './ShapesPanel';

interface Tier2PanelProps {
  onGenerate: () => void;
  onSaveTemplate: () => void;
  onLoadTemplate: (templateId: string | null) => void;
  onAddText: (preset: 'heading' | 'subheading' | 'body') => void;
  onAddShape: (shape: string) => void;
  onAddImage: (url: string) => void;
}

export default function Tier2Panel({
  onGenerate,
  onSaveTemplate,
  onLoadTemplate,
  onAddText,
  onAddShape,
  onAddImage,
}: Tier2PanelProps) {
  const { activeSidebarTab } = useAppStore();

  const renderPanel = () => {
    switch (activeSidebarTab) {
      case 'templates':
        return <TemplatesPanel onLoadTemplate={onLoadTemplate} />;
      case 'ai':
        return (
          <AIPanel
            onGenerate={onGenerate}
            onSaveTemplate={onSaveTemplate}
          />
        );
      case 'uploads':
        return <UploadsPanel onAddImage={onAddImage} />;
      case 'text':
        return <TextPanel onAddText={onAddText} />;
      case 'shapes':
        return <ShapesPanel onAddShape={onAddShape} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="shrink-0 border-r overflow-hidden flex flex-col"
      style={{
        width: 280,
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
      }}
    >
      {renderPanel()}
    </div>
  );
}
