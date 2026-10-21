import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

export default function RevenueChart({ data }) {
  if (!data || !data.length) return null;
  return (
    <ResponsiveContainer width={400} height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#5A554E' }} axisLine={false} tickLine={false} />
        <YAxis hide tick={{ fontSize: 11, fill: '#5A554E' }} axisLine={false} tickLine={false} />
        <Bar dataKey="revenue" fill="#7FA356" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
