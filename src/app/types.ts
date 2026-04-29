export interface Memory {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'audio' | 'text' | 'recording' | 'note';
  transcript: string;
  keyPoints: string[];
  duration?: string;
  fileName?: string;
  processingStatus: 'processing' | 'done' | 'needs-transcript';
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  extractedFrom: string;
  recordingDate: string;
  dueDate?: string;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  status: 'draft' | 'published';
  confidence: number;
  createdFrom: string;
  lastUpdated: string; // YYYY-MM-DD
  sourceMemoryIds: string[];
}
