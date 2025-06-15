"use client";
import React, { useState, useEffect } from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Label } from "recharts";
import DataService from "@/services/dataService";
import { useTranslation } from "react-i18next";

const cm = (...classes: (string | boolean)[]) => classes.filter(Boolean).join(" ");

interface MainChartProps {
  regionId: number | null;
  startDate: Date;
  endDate: Date;
}

type ChartTab = 'Attendance' | 'Fines' | 'Late';

const MainChart = ({ regionId, startDate, endDate }: MainChartProps) => {
  const { t, i18n } = useTranslation();

  // START: Hydration Fix - Mounted state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper for consistent translated text in JSX
  const getConsistentTranslatedText = (key: string) => {
    if (!mounted) {
      return key; // During SSR, return the key itself
    }
    return t(key); // After hydration, use the actual translation
  };
  // END: Hydration Fix

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
            name: day.date_g, // 'name' still holds the Gregorian date string
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

  const getYAxisLabel = () => {
    // Use the hydration helper for Y-axis labels
    switch(chartTab) {
      case 'Attendance': return getConsistentTranslatedText('Attendance Rate');
      case 'Fines': return getConsistentTranslatedText('Amount (SAR)');
      case 'Late': return getConsistentTranslatedText('Late Students');
      default: return '';
    }
  };

  // Function to format X-axis dates
  const formatXAxisDate = (tickItem: string) => {
    // Crucial: Only apply i18n formatting after hydration
    if (!mounted) {
      return new Intl.DateTimeFormat('en-US', { // Always use a consistent format for SSR
        day: '2-digit',
        month: '2-digit',
      }).format(new Date(tickItem));
    }

    const date = new Date(tickItem); // Convert the date string to a Date object

    if (isNaN(date.getTime())) {
      return tickItem; // Return original if invalid date
    }

    if (i18n.language === 'ar') {
      // Format as Hijri date (Um Al-Qura calendar)
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'short', // 'short' gives abbreviated month names (e.g., محرم)
      }).format(date);
    } else {
      // Format as Gregorian date (Month/Day, e.g., 05/08)
      return new Intl.DateTimeFormat('en-US', {
        day: '2-digit', // Ensure two digits for day
        month: '2-digit', // Ensure two digits for month
      }).format(date);
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
            {getConsistentTranslatedText(tab)} {/* Use helper for tab names */}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={chartData[chartTab]}
          margin={{
            top: 20,
            right: 20,
            left: 70, // Increased to 70 for Y-axis padding
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={0}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 8 }}
            tickFormatter={formatXAxisDate}
          />
          <YAxis
            width={60} // Fixed width for Y-Axis
          >
            <Label
              value={getYAxisLabel()}
              angle={-90}
              position="left"
              style={{ textAnchor: 'middle', fontSize: '20px', fill: '#666' }}
              dx={-40}
            />
          </YAxis>
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