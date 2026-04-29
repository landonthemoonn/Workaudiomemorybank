import { BookOpen, Sparkles, Tag, TrendingUp, Edit3, ExternalLink } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  status: 'draft' | 'published';
  confidence: number;
  createdFrom: string;
  lastUpdated: string;
}

// Mock data - will be replaced with Supabase data
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Camera White Balance Calibration Protocol',
    summary: 'Step-by-step guide for daily white balance calibration on studio cameras, including custom presets for different product categories.',
    tags: ['camera-settings', 'calibration', 'daily-ops'],
    status: 'draft',
    confidence: 92,
    createdFrom: '3 audio recordings',
    lastUpdated: '2026-04-29'
  },
  {
    id: '2',
    title: 'LED Lighting Rig Troubleshooting Guide',
    summary: 'Common issues and solutions for the new LED lighting system, including firmware updates and color temperature management.',
    tags: ['lighting', 'troubleshooting', 'maintenance'],
    status: 'draft',
    confidence: 88,
    createdFrom: '2 audio recordings, 1 text file',
    lastUpdated: '2026-04-28'
  },
  {
    id: '3',
    title: 'Quarterly Equipment Maintenance Checklist',
    summary: 'Comprehensive checklist for quarterly equipment audits including inventory tracking and replacement schedules.',
    tags: ['maintenance', 'inventory', 'equipment'],
    status: 'draft',
    confidence: 95,
    createdFrom: '1 text file',
    lastUpdated: '2026-04-27'
  }
];

export default function KnowledgeBase() {
  const draftArticles = mockArticles.filter(a => a.status === 'draft');
  const publishedArticles = mockArticles.filter(a => a.status === 'published');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2>Knowledge Base</h2>
            <p className="text-muted-foreground mt-1">
              AI-generated articles from your work conversations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/50 backdrop-blur-sm rounded-xl border border-white/40">
              <span className="text-sm">
                <span className="font-medium">{draftArticles.length}</span> drafts
              </span>
            </div>
            <div className="px-4 py-2 bg-gradient-to-br from-secondary/20 to-primary/20 backdrop-blur-sm rounded-xl border border-white/40">
              <span className="text-sm">
                <span className="font-medium">{publishedArticles.length}</span> published
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AI Confidence</p>
              <p className="text-xl">91% avg</p>
            </div>
          </div>
        </div>
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-xl">3 articles</p>
            </div>
          </div>
        </div>
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Articles</p>
              <p className="text-xl">{mockArticles.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Draft Articles */}
      <div className="mb-8">
        <h3 className="mb-4 flex items-center gap-2">
          <Edit3 className="w-5 h-5" />
          Draft Articles
        </h3>
        <div className="space-y-4">
          {draftArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40 hover:bg-white/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4>{article.title}</h4>
                    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg">
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span className="text-xs">{article.confidence}% confident</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/70 mb-3">
                    {article.summary}
                  </p>
                </div>
                <button className="ml-4 p-2 hover:bg-primary/10 rounded-lg transition-colors">
                  <ExternalLink className="w-5 h-5 text-primary" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/60 rounded-lg text-xs flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  From {article.createdFrom} • {new Date(article.lastUpdated).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
                  Review & Edit
                </button>
                <button className="px-4 py-2 bg-white/60 rounded-xl hover:bg-white/80 transition-colors">
                  Publish
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Published Articles */}
      {publishedArticles.length > 0 && (
        <div>
          <h3 className="mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Published Articles
          </h3>
          <div className="space-y-4">
            {publishedArticles.map((article) => (
              <div
                key={article.id}
                className="bg-gradient-to-br from-secondary/10 to-primary/10 backdrop-blur-sm rounded-2xl p-6 border border-white/40 hover:bg-white/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="mb-2">{article.title}</h4>
                    <p className="text-sm text-foreground/70 mb-3">
                      {article.summary}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-white/60 rounded-lg text-xs flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="ml-4 p-2 hover:bg-primary/10 rounded-lg transition-colors">
                    <ExternalLink className="w-5 h-5 text-primary" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mockArticles.length === 0 && (
        <div className="text-center py-16 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h3 className="mb-2">No articles yet</h3>
          <p className="text-muted-foreground mb-6">
            AI will automatically generate knowledge base articles from your uploaded content
          </p>
        </div>
      )}
    </div>
  );
}
