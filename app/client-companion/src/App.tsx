import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PractitionerLayout from './layouts/PractitionerLayout';
import PractitionerDashboard from './pages/practitioner/Dashboard';
import ClientsList from './pages/practitioner/ClientsList';
import ClientDetail from './pages/practitioner/ClientDetail';
import AssignTask from './pages/practitioner/AssignTask';
import EntryDetail from './pages/practitioner/EntryDetail';
import ClientPortal from './pages/client/ClientPortal';
import './styles/theme.css';

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
