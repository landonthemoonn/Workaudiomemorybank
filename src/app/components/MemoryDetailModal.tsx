import { FileAudio, FileText, Mic, StickyNote, Sparkles, Trash2, X, Calendar, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Memory } from '../types';

interface Props {
  memory: Memory;
  onClose: () => void;
}

const TYPE_META: Record<
  Memory['type'],
  { icon: React.ReactNode; label: string; color: string }
> = {
  audio: {
    icon: <FileAudio className="w-5 h-5 text-accent" />,
    label: 'Audio Recording',
    color: 'bg-accent/20',
  },
  text: {
    icon: <FileText className="w-5 h-5 text-secondary" />,
    label: 'Text File',
    color: 'bg-secondary/20',
  },
  recording: {
    icon: <Mic className="w-5 h-5 text-primary" />,
    label: 'Voice Recording',
    color: 'bg-primary/20',
  },
  note: {
    icon: <StickyNote className="w-5 h-5 text-primary" />,
    label: 'Quick Note',
    color: 'bg-primary/20',
  },
};

export default function MemoryDetailModal({ memory, onClose }: Props) {
  const { deleteMemory, tasks } = useApp();
  const meta = TYPE_META[memory.type];
  const linkedTasks = tasks.filter((t) => t.extractedFrom === memory.title);

  function handleDelete() {
    if (confirm('Delete this memory? This cannot be undone.')) {
      deleteMemory(memory.id);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/85 backdrop-blur-xl rounded-t-2xl sm:rounded-2xl border border-white/60 shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border/40 flex-shrink-0">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              {meta.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="leading-tight">{memory.title}</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(memory.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                {memory.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {memory.duration}
                  </span>
                )}
                <span>{meta.label}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
              title="Delete memory"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Key Points */}
          {memory.keyPoints.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Key Points</span>
              </div>
              <ul className="space-y-2">
                {memory.keyPoints.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground/80"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Transcript */}
          <div>
            <p className="text-sm font-medium mb-2">
              {memory.type === 'audio' || memory.type === 'recording'
                ? 'Transcript'
                : 'Content'}
            </p>
            {memory.processingStatus === 'processing' ? (
              <div className="px-4 py-6 bg-white/40 rounded-xl text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Processing…</p>
              </div>
            ) : memory.processingStatus === 'needs-transcript' ? (
              <div className="px-4 py-4 bg-accent/10 rounded-xl text-sm text-foreground/70">
                Audio transcript not available. Add an OpenAI API key in settings to enable automatic transcription.
              </div>
            ) : (
              <div className="px-4 py-4 bg-white/40 rounded-xl text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {memory.transcript || 'No content.'}
              </div>
            )}
          </div>

          {/* Linked Tasks */}
          {linkedTasks.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Linked Tasks ({linkedTasks.length})</p>
              <div className="space-y-2">
                {linkedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 px-4 py-3 bg-white/40 rounded-xl text-sm"
                  >
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        task.status === 'completed'
                          ? 'bg-secondary'
                          : task.status === 'in-progress'
                          ? 'bg-accent'
                          : 'bg-muted-foreground'
                      }`}
                    />
                    <span
                      className={
                        task.status === 'completed' ? 'line-through opacity-60' : ''
                      }
                    >
                      {task.title}
                    </span>
                    <span
                      className={`ml-auto px-2 py-0.5 rounded text-xs ${
                        task.priority === 'high'
                          ? 'bg-primary/10 text-primary'
                          : task.priority === 'medium'
                          ? 'bg-accent/10 text-accent'
                          : 'bg-secondary/10 text-secondary'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-white/60 rounded-xl hover:bg-white/80 transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
