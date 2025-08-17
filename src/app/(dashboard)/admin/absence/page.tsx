"use client";
import { useState, useEffect, useCallback } from "react";
import DataService from "@/services/dataService";
import { useTranslation } from "react-i18next";
import AbsenceStatistics from "@/components/AbsenceStatistics";
import FixedMap from "@/components/FixedMap";

const cm = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

type CardTab = "Day" | "Month" | "Year";

interface CardStats {
  absence: number;
  totalStudentsInRegion: number;
  totalPossibleAttendances: number;
}

const AbsenceStatisticsPage = () => {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [cardTab, setCardTab] = useState<CardTab>("Year");
  const [cardDateRange, setCardDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [isClient, setIsClient] = useState(false);
  const [groupedStats, setGroupedStats] = useState({
    all: { absence: 0, totalPossible: 0 },
    male: { absence: 0, totalPossible: 0 },
    female: { absence: 0, totalPossible: 0 },
    primary: { absence: 0, totalPossible: 0 },
    intermediate: { absence: 0, totalPossible: 0 },
    secondary: { absence: 0, totalPossible: 0 },
  });
  const [overallCardStats, setOverallCardStats] = useState<CardStats>({
    absence: 0,
    totalStudentsInRegion: 0,
    totalPossibleAttendances: 0,
  });
  const [selectedRegion, setSelectedRegion] = useState<number | null>(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getConsistentTranslatedText = useCallback(
    (key: string) => (mounted ? t(key) : key),
    [mounted, t]
  );

  useEffect(() => {
    setIsClient(true);
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  const getDateRangeForTab = useCallback(
    (tab: CardTab): { startDate: Date; endDate: Date } => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);

      let startDate = new Date();
      let endDate = endOfYesterday;

      if (tab === "Day") {
        startDate = new Date(yesterday);
        startDate.setHours(0, 0, 0, 0);
      } else if (tab === "Month") {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      } else if (tab === "Year") {
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        startDate = new Date();
        if (currentMonth < 8) {
          startDate.setFullYear(currentYear - 1);
          startDate.setMonth(8);
        } else {
          startDate.setFullYear(currentYear);
          startDate.setMonth(8);
        }
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentYear, 7, 31);
        endDate.setHours(23, 59, 59, 999);
      }

      return { startDate, endDate };
    },
    []
  );

  useEffect(() => {
    if (isClient) {
      const initialDateRange = getDateRangeForTab("Year");
      setCardDateRange(initialDateRange);
      setCardTab("Year");
    }
  }, [isClient, getDateRangeForTab]);

  const calculateGroupStats = useCallback(
    (studentIds: number[], dateRange: { startDate: Date; endDate: Date }) => {
      if (studentIds.length === 0) return { absence: 0, totalPossible: 0 };

      const students = DataService.getStudentsByIds(studentIds);
      const attendance = DataService.calculateAttendance(
        students,
        dateRange.startDate,
        dateRange.endDate
      );
      const absence = DataService.countAbsences(
        studentIds,
        dateRange.startDate,
        dateRange.endDate
      );
      const late = DataService.countLateArrivals(
        studentIds,
        dateRange.startDate,
        dateRange.endDate
      );

      const totalPossible = attendance + absence + late;

      return { absence, totalPossible };
    },
    []
  );

  useEffect(() => {
    const loadGroupedStats = () => {
      if (selectedRegion === null) return;

      try {
        const regionSchools = DataService.getSchoolsByRegionId(1);
        const schoolsMap = new Map(regionSchools.map((s) => [s.school_id, s]));

        const allStudentsInRegion = DataService.getAllStudents().filter((s) =>
          schoolsMap.has(s.school_id)
        );

        const maleStudentIds = allStudentsInRegion
          .filter((s) => s.gender === "Male")
          .map((s) => s.student_id);
        const femaleStudentIds = allStudentsInRegion
          .filter((s) => s.gender === "Female")
          .map((s) => s.student_id);
        const primaryStudentIds = allStudentsInRegion
          .filter(
            (s) =>
              schoolsMap.get(s.school_id)?.educational_level_en === "Primary"
          )
          .map((s) => s.student_id);
        const intermediateStudentIds = allStudentsInRegion
          .filter(
            (s) =>
              schoolsMap.get(s.school_id)?.educational_level_en ===
              "Intermediate"
          )
          .map((s) => s.student_id);
        const secondaryStudentIds = allStudentsInRegion
          .filter(
            (s) =>
              schoolsMap.get(s.school_id)?.educational_level_en === "Secondary"
          )
          .map((s) => s.student_id);

        const maleStats = calculateGroupStats(maleStudentIds, cardDateRange);
        const femaleStats = calculateGroupStats(femaleStudentIds, cardDateRange);
        const primaryStats = calculateGroupStats(primaryStudentIds, cardDateRange);
        const intermediateStats = calculateGroupStats(
          intermediateStudentIds,
          cardDateRange
        );
        const secondaryStats = calculateGroupStats(secondaryStudentIds, cardDateRange);

        const allAbsence = maleStats.absence + femaleStats.absence;
        const allTotal = maleStats.totalPossible + femaleStats.totalPossible;

        setGroupedStats({
          all: { absence: allAbsence, totalPossible: allTotal },
          male: maleStats,
          female: femaleStats,
          primary: primaryStats,
          intermediate: intermediateStats,
          secondary: secondaryStats,
        });
      } catch (error) {
        console.error("Error loading grouped stats:", error);
      }
    };

    loadGroupedStats();
  }, [selectedRegion, cardDateRange, calculateGroupStats]);

  useEffect(() => {
    const loadOverallCardStats = () => {
      try {
        const regionStats = DataService.getRegionStats(
          1,
          cardDateRange.startDate,
          cardDateRange.endDate
        );

        const totalPossible =
          (regionStats.attendance || 0) +
          (regionStats.absence || 0) +
          (regionStats.late || 0);

        setOverallCardStats({
          absence: regionStats.absence || 0,
          totalStudentsInRegion: regionStats.totalStudentsInRegion || 0,
          totalPossibleAttendances: totalPossible,
        });
      } catch (error) {
        console.error("Error loading overall card stats:", error);
        setOverallCardStats({
          absence: 0,
          totalStudentsInRegion: 0,
          totalPossibleAttendances: 0,
        });
      }
    };

    if (cardDateRange.startDate && cardDateRange.endDate) {
      loadOverallCardStats();
    }
  }, [cardDateRange, i18n.language]);

  const handleDateTabClick = useCallback(
    (tab: CardTab) => {
      setCardTab(tab);
      setCardDateRange(getDateRangeForTab(tab));
    },
    [getDateRangeForTab]
  );

  useEffect(() => {
    if (isClient) {
      handleDateTabClick("Year");
    }
  }, [isClient, handleDateTabClick]);

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex gap-12">
        <h1 className="text-xl font-black text-[#7C8B9D]">
          {getConsistentTranslatedText("Absence")}
        </h1>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {(["Day", "Month", "Year"] as CardTab[]).map((tab) => (
          <button
            key={tab}
            className={cm(
              "px-4 py-2 rounded-full text-sm transition-colors",
              cardTab === tab
                ? "bg-[#5EB89D] text-white font-bold"
                : "text-gray-600 hover:bg-gray-200"
            )}
            onClick={() => handleDateTabClick(tab)}
          >
            {getConsistentTranslatedText(tab)}
          </button>
        ))}
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="flex flex-col gap-8 lg:w-1/2 p-8 bg-white rounded-2xl">
          <div className="md:min-h-[300px]">
            <FixedMap
              key={selectedRegion}
              onRegionSelect={setSelectedRegion}
              selectedRegionId={selectedRegion}
            />
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:w-1/2 p-8 bg-white rounded-2xl">
          <div className="flex flex-col gap-8">
            {selectedRegion !== null ? (
              <AbsenceStatistics groupedStats={groupedStats} />
            ) : (
              <p className="text-gray-600 text-center py-10">
                {getConsistentTranslatedText(
                  "Please select a region from the map to view detailed attendance statistics."
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbsenceStatisticsPage;
