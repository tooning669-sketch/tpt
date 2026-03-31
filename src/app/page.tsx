'use client';

import React, { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useCanvas } from '@/hooks/useCanvas';
import Header from '@/components/Header';
import Tier1NavBar from '@/components/sidebar/Tier1NavBar';
import Tier2Panel from '@/components/sidebar/Tier2Panel';
import CanvasWorkspace from '@/components/canvas/CanvasWorkspace';
import PropertiesPanel from '@/components/properties/PropertiesPanel';
import SettingsModal from '@/components/settings/SettingsModal';
import ToastContainer from '@/components/ToastContainer';
import { getDecryptedKey } from '@/lib/crypto';

export default function Home() {
  const {
    activeProvider,
    generationParams,
    colorMode,
    selectedTemplateId,
    contextFileText,
    setGenerating,
    addToast,
    addTemplate,
    setSettingsOpen,
    savedTemplates,
  } = useAppStore();

  const {
    initCanvas,
    initFirstPage,
    addText,
    addShape,
    addImage,
    undo,
    redo,
    zoomIn,
    zoomOut,
    updateProperty,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    deleteSelected,
    duplicateSelected,
    exportAllPagesPDF,
    exportHighResPNG,
    exportJSON,
    loadJSON,
    getThumbnail,
    renderFromScratch,
    renderIntoTemplate,
    getTemplateTags,
    loadPresetTemplate,
    addNewPage,
    switchPage,
    deleteCurrentPage,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
  } = useCanvas();

  const handleCanvasInit = useCallback(
    (el: HTMLCanvasElement) => { initCanvas(el); },
    [initCanvas]
  );

  const handleGenerate = useCallback(async () => {
    const apiKey = getDecryptedKey(activeProvider);
    if (!apiKey) {
      setSettingsOpen(true);
      addToast({ type: 'error', message: 'Please add your API key in Settings first' });
      return;
    }

    setGenerating(true);
    try {
      const isTemplateMode = !!selectedTemplateId;
      const tags = isTemplateMode ? getTemplateTags() : [];

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: activeProvider,
          apiKey,
          params: generationParams,
          colorMode,
          contextText: contextFileText || undefined,
          templateMode: isTemplateMode ? { tags } : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast({ type: 'error', message: data.error || 'Generation failed' });
        return;
      }

      if (data.mode === 'template' && data.replacements?.length > 0) {
        renderIntoTemplate(data.replacements);
        addToast({ type: 'success', message: `Replaced ${data.replacements.length} placeholders!` });
      } else if (data.mode === 'scratch' && data.questions?.length > 0) {
        renderFromScratch(data.title || 'Worksheet', data.questions);
        addToast({ type: 'success', message: `Generated "${data.title}" with ${data.questions.length} questions!` });
      } else {
        addToast({ type: 'error', message: 'No content generated. Try different settings.' });
      }
    } catch {
      addToast({ type: 'error', message: 'Generation request failed' });
    } finally {
      setGenerating(false);
    }
  }, [activeProvider, generationParams, colorMode, selectedTemplateId, contextFileText, setGenerating, addToast, renderFromScratch, renderIntoTemplate, getTemplateTags, setSettingsOpen]);

  const handleSaveTemplate = useCallback(() => {
    const json = exportJSON();
    if (!json) return;
    const thumbnail = getThumbnail();
    const name = `Template — ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    addTemplate({
      id: `tpl-${Date.now()}`,
      name,
      thumbnail,
      json,
      createdAt: Date.now(),
    });
    addToast({ type: 'success', message: 'Template saved!' });
  }, [exportJSON, getThumbnail, addTemplate, addToast]);

  const handleLoadTemplate = useCallback((templateId: string | null) => {
    if (!templateId) {
      initFirstPage();
      addToast({ type: 'info', message: 'Switched to blank canvas' });
      return;
    }
    const template = savedTemplates.find((t) => t.id === templateId);
    if (template) {
      loadJSON(template.json);
      addToast({ type: 'success', message: `Loaded template: ${template.name}` });
    }
  }, [savedTemplates, initFirstPage, loadJSON, addToast]);

  const handleLoadPreset = useCallback((presetId: string) => {
    loadPresetTemplate(presetId);
  }, [loadPresetTemplate]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        onUndo={undo}
        onRedo={redo}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onExportPDF={exportAllPagesPDF}
        onExportPNG={exportHighResPNG}
        onSaveTemplate={handleSaveTemplate}
      />

      <div className="flex-1 flex overflow-hidden">
        <Tier1NavBar />
        <Tier2Panel
          onGenerate={handleGenerate}
          onSaveTemplate={handleSaveTemplate}
          onLoadTemplate={handleLoadTemplate}
          onLoadPreset={handleLoadPreset}
          onAddText={addText}
          onAddShape={addShape}
          onAddImage={addImage}
        />
        <CanvasWorkspace
          onCanvasInit={handleCanvasInit}
          onInitFirstPage={initFirstPage}
          onAddPage={addNewPage}
          onSwitchPage={switchPage}
          onDeletePage={deleteCurrentPage}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
        />
        <PropertiesPanel
          onUpdateProperty={updateProperty}
          onBringForward={bringForward}
          onSendBackward={sendBackward}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          onDelete={deleteSelected}
          onDuplicate={duplicateSelected}
        />
      </div>

      <SettingsModal />
      <ToastContainer />
    </div>
  );
}
