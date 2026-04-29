import { useState } from 'react';
import { Upload, FileAudio, FileText, Sparkles, Calendar, BookOpen, Search, CheckSquare } from 'lucide-react';
import UploadSection from './components/UploadSection';
import MemoryTimeline from './components/MemoryTimeline';
import KnowledgeBase from './components/KnowledgeBase';
import Tasks from './components/Tasks';
import backgroundImage from '../imports/image-1.png';

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'timeline' | 'knowledge' | 'tasks'>('upload');

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 -z-10">
        <img
          src={backgroundImage}
          alt=""
          className="w-full h-full object-cover"
        />
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
                  type="text"
                  placeholder="Search memories..."
                  className="pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-white/20 backdrop-blur-md bg-white/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/60 hover:text-foreground/80'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'timeline'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/60 hover:text-foreground/80'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Memory Timeline
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`py-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'knowledge'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/60 hover:text-foreground/80'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Knowledge Base
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'tasks'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/60 hover:text-foreground/80'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Tasks
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'upload' && <UploadSection />}
        {activeTab === 'timeline' && <MemoryTimeline />}
        {activeTab === 'knowledge' && <KnowledgeBase />}
        {activeTab === 'tasks' && <Tasks />}
      </main>
    </div>
  );
}
