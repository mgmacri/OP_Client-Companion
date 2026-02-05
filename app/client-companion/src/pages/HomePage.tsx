import React from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { selectClients, loadClientsRequested } from '../features/clients/state/clientsSlice';
import { loadAssignmentsRequested } from '../features/assignments/state/assignmentsSlice';
import { loadEntriesRequested } from '../features/entries/state/entriesSlice';
import { initializeDemoData, resetAndReseed } from '../services/storage';
import type { Client } from '../types/models';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const clients = useAppSelector(selectClients);

  // Initialize demo data on load
  React.useEffect(() => {
    initializeDemoData();
    dispatch(loadClientsRequested());
    dispatch(loadAssignmentsRequested());
    dispatch(loadEntriesRequested());
  }, [dispatch]);

  const handleReseed = () => {
    if (confirm('This will reset all data and reload with demo entries. Continue?')) {
      resetAndReseed();
      dispatch(loadClientsRequested());
      dispatch(loadAssignmentsRequested());
      dispatch(loadEntriesRequested());
      window.location.reload();
    }
  };

  return (
    <div className="home-page">
      <nav className="home-nav">
        <div className="nav-brand">
          <span className="brand-icon">🧠</span>
          Client Companion
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleReseed} style={{ color: 'white' }}>
          Reset Demo Data
        </button>
      </nav>

      <main className="home-main">
        <div className="hero-section">
          <h1>Welcome to Client Companion</h1>
          <p>A secure platform for therapists and clients to track progress together.</p>
        </div>

        <div className="portal-options">
          <div className="portal-card card">
            <div className="portal-icon">👨‍⚕️</div>
            <h2>Practitioner Portal</h2>
            <p>Manage clients, assign logging tasks, and review submitted entries.</p>
            <Link to="/practitioner" className="btn btn-primary btn-lg">
              Enter Practitioner Portal
            </Link>
          </div>

          <div className="portal-card card">
            <div className="portal-icon">👤</div>
            <h2>Client Portal</h2>
            <p>Complete your assigned logging tasks and track your progress.</p>
            {clients.length > 0 ? (
              <div className="client-select">
                <label htmlFor="client-select">Select your profile:</label>
                <select 
                  id="client-select"
                  onChange={(e) => {
                    if (e.target.value) {
                      window.location.href = `/client/${e.target.value}`;
                    }
                  }}
                >
                  <option value="">Choose a client...</option>
                  {clients.map((client: Client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="no-clients">No clients registered yet. Create one in the Practitioner Portal.</p>
            )}
          </div>
        </div>

        <div className="features-section">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Multiple Log Types</h3>
              <p>Support for Mood Diaries, CBT Thought Records, Sleep Logs, and more.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Client Management</h3>
              <p>Easily manage multiple clients and their assignments.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>Review client entries and monitor therapeutic progress.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💾</div>
              <h3>Local Storage</h3>
              <p>All data is saved locally for quick access and privacy.</p>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .home-page {
          min-height: 100vh;
          background-color: var(--color-background);
        }

        .home-nav {
          background-color: var(--color-outline);
          padding: var(--spacing-md) var(--spacing-lg);
          display: flex;
          justify-content: center;
        }

        .nav-brand {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .brand-icon {
          font-size: 2rem;
        }

        .home-main {
          max-width: 1000px;
          margin: 0 auto;
          padding: var(--spacing-2xl) var(--spacing-lg);
        }

        .hero-section {
          text-align: center;
          margin-bottom: var(--spacing-2xl);
        }

        .hero-section h1 {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-md);
          color: var(--color-text);
        }

        .hero-section p {
          font-size: 1.25rem;
          color: var(--color-text-light);
          max-width: 600px;
          margin: 0 auto;
        }

        .portal-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-xl);
          margin-bottom: var(--spacing-2xl);
        }

        .portal-card {
          text-align: center;
          padding: var(--spacing-xl);
        }

        .portal-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
        }

        .portal-card h2 {
          margin-bottom: var(--spacing-sm);
        }

        .portal-card p {
          color: var(--color-text-light);
          margin-bottom: var(--spacing-lg);
        }

        .client-select {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .client-select label {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .no-clients {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          font-style: italic;
        }

        .features-section {
          text-align: center;
        }

        .features-section h2 {
          margin-bottom: var(--spacing-xl);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-lg);
        }

        .feature-card {
          background: var(--color-surface);
          border: 2px solid var(--color-outline);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          text-align: center;
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: var(--spacing-sm);
        }

        .feature-card h3 {
          font-size: 1rem;
          margin-bottom: var(--spacing-xs);
        }

        .feature-card p {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin: 0;
        }

        @media (max-width: 768px) {
          .hero-section h1 {
            font-size: 2rem;
          }

          .portal-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
