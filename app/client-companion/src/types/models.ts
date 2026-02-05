// Core domain models for the Client Companion MVP

export interface Client {
  id: string;
  name: string;
  email: string;
  notes?: string;
  createdAt: string;
}

export interface LogType {
  id: string;
  name: string;
  target_conditions: string[];
  text_inputs: TextInput[];
  metrics: Metric[];
}

export interface TextInput {
  key: string;
  label: string;
  type: 'string' | 'textarea' | 'select' | 'time' | 'boolean';
  options?: string[];
}

export interface Metric {
  key: string;
  label: string;
  min: number;
  max: number | null;
  unit: string;
}

export interface LogAssignment {
  id: string;
  clientId: string;
  logTypeId: string;
  frequency: 'daily' | 'weekly' | 'as-needed';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface LogEntry {
  id: string;
  clientId: string;
  logTypeId: string;
  assignmentId: string;
  fields: Record<string, string | number | boolean>;
  submittedAt: string;
}

export interface Practitioner {
  id: string;
  name: string;
  email: string;
  role: 'therapist' | 'psychologist' | 'counselor';
  clientIds: string[];
}
