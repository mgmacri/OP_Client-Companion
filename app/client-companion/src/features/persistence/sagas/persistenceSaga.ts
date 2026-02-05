import { takeEvery, put, call, select } from "redux-saga/effects";
import { v4 as uuidv4 } from "uuid";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Client, LogAssignment, LogEntry } from "../../../types/models";
import {
  loadClientsRequested,
  loadClientsSucceeded,
  loadClientsFailed,
  addClientRequested,
  addClientSucceeded,
  addClientFailed,
  updateClientRequested,
  updateClientSucceeded,
  updateClientFailed,
  deleteClientRequested,
  deleteClientSucceeded,
  deleteClientFailed,
  selectClients,
} from "../../clients/state/clientsSlice";
import {
  loadAssignmentsRequested,
  loadAssignmentsSucceeded,
  loadAssignmentsFailed,
  addAssignmentRequested,
  addAssignmentSucceeded,
  addAssignmentFailed,
  updateAssignmentRequested,
  updateAssignmentSucceeded,
  updateAssignmentFailed,
  deleteAssignmentRequested,
  deleteAssignmentSucceeded,
  deleteAssignmentFailed,
  toggleAssignmentActiveRequested,
  selectAssignments,
} from "../../assignments/state/assignmentsSlice";
import {
  loadEntriesRequested,
  loadEntriesSucceeded,
  loadEntriesFailed,
  addEntryRequested,
  addEntrySucceeded,
  addEntryFailed,
  deleteEntryRequested,
  deleteEntrySucceeded,
  deleteEntryFailed,
  deleteEntriesByClientSucceeded,
  selectEntries,
} from "../../entries/state/entriesSlice";

// Storage keys
const STORAGE_KEYS = {
  CLIENTS: "cc_clients",
  ASSIGNMENTS: "cc_assignments",
  LOG_ENTRIES: "cc_log_entries",
} as const;

// localStorage helpers
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
    throw error;
  }
}

// ============================================
// CLIENT SAGAS
// ============================================

function* handleLoadClients() {
  try {
    const clients: Client[] = yield call(loadFromStorage, STORAGE_KEYS.CLIENTS, []);
    yield put(loadClientsSucceeded(clients));
  } catch (error) {
    yield put(loadClientsFailed(error instanceof Error ? error.message : "Failed to load clients"));
  }
}

function* handleAddClient(action: PayloadAction<Omit<Client, "id" | "createdAt">>) {
  try {
    const newClient: Client = {
      ...action.payload,
      id: `client_${uuidv4()}`,
      createdAt: new Date().toISOString(),
    };
    
    const clients: Client[] = yield select(selectClients);
    const updatedClients = [...clients, newClient];
    yield call(saveToStorage, STORAGE_KEYS.CLIENTS, updatedClients);
    yield put(addClientSucceeded(newClient));
  } catch (error) {
    yield put(addClientFailed(error instanceof Error ? error.message : "Failed to add client"));
  }
}

function* handleUpdateClient(action: PayloadAction<Client>) {
  try {
    const clients: Client[] = yield select(selectClients);
    const updatedClients = clients.map((c) =>
      c.id === action.payload.id ? action.payload : c
    );
    yield call(saveToStorage, STORAGE_KEYS.CLIENTS, updatedClients);
    yield put(updateClientSucceeded(action.payload));
  } catch (error) {
    yield put(updateClientFailed(error instanceof Error ? error.message : "Failed to update client"));
  }
}

function* handleDeleteClient(action: PayloadAction<string>) {
  try {
    const clientId = action.payload;
    
    // Delete client
    const clients: Client[] = yield select(selectClients);
    const updatedClients = clients.filter((c) => c.id !== clientId);
    yield call(saveToStorage, STORAGE_KEYS.CLIENTS, updatedClients);
    
    // Cascade delete assignments
    const assignments: LogAssignment[] = yield select(selectAssignments);
    const updatedAssignments = assignments.filter((a) => a.clientId !== clientId);
    yield call(saveToStorage, STORAGE_KEYS.ASSIGNMENTS, updatedAssignments);
    yield put(deleteAssignmentSucceeded("")); // Trigger assignment state refresh
    
    // Cascade delete entries
    const entries: LogEntry[] = yield select(selectEntries);
    const updatedEntries = entries.filter((e) => e.clientId !== clientId);
    yield call(saveToStorage, STORAGE_KEYS.LOG_ENTRIES, updatedEntries);
    yield put(deleteEntriesByClientSucceeded(clientId));
    
    yield put(deleteClientSucceeded(clientId));
  } catch (error) {
    yield put(deleteClientFailed(error instanceof Error ? error.message : "Failed to delete client"));
  }
}

// ============================================
// ASSIGNMENT SAGAS
// ============================================

function* handleLoadAssignments() {
  try {
    const assignments: LogAssignment[] = yield call(loadFromStorage, STORAGE_KEYS.ASSIGNMENTS, []);
    yield put(loadAssignmentsSucceeded(assignments));
  } catch (error) {
    yield put(loadAssignmentsFailed(error instanceof Error ? error.message : "Failed to load assignments"));
  }
}

function* handleAddAssignment(action: PayloadAction<Omit<LogAssignment, "id" | "createdAt">>) {
  try {
    const newAssignment: LogAssignment = {
      ...action.payload,
      id: `assign_${uuidv4()}`,
      createdAt: new Date().toISOString(),
    };
    
    const assignments: LogAssignment[] = yield select(selectAssignments);
    const updatedAssignments = [...assignments, newAssignment];
    yield call(saveToStorage, STORAGE_KEYS.ASSIGNMENTS, updatedAssignments);
    yield put(addAssignmentSucceeded(newAssignment));
  } catch (error) {
    yield put(addAssignmentFailed(error instanceof Error ? error.message : "Failed to add assignment"));
  }
}

function* handleUpdateAssignment(action: PayloadAction<LogAssignment>) {
  try {
    const assignments: LogAssignment[] = yield select(selectAssignments);
    const updatedAssignments = assignments.map((a) =>
      a.id === action.payload.id ? action.payload : a
    );
    yield call(saveToStorage, STORAGE_KEYS.ASSIGNMENTS, updatedAssignments);
    yield put(updateAssignmentSucceeded(action.payload));
  } catch (error) {
    yield put(updateAssignmentFailed(error instanceof Error ? error.message : "Failed to update assignment"));
  }
}

function* handleDeleteAssignment(action: PayloadAction<string>) {
  try {
    const assignments: LogAssignment[] = yield select(selectAssignments);
    const updatedAssignments = assignments.filter((a) => a.id !== action.payload);
    yield call(saveToStorage, STORAGE_KEYS.ASSIGNMENTS, updatedAssignments);
    yield put(deleteAssignmentSucceeded(action.payload));
  } catch (error) {
    yield put(deleteAssignmentFailed(error instanceof Error ? error.message : "Failed to delete assignment"));
  }
}

function* handleToggleAssignmentActive(action: PayloadAction<string>) {
  try {
    const assignments: LogAssignment[] = yield select(selectAssignments);
    const assignment = assignments.find((a) => a.id === action.payload);
    if (assignment) {
      const updatedAssignment = { ...assignment, isActive: !assignment.isActive };
      const updatedAssignments = assignments.map((a) =>
        a.id === action.payload ? updatedAssignment : a
      );
      yield call(saveToStorage, STORAGE_KEYS.ASSIGNMENTS, updatedAssignments);
      yield put(updateAssignmentSucceeded(updatedAssignment));
    }
  } catch (error) {
    yield put(updateAssignmentFailed(error instanceof Error ? error.message : "Failed to toggle assignment"));
  }
}

// ============================================
// ENTRY SAGAS
// ============================================

function* handleLoadEntries() {
  try {
    const entries: LogEntry[] = yield call(loadFromStorage, STORAGE_KEYS.LOG_ENTRIES, []);
    yield put(loadEntriesSucceeded(entries));
  } catch (error) {
    yield put(loadEntriesFailed(error instanceof Error ? error.message : "Failed to load entries"));
  }
}

function* handleAddEntry(action: PayloadAction<Omit<LogEntry, "id" | "submittedAt">>) {
  try {
    const newEntry: LogEntry = {
      ...action.payload,
      id: `entry_${uuidv4()}`,
      submittedAt: new Date().toISOString(),
    };
    
    const entries: LogEntry[] = yield select(selectEntries);
    const updatedEntries = [...entries, newEntry];
    yield call(saveToStorage, STORAGE_KEYS.LOG_ENTRIES, updatedEntries);
    yield put(addEntrySucceeded(newEntry));
  } catch (error) {
    yield put(addEntryFailed(error instanceof Error ? error.message : "Failed to add entry"));
  }
}

function* handleDeleteEntry(action: PayloadAction<string>) {
  try {
    const entries: LogEntry[] = yield select(selectEntries);
    const updatedEntries = entries.filter((e) => e.id !== action.payload);
    yield call(saveToStorage, STORAGE_KEYS.LOG_ENTRIES, updatedEntries);
    yield put(deleteEntrySucceeded(action.payload));
  } catch (error) {
    yield put(deleteEntryFailed(error instanceof Error ? error.message : "Failed to delete entry"));
  }
}

// ============================================
// ROOT PERSISTENCE SAGA
// ============================================

export function* persistenceSaga() {
  // Client watchers
  yield takeEvery(loadClientsRequested.type, handleLoadClients);
  yield takeEvery(addClientRequested.type, handleAddClient);
  yield takeEvery(updateClientRequested.type, handleUpdateClient);
  yield takeEvery(deleteClientRequested.type, handleDeleteClient);

  // Assignment watchers
  yield takeEvery(loadAssignmentsRequested.type, handleLoadAssignments);
  yield takeEvery(addAssignmentRequested.type, handleAddAssignment);
  yield takeEvery(updateAssignmentRequested.type, handleUpdateAssignment);
  yield takeEvery(deleteAssignmentRequested.type, handleDeleteAssignment);
  yield takeEvery(toggleAssignmentActiveRequested.type, handleToggleAssignmentActive);

  // Entry watchers
  yield takeEvery(loadEntriesRequested.type, handleLoadEntries);
  yield takeEvery(addEntryRequested.type, handleAddEntry);
  yield takeEvery(deleteEntryRequested.type, handleDeleteEntry);
}

export default persistenceSaga;
