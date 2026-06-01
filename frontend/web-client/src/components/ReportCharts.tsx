import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  todo: '#94a3b8',
  in_progress: '#3b82f6',
  in_review: '#8b5cf6',
  done: '#22c55e',
  blocked: '#ef4444',
};

function colorForStatus(status: string, index: number) {
  return STATUS_COLORS[status] ?? ['#0ea5e9', '#f59e0b', '#ec4899', '#14b8a6'][index % 4];
}

export type StatusRow = { status: string; count: number };

export function parseStatusRows(data: unknown): StatusRow[] {
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;
  const raw = obj.byStatus ?? obj;
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const row = item as Record<string, unknown>;
    const status = String(row.status ?? row._id ?? 'unknown');
    const count = Number(row.count ?? 0);
    return { status, count };
  });
}

export function parseOverdueList(data: unknown): Array<Record<string, unknown>> {
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;
  const list = obj.overdueTasks;
  return Array.isArray(list) ? (list as Array<Record<string, unknown>>) : [];
}

type StatusPieProps = {
  title: string;
  rows: StatusRow[];
};

export function StatusPieChart({ title, rows }: StatusPieProps) {
  if (rows.length === 0) {
    return <p className="chart-empty">No status data for this report.</p>;
  }

  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={rows}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            outerRadius={95}
            label={({ status, count }) => `${status}: ${count}`}
          >
            {rows.map((row, i) => (
              <Cell key={row.status} fill={colorForStatus(row.status, i)} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

type StatusBarProps = {
  title: string;
  rows: StatusRow[];
};

export function StatusBarChart({ title, rows }: StatusBarProps) {
  if (rows.length === 0) {
    return <p className="chart-empty">No status data for this report.</p>;
  }

  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="status" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]}>
            {rows.map((row, i) => (
              <Cell key={row.status} fill={colorForStatus(row.status, i)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type OverdueChartProps = {
  title: string;
  items: Array<Record<string, unknown>>;
};

export function OverdueBarChart({ title, items }: OverdueChartProps) {
  const byStatus = items.reduce<Record<string, number>>((acc, t) => {
    const status = String(t.status ?? 'unknown');
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  const rows: StatusRow[] = Object.entries(byStatus).map(([status, count]) => ({
    status,
    count,
  }));

  if (rows.length === 0) {
    return (
      <div className="chart-card">
        <h3>{title}</h3>
        <p className="chart-empty">No overdue tasks in this workspace.</p>
      </div>
    );
  }

  return <StatusBarChart title={title} rows={rows} />;
}
