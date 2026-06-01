import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { searchApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Search() {
  const { workspaceId } = useAuth();
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [results, setResults] = useState<
    Array<{ type: string; id: string; title: string; subtitle?: string }>
  >([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setError('');
    try {
      const data = await searchApi.find(q, type);
      setResults(data.results);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    }
  };

  if (!workspaceId) {
    return (
      <div className="card">
        <Link to="/workspaces">Select a workspace</Link>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h1>Search</h1>
        <form onSubmit={onSubmit}>
          <input
            className="input"
            placeholder="Search projects and tasks…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All</option>
            <option value="projects">Projects</option>
            <option value="tasks">Tasks</option>
          </select>
          <button className="btn" type="submit">
            Search
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <p>{total} result(s)</p>
      </div>
      <div className="card">
        {results.map((r) => (
          <div key={`${r.type}-${r.id}`} className="hit">
            <div className="hit-type">{r.type}</div>
            <strong>{r.title}</strong>
            {r.subtitle && <div>{r.subtitle}</div>}
          </div>
        ))}
      </div>
    </>
  );
}
