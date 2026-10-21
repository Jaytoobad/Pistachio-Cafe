import { Outlet, useLocation } from 'react-router-dom';

export default function PageShell({ title, sub, primary, filters }) {
  return (
    <div className="page page-shell">
      <div className="page-header">
        <div>
          {title && <h1>{title}</h1>}
          {sub && <p className="page-sub">{sub}</p>}
        </div>
        {primary && <div className="page-header-actions">{primary}</div>}
      </div>
      {filters && <div className="filters">{filters}</div>}
      <div className="page-body">
        <Outlet />
      </div>
    </div>
  );
}
