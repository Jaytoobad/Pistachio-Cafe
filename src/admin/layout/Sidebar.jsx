import { NavLink } from 'react-router-dom';

export default function Sidebar({ links, user, onLogout }) {
  return (
    <aside className="admin-sidebar" aria-label="Admin navigation">
      <div className="admin-brand">Pistachio Café</div>
      <nav>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/admin'}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <span className="user-email" title={user?.email || ''}>{user?.email || 'Signed in'}</span>
        <button className="admin-logout" onClick={onLogout}>Logout</button>
      </div>
    </aside>
  );
}