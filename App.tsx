
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import People from './pages/People';
import Tasks from './pages/Tasks';
import AIAssignment from './pages/AIAssignment';
import Login from './pages/Login';
import { INITIAL_MEMBERS, INITIAL_TASKS } from './constants';
import { TeamMember, Task, TaskStatus, User } from './types';
import { AlertTriangle, Terminal, Menu, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzingTask, setAnalyzingTask] = useState<Task | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(
    localStorage.getItem('theme') as 'light' | 'dark' || 'dark'
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('user');
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubMembers = onSnapshot(collection(db, "members"),
      (snapshot) => {
        const membersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TeamMember));
        setMembers(membersData);

        if (snapshot.empty) {
          INITIAL_MEMBERS.forEach(m => {
            const { id, ...data } = m;
            setDoc(doc(db, "members", id), data).catch(console.error);
          });
        }
        if (!currentUser) setLoading(false);
      },
      (err) => {
        if (err.code === 'permission-denied') setError('PERMISSION_DENIED');
        setLoading(false);
      }
    );

    return () => unsubMembers();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const unsubTasks = onSnapshot(collection(db, "tasks"),
      (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
        setTasks(tasksData);

        if (snapshot.empty) {
          INITIAL_TASKS.forEach(t => {
            const { id, ...data } = t;
            setDoc(doc(db, "tasks", id), data).catch(console.error);
          });
        }
        setLoading(false);
      },
      (err) => {
        if (err.code === 'permission-denied') setError('PERMISSION_DENIED');
        setLoading(false);
      }
    );

    return () => unsubTasks();
  }, [currentUser]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    navigate('/');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const handleAddMember = async (member: Omit<TeamMember, 'id'>) => {
    try {
      await addDoc(collection(db, "members"), member);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMember = async (id: string, updatedData: Omit<TeamMember, 'id'>) => {
    try {
      await updateDoc(doc(db, "members", id), updatedData as any);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, "members", id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTask = async (task: Omit<Task, 'id' | 'status' | 'dateCreated'>) => {
    const newTask = {
      ...task,
      status: TaskStatus.PENDING,
      dateCreated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    try {
      await addDoc(collection(db, "tasks"), newTask);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTask = async (id: string, updatedData: Omit<Task, 'id' | 'status' | 'dateCreated' | 'assignedTo'>) => {
    try {
      await updateDoc(doc(db, "tasks", id), updatedData as any);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: TaskStatus) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      if (status === TaskStatus.DONE && task.assignedTo) {
        const member = members.find(m => m.id === task.assignedTo);
        if (member) {
          await updateDoc(doc(db, "members", member.id), {
            workload: Math.max(0, member.workload - 15)
          });
        }
      }

      await updateDoc(doc(db, "tasks", id), { status });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const taskToDelete = tasks.find(t => t.id === id);
      if (taskToDelete?.assignedTo && (taskToDelete.status === TaskStatus.ASSIGNED || taskToDelete.status === TaskStatus.IN_PROGRESS)) {
        const member = members.find(m => m.id === taskToDelete.assignedTo);
        if (member) {
          await updateDoc(doc(db, "members", member.id), {
            workload: Math.max(0, member.workload - 15)
          });
        }
      }
      await deleteDoc(doc(db, "tasks", id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssign = async (taskId: string, memberId: string) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        status: TaskStatus.ASSIGNED,
        assignedTo: memberId
      });

      const member = members.find(m => m.id === memberId);
      if (member) {
        await updateDoc(doc(db, "members", memberId), {
          workload: Math.min(100, member.workload + 15)
        });
      }
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDashboardAnalyze = (task: Task) => {
    setAnalyzingTask(task);
    navigate('/ai-assignment');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-darkBg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg shadow-primary/20"></div>
          <p className="text-sm font-bold text-slate-500 dark:text-primary animate-pulse uppercase tracking-widest">Loading TaskAI...</p>
        </div>
      </div>
    );
  }

  if (error === 'PERMISSION_DENIED') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-darkBg p-6">
        <div className="max-w-2xl w-full bg-white dark:bg-darkSurface border border-red-200 dark:border-red-900/30 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Firestore Permission Denied</h1>
              <p className="text-slate-500 dark:text-gray-400">Your database security rules are blocking access.</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-darkBg rounded-2xl p-5 border border-slate-200 dark:border-darkBorder">
              <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wider">
                <Terminal size={16} />
                <span>Fix Instructions</span>
              </div>
              <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 dark:text-gray-400">
                <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" className="text-primary hover:underline font-bold">Firebase Console</a>.</li>
                <li>Go to <strong>Firestore Database</strong> -{">"} <strong>Rules</strong> tab.</li>
                <li>Set rules to allow read/write and click <strong>Publish</strong>.</li>
              </ol>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-primary text-darkBg font-black rounded-2xl hover:bg-blue-400 transition-all uppercase tracking-widest"
            >
              Refresh App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen transition-colors duration-300 relative">
      {!currentUser ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} members={members} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <>
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <Sidebar
            theme={theme}
            user={currentUser}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main className="flex-1 lg:ml-64 min-h-screen bg-slate-50 dark:bg-darkBg transition-colors duration-300">
            <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-darkSurface border-b border-slate-200 dark:border-darkBorder sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-darkBg rounded-[2px]" />
                </div>
                <h1 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter">TaskAI</h1>
              </div>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-darkBg rounded-xl transition-colors"
              >
                <Menu size={24} />
              </button>
            </header>

            <div className="p-6 md:p-8 lg:p-10">
              <Routes>
                <Route path="/" element={<Dashboard members={members} tasks={tasks} onAnalyze={handleDashboardAnalyze} user={currentUser} />} />
                <Route path="/people" element={<People members={members} onAddMember={handleAddMember} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} user={currentUser} />} />
                {/* Updated AIAssignment route to pass user prop */}
                <Route path="/ai-assignment" element={<AIAssignment tasks={tasks} members={members} selectedTask={analyzingTask} onAssign={handleAssign} user={currentUser} onCreateTask={handleCreateTask} />} />
                <Route path="/tasks" element={<Tasks tasks={tasks} members={members} onCreateTask={handleCreateTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} onUpdateStatus={handleUpdateTaskStatus} user={currentUser} />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;