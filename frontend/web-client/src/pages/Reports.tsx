import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  OverdueBarChart,
  parseOverdueList,
  parseStatusRows,
  StatusBarChart,
  StatusPieChart,
} from '../components/ReportCharts';
import { bffApi, reportApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Reports() {
  const { workspaceId } = useAuth();
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [projectId, setProjectId] = useState('');
  const [projectReport, setProjectReport] = useState<Record<string, unknown> | null>(null);
  const [projects, setProjects] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingProject, setLoadingProject] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    bffApi.projects().then((list) => setProjects(list as Array<Record<string, unknown>>)).catch(() => {});
  }, [workspaceId]);

  const loadSummary = async () => {
    setError('');
    setLoadingSummary(true);
    try {
      const data = await reportApi.workspaceSummary();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report failed');
    } finally {
      setLoadingSummary(false);
    }
  };

  const onProjectReport = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setError('');
    setLoadingProject(true);
    try {
      const data = await reportApi.projectStatus(projectId);
      setProjectReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Project report failed');
    } finally {
      setLoadingProject(false);
    }
  };

  if (!workspaceId) {
    return (
      <div className="card">
        <Link to="/workspaces">Select a workspace</Link>
      </div>
    );
  }

  const overdueItems = summary ? parseOverdueList(summary) : [];
  const statusRows = projectReport ? parseStatusRows(projectReport) : [];

  return (
    <>
      <div className="card">
        <h1>Reports & analytics</h1>
        <p className="muted">Statistical views from the C# report service (core analytics).</p>
        {error && <p className="error">{error}</p>}
        <button type="button" className="btn" onClick={loadSummary} disabled={loadingSummary}>
          {loadingSummary ? 'Loading…' : 'Load workspace summary'}
        </button>
      </div>

      {summary && (
        <div className="chart-grid">
          <OverdueBarChart title="Overdue tasks by status" items={overdueItems} />
          <div className="chart-card">
            <h3>Summary</h3>
            <ul className="stat-list">
              <li>
                <span>Workspace</span>
                <strong>{String(summary.workspaceId ?? workspaceId)}</strong>
              </li>
              <li>
                <span>Overdue count</span>
                <strong>{overdueItems.length}</strong>
              </li>
              <li>
                <span>Generated</span>
                <strong>{String(summary.generatedAt ?? '—')}</strong>
              </li>
            </ul>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Project status</h2>
        <form onSubmit={onProjectReport} className="report-form">
          <select
            className="input"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">Select project</option>
            {projects.map((p) => {
              const id = String(p.projectId ?? p._id ?? '');
              return (
                <option key={id} value={id}>
                  {String(p.name ?? id)}
                </option>
              );
            })}
          </select>
          <button className="btn" type="submit" disabled={!projectId || loadingProject}>
            {loadingProject ? 'Generating…' : 'Generate report'}
          </button>
        </form>
      </div>

      {projectReport && (
        <div className="chart-grid">
          <StatusPieChart title="Tasks by status" rows={statusRows} />
          <StatusBarChart title="Task count per status" rows={statusRows} />
        </div>
      )}
    </>
  );
}
