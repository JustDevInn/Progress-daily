import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../ui/Card';

export function ExerciseChart({ title, data, dataKey, unit = '', domain }) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-zinc-50">{title}</h2>
        <span className="text-xs font-semibold text-zinc-500">{unit}</span>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`${dataKey}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" stroke="#71717a" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis stroke="#71717a" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} domain={domain} />
            <Tooltip
              cursor={{ stroke: '#34d399', strokeWidth: 1 }}
              contentStyle={{
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: 8,
                color: '#f4f4f5',
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="#34d399"
              strokeWidth={3}
              fill={`url(#${dataKey}-fill)`}
              dot={{ fill: '#34d399', strokeWidth: 0, r: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
