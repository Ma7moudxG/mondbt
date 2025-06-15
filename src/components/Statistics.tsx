// src/components/Statistics.tsx
"use client"; // Make sure this component is explicitly a client component
import React, { useState, useEffect } from "react"; // Import useState and useEffect
import Image from "next/image";
import { Gauge, gaugeClasses } from "@mui/x-charts";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface StatisticsProps {
  attendance: number;
  absence: number;
  late: number;
  totalStudentsInRegion: number;
  totalPossibleAttendances: number;
  // rewards?: number; // Uncomment if you pass rewards
}

const Statistics: React.FC<StatisticsProps> = ({
  attendance,
  absence,
  late,
  totalStudentsInRegion,
  totalPossibleAttendances,
  // rewards,
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

  // Calculate attendance rate
  const attendanceRate =
    totalPossibleAttendances > 0
      ? Math.round((attendance / totalPossibleAttendances) * 100)
      : 0;

  const absenceRate =
    totalPossibleAttendances > 0
      ? Math.round((absence / totalPossibleAttendances) * 100)
      : 0;

  const lateRate =
    totalPossibleAttendances > 0
      ? Math.round((late / totalPossibleAttendances) * 100)
      : 0;

  return (
    <div className="statistics-component-container flex justify-between">
      <div className="flex flex-col gap-4 p-4 rounded-lg">
        {/* Attendance Statistics */}
        <div className="flex gap-2 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Image
              src="/stats_attendance.svg"
              alt={getConsistentTranslatedText("attendance_icon_alt")} // Use helper
              width={32}
              height={32}
            />
            <p>
              {getConsistentTranslatedText("Attendance")}:{" "}
              <strong>{attendance.toLocaleString()}</strong>{" "}
              {/* Use helper */}
            </p>
          </div>
          <div className="flex">
            <Gauge
              value={attendanceRate}
              valueMax={100}
              startAngle={-180}
              endAngle={180}
              innerRadius="60%"
              outerRadius="90%"
              cornerRadius="50%"
              sx={{
                [`& .${gaugeClasses.valueText}`]: {
                  fontSize: 26,
                  transform: "translate(0px, 0px)",
                },
                [`& .${gaugeClasses.valueArc}`]: {
                  fill: "#5EB89D",
                },
                [`& .${gaugeClasses.referenceArc}`]: {
                  fill: "#E2E2E2",
                },
              }}
              text={({ value }) => `${value}%`}
            />
          </div>
        </div>

        {/* Absence Statistics */}
        <div className="flex gap-2 justify-between items-center">
          <div className="flex gap-2 items-center">
            <Image
              src="/stats_absence.svg"
              alt={getConsistentTranslatedText("absence_icon_alt")} // Use helper
              width={32}
              height={32}
            />
            <p>
              {getConsistentTranslatedText("Absence")}:{" "}
              <strong>{absence.toLocaleString()}</strong>{" "}
              {/* Use helper */}
            </p>
          </div>
          <div className="flex">
            <Gauge
              value={absenceRate}
              valueMax={100}
              startAngle={-180}
              endAngle={180}
              innerRadius="60%"
              outerRadius="90%"
              cornerRadius="50%"
              sx={{
                [`& .${gaugeClasses.valueText}`]: {
                  fontSize: 26,
                  transform: "translate(0px, 0px)",
                },
                [`& .${gaugeClasses.valueArc}`]: {
                  fill: "#519E87",
                },
                [`& .${gaugeClasses.referenceArc}`]: {
                  fill: "#E2E2E2",
                },
              }}
              text={({ value }) => `${value}%`}
            />
          </div>
        </div>

        {/* Late Statistics */}
        <div className="flex gap-2 items-center justify-between ">
          <div className="flex gap-2 items-center">
            <Image
              src="/stats_late.svg"
              alt={getConsistentTranslatedText("late_icon_alt")} // Use helper
              width={32}
              height={32}
            />
            <p>
              {getConsistentTranslatedText("Late")}:{" "}
              <strong>{late.toLocaleString()}</strong>{" "}
              {/* Use helper */}
            </p>
          </div>
          <div className="flex">
            <Gauge
              value={lateRate}
              valueMax={100}
              startAngle={-180}
              endAngle={180}
              innerRadius="60%"
              outerRadius="90%"
              cornerRadius="50%"
              sx={{
                [`& .${gaugeClasses.valueText}`]: {
                  fontSize: 26,
                  transform: "translate(0px, 0px)",
                },
                [`& .${gaugeClasses.valueArc}`]: {
                  fill: "#448571",
                },
                [`& .${gaugeClasses.referenceArc}`]: {
                  fill: "#E2E2E2",
                },
              }}
              text={({ value }) => `${value}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;