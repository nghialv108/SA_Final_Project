import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { logout, workspaceId } = useAuth();

  return (
    <>
      <nav className="nav">
        <strong>TaskFlow</strong>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/reports">Reports</NavLink>
        <NavLink to="/workspaces">Workspace</NavLink>
        <span className="nav-spacer" />
        <small>{workspaceId ? `WS: ${workspaceId.slice(-6)}` : 'No workspace'}</small>
        <button type="button" className="btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
