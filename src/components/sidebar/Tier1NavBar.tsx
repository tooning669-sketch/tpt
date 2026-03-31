'use client';

import React from 'react';
import { useAppStore, SidebarTab } from '@/store/useAppStore';
import { Layout, Sparkles, Image, Type, Shapes } from 'lucide-react';

const tabs: { id: SidebarTab; icon: React.ElementType; label: string }[] = [
  { id: 'templates', icon: Layout, label: 'Templates' },
  { id: 'ai', icon: Sparkles, label: 'AI Generator' },
  { id: 'uploads', icon: Image, label: 'Uploads' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'shapes', icon: Shapes, label: 'Shapes' },
];

export default function Tier1NavBar() {
  const { activeSidebarTab, setActiveSidebarTab } = useAppStore();

  return (
    <div
      className="tier1-nav shrink-0 flex flex-col items-center py-3 gap-1 border-r"
      style={{
        width: 72,
        background: 'var(--bg-primary)',
        borderColor: 'var(--border)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeSidebarTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveSidebarTab(tab.id)}
            className="tier1-btn relative flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-xl transition-all duration-200"
            style={{
              background: isActive ? 'rgba(108, 92, 231, 0.15)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            }}
            title={tab.label}
          >
            {isActive && (
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full"
                style={{ background: 'var(--accent)' }}
              />
            )}
            <Icon size={20} />
            <span className="text-[9px] font-semibold leading-none tracking-wide">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
