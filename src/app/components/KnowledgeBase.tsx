import { useState } from 'react';
import { BookOpen, Sparkles, Tag, TrendingUp, Edit3, ExternalLink, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ArticleEditorModal from './ArticleEditorModal';
import type { Article } from '../types';

export default function KnowledgeBase() {
  const { articles, updateArticle, searchQuery } = useApp();
  const [editing, setEditing] = useState<Article | null>(null);

  const filtered = articles.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q))
    );
  });

  const draftArticles = filtered.filter((a) => a.status === 'draft');
  const publishedArticles = filtered.filter((a) => a.status === 'published');

  const avgConfidence =
    articles.length > 0
      ? Math.round(articles.reduce((s, a) => s + a.confidence, 0) / articles.length)
      : 0;

  const thisWeek = articles.filter((a) => {
    const updated = new Date(a.lastUpdated).getTime();
    return Date.now() - updated < 7 * 86400000;
  }).length;

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2>Knowledge Base</h2>
              <p className="text-muted-foreground mt-1">
                AI-generated articles from your work conversations
                {searchQuery && ` – showing results for "${searchQuery}"`}
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Confidence</p>
                <p className="text-xl">{avgConfidence}% avg</p>
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
                <p className="text-xl">{thisWeek} articles</p>
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
                <p className="text-xl">{articles.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Draft Articles */}
        {draftArticles.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Draft Articles
            </h3>
            <div className="space-y-4">
              {draftArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onEdit={() => setEditing(article)}
                  onPublish={() =>
                    updateArticle(article.id, { status: 'published' })
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Published Articles */}
        {publishedArticles.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Published Articles
            </h3>
            <div className="space-y-4">
              {publishedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onEdit={() => setEditing(article)}
                  published
                />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mx-auto mb-4">
              {searchQuery ? (
                <Search className="w-8 h-8 text-primary" />
              ) : (
                <BookOpen className="w-8 h-8 text-primary" />
              )}
            </div>
            <h3 className="mb-2">
              {searchQuery ? `No articles match "${searchQuery}"` : 'No articles yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Try a different search term'
                : 'Upload content to automatically generate knowledge base articles'}
            </p>
          </div>
        )}
      </div>

      {editing && (
        <ArticleEditorModal article={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}

function ArticleCard({
  article,
  onEdit,
  onPublish,
  published = false,
}: {
  article: Article;
  onEdit: () => void;
  onPublish?: () => void;
  published?: boolean;
}) {
  return (
    <div
      className={`backdrop-blur-sm rounded-2xl p-6 border border-white/40 hover:bg-white/50 transition-all group ${
        published
          ? 'bg-gradient-to-br from-secondary/10 to-primary/10'
          : 'bg-white/40 cursor-pointer'
      }`}
      onClick={published ? undefined : onEdit}
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
          <p className="text-sm text-foreground/70 mb-3">{article.summary}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="ml-4 p-2 hover:bg-primary/10 rounded-lg transition-colors"
          title="Edit article"
        >
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
          From {article.createdFrom} •{' '}
          {new Date(article.lastUpdated).toLocaleDateString()}
        </div>
      </div>

      {!published && (
        <div className="mt-4 pt-4 border-t border-border/50 flex gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
          >
            Review & Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPublish?.();
            }}
            className="px-4 py-2 bg-white/60 rounded-xl hover:bg-white/80 transition-colors"
          >
            Publish
          </button>
        </div>
      )}
    </div>
  );
}
