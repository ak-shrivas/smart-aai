import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Converts range entries to daily datapoints
function expandHistoryToDailyPoints(history) {
  const expanded = [];

  history.forEach(({ price, firstSeen, lastSeen }) => {
    const start = new Date(new Date(firstSeen || new Date()).setHours(0, 0, 0, 0));
    const end = new Date(new Date(lastSeen || new Date()).setHours(0, 0, 0, 0));
    const current = new Date(start);

    while (current <= end) {
      expanded.push({
        // Use local timezone formatted YYYY-MM-DD
        date: current.toLocaleDateString('en-CA'), // 'YYYY-MM-DD'
        price,
      });
      current.setDate(current.getDate() + 1);
    }
  });

  return expanded.sort((a, b) => new Date(a.date) - new Date(b.date));
}


export default function PriceChart({ history }) {
  const chartData = expandHistoryToDailyPoints(history);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis
            dataKey="date"
            tickFormatter={(tick) =>
              new Date(tick).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })
            }
            fontSize={12}
            angle={-45}
            textAnchor="end"
          />
          <YAxis domain={['auto', 'auto']} fontSize={12} />
          <Tooltip
            formatter={(value) => `₹${value}`}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })
            }
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
