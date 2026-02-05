import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getClients, getAssignments, getLogEntries, initializeDemoData } from '../../services/storage';
import type { Client, LogAssignment, LogEntry } from '../../types/models';
import { LOG_TYPES } from '../../data/logTypes';
import '../../styles/theme.css';

const PractitionerDashboard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [assignments, setAssignments] = useState<LogAssignment[]>([]);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const location = useLocation();

  useEffect(() => {
    initializeDemoData();
    loadData();
  }, [location]);

  const loadData = () => {
    setClients(getClients());
    setAssignments(getAssignments());
    setEntries(getLogEntries());
  };

  const getClientStats = (clientId: string) => {
    const clientAssignments = assignments.filter(a => a.clientId === clientId);
    const clientEntries = entries.filter(e => e.clientId === clientId);
    const activeAssignments = clientAssignments.filter(a => a.isActive);
    
    return {
      totalAssignments: clientAssignments.length,
      activeAssignments: activeAssignments.length,
      totalEntries: clientEntries.length,
      recentEntry: clientEntries.length > 0 
        ? new Date(clientEntries[clientEntries.length - 1].submittedAt).toLocaleDateString()
        : 'No entries yet'
    };
  };

  const getLogTypeName = (logTypeId: string) => {
    const logType = LOG_TYPES.find(lt => lt.id === logTypeId);
    return logType?.name || logTypeId;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Practitioner Dashboard</h1>
          <p>Manage your clients and their logging assignments</p>
        </div>
        <Link to="/practitioner/clients/new" className="btn btn-primary">
          + Add New Client
        </Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{clients.length}</div>
          <div className="stat-label">Total Clients</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{assignments.filter(a => a.isActive).length}</div>
          <div className="stat-label">Active Assignments</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{entries.length}</div>
          <div className="stat-label">Total Log Entries</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{LOG_TYPES.length}</div>
          <div className="stat-label">Log Types Available</div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Your Clients</h2>
          <Link to="/practitioner/clients" className="btn btn-ghost btn-sm">
            View All →
          </Link>
        </div>

        {clients.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No clients yet</div>
            <p>Add your first client to get started</p>
            <Link to="/practitioner/clients/new" className="btn btn-primary" style={{ marginTop: '16px' }}>
              + Add Client
            </Link>
          </div>
        ) : (
          <div className="client-grid">
            {clients.slice(0, 6).map(client => {
              const stats = getClientStats(client.id);
              return (
                <div key={client.id} className="client-card card">
                  <div className="client-card-header">
                    <div className="client-avatar">
                      {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="client-info">
                      <h3>{client.name}</h3>
                      <span className="client-email">{client.email}</span>
                    </div>
                  </div>
                  
                  <div className="client-card-stats">
                    <div className="mini-stat">
                      <span className="mini-stat-value">{stats.activeAssignments}</span>
                      <span className="mini-stat-label">Active Tasks</span>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-stat-value">{stats.totalEntries}</span>
                      <span className="mini-stat-label">Entries</span>
                    </div>
                  </div>

                  {client.notes && (
                    <p className="client-notes">{client.notes}</p>
                  )}

                  <div className="client-card-actions">
                    <Link to={`/practitioner/clients/${client.id}`} className="btn btn-secondary btn-sm">
                      View Details
                    </Link>
                    <Link to={`/practitioner/clients/${client.id}/assign`} className="btn btn-primary btn-sm">
                      Assign Task
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Activity</h2>
        </div>

        {entries.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No log entries yet</div>
            <p>When clients submit their logs, they'll appear here</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Log Type</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(-5).reverse().map(entry => {
                  const client = clients.find(c => c.id === entry.clientId);
                  return (
                    <tr key={entry.id}>
                      <td>{client?.name || 'Unknown'}</td>
                      <td>
                        <span className="badge badge-primary">
                          {getLogTypeName(entry.logTypeId)}
                        </span>
                      </td>
                      <td>{new Date(entry.submittedAt).toLocaleString()}</td>
                      <td>
                        <Link to={`/practitioner/entries/${entry.id}`} className="btn btn-ghost btn-sm">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .dashboard {
          padding: var(--spacing-lg);
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-xl);
        }

        .dashboard-header h1 {
          margin-bottom: var(--spacing-xs);
        }

        .dashboard-header p {
          color: var(--color-text-light);
          margin: 0;
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .stat-card {
          background: var(--color-surface);
          border: 2px solid var(--color-outline);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          text-align: center;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--color-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin-top: var(--spacing-sm);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dashboard-section {
          margin-bottom: var(--spacing-xl);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }

        .section-header h2 {
          margin: 0;
        }

        .client-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--spacing-lg);
        }

        .client-card {
          display: flex;
          flex-direction: column;
        }

        .client-card-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .client-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1rem;
        }

        .client-info h3 {
          margin: 0 0 2px 0;
          font-size: 1.1rem;
        }

        .client-email {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .client-card-stats {
          display: flex;
          gap: var(--spacing-lg);
          padding: var(--spacing-md) 0;
          border-top: 1px solid rgba(39, 67, 87, 0.1);
          border-bottom: 1px solid rgba(39, 67, 87, 0.1);
          margin-bottom: var(--spacing-md);
        }

        .mini-stat {
          display: flex;
          flex-direction: column;
        }

        .mini-stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text);
        }

        .mini-stat-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .client-notes {
          font-size: 0.875rem;
          color: var(--color-text-light);
          margin: 0 0 var(--spacing-md) 0;
          flex-grow: 1;
        }

        .client-card-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .client-card-actions .btn {
          flex: 1;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: var(--spacing-md);
          }
          
          .dashboard-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default PractitionerDashboard;
