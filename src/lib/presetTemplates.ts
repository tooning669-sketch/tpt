/**
 * Built-in TPT-Ready Preset Templates
 * Each preset creates decorative borders, themed headers, and balanced layouts.
 */

import { Canvas, Rect, Line, Textbox, Circle } from 'fabric';

// US Letter at 96 DPI
const CW = 816;
const CH = 1056;
const M = 60; // margin
const CONTENT_W = CW - M * 2;

export interface PresetTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  badge: string;
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'classic-clean',
    name: 'Classic Clean',
    icon: '📘',
    description: 'Double-line border, navy accents',
    badge: 'TPT Ready',
  },
  {
    id: 'pastel-fun',
    name: 'Pastel Fun',
    icon: '🌸',
    description: 'Soft pastel with playful accents',
    badge: 'TPT Ready',
  },
  {
    id: 'nature-green',
    name: 'Nature Theme',
    icon: '🌿',
    description: 'Clean green nature-inspired',
    badge: 'TPT Ready',
  },
  {
    id: 'print-friendly',
    name: 'Print Friendly',
    icon: '⬛',
    description: 'Minimal B&W, saves ink',
    badge: 'Best Seller',
  },
];

// ── Helpers ──────────────────────────────────────────

function addBorder(
  canvas: Canvas,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  strokeW: number,
  rx = 0
) {
  const border = new Rect({
    left: x,
    top: y,
    width: w,
    height: h,
    fill: 'transparent',
    stroke: color,
    strokeWidth: strokeW,
    rx,
    ry: rx,
    selectable: false,
    evented: false,
  });
  (border as any).tag = 'border_decor';
  canvas.add(border);
  return border;
}

function addHeader(
  canvas: Canvas,
  opts: {
    accentColor: string;
    titleColor: string;
    labelColor: string;
    sepColor: string;
    barHeight?: number;
    barTop?: number;
    barLeft?: number;
    barWidth?: number;
    barRx?: number;
    titleEmoji?: string;
  }
) {
  const {
    accentColor,
    titleColor,
    labelColor,
    sepColor,
    barHeight = 8,
    barTop = 0,
    barLeft = 0,
    barWidth = CW,
    barRx = 0,
    titleEmoji = '',
  } = opts;

  // Accent bar
  const bar = new Rect({
    left: barLeft,
    top: barTop,
    width: barWidth,
    height: barHeight,
    fill: accentColor,
    rx: barRx,
    ry: barRx,
    selectable: false,
    evented: false,
  });
  (bar as any).tag = 'header_bar';
  canvas.add(bar);

  const titleTop = barTop + barHeight + 18;

  // Title
  const titleText = titleEmoji ? `${titleEmoji} Worksheet Title ${titleEmoji}` : 'Worksheet Title';
  const title = new Textbox(titleText, {
    left: M,
    top: titleTop,
    width: CONTENT_W,
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Inter',
    fill: titleColor,
    textAlign: 'center',
    editable: true,
  });
  (title as any).tag = 'title_text';
  canvas.add(title);

  // Subtitle
  const subtitle = new Textbox('Practice makes perfect!', {
    left: M,
    top: titleTop + 38,
    width: CONTENT_W,
    fontSize: 12,
    fontWeight: '400',
    fontStyle: 'italic',
    fontFamily: 'Inter',
    fill: labelColor,
    textAlign: 'center',
    editable: true,
  });
  (subtitle as any).tag = 'subtitle_text';
  canvas.add(subtitle);

  const sepY = titleTop + 60;

  // Separator line
  const sep = new Line([M, sepY, CW - M, sepY], {
    stroke: sepColor,
    strokeWidth: 1.5,
    selectable: false,
    evented: false,
  });
  (sep as any).tag = 'header_separator';
  canvas.add(sep);

  const fieldY = sepY + 14;

  // Name field — balanced width
  const nameField = new Textbox('Name: ________________________________________', {
    left: M,
    top: fieldY,
    width: CONTENT_W * 0.55,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter',
    fill: labelColor,
    editable: true,
  });
  (nameField as any).tag = 'name_field';
  canvas.add(nameField);

  // Date field
  const dateField = new Textbox('Date: ____________________________', {
    left: M + CONTENT_W * 0.58,
    top: fieldY,
    width: CONTENT_W * 0.42,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter',
    fill: labelColor,
    editable: true,
  });
  (dateField as any).tag = 'date_field';
  canvas.add(dateField);

  // Content separator
  const sep2Y = fieldY + 25;
  const sep2 = new Line([M, sep2Y, CW - M, sep2Y], {
    stroke: sepColor,
    strokeWidth: 0.5,
    selectable: false,
    evented: false,
  });
  (sep2 as any).tag = 'content_separator';
  canvas.add(sep2);

  return sep2Y + 20; // return content start Y
}

function addFooter(canvas: Canvas, color: string) {
  const footer = new Textbox('© Teacher Name  |  Created with Worksheet Studio', {
    left: M,
    top: CH - 50,
    width: CONTENT_W,
    fontSize: 9,
    fontWeight: '400',
    fontFamily: 'Inter',
    fill: color,
    textAlign: 'center',
    editable: true,
  });
  (footer as any).tag = 'footer_text';
  canvas.add(footer);
}

// ── Template Implementations ─────────────────────────

function applyClassicClean(canvas: Canvas) {
  // Double-line border
  addBorder(canvas, 28, 28, CW - 56, CH - 56, '#1a1a3e', 2);
  addBorder(canvas, 34, 34, CW - 68, CH - 68, '#1a1a3e', 0.5);

  addHeader(canvas, {
    accentColor: '#1a1a3e',
    titleColor: '#1a1a3e',
    labelColor: '#333',
    sepColor: '#1a1a3e',
    barTop: 28,
    barLeft: 28,
    barWidth: CW - 56,
  });

  // Corner accents
  const cornerSize = 20;
  const cornerColor = '#1a1a3e';
  const corners = [
    { x: 28, y: 28 },
    { x: CW - 28 - cornerSize, y: 28 },
    { x: 28, y: CH - 28 - cornerSize },
    { x: CW - 28 - cornerSize, y: CH - 28 - cornerSize },
  ];
  corners.forEach((c) => {
    const sq = new Rect({
      left: c.x,
      top: c.y,
      width: cornerSize,
      height: cornerSize,
      fill: cornerColor,
      opacity: 0.08,
      selectable: false,
      evented: false,
    });
    canvas.add(sq);
  });

  addFooter(canvas, '#999');
}

function applyPastelFun(canvas: Canvas) {
  // Rounded pastel border
  addBorder(canvas, 24, 24, CW - 48, CH - 48, '#b794f6', 3, 16);

  // Inner tint
  const tint = new Rect({
    left: 27,
    top: 27,
    width: CW - 54,
    height: CH - 54,
    fill: 'rgba(183, 148, 246, 0.03)',
    rx: 14,
    ry: 14,
    selectable: false,
    evented: false,
  });
  canvas.add(tint);

  // Colorful accent bar
  const gradBar = new Rect({
    left: 24,
    top: 24,
    width: CW - 48,
    height: 12,
    fill: '#b794f6',
    rx: 16,
    ry: 0,
    selectable: false,
    evented: false,
  });
  (gradBar as any).tag = 'header_bar';
  canvas.add(gradBar);

  // Decorative dots
  const dotColors = ['#f8a5c2', '#ffeaa7', '#81ecec', '#b794f6', '#fab1a0', '#74b9ff', '#a29bfe'];
  dotColors.forEach((color, i) => {
    const dot = new Circle({
      left: M + i * 28,
      top: 42,
      radius: 4,
      fill: color,
      selectable: false,
      evented: false,
    });
    canvas.add(dot);
  });

  addHeader(canvas, {
    accentColor: '#b794f6',
    titleColor: '#6c5ce7',
    labelColor: '#666',
    sepColor: '#ddd5f3',
    barHeight: 0,
    barTop: 0,
    barWidth: 0,
    titleEmoji: '✨',
  });

  // Bottom decorative dots
  dotColors.forEach((color, i) => {
    const dot = new Circle({
      left: CW - M - (i + 1) * 28,
      top: CH - 48,
      radius: 4,
      fill: color,
      selectable: false,
      evented: false,
    });
    canvas.add(dot);
  });

  addFooter(canvas, '#b794f6');
}

function applyNatureGreen(canvas: Canvas) {
  // Green border
  addBorder(canvas, 26, 26, CW - 52, CH - 52, '#00b894', 2.5, 8);

  // Top green bar
  const topBar = new Rect({
    left: 26,
    top: 26,
    width: CW - 52,
    height: 10,
    fill: '#00b894',
    rx: 8,
    ry: 8,
    selectable: false,
    evented: false,
  });
  canvas.add(topBar);

  // Leaf-like accent circles
  const leafPositions = [
    { x: CW - 90, y: 44, r: 6 },
    { x: CW - 72, y: 38, r: 4 },
    { x: CW - 76, y: 52, r: 5 },
  ];
  leafPositions.forEach((pos) => {
    const leaf = new Circle({
      left: pos.x,
      top: pos.y,
      radius: pos.r,
      fill: '#55efc4',
      opacity: 0.5,
      selectable: false,
      evented: false,
    });
    canvas.add(leaf);
  });

  addHeader(canvas, {
    accentColor: '#00b894',
    titleColor: '#00695c',
    labelColor: '#444',
    sepColor: '#b2dfdb',
    barHeight: 0,
    barTop: 0,
    barWidth: 0,
  });

  // Bottom accent bar
  const bottomBar = new Rect({
    left: 26,
    top: CH - 36,
    width: CW - 52,
    height: 10,
    fill: '#00b894',
    rx: 8,
    ry: 8,
    selectable: false,
    evented: false,
  });
  canvas.add(bottomBar);

  addFooter(canvas, '#00b894');
}

function applyPrintFriendly(canvas: Canvas) {
  // Thin single border
  addBorder(canvas, 30, 30, CW - 60, CH - 60, '#333', 1);

  addHeader(canvas, {
    accentColor: '#333',
    titleColor: '#000',
    labelColor: '#333',
    sepColor: '#999',
    barTop: 30,
    barLeft: 30,
    barWidth: CW - 60,
    barHeight: 4,
  });

  addFooter(canvas, '#aaa');
}

// ── Public API ───────────────────────────────────────

export function applyPresetToCanvas(canvas: Canvas, presetId: string): void {
  canvas.clear();
  canvas.backgroundColor = '#ffffff';

  switch (presetId) {
    case 'classic-clean':
      applyClassicClean(canvas);
      break;
    case 'pastel-fun':
      applyPastelFun(canvas);
      break;
    case 'nature-green':
      applyNatureGreen(canvas);
      break;
    case 'print-friendly':
      applyPrintFriendly(canvas);
      break;
    default:
      applyClassicClean(canvas);
  }

  canvas.renderAll();
}
