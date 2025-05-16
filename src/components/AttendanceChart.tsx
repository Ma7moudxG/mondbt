"use client";
import Image from "next/image";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Total",
    count: 100,
    fill: "white",
  },
  {
    name: "Attendance",
    count: 80,
    fill: "#5EB89D",
  },
];

const CountChart = () => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* CHART */}
      <div className="relative w-full h-[75%]">
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={36}
            data={data}
          >
            <RadialBar background dataKey="count" />
          </RadialBarChart>
        </ResponsiveContainer>
        <h1 className="text-2xl text-[#5EB89D] font-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            80%
        </h1>
      </div>
      {/* BOTTOM */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 rounded-full" />
          <h1 className="font-bold text-white">1</h1>
          <h2 className="text-xs text-white">test</h2>
        </div>
      </div>
    </div>
  );
};

export default CountChart;