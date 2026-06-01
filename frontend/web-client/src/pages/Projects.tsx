import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bffApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { workspaceId } = useAuth();
  const [projects, setProjects] = useState<unknown[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!workspaceId) return;
    bffApi
      .projects()
      .then(setProjects)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load projects'));
  }, [workspaceId]);

  if (!workspaceId) {
    return (
      <div className="card">
        <Link to="/workspaces">Select a workspace</Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>Projects</h1>
      {error && <p className="error">{error}</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {(projects as Array<Record<string, unknown>>).map((p) => (
          <li key={String(p.projectId ?? p._id)} className="hit">
            <strong>{String(p.name ?? 'Project')}</strong>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {String(p.visibility ?? '')}
            </div>
          </li>
        ))}
      </ul>
      {projects.length === 0 && !error && <p>No projects in this workspace.</p>}
    </div>
  );
}
