// app/manager/page.tsx

"use client";
import UserCard from "@/components/UserCard";
import React, { useEffect, useState, useCallback } from "react";
import DataService, {
  type School,
  type Stats as DataServiceStats,
  type Student, // Import Student type if you have it
} from "@/services/dataService";
import { useTranslation } from "react-i18next";
import ManagerDataReports from "@/components/ManagerDataReports";
import TopSchools from "@/components/TopSchools";

const cm = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

interface CardStats {
  attendance: number;
  absence: number;
  late: number;
  fines: number;
  totalStudentsInRegion: number;
  totalPossibleAttendances: number;
  rewards: number;
}

type CardTab = "Day" | "Month" | "Year";

const schoolId = 659;

const ManagerPage = () => {
  const { t, i18n } = useTranslation();

  const [cardTab, setCardTab] = useState<CardTab>("Day");
  const [cardDateRange, setCardDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: new Date(),
    endDate: new Date(),
  });

  const [stats, setStats] = useState<DataServiceStats>({
    attendance: 0,
    absence: 0,
    late: 0,
    fines: 0,
  });

  const [results, setResults] = useState<Student[]>([]);
  const [filteredStudentIdsForExport, setFilteredStudentIdsForExport] =
    useState<number[]>([]); // New state for student IDs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";

    const initialDateRange = getDateRangeForTab("Day");
    setCardDateRange(initialDateRange);
    setDateRange(initialDateRange);
  }, [i18n.language]);

  const loadFilteredData = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    let filteredStudents = DataService.getStudentsInSchool(schoolId);
    let finalFilteredStudentIds = filteredStudents.map((s) => s.student_id);

    console.log(
      "ManagerPage: Found",
      filteredStudents.length,
      "students in school"
    );

    setResults(filteredStudents);
    setFilteredStudentIdsForExport(finalFilteredStudentIds);

    // Use unified stat calculation
    const stats = await DataService.getAggregatedStatsForStudents(
      finalFilteredStudentIds,
      dateRange.startDate,
      dateRange.endDate
    );

    setStats({
      attendance: stats.attendance,
      absence: stats.absence,
      late: stats.late,
      fines: stats.penalties,
    });
  } catch (err) {
    console.error("ManagerPage: Error loading filtered data:", err);
    setError(t("Failed to load data. Please try again."));
  } finally {
    setLoading(false);
  }
}, [dateRange, t, i18n.language]);
 // Add i18n.language to dependencies

  useEffect(() => {
    loadFilteredData();
  }, [loadFilteredData]);

  const getDateRangeForTab = useCallback(
    (tab: CardTab): { startDate: Date; endDate: Date } => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);

      let startDate = new Date();
      let endDate = endOfYesterday; // Default to end of yesterday for 'Day'

      if (tab === "Day") {
        startDate = new Date(yesterday);
        startDate.setHours(0, 0, 0, 0);
      } else if (tab === "Month") {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // End of current month
        endDate.setHours(23, 59, 59, 999);
      } else if (tab === "Year") {
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        startDate = new Date();
        if (currentMonth < 8) {
          // Assuming school year starts in September (month 8)
          startDate.setFullYear(currentYear - 1);
          startDate.setMonth(8); // September
        } else {
          startDate.setFullYear(currentYear);
          startDate.setMonth(8); // September
        }
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(currentYear + 1, 7, 31); // August 31st of next year for academic year end
        endDate.setHours(23, 59, 59, 999);
      }
      return { startDate, endDate };
    },
    []
  );

  const [cardStats, setCardStats] = useState<CardStats>({
    attendance: 0,
    absence: 0,
    late: 0,
    fines: 0,
    totalStudentsInRegion: 0,
    totalPossibleAttendances: 0,
    rewards: 0,
  });

  useEffect(() => {
    const loadCardStats = async () => {
      try {
        if (!schoolId || filteredStudentIdsForExport.length === 0) {
          setCardStats({
            attendance: 0,
            absence: 0,
            late: 0,
            fines: 0,
            totalStudentsInRegion: 0,
            totalPossibleAttendances: 0,
            rewards: 0,
          });
          return;
        }

        console.log(
          "AdminPage: Card Date Range (for cards):",
          cardDateRange.startDate.toLocaleString(),
          "to",
          cardDateRange.endDate.toLocaleString()
        );

        const schoolStats = await DataService.getAggregatedStatsForStudents(
          filteredStudentIdsForExport,
          cardDateRange.startDate,
          cardDateRange.endDate
        );

        console.log("staaaaats", schoolStats);

        setCardStats({
          attendance: schoolStats.attendance,
          absence: schoolStats.absence,
          late: schoolStats.late,
          fines: schoolStats.penalties,
          totalStudentsInRegion: filteredStudentIdsForExport.length,
          totalPossibleAttendances: schoolStats.totalPossibleAttendances,
          rewards: schoolStats.rewards,
        });
      } catch (error) {
        console.error("AdminPage: Error loading card stats:", error);
        setCardStats({
          attendance: 0,
          absence: 0,
          late: 0,
          fines: 0,
          totalStudentsInRegion: 0,
          totalPossibleAttendances: 0,
          rewards: 0,
        });
      }
    };

    if (cardDateRange.startDate && cardDateRange.endDate) {
      loadCardStats();
    }
  }, [cardDateRange, filteredStudentIdsForExport, i18n.language]);

  const handleDateChange = useCallback(
    (dates: { startDate: Date; endDate: Date }) => {
      setDateRange(dates);
    },
    []
  );

  const cards = [
    {
      type: t("Attendance"),
      number: cardStats.attendance.toLocaleString(),
      text: t("Student"),
    },
    {
      type: t("Absence"),
      number: cardStats.absence.toLocaleString(),
      text: t("Student"),
    },
    {
      type: t("Late"),
      number: cardStats.late.toLocaleString(),
      text: t("Student"),
    },
    {
      type: t("Absence With Excuse"),
      number: cardStats.fines.toLocaleString(),
      text: t("Student"),
    },
    {
      type: t("Absence Without Excuse"),
      number: cardStats.rewards.toLocaleString(),
      text: t("Student"),
    },
  ];

  return (
    <div className="p-4 flex flex-col gap-8">
      <div className="flex gap-12 items-center justify-between">
        <div className="flex gap-4 items-center">
          <TopSchools />
        </div>
      </div>
      <div className="flex gap-12 items-center justify-between">
        <div className="flex gap-4 items-center">
          <h1 className="text-lg font-black text-[#7C8B9D]">
            {t("Statistics")}
          </h1>
          <div className="flex flex-wrap justify-center gap-2">
            {([t("Day"), t("Month"), t("Year")] as CardTab[]).map(
              (
                tab 
              ) => (
                <button
                  key={tab}
                  className={cm(
                    "px-4 py-2 rounded-full text-sm transition-colors",
                    t(cardTab) === tab 
                      ? "bg-[#5EB89D] text-white font-bold"
                      : "text-gray-600 hover:bg-gray-200"
                  )}
                  onClick={() => {
                    const originalTab = Object.keys({
                      Day: t("Day"),
                      Month: t("Month"),
                      Year: t("Year"),
                    }).find((key) => t(key as CardTab) === tab) as CardTab;
                    const newDateRange = getDateRangeForTab(originalTab);
                    setCardTab(originalTab);
                    setCardDateRange(newDateRange);
                    setDateRange(newDateRange);
                  }}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>
        <div>
          <h1 className="text-lg font-black text-[#7C8B9D]">
            {t("School: ")}
            {DataService.getSchoolNameById(schoolId, i18n.language)}
          </h1>
        </div>
      </div>

      

      <div className="flex gap-2 justify-between flex-wrap">
        {cards.map((i) => (
          <UserCard key={i.type} type={i} />
        ))}
      </div>

      <div className="">
        <div className="flex flex-col gap-8">
          <ManagerDataReports
            students={results}
            stats = {cardStats}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>
      </div>
    </div>
  );
};

export default ManagerPage;
