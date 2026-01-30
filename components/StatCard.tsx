
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon }) => {
  return (
    <div className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-darkBorder p-6 rounded-2xl flex items-center justify-between group hover:border-blue-300 dark:hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
      <div>
        <p className="text-sm text-slate-500 dark:text-gray-500 font-medium mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
      </div>
      <div className="w-12 h-12 bg-slate-50 dark:bg-darkBg rounded-xl flex items-center justify-center text-blue-600 dark:text-primary group-hover:bg-blue-50 dark:group-hover:bg-primary/10 transition-colors">
        <Icon size={24} />
      </div>
    </div>
  );
};

export default StatCard;
