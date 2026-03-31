'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore, type AIProvider } from '@/store/useAppStore';
import {
  X,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  Grid3X3,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { saveEncryptedKey, getDecryptedKey, removeKey } from '@/lib/crypto';

const providers: {
  id: AIProvider;
  name: string;
  color: string;
  helpUrl: string;
  helpText: string;
}[] = [
  {
    id: 'openai',
    name: 'OpenAI (GPT)',
    color: '#10a37f',
    helpUrl: 'https://platform.openai.com/api-keys',
    helpText: 'Go to platform.openai.com → API Keys → Create new secret key',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    color: '#4285f4',
    helpUrl: 'https://aistudio.google.com/app/apikey',
    helpText: 'Go to AI Studio → Get API Key → Create API key',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    color: '#d97757',
    helpUrl: 'https://console.anthropic.com/settings/keys',
    helpText: 'Go to console.anthropic.com → Settings → API Keys → Create Key',
  },
];

export default function SettingsModal() {
  const {
    settingsOpen,
    setSettingsOpen,
    activeProvider,
    setActiveProvider,
    keyValidated,
    setKeyValidated,
    showGrid,
    setShowGrid,
    addToast,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'general' | 'api'>('api');
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [showHelp, setShowHelp] = useState<string | null>(null);

  useEffect(() => {
    if (settingsOpen) {
      const existing = getDecryptedKey(activeProvider);
      setKeyInput(existing || '');
    }
  }, [settingsOpen, activeProvider]);

  if (!settingsOpen) return null;

  const provider = providers.find((p) => p.id === activeProvider)!;

  const handleValidate = async () => {
    if (!keyInput.trim()) {
      addToast({ type: 'error', message: 'Please enter an API key' });
      return;
    }

    setValidating(true);
    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: activeProvider, apiKey: keyInput.trim() }),
      });
      const data = await res.json();

      if (data.valid) {
        saveEncryptedKey(activeProvider, keyInput.trim());
        setKeyValidated(activeProvider, true);
        addToast({ type: 'success', message: `${provider.name} API key validated & saved!` });
      } else {
        setKeyValidated(activeProvider, false);
        addToast({ type: 'error', message: data.error || 'Invalid API key' });
      }
    } catch {
      addToast({ type: 'error', message: 'Validation failed. Check your connection.' });
    } finally {
      setValidating(false);
    }
  };

  const handleSaveWithoutValidation = () => {
    if (!keyInput.trim()) return;
    saveEncryptedKey(activeProvider, keyInput.trim());
    setKeyValidated(activeProvider, true);
    addToast({ type: 'success', message: `${provider.name} API key saved!` });
  };

  const handleRemoveKey = () => {
    removeKey(activeProvider);
    setKeyInput('');
    setKeyValidated(activeProvider, false);
    addToast({ type: 'info', message: `${provider.name} API key removed` });
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[90] flex items-center justify-center"
      onClick={() => setSettingsOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl border overflow-hidden"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}
          >
            Settings
          </h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-2 rounded-lg hover:bg-white/5 transition-smooth"
          >
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
          {(['general', 'api'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 px-4 py-3 text-sm font-medium transition-smooth relative"
              style={{
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              {tab === 'general' ? 'General' : 'API Keys'}
              {activeTab === tab && (
                <div
                  className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Show Grid
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Display gridlines on the canvas
                  </p>
                </div>
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className="w-11 h-6 rounded-full relative transition-smooth"
                  style={{
                    background: showGrid ? 'var(--accent)' : 'var(--bg-tertiary)',
                  }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                    style={{ left: showGrid ? '22px' : '2px' }}
                  />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Security Note */}
              <div
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(108, 92, 231, 0.08)' }}
              >
                <ShieldCheck size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Your API key is encrypted with AES-256 and stored locally in your browser.
                  It is never sent to our servers — only passed directly to the AI provider.
                </p>
              </div>

              {/* Provider Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  AI Provider
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {providers.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setActiveProvider(p.id)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-smooth"
                      style={{
                        borderColor: activeProvider === p.id ? p.color : 'var(--border)',
                        background:
                          activeProvider === p.id
                            ? `${p.color}10`
                            : 'var(--bg-tertiary)',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: p.color }}
                      >
                        {p.name[0]}
                      </div>
                      <span className="text-[11px] font-medium text-center" style={{ color: 'var(--text-primary)' }}>
                        {p.name}
                      </span>
                      {keyValidated[p.id] && (
                        <CheckCircle size={14} className="text-green-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {provider.name} API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder={`Enter your ${provider.name} API key...`}
                    className="w-full px-4 py-3 pr-12 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30 font-mono"
                    style={{
                      background: 'var(--bg-tertiary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-smooth"
                  >
                    {showKey ? (
                      <EyeOff size={16} style={{ color: 'var(--text-muted)' }} />
                    ) : (
                      <Eye size={16} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </button>
                </div>
              </div>

              {/* How to get your key */}
              <div>
                <button
                  onClick={() =>
                    setShowHelp(showHelp === provider.id ? null : provider.id)
                  }
                  className="flex items-center gap-2 text-xs font-medium transition-smooth"
                  style={{ color: 'var(--accent)' }}
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      showHelp === provider.id ? 'rotate-180' : ''
                    }`}
                  />
                  How to get your {provider.name} API key
                </button>
                {showHelp === provider.id && (
                  <div
                    className="mt-2 p-3 rounded-xl text-xs leading-relaxed"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                  >
                    <p>{provider.helpText}</p>
                    <a
                      href={provider.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs font-medium hover:underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      Open {provider.name} Console
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleValidate}
                  disabled={!keyInput.trim() || validating}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-smooth disabled:opacity-40"
                  style={{ background: provider.color }}
                >
                  {validating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  {validating ? 'Validating...' : 'Validate Key'}
                </button>
                <button
                  onClick={handleSaveWithoutValidation}
                  disabled={!keyInput.trim()}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border transition-smooth disabled:opacity-40"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-tertiary)',
                  }}
                >
                  Save Without Validation
                </button>
                {getDecryptedKey(activeProvider) && (
                  <button
                    onClick={handleRemoveKey}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition-smooth hover:bg-red-500/10"
                    style={{ color: 'var(--error)' }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
