import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  Plus,
  FileAudio,
  Calendar,
  X,
  Save,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import AddTaskModal from './AddTaskModal';
import type { Task } from '../types';

export default function Tasks() {
  const { tasks, updateTask, deleteTask, searchQuery } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});
  const [filterStatus, setFilterStatus] = useState<'all' | Task['status']>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const visible = tasks.filter((task) => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    if (!statusMatch) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q) ||
      task.extractedFrom.toLowerCase().includes(q)
    );
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditForm(task);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  function saveEdit() {
    if (editingId) {
      updateTask(editingId, editForm);
      cancelEdit();
    }
  }

  function toggleStatus(id: string, current: Task['status']) {
    const order: Task['status'][] = ['pending', 'in-progress', 'completed'];
    const next = order[(order.indexOf(current) + 1) % order.length];
    updateTask(id, { status: next });
  }

  function handleDelete(id: string) {
    if (confirm('Delete this task?')) deleteTask(id);
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return 'bg-primary/20 text-primary';
      case 'medium': return 'bg-accent/20 text-accent';
      case 'low': return 'bg-secondary/20 text-secondary';
      default: return 'bg-muted text-muted-foreground';
    }
  }

  function getStatusIcon(status: Task['status']) {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-secondary" />;
      case 'in-progress': return <Circle className="w-5 h-5 text-accent fill-accent/30" />;
      default: return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  }

  const STATS: { label: string; count: number; filter: typeof filterStatus }[] = [
    { label: 'Total Tasks', count: tasks.length, filter: 'all' },
    { label: 'Pending', count: pendingCount, filter: 'pending' },
    { label: 'In Progress', count: inProgressCount, filter: 'in-progress' },
    { label: 'Completed', count: completedCount, filter: 'completed' },
  ];

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2>Tasks</h2>
              <p className="text-muted-foreground mt-1">
                AI-extracted action items from your recordings
                {searchQuery && ` – filtering by "${searchQuery}"`}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>

          {/* Stats filter */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ label, count, filter }) => (
              <button
                key={filter}
                onClick={() => setFilterStatus(filter)}
                className={`p-4 rounded-2xl border border-white/40 backdrop-blur-sm transition-all text-left ${
                  filterStatus === filter
                    ? 'bg-white/60 ring-2 ring-primary/30'
                    : 'bg-white/40 hover:bg-white/50'
                }`}
              >
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl mt-1">{count}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Task list */}
        <div className="space-y-4">
          {visible.map((task) => (
            <div
              key={task.id}
              className={`bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40 transition-all ${
                task.status === 'completed' ? 'opacity-60' : ''
              }`}
            >
              {editingId === task.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Task Title</label>
                    <input
                      type="text"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Description</label>
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm mb-2">Status</label>
                      <select
                        value={editForm.status || 'pending'}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value as Task['status'] })
                        }
                        className="w-full px-4 py-2 bg-white/50 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Priority</label>
                      <select
                        value={editForm.priority || 'medium'}
                        onChange={(e) =>
                          setEditForm({ ...editForm, priority: e.target.value as Task['priority'] })
                        }
                        className="w-full px-4 py-2 bg-white/50 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Due Date</label>
                      <input
                        type="date"
                        value={editForm.dueDate || ''}
                        onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                        className="w-full px-4 py-2 bg-white/50 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={saveEdit}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-white/60 rounded-xl hover:bg-white/80 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleStatus(task.id, task.status)}
                    className="mt-1 flex-shrink-0"
                    title="Cycle status"
                  >
                    {getStatusIcon(task.status)}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4
                          className={task.status === 'completed' ? 'line-through opacity-60' : ''}
                        >
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-foreground/70 mt-1">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => startEdit(task)}
                          className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-accent" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </span>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileAudio className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">From: {task.extractedFrom}</span>
                      </div>

                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Due:{' '}
                            {new Date(task.dueDate + 'T12:00:00').toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {visible.length === 0 && (
            <div className="text-center py-16 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mx-auto mb-4">
                {searchQuery ? (
                  <Search className="w-8 h-8 text-primary" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                )}
              </div>
              <h3 className="mb-2">
                {searchQuery
                  ? `No tasks match "${searchQuery}"`
                  : filterStatus !== 'all'
                  ? `No ${filterStatus} tasks`
                  : 'No tasks yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? 'Try a different search term'
                  : filterStatus === 'all'
                  ? 'Upload recordings to extract tasks automatically, or add one manually'
                  : `No tasks with ${filterStatus} status`}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Add Task Manually
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showAddModal && <AddTaskModal onClose={() => setShowAddModal(false)} />}
    </>
  );
}
