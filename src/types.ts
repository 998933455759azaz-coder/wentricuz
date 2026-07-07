export enum EmployeeStatus {
  ONLINE = "Online",
  VACATION = "Ta'tilda",
  FIRED = "Ishdan bo'shagan"
}

export interface Employee {
  id: string; // e.g., "DEV-004", "CEO-001"
  name: string;
  username: string;
  position: string;
  grade: string; // e.g., "G15", "G10"
  department: string; // e.g., "Engineering", "Marketing", "Executive"
  team: string; // e.g., "Backend", "Branding", "Red Team"
  manager: string; // e.g., "CTO", "CEO"
  startDate: string;
  status: EmployeeStatus;
  kpi: number; // e.g., 95
  okr: string; // Objectives and Key Results description
  bonus: number; // e.g., 500 ($)
  warningCount: number; // 0 to 5
  vacationDays: number;
  certificates: string[];
  completedProjects: string[];
  skills: string[];
  permissions: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  department: string;
  status: "Planning" | "Backlog" | "In Progress" | "Code Review" | "Testing" | "Staging" | "Production" | "Maintenance";
  assignees: string[]; // employee IDs
  progress: number; // 0 to 100
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderUsername: string;
  senderId?: string; // DEV-004 or none (if unregistered)
  text: string;
  timestamp: string;
  isUnregistered: boolean;
}

export interface BotWarningLog {
  id: string;
  timestamp: string;
  targetUsername: string;
  reason: string;
  issuer: string;
  level: number; // 1 to 5
}
