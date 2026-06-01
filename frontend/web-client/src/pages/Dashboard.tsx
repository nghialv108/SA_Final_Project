import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bffApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { workspaceId } = useAuth();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!workspaceId) return;
    bffApi
      .dashboard()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load dashboard'));
  }, [workspaceId]);

  if (!workspaceId) {
    return (
      <div className="card">
        <p>Choose a workspace first.</p>
        <Link to="/workspaces">Go to workspaces</Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>Dashboard</h1>
      {error && <p className="error">{error}</p>}
      {data && (
        <pre style={{ overflow: 'auto', fontSize: '0.85rem' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
      {!data && !error && <p>Loading…</p>}
    </div>
  );
}
