import type { Client, LogAssignment, LogEntry, Practitioner } from '../types/models';

const STORAGE_KEYS = {
  CLIENTS: 'cc_clients',
  ASSIGNMENTS: 'cc_assignments',
  LOG_ENTRIES: 'cc_log_entries',
  PRACTITIONER: 'cc_practitioner',
  CURRENT_CLIENT_ID: 'cc_current_client_id',
} as const;

// Generic localStorage helpers
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Clear all data and reseed
export function resetAndReseed(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  initializeDemoData();
}

// Practitioner
export function getPractitioner(): Practitioner | null {
  return getItem<Practitioner | null>(STORAGE_KEYS.PRACTITIONER, null);
}

export function savePractitioner(practitioner: Practitioner): void {
  setItem(STORAGE_KEYS.PRACTITIONER, practitioner);
}

// Clients
export function getClients(): Client[] {
  return getItem<Client[]>(STORAGE_KEYS.CLIENTS, []);
}

export function saveClients(clients: Client[]): void {
  setItem(STORAGE_KEYS.CLIENTS, clients);
}

export function addClient(client: Client): void {
  const clients = getClients();
  clients.push(client);
  saveClients(clients);
}

export function updateClient(client: Client): void {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === client.id);
  if (index !== -1) {
    clients[index] = client;
    saveClients(clients);
  }
}

export function deleteClient(clientId: string): void {
  const clients = getClients().filter(c => c.id !== clientId);
  saveClients(clients);
  // Also delete associated assignments and entries
  const assignments = getAssignments().filter(a => a.clientId !== clientId);
  saveAssignments(assignments);
  const entries = getLogEntries().filter(e => e.clientId !== clientId);
  saveLogEntries(entries);
}

export function getClientById(clientId: string): Client | undefined {
  return getClients().find(c => c.id === clientId);
}

// Assignments
export function getAssignments(): LogAssignment[] {
  return getItem<LogAssignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
}

export function saveAssignments(assignments: LogAssignment[]): void {
  setItem(STORAGE_KEYS.ASSIGNMENTS, assignments);
}

export function addAssignment(assignment: LogAssignment): void {
  const assignments = getAssignments();
  assignments.push(assignment);
  saveAssignments(assignments);
}

export function updateAssignment(assignment: LogAssignment): void {
  const assignments = getAssignments();
  const index = assignments.findIndex(a => a.id === assignment.id);
  if (index !== -1) {
    assignments[index] = assignment;
    saveAssignments(assignments);
  }
}

export function deleteAssignment(assignmentId: string): void {
  const assignments = getAssignments().filter(a => a.id !== assignmentId);
  saveAssignments(assignments);
}

export function getAssignmentsByClient(clientId: string): LogAssignment[] {
  return getAssignments().filter(a => a.clientId === clientId);
}

export function getActiveAssignmentsByClient(clientId: string): LogAssignment[] {
  return getAssignments().filter(a => a.clientId === clientId && a.isActive);
}

// Log Entries
export function getLogEntries(): LogEntry[] {
  return getItem<LogEntry[]>(STORAGE_KEYS.LOG_ENTRIES, []);
}

export function saveLogEntries(entries: LogEntry[]): void {
  setItem(STORAGE_KEYS.LOG_ENTRIES, entries);
}

export function addLogEntry(entry: LogEntry): void {
  const entries = getLogEntries();
  entries.push(entry);
  saveLogEntries(entries);
}

export function getLogEntriesByClient(clientId: string): LogEntry[] {
  return getLogEntries().filter(e => e.clientId === clientId);
}

export function getLogEntriesByAssignment(assignmentId: string): LogEntry[] {
  return getLogEntries().filter(e => e.assignmentId === assignmentId);
}

// Current client (for client portal view)
export function getCurrentClientId(): string | null {
  return getItem<string | null>(STORAGE_KEYS.CURRENT_CLIENT_ID, null);
}

export function setCurrentClientId(clientId: string | null): void {
  setItem(STORAGE_KEYS.CURRENT_CLIENT_ID, clientId);
}

// Initialize with demo data if empty
export function initializeDemoData(): void {
  const practitioner = getPractitioner();
  if (!practitioner) {
    savePractitioner({
      id: 'prac_demo',
      name: 'Dr. Sarah Mitchell',
      email: 'dr.mitchell@clinic.com',
      role: 'psychologist',
      clientIds: ['client_1', 'client_2']
    });
  }

  const clients = getClients();
  if (clients.length === 0) {
    saveClients([
      {
        id: 'client_1',
        name: 'Alex Johnson',
        email: 'alex.j@email.com',
        notes: 'Working on anxiety management',
        createdAt: new Date().toISOString()
      },
      {
        id: 'client_2',
        name: 'Jordan Smith',
        email: 'jordan.s@email.com',
        notes: 'CBT for depression',
        createdAt: new Date().toISOString()
      }
    ]);
  }

  const assignments = getAssignments();
  if (assignments.length === 0) {
    saveAssignments([
      // Client 1 assignments
      {
        id: 'assign_1',
        clientId: 'client_1',
        logTypeId: 'mood_diary',
        frequency: 'daily',
        startDate: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'assign_1b',
        clientId: 'client_1',
        logTypeId: 'panic_log',
        frequency: 'as-needed',
        startDate: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'assign_1c',
        clientId: 'client_1',
        logTypeId: 'sleep_log',
        frequency: 'daily',
        startDate: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      },
      // Client 2 assignments
      {
        id: 'assign_2',
        clientId: 'client_2',
        logTypeId: 'cbt_thought_record',
        frequency: 'as-needed',
        startDate: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'assign_2b',
        clientId: 'client_2',
        logTypeId: 'mood_diary',
        frequency: 'daily',
        startDate: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'assign_2c',
        clientId: 'client_2',
        logTypeId: 'behavioral_activation',
        frequency: 'daily',
        startDate: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ]);
  }

  // Seed log entries if empty
  const entries = getLogEntries();
  if (entries.length === 0) {
    saveLogEntries(generateSeedEntries());
  }
}

// Helper to generate random entries
function generateSeedEntries(): LogEntry[] {
  const entries: LogEntry[] = [];
  const now = new Date();
  
  const emotions = ['Happy', 'Sad', 'Anxious', 'Calm', 'Frustrated', 'Hopeful', 'Tired', 'Energetic', 'Stressed', 'Content'];
  const triggers = [
    'Work meeting went poorly',
    'Had a great conversation with a friend',
    'Feeling overwhelmed with tasks',
    'Enjoyed a quiet morning',
    'Traffic made me late',
    'Received positive feedback',
    'Argument with family member',
    'Completed a difficult task',
    'Felt lonely at lunch',
    'Exercise helped clear my mind'
  ];
  const timesOfDay = ['Morning', 'Afternoon', 'Evening'];
  
  // Generate mood diary entries for client 1
  for (let i = 0; i < 12; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    entries.push({
      id: `entry_c1_mood_${i}`,
      clientId: 'client_1',
      logTypeId: 'mood_diary',
      assignmentId: 'assign_1',
      fields: {
        time_of_day: timesOfDay[Math.floor(Math.random() * timesOfDay.length)],
        current_emotion: emotions[Math.floor(Math.random() * emotions.length)],
        trigger_context: triggers[Math.floor(Math.random() * triggers.length)],
        mood_intensity: Math.floor(Math.random() * 7) + 3,
        energy_level: Math.floor(Math.random() * 7) + 2
      },
      submittedAt: date.toISOString()
    });
  }

  // Generate panic log entries for client 1
  const panicTriggers = ['Crowded store', 'Public speaking', 'Driving on highway', 'Elevator', 'Social gathering'];
  const symptoms = ['Racing heart, sweating', 'Shortness of breath, dizziness', 'Chest tightness, trembling', 'Nausea, feeling detached'];
  const thoughts = ['I\'m going to pass out', 'Something is seriously wrong', 'I need to escape', 'Everyone is staring at me'];
  const behaviors = ['Left the situation', 'Called a friend', 'Used breathing techniques', 'Sat down and waited it out'];
  
  for (let i = 0; i < 10; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 3));
    entries.push({
      id: `entry_c1_panic_${i}`,
      clientId: 'client_1',
      logTypeId: 'panic_log',
      assignmentId: 'assign_1b',
      fields: {
        trigger: panicTriggers[Math.floor(Math.random() * panicTriggers.length)],
        symptoms: symptoms[Math.floor(Math.random() * symptoms.length)],
        thoughts: thoughts[Math.floor(Math.random() * thoughts.length)],
        behavior: behaviors[Math.floor(Math.random() * behaviors.length)],
        peak_distress: Math.floor(Math.random() * 5) + 5,
        duration: Math.floor(Math.random() * 20) + 5
      },
      submittedAt: date.toISOString()
    });
  }

  // Generate sleep log entries for client 1
  for (let i = 0; i < 14; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const bedHour = 21 + Math.floor(Math.random() * 3);
    const wakeHour = 6 + Math.floor(Math.random() * 2);
    entries.push({
      id: `entry_c1_sleep_${i}`,
      clientId: 'client_1',
      logTypeId: 'sleep_log',
      assignmentId: 'assign_1c',
      fields: {
        bedtime: `${bedHour}:${Math.random() > 0.5 ? '00' : '30'}`,
        lights_out: `${bedHour}:${Math.random() > 0.5 ? '30' : '45'}`,
        wake_time: `${wakeHour}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        substances: Math.random() > 0.7 ? 'Coffee in afternoon' : 'None',
        onset_latency: Math.floor(Math.random() * 30) + 5,
        awakenings: Math.floor(Math.random() * 3),
        sleep_quality: Math.floor(Math.random() * 3) + 2,
        restedness: Math.floor(Math.random() * 5) + 4
      },
      submittedAt: date.toISOString()
    });
  }

  // Generate CBT thought record entries for client 2
  const situations = [
    'Boss criticized my work in front of colleagues',
    'Friend didn\'t respond to my text for hours',
    'Made a mistake on an important project',
    'Felt ignored at a party',
    'Comparison to coworker\'s success',
    'Upcoming performance review',
    'Partner seemed distant',
    'Struggled to complete a simple task'
  ];
  const autoThoughts = [
    'I\'m incompetent and everyone knows it',
    'Nobody actually likes me',
    'I always mess things up',
    'I\'m not good enough',
    'I\'ll never be successful',
    'Something bad is going to happen',
    'They\'re going to leave me',
    'I can\'t do anything right'
  ];
  const distortions = ['All-or-nothing thinking', 'Mind reading', 'Catastrophizing', 'Should statements', 'Overgeneralization', 'Mental filter'];
  const altThoughts = [
    'One mistake doesn\'t define my entire competence',
    'People have their own lives and delays are normal',
    'I can learn from this and improve',
    'My worth isn\'t determined by one interaction',
    'Success looks different for everyone',
    'I can prepare and handle whatever comes',
    'I should communicate rather than assume',
    'Struggling sometimes is human and okay'
  ];

  for (let i = 0; i < 11; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 2));
    entries.push({
      id: `entry_c2_cbt_${i}`,
      clientId: 'client_2',
      logTypeId: 'cbt_thought_record',
      assignmentId: 'assign_2',
      fields: {
        situation: situations[Math.floor(Math.random() * situations.length)],
        auto_thought: autoThoughts[Math.floor(Math.random() * autoThoughts.length)],
        distortion: distortions[Math.floor(Math.random() * distortions.length)],
        alt_thought: altThoughts[Math.floor(Math.random() * altThoughts.length)],
        belief_auto: Math.floor(Math.random() * 40) + 50,
        emotion_intensity: Math.floor(Math.random() * 40) + 40,
        belief_alt: Math.floor(Math.random() * 30) + 30
      },
      submittedAt: date.toISOString()
    });
  }

  // Generate mood diary entries for client 2
  for (let i = 0; i < 12; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    entries.push({
      id: `entry_c2_mood_${i}`,
      clientId: 'client_2',
      logTypeId: 'mood_diary',
      assignmentId: 'assign_2b',
      fields: {
        time_of_day: timesOfDay[Math.floor(Math.random() * timesOfDay.length)],
        current_emotion: emotions[Math.floor(Math.random() * emotions.length)],
        trigger_context: triggers[Math.floor(Math.random() * triggers.length)],
        mood_intensity: Math.floor(Math.random() * 6) + 2,
        energy_level: Math.floor(Math.random() * 5) + 2
      },
      submittedAt: date.toISOString()
    });
  }

  // Generate behavioral activation entries for client 2
  const activities = [
    'Went for a 20 minute walk',
    'Called a friend',
    'Cooked a healthy meal',
    'Cleaned the apartment',
    'Read for 30 minutes',
    'Attended yoga class',
    'Worked on hobby project',
    'Went grocery shopping',
    'Watched a movie',
    'Did laundry'
  ];

  for (let i = 0; i < 15; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const hour = 8 + Math.floor(Math.random() * 12);
    entries.push({
      id: `entry_c2_ba_${i}`,
      clientId: 'client_2',
      logTypeId: 'behavioral_activation',
      assignmentId: 'assign_2c',
      fields: {
        time_block: `${hour}:00`,
        activity: activities[Math.floor(Math.random() * activities.length)],
        mastery: Math.floor(Math.random() * 6) + 3,
        pleasure: Math.floor(Math.random() * 6) + 3
      },
      submittedAt: date.toISOString()
    });
  }

  return entries;
}
