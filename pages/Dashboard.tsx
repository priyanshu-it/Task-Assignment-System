
import React, { useState } from 'react';
import { Users, ClipboardList, CheckCircle, AlertTriangle, ArrowRight, CalendarDays, Filter, Zap, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import { TeamMember, Task, TaskStatus, TaskPriority, User } from '../types';

interface DashboardProps {
  members: TeamMember[];
  tasks: Task[];
  user: User | null;
  onAnalyze: (task: Task) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ members, tasks, user, onAnalyze }) => {
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus>(TaskStatus.PENDING);
  const isAdmin = user?.role === 'admin';

  const pendingTasksCount = tasks.filter(t => t.status === TaskStatus.PENDING).length;
  const assignedTasksCount = tasks.filter(t => t.status === TaskStatus.ASSIGNED || t.status === TaskStatus.IN_PROGRESS).length;
  const avgWorkload = members.length > 0
    ? Math.round(
      members.reduce((sum, member) => {
        const memberTasks = tasks.filter(t => t.assignedTo === member.id && t.status !== TaskStatus.PENDING);
        const totalEstimated = memberTasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
        return sum + totalEstimated;
      }, 0) / members.length
    )
    : 0;

  const filteredTasks = tasks.filter(t => t.status === taskStatusFilter);

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { [TaskPriority.HIGH]: 0, [TaskPriority.MEDIUM]: 1, [TaskPriority.LOW]: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const calculateWorkload = (memberId: string) => {
    const memberTasks = tasks.filter(t => t.assignedTo === memberId && t.status !== TaskStatus.PENDING);
    const totalEstimated = memberTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    return totalEstimated;
  };

  const membersWithLoad = members.map(member => ({
    ...member,
    workload: calculateWorkload(member.id),
  })).sort((a, b) => b.workload - a.workload);

  const recentAssignments = tasks
    .filter(t => t.status !== TaskStatus.PENDING)
    .sort((a, b) => b.dateCreated.localeCompare(a.dateCreated))
    .slice(0, 5);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] block mb-2">Workspace Overview</span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Main Dashboard</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Team" value={members.length} icon={Users} />
        <StatCard label="Queued Tasks" value={pendingTasksCount} icon={Zap} />
        <StatCard label="Active Jobs" value={assignedTasksCount} icon={CheckCircle} />
        <StatCard label="Usage Rate" value={`${avgWorkload}%`} icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-darkSurface border border-slate-200/60 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-soft">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ClipboardList size={20} />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">Task Pipeline</h3>
              </div>

              <div className="flex items-center gap-1 bg-slate-50 dark:bg-darkBg p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/10 overflow-x-auto max-w-full">
                {[TaskStatus.PENDING, TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, TaskStatus.DONE].map((status) => (
                  <button
                    key={status}
                    onClick={() => setTaskStatusFilter(status)}
                    className={`px-4 py-2.5 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${taskStatusFilter === status
                      ? 'bg-primary text-darkBg shadow-accent'
                      : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 space-y-4">
              {sortedTasks.length > 0 ? (
                sortedTasks.map(task => (
                  <div key={task.id} className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 p-6 rounded-3xl group hover:border-primary/40 transition-all duration-300">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight group-hover:text-primary transition-colors">{task.title}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                            <CalendarDays size={14} />
                            <span>Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                            task.priority === 'medium' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                            {task.priority}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {task.status === TaskStatus.PENDING ? (
                          isAdmin && (
                            <button
                              onClick={() => onAnalyze(task)}
                              className="group/btn flex items-center gap-2 bg-primary text-darkBg px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-accent"
                            >
                              Assign <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          )
                        ) : (
                          <div className="flex items-center gap-3 bg-white dark:bg-white/5 pl-4 pr-2 py-2 rounded-2xl border border-slate-200/60 dark:border-white/5">
                            <div className="text-right hidden sm:block">
                              <p className="text-[9px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest">Operator</p>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                {members.find(m => m.id === task.assignedTo)?.name.split(' ')[0] || 'Unknown'}
                              </p>
                            </div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${task.status === TaskStatus.DONE
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : task.status === TaskStatus.IN_PROGRESS
                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                              }`}>
                              <CheckCircle size={18} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-6">
                    <Filter size={32} className="text-slate-200 dark:text-white/10" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest text-sm">Clear Horizon • No Tasks Listed</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="bg-darkSurface rounded-[2.5rem] p-8">
            <h3 className="font-extrabold text-white mb-6">
              Team Workload
            </h3>

            {membersWithLoad.length === 0 && (
              <p className="text-slate-500 text-center">
                No team members
              </p>
            )}

            <div className="space-y-6">
              {membersWithLoad.slice(0, 6).map(member => (
                <div key={member.id}>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">{member.name}</span>
                    <span
                      className={
                        member.workload > 80
                          ? 'text-red-500'
                          : 'text-primary'
                      }
                    >
                      {member.workload}%
                    </span>
                  </div>

                  <div className="h-2 mt-2 bg-white/5 rounded-full">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${member.workload}%`,
                        backgroundColor:
                          member.workload > 80
                            ? '#ef4444'
                            : '#00d1ff',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-darkSurface border border-slate-200/60 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-soft">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Clock size={20} />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">Recent Activity</h3>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Activity Log</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] text-slate-400 dark:text-slate-500 uppercase text-[9px] font-black tracking-[0.2em]">
                <th className="px-8 py-5">Task Details</th>
                <th className="px-8 py-5">Assigned Expert</th>
                <th className="px-8 py-5">Projected Completion</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {recentAssignments.map(task => {
                const member = members.find(m => m.id === task.assignedTo);
                return (
                  <tr key={task.id} className="group hover:bg-slate-50 dark:hover:bg-primary/5 transition-all duration-200">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{task.title}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest mt-0.5">EST: {task.estimatedHours}h</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black border border-primary/20">
                          {member ? getInitials(member.name) : '??'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-800 dark:text-slate-200 font-bold text-xs">{member?.name || 'Unassigned'}</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase">{member?.role || 'Expert'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-slate-500 dark:text-slate-400 font-bold text-xs">
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest ${task.status === TaskStatus.DONE ? 'text-emerald-500' :
                        task.status === TaskStatus.IN_PROGRESS ? 'text-blue-500' : 'text-slate-400'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${task.status === TaskStatus.DONE ? 'bg-emerald-500' :
                          task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'
                          }`} />
                        {task.status.replace('_', ' ')}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {recentAssignments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center text-slate-400 dark:text-slate-600 italic font-medium">
                    No active assignments in the current cycle.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;