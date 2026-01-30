
import React, { useState } from 'react';
// Added ClipboardList to imports
import { Plus, MoreVertical, Clock, Edit2, Trash2, CalendarDays, Filter, User as UserIcon, History, Info, CheckCircle2, Calendar, Play, Check, ClipboardList } from 'lucide-react';
import { Task, TaskPriority, TaskStatus, Skill, User, TeamMember } from '../types';
import { Modal, SkillBuilder } from '../components/Modals';

interface TasksProps {
  tasks: Task[];
  user: User | null;
  members: TeamMember[];
  onCreateTask: (task: Omit<Task, 'id' | 'status' | 'dateCreated'>) => void;
  onUpdateTask: (id: string, task: Omit<Task, 'id' | 'status' | 'dateCreated' | 'assignedTo'>) => void;
  onDeleteTask: (id: string) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
}

const Tasks: React.FC<TasksProps> = ({ tasks, user, members, onCreateTask, onUpdateTask, onDeleteTask, onUpdateStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus>(TaskStatus.PENDING);

  const isAdmin = user?.role === 'admin';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    requiredSkills: [] as Skill[],
    estimatedHours: 8,
    dueDate: new Date().toISOString().split('T')[0]
  });

  const handleOpenAdd = () => {
    if (!isAdmin) return;
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      priority: TaskPriority.MEDIUM,
      requiredSkills: [],
      estimatedHours: 8,
      dueDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    setEditingId(task.id);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      requiredSkills: [...task.requiredSkills],
      estimatedHours: task.estimatedHours,
      dueDate: task.dueDate
    });
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTask(id);
    setActiveMenu(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateTask(editingId, formData);
    } else {
      onCreateTask(formData);
    }
    setIsModalOpen(false);
  };

  const handleStatusUpdate = (status: TaskStatus) => {
    if (viewingTask && isAdmin) {
      onUpdateStatus(viewingTask.id, status);
      setViewingTask({ ...viewingTask, status });
    }
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.HIGH: return 'text-red-500 dark:text-[#ff4b4b] bg-red-50 dark:bg-[#ff4b4b15]';
      case TaskPriority.MEDIUM: return 'text-orange-500 dark:text-[#f97316] bg-orange-50 dark:bg-[#f9731615]';
      case TaskPriority.LOW: return 'text-blue-500 dark:text-primary bg-blue-50 dark:bg-[#00d1ff15]';
    }
  };

  const filteredTasks = tasks.filter(task => task.status === statusFilter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tasks</h1>
          <p className="text-slate-500 dark:text-gray-500 text-sm">{isAdmin ? 'Manage tasks and requirements' : 'View all task assignments'}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white dark:bg-darkSurface p-1 rounded-xl border border-slate-200 dark:border-darkBorder shadow-sm overflow-x-auto max-w-[250px] sm:max-w-none">
            {[TaskStatus.PENDING, TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, TaskStatus.DONE].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-[9px] font-bold transition-all uppercase tracking-wider whitespace-nowrap ${statusFilter === status
                  ? 'bg-blue-600 dark:bg-primary text-white dark:text-darkBg shadow-md shadow-primary/20'
                  : 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300'
                  }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="bg-blue-600 dark:bg-primary text-white dark:text-darkBg px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 dark:hover:bg-[#00c2eb] transition-all shadow-sm active:scale-95"
            >
              <Plus size={20} /> Create Task
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <div
            key={task.id}
            onClick={() => setViewingTask(task)}
            className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder p-6 rounded-2xl relative group hover:border-blue-300 dark:hover:border-primary/30 transition-all shadow-sm cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${task.status === TaskStatus.DONE
                    ? 'bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-400/20'
                    : task.status === TaskStatus.IN_PROGRESS
                      ? 'bg-blue-50 dark:bg-primary/10 text-blue-600 dark:text-primary border-blue-100 dark:border-primary/20'
                      : 'bg-slate-50 dark:bg-darkBg text-slate-500 dark:text-gray-500 border-slate-200 dark:border-darkBorder'
                  }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              {isAdmin && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === task.id ? null : task.id);
                    }}
                    className="p-1 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {activeMenu === task.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder rounded-xl shadow-xl z-10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <button
                        onClick={(e) => handleOpenEdit(task, e)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-400/10 transition-colors"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={(e) => handleDelete(task.id, e)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-primary transition-colors">{task.title}</h3>
                <p className="text-slate-500 dark:text-gray-500 text-sm line-clamp-2">{task.description}</p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {task.requiredSkills.slice(0, 3).map(skill => (
                    <span
                      key={skill.name}
                      title={`${skill.name} (${skill.level.charAt(0).toUpperCase() + skill.level.slice(1)})`}
                      className="cursor-help bg-slate-100 dark:border-darkBorder text-slate-600 dark:text-black-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase hover:border-slate-400 dark:hover:border-gray-500 transition-all border border-transparent"
                    >
                      {skill.name}
                    </span>
                  ))}
                  {task.requiredSkills.length > 3 && (
                    <span className="text-[10px] font-bold text-slate-400">+{task.requiredSkills.length - 3}</span>
                  )}
                </div>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-gray-500 font-medium border-t border-slate-200 dark:border-darkBorder">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-500 dark:text-primary" />
                  <span>{task.estimatedHours}h est.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-red-500 dark:text-[#ff4b4b]" />
                  <span>Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredTasks.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <ClipboardList size={40} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
            <p className="text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest text-sm">No tasks in this stage</p>
          </div>
        )}
      </div>

      {/* View Task Modal */}
      <Modal isOpen={!!viewingTask} onClose={() => setViewingTask(null)} title="Task Details">
        {viewingTask && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${getPriorityColor(viewingTask.priority)}`}>
                  {viewingTask.priority} Priority
                </span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${viewingTask.status === TaskStatus.DONE
                    ? 'bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-400/20'
                    : viewingTask.status === TaskStatus.IN_PROGRESS
                      ? 'bg-blue-50 dark:bg-primary/10 text-blue-600 dark:text-primary border-blue-100 dark:border-primary/20'
                      : 'bg-slate-50 dark:bg-darkBg text-slate-500 dark:text-gray-500 border-slate-200 dark:border-darkBorder'
                  }`}>
                  {viewingTask.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{viewingTask.title}</h3>
              <p className="text-slate-500 dark:text-gray-400 leading-relaxed text-base">{viewingTask.description}</p>
            </div>

            {isAdmin && viewingTask.status !== TaskStatus.PENDING && (
              <div className="p-6 bg-slate-50 dark:bg-darkBg rounded-[2rem] border border-slate-200/50 dark:border-white/5 space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Admin Status Management</h4>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleStatusUpdate(TaskStatus.IN_PROGRESS)}
                    disabled={viewingTask.status === TaskStatus.IN_PROGRESS}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewingTask.status === TaskStatus.IN_PROGRESS
                        ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 cursor-default'
                        : 'bg-white dark:bg-darkSurface border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-blue-500/50 hover:text-blue-500'
                      }`}
                  >
                    <Play size={14} /> {viewingTask.status === TaskStatus.IN_PROGRESS ? 'In Progress' : 'Start Progress'}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(TaskStatus.DONE)}
                    disabled={viewingTask.status === TaskStatus.DONE}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewingTask.status === TaskStatus.DONE
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                        : 'bg-white dark:bg-darkSurface border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-emerald-500/50 hover:text-emerald-500'
                      }`}
                  >
                    <Check size={14} /> {viewingTask.status === TaskStatus.DONE ? 'Completed' : 'Mark as Done'}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-darkBg p-6 rounded-[2rem] border border-slate-100 dark:border-darkBorder">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-[0.2em]">
                  <Clock size={12} />
                  <span>Estimation</span>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{viewingTask.estimatedHours} Hours</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-[0.2em]">
                  <Calendar size={12} />
                  <span>Due Date</span>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {new Date(viewingTask.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {viewingTask.assignedTo && (
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <UserIcon size={14} /> Assigned Operator
                </h4>
                {(() => {
                  const member = members.find(m => m.id === viewingTask.assignedTo);
                  return (
                    <div className="flex items-center gap-4 bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder p-4 rounded-2xl">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg border border-primary/20">
                        {member ? member.name.split(' ').map(n => n[0]).join('') : '??'}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">{member?.name || 'Unknown Member'}</p>
                        <p className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">{member?.role || 'N/A'}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Info size={14} /> Required Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {viewingTask.requiredSkills.map(skill => (
                  <span
                    key={skill.name}
                    className="cursor-default bg-slate-100 dark:bg-darkBorder text-slate-600 dark:text-gray-300 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-wider border border-transparent dark:border-darkBorder hover:border-slate-300 dark:hover:border-gray-500 transition-all duration-200"
                  >
                    {skill.name} • {skill.level}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setViewingTask(null)}
              className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-darkBg rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.01] transition-all"
            >
              Close Details
            </button>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Task" : "Create Task"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest ml-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Build user dashboard"
              className="w-full bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest ml-1">Description</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the task requirements..."
              className="w-full bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest ml-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-slate-900 dark:text-white"
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest ml-1">Hours</label>
              <input
                type="number"
                required
                value={formData.estimatedHours}
                onChange={e => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest ml-1">Due Date</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-slate-900 dark:text-white appearance-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest ml-1">Required Skills</label>
            <SkillBuilder
              skills={formData.requiredSkills}
              onAdd={(s) => setFormData({ ...formData, requiredSkills: [...formData.requiredSkills, s] })}
              onRemove={(name) => setFormData({ ...formData, requiredSkills: formData.requiredSkills.filter(s => s.name !== name) })}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-3.5 bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder text-slate-700 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3.5 bg-blue-600 dark:bg-primary text-white dark:text-darkBg rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
            >
              {editingId ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;