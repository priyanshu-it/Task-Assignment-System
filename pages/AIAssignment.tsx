
import React, { useState, useEffect } from 'react';
import { Target, Zap, Loader2, Check, AlertTriangle, Filter } from 'lucide-react';
import { Task, TeamMember, TaskStatus, MatchResult, TaskPriority } from '../types';
import { getMatchingAnalysis } from '../matchlogic';

interface AIAssignmentProps {
  tasks: Task[];
  members: TeamMember[];
  selectedTask?: Task;
  onAssign: (taskId: string, memberId: string) => void;
}

const AIAssignment: React.FC<AIAssignmentProps> = ({ tasks, members, selectedTask: initialTask, onAssign }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(initialTask || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');

  useEffect(() => {
    if (initialTask) {
      setSelectedTask(initialTask);
      handleAnalyze(initialTask);
    }
  }, [initialTask]);

  const handleAnalyze = async (task: Task) => {
    setIsAnalyzing(true);
    const results = await getMatchingAnalysis(task, members);
    setMatchResults(results.sort((a, b) => b.matchScore - a.matchScore));
    setIsAnalyzing(false);
  };

  const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING);

  const filteredTasks = pendingTasks.filter(t =>
    priorityFilter === 'all' || t.priority === priorityFilter
  );

  const getPriorityFilterClass = (p: TaskPriority | 'all') => {
    const base = "px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all border ";
    if (priorityFilter === p) {
      switch (p) {
        case TaskPriority.HIGH: return base + "bg-red-500 border-red-500 text-white";
        case TaskPriority.MEDIUM: return base + "bg-orange-500 border-orange-500 text-white";
        case TaskPriority.LOW: return base + "bg-blue-500 border-blue-500 text-white";
        case 'all': return base + "bg-slate-900 dark:bg-primary border-slate-900 dark:border-primary text-white dark:text-darkBg";
        default: return base;
      }
    }
    return base + "bg-transparent border-slate-200 dark:border-darkBorder text-slate-500 dark:text-gray-500 hover:border-slate-300 dark:hover:border-gray-600";
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Task Assignment</h1>
        <p className="text-slate-500 dark:text-gray-500 text-sm">Let AI match the best person for each task</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Target size={20} className="text-blue-600 dark:text-primary" />
              <h3 className="font-black uppercase tracking-widest text-xs text-slate-800 dark:text-white">Pending Tasks</h3>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <Filter size={14} className="text-slate-400 flex-shrink-0" />
              <div className="flex gap-1.5">
                {(['all', TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={getPriorityFilterClass(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:max-h-[calc(100vh-320px)] overflow-y-auto pr-2 custom-scrollbar">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${selectedTask?.id === task.id
                    ? 'bg-blue-50 dark:bg-primary/5 border-blue-500 dark:border-primary'
                    : 'bg-white dark:bg-darkSurface border-slate-200 dark:border-darkBorder hover:border-blue-300 dark:hover:border-primary/30'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${task.priority === TaskPriority.HIGH
                        ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/10'
                        : task.priority === TaskPriority.MEDIUM
                          ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-400/10'
                          : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10'
                      }`}>
                      {task.priority}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedTask(task); handleAnalyze(task); }}
                    className="flex items-center gap-2 bg-blue-600 dark:bg-primary text-white dark:text-darkBg px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 dark:hover:bg-blue-400 transition-all"
                  >
                    {isAnalyzing && selectedTask?.id === task.id ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    Analyze
                  </button>
                </div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{task.title}</h4>
                <div className="flex flex-wrap gap-2 mt-3">
                  {task.requiredSkills.map(s => (
                    <span key={s.name} className="bg-slate-100 dark:bg-darkBorder text-slate-500 dark:text-gray-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-darkSurface/30 border border-dashed border-slate-200 dark:border-darkBorder rounded-2xl text-center">
                <Target size={30} className="text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-slate-500 dark:text-gray-500 text-sm">No {priorityFilter !== 'all' ? priorityFilter : ''} pending tasks found.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-blue-600 dark:text-primary" />
            <h3 className="font-black uppercase tracking-widest text-xs text-slate-800 dark:text-white">Match Results</h3>
          </div>

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder rounded-2xl gap-4 shadow-sm min-h-[400px]">
              <Loader2 size={40} className="text-blue-600 dark:text-primary animate-spin" />
              <p className="text-slate-500 dark:text-gray-400 font-bold animate-pulse text-sm px-10 text-center uppercase tracking-widest leading-relaxed">Analyzing skills and availability for "{selectedTask?.title}"...</p>
            </div>
          ) : matchResults.length > 0 ? (
            <div className="space-y-4 lg:max-h-[calc(100vh-320px)] overflow-y-auto pr-2 custom-scrollbar">
              {matchResults.map(res => {
                const member = members.find(m => m.id === res.memberId);
                if (!member) return null;
                return (
                  <div key={res.memberId} className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder p-5 md:p-6 rounded-2xl space-y-4 hover:border-blue-300 dark:hover:border-primary/30 transition-colors shadow-sm">
                    <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-primary/10 flex items-center justify-center text-blue-600 dark:text-primary font-black border border-blue-100 dark:border-primary/20 text-lg">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-900 dark:text-white truncate">{member.name}</h4>
                          <p className="text-slate-500 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest truncate">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between xs:flex-col xs:items-end gap-2">
                        <div className="text-left xs:text-right">
                          <div className="text-blue-600 dark:text-primary text-xl font-black">{res.matchScore}%</div>
                          <div className="text-[9px] text-slate-500 dark:text-gray-500 font-black uppercase tracking-[0.2em]">match</div>
                        </div>
                        <button
                          onClick={() => selectedTask && onAssign(selectedTask.id, member.id)}
                          className="flex items-center gap-2 bg-emerald-500 dark:bg-emerald-400 text-white dark:text-darkBg px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-300 transition-colors shadow-sm"
                        >
                          <Check size={14} /> Assign
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed border-l-2 border-slate-100 dark:border-darkBorder pl-4 py-1 italic">
                      {res.reasoning}
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <span>Skills Match</span>
                          <span>{res.skillMatch}%</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 dark:bg-darkBg rounded-full">
                          <div className="h-full bg-blue-500 dark:bg-primary rounded-full" style={{ width: `${res.skillMatch}%` }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <span>Workload Fit</span>
                          <span>{res.workloadFit}%</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 dark:bg-darkBg rounded-full">
                          <div className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full" style={{ width: `${res.workloadFit}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder rounded-2xl text-center shadow-sm min-h-[400px]">
              <Target size={40} className="text-slate-200 dark:text-slate-800 mb-4" />
              <p className="text-slate-500 dark:text-gray-500 max-w-[200px] text-sm uppercase font-bold tracking-widest leading-loose">
                {selectedTask
                  ? "Click 'Analyze' to find the best match for this task."
                  : "Select a task from the list to see matching results."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssignment;