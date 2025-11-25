import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/tickets', label: 'Tickets', icon: '🎫' },
    { path: '/clients', label: 'Clients', icon: '👥' },
    { path: '/contacts', label: 'Contacts', icon: '📇' },
    { path: '/remote', label: 'Remote Support', icon: '🖥️' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/assets', label: 'Assets', icon: '💻' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="nav-brand">
        <h1>HKMSP</h1>
        <p className="tagline">IT Managed Service Provider</p>
      </div>

      {user && (
        <div className="user-info">
          <div className="user-avatar">
            {user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{user.email || 'User'}</span>
            <span className="user-role role-admin">👑 Admin</span>
          </div>
        </div>
      )}

      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="nav-footer">
        <button onClick={handleLogout} className="logout-button">
          <span className="icon">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
