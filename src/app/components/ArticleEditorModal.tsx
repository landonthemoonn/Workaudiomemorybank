import { useState } from 'react';
import { X, Save, BookOpen, Tag, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Article } from '../types';

interface Props {
  article: Article;
  onClose: () => void;
}

export default function ArticleEditorModal({ article, onClose }: Props) {
  const { updateArticle } = useApp();

  const [form, setForm] = useState({
    title: article.title,
    summary: article.summary,
    content: article.content,
    tags: [...article.tags],
  });
  const [newTag, setNewTag] = useState('');
  const [saved, setSaved] = useState(false);

  function addTag() {
    const tag = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
    setNewTag('');
  }

  function removeTag(tag: string) {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  }

  function save() {
    updateArticle(article.id, {
      title: form.title,
      summary: form.summary,
      content: form.content,
      tags: form.tags,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function publish() {
    updateArticle(article.id, {
      title: form.title,
      summary: form.summary,
      content: form.content,
      tags: form.tags,
      status: 'published',
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/85 backdrop-blur-xl rounded-2xl border border-white/60 shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <h3>Edit Article</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5">Summary</label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5">Content (Markdown)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={14}
              className="w-full px-4 py-2.5 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-mono text-sm"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white/60 rounded-lg text-xs flex items-center gap-1.5"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag…"
                className="flex-1 px-3 py-2 bg-white/60 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={addTag}
                className="p-2 bg-white/60 rounded-xl hover:bg-white/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 flex gap-3 flex-shrink-0">
          <button
            onClick={save}
            className="px-5 py-2.5 bg-white/60 rounded-xl hover:bg-white/80 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Draft'}
          </button>
          {article.status === 'draft' && (
            <button
              onClick={publish}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Save & Publish
            </button>
          )}
          <button onClick={onClose} className="px-5 py-2.5 bg-white/60 rounded-xl hover:bg-white/80 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
