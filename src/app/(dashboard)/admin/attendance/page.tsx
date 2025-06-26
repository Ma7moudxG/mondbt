"use client";
import { useState, useEffect, useCallback } from "react";
import DataService, {
  type School,
  type Region,
  type Student,
} from "@/services/dataService";
import MinisterMap from "@/components/MinisterMap";
import AttendanceStatistics from "@/components/AttendanceStatistics";
import { useTranslation } from "react-i18next";

const cm = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

type CardTab = "Day" | "Month" | "Year";

interface CardStats {
  attendance: number;
  totalStudentsInRegion: number;
  totalPossibleAttendances: number;
}


const AttendanceStatisticsPage = () => {
  const { t, i18n } = useTranslation();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getConsistentTranslatedText = useCallback((key: string) => {
    if (!mounted) {
      return key;
    }
    return t(key);
  }, [mounted, t]);

  const [cardTab, setCardTab] = useState<CardTab>("Year");
  const [cardDateRange, setCardDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  // Initial setup effect for cardDateRange and selectedRegion



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
    totalStudentsInRegion: 0,
    totalPossibleAttendances: 0,
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
      if (currentMonth < 8) {
        startDate.setFullYear(currentYear - 1);
        startDate.setMonth(8);
      } else {
        startDate.setFullYear(currentYear);
        startDate.setMonth(8);
      }
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate.getFullYear() + 1, 7, 31); // August 31st of next year relative to startDate's year
      endDate.setHours(23, 59, 59, 999);
    }
    return { startDate, endDate };
  }, []);

  // Removed old useEffect for initial data, merged into the one above.
  // useEffect(() => {
  //     validateDataStructure();
  //     const allRegions = DataService.getAllRegions();
  //     if (allRegions?.length > 0 && selectedRegion === null) {
  //         setSelectedRegion(allRegions[0].region_id);
  //     }
  // }, [selectedRegion, i18n.language]); // Dependencies ensure it runs when selectedRegion or language changes

    useEffect(() => {
    if (isClient) {
      // Set initial date range for "Year"
      const initialDateRange = getDateRangeForTab("Year");
      setCardDateRange(initialDateRange);
      setCardTab("Year"); // Ensure the tab is visually selected

      // Set initial selected region to the first one available
      const allRegions = DataService.getAllRegions();
      if (allRegions?.length > 0 && selectedRegion === null) {
        setSelectedRegion(allRegions[0].region_id);
      }
    }
  }, [isClient, getDateRangeForTab, selectedRegion]); // Add selectedRegion here to ensure it only runs once for initial setup

  

  const calculateGroupStats = useCallback((studentIds: number[], dateRange: { startDate: Date; endDate: Date }) => {
    if (studentIds.length === 0) {
      console.log("calculateGroupStats: No student IDs provided, returning 0 stats.");
      return { attendance: 0, totalPossible: 0 };
    }

    console.log(`calculateGroupStats for ${studentIds.length} students for date range: ${dateRange.startDate.toLocaleDateString()} to ${dateRange.endDate.toLocaleDateString()}`);
    const students = DataService.getStudentsByIds(studentIds)
    const attendance = DataService.calculateAttendance(students, dateRange.startDate, dateRange.endDate);
    const absence = DataService.countAbsences(studentIds, dateRange.startDate, dateRange.endDate);
    const late = DataService.countLateArrivals(studentIds, dateRange.startDate, dateRange.endDate);

    const totalPossible = attendance + absence + late;

    console.log(`  - Results: Attendance=${attendance}, Absence=${absence}, Late=${late}, Total Possible=${totalPossible}`);

    return {
      attendance: attendance,
      totalPossible: totalPossible,
    };
  }, []);

  // NEW useEffect: To calculate and set overallCardStats based on date range
  // This effect will run on initial load (due to isClient and initial cardDateRange)
  // and whenever cardDateRange changes (e.g., when clicking Day/Month/Year tabs).
  useEffect(() => {
    const loadOverallCardStats = () => {
      if (!isClient || !cardDateRange.startDate || !cardDateRange.endDate) {
        console.log("Not loading overall card stats: Client not ready or date range missing.");
        return;
      }

      console.log("Loading overall card stats for date range:", cardDateRange.startDate.toLocaleString(), "to", cardDateRange.endDate.toLocaleString());

      try {
        const allRegions = DataService.getAllRegions();
        if (!allRegions || allRegions.length === 0) {
          console.log("No regions found, setting overallCardStats to zeros.");
          setOverallCardStats({
            attendance: 0, totalStudentsInRegion: 0, totalPossibleAttendances: 0,
          });
          return;
        }

        let totalAttendance = 0;
        let totalPossibleAttendancesAcrossAllRegions = 0;
        let totalStudentsAcrossAllRegions = 0;

        allRegions.forEach((region) => {
          const regionStats = DataService.getRegionStats(
            region.region_id,
            cardDateRange.startDate,
            cardDateRange.endDate
          );
          totalAttendance += regionStats.attendance || 0;
          // Note: getRegionStats typically returns absence, late, fines.
          // totalPossibleAttendances should combine these if available from regionStats
          const regionTotalPossible = (regionStats.attendance || 0) + (regionStats.absence || 0) + (regionStats.late || 0);
          totalPossibleAttendancesAcrossAllRegions += regionTotalPossible;
          totalStudentsAcrossAllRegions += regionStats.totalStudentsInRegion || 0;
        });

        const newOverallStats = {
          attendance: totalAttendance,
          totalStudentsInRegion: totalStudentsAcrossAllRegions,
          totalPossibleAttendances: totalPossibleAttendancesAcrossAllRegions,
        };
        setOverallCardStats(newOverallStats);
        console.log("Overall card stats calculated:", newOverallStats);
      } catch (error) {
        console.error("AttendanceStatisticsPage: Error loading overall card stats:", error);
        setOverallCardStats({
          attendance: 0, totalStudentsInRegion: 0, totalPossibleAttendances: 0,
        });
      }
    };

    loadOverallCardStats();
  }, [isClient, cardDateRange]); // Dependency: Recalculate when client status or date range changes


  // Effect to load region-specific grouped stats
  useEffect(() => {
    const loadGroupedStats = () => {
      console.log("Loading grouped stats for selectedRegion:", selectedRegion);
      console.log("Current overallCardStats (for 'all' category):", overallCardStats); // This overallCardStats should now be loaded

      if (!isClient || !cardDateRange.startDate || !cardDateRange.endDate) {
        console.log("Not loading grouped stats: Client not ready or date range missing.");
        return;
      }

      // Determine the scope of students (all or region-specific)
      let studentsForCalculation: Student[] = [];
      let schoolsForCalculation: School[] = [];

      if (selectedRegion === null) {
        // If no region selected, use all students and schools
        // This will now use the overallCardStats if you want the "all" value to reflect the sum
        studentsForCalculation = DataService.getAllStudents();
        schoolsForCalculation = DataService.getAllSchools();
        console.log("No specific region selected, calculating grouped stats for ALL students globally.");
      } else {
        // If a region is selected, filter students and schools for that region
        schoolsForCalculation = DataService.getSchoolsByRegionId(selectedRegion);
        const schoolsInRegionMap = new Map(schoolsForCalculation.map(s => [s.school_id, s]));
        studentsForCalculation = DataService.getAllStudents().filter(student =>
          schoolsInRegionMap.has(student.school_id)
        );
        console.log(`Calculating grouped stats for region ${selectedRegion}: Found ${studentsForCalculation.length} students.`);
      }

      if (studentsForCalculation.length === 0 && selectedRegion !== null) {
        console.log("No students found for the selected region. Setting grouped stats to 0.");
        setGroupedStats({
            all: { attendance: 0, totalPossible: 0 },
            male: { attendance: 0, totalPossible: 0 },
            female: { attendance: 0, totalPossible: 0 },
            primary: { attendance: 0, totalPossible: 0 },
            intermediate: { attendance: 0, totalPossible: 0 },
            secondary: { attendance: 0, totalPossible: 0 },
        });
        return;
      }
      
      const studentIdsInScope = studentsForCalculation.map(s => s.student_id);

      const maleStudentIdsInScope = studentsForCalculation.filter(s => s.gender === "Male").map(s => s.student_id);
      const femaleStudentIdsInScope = studentsForCalculation.filter(s => s.gender === "Female").map(s => s.student_id);
      
      const primaryStudentIdsInScope = studentsForCalculation.filter(s =>
        schoolsForCalculation.some(school => school.school_id === s.school_id && school.educational_level_en === "Primary")
      ).map(s => s.student_id);
      const intermediateStudentIdsInScope = studentsForCalculation.filter(s =>
        schoolsForCalculation.some(school => school.school_id === s.school_id && school.educational_level_en === "Intermediate")
      ).map(s => s.student_id);
      const secondaryStudentIdsInScope = studentsForCalculation.filter(s =>
        schoolsForCalculation.some(school => school.school_id === s.school_id && school.educational_level_en === "Secondary")
      ).map(s => s.student_id);

      const newStats = {
        // The 'all' category here should reflect the total for the current scope (all students or selected region students)
        // It's calculated dynamically based on 'studentsForCalculation' and 'cardDateRange'
        all: calculateGroupStats(studentIdsInScope, cardDateRange),
        male: calculateGroupStats(maleStudentIdsInScope, cardDateRange),
        female: calculateGroupStats(femaleStudentIdsInScope, cardDateRange),
        primary: calculateGroupStats(primaryStudentIdsInScope, cardDateRange),
        intermediate: calculateGroupStats(intermediateStudentIdsInScope, cardDateRange),
        secondary: calculateGroupStats(secondaryStudentIdsInScope, cardDateRange),
      };

      console.log("AttendanceStatisticsPage: Setting grouped stats:", newStats);
      setGroupedStats(newStats);

    };

    loadGroupedStats();
  }, [selectedRegion, cardDateRange, calculateGroupStats, isClient, overallCardStats]); // overallCardStats added here as it affects the initial 'all' calculation logic

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
              key={selectedRegion}
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