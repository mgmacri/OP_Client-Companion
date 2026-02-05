import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLogEntries, getClientById } from '../../services/storage';
import type { LogEntry, Client } from '../../types/models';
import { LOG_TYPES } from '../../data/logTypes';

const EntryDetail: React.FC = () => {
  const { entryId } = useParams<{ entryId: string }>();
  const [entry, setEntry] = useState<LogEntry | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (entryId) {
      const entries = getLogEntries();
      const foundEntry = entries.find(e => e.id === entryId);
      if (foundEntry) {
        setEntry(foundEntry);
        const foundClient = getClientById(foundEntry.clientId);
        if (foundClient) {
          setClient(foundClient);
        }
      }
    }
  }, [entryId]);

  const getLogType = (logTypeId: string) => {
    return LOG_TYPES.find(lt => lt.id === logTypeId);
  };

  if (!entry) {
    return (
      <div className="entry-detail">
        <div className="container">
          <div className="empty-state card">
            <div className="empty-state-icon">❓</div>
            <div className="empty-state-title">Entry not found</div>
            <p>The log entry you're looking for doesn't exist or has been deleted.</p>
            <Link to="/practitioner" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const logType = getLogType(entry.logTypeId);

  return (
    <div className="entry-detail">
      <div className="container">
        <Link to={client ? `/practitioner/clients/${client.id}` : '/practitioner'} className="back-link">
          ← Back to {client?.name || 'Dashboard'}
        </Link>

        <div className="entry-header card">
          <div className="header-top">
            <div>
              <span className="badge badge-primary">{logType?.name || entry.logTypeId}</span>
              <h1>Log Entry Details</h1>
              <p className="entry-meta">
                Submitted on {new Date(entry.submittedAt).toLocaleString()}
              </p>
            </div>
            {client && (
              <div className="client-info">
                <div className="client-avatar">
                  {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <div className="client-name">{client.name}</div>
                  <div className="client-email">{client.email}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="entry-content">
          {logType && (
            <>
              {/* Text Inputs Section */}
              {logType.text_inputs.length > 0 && (
                <div className="section card">
                  <h2>Responses</h2>
                  <div className="fields-list">
                    {logType.text_inputs.map(input => {
                      const value = entry.fields[input.key];
                      return (
                        <div key={input.key} className="field-item">
                          <label>{input.label}</label>
                          <div className="field-value">
                            {value !== undefined && value !== '' ? String(value) : <span className="empty-value">Not provided</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Metrics Section */}
              {logType.metrics.length > 0 && (
                <div className="section card">
                  <h2>Metrics</h2>
                  <div className="metrics-grid">
                    {logType.metrics.map(metric => {
                      const value = entry.fields[metric.key];
                      const numValue = Number(value);
                      const percentage = metric.max !== null 
                        ? ((numValue - metric.min) / (metric.max - metric.min)) * 100
                        : null;
                      
                      return (
                        <div key={metric.key} className="metric-item">
                          <div className="metric-header">
                            <span className="metric-label">{metric.label}</span>
                            <span className="metric-value">
                              {value !== undefined ? String(value) : '—'} 
                              <span className="metric-unit">{metric.unit}</span>
                            </span>
                          </div>
                          {percentage !== null && (
                            <div className="metric-bar">
                              <div 
                                className="metric-fill" 
                                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                              />
                            </div>
                          )}
                          <div className="metric-range">
                            Range: {metric.min} - {metric.max !== null ? metric.max : '∞'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Raw Data Section */}
          <div className="section card">
            <h2>All Data</h2>
            <div className="raw-data">
              <table>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(entry.fields).map(([key, value]) => (
                    <tr key={key}>
                      <td className="field-key">{key.replace(/_/g, ' ')}</td>
                      <td className="field-val">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .entry-detail {
          padding: var(--spacing-lg);
          max-width: 900px;
          margin: 0 auto;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          color: var(--color-text-light);
          margin-bottom: var(--spacing-lg);
          text-decoration: none;
        }

        .back-link:hover {
          color: var(--color-primary);
        }

        .entry-header {
          margin-bottom: var(--spacing-lg);
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--spacing-lg);
        }

        .entry-header h1 {
          margin: var(--spacing-sm) 0 var(--spacing-xs) 0;
          font-size: 1.5rem;
        }

        .entry-meta {
          color: var(--color-text-muted);
          margin: 0;
          font-size: 0.875rem;
        }

        .client-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(39, 67, 87, 0.05);
          border-radius: var(--radius-md);
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

        .client-name {
          font-weight: 600;
          color: var(--color-text);
        }

        .client-email {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .section {
          margin-bottom: var(--spacing-lg);
        }

        .section h2 {
          font-size: 1rem;
          margin: 0 0 var(--spacing-lg) 0;
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid rgba(39, 67, 87, 0.1);
        }

        .fields-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .field-item label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
          margin-bottom: var(--spacing-xs);
        }

        .field-value {
          font-size: 1rem;
          color: var(--color-text);
          background: rgba(39, 67, 87, 0.03);
          padding: var(--spacing-md);
          border-radius: var(--radius-sm);
          border-left: 3px solid var(--color-primary);
        }

        .empty-value {
          color: var(--color-text-muted);
          font-style: italic;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-lg);
        }

        .metric-item {
          background: rgba(39, 67, 87, 0.03);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: var(--spacing-sm);
        }

        .metric-label {
          font-weight: 500;
          color: var(--color-text);
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .metric-unit {
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--color-text-muted);
          margin-left: 2px;
        }

        .metric-bar {
          height: 8px;
          background: rgba(39, 67, 87, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: var(--spacing-xs);
        }

        .metric-fill {
          height: 100%;
          background: linear-gradient(to right, var(--color-primary), var(--color-accent));
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .metric-range {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .raw-data table {
          width: 100%;
        }

        .field-key {
          text-transform: capitalize;
          font-weight: 500;
        }

        .field-val {
          color: var(--color-text-light);
        }

        @media (max-width: 768px) {
          .header-top {
            flex-direction: column;
          }

          .client-info {
            width: 100%;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EntryDetail;
