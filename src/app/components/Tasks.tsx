import { useState } from 'react';
import { CheckCircle2, Circle, Edit2, Trash2, Plus, FileAudio, Calendar, X, Save } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  extractedFrom: string;
  recordingDate: string;
  dueDate?: string;
}

// Mock data - will be replaced with AI-extracted tasks from Supabase
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Update SOP document with new camera settings',
    description: 'Document the new white balance custom preset created for GAP denim products',
    status: 'pending',
    priority: 'high',
    extractedFrom: 'Morning Studio Sync - Camera Settings Issue',
    recordingDate: '2026-04-29'
  },
  {
    id: '2',
    title: 'Update LED panel firmware',
    description: 'Install latest firmware version to fix color temperature drift',
    status: 'in-progress',
    priority: 'high',
    extractedFrom: 'Tech Support - Lighting Rig Troubleshooting',
    recordingDate: '2026-04-28',
    dueDate: '2026-05-02'
  },
  {
    id: '3',
    title: 'Order replacement lens filters',
    description: 'Order 3 lens filters identified during quarterly equipment audit',
    status: 'pending',
    priority: 'medium',
    extractedFrom: 'Equipment Inventory Notes',
    recordingDate: '2026-04-27'
  },
  {
    id: '4',
    title: 'Schedule maintenance for lighting rig',
    description: 'Set up recurring maintenance protocol for LED lighting system',
    status: 'completed',
    priority: 'medium',
    extractedFrom: 'Tech Support - Lighting Rig Troubleshooting',
    recordingDate: '2026-04-28'
  }
];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const filteredTasks = tasks.filter(task =>
    filterStatus === 'all' ? true : task.status === filterStatus
  );

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditForm(task);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingId) {
      setTasks(tasks.map(task =>
        task.id === editingId ? { ...task, ...editForm } : task
      ));
      cancelEdit();
    }
  };

  const toggleStatus = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const statusOrder = ['pending', 'in-progress', 'completed'];
        const currentIndex = statusOrder.indexOf(task.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        return { ...task, status: nextStatus as Task['status'] };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-primary/20 text-primary';
      case 'medium': return 'bg-accent/20 text-accent';
      case 'low': return 'bg-secondary/20 text-secondary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-secondary" />;
      case 'in-progress': return <Circle className="w-5 h-5 text-accent fill-accent/30" />;
      default: return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2>Tasks</h2>
            <p className="text-muted-foreground mt-1">
              AI-extracted action items from your recordings
            </p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Manual Task
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`p-4 rounded-2xl border border-white/40 backdrop-blur-sm transition-all ${
              filterStatus === 'all' ? 'bg-white/60 ring-2 ring-primary/30' : 'bg-white/40 hover:bg-white/50'
            }`}
          >
            <p className="text-sm text-muted-foreground">Total Tasks</p>
            <p className="text-2xl mt-1">{tasks.length}</p>
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`p-4 rounded-2xl border border-white/40 backdrop-blur-sm transition-all ${
              filterStatus === 'pending' ? 'bg-white/60 ring-2 ring-primary/30' : 'bg-white/40 hover:bg-white/50'
            }`}
          >
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl mt-1">{pendingCount}</p>
          </button>
          <button
            onClick={() => setFilterStatus('in-progress')}
            className={`p-4 rounded-2xl border border-white/40 backdrop-blur-sm transition-all ${
              filterStatus === 'in-progress' ? 'bg-white/60 ring-2 ring-primary/30' : 'bg-white/40 hover:bg-white/50'
            }`}
          >
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-2xl mt-1">{inProgressCount}</p>
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`p-4 rounded-2xl border border-white/40 backdrop-blur-sm transition-all ${
              filterStatus === 'completed' ? 'bg-white/60 ring-2 ring-primary/30' : 'bg-white/40 hover:bg-white/50'
            }`}
          >
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl mt-1">{completedCount}</p>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
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
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Task['status'] })}
                      className="w-full px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Task['priority'] })}
                      className="w-full px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                      className="w-full px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
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
              <>
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleStatus(task.id)}
                    className="mt-1"
                  >
                    {getStatusIcon(task.status)}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className={task.status === 'completed' ? 'line-through opacity-60' : ''}>
                          {task.title}
                        </h4>
                        <p className="text-sm text-foreground/70 mt-1">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => startEdit(task)}
                          className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-accent" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <span className={`px-3 py-1 rounded-lg text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </span>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileAudio className="w-3 h-3" />
                        <span>From: {task.extractedFrom}</span>
                      </div>

                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-16 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="mb-2">No {filterStatus !== 'all' ? filterStatus : ''} tasks</h3>
            <p className="text-muted-foreground">
              {filterStatus === 'all'
                ? 'Upload recordings to extract tasks automatically'
                : `No tasks with ${filterStatus} status`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
