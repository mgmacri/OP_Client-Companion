import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectClientById } from '../../features/clients/state/clientsSlice';
import { 
  selectAssignmentsByClient, 
  updateAssignmentRequested, 
  deleteAssignmentRequested 
} from '../../features/assignments/state/assignmentsSlice';
import { selectEntriesByClient } from '../../features/entries/state/entriesSlice';
import type { LogAssignment, LogEntry } from '../../types/models';
import { LOG_TYPES } from '../../data/logTypes';

const ClientDetail: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const dispatch = useAppDispatch();
  
  const client = useAppSelector(selectClientById(clientId || ''));
  const assignments = useAppSelector(selectAssignmentsByClient(clientId || ''));
  const entries = useAppSelector(selectEntriesByClient(clientId || ''));
  const [activeTab, setActiveTab] = useState<'assignments' | 'entries'>('assignments');

  const getLogTypeName = (logTypeId: string) => {
    const logType = LOG_TYPES.find(lt => lt.id === logTypeId);
    return logType?.name || logTypeId;
  };

  const toggleAssignmentStatus = (assignment: LogAssignment) => {
    dispatch(updateAssignmentRequested({ ...assignment, isActive: !assignment.isActive }));
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    if (confirm('Are you sure you want to remove this assignment?')) {
      dispatch(deleteAssignmentRequested(assignmentId));
    }
  };

  if (!client) {
    return (
      <div className="client-detail">
        <div className="empty-state card">
          <div className="empty-state-icon">❓</div>
          <div className="empty-state-title">Client not found</div>
          <p>The client you're looking for doesn't exist or has been deleted.</p>
          <Link to="/practitioner/clients" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="client-detail">
      <div className="page-header">
        <Link to="/practitioner/clients" className="back-link">← Back to Clients</Link>
        <div className="header-content">
          <div className="client-header-info">
            <div className="client-avatar-lg">
              {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h1>{client.name}</h1>
              <p className="client-email">{client.email}</p>
              {client.notes && <p className="client-notes">{client.notes}</p>}
            </div>
          </div>
          <div className="header-actions">
            <Link to={`/practitioner/clients/${client.id}/assign`} className="btn btn-primary">
              + Assign New Task
            </Link>
            <Link to={`/client/${client.id}`} className="btn btn-accent" target="_blank">
              Open Client Portal →
            </Link>
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card-sm">
          <div className="stat-value">{assignments.filter(a => a.isActive).length}</div>
          <div className="stat-label">Active Tasks</div>
        </div>
        <div className="stat-card-sm">
          <div className="stat-value">{assignments.length}</div>
          <div className="stat-label">Total Assignments</div>
        </div>
        <div className="stat-card-sm">
          <div className="stat-value">{entries.length}</div>
          <div className="stat-label">Log Entries</div>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments ({assignments.length})
        </button>
        <button 
          className={`tab ${activeTab === 'entries' ? 'active' : ''}`}
          onClick={() => setActiveTab('entries')}
        >
          Log Entries ({entries.length})
        </button>
      </div>

      {activeTab === 'assignments' && (
        <div className="tab-content">
          {assignments.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No assignments yet</div>
              <p>Assign logging tasks to this client</p>
              <Link to={`/practitioner/clients/${client.id}/assign`} className="btn btn-primary" style={{ marginTop: '16px' }}>
                + Assign Task
              </Link>
            </div>
          ) : (
            <div className="assignments-grid">
              {assignments.map(assignment => (
                <div key={assignment.id} className={`assignment-card card ${!assignment.isActive ? 'inactive' : ''}`}>
                  <div className="assignment-header">
                    <h3>{getLogTypeName(assignment.logTypeId)}</h3>
                    <span className={`badge ${assignment.isActive ? 'badge-primary' : 'badge-outline'}`}>
                      {assignment.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="assignment-details">
                    <div className="detail-row">
                      <span className="detail-label">Frequency:</span>
                      <span className="badge badge-accent">{assignment.frequency}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Started:</span>
                      <span>{new Date(assignment.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Entries:</span>
                      <span>{entries.filter((e: LogEntry) => e.assignmentId === assignment.id).length}</span>
                    </div>
                  </div>
                  <div className="assignment-actions">
                    <button 
                      className={`btn btn-sm ${assignment.isActive ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => toggleAssignmentStatus(assignment)}
                    >
                      {assignment.isActive ? 'Pause' : 'Activate'}
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'entries' && (
        <div className="tab-content">
          {entries.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-title">No log entries yet</div>
              <p>Entries will appear here when the client submits their logs</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Log Type</th>
                    <th>Submitted</th>
                    <th>Summary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.slice().reverse().map((entry: LogEntry) => (
                    <tr key={entry.id}>
                      <td>
                        <span className="badge badge-primary">
                          {getLogTypeName(entry.logTypeId)}
                        </span>
                      </td>
                      <td>{new Date(entry.submittedAt).toLocaleString()}</td>
                      <td className="entry-summary">
                        {Object.entries(entry.fields).slice(0, 3).map(([key, value]) => (
                          <span key={key} className="field-preview">
                            {key}: {String(value).substring(0, 30)}{String(value).length > 30 ? '...' : ''}
                          </span>
                        ))}
                      </td>
                      <td>
                        <Link to={`/practitioner/entries/${entry.id}`} className="btn btn-ghost btn-sm">View Details</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <style>{`
        .client-detail {
          padding: var(--spacing-lg);
          max-width: 1200px;
          margin: 0 auto;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          color: var(--color-text-light);
          margin-bottom: var(--spacing-md);
        }

        .back-link:hover {
          color: var(--color-primary);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .client-header-info {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-lg);
        }

        .client-avatar-lg {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .client-header-info h1 {
          margin: 0 0 var(--spacing-xs) 0;
        }

        .client-header-info .client-email {
          color: var(--color-text-muted);
          margin: 0;
        }

        .client-header-info .client-notes {
          color: var(--color-text-light);
          margin: var(--spacing-sm) 0 0 0;
          max-width: 400px;
        }

        .header-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .stats-row {
          display: flex;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .stat-card-sm {
          background: var(--color-surface);
          border: 2px solid var(--color-outline);
          border-radius: var(--radius-md);
          padding: var(--spacing-md) var(--spacing-lg);
          text-align: center;
          min-width: 120px;
        }

        .stat-card-sm .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .stat-card-sm .stat-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
        }

        .tabs {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-lg);
          border-bottom: 2px solid rgba(39, 67, 87, 0.1);
          padding-bottom: var(--spacing-sm);
        }

        .tab {
          background: none;
          border: none;
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: 1rem;
          font-weight: 500;
          color: var(--color-text-muted);
          cursor: pointer;
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          transition: all 0.2s ease;
        }

        .tab:hover {
          color: var(--color-text);
          background: rgba(39, 67, 87, 0.05);
        }

        .tab.active {
          color: var(--color-primary);
          border-bottom: 2px solid var(--color-primary);
          margin-bottom: -2px;
        }

        .assignments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--spacing-lg);
        }

        .assignment-card {
          display: flex;
          flex-direction: column;
        }

        .assignment-card.inactive {
          opacity: 0.7;
        }

        .assignment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .assignment-header h3 {
          margin: 0;
          font-size: 1rem;
        }

        .assignment-details {
          flex-grow: 1;
          margin-bottom: var(--spacing-md);
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-xs) 0;
          font-size: 0.875rem;
        }

        .detail-label {
          color: var(--color-text-muted);
        }

        .assignment-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .assignment-actions .btn {
          flex: 1;
        }

        .entry-summary {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .field-preview {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions .btn {
            flex: 1;
          }

          .stats-row {
            flex-wrap: wrap;
          }

          .stat-card-sm {
            flex: 1;
            min-width: 100px;
          }
        }
      `}</style>
    </div>
  );
};

export default ClientDetail;
