import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Client } from "../../../types/models";

export interface ClientsState {
  items: Client[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  items: [],
  loading: false,
  error: null,
};

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    // Load actions
    loadClientsRequested(state) {
      state.loading = true;
      state.error = null;
    },
    loadClientsSucceeded(state, action: PayloadAction<Client[]>) {
      state.items = action.payload;
      state.loading = false;
    },
    loadClientsFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Add client
    addClientRequested(state, _action: PayloadAction<Omit<Client, "id" | "createdAt">>) {
      state.loading = true;
      state.error = null;
    },
    addClientSucceeded(state, action: PayloadAction<Client>) {
      state.items.push(action.payload);
      state.loading = false;
    },
    addClientFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Update client
    updateClientRequested(state, _action: PayloadAction<Client>) {
      state.loading = true;
      state.error = null;
    },
    updateClientSucceeded(state, action: PayloadAction<Client>) {
      const index = state.items.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      state.loading = false;
    },
    updateClientFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete client
    deleteClientRequested(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    deleteClientSucceeded(state, action: PayloadAction<string>) {
      state.items = state.items.filter((c) => c.id !== action.payload);
      state.loading = false;
    },
    deleteClientFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Set all clients (for hydration/reset)
    setClients(state, action: PayloadAction<Client[]>) {
      state.items = action.payload;
    },
  },
});

// Selectors
export const selectClients = (state: { clients: ClientsState }) => state.clients.items;
export const selectClientsLoading = (state: { clients: ClientsState }) => state.clients.loading;
export const selectClientsError = (state: { clients: ClientsState }) => state.clients.error;
export const selectClientById = (clientId: string) => (state: { clients: ClientsState }) =>
  state.clients.items.find((c) => c.id === clientId);

export const {
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
  setClients,
} = clientsSlice.actions;

export default clientsSlice.reducer;
