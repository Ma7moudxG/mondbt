"use client";
import React, { useState, useEffect } from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import DataService from "@/services/dataService";

const cm = (...classes: (string | boolean)[]) => classes.filter(Boolean).join(" ");

interface MainChartProps {
  regionId: number | null;
  startDate: Date;
  endDate: Date;
}

type ChartTab = 'Attendance' | 'Fines' | 'Late';


const MainChart = ({ regionId, startDate, endDate }: MainChartProps) => {
  const [chartTab, setChartTab] = useState<ChartTab>("Attendance");
  const [chartData, setChartData] = useState<Record<ChartTab, Array<{ name: string; value: number }>>>({
    Attendance: [],
    Fines: [],
    Late: []
  });

  useEffect(() => {
    if (!regionId) return;

    const loadChartData = () => {
      try {
        const dailyStats = DataService.getDailyStats(regionId, startDate, endDate);
        
        setChartData({
          Attendance: dailyStats.map(day => ({
            name: day.date_g,
            value: day.attendanceRate
          })),
          Fines: dailyStats.map(day => ({
            name: day.date_g,
            value: day.fines
          })),
          Late: dailyStats.map(day => ({
            name: day.date_g,
            value: day.late
          }))
        });
      } catch (error) {
        console.error("Error loading chart data:", error);
      }
    };

    loadChartData();
  }, [regionId, startDate, endDate]);

  const getBarColor = () => {
    switch(chartTab) {
      case 'Attendance': return '#5EB89D';
      case 'Fines': return '#8447AB';
      case 'Late': return '#2196F3';
      default: return '#5EB89D';
    }
  };

  return (
    <div className="flex flex-col h-[100%]">
      <div className="flex mb-4 flex-wrap justify-center gap-2">
        {(Object.keys(chartData) as ChartTab[]).map((tab) => (
          <button
            key={tab}
            className={cm(
              "px-4 py-2 rounded-full text-sm transition-colors",
              chartTab === tab
                ? "bg-[#5EB89D] text-white font-bold"
                : "text-gray-600 hover:bg-gray-200"
            )}
            onClick={() => setChartTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={chartData[chartTab]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={0} 
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 10 }}
          />
          <YAxis />
          <Bar 
            dataKey="value"
            fill={getBarColor()}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MainChart;