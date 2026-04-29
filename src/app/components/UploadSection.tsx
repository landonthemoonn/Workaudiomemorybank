import { useState, useRef } from 'react';
import {
  Upload,
  FileAudio,
  FileText,
  X,
  Sparkles,
  Mic,
  StickyNote,
  Settings,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import AudioRecorder from './AudioRecorder';
import {
  parseTextContent,
  transcribeAudio,
  extractKeyInfo,
  generateKBArticle,
  generateKBArticleLocal,
  getAudioDuration,
} from '../utils/aiProcessing';
import type { Memory } from '../types';

type InputMode = 'file' | 'record' | 'note';

interface QueuedFile {
  file: File;
  status: 'waiting' | 'processing' | 'done' | 'error';
  error?: string;
}

interface Props {
  onNavigate: (tab: 'timeline' | 'knowledge' | 'tasks') => void;
}

export default function UploadSection({ onNavigate }: Props) {
  const { addMemory, updateMemory, addTask, addArticle, openAIKey, setOpenAIKey } = useApp();
  const [mode, setMode] = useState<InputMode>('file');
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [keyDraft, setKeyDraft] = useState(openAIKey);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Drag & drop ──────────────────────────────────────────────────────────

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  }

  function addFiles(files: File[]) {
    const valid = files.filter((f) => {
      const ok =
        f.type.startsWith('audio/') ||
        f.type === 'text/plain' ||
        f.name.endsWith('.txt') ||
        f.name.endsWith('.md');
      return ok;
    });
    setQueue((prev) => [...prev, ...valid.map((file) => ({ file, status: 'waiting' as const }))]);
  }

  function removeFile(index: number) {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }

  // ─── Processing pipeline ──────────────────────────────────────────────────

  async function processAll() {
    if (!queue.length || processing) return;
    setProcessing(true);

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status !== 'waiting') continue;

      setQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: 'processing' } : q))
      );

      try {
        await processFile(item.file);
        setQueue((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, status: 'done' } : q))
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setQueue((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, status: 'error', error: msg } : q))
        );
      }
    }

    setProcessing(false);
  }

  async function processFile(file: File) {
    const isAudio = file.type.startsWith('audio/');
    const today = new Date().toISOString().split('T')[0];

    if (isAudio) {
      const duration = await getAudioDuration(file);

      if (openAIKey) {
        // Add placeholder memory immediately
        const placeholder = addMemory({
          date: today,
          title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          type: 'audio',
          transcript: '',
          keyPoints: [],
          duration,
          fileName: file.name,
          processingStatus: 'processing',
        });

        const transcript = await transcribeAudio(file, openAIKey);
        const info = await extractKeyInfo(transcript, file.name, openAIKey);

        updateMemory(placeholder.id, {
          title: info.title,
          transcript,
          keyPoints: info.keyPoints,
          processingStatus: 'done',
        });

        // Add extracted tasks
        info.tasks.forEach((t) => {
          addTask({
            title: t.title,
            description: t.description,
            priority: t.priority,
            status: 'pending',
            extractedFrom: info.title,
            recordingDate: today,
          });
        });

        // Generate KB article
        const article = await generateKBArticle(
          { ...placeholder, title: info.title, transcript, keyPoints: info.keyPoints },
          openAIKey
        );
        addArticle({
          ...article,
          status: 'draft',
          createdFrom: `1 audio recording (${file.name})`,
          lastUpdated: today,
          sourceMemoryIds: [placeholder.id],
        });
      } else {
        addMemory({
          date: today,
          title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          type: 'audio',
          transcript: '',
          keyPoints: [],
          duration,
          fileName: file.name,
          processingStatus: 'needs-transcript',
        });
      }
    } else {
      // Text file
      const text = await file.text();
      const local = parseTextContent(text, file.name);

      let title = local.title;
      let keyPoints = local.keyPoints;
      let tasks = local.suggestedTasks;
      let transcript = text;

      if (openAIKey) {
        const info = await extractKeyInfo(text, file.name, openAIKey);
        title = info.title;
        keyPoints = info.keyPoints;
        tasks = info.tasks;
      }

      const mem = addMemory({
        date: today,
        title,
        type: 'text',
        transcript,
        keyPoints,
        fileName: file.name,
        processingStatus: 'done',
      });

      tasks.forEach((t) => {
        if (!t.title) return;
        addTask({
          title: t.title,
          description: t.description ?? '',
          priority: t.priority ?? 'medium',
          status: 'pending',
          extractedFrom: title,
          recordingDate: today,
        });
      });

      // KB article
      if (openAIKey) {
        const article = await generateKBArticle(
          { ...mem, title, transcript: text, keyPoints },
          openAIKey
        );
        addArticle({
          ...article,
          status: 'draft',
          createdFrom: `1 text file (${file.name})`,
          lastUpdated: today,
          sourceMemoryIds: [mem.id],
        });
      } else {
        const article = generateKBArticleLocal({ ...mem, title, transcript: text, keyPoints });
        addArticle({
          ...article,
          status: 'draft',
          createdFrom: `1 text file (${file.name})`,
          lastUpdated: today,
          sourceMemoryIds: [mem.id],
        });
      }
    }
  }

  // ─── Audio recording save ─────────────────────────────────────────────────

  async function handleRecordingSave(blob: Blob, durationSeconds: number) {
    const today = new Date().toISOString().split('T')[0];
    const durationStr = `${Math.floor(durationSeconds / 60)}:${String(Math.floor(durationSeconds % 60)).padStart(2, '0')}`;
    const title = `Voice Note – ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    if (openAIKey) {
      const file = new File([blob], 'recording.webm', { type: blob.type });
      const placeholder = addMemory({
        date: today,
        title,
        type: 'recording',
        transcript: '',
        keyPoints: [],
        duration: durationStr,
        processingStatus: 'processing',
      });

      try {
        const transcript = await transcribeAudio(file, openAIKey);
        const info = await extractKeyInfo(transcript, 'voice-recording', openAIKey);

        updateMemory(placeholder.id, {
          title: info.title || title,
          transcript,
          keyPoints: info.keyPoints,
          processingStatus: 'done',
        });

        info.tasks.forEach((t) => {
          addTask({
            title: t.title,
            description: t.description,
            priority: t.priority,
            status: 'pending',
            extractedFrom: info.title || title,
            recordingDate: today,
          });
        });
      } catch {
        updateMemory(placeholder.id, { processingStatus: 'needs-transcript' });
      }
    } else {
      addMemory({
        date: today,
        title,
        type: 'recording',
        transcript: '',
        keyPoints: [],
        duration: durationStr,
        processingStatus: 'needs-transcript',
      });
    }
    onNavigate('timeline');
  }

  // ─── Quick note save ──────────────────────────────────────────────────────

  function saveNote() {
    if (!noteContent.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    const local = parseTextContent(noteContent, noteTitle || 'Quick Note');

    addMemory({
      date: today,
      title: noteTitle.trim() || local.title,
      type: 'note',
      transcript: noteContent.trim(),
      keyPoints: local.keyPoints,
      processingStatus: 'done',
    });

    local.suggestedTasks.forEach((t) => {
      if (!t.title) return;
      addTask({
        title: t.title,
        description: t.description ?? '',
        priority: t.priority ?? 'medium',
        status: 'pending',
        extractedFrom: noteTitle.trim() || local.title,
        recordingDate: today,
      });
    });

    setNoteTitle('');
    setNoteContent('');
    onNavigate('timeline');
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const doneCount = queue.filter((q) => q.status === 'done').length;
  const waitingCount = queue.filter((q) => q.status === 'waiting').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-4">
        {/* Mode switcher */}
        <div className="flex gap-2 p-1 bg-white/40 backdrop-blur-sm rounded-xl border border-white/40">
          {(
            [
              { id: 'file', label: 'Upload Files', icon: <Upload className="w-4 h-4" /> },
              { id: 'record', label: 'Record', icon: <Mic className="w-4 h-4" /> },
              { id: 'note', label: 'Quick Note', icon: <StickyNote className="w-4 h-4" /> },
            ] as { id: InputMode; label: string; icon: React.ReactNode }[]
          ).map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-all ${
                mode === id
                  ? 'bg-white/80 shadow-sm text-primary'
                  : 'text-foreground/60 hover:text-foreground/80'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* File upload */}
        {mode === 'file' && (
          <>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer ${
                dragActive
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : 'border-border bg-white/40 backdrop-blur-sm hover:bg-white/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="audio/*,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-2">Drop your files here</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Audio recordings (.mp3, .wav, .m4a, .webm) or text files (.txt, .md)
                </p>
                <span className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm">
                  Browse Files
                </span>
              </div>
            </div>

            {queue.length > 0 && (
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-5 border border-white/40">
                <div className="flex items-center justify-between mb-4">
                  <h3>
                    Queue ({queue.length})
                    {doneCount > 0 && (
                      <span className="ml-2 text-sm text-secondary">{doneCount} done</span>
                    )}
                  </h3>
                  {waitingCount > 0 && !processing && (
                    <button
                      onClick={processAll}
                      className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 text-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      Process with AI
                    </button>
                  )}
                  {processing && (
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Processing…
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {queue.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-white/60"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {item.file.type.startsWith('audio/') ? (
                          <FileAudio className="w-5 h-5 text-accent flex-shrink-0" />
                        ) : (
                          <FileText className="w-5 h-5 text-secondary flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm truncate">{item.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(item.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        {item.status === 'processing' && (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        )}
                        {item.status === 'done' && (
                          <CheckCircle2 className="w-4 h-4 text-secondary" />
                        )}
                        {item.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-destructive" title={item.error} />
                        )}
                        {item.status === 'waiting' && (
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {doneCount === queue.length && doneCount > 0 && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => onNavigate('timeline')}
                      className="flex-1 py-2 bg-white/60 rounded-xl hover:bg-white/80 transition-colors text-sm"
                    >
                      View Timeline
                    </button>
                    <button
                      onClick={() => onNavigate('tasks')}
                      className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm"
                    >
                      View Tasks
                    </button>
                    <button
                      onClick={() => setQueue([])}
                      className="px-4 py-2 bg-white/60 rounded-xl hover:bg-white/80 transition-colors text-sm"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Record mode */}
        {mode === 'record' && (
          <AudioRecorder onSave={handleRecordingSave} />
        )}

        {/* Quick note mode */}
        {mode === 'note' && (
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <StickyNote className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4>Quick Note</h4>
                <p className="text-sm text-muted-foreground">Jot down thoughts or meeting notes</p>
              </div>
            </div>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full px-4 py-2.5 bg-white/60 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your notes here… bullet points work great for key points"
              rows={8}
              className="w-full px-4 py-2.5 bg-white/60 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <button
              onClick={saveNote}
              disabled={!noteContent.trim()}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Save Note & Extract Tasks
            </button>
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* How it works */}
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
          <h3 className="mb-4">How It Works</h3>
          <div className="space-y-4">
            {[
              {
                num: '1',
                color: 'bg-secondary/20',
                title: 'Upload, Record, or Note',
                desc: 'Add audio recordings, text files, or type notes directly',
              },
              {
                num: '2',
                color: 'bg-accent/20',
                title: 'AI Transcription & Analysis',
                desc: 'Audio is transcribed and key information is extracted automatically',
              },
              {
                num: '3',
                color: 'bg-primary/20',
                title: 'Organized Memory Bank',
                desc: 'Everything is organized by date with full-text search',
              },
              {
                num: null,
                color: 'bg-gradient-to-br from-secondary to-primary',
                title: 'Tasks & Knowledge Base',
                desc: 'Action items and draft articles are generated automatically',
                icon: <Sparkles className="w-4 h-4 text-white" />,
              },
            ].map(({ num, color, title, desc, icon }) => (
              <div key={title} className="flex gap-3">
                <div
                  className={`w-8 h-8 rounded-full ${color} flex items-center justify-center flex-shrink-0`}
                >
                  {icon ?? <span className="text-sm">{num}</span>}
                </div>
                <div>
                  <p className="mb-0.5">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supported formats */}
        <div className="bg-gradient-to-br from-accent/20 to-primary/20 backdrop-blur-sm rounded-2xl p-5 border border-white/40">
          <h4 className="mb-3">Supported Formats</h4>
          <div className="flex flex-wrap gap-2">
            {['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.txt', '.md'].map((ext) => (
              <span key={ext} className="px-3 py-1 bg-white/60 rounded-lg text-sm">
                {ext}
              </span>
            ))}
          </div>
        </div>

        {/* AI Settings */}
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 overflow-hidden">
          <button
            onClick={() => setShowKeyInput((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">AI Settings</span>
              {openAIKey && (
                <span className="px-2 py-0.5 bg-secondary/20 text-secondary rounded text-xs">
                  Key saved
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {showKeyInput ? 'Hide' : 'Show'}
            </span>
          </button>

          {showKeyInput && (
            <div className="px-5 pb-5 space-y-3 border-t border-border/30">
              <p className="text-sm text-muted-foreground pt-3">
                Add your OpenAI API key to enable audio transcription (Whisper) and smart extraction (GPT-4o-mini). Without a key, text files are parsed locally and audio files require a manual transcript.
              </p>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={keyDraft}
                  onChange={(e) => setKeyDraft(e.target.value)}
                  placeholder="sk-…"
                  className="w-full pl-4 pr-10 py-2.5 bg-white/60 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                />
                <button
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpenAIKey(keyDraft)}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm"
                >
                  Save Key
                </button>
                {openAIKey && (
                  <button
                    onClick={() => { setKeyDraft(''); setOpenAIKey(''); }}
                    className="px-4 py-2 bg-white/60 rounded-xl hover:bg-white/80 transition-colors text-sm text-destructive"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Key is stored only in your browser (localStorage) and sent only to OpenAI.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
