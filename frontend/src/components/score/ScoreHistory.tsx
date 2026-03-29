import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { ScoreHistoryItem } from '../../types';
import { getGrade, getScoreBgClass } from '../../utils/scoreColor';
import { Card } from '../ui/Card';

interface ScoreHistoryProps {
  history: ScoreHistoryItem[];
}

export const ScoreHistory = ({ history }: ScoreHistoryProps) => {
  const chartData = [...history]
    .reverse()
    .map((item) => ({
      ...item,
      formattedDate: new Date(item.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short'
      }),
      fullDate: new Date(item.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }));

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Your Score History</h2>
            <p className="mt-1 text-sm text-muted">Track how your money habits improve over time.</p>
          </div>
        </div>

        {history.length <= 1 ? (
          <div className="rounded-3xl border border-border bg-slate-900/60 p-8 text-center text-muted">
            Take another assessment in 30 days to track your progress.
          </div>
        ) : (
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" stroke="#94A3B8" />
                <YAxis domain={[0, 100]} stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: 16,
                    color: '#fff'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)} score`, 'Score']}
                  labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullDate ?? ''}
                />
                <Line type="monotone" dataKey="totalScore" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-display text-xl font-bold text-white">Past Assessments</h3>
        <div className="mt-5 overflow-hidden rounded-3xl border border-border">
          <table className="min-w-full divide-y divide-border text-left text-sm">
            <thead className="bg-slate-900/80 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Grade</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-slate-900/40">
              {history.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4 text-white">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-4 text-white">{item.totalScore.toFixed(1)}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getScoreBgClass(item.totalScore)}`}>
                      {getGrade(item.totalScore)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Link to={`/results/${item.id}`} className="font-semibold text-amber transition hover:text-amber/80">
                      View Report
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
