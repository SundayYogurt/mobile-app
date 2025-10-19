import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";

export default function PinkGraph({ data, lines = [], height = 250 }) {
  return (
    <div
      className="flex justify-center items-center w-full"
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: "10px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "800px", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {/* Enable horizontal zoom + pan via Brush */}
            <Brush dataKey="name" height={24} travellerWidth={8} stroke="#FF66C4" />
            {lines.map((line, i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                strokeWidth={3}
                dot={{ r: 4 }}
                name={line.label}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
