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

type ChartTab = 'Attendance' | 'Fines' | 'Late' | 'Permissions';

const MainChart = ({ regionId, startDate, endDate }: MainChartProps) => {
  const { t, i18n } = useTranslation();

  const [mounted, setMounted] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0); // State to track screen width

  useEffect(() => {
    setMounted(true);
    setScreenWidth(window.innerWidth);

    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getConsistentTranslatedText = (key: string) => {
    if (!mounted) {
      return key;
    }
    return t(key);
  };

  const [chartTab, setChartTab] = useState<ChartTab>("Attendance");
  const [chartData, setChartData] = useState<Record<ChartTab, Array<{ name: string; value: number }>>>({
    Attendance: [],
    Fines: [],
    Late: [],
    Permissions: []
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
          Late: dailyStats.map(day => ({
            name: day.date_g,
            value: day.late
          })),
          Fines: dailyStats.map(day => ({
            name: day.date_g,
            value: day.fines
          })),
          Permissions: dailyStats.map(day => ({
            name: day.date_g,
            value: day.late
          })),
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
      case 'Permissions': return '#ffb34f';
      default: return '#5EB89D';
    }
  };

  const getYAxisLabel = () => {
    switch(chartTab) {
      case 'Attendance': return getConsistentTranslatedText('Attendance Rate');
      case 'Fines': return getConsistentTranslatedText('Amount (SAR)');
      case 'Late': return getConsistentTranslatedText('Late Students');
      case 'Permissions': return getConsistentTranslatedText('Permission');
      default: return '';
    }
  };

  const isMobile = screenWidth < 1000; // Define what constitutes a 'mobile' screen

  // Calculate dynamic width for the chart content based on number of data points
  // Assuming each bar + label needs about 60-70px on mobile for clarity
  const minChartWidth = chartData[chartTab].length * (isMobile ? 70 : 0) ; // Adjust 70 as needed. 0 for desktop as ResponsiveContainer handles it.
  const dynamicWidth = isMobile && minChartWidth > screenWidth ? minChartWidth : '100%'; // Only apply minChartWidth if it's mobile and exceeds screen width

  // Reset X-axis props as we are now overflowing/scrolling instead of compacting
  const xAxisAngle = 0; // No rotation
  const xAxisTextAnchor = "middle"; // Center labels
  const xAxisInterval = 0; // Show all ticks
  const xAxisTickFontSize = 10; // Standard font size
  const chartMargins = {
    top: 20,
    right: 20,
    left: 70, // Keep this for Y-axis label space
    bottom: 5,
  };

  const formatXAxisDate = (tickItem: string) => {
    if (!mounted) {
      return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: '2-digit',
      }).format(new Date(tickItem));
    }

    const date = new Date(tickItem);
    if (isNaN(date.getTime())) {
      return tickItem;
    }

    if (i18n.language === 'ar') {
      // Use short month names, no longer "narrow" if not compacting
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'short',
      }).format(date);
    } else {
      // Standard 2-digit month/day
      return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: '2-digit',
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
            {getConsistentTranslatedText(tab)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto w-full">
        <ResponsiveContainer
          width={dynamicWidth} // Use dynamicWidth here
          height={600} // Set a fixed height for the chart to manage vertical space
                               // You can adjust 300px to whatever looks good
        >
          <BarChart
            data={chartData[chartTab]}
            margin={chartMargins}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={xAxisAngle}
              textAnchor={xAxisTextAnchor}
              interval={xAxisInterval}
              tick={{ fontSize: xAxisTickFontSize }}
              tickFormatter={formatXAxisDate}
            />
            <YAxis
              width={60}
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
    </div>
  );
};

export default MainChart;