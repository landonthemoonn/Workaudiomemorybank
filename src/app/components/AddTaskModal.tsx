import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Task } from '../types';

interface Props {
  onClose: () => void;
  prefill?: Partial<Task>;
}

export default function AddTaskModal({ onClose, prefill }: Props) {
  const { addTask } = useApp();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    title: prefill?.title ?? '',
    description: prefill?.description ?? '',
    priority: (prefill?.priority ?? 'medium') as Task['priority'],
    status: (prefill?.status ?? 'pending') as Task['status'],
    dueDate: prefill?.dueDate ?? '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    addTask({
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate || undefined,
      extractedFrom: 'Manual entry',
      recordingDate: today,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3>Add Task</h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5">Task title *</label>
            <input
              type="text"
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Update firmware on Studio Camera 2"
              className="w-full px-4 py-2.5 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Optional details or context…"
              className="w-full px-4 py-2.5 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}
                className="w-full px-3 py-2.5 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Task['status'] })}
                className="w-full px-3 py-2.5 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1.5">Due date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2.5 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!form.title.trim()}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white/60 rounded-xl hover:bg-white/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
