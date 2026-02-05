import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch } from './app/store';
import { loadClientsRequested } from './features/clients/state/clientsSlice';
import { loadAssignmentsRequested } from './features/assignments/state/assignmentsSlice';
import { loadEntriesRequested } from './features/entries/state/entriesSlice';
import HomePage from './pages/HomePage';
import PractitionerLayout from './layouts/PractitionerLayout';
import PractitionerDashboard from './pages/practitioner/Dashboard';
import ClientsList from './pages/practitioner/ClientsList';
import ClientDetail from './pages/practitioner/ClientDetail';
import AssignTask from './pages/practitioner/AssignTask';
import EntryDetail from './pages/practitioner/EntryDetail';
import ClientPortal from './pages/client/ClientPortal';
import './styles/theme.css';

function AppContent() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Load all data from localStorage into Redux on app mount
    dispatch(loadClientsRequested());
    dispatch(loadAssignmentsRequested());
    dispatch(loadEntriesRequested());
  }, [dispatch]);

  return (
    <Routes>
      {/* Home Page */}
      <Route path="/" element={<HomePage />} />
      
      {/* Practitioner Routes */}
      <Route path="/practitioner" element={<PractitionerLayout />}>
        <Route index element={<PractitionerDashboard />} />
        <Route path="clients" element={<ClientsList />} />
        <Route path="clients/new" element={<ClientsList />} />
        <Route path="clients/:clientId" element={<ClientDetail />} />
        <Route path="clients/:clientId/assign" element={<AssignTask />} />
        <Route path="entries/:entryId" element={<EntryDetail />} />
      </Route>
      
      {/* Client Portal Routes */}
      <Route path="/client/:clientId" element={<ClientPortal />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
