import type { Memory, Task, Article } from '../types';

// ─── Local (no-key) text parsing ─────────────────────────────────────────────

const ACTION_RE =
  /\b(update|fix|create|review|schedule|order|contact|call|email|send|complete|prepare|check|investigate|install|deploy|document|write|test|verify|replace|follow[\s-]up|book|submit|upload|configure|set up|clean)\b/i;

export function parseTextContent(
  content: string,
  filename: string
): { title: string; keyPoints: string[]; suggestedTasks: Partial<Task>[] } {
  const cleanName = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
  const title = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  // Prefer explicit bullet lines, then fall back to short sentences
  const bulletPattern = /^[-*•]\s+(.+)/gm;
  const bullets = [...content.matchAll(bulletPattern)].map((m) => m[1].trim());

  const lines = content
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 15 && l.length < 220 && !/^#/.test(l));

  const candidates = bullets.length >= 2 ? bullets : lines;
  const keyPoints = candidates.slice(0, 6);

  const suggestedTasks: Partial<Task>[] = candidates
    .filter((kp) => ACTION_RE.test(kp))
    .slice(0, 4)
    .map((kp) => ({
      title: kp.length > 80 ? kp.slice(0, 77) + '…' : kp,
      description: `Extracted from ${filename}`,
      priority: 'medium' as const,
    }));

  return { title, keyPoints, suggestedTasks };
}

// ─── OpenAI Whisper transcription ────────────────────────────────────────────

export async function transcribeAudio(file: File, apiKey: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', 'whisper-1');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? 'Transcription failed');
  }

  const data = (await res.json()) as { text: string };
  return data.text;
}

// ─── OpenAI GPT structured extraction ────────────────────────────────────────

interface ExtractedInfo {
  title: string;
  keyPoints: string[];
  tasks: Array<{ title: string; description: string; priority: 'low' | 'medium' | 'high' }>;
  suggestedTags: string[];
}

export async function extractKeyInfo(
  text: string,
  filename: string,
  apiKey: string
): Promise<ExtractedInfo> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You analyze work notes from a photo studio (GAP Inc. Photo Studio). Extract structured JSON from content. Be concise and actionable.',
        },
        {
          role: 'user',
          content: `File: "${filename}"\n\nContent:\n${text.slice(0, 3500)}\n\nExtract and return JSON with keys:\n- title: string (≤10 words)\n- keyPoints: string[] (3-6 bullets, concise)\n- tasks: Array<{title: string, description: string, priority: "high"|"medium"|"low"}>\n- suggestedTags: string[] (2-5 lowercase-kebab tags)`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? 'Extraction failed');
  }

  const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
  return JSON.parse(data.choices[0].message.content) as ExtractedInfo;
}

// ─── OpenAI KB article generation ────────────────────────────────────────────

export async function generateKBArticle(
  memory: Memory,
  apiKey: string
): Promise<Omit<Article, 'id' | 'status' | 'createdFrom' | 'lastUpdated' | 'sourceMemoryIds'>> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You write clear knowledge base articles for a photo studio team. Use markdown. Be practical and concise.',
        },
        {
          role: 'user',
          content: `Create a KB article from this work memory.\n\nTitle: ${memory.title}\nKey Points:\n${memory.keyPoints.join('\n')}\nTranscript:\n${memory.transcript.slice(0, 2500)}\n\nReturn JSON: { "title": "", "summary": "", "content": "(markdown, ≤400 words)", "tags": [], "confidence": (0-100 integer) }`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error('Article generation failed');

  const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
  return JSON.parse(data.choices[0].message.content) as Omit<
    Article,
    'id' | 'status' | 'createdFrom' | 'lastUpdated' | 'sourceMemoryIds'
  >;
}

// ─── Local KB article generation (no API key) ────────────────────────────────

export function generateKBArticleLocal(
  memory: Memory
): Omit<Article, 'id' | 'status' | 'createdFrom' | 'lastUpdated' | 'sourceMemoryIds'> {
  const content = `## Overview\n\n${memory.transcript}\n\n## Key Points\n\n${memory.keyPoints.map((kp) => `- ${kp}`).join('\n')}`;

  const tags = memory.title
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 4)
    .map((w) => w.replace(/[^a-z0-9]/g, ''));

  return {
    title: memory.title,
    summary: memory.keyPoints[0] ?? memory.transcript.slice(0, 120),
    content,
    tags,
    confidence: 70,
  };
}

// ─── Audio duration helper (browser) ─────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getAudioDuration(file: File): Promise<string> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url);
      resolve(formatDuration(audio.duration));
    });
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      resolve('Unknown');
    });
  });
}
