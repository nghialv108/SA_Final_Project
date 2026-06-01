import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { workspaceApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { slugify } from '../utils/slugify';

type WsRow = {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  role: string;
  workspace?: { _id?: string; id?: string; name: string };
};

export default function Workspaces() {
  const { setWorkspace, workspaceId } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<WsRow[]>([]);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    workspaceApi
      .mine()
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load workspaces'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const pick = (row: WsRow) => {
    const id = row._id ?? row.id ?? row.workspace?._id ?? row.workspace?.id;
    if (!id) return;
    setWorkspace(id);
    navigate('/');
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const created = await workspaceApi.create({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
      });
      setShowCreate(false);
      setName('');
      setSlug('');
      setSlugTouched(false);
      setDescription('');
      load();
      const id = created._id ?? created.id;
      if (id) {
        setWorkspace(id);
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Workspaces</h1>
          <button
            type="button"
            className="btn"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? 'Cancel' : 'Create workspace'}
          </button>
        </div>
        {error && <p className="error">{error}</p>}

        {showCreate && (
          <form onSubmit={onCreate} style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <label>
              <span className="label">Name</span>
              <input
                className="input"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="My Team"
                minLength={2}
                required
              />
            </label>
            <label>
              <span className="label">Slug</span>
              <input
                className="input"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="my-team"
                pattern="[a-z0-9-]+"
                title="Lowercase letters, numbers, and hyphens only"
                required
              />
            </label>
            <label>
              <span className="label">Description (optional)</span>
              <input
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this workspace for?"
              />
            </label>
            <button className="btn" type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Create and open'}
            </button>
          </form>
        )}
      </div>

      <div className="card">
        <h2>Your workspaces</h2>
        {list.length === 0 && !error && <p>No workspaces yet. Create one above.</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {list.map((row) => {
            const id = row._id ?? row.id ?? row.workspace?._id ?? row.workspace?.id ?? '';
            const wsName = row.name ?? row.workspace?.name ?? 'Workspace';
            return (
              <li key={id} className="hit">
                <strong>{wsName}</strong>
                {row.slug && <div className="muted">/{row.slug}</div>}
                <div>Role: {row.role}</div>
                <button
                  type="button"
                  className="btn"
                  style={{ marginTop: '0.5rem' }}
                  onClick={() => pick(row)}
                >
                  {workspaceId === id ? 'Selected' : 'Use this workspace'}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
