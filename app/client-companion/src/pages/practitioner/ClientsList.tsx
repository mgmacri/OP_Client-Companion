import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { selectClients, addClientRequested, deleteClientRequested } from '../../features/clients/state/clientsSlice';
import type { Client } from '../../types/models';

const ClientsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const clients = useAppSelector(selectClients);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', notes: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name.trim() || !newClient.email.trim()) return;

    dispatch(addClientRequested({
      name: newClient.name.trim(),
      email: newClient.email.trim(),
      notes: newClient.notes.trim() || undefined,
    }));

    setNewClient({ name: '', email: '', notes: '' });
    setShowAddModal(false);
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Are you sure you want to delete this client? This will also delete all their assignments and log entries.')) {
      dispatch(deleteClientRequested(clientId));
    }
  };

  const filteredClients = clients.filter((client: Client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="clients-page">
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p>Manage your client list</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Add New Client
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search clients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredClients.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">
            {searchTerm ? 'No clients found' : 'No clients yet'}
          </div>
          <p>{searchTerm ? 'Try a different search term' : 'Add your first client to get started'}</p>
          {!searchTerm && (
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ marginTop: '16px' }}>
              + Add Client
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Notes</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr key={client.id}>
                  <td>
                    <div className="client-name-cell">
                      <div className="client-avatar-sm">
                        {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <strong>{client.name}</strong>
                    </div>
                  </td>
                  <td>{client.email}</td>
                  <td className="notes-cell">{client.notes || '—'}</td>
                  <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/practitioner/clients/${client.id}`} className="btn btn-ghost btn-sm">
                        View
                      </Link>
                      <Link to={`/practitioner/clients/${client.id}/assign`} className="btn btn-primary btn-sm">
                        Assign
                      </Link>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Client</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddClient}>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter client's full name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter client's email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="notes">Notes (Optional)</label>
                <textarea
                  id="notes"
                  value={newClient.notes}
                  onChange={(e) => setNewClient(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this client"
                  rows={3}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .clients-page {
          padding: var(--spacing-lg);
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-xl);
        }

        .page-header h1 {
          margin-bottom: var(--spacing-xs);
        }

        .page-header p {
          color: var(--color-text-light);
          margin: 0;
        }

        .search-bar {
          margin-bottom: var(--spacing-lg);
        }

        .search-bar input {
          max-width: 400px;
        }

        .client-name-cell {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .client-avatar-sm {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .notes-cell {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--color-text-muted);
        }

        .action-buttons {
          display: flex;
          gap: var(--spacing-xs);
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: var(--spacing-md);
          }

          .search-bar input {
            max-width: 100%;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ClientsList;
