
export type UserRole = 'admin' | 'employer';

export interface User {
  email?: string;
  name: string;
  role: UserRole;
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export interface Skill {
  name: string;
  level: SkillLevel;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  skills: Skill[];
  workload: number; // 0-100 percentage
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum TaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  requiredSkills: Skill[];
  estimatedHours: number;
  dueDate: string;
  assignedTo?: string; // Member ID
  dateCreated: string;
}

export interface MatchResult {
  memberId: string;
  matchScore: number;
  skillMatch: number;
  workloadFit: number;
  reasoning: string;
}

export interface Assignment {
  taskId: string;
  memberId: string;
  matchScore: number;
  timestamp: string;
}
