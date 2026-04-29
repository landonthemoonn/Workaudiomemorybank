import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Memory, Task, Article } from '../types';

const TODAY = new Date().toISOString().split('T')[0];

const SEED_MEMORIES: Memory[] = [
  {
    id: 'seed-1',
    date: TODAY,
    title: 'Morning Studio Sync – Camera Settings Issue',
    type: 'audio',
    transcript:
      'Discussed the recurring issue with camera white balance settings for product shots. The auto white balance is drifting between shots causing color inconsistency. We created a custom preset for GAP denim products and decided to calibrate every morning before shooting starts. Need to update the SOP document to reflect the new protocol.',
    keyPoints: [
      'White balance needs calibration every morning before shooting',
      'Custom preset created for GAP denim products',
      'Auto white balance drifts between shots – use manual preset',
      'Update SOP document with new settings',
    ],
    duration: '12:34',
    processingStatus: 'done',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    title: 'Tech Support – Lighting Rig Troubleshooting',
    type: 'audio',
    transcript:
      'Troubleshooting session for the new LED lighting rig installation. The main issue is color temperature drift after ~30 minutes of use. The vendor confirmed it is a firmware issue. We need to update the LED panel firmware to v2.3.1 and run a color calibration pass afterward. Also established a recurring maintenance protocol every 90 days.',
    keyPoints: [
      'LED panel firmware needs update to v2.3.1',
      'Color temperature drift resolved after firmware update',
      'Scheduled maintenance protocol established – every 90 days',
      'Contact vendor for warranty claim on panel 3',
    ],
    duration: '18:22',
    processingStatus: 'done',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'seed-3',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    title: 'Equipment Inventory Notes',
    type: 'text',
    transcript:
      'Completed quarterly equipment audit. All camera bodies accounted for. Found 3 lens filters damaged and in need of replacement. Backup hard drives are running low on capacity – ordered 4x 8TB drives. Tether cable inventory updated, 2 cables retired.',
    keyPoints: [
      '3 lens filters need replacement (ordered)',
      'Backup hard drives ordered – 4x 8TB',
      'Tether cable inventory updated, 2 retired',
      'All camera bodies accounted for',
    ],
    fileName: 'equipment-inventory-Q2.txt',
    processingStatus: 'done',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const SEED_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Update SOP document with new camera settings',
    description: 'Document the new white balance custom preset for GAP denim products',
    status: 'pending',
    priority: 'high',
    extractedFrom: 'Morning Studio Sync – Camera Settings Issue',
    recordingDate: TODAY,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Update LED panel firmware to v2.3.1',
    description: 'Install latest firmware to fix color temperature drift, then run color calibration',
    status: 'in-progress',
    priority: 'high',
    extractedFrom: 'Tech Support – Lighting Rig Troubleshooting',
    recordingDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-3',
    title: 'Order replacement lens filters',
    description: 'Order 3 lens filters identified during quarterly equipment audit',
    status: 'pending',
    priority: 'medium',
    extractedFrom: 'Equipment Inventory Notes',
    recordingDate: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'task-4',
    title: 'Schedule maintenance for lighting rig',
    description: 'Set up recurring 90-day maintenance protocol for LED lighting system',
    status: 'completed',
    priority: 'medium',
    extractedFrom: 'Tech Support – Lighting Rig Troubleshooting',
    recordingDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const SEED_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Camera White Balance Calibration Protocol',
    summary:
      'Step-by-step guide for daily white balance calibration on studio cameras, including custom presets for different product categories.',
    content:
      '## Overview\n\nConsistent white balance is critical for product photography. This protocol ensures all photographers follow the same calibration steps each morning.\n\n## Steps\n\n1. Power on all camera bodies and allow 10 minutes warm-up time\n2. Point camera at the calibration card (stored in cabinet A3)\n3. Use the custom white balance function to capture the reference\n4. Save as preset "GAP-DENIM" for denim shoots and "GAP-APPAREL" for general apparel\n5. Verify on a test shot before the shoot begins\n\n## Notes\n\n- Recalibrate if studio lighting conditions change\n- Custom presets are saved on each camera body individually\n- Document any anomalies in the daily shoot log',
    tags: ['camera-settings', 'calibration', 'daily-ops', 'SOP'],
    status: 'draft',
    confidence: 92,
    createdFrom: '1 audio recording',
    lastUpdated: TODAY,
    sourceMemoryIds: ['seed-1'],
  },
  {
    id: 'art-2',
    title: 'LED Lighting Rig Troubleshooting Guide',
    summary:
      'Common issues and solutions for the studio LED lighting system, including firmware updates and color temperature management.',
    content:
      '## Common Issues\n\n### Color Temperature Drift\n- **Symptom**: Color temperature shifts after ~30 min of use\n- **Cause**: Firmware bug in versions below 2.3.1\n- **Fix**: Update firmware via vendor portal (see instructions below)\n\n### Firmware Update Steps\n1. Download v2.3.1 from vendor portal\n2. Connect panel via USB-C to the update laptop\n3. Run updater tool and wait ~5 minutes per panel\n4. Run color calibration after update\n\n## Maintenance Schedule\n- Monthly: Clean diffusion panels\n- Quarterly: Full calibration check\n- Annually: Vendor inspection',
    tags: ['lighting', 'troubleshooting', 'maintenance', 'firmware'],
    status: 'draft',
    confidence: 88,
    createdFrom: '1 audio recording',
    lastUpdated: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    sourceMemoryIds: ['seed-2'],
  },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage quota exceeded – ignore
  }
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface AppContextValue {
  memories: Memory[];
  tasks: Task[];
  articles: Article[];
  openAIKey: string;
  searchQuery: string;

  addMemory: (memory: Omit<Memory, 'id' | 'createdAt'>) => Memory;
  updateMemory: (id: string, updates: Partial<Memory>) => void;
  deleteMemory: (id: string) => void;

  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addArticle: (article: Omit<Article, 'id'>) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;

  setOpenAIKey: (key: string) => void;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextValue>(null!);

export function AppProvider({ children }: { children: ReactNode }) {
  const [memories, setMemories] = useState<Memory[]>(() =>
    loadFromStorage('wmb:memories', SEED_MEMORIES)
  );
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadFromStorage('wmb:tasks', SEED_TASKS)
  );
  const [articles, setArticles] = useState<Article[]>(() =>
    loadFromStorage('wmb:articles', SEED_ARTICLES)
  );
  const [openAIKey, setOpenAIKeyState] = useState<string>(() =>
    localStorage.getItem('wmb:openai-key') ?? ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  const persistMemories = useCallback((updated: Memory[]) => {
    setMemories(updated);
    saveToStorage('wmb:memories', updated);
  }, []);

  const persistTasks = useCallback((updated: Task[]) => {
    setTasks(updated);
    saveToStorage('wmb:tasks', updated);
  }, []);

  const persistArticles = useCallback((updated: Article[]) => {
    setArticles(updated);
    saveToStorage('wmb:articles', updated);
  }, []);

  const addMemory = useCallback(
    (memory: Omit<Memory, 'id' | 'createdAt'>): Memory => {
      const full: Memory = { ...memory, id: uid(), createdAt: new Date().toISOString() };
      persistMemories([full, ...memories]);
      return full;
    },
    [memories, persistMemories]
  );

  const updateMemory = useCallback(
    (id: string, updates: Partial<Memory>) => {
      persistMemories(memories.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    },
    [memories, persistMemories]
  );

  const deleteMemory = useCallback(
    (id: string) => {
      persistMemories(memories.filter((m) => m.id !== id));
    },
    [memories, persistMemories]
  );

  const addTask = useCallback(
    (task: Omit<Task, 'id' | 'createdAt'>) => {
      const full: Task = { ...task, id: uid(), createdAt: new Date().toISOString() };
      persistTasks([full, ...tasks]);
    },
    [tasks, persistTasks]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      persistTasks(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    },
    [tasks, persistTasks]
  );

  const deleteTask = useCallback(
    (id: string) => {
      persistTasks(tasks.filter((t) => t.id !== id));
    },
    [tasks, persistTasks]
  );

  const addArticle = useCallback(
    (article: Omit<Article, 'id'>) => {
      const full: Article = { ...article, id: uid() };
      persistArticles([full, ...articles]);
    },
    [articles, persistArticles]
  );

  const updateArticle = useCallback(
    (id: string, updates: Partial<Article>) => {
      persistArticles(
        articles.map((a) =>
          a.id === id ? { ...a, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : a
        )
      );
    },
    [articles, persistArticles]
  );

  const setOpenAIKey = useCallback((key: string) => {
    setOpenAIKeyState(key);
    localStorage.setItem('wmb:openai-key', key);
  }, []);

  return (
    <AppContext.Provider
      value={{
        memories,
        tasks,
        articles,
        openAIKey,
        searchQuery,
        addMemory,
        updateMemory,
        deleteMemory,
        addTask,
        updateTask,
        deleteTask,
        addArticle,
        updateArticle,
        setOpenAIKey,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
