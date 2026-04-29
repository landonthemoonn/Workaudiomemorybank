import { useState, useRef, useEffect } from 'react';
import { Upload, Calendar, BookOpen, Search, CheckSquare, X } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import UploadSection from './components/UploadSection';
import MemoryTimeline from './components/MemoryTimeline';
import KnowledgeBase from './components/KnowledgeBase';
import Tasks from './components/Tasks';
import backgroundImage from '../imports/image-1.png';

type Tab = 'upload' | 'timeline' | 'knowledge' | 'tasks';

function AppInner() {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const { searchQuery, setSearchQuery } = useApp();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const TAB_LABELS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'upload', label: 'Upload', icon: <Upload className="w-4 h-4" /> },
    { id: 'timeline', label: 'Memory Timeline', icon: <Calendar className="w-4 h-4" /> },
    { id: 'knowledge', label: 'Knowledge Base', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <img src={backgroundImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 backdrop-blur-sm bg-white/20" />
      </div>

      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-md bg-white/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground/90">GAP Inc. Photo Studio</h1>
              <p className="text-sm text-foreground/60 mt-1">Work Memory Bank & Knowledge Base</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    // auto-navigate to most relevant tab
                    if (e.target.value && activeTab === 'upload') setActiveTab('timeline');
                  }}
                  placeholder="Search memories… (⌘K)"
                  className="pl-10 pr-9 py-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-white/20 backdrop-blur-md bg-white/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {TAB_LABELS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground/60 hover:text-foreground/80'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'upload' && <UploadSection onNavigate={setActiveTab} />}
        {activeTab === 'timeline' && <MemoryTimeline />}
        {activeTab === 'knowledge' && <KnowledgeBase />}
        {activeTab === 'tasks' && <Tasks />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
