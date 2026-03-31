'use client';

import { useRef, useCallback, useEffect } from 'react';
import { Canvas, Textbox, Rect, Line, FabricImage, FabricObject, Point } from 'fabric';
import { useAppStore } from '@/store/useAppStore';
import { processQuestionText } from '@/lib/mathRenderer';
import { applyPresetToCanvas } from '@/lib/presetTemplates';
import jsPDF from 'jspdf';

// US Letter at 96 DPI
const CANVAS_WIDTH = 816;
const CANVAS_HEIGHT = 1056;
const CUSTOM_PROPS = ['tag'] as const;

// Margins
const MARGIN_LEFT = 60;
const MARGIN_RIGHT = 60;
const CONTENT_WIDTH = CANVAS_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

// Layout constants
const CONTENT_START_Y = 170;
const BOTTOM_MARGIN = 60;
const MAX_Y = CANVAS_HEIGHT - BOTTOM_MARGIN;
const COLUMN_GAP = 24;

// ── Layout Position Calculator ─────────────────────────
interface BoundingBox {
  x: number;
  y: number;
  width: number;
  maxHeight: number;
}

type LayoutStyle = 'single-column' | 'two-columns' | 'grid-2x3';

function calculateLayoutPositions(
  layout: LayoutStyle,
  itemCount: number,
  startY: number = CONTENT_START_Y
): BoundingBox[] {
  const boxes: BoundingBox[] = [];
  const availableHeight = MAX_Y - startY;

  switch (layout) {
    case 'single-column': {
      const itemHeight = Math.min(availableHeight / itemCount, 120);
      for (let i = 0; i < itemCount; i++) {
        boxes.push({
          x: MARGIN_LEFT,
          y: startY + i * itemHeight,
          width: CONTENT_WIDTH,
          maxHeight: itemHeight - 8,
        });
      }
      break;
    }

    case 'two-columns': {
      const colWidth = (CONTENT_WIDTH - COLUMN_GAP) / 2;
      const rows = Math.ceil(itemCount / 2);
      const rowHeight = Math.min(availableHeight / rows, 140);
      for (let i = 0; i < itemCount; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        boxes.push({
          x: MARGIN_LEFT + col * (colWidth + COLUMN_GAP),
          y: startY + row * rowHeight,
          width: colWidth,
          maxHeight: rowHeight - 8,
        });
      }
      break;
    }

    case 'grid-2x3': {
      const colWidth = (CONTENT_WIDTH - COLUMN_GAP) / 2;
      const rows = 3;
      const rowHeight = availableHeight / rows;
      for (let i = 0; i < itemCount; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        if (row >= rows) break;
        boxes.push({
          x: MARGIN_LEFT + col * (colWidth + COLUMN_GAP),
          y: startY + row * rowHeight,
          width: colWidth,
          maxHeight: rowHeight - 8,
        });
      }
      break;
    }
  }

  return boxes;
}

export function useCanvas() {
  const canvasRef = useRef<Canvas | null>(null);
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const isUndoRedo = useRef(false);

  const {
    setSelectedObject,
    setZoomLevel,
    setCanUndoCount,
    setCanRedoCount,
    addToast,
    pages,
    activePageIndex,
    setPages,
    setActivePageIndex,
    updatePageData,
    addPage,
    colorMode,
    selectedTemplateId,
    savedTemplates,
  } = useAppStore();

  // ─── Helpers ───────────────────────────────────────────
  const getTextColor = useCallback(
    (role: 'title' | 'question' | 'label' | 'line' | 'separator') => {
      if (colorMode === 'bw') {
        switch (role) {
          case 'title': return '#000000';
          case 'question': return '#000000';
          case 'label': return '#333333';
          case 'line': return '#999999';
          case 'separator': return '#cccccc';
        }
      }
      switch (role) {
        case 'title': return '#1a1a3e';
        case 'question': return '#2d3436';
        case 'label': return '#555555';
        case 'line': return '#bbbbbb';
        case 'separator': return '#ddd5f3';
      }
    },
    [colorMode]
  );

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isUndoRedo.current) return;
    const json = JSON.stringify((canvas as any).toJSON([...CUSTOM_PROPS]));
    undoStack.current.push(json);
    redoStack.current = [];
    setCanUndoCount(undoStack.current.length);
    setCanRedoCount(0);
  }, [setCanUndoCount, setCanRedoCount]);

  const updateSelectedObject = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) { setSelectedObject(null); return; }

    const obj: Record<string, unknown> = {
      type: active.type || 'object',
      left: active.left,
      top: active.top,
      width: active.getScaledWidth(),
      height: active.getScaledHeight(),
      angle: active.angle,
      fill: active.fill,
      stroke: active.stroke,
      strokeWidth: active.strokeWidth,
      opacity: active.opacity,
      tag: (active as any).tag,
    };

    if (active instanceof Textbox) {
      obj.fontFamily = active.fontFamily;
      obj.fontSize = active.fontSize;
      obj.fontWeight = active.fontWeight;
      obj.fontStyle = active.fontStyle;
      obj.textAlign = active.textAlign;
      obj.text = active.text;
      obj.underline = active.underline;
    }

    setSelectedObject(obj as any);
  }, [setSelectedObject]);

  // ─── Canvas Init ───────────────────────────────────────
  const initCanvas = useCallback(
    (canvasElement: HTMLCanvasElement) => {
      if (canvasRef.current) canvasRef.current.dispose();

      const canvas = new Canvas(canvasElement, {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true,
      });

      canvasRef.current = canvas;

      canvas.on('selection:created', updateSelectedObject);
      canvas.on('selection:updated', updateSelectedObject);
      canvas.on('selection:cleared', () => setSelectedObject(null));
      canvas.on('object:modified', () => { saveState(); updateSelectedObject(); });
      canvas.on('object:added', () => { if (!isUndoRedo.current) saveState(); });
      canvas.on('object:removed', () => { if (!isUndoRedo.current) saveState(); });

      // Zoom
      canvas.on('mouse:wheel', (opt) => {
        const evt = opt.e as WheelEvent;
        evt.preventDefault();
        evt.stopPropagation();
        const delta = evt.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        zoom = Math.min(Math.max(zoom, 0.3), 3);
        canvas.zoomToPoint(new Point(evt.offsetX, evt.offsetY), zoom);
        setZoomLevel(Math.round(zoom * 100));
      });

      return canvas;
    },
    [saveState, setSelectedObject, setZoomLevel, updateSelectedObject]
  );

  // ─── Professional Header Creator ──────────────────────
  const createDefaultPageObjects = useCallback(
    (canvas: Canvas) => {
      // Accent bar at top
      const accentBar = new Rect({
        left: 0,
        top: 0,
        width: CANVAS_WIDTH,
        height: 6,
        fill: colorMode === 'color' ? '#6c5ce7' : '#333333',
        selectable: false,
        evented: false,
      });
      (accentBar as any).tag = 'header_bar';
      canvas.add(accentBar);

      // Title placeholder
      const title = new Textbox('Worksheet Title', {
        left: MARGIN_LEFT,
        top: 30,
        width: CONTENT_WIDTH,
        fontSize: 30,
        fontWeight: '800',
        fontFamily: 'Inter',
        fill: getTextColor('title'),
        textAlign: 'center',
        editable: true,
        splitByGrapheme: true,
      });
      (title as any).tag = 'title_text';
      canvas.add(title);

      // Subtitle / instructions line
      const subtitle = new Textbox('Practice makes perfect!', {
        left: MARGIN_LEFT,
        top: 72,
        width: CONTENT_WIDTH,
        fontSize: 13,
        fontWeight: '400',
        fontStyle: 'italic',
        fontFamily: 'Inter',
        fill: getTextColor('label'),
        textAlign: 'center',
        editable: true,
      });
      (subtitle as any).tag = 'subtitle_text';
      canvas.add(subtitle);

      // Separator line under title
      const sep = new Line(
        [MARGIN_LEFT, 100, CANVAS_WIDTH - MARGIN_RIGHT, 100],
        {
          stroke: getTextColor('separator'),
          strokeWidth: 1.5,
          selectable: false,
          evented: false,
        }
      );
      (sep as any).tag = 'header_separator';
      canvas.add(sep);

      // Name field — BALANCED width
      const nameLine = new Textbox('Name: ________________________________________', {
        left: MARGIN_LEFT,
        top: 115,
        width: CONTENT_WIDTH * 0.55,
        fontSize: 13,
        fontWeight: '500',
        fontFamily: 'Inter',
        fill: getTextColor('label'),
        editable: true,
      });
      (nameLine as any).tag = 'name_field';
      canvas.add(nameLine);

      // Date field — BALANCED width
      const dateLine = new Textbox('Date: ____________________________', {
        left: MARGIN_LEFT + CONTENT_WIDTH * 0.58,
        top: 115,
        width: CONTENT_WIDTH * 0.42,
        fontSize: 13,
        fontWeight: '500',
        fontFamily: 'Inter',
        fill: getTextColor('label'),
        editable: true,
      });
      (dateLine as any).tag = 'date_field';
      canvas.add(dateLine);

      // Second separator
      const sep2 = new Line(
        [MARGIN_LEFT, 145, CANVAS_WIDTH - MARGIN_RIGHT, 145],
        {
          stroke: getTextColor('separator'),
          strokeWidth: 0.5,
          selectable: false,
          evented: false,
        }
      );
      (sep2 as any).tag = 'content_separator';
      canvas.add(sep2);
    },
    [colorMode, getTextColor]
  );

  // ─── Page Management ───────────────────────────────────
  const getCurrentCanvasJSON = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    return JSON.stringify((canvas as any).toJSON([...CUSTOM_PROPS]));
  }, []);

  const getCurrentCanvasThumbnail = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    return canvas.toDataURL({ format: 'png', quality: 0.4, multiplier: 0.2 });
  }, []);

  const initFirstPage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    createDefaultPageObjects(canvas);
    canvas.renderAll();

    const json = getCurrentCanvasJSON();
    const thumbnail = getCurrentCanvasThumbnail();

    setPages([{ id: `page-${Date.now()}`, json, thumbnail }]);
    setActivePageIndex(0);
    saveState();
  }, [createDefaultPageObjects, getCurrentCanvasJSON, getCurrentCanvasThumbnail, setPages, setActivePageIndex, saveState]);

  const addNewPage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save current page
    const currentJson = getCurrentCanvasJSON();
    const currentThumb = getCurrentCanvasThumbnail();
    updatePageData(activePageIndex, { json: currentJson, thumbnail: currentThumb });

    // Create new page
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    createDefaultPageObjects(canvas);
    canvas.renderAll();

    const newJson = getCurrentCanvasJSON();
    const newThumb = getCurrentCanvasThumbnail();
    const newPage = { id: `page-${Date.now()}`, json: newJson, thumbnail: newThumb };
    addPage(newPage);

    const newIndex = pages.length;
    setActivePageIndex(newIndex);
    saveState();
    addToast({ type: 'info', message: `Page ${newIndex + 1} added` });
  }, [getCurrentCanvasJSON, getCurrentCanvasThumbnail, updatePageData, activePageIndex, createDefaultPageObjects, addPage, pages.length, setActivePageIndex, saveState, addToast]);

  const switchPage = useCallback(
    (targetIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas || targetIndex === activePageIndex) return;
      if (targetIndex < 0 || targetIndex >= pages.length) return;

      const currentJson = getCurrentCanvasJSON();
      const currentThumb = getCurrentCanvasThumbnail();
      updatePageData(activePageIndex, { json: currentJson, thumbnail: currentThumb });

      const target = pages[targetIndex];
      if (target && target.json) {
        isUndoRedo.current = true;
        canvas.loadFromJSON(target.json).then(() => {
          canvas.renderAll();
          isUndoRedo.current = false;
          setActivePageIndex(targetIndex);
          undoStack.current = [];
          redoStack.current = [];
          setCanUndoCount(0);
          setCanRedoCount(0);
          saveState();
        });
      }
    },
    [activePageIndex, pages, getCurrentCanvasJSON, getCurrentCanvasThumbnail, updatePageData, setActivePageIndex, setCanUndoCount, setCanRedoCount, saveState]
  );

  const deleteCurrentPage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || pages.length <= 1) {
      addToast({ type: 'error', message: 'Cannot delete the only page' });
      return;
    }

    const newPages = pages.filter((_, i) => i !== activePageIndex);
    const newIndex = Math.min(activePageIndex, newPages.length - 1);

    setPages(newPages);
    setActivePageIndex(newIndex);

    const target = newPages[newIndex];
    if (target && target.json) {
      isUndoRedo.current = true;
      canvas.loadFromJSON(target.json).then(() => {
        canvas.renderAll();
        isUndoRedo.current = false;
        saveState();
      });
    }
    addToast({ type: 'info', message: 'Page deleted' });
  }, [pages, activePageIndex, setPages, setActivePageIndex, saveState, addToast]);

  // ─── Grid Guide Lines ─────────────────────────────────
  const addGridGuides = useCallback(
    (canvas: Canvas, layout: LayoutStyle, itemCount: number) => {
      if (layout === 'single-column') return; // no grid guides for single column

      const boxes = calculateLayoutPositions(layout, itemCount);
      boxes.forEach((box, idx) => {
        const guideRect = new Rect({
          left: box.x,
          top: box.y,
          width: box.width,
          height: box.maxHeight,
          fill: 'transparent',
          stroke: colorMode === 'color' ? 'rgba(108, 92, 231, 0.15)' : 'rgba(0, 0, 0, 0.06)',
          strokeWidth: 1,
          strokeDashArray: [4, 4],
          selectable: false,
          evented: false,
          rx: 4,
          ry: 4,
        });
        (guideRect as any).tag = `grid_guide_${idx}`;
        canvas.add(guideRect);
      });
    },
    [colorMode]
  );

  // ─── AI Rendering: Scratch Mode (with Layout) ─────────
  const renderFromScratch = useCallback(
    (title: string, items: { id: number; question: string; answer: string }[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const layoutStyle = useAppStore.getState().generationParams.layoutStyle;

      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      createDefaultPageObjects(canvas);

      // Update title
      const titleObj = canvas.getObjects().find((o: any) => o.tag === 'title_text');
      if (titleObj && titleObj instanceof Textbox) {
        titleObj.set('text', title);
      }

      // Add grid guides for multi-column layouts
      addGridGuides(canvas, layoutStyle, items.length);

      // Calculate positions based on layout
      const boxes = calculateLayoutPositions(layoutStyle, items.length);

      const BADGE_SIZE = 28;
      const BADGE_GAP = 12;
      const ANSWER_LINE_GAP = 8;

      items.forEach((item, idx) => {
        if (idx >= boxes.length) return;
        const box = boxes[idx];
        const questionTextWidth = box.width - BADGE_SIZE - BADGE_GAP;

        // Process math notation → Unicode
        const displayText = processQuestionText(item.question);

        // Question number badge
        const badge = new Rect({
          left: box.x,
          top: box.y,
          width: BADGE_SIZE,
          height: BADGE_SIZE,
          rx: 8,
          ry: 8,
          fill: colorMode === 'color' ? '#6c5ce7' : '#333333',
          selectable: false,
          evented: false,
        });
        (badge as any).tag = `badge_${item.id}`;
        canvas.add(badge);

        const badgeNum = new Textbox(`${idx + 1}`, {
          left: box.x + 2,
          top: box.y + 4,
          width: BADGE_SIZE - 4,
          fontSize: 14,
          fontWeight: '700',
          fontFamily: 'Inter',
          fill: '#ffffff',
          textAlign: 'center',
          editable: false,
          selectable: false,
          evented: false,
        });
        canvas.add(badgeNum);

        // Question text — with word wrap and width clamp
        const textLeft = box.x + BADGE_SIZE + BADGE_GAP;
        const qText = new Textbox(displayText, {
          left: textLeft,
          top: box.y + 3,
          width: questionTextWidth,
          fontSize: 14,
          fontWeight: '500',
          fontFamily: 'Inter',
          fill: getTextColor('question'),
          editable: true,
          splitByGrapheme: true, // Fix: wrap even without spaces
        });
        (qText as any).tag = `question_${item.id}_text`;
        qText.initDimensions();
        canvas.add(qText);

        // Answer line — below question text, clamped to bounding box
        const textHeight = qText.height || 20;
        const answerLineY = Math.min(
          box.y + 3 + textHeight + ANSWER_LINE_GAP,
          box.y + box.maxHeight - 10
        );
        const aLine = new Line(
          [textLeft, answerLineY, box.x + box.width, answerLineY],
          {
            stroke: getTextColor('line'),
            strokeWidth: 0.8,
            strokeDashArray: [4, 3],
            selectable: false,
            evented: false,
          }
        );
        (aLine as any).tag = `answer_${item.id}_line`;
        canvas.add(aLine);
      });

      canvas.renderAll();

      // Save page
      const json = getCurrentCanvasJSON();
      const thumb = getCurrentCanvasThumbnail();
      updatePageData(useAppStore.getState().activePageIndex, { json, thumbnail: thumb });
      saveState();
    },
    [createDefaultPageObjects, colorMode, getTextColor, getCurrentCanvasJSON, getCurrentCanvasThumbnail, updatePageData, saveState, addGridGuides]
  );

  // ─── AI Rendering: Template Replace Mode ───────────────
  const renderIntoTemplate = useCallback(
    (replacements: { tag: string; new_content: string }[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const template = savedTemplates.find((t) => t.id === selectedTemplateId);
      if (!template) {
        addToast({ type: 'error', message: 'Template not found' });
        return;
      }

      isUndoRedo.current = true;
      canvas.loadFromJSON(template.json).then(() => {
        const objects = canvas.getObjects();
        replacements.forEach((r) => {
          const target = objects.find((o: any) => o.tag === r.tag);
          if (target && target instanceof Textbox) {
            target.set('text', processQuestionText(r.new_content));
          }
        });

        canvas.renderAll();
        isUndoRedo.current = false;

        const json = getCurrentCanvasJSON();
        const thumb = getCurrentCanvasThumbnail();
        updatePageData(activePageIndex, { json, thumbnail: thumb });
        saveState();
      });
    },
    [savedTemplates, selectedTemplateId, getCurrentCanvasJSON, getCurrentCanvasThumbnail, updatePageData, activePageIndex, saveState, addToast]
  );

  // ─── Load Preset Template ─────────────────────────────
  const loadPresetTemplate = useCallback(
    (presetId: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      applyPresetToCanvas(canvas, presetId);

      const json = getCurrentCanvasJSON();
      const thumb = getCurrentCanvasThumbnail();
      updatePageData(useAppStore.getState().activePageIndex, { json, thumbnail: thumb });
      saveState();
      addToast({ type: 'success', message: 'Loaded preset template!' });
    },
    [getCurrentCanvasJSON, getCurrentCanvasThumbnail, updatePageData, saveState, addToast]
  );

  // ─── Collect Tags from Template ────────────────────────
  const getTemplateTags = useCallback((): string[] => {
    const template = savedTemplates.find((t) => t.id === selectedTemplateId);
    if (!template) return [];
    try {
      const data = JSON.parse(template.json);
      const tags: string[] = [];
      if (data.objects) {
        data.objects.forEach((obj: any) => {
          if (obj.tag && typeof obj.tag === 'string') {
            tags.push(obj.tag);
          }
        });
      }
      return tags;
    } catch {
      return [];
    }
  }, [savedTemplates, selectedTemplateId]);

  // ─── Object Tools ──────────────────────────────────────
  const addText = useCallback(
    (preset: 'heading' | 'subheading' | 'body') => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const config = {
        heading: { text: 'Heading Text', fontSize: 28, fontWeight: '700' as string, fill: getTextColor('title') },
        subheading: { text: 'Subheading', fontSize: 20, fontWeight: '600' as string, fill: getTextColor('question') },
        body: { text: 'Body text here...', fontSize: 14, fontWeight: '400' as string, fill: getTextColor('question') },
      }[preset];

      const textbox = new Textbox(config.text, {
        left: MARGIN_LEFT,
        top: 200,
        width: CONTENT_WIDTH,
        fontSize: config.fontSize,
        fontWeight: config.fontWeight,
        fontFamily: 'Inter',
        fill: config.fill,
        editable: true,
        splitByGrapheme: true,
      });
      canvas.add(textbox);
      canvas.setActiveObject(textbox);
      canvas.renderAll();
    },
    [getTextColor]
  );

  const addShape = useCallback((shape: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let obj: FabricObject;
    const props = { left: 150, top: 200, fill: colorMode === 'color' ? '#6c5ce7' : '#333', stroke: colorMode === 'color' ? '#4a3dbb' : '#111', strokeWidth: 1 };
    switch (shape) {
      case 'rect': obj = new Rect({ ...props, width: 200, height: 120, rx: 4, ry: 4 }); break;
      case 'circle': { const { Circle: C } = require('fabric'); obj = new C({ ...props, radius: 80 }); break; }
      default: obj = new Rect({ ...props, width: 200, height: 120 });
    }
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.renderAll();
  }, [colorMode]);

  const addImage = useCallback((url: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imgEl = new Image();
    imgEl.crossOrigin = 'anonymous';
    imgEl.onload = () => {
      const fImg = new FabricImage(imgEl, { left: 100, top: 200 });
      const scale = Math.min((CONTENT_WIDTH * 0.8) / fImg.width!, (CANVAS_HEIGHT * 0.3) / fImg.height!);
      fImg.scale(scale);
      canvas.add(fImg);
      canvas.setActiveObject(fImg);
      canvas.renderAll();
    };
    imgEl.src = url;
  }, []);

  // ─── Undo / Redo ──────────────────────────────────────
  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || undoStack.current.length <= 1) return;
    isUndoRedo.current = true;
    const cur = undoStack.current.pop()!;
    redoStack.current.push(cur);
    const prev = undoStack.current[undoStack.current.length - 1];
    canvas.loadFromJSON(prev).then(() => {
      canvas.renderAll();
      isUndoRedo.current = false;
      setCanUndoCount(undoStack.current.length);
      setCanRedoCount(redoStack.current.length);
    });
  }, [setCanUndoCount, setCanRedoCount]);

  const redo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || redoStack.current.length === 0) return;
    isUndoRedo.current = true;
    const next = redoStack.current.pop()!;
    undoStack.current.push(next);
    canvas.loadFromJSON(next).then(() => {
      canvas.renderAll();
      isUndoRedo.current = false;
      setCanUndoCount(undoStack.current.length);
      setCanRedoCount(redoStack.current.length);
    });
  }, [setCanUndoCount, setCanRedoCount]);

  // ─── Zoom ─────────────────────────────────────────────
  const zoomIn = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let z = Math.min(canvas.getZoom() * 1.1, 3);
    canvas.setZoom(z);
    setZoomLevel(Math.round(z * 100));
  }, [setZoomLevel]);

  const zoomOut = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let z = Math.max(canvas.getZoom() * 0.9, 0.3);
    canvas.setZoom(z);
    setZoomLevel(Math.round(z * 100));
  }, [setZoomLevel]);

  // ─── Property Updates + Layer ──────────────────────────
  const updateProperty = useCallback((prop: string, value: unknown) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    (active as any).set(prop, value);
    canvas.renderAll();
    saveState();
    updateSelectedObject();
  }, [saveState, updateSelectedObject]);

  const bringForward = useCallback(() => { const c = canvasRef.current; if (!c) return; const a = c.getActiveObject(); if (a) { c.bringObjectForward(a); c.renderAll(); } }, []);
  const sendBackward = useCallback(() => { const c = canvasRef.current; if (!c) return; const a = c.getActiveObject(); if (a) { c.sendObjectBackwards(a); c.renderAll(); } }, []);
  const bringToFront = useCallback(() => { const c = canvasRef.current; if (!c) return; const a = c.getActiveObject(); if (a) { c.bringObjectToFront(a); c.renderAll(); } }, []);
  const sendToBack = useCallback(() => { const c = canvasRef.current; if (!c) return; const a = c.getActiveObject(); if (a) { c.sendObjectToBack(a); c.renderAll(); } }, []);

  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    canvas.remove(active);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObject(null);
  }, [setSelectedObject]);

  const duplicateSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    active.clone().then((cloned: FabricObject) => {
      cloned.set({ left: (active.left || 0) + 20, top: (active.top || 0) + 20 });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  }, []);

  // ─── Template Save/Load ────────────────────────────────
  const exportJSON = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    return JSON.stringify((canvas as any).toJSON([...CUSTOM_PROPS]));
  }, []);

  const loadJSON = useCallback((json: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.loadFromJSON(json).then(() => { canvas.renderAll(); saveState(); });
  }, [saveState]);

  const getThumbnail = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    return canvas.toDataURL({ format: 'png', quality: 0.5, multiplier: 0.25 });
  }, []);

  // ─── Export ────────────────────────────────────────────
  const exportHighResPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 300 / 96 });
    const link = document.createElement('a');
    link.download = `worksheet-page-${activePageIndex + 1}-300dpi.png`;
    link.href = dataUrl;
    link.click();
    addToast({ type: 'success', message: 'PNG exported at 300 DPI!' });
  }, [addToast, activePageIndex]);

  const exportAllPagesPDF = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const currentJson = getCurrentCanvasJSON();
    const currentThumb = getCurrentCanvasThumbnail();
    updatePageData(activePageIndex, { json: currentJson, thumbnail: currentThumb });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });

    const pagesSnapshot = useAppStore.getState().pages;

    for (let i = 0; i < pagesSnapshot.length; i++) {
      if (i > 0) pdf.addPage();
      const pageData = pagesSnapshot[i];
      if (pageData.json) {
        isUndoRedo.current = true;
        await canvas.loadFromJSON(pageData.json);
        canvas.renderAll();
        isUndoRedo.current = false;

        const dataUrl = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 300 / 96 });
        pdf.addImage(dataUrl, 'PNG', 0, 0, 8.5, 11);
      }
    }

    const origPage = pagesSnapshot[activePageIndex];
    if (origPage?.json) {
      isUndoRedo.current = true;
      await canvas.loadFromJSON(origPage.json);
      canvas.renderAll();
      isUndoRedo.current = false;
    }

    pdf.save(`worksheet-${pagesSnapshot.length}pages-300dpi.pdf`);
    addToast({ type: 'success', message: `PDF exported (${pagesSnapshot.length} pages) at 300 DPI!` });
  }, [getCurrentCanvasJSON, getCurrentCanvasThumbnail, updatePageData, activePageIndex, addToast]);

  // ─── Keyboard ──────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (active && !(active instanceof Textbox && (active as Textbox).isEditing)) {
          deleteSelected();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, deleteSelected]);

  return {
    canvasRef, initCanvas, initFirstPage,
    addText, addShape, addImage,
    undo, redo, zoomIn, zoomOut,
    updateProperty, bringForward, sendBackward, bringToFront, sendToBack,
    deleteSelected, duplicateSelected,
    exportJSON, loadJSON, getThumbnail,
    exportHighResPNG, exportAllPagesPDF,
    renderFromScratch, renderIntoTemplate, getTemplateTags,
    loadPresetTemplate,
    addNewPage, switchPage, deleteCurrentPage,
    getCurrentCanvasJSON, getCurrentCanvasThumbnail,
    CANVAS_WIDTH, CANVAS_HEIGHT,
  };
}
