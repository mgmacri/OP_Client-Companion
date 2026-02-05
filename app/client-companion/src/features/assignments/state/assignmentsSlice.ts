import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { LogAssignment } from "../../../types/models";

export interface AssignmentsState {
  items: LogAssignment[];
  loading: boolean;
  error: string | null;
}

const initialState: AssignmentsState = {
  items: [],
  loading: false,
  error: null,
};

const assignmentsSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {
    // Load actions
    loadAssignmentsRequested(state) {
      state.loading = true;
      state.error = null;
    },
    loadAssignmentsSucceeded(state, action: PayloadAction<LogAssignment[]>) {
      state.items = action.payload;
      state.loading = false;
    },
    loadAssignmentsFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Add assignment
    addAssignmentRequested(state, _action: PayloadAction<Omit<LogAssignment, "id" | "createdAt">>) {
      state.loading = true;
      state.error = null;
    },
    addAssignmentSucceeded(state, action: PayloadAction<LogAssignment>) {
      state.items.push(action.payload);
      state.loading = false;
    },
    addAssignmentFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Update assignment
    updateAssignmentRequested(state, _action: PayloadAction<LogAssignment>) {
      state.loading = true;
      state.error = null;
    },
    updateAssignmentSucceeded(state, action: PayloadAction<LogAssignment>) {
      const index = state.items.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      state.loading = false;
    },
    updateAssignmentFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete assignment
    deleteAssignmentRequested(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    deleteAssignmentSucceeded(state, action: PayloadAction<string>) {
      state.items = state.items.filter((a) => a.id !== action.payload);
      state.loading = false;
    },
    deleteAssignmentFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Toggle active status
    toggleAssignmentActiveRequested(state, _action: PayloadAction<string>) {
      state.loading = true;
    },

    // Set all assignments (for hydration/reset)
    setAssignments(state, action: PayloadAction<LogAssignment[]>) {
      state.items = action.payload;
    },
  },
});

// Selectors
export const selectAssignments = (state: { assignments: AssignmentsState }) => state.assignments.items;
export const selectAssignmentsLoading = (state: { assignments: AssignmentsState }) => state.assignments.loading;
export const selectAssignmentsError = (state: { assignments: AssignmentsState }) => state.assignments.error;

export const selectAssignmentsByClient = (clientId: string) => (state: { assignments: AssignmentsState }) =>
  state.assignments.items.filter((a) => a.clientId === clientId);

export const selectActiveAssignmentsByClient = (clientId: string) => (state: { assignments: AssignmentsState }) =>
  state.assignments.items.filter((a) => a.clientId === clientId && a.isActive);

export const selectAssignmentById = (assignmentId: string) => (state: { assignments: AssignmentsState }) =>
  state.assignments.items.find((a) => a.id === assignmentId);

export const {
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
  setAssignments,
} = assignmentsSlice.actions;

export default assignmentsSlice.reducer;
