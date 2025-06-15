// src/components/AttendanceStatistics.tsx
"use client"; // Make sure this component is explicitly a client component
import React, { useState, useEffect } from "react"; // Import useState and useEffect
import Image from "next/image";
import { Gauge, gaugeClasses } from "@mui/x-charts";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface GroupStats {
  attendance: number;
  totalPossible: number;
}

interface AttendanceStatisticsProps {
  groupedStats: {
    all: GroupStats;
    male: GroupStats;
    female: GroupStats;
    primary: GroupStats;
    intermediate: GroupStats;
    secondary: GroupStats;
  };
}

const AttendanceStatistics: React.FC<AttendanceStatisticsProps> = ({
  groupedStats
}) => {
  const { t } = useTranslation(); // Initialize the translation hook

  // START: Hydration Fix - Mounted state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to ensure consistent translated text during SSR
  const getConsistentTranslatedText = (key: string) => {
    if (!mounted) {
      return key; // During SSR, return the key itself
    }
    return t(key); // After hydration, use the actual translation
  };
  // END: Hydration Fix

  // Calculate attendance rate for a group
  const calculateRate = (stats: GroupStats) => {
    return stats.totalPossible > 0 ?
      Math.round((stats.attendance / stats.totalPossible) * 100) : 0;
  };

  return (
    <div className="statistics-component-container grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
      {/* All Schools */}
      <StatCard
        titleKey="All Schools" // Pass translation key
        icon="/stats_attendance.svg"
        value={groupedStats.all.attendance}
        rate={calculateRate(groupedStats.all)}
        color="#5EB89D"
        getConsistentTranslatedText={getConsistentTranslatedText} // Pass helper
      />

      {/* Male Schools */}
      <StatCard
        titleKey="Male Schools" // Pass translation key
        icon="/stats_attendance.svg"
        value={groupedStats.male.attendance}
        rate={calculateRate(groupedStats.male)}
        color="#519E87"
        getConsistentTranslatedText={getConsistentTranslatedText} // Pass helper
      />

      {/* Female Schools */}
      <StatCard
        titleKey="Female Schools" // Pass translation key
        icon="/stats_attendance.svg"
        value={groupedStats.female.attendance}
        rate={calculateRate(groupedStats.female)}
        color="#448571"
        getConsistentTranslatedText={getConsistentTranslatedText} // Pass helper
      />

      {/* Primary Schools */}
      <StatCard
        titleKey="Primary Schools" // Pass translation key
        icon="/stats_attendance.svg"
        value={groupedStats.primary.attendance}
        rate={calculateRate(groupedStats.primary)}
        color="#5EB89D"
        getConsistentTranslatedText={getConsistentTranslatedText} // Pass helper
      />

      {/* Intermediate Schools */}
      <StatCard
        titleKey="Intermediate Schools" // Pass translation key
        icon="/stats_attendance.svg"
        value={groupedStats.intermediate.attendance}
        rate={calculateRate(groupedStats.intermediate)}
        color="#519E87"
        getConsistentTranslatedText={getConsistentTranslatedText} // Pass helper
      />

      {/* Secondary Schools */}
      <StatCard
        titleKey="Secondary Schools" // Pass translation key
        icon="/stats_attendance.svg"
        value={groupedStats.secondary.attendance}
        rate={calculateRate(groupedStats.secondary)}
        color="#448571"
        getConsistentTranslatedText={getConsistentTranslatedText} // Pass helper
      />
    </div>
  );
};

// Helper component for statistic cards
const StatCard: React.FC<{
  titleKey: string; // Changed to titleKey to indicate it's a translation key
  icon: string;
  value: number;
  rate: number;
  color: string;
  getConsistentTranslatedText: (key: string) => string; // Receive helper function
}> = ({ titleKey, icon, value, rate, color, getConsistentTranslatedText }) => (
  <div className="flex flex-col gap-2 items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div className="flex gap-2 items-center">
      <Image src={icon} alt={getConsistentTranslatedText(titleKey)} width={16} height={16} /> {/* Use helper for alt text */}
      <p className="text-sm font-medium">{getConsistentTranslatedText(titleKey)}</p> {/* Use helper for title */}
    </div>

    <div className="text-center">
      <p className="text-xl font-bold">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500">{getConsistentTranslatedText("Attendance")}</p> {/* Translate "Attendance" */}
    </div>

    <div className="w-full max-w-[120px]">
      <Gauge
        value={rate}
        valueMax={100}
        startAngle={-180}
        endAngle={180}
        innerRadius="60%"
        outerRadius="90%"
        cornerRadius="50%"
        sx={{
          [`& .${gaugeClasses.valueText}`]: {
            fontSize: 22,
            transform: "translate(0px, 0px)",
          },
          [`& .${gaugeClasses.valueArc}`]: {
            fill: color,
          },
          [`& .${gaugeClasses.referenceArc}`]: {
            fill: "#E2E2E2",
          },
        }}
        text={({ value }) => `${value}%`}
      />
    </div>
  </div>
);

export default AttendanceStatistics;