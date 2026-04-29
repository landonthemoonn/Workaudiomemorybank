import { useState } from 'react';
import {
  Calendar,
  FileAudio,
  FileText,
  Mic,
  StickyNote,
  Sparkles,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MemoryDetailModal from './MemoryDetailModal';
import type { Memory } from '../types';

const TYPE_ICON: Record<Memory['type'], React.ReactNode> = {
  audio: <FileAudio className="w-5 h-5 text-accent" />,
  text: <FileText className="w-5 h-5 text-secondary" />,
  recording: <Mic className="w-5 h-5 text-primary" />,
  note: <StickyNote className="w-5 h-5 text-primary" />,
};

const TYPE_BG: Record<Memory['type'], string> = {
  audio: 'bg-accent/20',
  text: 'bg-secondary/20',
  recording: 'bg-primary/20',
  note: 'bg-primary/20',
};

export default function MemoryTimeline() {
  const { memories, searchQuery } = useApp();
  const [range, setRange] = useState('7');
  const [selected, setSelected] = useState<Memory | null>(null);

  // Filter by date range
  const cutoff = Date.now() - parseInt(range, 10) * 86400000;
  const filtered = memories.filter((m) => {
    const inRange = range === 'all' || new Date(m.date).getTime() >= cutoff;
    if (!inRange) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.transcript.toLowerCase().includes(q) ||
      m.keyPoints.some((kp) => kp.toLowerCase().includes(q))
    );
  });

  const groupedByDate = filtered.reduce((acc, memory) => {
    if (!acc[memory.date]) acc[memory.date] = [];
    acc[memory.date].push(memory);
    return acc;
  }, {} as Record<string, Memory[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => (a > b ? -1 : 1));

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2>Your Work Memory Bank</h2>
            <p className="text-muted-foreground mt-1">
              {filtered.length} {filtered.length === 1 ? 'memory' : 'memories'}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="all">All time</option>
          </select>
        </div>

        {sortedDates.length > 0 ? (
          <div className="space-y-8">
            {sortedDates.map((date) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3>
                      {new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {groupedByDate[date].length}{' '}
                      {groupedByDate[date].length === 1 ? 'memory' : 'memories'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 ml-5 pl-5 border-l-2 border-border">
                  {groupedByDate[date].map((memory) => (
                    <div
                      key={memory.id}
                      onClick={() => setSelected(memory)}
                      className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40 hover:bg-white/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl ${TYPE_BG[memory.type]} flex items-center justify-center`}
                          >
                            {TYPE_ICON[memory.type]}
                          </div>
                          <div>
                            <h4>{memory.title}</h4>
                            {memory.duration && (
                              <p className="text-sm text-muted-foreground">
                                {memory.duration} duration
                              </p>
                            )}
                            {memory.processingStatus === 'processing' && (
                              <p className="text-sm text-accent flex items-center gap-1">
                                <span className="inline-block w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                Processing…
                              </p>
                            )}
                            {memory.processingStatus === 'needs-transcript' && (
                              <p className="text-sm text-muted-foreground">
                                Needs transcript
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>

                      {memory.transcript && (
                        <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                          {memory.transcript}
                        </p>
                      )}

                      {memory.keyPoints.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm">Key Points</span>
                          </div>
                          <ul className="space-y-1 ml-6">
                            {memory.keyPoints.slice(0, 3).map((point, index) => (
                              <li key={index} className="text-sm text-foreground/80 list-disc">
                                {point}
                              </li>
                            ))}
                            {memory.keyPoints.length > 3 && (
                              <li className="text-sm text-muted-foreground list-disc">
                                +{memory.keyPoints.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mx-auto mb-4">
              {searchQuery ? (
                <Search className="w-8 h-8 text-primary" />
              ) : (
                <Calendar className="w-8 h-8 text-primary" />
              )}
            </div>
            <h3 className="mb-2">
              {searchQuery ? `No results for "${searchQuery}"` : 'No memories yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Try a different search term'
                : 'Upload your first audio recording, text file, or quick note to get started'}
            </p>
          </div>
        )}
      </div>

      {selected && (
        <MemoryDetailModal memory={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
