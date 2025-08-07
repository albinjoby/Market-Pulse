import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  color = "#3b82f6",
  width = 100,
  height = 40,
}) => {
  // Transform data into the format expected by Recharts
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  // Determine if trend is positive or negative
  const isPositive = data[data.length - 1] > data[0];
  const strokeColor = color || (isPositive ? "#10b981" : "#ef4444");

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparklineChart;
