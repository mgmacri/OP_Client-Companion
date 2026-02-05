import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectClientById } from '../../features/clients/state/clientsSlice';
import { selectActiveAssignmentsByClient } from '../../features/assignments/state/assignmentsSlice';
import { addEntryRequested } from '../../features/entries/state/entriesSlice';
import { setCurrentClientId } from '../../services/storage';
import type { LogAssignment, LogType } from '../../types/models';
import { LOG_TYPES } from '../../data/logTypes';
import DynamicLogForm from '../../components/DynamicLogForm';

const ClientPortal: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const dispatch = useAppDispatch();
  
  const client = useAppSelector(selectClientById(clientId || ''));
  const assignments = useAppSelector(selectActiveAssignmentsByClient(clientId || ''));
  const [selectedAssignment, setSelectedAssignment] = useState<LogAssignment | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (clientId) {
      setCurrentClientId(clientId);
    }
  }, [clientId]);

  const getLogType = (logTypeId: string): LogType | undefined => {
    return LOG_TYPES.find(lt => lt.id === logTypeId);
  };

  const handleSubmitLog = (fields: Record<string, string | number | boolean>) => {
    if (!selectedAssignment || !clientId) return;

    dispatch(addEntryRequested({
      clientId,
      logTypeId: selectedAssignment.logTypeId,
      assignmentId: selectedAssignment.id,
      fields,
    }));

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setSelectedAssignment(null);
    }, 2000);
  };

  if (!client) {
    return (
      <div className="client-portal">
        <div className="portal-container">
          <div className="empty-state card">
            <div className="empty-state-icon">❓</div>
            <div className="empty-state-title">Client not found</div>
            <p>Please check the link or contact your practitioner.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="client-portal">
      <div className="portal-header">
        <div className="portal-brand">
          <span className="brand-icon">🧠</span>
          Client Companion
        </div>
        <div className="portal-user">
          <span className="user-name">{client.name}</span>
        </div>
      </div>

      <div className="portal-container">
        {submitSuccess ? (
          <div className="success-message card">
            <div className="success-icon">✓</div>
            <h2>Log Submitted Successfully!</h2>
            <p>Thank you for completing your log. Your practitioner will review it.</p>
          </div>
        ) : selectedAssignment ? (
          <div className="form-container">
            <button className="back-btn" onClick={() => setSelectedAssignment(null)}>
              ← Back to Tasks
            </button>
            <DynamicLogForm 
              logType={getLogType(selectedAssignment.logTypeId)!}
              onSubmit={handleSubmitLog}
              onCancel={() => setSelectedAssignment(null)}
            />
          </div>
        ) : (
          <>
            <div className="welcome-section">
              <h1>Welcome back, {client.name.split(' ')[0]}!</h1>
              <p>Here are your assigned logging tasks. Complete them as instructed by your practitioner.</p>
            </div>

            {assignments.length === 0 ? (
              <div className="empty-state card">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-title">No active tasks</div>
                <p>Your practitioner hasn't assigned any logging tasks yet.</p>
              </div>
            ) : (
              <div className="tasks-grid">
                {assignments.map(assignment => {
                  const logType = getLogType(assignment.logTypeId);
                  if (!logType) return null;
                  
                  return (
                    <div key={assignment.id} className="task-card card">
                      <div className="task-header">
                        <h2>{logType.name}</h2>
                        <span className="badge badge-accent">{assignment.frequency}</span>
                      </div>
                      <p className="task-description">
                        {logType.target_conditions.join(', ')}
                      </p>
                      <div className="task-info">
                        <div className="info-item">
                          <span className="info-label">Questions</span>
                          <span className="info-value">{logType.text_inputs.length + logType.metrics.length}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Est. Time</span>
                          <span className="info-value">~{Math.ceil((logType.text_inputs.length + logType.metrics.length) * 0.5)} min</span>
                        </div>
                      </div>
                      <button 
                        className="btn btn-primary btn-lg task-btn"
                        onClick={() => setSelectedAssignment(assignment)}
                      >
                        Start Log Entry
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .client-portal {
          min-height: 100vh;
          background-color: var(--color-background);
        }

        .portal-header {
          background-color: var(--color-outline);
          padding: var(--spacing-md) var(--spacing-lg);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .portal-brand {
          color: white;
          font-size: 1.25rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .brand-icon {
          font-size: 1.5rem;
        }

        .portal-user {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .user-name {
          color: white;
          font-weight: 500;
        }

        .portal-container {
          max-width: 900px;
          margin: 0 auto;
          padding: var(--spacing-xl) var(--spacing-lg);
        }

        .welcome-section {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .welcome-section h1 {
          margin-bottom: var(--spacing-sm);
          color: var(--color-text);
        }

        .welcome-section p {
          color: var(--color-text-light);
          font-size: 1.125rem;
          margin: 0;
        }

        .tasks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--spacing-lg);
        }

        .task-card {
          display: flex;
          flex-direction: column;
          text-align: center;
        }

        .task-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }

        .task-header h2 {
          margin: 0;
          font-size: 1.25rem;
        }

        .task-description {
          color: var(--color-text-muted);
          font-size: 0.875rem;
          margin: 0 0 var(--spacing-md) 0;
        }

        .task-info {
          display: flex;
          justify-content: center;
          gap: var(--spacing-xl);
          padding: var(--spacing-md) 0;
          border-top: 1px solid rgba(39, 67, 87, 0.1);
          border-bottom: 1px solid rgba(39, 67, 87, 0.1);
          margin-bottom: var(--spacing-lg);
        }

        .info-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .info-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .info-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .task-btn {
          width: 100%;
          margin-top: auto;
        }

        .form-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .back-btn {
          background: none;
          border: none;
          color: var(--color-text-light);
          font-size: 1rem;
          cursor: pointer;
          padding: 0;
          margin-bottom: var(--spacing-lg);
          display: flex;
          align-items: center;
        }

        .back-btn:hover {
          color: var(--color-primary);
        }

        .success-message {
          text-align: center;
          padding: var(--spacing-2xl);
        }

        .success-icon {
          width: 64px;
          height: 64px;
          background-color: var(--color-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto var(--spacing-lg) auto;
        }

        .success-message h2 {
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--color-primary);
        }

        .success-message p {
          color: var(--color-text-light);
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default ClientPortal;
