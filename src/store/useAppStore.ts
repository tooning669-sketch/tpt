import { create } from 'zustand';

export type AIProvider = 'openai' | 'gemini' | 'claude';
export type ColorMode = 'bw' | 'color';
export type SidebarTab = 'templates' | 'ai' | 'uploads' | 'text' | 'shapes';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface GenerationParams {
  subject: string;
  gradeLevel: string;
  questionType: string;
  numberOfQuestions: number;
}

export interface SavedTemplate {
  id: string;
  name: string;
  thumbnail: string;
  json: string;
  createdAt: number;
}

export interface PageData {
  id: string;
  json: string;
  thumbnail: string;
}

interface SelectedObjectProps {
  type: string;
  id?: string;
  tag?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  angle?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  textAlign?: string;
  text?: string;
  underline?: boolean;
  rx?: number;
  ry?: number;
}

interface AppState {
  // UI
  settingsOpen: boolean;
  selectedObject: SelectedObjectProps | null;
  toasts: Toast[];
  showGrid: boolean;
  activeSidebarTab: SidebarTab;

  // API Keys
  activeProvider: AIProvider;
  keyValidated: Record<string, boolean>;

  // Canvas
  zoomLevel: number;
  canUndoCount: number;
  canRedoCount: number;

  // Pages
  pages: PageData[];
  activePageIndex: number;

  // AI Generation
  generating: boolean;
  generationParams: GenerationParams;
  colorMode: ColorMode;
  selectedTemplateId: string | null;

  // Context File
  contextFileText: string;
  contextFileName: string;

  // Uploaded Images
  uploadedImages: string[];

  // Templates
  savedTemplates: SavedTemplate[];

  // Actions
  setSettingsOpen: (open: boolean) => void;
  setSelectedObject: (obj: SelectedObjectProps | null) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setShowGrid: (show: boolean) => void;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  setActiveProvider: (provider: AIProvider) => void;
  setKeyValidated: (provider: string, valid: boolean) => void;
  setZoomLevel: (zoom: number) => void;
  setCanUndoCount: (count: number) => void;
  setCanRedoCount: (count: number) => void;
  setGenerating: (generating: boolean) => void;
  setGenerationParams: (params: Partial<GenerationParams>) => void;
  setColorMode: (mode: ColorMode) => void;
  setSelectedTemplateId: (id: string | null) => void;
  setContextFile: (text: string, name: string) => void;
  clearContextFile: () => void;
  addUploadedImage: (dataUrl: string) => void;
  removeUploadedImage: (index: number) => void;
  addTemplate: (template: SavedTemplate) => void;
  removeTemplate: (id: string) => void;
  setPages: (pages: PageData[]) => void;
  setActivePageIndex: (index: number) => void;
  updatePageData: (index: number, data: Partial<PageData>) => void;
  addPage: (page: PageData) => void;
  removePage: (index: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // UI
  settingsOpen: false,
  selectedObject: null,
  toasts: [],
  showGrid: true,
  activeSidebarTab: 'ai',

  // API Keys
  activeProvider: 'openai',
  keyValidated: {},

  // Canvas
  zoomLevel: 100,
  canUndoCount: 0,
  canRedoCount: 0,

  // Pages
  pages: [],
  activePageIndex: 0,

  // AI Generation
  generating: false,
  generationParams: {
    subject: 'math',
    gradeLevel: '3',
    questionType: 'multiple-choice',
    numberOfQuestions: 6,
  },
  colorMode: 'bw',
  selectedTemplateId: null,

  // Context File
  contextFileText: '',
  contextFileName: '',

  // Uploaded Images
  uploadedImages: [],

  // Templates
  savedTemplates: [],

  // Actions
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setSelectedObject: (obj) => set({ selectedObject: obj }),
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Date.now().toString() }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  setShowGrid: (show) => set({ showGrid: show }),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  setActiveProvider: (provider) => set({ activeProvider: provider }),
  setKeyValidated: (provider, valid) =>
    set((state) => ({
      keyValidated: { ...state.keyValidated, [provider]: valid },
    })),
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
  setCanUndoCount: (count) => set({ canUndoCount: count }),
  setCanRedoCount: (count) => set({ canRedoCount: count }),
  setGenerating: (generating) => set({ generating }),
  setGenerationParams: (params) =>
    set((state) => ({
      generationParams: { ...state.generationParams, ...params },
    })),
  setColorMode: (mode) => set({ colorMode: mode }),
  setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
  setContextFile: (text, name) => set({ contextFileText: text, contextFileName: name }),
  clearContextFile: () => set({ contextFileText: '', contextFileName: '' }),
  addUploadedImage: (dataUrl) =>
    set((state) => ({
      uploadedImages: [...state.uploadedImages, dataUrl],
    })),
  removeUploadedImage: (index) =>
    set((state) => ({
      uploadedImages: state.uploadedImages.filter((_, i) => i !== index),
    })),
  addTemplate: (template) =>
    set((state) => ({
      savedTemplates: [template, ...state.savedTemplates],
    })),
  removeTemplate: (id) =>
    set((state) => ({
      savedTemplates: state.savedTemplates.filter((t) => t.id !== id),
    })),
  setPages: (pages) => set({ pages }),
  setActivePageIndex: (index) => set({ activePageIndex: index }),
  updatePageData: (index, data) =>
    set((state) => ({
      pages: state.pages.map((p, i) => (i === index ? { ...p, ...data } : p)),
    })),
  addPage: (page) =>
    set((state) => ({
      pages: [...state.pages, page],
    })),
  removePage: (index) =>
    set((state) => ({
      pages: state.pages.filter((_, i) => i !== index),
      activePageIndex:
        state.activePageIndex >= state.pages.length - 1
          ? Math.max(0, state.pages.length - 2)
          : state.activePageIndex,
    })),
}));
