
import React from 'react';
import { LayoutDashboard, Users, ClipboardList, Zap, Moon, Sun, LogOut, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User } from '../types';

interface SidebarProps {
  theme: 'light' | 'dark';
  user: User | null;
  onToggleTheme: () => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ theme, user, onToggleTheme, onLogout, isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const allItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['admin', 'employer'] },
    { id: 'people', icon: Users, label: 'Users', path: '/people', roles: ['admin'] },
    { id: 'tasks', icon: ClipboardList, label: 'Tasks', path: '/tasks', roles: ['admin', 'employer'] },
    { id: 'ai-assignment', icon: Zap, label: 'AI Assignment', path: '/ai-assignment', badge: 'AI', roles: ['admin'] },
  ];

  const menuItems = allItems.filter(item => item.roles.includes(user?.role || 'employer'));

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-darkBg border-r border-slate-200 dark:border-darkBorder 
    flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <div className={sidebarClasses}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 dark:bg-darkSurface border border-slate-200 dark:border-darkBorder rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-primary rounded-[2px]" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-900 dark:text-white">TaskAI</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Smart Assignment</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-blue-50 dark:bg-[#00d1ff15] text-blue-600 dark:text-primary shadow-sm'
                  : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-[#0c1222] hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <item.icon size={20} className={isActive ? 'text-blue-600 dark:text-primary' : 'text-slate-400 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white'} />
              <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="border border-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-darkBorder space-y-1">
        <div className="px-4 py-3 mb-2 bg-slate-50 dark:bg-darkSurface rounded-2xl border border-slate-100 dark:border-darkBorder">
          <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">Logged in as</p>
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
        </div>
        {/* <button
          onClick={onToggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-[#0c1222] hover:text-slate-900 dark:hover:text-white transition-all"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span className="font-medium text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button> */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
