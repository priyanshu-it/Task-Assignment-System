
import React, { useState } from 'react';
import { Plus, MoreVertical, Mail, Edit2, Trash2 } from 'lucide-react';
import { TeamMember, Skill, User, SkillLevel } from '../types';
import { Modal, SkillBuilder } from '../components/Modals';

interface PeopleProps {
  members: TeamMember[];
  user: User | null;
  onAddMember: (member: Omit<TeamMember, 'id'>) => void;
  onUpdateMember: (id: string, member: Omit<TeamMember, 'id'>) => void;
  onDeleteMember: (id: string) => void;
}

const People: React.FC<PeopleProps> = ({ members, onAddMember, onUpdateMember, onDeleteMember }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    skills: [] as Skill[],
    workload: 0
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', role: '', skills: [], workload: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      skills: [...member.skills],
      workload: member.workload
    });
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateMember(editingId, formData);
    } else {
      onAddMember(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team Members</h1>
          <p className="text-slate-500 dark:text-gray-500 text-sm">Manage your team and their skills</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 dark:bg-primary text-white dark:text-darkBg px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 dark:hover:bg-[#00c2eb] transition-all shadow-sm active:scale-95"
        >
          <Plus size={20} /> Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {members.map(member => (
          <div key={member.id} className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder p-6 rounded-2xl relative group hover:border-blue-300 dark:hover:border-primary/30 transition-all shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-darkBg flex items-center justify-center text-blue-600 dark:text-primary text-2xl font-bold border border-blue-100 dark:border-darkBorder">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-0.5">{member.name}</h3>
                  <p className="text-slate-500 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">{member.role}</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === member.id ? null : member.id)}
                    className="p-1 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {activeMenu === member.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder rounded-xl shadow-2xl z-20 overflow-hidden">
                      <button onClick={() => handleOpenEdit(member)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-400/10 transition-colors">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => onDeleteMember(member.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
                <div className="bg-slate-100 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-md px-2 py-1 min-w-[40px] text-center">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-primary">{member.workload}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-sm">
                <Mail size={16} />
                <span className="font-medium">{member.email}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {member.skills.map(skill => (
                  <span
                    key={skill.name}
                    title={`${skill.name} (${skill.level.charAt(0).toUpperCase() + skill.level.slice(1)})`}
                    className="cursor-help bg-slate-100 dark:bg-darkBg text-slate-600 dark:text-primary text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider border border-transparent dark:border-primary/20 hover:border-primary/40 transition-all duration-200"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Team Member" : "Add Team Member"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest ml-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest ml-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
                className="w-full bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest ml-1">Role</label>
            <input
              type="text"
              required
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              placeholder="Senior Developer"
              className="w-full bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest ml-1">Workload %</label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={formData.workload}
              onChange={e => setFormData({ ...formData, workload: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest ml-1">Skills</label>
            <SkillBuilder
              skills={formData.skills}
              onAdd={(s) => setFormData({ ...formData, skills: [...formData.skills, s] })}
              onRemove={(name) => setFormData({ ...formData, skills: formData.skills.filter(s => s.name !== name) })}
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
              {editingId ? "Update Member" : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default People;
