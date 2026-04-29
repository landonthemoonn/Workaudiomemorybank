import { Calendar, FileAudio, FileText, Sparkles, ChevronRight } from 'lucide-react';

interface Memory {
  id: string;
  date: string;
  title: string;
  type: 'audio' | 'text';
  transcript: string;
  keyPoints: string[];
  duration?: string;
}

// Mock data - will be replaced with Supabase data
const mockMemories: Memory[] = [
  {
    id: '1',
    date: '2026-04-29',
    title: 'Morning Studio Sync - Camera Settings Issue',
    type: 'audio',
    transcript: 'Discussed the recurring issue with camera white balance settings for product shots...',
    keyPoints: [
      'White balance needs calibration every morning',
      'Custom preset created for GAP denim products',
      'Update SOP document with new settings'
    ],
    duration: '12:34'
  },
  {
    id: '2',
    date: '2026-04-28',
    title: 'Tech Support - Lighting Rig Troubleshooting',
    type: 'audio',
    transcript: 'Troubleshooting session for the new LED lighting rig installation...',
    keyPoints: [
      'LED panel firmware needs update',
      'Color temperature drift resolved',
      'Scheduled maintenance protocol established'
    ],
    duration: '18:22'
  },
  {
    id: '3',
    date: '2026-04-27',
    title: 'Equipment Inventory Notes',
    type: 'text',
    transcript: 'Completed quarterly equipment audit. All camera bodies accounted for...',
    keyPoints: [
      '3 lens filters need replacement',
      'Backup hard drives ordered',
      'Tether cable inventory updated'
    ]
  }
];

export default function MemoryTimeline() {
  const groupedByDate = mockMemories.reduce((acc, memory) => {
    if (!acc[memory.date]) {
      acc[memory.date] = [];
    }
    acc[memory.date].push(memory);
    return acc;
  }, {} as Record<string, Memory[]>);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2>Your Work Memory Bank</h2>
          <p className="text-muted-foreground mt-1">
            Day-by-day record of important conversations and notes
          </p>
        </div>
        <select className="px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 3 months</option>
          <option>All time</option>
        </select>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedByDate).map(([date, memories]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3>{new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}</h3>
                <p className="text-sm text-muted-foreground">{memories.length} memories</p>
              </div>
            </div>

            <div className="space-y-4 ml-5 pl-5 border-l-2 border-border">
              {memories.map((memory) => (
                <div
                  key={memory.id}
                  className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40 hover:bg-white/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {memory.type === 'audio' ? (
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                          <FileAudio className="w-5 h-5 text-accent" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-secondary" />
                        </div>
                      )}
                      <div>
                        <h4>{memory.title}</h4>
                        {memory.duration && (
                          <p className="text-sm text-muted-foreground">{memory.duration} duration</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

                  <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                    {memory.transcript}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm">Key Points</span>
                    </div>
                    <ul className="space-y-1 ml-6">
                      {memory.keyPoints.map((point, index) => (
                        <li key={index} className="text-sm text-foreground/80 list-disc">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(groupedByDate).length === 0 && (
        <div className="text-center py-16 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h3 className="mb-2">No memories yet</h3>
          <p className="text-muted-foreground mb-6">
            Upload your first audio recording or text file to get started
          </p>
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
            Upload Files
          </button>
        </div>
      )}
    </div>
  );
}
