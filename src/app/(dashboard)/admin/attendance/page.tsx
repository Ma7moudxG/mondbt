// app/minister/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import DataService, {
  type School,
  type Region,
  type Student,
} from "@/services/dataService";
import MinisterMap from "@/components/MinisterMap";
import { validateDataStructure } from "@/utils/dataValidator";
import AttendanceStatistics from "@/components/AttendanceStatistics";
import UserCard from "@/components/UserCard"; // UserCard is imported but not used in the JSX provided. Keep if used elsewhere.
import { useTranslation } from "react-i18next";

const cm = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

type CardTab = "Day" | "Month" | "Year";

interface CardStats {
  attendance: number;
  absence: number;
  late: number;
  fines: number;
  totalStudentsInRegion: number;
  totalPossibleAttendances: number;
  rewards: number;
}

const AttendanceStatisticsPage = () => {
  const { t, i18n } = useTranslation();

  const [mounted, setMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect ensures client-side rendering is ready and sets initial direction.
    setIsClient(true);
    setMounted(true); // Assuming 'mounted' is for getConsistentTranslatedText
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const getConsistentTranslatedText = useCallback((key: string) => {
    if (!mounted) {
      return key; // Return untranslated key if not mounted yet (for initial render)
    }
    return t(key);
  }, [mounted, t]);

  const [cardTab, setCardTab] = useState<CardTab>("Year"); // Default to 'Year'
  const [cardDateRange, setCardDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  const [groupedStats, setGroupedStats] = useState({
    all: { attendance: 0, totalPossible: 0 },
    male: { attendance: 0, totalPossible: 0 },
    female: { attendance: 0, totalPossible: 0 },
    primary: { attendance: 0, totalPossible: 0 },
    intermediate: { attendance: 0, totalPossible: 0 },
    secondary: { attendance: 0, totalPossible: 0 },
  });

  const [overallCardStats, setOverallCardStats] = useState<CardStats>({
    attendance: 0,
    absence: 0,
    late: 0,
    fines: 0,
    totalStudentsInRegion: 0,
    totalPossibleAttendances: 0,
    rewards: 0,
  });

  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

  const getDateRangeForTab = useCallback((
    tab: CardTab
  ): { startDate: Date; endDate: Date } => {
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
      // School year starts in September (month 8)
      if (currentMonth < 8) { // If current month is before September
        startDate.setFullYear(currentYear - 1); // Previous year's September
        startDate.setMonth(8); // September (0-indexed is 8)
      } else { // If current month is September or later
        startDate.setFullYear(currentYear); // Current year's September
        startDate.setMonth(8); // September
      }
      startDate.setDate(1); // First day of September
      startDate.setHours(0, 0, 0, 0);

      // End of the school year (August 31st of the next year relative to startDate's year)
      endDate = new Date(startDate.getFullYear() + 1, 7, 31); // August (month 7), 31st
      endDate.setHours(23, 59, 59, 999);
    }
    return { startDate, endDate };
  }, []);

  // Initial setup effect: set default date range and region selection
  useEffect(() => {
    if (isClient) {
      validateDataStructure(); // Ensure this is only called on client-side

      // Set initial date range for "Year"
      const initialYearRange = getDateRangeForTab("Year");
      setCardDateRange(initialYearRange);
      setCardTab("Year"); // Ensure the tab button reflects "Year"

      // Set initial selected region to the first one available
      const allRegions = DataService.getAllRegions();
      if (allRegions?.length > 0 && selectedRegion === null) {
        setSelectedRegion(allRegions[0].region_id);
      }
    }
  }, [isClient, getDateRangeForTab, selectedRegion]); // Add selectedRegion here to ensure it only runs once for initial setup


  const calculateGroupStats = useCallback((studentIds: number[], dateRange: { startDate: Date; endDate: Date }) => {
    if (studentIds.length === 0) {
      // console.log("calculateGroupStats: No student IDs provided, returning 0 stats.");
      return { attendance: 0, totalPossible: 0 };
    }

    // console.log(`calculateGroupStats for ${studentIds.length} students for date range: ${dateRange.startDate.toLocaleDateString()} to ${dateRange.endDate.toLocaleDateString()}`);
    const students = DataService.getStudentsByIds(studentIds);
    const attendance = DataService.calculateAttendance(students, dateRange.startDate, dateRange.endDate);
    const absence = DataService.countAbsences(studentIds, dateRange.startDate, dateRange.endDate);
    const late = DataService.countLateArrivals(studentIds, dateRange.startDate, dateRange.endDate);

    const totalPossible = attendance + absence + late;

    // console.log(`  - Results: Attendance=${attendance}, Absence=${absence}, Late=${late}, Total Possible=${totalPossible}`);

    return {
      attendance: attendance,
      totalPossible: totalPossible,
    };
  }, []);

  // NEW EFFECT: To calculate and set overallCardStats
  useEffect(() => {
    const loadOverallCardStats = () => {
      if (!isClient || !cardDateRange.startDate || !cardDateRange.endDate) {
        return;
      }

      console.log("Loading overall card stats for date range:", cardDateRange.startDate.toLocaleString(), "to", cardDateRange.endDate.toLocaleString());

      try {
        const allRegions = DataService.getAllRegions();
        if (!allRegions || allRegions.length === 0) {
          setOverallCardStats({
            attendance: 0, absence: 0, late: 0, fines: 0,
            totalStudentsInRegion: 0, totalPossibleAttendances: 0, rewards: 0,
          });
          return;
        }

        let totalAttendance = 0;
        let totalAbsence = 0;
        let totalLate = 0;
        let totalFines = 0;
        let totalRewards = 0;
        let totalStudentsAcrossAllRegions = 0;
        let totalPossibleAttendancesAcrossAllRegions = 0;

        allRegions.forEach((region) => {
          const regionStats = DataService.getRegionStats(
            region.region_id,
            cardDateRange.startDate,
            cardDateRange.endDate
          );
          totalAttendance += regionStats.attendance || 0;
          totalAbsence += regionStats.absence || 0;
          totalLate += regionStats.late || 0;
          totalFines += regionStats.penalties || 0;
          totalRewards += regionStats.rewards || 0;
          totalStudentsAcrossAllRegions += regionStats.totalStudentsInRegion || 0;
          totalPossibleAttendancesAcrossAllRegions +=
            (regionStats.attendance || 0) + (regionStats.absence || 0) + (regionStats.late || 0);
        });

        setOverallCardStats({
          attendance: totalAttendance,
          absence: totalAbsence,
          late: totalLate,
          fines: totalFines,
          totalStudentsInRegion: totalStudentsAcrossAllRegions,
          totalPossibleAttendances: totalPossibleAttendancesAcrossAllRegions,
          rewards: totalRewards,
        });
        console.log("Overall card stats calculated:", { attendance: totalAttendance, totalPossible: totalPossibleAttendancesAcrossAllRegions });
      } catch (error) {
        console.error("AttendanceStatisticsPage: Error loading overall card stats:", error);
        setOverallCardStats({
          attendance: 0, absence: 0, late: 0, fines: 0,
          totalStudentsInRegion: 0, totalPossibleAttendances: 0, rewards: 0,
        });
      }
    };

    loadOverallCardStats();
  }, [isClient, cardDateRange]); // Recalculate when date range changes

  // Effect to load region-specific grouped stats
  // This now depends on overallCardStats being updated first
  useEffect(() => {
    const loadGroupedStats = () => {
      // console.log("Loading grouped stats for selectedRegion:", selectedRegion);
      // console.log("Current overallCardStats (for 'all' category):", overallCardStats);

      if (!isClient || !cardDateRange.startDate || !cardDateRange.endDate) {
        return;
      }

      // If a region is not selected, the "all" stats will come from overallCardStats
      // If a region is selected, its schools/students will be filtered
      let studentsForGroupedStats: Student[] = [];
      let schoolsInScope: School[] = [];

      if (selectedRegion === null) {
        // If no specific region is selected, calculate for ALL students across ALL regions
        schoolsInScope = DataService.getAllSchools();
        studentsForGroupedStats = DataService.getAllStudents();
        console.log("No region selected: calculating grouped stats for all students globally.");
      } else {
        // If a region is selected, filter students based on that region's schools
        schoolsInScope = DataService.getSchoolsByRegionId(selectedRegion);
        const schoolsMap = new Map(schoolsInScope.map(s => [s.school_id, s]));
        studentsForGroupedStats = DataService.getAllStudents().filter(student =>
          schoolsMap.has(student.school_id)
        );
        console.log(`Region ${selectedRegion} selected: calculating grouped stats for ${studentsForGroupedStats.length} students in this region.`);
      }

      // Prepare student IDs for various categories
      const allStudentIdsInScope = studentsForGroupedStats.map(s => s.student_id);
      const maleStudentIdsInScope = studentsForGroupedStats.filter(s => s.gender === "Male").map(s => s.student_id);
      const femaleStudentIdsInScope = studentsForGroupedStats.filter(s => s.gender === "Female").map(s => s.student_id);
      
      const primaryStudentIdsInScope = studentsForGroupedStats.filter(s =>
        schoolsInScope.some(school => school.school_id === s.school_id && school.educational_level_en === "Primary")
      ).map(s => s.student_id);
      const intermediateStudentIdsInScope = studentsForGroupedStats.filter(s =>
        schoolsInScope.some(school => school.school_id === s.school_id && school.educational_level_en === "Intermediate")
      ).map(s => s.student_id);
      const secondaryStudentIdsInScope = studentsForGroupedStats.filter(s =>
        schoolsInScope.some(school => school.school_id === s.school_id && school.educational_level_en === "Secondary")
      ).map(s => s.student_id);

      const newStats = {
        all: calculateGroupStats(allStudentIdsInScope, cardDateRange), // Now 'all' reflects the selected scope
        male: calculateGroupStats(maleStudentIdsInScope, cardDateRange),
        female: calculateGroupStats(femaleStudentIdsInScope, cardDateRange),
        primary: calculateGroupStats(primaryStudentIdsInScope, cardDateRange),
        intermediate: calculateGroupStats(intermediateStudentIdsInScope, cardDateRange),
        secondary: calculateGroupStats(secondaryStudentIdsInScope, cardDateRange),
      };

      setGroupedStats(newStats);
      // console.log("AttendanceStatisticsPage: Loaded grouped stats for region:", selectedRegion, newStats);

    };

    loadGroupedStats();
    // Dependencies: selectedRegion changes what students are considered, cardDateRange changes the period
  }, [selectedRegion, cardDateRange, calculateGroupStats, isClient]); // overallCardStats is no longer a direct dependency for this effect, but its calculation influences 'all'

  const handleDateTabClick = useCallback((tab: CardTab) => {
    setCardTab(tab);
    setCardDateRange(getDateRangeForTab(tab));
  }, [getDateRangeForTab]);

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex gap-12">
        <h1 className="text-lg font-black text-[#7C8B9D]">{getConsistentTranslatedText("Attendance")}</h1>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {(["Day", "Month", "Year"] as CardTab[]).map((untranslatedTab) => (
          <button
            key={untranslatedTab}
            className={cm(
              "px-4 py-2 rounded-full text-sm transition-colors",
              cardTab === untranslatedTab
                ? "bg-[#5EB89D] text-white font-bold"
                : "text-gray-600 hover:bg-gray-200"
            )}
            onClick={() => handleDateTabClick(untranslatedTab)}
          >
            {getConsistentTranslatedText(untranslatedTab)}
          </button>
        ))}
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="flex flex-col gap-8 lg:w-1/2 p-8 bg-white rounded-2xl">
          <div className="md:min-h-[300px]">
            <MinisterMap
              key={selectedRegion} // Key changes to re-mount map if region changes significantly
              onRegionSelect={setSelectedRegion}
              selectedRegionId={selectedRegion}
            />
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:w-1/2 p-8 bg-white rounded-2xl">
          <div className="flex flex-col gap-8">
            {selectedRegion !== null ? (
              <AttendanceStatistics
                groupedStats={groupedStats}
              />
            ) : (
              <p className="text-gray-600 text-center py-10">
                {getConsistentTranslatedText("Please select a region from the map to view detailed attendance statistics.")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStatisticsPage;