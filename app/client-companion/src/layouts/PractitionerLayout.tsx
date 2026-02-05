import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const PractitionerLayout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/practitioner' && location.pathname === '/practitioner') return true;
    if (path !== '/practitioner' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="practitioner-layout">
      <nav className="nav">
        <Link to="/practitioner" className="nav-brand">
          <span className="brand-icon">🧠</span>
          Client Companion
        </Link>
        <div className="nav-links">
          <Link 
            to="/practitioner" 
            className={`nav-link ${location.pathname === '/practitioner' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/practitioner/clients" 
            className={`nav-link ${isActive('/practitioner/clients') ? 'active' : ''}`}
          >
            Clients
          </Link>
        </div>
        <div className="nav-user">
          <span className="user-badge">Practitioner</span>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>

      <style>{`
        .practitioner-layout {
          min-height: 100vh;
          background-color: var(--color-background);
        }

        .nav {
          background-color: var(--color-outline);
          padding: var(--spacing-md) var(--spacing-lg);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-brand {
          color: white;
          font-size: 1.25rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          text-decoration: none;
        }

        .brand-icon {
          font-size: 1.5rem;
        }

        .nav-links {
          display: flex;
          gap: var(--spacing-sm);
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.7);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
          text-decoration: none;
          font-weight: 500;
        }

        .nav-link:hover {
          color: white;
          background-color: rgba(255, 255, 255, 0.1);
        }

        .nav-link.active {
          color: white;
          background-color: rgba(255, 255, 255, 0.15);
        }

        .nav-user {
          display: flex;
          align-items: center;
        }

        .user-badge {
          background-color: var(--color-primary);
          color: white;
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .main-content {
          min-height: calc(100vh - 60px);
        }

        @media (max-width: 768px) {
          .nav {
            flex-wrap: wrap;
            gap: var(--spacing-md);
          }

          .nav-links {
            order: 3;
            width: 100%;
            justify-content: center;
          }

          .nav-user {
            order: 2;
          }
        }
      `}</style>
    </div>
  );
};

export default PractitionerLayout;
