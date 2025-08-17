// src/components/AttendanceStatistics.tsx
"use client"; // Make sure this component is explicitly a client component
import React, { useState, useEffect } from "react"; // Import useState and useEffect
import Image from "next/image";
import { Gauge, gaugeClasses } from "@mui/x-charts";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface GroupStats {
  late: number;
  totalPossible: number;
}

interface LateStatisticsProps {
  groupedStats: {
    all: GroupStats;
    male: GroupStats;
    female: GroupStats;
    primary: GroupStats;
    intermediate: GroupStats;
    secondary: GroupStats;
  };
}

const LateStatistics: React.FC<LateStatisticsProps> = ({ groupedStats }) => {
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
    return stats.totalPossible > 0
      ? Math.round((stats.late / stats.totalPossible) * 100)
      : 0;
  };

  return (
    <div className="statistics-component-container grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
      {/* All Schools */}
      <StatCard
        titleKey="All Schools" // Pass translation key
        icon="/stats_attendance.svg"
        value={groupedStats.all.late * 10}
        rate={calculateRate(groupedStats.all)}
        color="#5EB89D"
        getConsistentTranslatedText={getConsistentTranslatedText} // Pass helper
      />

      {/* Male Schools */}
      <StatCard
        titleKey="Male Schools" // Pass translation key
        icon="/stats_attendance.svg"
        value={groupedStats.male.late * 10}
        rate={calculateRate(groupedStats.male)}
        color="#519E87"
        getConsistentTranslatedText={getConsistentTranslatedText} // Pass helper
      />

      {/* Female Schools */}
      <StatCard
        titleKey="Female Schools" // Pass translation key
        icon="/stats_attendance.svg"
        value={groupedStats.female.late * 10}
        rate={calculateRate(groupedStats.female)}
        color="#448571"
        getConsistentTranslatedText={getConsistentTranslatedText} // Pass helper
      />

      {/* Primary Schools */}
      <StatCard
        titleKey="Primary Schools" // Pass translation key
        icon="/stats_attendance.svg"
        value={groupedStats.primary.late * 10}
        rate={calculateRate(groupedStats.primary)}
        color="#5EB89D"
        getConsistentTranslatedText={getConsistentTranslatedText} // Pass helper
      />

      {/* Intermediate Schools */}
      <StatCard
        titleKey="Intermediate Schools" // Pass translation key
        icon="/stats_attendance.svg"
        value={groupedStats.intermediate.late * 10}
        rate={calculateRate(groupedStats.intermediate)}
        color="#519E87"
        getConsistentTranslatedText={getConsistentTranslatedText} // Pass helper
      />

      {/* Secondary Schools */}
      <StatCard
        titleKey="Secondary Schools" // Pass translation key
        icon="/stats_attendance.svg"
        value={groupedStats.secondary.late * 10}
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
}> = ({ titleKey, icon, value, rate, color, getConsistentTranslatedText }) => {
  const handleExport = ( titleKey: string) => {
    
      const BOM = "\ufeff";
  
      const csvContent = [
        [
          getConsistentTranslatedText("Metric"), // Use helper
          getConsistentTranslatedText("Category"), // Use helper
          getConsistentTranslatedText("Value"), // Use helper
          getConsistentTranslatedText("Number"), // Use helper
          // getConsistentTranslatedText("Start Date"), // Use helper
          // getConsistentTranslatedText("End Date"), // Use helper
        ],
        [
          getConsistentTranslatedText("Late"), // Use helper
          getConsistentTranslatedText(titleKey), // Use helper
          `${rate} %`,
          value, // Use helper
        ],
        
      ]
        .map((row) => row.join(","))
        .join("\n");
  
      // Prepend the BOM to the CSV content
      const finalCsvContent = BOM + csvContent;
  
      const blob = new Blob([finalCsvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${getConsistentTranslatedText("report")}_${ // Use helper
        getConsistentTranslatedText("all") // Use helper
      }_${new Date().getTime()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

  return (
    <div className="flex flex-col gap-2 items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex gap-2 items-center">
        <Image
          src={icon}
          alt={getConsistentTranslatedText(titleKey)}
          width={16}
          height={16}
        />{" "}
        {/* Use helper for alt text */}
        <p className="text-sm font-medium">
          {getConsistentTranslatedText(titleKey)}
        </p>{" "}
        {/* Use helper for title */}
      </div>

      <div className="text-center">
        <p className="text-xl font-bold">{value.toLocaleString()}</p>
        <p className="text-xs text-gray-500">
          {getConsistentTranslatedText("Late")}
        </p>{" "}
        {/* Translate "Late" */}
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

      <div className="mx-auto">
        <button
          onClick={() => handleExport(titleKey)}
          className="bg-[#8447AB] py-2 px-6 font-bold text-base text-white rounded-full
                             hover:bg-[#6a3793] transition-colors"
        >
          {getConsistentTranslatedText("Export Report")} {/* Use helper */}
        </button>
      </div>     
    </div>
  );
};

export default LateStatistics;
