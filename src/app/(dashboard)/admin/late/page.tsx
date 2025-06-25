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
import UserCard from "@/components/UserCard";
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const getConsistentTranslatedText = useCallback((key: string) => {
    if (!mounted) {
      return key;
    }
    return t(key);
  }, [mounted, t]);

  const [cardTab, setCardTab] = useState<CardTab>("Day");
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
      if (currentMonth < 8) {
        startDate.setFullYear(currentYear - 1);
        startDate.setMonth(8);
      } else {
        startDate.setFullYear(currentYear);
        startDate.setMonth(8);
      }
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(currentYear , 7, 31);
      endDate.setHours(23, 59, 59, 999);
    }
    return { startDate, endDate };
  }, []);

  useEffect(() => {
    validateDataStructure();
    // Assuming DataService.getAllRegions() does not require language as per your provided code
    const allRegions = DataService.getAllRegions();
    if (allRegions?.length > 0 && selectedRegion === null) {
      setSelectedRegion(allRegions[0].region_id);
    }
    setCardDateRange(getDateRangeForTab("Day"));
  }, [getDateRangeForTab, selectedRegion, i18n.language]);

  const calculateGroupStats = useCallback((studentIds: number[], dateRange: { startDate: Date; endDate: Date }) => {
    if (studentIds.length === 0) {
      console.log("calculateGroupStats: No student IDs provided, returning 0 stats.");
      return { attendance: 0, totalPossible: 0 };
    }

    console.log(`calculateGroupStats for ${studentIds.length} students for date range: ${dateRange.startDate.toLocaleDateString()} to ${dateRange.endDate.toLocaleDateString()}`);
    // Optionally log a few student IDs to ensure they are present
    // console.log("Student IDs being processed:", studentIds.slice(0, 5)); // Log first 5 IDs
    const students = DataService.getStudentsByIds(studentIds)
    const attendance = DataService.calculateAttendance(students, dateRange.startDate, dateRange.endDate);
    const absence = DataService.countAbsences(studentIds, dateRange.startDate, dateRange.endDate);
    const late = DataService.countLateArrivals(studentIds, dateRange.startDate, dateRange.endDate);

    const totalPossible = attendance + absence + late;

    console.log(`  - Results: Attendance=${attendance}, Absence=${absence}, Late=${late}, Total Possible=${totalPossible}`);

    return {
      attendance: attendance,
      totalPossible: totalPossible,
    };
  }, []);

  // Effect to load region-specific grouped stats, now incorporating overallCardStats.attendance
  useEffect(() => {
    const loadGroupedStats = () => {
      console.log("Loading grouped stats for selectedRegion:", selectedRegion);
      console.log("Current overallCardStats (for 'all' category):", overallCardStats);

      if (selectedRegion === null) {
        setGroupedStats({
          all: { attendance: overallCardStats.attendance, totalPossible: overallCardStats.totalPossibleAttendances },
          male: { attendance: 0, totalPossible: 0 },
          female: { attendance: 0, totalPossible: 0 },
          primary: { attendance: 0, totalPossible: 0 },
          intermediate: { attendance: 0, totalPossible: 0 },
          secondary: { attendance: 0, totalPossible: 0 },
        });
        return;
      }

      try {
        const regionSchools = DataService.getSchoolsByRegionId(selectedRegion);
        console.log("Schools in selected region:", regionSchools);

        if (!regionSchools || regionSchools.length === 0) {
            console.log("No schools found for selected region. Setting grouped stats to 0 (except 'all').");
            setGroupedStats({
                all: { attendance: overallCardStats.attendance, totalPossible: overallCardStats.totalPossibleAttendances },
                male: { attendance: 0, totalPossible: 0 },
                female: { attendance: 0, totalPossible: 0 },
                primary: { attendance: 0, totalPossible: 0 },
                intermediate: { attendance: 0, totalPossible: 0 },
                secondary: { attendance: 0, totalPossible: 0 },
            });
            return;
        }

        const schoolsMap = new Map(regionSchools.map(s => [s.school_id, s]));

        const allStudentsInRegion = DataService.getAllStudents().filter(student =>
          schoolsMap.has(student.school_id)
        );
        console.log("Total students in selected region (before specific filtering):", allStudentsInRegion.length);
        if (allStudentsInRegion.length > 0) {
          console.log("Sample student for gender check (ID:", allStudentsInRegion[0]?.student_id, "):", allStudentsInRegion[0]?.gender);
          console.log("Sample school for level check (School ID:", allStudentsInRegion[0]?.school_id, "):", schoolsMap.get(allStudentsInRegion[0]?.school_id)?.educational_level_en);
        }

        const maleStudentIdsInRegion = allStudentsInRegion.filter(s => s.gender === "Male").map(s => s.student_id);
        const femaleStudentIdsInRegion = allStudentsInRegion.filter(s => s.gender === "Female").map(s => s.student_id);
        const primaryStudentIdsInRegion = allStudentsInRegion.filter(s =>
          schoolsMap.get(s.school_id)?.educational_level_en === "Primary"
        ).map(s => s.student_id);
        const intermediateStudentIdsInRegion = allStudentsInRegion.filter(s =>
          schoolsMap.get(s.school_id)?.educational_level_en === "Intermediate"
        ).map(s => s.student_id);
        const secondaryStudentIdsInRegion = allStudentsInRegion.filter(s =>
          schoolsMap.get(s.school_id)?.educational_level_en === "Secondary"
        ).map(s => s.student_id);

        console.log("Male students (IDs filtered) count:", maleStudentIdsInRegion.length);
        console.log("Female students (IDs filtered) count:", femaleStudentIdsInRegion.length);
        console.log("Primary students (IDs filtered) count:", primaryStudentIdsInRegion.length);
        console.log("Intermediate students (IDs filtered) count:", intermediateStudentIdsInRegion.length);
        console.log("Secondary students (IDs filtered) count:", secondaryStudentIdsInRegion.length);


        const newStats = {
          all: { attendance: overallCardStats.attendance, totalPossible: overallCardStats.totalPossibleAttendances },
          male: calculateGroupStats(maleStudentIdsInRegion, cardDateRange),
          female: calculateGroupStats(femaleStudentIdsInRegion, cardDateRange),
          primary: calculateGroupStats(primaryStudentIdsInRegion, cardDateRange),
          intermediate: calculateGroupStats(intermediateStudentIdsInRegion, cardDateRange),
          secondary: calculateGroupStats(secondaryStudentIdsInRegion, cardDateRange),
        };

        console.log("AttendanceStatisticsPage: Loaded grouped stats for region:", selectedRegion, newStats);
        setGroupedStats(newStats);

      } catch (error) {
        console.error("AttendanceStatisticsPage: Error loading grouped stats:", error);
      }
    };

    loadGroupedStats();
  }, [selectedRegion, cardDateRange, calculateGroupStats, overallCardStats]);

  // Effect to load overall system-wide card stats
  useEffect(() => {
    const loadOverallCardStats = () => {
      try {
        const allRegions = DataService.getAllRegions(); // Still assuming no language param needed here
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

        console.log("MinisterPage: Overall Card Date Range:", cardDateRange.startDate.toLocaleString(), "to", cardDateRange.endDate.toLocaleString());

        setOverallCardStats({
          attendance: totalAttendance,
          absence: totalAbsence,
          late: totalLate,
          fines: totalFines,
          totalStudentsInRegion: totalStudentsAcrossAllRegions,
          totalPossibleAttendances: totalPossibleAttendancesAcrossAllRegions,
          rewards: totalRewards,
        });
      } catch (error) {
        console.error("MinisterPage: Error loading overall card stats:", error);
        setOverallCardStats({
          attendance: 0, absence: 0, late: 0, fines: 0,
          totalStudentsInRegion: 0, totalPossibleAttendances: 0, rewards: 0,
        });
      }
    };

    if (cardDateRange.startDate && cardDateRange.endDate) {
      loadOverallCardStats();
    }
  }, [cardDateRange, i18n.language]);

  const handleDateTabClick = useCallback((tab: CardTab) => {
    setCardTab(tab);
    setCardDateRange(getDateRangeForTab(tab));
  }, [getDateRangeForTab]);

  const overallCards = [
    { type: getConsistentTranslatedText("Attendance"), number: overallCardStats.attendance.toLocaleString(), text: getConsistentTranslatedText("student") },
    { type: getConsistentTranslatedText("Absence"), number: overallCardStats.absence.toLocaleString(), text: getConsistentTranslatedText("student") },
    { type: getConsistentTranslatedText("Late"), number: overallCardStats.late.toLocaleString(), text: getConsistentTranslatedText("late student") },
    { type: getConsistentTranslatedText("Fines"), number: overallCardStats.fines.toLocaleString(), text: getConsistentTranslatedText("Saudi Riyal") },
    { type: getConsistentTranslatedText("Rewards"), number: overallCardStats.rewards.toLocaleString(), text: getConsistentTranslatedText("Reward") },
  ];


  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex gap-12">
        <h1 className="text-lg font-black text-[#7C8B9D]">{getConsistentTranslatedText("Statistics")}</h1>
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

      {/* <div className="flex gap-2 justify-between flex-wrap">
        {overallCards.map((card) => (
          <UserCard key={card.type} type={card} />
        ))}
      </div> */}


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