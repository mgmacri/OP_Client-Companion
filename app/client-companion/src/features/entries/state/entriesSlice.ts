import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { LogEntry } from "../../../types/models";

export interface EntriesState {
  items: LogEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: EntriesState = {
  items: [],
  loading: false,
  error: null,
};

const entriesSlice = createSlice({
  name: "entries",
  initialState,
  reducers: {
    // Load actions
    loadEntriesRequested(state) {
      state.loading = true;
      state.error = null;
    },
    loadEntriesSucceeded(state, action: PayloadAction<LogEntry[]>) {
      state.items = action.payload;
      state.loading = false;
    },
    loadEntriesFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Add entry
    addEntryRequested(state, _action: PayloadAction<Omit<LogEntry, "id" | "submittedAt">>) {
      state.loading = true;
      state.error = null;
    },
    addEntrySucceeded(state, action: PayloadAction<LogEntry>) {
      state.items.push(action.payload);
      state.loading = false;
    },
    addEntryFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete entry
    deleteEntryRequested(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    deleteEntrySucceeded(state, action: PayloadAction<string>) {
      state.items = state.items.filter((e) => e.id !== action.payload);
      state.loading = false;
    },
    deleteEntryFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete entries by client (cascade delete)
    deleteEntriesByClientSucceeded(state, action: PayloadAction<string>) {
      state.items = state.items.filter((e) => e.clientId !== action.payload);
    },

    // Set all entries (for hydration/reset)
    setEntries(state, action: PayloadAction<LogEntry[]>) {
      state.items = action.payload;
    },
  },
});

// Selectors
export const selectEntries = (state: { entries: EntriesState }) => state.entries.items;
export const selectEntriesLoading = (state: { entries: EntriesState }) => state.entries.loading;
export const selectEntriesError = (state: { entries: EntriesState }) => state.entries.error;

export const selectEntriesByClient = (clientId: string) => (state: { entries: EntriesState }) =>
  state.entries.items.filter((e) => e.clientId === clientId);

export const selectEntriesByAssignment = (assignmentId: string) => (state: { entries: EntriesState }) =>
  state.entries.items.filter((e) => e.assignmentId === assignmentId);

export const selectEntryById = (entryId: string) => (state: { entries: EntriesState }) =>
  state.entries.items.find((e) => e.id === entryId);

export const selectRecentEntries = (limit: number = 10) => (state: { entries: EntriesState }) =>
  [...state.entries.items]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, limit);

export const {
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
  setEntries,
} = entriesSlice.actions;

export default entriesSlice.reducer;
