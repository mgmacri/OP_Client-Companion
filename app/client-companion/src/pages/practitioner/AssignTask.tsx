import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getClientById, addAssignment, getAssignmentsByClient } from '../../services/storage';
import type { Client, LogAssignment } from '../../types/models';
import { LOG_TYPES } from '../../data/logTypes';

const AssignTask: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [existingAssignments, setExistingAssignments] = useState<LogAssignment[]>([]);
  const [selectedLogType, setSelectedLogType] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'as-needed'>('daily');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (clientId) {
      const foundClient = getClientById(clientId);
      if (foundClient) {
        setClient(foundClient);
        setExistingAssignments(getAssignmentsByClient(clientId));
      }
    }
  }, [clientId]);

  const isAlreadyAssigned = (logTypeId: string) => {
    return existingAssignments.some(a => a.logTypeId === logTypeId && a.isActive);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLogType || !clientId) return;

    const assignment: LogAssignment = {
      id: uuidv4(),
      clientId,
      logTypeId: selectedLogType,
      frequency,
      startDate: new Date(startDate).toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    addAssignment(assignment);
    navigate(`/practitioner/clients/${clientId}`);
  };

  if (!client) {
    return (
      <div className="assign-task">
        <div className="empty-state card">
          <div className="empty-state-icon">❓</div>
          <div className="empty-state-title">Client not found</div>
          <Link to="/practitioner/clients" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="assign-task">
      <div className="page-header">
        <Link to={`/practitioner/clients/${clientId}`} className="back-link">← Back to {client.name}</Link>
        <h1>Assign Logging Task</h1>
        <p>Select a log type to assign to {client.name}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Select Log Type</h2>
          <div className="log-types-grid">
            {LOG_TYPES.map(logType => {
              const assigned = isAlreadyAssigned(logType.id);
              return (
                <div 
                  key={logType.id}
                  className={`log-type-card card ${selectedLogType === logType.id ? 'selected' : ''} ${assigned ? 'assigned' : ''}`}
                  onClick={() => !assigned && setSelectedLogType(logType.id)}
                >
                  <div className="log-type-header">
                    <h3>{logType.name}</h3>
                    {assigned && <span className="badge badge-outline">Already Assigned</span>}
                  </div>
                  <div className="log-type-conditions">
                    {logType.target_conditions.map(condition => (
                      <span key={condition} className="badge badge-accent">{condition}</span>
                    ))}
                  </div>
                  <div className="log-type-fields">
                    <div className="fields-section">
                      <span className="fields-label">Text Inputs:</span>
                      <span className="fields-count">{logType.text_inputs.length}</span>
                    </div>
                    <div className="fields-section">
                      <span className="fields-label">Metrics:</span>
                      <span className="fields-count">{logType.metrics.length}</span>
                    </div>
                  </div>
                  {selectedLogType === logType.id && (
                    <div className="selected-indicator">✓ Selected</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selectedLogType && (
          <div className="form-section">
            <h2>Assignment Settings</h2>
            <div className="settings-card card">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="frequency">Frequency</label>
                  <select 
                    id="frequency" 
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as typeof frequency)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as-needed">As Needed</option>
                  </select>
                  <span className="form-help">How often should the client complete this log?</span>
                </div>
                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input 
                    id="startDate" 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="form-help">When should this assignment begin?</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <Link to={`/practitioner/clients/${clientId}`} className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={!selectedLogType}>
            Assign Task
          </button>
        </div>
      </form>

      <style>{`
        .assign-task {
          padding: var(--spacing-lg);
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: var(--spacing-xl);
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

        .page-header h1 {
          margin: 0 0 var(--spacing-xs) 0;
        }

        .page-header p {
          color: var(--color-text-light);
          margin: 0;
        }

        .form-section {
          margin-bottom: var(--spacing-xl);
        }

        .form-section h2 {
          margin-bottom: var(--spacing-lg);
          font-size: 1.25rem;
        }

        .log-types-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--spacing-lg);
        }

        .log-type-card {
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .log-type-card:hover:not(.assigned) {
          border-color: var(--color-primary);
          transform: translateY(-2px);
        }

        .log-type-card.selected {
          border-color: var(--color-primary);
          background-color: rgba(20, 156, 136, 0.05);
        }

        .log-type-card.assigned {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .log-type-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-md);
        }

        .log-type-header h3 {
          margin: 0;
          font-size: 1rem;
        }

        .log-type-conditions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-md);
        }

        .log-type-fields {
          display: flex;
          gap: var(--spacing-lg);
          padding-top: var(--spacing-md);
          border-top: 1px solid rgba(39, 67, 87, 0.1);
        }

        .fields-section {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.875rem;
        }

        .fields-label {
          color: var(--color-text-muted);
        }

        .fields-count {
          font-weight: 600;
          color: var(--color-text);
        }

        .selected-indicator {
          position: absolute;
          top: var(--spacing-md);
          right: var(--spacing-md);
          background-color: var(--color-primary);
          color: white;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .settings-card {
          max-width: 600px;
        }

        .form-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: flex-end;
          padding-top: var(--spacing-lg);
          border-top: 1px solid rgba(39, 67, 87, 0.1);
        }

        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .form-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AssignTask;
