
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { SkillLevel, Skill } from '../types';
import { AVAILABLE_SKILLS } from '../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md">
      <div className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between px-8 py-7 border-b border-slate-100 dark:border-darkBorder">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-50 dark:bg-darkBg p-2 rounded-xl border border-slate-100 dark:border-darkBorder">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

export const SkillBuilder: React.FC<{
  skills: Skill[];
  onAdd: (skill: Skill) => void;
  onRemove: (name: string) => void;
}> = ({ skills, onAdd, onRemove }) => {
  const [newSkill, setNewSkill] = useState('');
  const [newLevel, setNewLevel] = useState<SkillLevel>(SkillLevel.INTERMEDIATE);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          className="flex-1 bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-slate-900 dark:text-white appearance-none"
        >
          <option value="">Select skill</option>
          {AVAILABLE_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={newLevel}
          onChange={(e) => setNewLevel(e.target.value as SkillLevel)}
          className="bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-slate-900 dark:text-white appearance-none"
        >
          <option value={SkillLevel.BEGINNER}>Beginner</option>
          <option value={SkillLevel.INTERMEDIATE}>Intermediate</option>
          <option value={SkillLevel.ADVANCED}>Advanced</option>
        </select>
        <button
          onClick={(e) => {
            e.preventDefault();
            if (newSkill) {
              onAdd({ name: newSkill, level: newLevel });
              setNewSkill('');
            }
          }}
          className="bg-slate-100 dark:bg-darkBg text-slate-700 dark:text-white p-3.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-darkBorder"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map(s => (
          <div key={s.name} className="flex items-center gap-2 bg-blue-50 dark:bg-primary/10 text-blue-600 dark:text-primary px-3 py-1.5 rounded-xl text-xs font-bold border border-blue-100 dark:border-primary/20">
            <span>{s.name} ({s.level})</span>
            <button onClick={() => onRemove(s.name)} className="hover:text-red-500 transition-colors"><X size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};
