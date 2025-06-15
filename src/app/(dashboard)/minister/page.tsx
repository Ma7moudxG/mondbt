// app/minister/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import DataService, {
  type Student,
  type School,
  type Region,
  type RegionStats,
} from "@/services/dataService";
import MinisterMap from "@/components/MinisterMap";
import DateRange from "@/components/DateRange";
import UserCard from "@/components/UserCard";
import Statistics from "@/components/Statistics";
import MainChart from "@/components/MainChart";
import { validateDataStructure } from "@/utils/dataValidator";
import { useTranslation } from "react-i18next";

const cm = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

interface Stats {
  attendance: number;
  absence: number;
  late: number;
  fines: number;
  totalStudentsInRegion: number;
  totalPossibleAttendances: number;
  rewards: number;
}

type CardTab = "Day" | "Month" | "Year"; // Tabs specifically for cards

const MinisterPage = () => {
  const { t } = useTranslation();

  // START: Hydration Fix - Mounted state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to ensure consistent translated text during SSR
  const getConsistentTranslatedText = (key: string) => {
    if (!mounted) {
      // During SSR, return the key itself or a default English string
      // This ensures the server output is consistent regardless of initial locale
      return key;
    }
    // After hydration, use the actual translation from i18n
    return t(key);
  };
  // END: Hydration Fix

  // State for the card tabs (Day, Month, Year)
  const [cardTab, setCardTab] = useState<CardTab>("Day");
  // State for the date range used by cards
  const [cardDateRange, setCardDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  }); // Initialized, will be updated in useEffect

  // State for the main date range (MinisterMap, Statistics, MainChart)
  // Default to last week as per requirement
  const getInitialMainDateRange = useCallback(
    (
      referenceDate: Date = new Date()
    ): { startDate: Date; endDate: Date } => {
      const today = new Date(referenceDate);
      today.setHours(0, 0, 0, 0);

      const endDate = new Date(today);
      endDate.setDate(today.getDate() - 1); // End of yesterday
      endDate.setHours(23, 59, 59, 999);

      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 30); // 7 days before yesterday's end, plus yesterday itself makes 7 days
      startDate.setHours(0, 0, 0, 0);

      return { startDate, endDate };
    }, [] // useCallback with empty dependency array to memoize the function
  );

  const [mainDateRange, setMainDateRange] = useState(getInitialMainDateRange());
  // Stats specifically for the cards
  const [cardStats, setCardStats] = useState<Stats>({
    attendance: 0,
    absence: 0,
    late: 0,
    fines: 0,
    totalStudentsInRegion: 0,
    totalPossibleAttendances: 0,
    rewards: 0,
  });

  // Stats for MinisterMap, Statistics, MainChart
  const [mainStats, setMainStats] = useState<Stats>({
    attendance: 0,
    absence: 0,
    late: 0,
    fines: 0,
    totalStudentsInRegion: 0,
    totalPossibleAttendances: 0,
    rewards: 0,
  });

  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

  // Helper function to get date range for a specific tab
  const getDateRangeForTab = useCallback(
    (
      tab: CardTab
    ): { startDate: Date; endDate: Date } => {
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999); // End of current day

      const startDate = new Date(endDate); // Initialize startDate with endDate

      if (tab === "Day") {
        startDate.setHours(0, 0, 0, 0); // Start of current day
      } else if (tab === "Month") {
        startDate.setDate(1); // Start of current month
        startDate.setHours(0, 0, 0, 0);
      } else if (tab === "Year") {
        const currentYear = endDate.getFullYear();
        const currentMonth = endDate.getMonth(); // 0-indexed (0 = January, 8 = September)

        // If current month is before September (Jan-Aug), start year from September of the *previous* year
        if (currentMonth < 8) {
          // Month 8 is September
          startDate.setFullYear(currentYear - 1);
          startDate.setMonth(8); // Set to September (month 8)
        } else {
          // If current month is September or later (Sep-Dec), start year from September of the *current* year
          startDate.setFullYear(currentYear);
          startDate.setMonth(8); // Set to September (month 8)
        }
        startDate.setDate(1); // Set to the 1st of September
        startDate.setHours(0, 0, 0, 0); // Set to the very start of the day
      }
      return { startDate, endDate };
    }, [] // useCallback with empty dependency array
  );

  // Effect to set initial selectedRegion and handle initial card date range
  useEffect(() => {
    validateDataStructure();
    const allRegions = DataService.getAllRegions();
    if (allRegions && allRegions.length > 0 && selectedRegion === null) {
      setSelectedRegion(allRegions[0].region_id); // Set the first region as default
    }
    setCardDateRange(getDateRangeForTab(cardTab));
  }, [selectedRegion, cardTab, getDateRangeForTab]); // Added getDateRangeForTab to dependencies

  useEffect(() => {
    const loadCardStats = () => {
      try {
        const allRegions = DataService.getAllRegions();
        if (allRegions.length === 0) {
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

        // Aggregate stats from all regions for the card display
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
          totalAttendance += regionStats.attendance;
          totalAbsence += regionStats.absence;
          totalLate += regionStats.late;
          totalFines += regionStats.penalties;
          totalRewards += regionStats.rewards;
          totalStudentsAcrossAllRegions += regionStats.totalStudentsInRegion;
          totalPossibleAttendancesAcrossAllRegions +=
            regionStats.attendance + regionStats.absence + regionStats.late;
        });

        setCardStats({
          attendance: totalAttendance,
          absence: totalAbsence,
          late: totalLate,
          fines: totalFines,
          totalStudentsInRegion: totalStudentsAcrossAllRegions,
          totalPossibleAttendances: totalPossibleAttendancesAcrossAllRegions,
          rewards: totalRewards,
        });
      } catch (error) {
        console.error("MinisterPage: Error loading card stats:", error);
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
  }, [cardDateRange, cardTab]);

  // Effect to load stats for the main components (map, statistics, chart)
  useEffect(() => {
    const loadMainStats = () => {
      if (!selectedRegion) {
        console.log(
          "MinisterPage: No region selected, awaiting default or user selection for main stats."
        );
        setMainStats({
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

      try {
        console.log(
          "MinisterPage: Loading MAIN stats for region:",
          selectedRegion
        );
        console.log(
          "MinisterPage: MAIN Date range:",
          mainDateRange.startDate.toISOString(),
          mainDateRange.endDate.toISOString()
        );

        const region = DataService.getRegionById(selectedRegion);
        if (!region) {
          setMainStats({
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

        const calculatedStats: RegionStats = DataService.getRegionStats(
          selectedRegion,
          mainDateRange.startDate,
          mainDateRange.endDate
        );

        console.log("MinisterPage: Calculated MAIN stats:", calculatedStats);

        setMainStats({
          attendance: calculatedStats.attendance,
          absence: calculatedStats.absence,
          late: calculatedStats.late,
          fines: calculatedStats.penalties,
          totalStudentsInRegion: calculatedStats.totalStudentsInRegion,
          totalPossibleAttendances:
            calculatedStats.attendance +
            calculatedStats.absence +
            calculatedStats.late,
          rewards: calculatedStats.rewards,
        });
      } catch (error) {
        console.error("MinisterPage: Error loading main stats:", error);
        setMainStats({
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

    loadMainStats();
  }, [mainDateRange, selectedRegion]);

  const handleMainDateRangeChange = (dates: {
    startDate: Date;
    endDate: Date;
  }) => {
    if (dates.startDate.getTime() > dates.endDate.getTime()) {
      console.warn(
        "MinisterPage: Start date cannot be after end date for main date range."
      );
      return;
    }
    setMainDateRange({
      startDate: new Date(dates.startDate.setHours(0, 0, 0, 0)),
      endDate: new Date(dates.endDate.setHours(23, 59, 59, 999)),
    });
  };

  const handleExport = () => {
    if (!selectedRegion) {
      alert(getConsistentTranslatedText("Please select a region first")); // Use helper
      return;
    }

    const { startDate, endDate } = mainDateRange; // Use mainDateRange for export
    const region = DataService.getRegionById(selectedRegion);

    const BOM = "\ufeff";

    const csvContent = [
      [
        getConsistentTranslatedText("Metric"), // Use helper
        getConsistentTranslatedText("Value"), // Use helper
        getConsistentTranslatedText("Unit"), // Use helper
        getConsistentTranslatedText("Start Date"), // Use helper
        getConsistentTranslatedText("End Date"), // Use helper
        getConsistentTranslatedText("Region"), // Use helper
      ],
      [
        getConsistentTranslatedText("Attendance"), // Use helper
        mainStats.attendance,
        getConsistentTranslatedText("Student"), // Use helper
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        region?.name_en || getConsistentTranslatedText("N/A"), // Use helper
      ],
      [
        getConsistentTranslatedText("Absence"), // Use helper
        mainStats.absence,
        getConsistentTranslatedText("Student"), // Use helper
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        region?.name_en || getConsistentTranslatedText("N/A"),
      ],
      [
        getConsistentTranslatedText("Late"), // Use helper
        mainStats.late,
        getConsistentTranslatedText("Student"), // Use helper
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        region?.name_en || getConsistentTranslatedText("N/A"),
      ],
      [
        getConsistentTranslatedText("Fines"), // Use helper
        mainStats.fines,
        getConsistentTranslatedText("Saudi Riyal"), // Use helper
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        region?.name_en || getConsistentTranslatedText("N/A"),
      ],
      [
        getConsistentTranslatedText("Rewards"), // Use helper
        mainStats.rewards,
        getConsistentTranslatedText("Reward"), // Use helper
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        region?.name_en || getConsistentTranslatedText("N/A"),
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
      region?.name_en || getConsistentTranslatedText("all") // Use helper
    }_${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Cards data for the top section (uses cardStats)
  const cards = [
    {
      type: getConsistentTranslatedText("Attendance"), // Use helper
      number: cardStats.attendance.toLocaleString(),
      text: getConsistentTranslatedText("student"), // Use helper
    },
    {
      type: getConsistentTranslatedText("Absence"), // Use helper
      number: cardStats.absence.toLocaleString(),
      text: getConsistentTranslatedText("student"), // Use helper
    },
    {
      type: getConsistentTranslatedText("Late"), // Use helper
      number: cardStats.late.toLocaleString(),
      text: getConsistentTranslatedText("late student"), // Use helper
    },
    {
      type: getConsistentTranslatedText("Fines"), // Use helper
      number: cardStats.fines.toLocaleString(),
      text: getConsistentTranslatedText("Saudi Riyal"), // Use helper
    },
    {
      type: getConsistentTranslatedText("Rewards"), // Use helper
      number: cardStats.rewards.toLocaleString(),
      text: getConsistentTranslatedText("Reward"), // Use helper
    },
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex gap-12">
        <h1 className="text-lg font-black text-[#7C8B9D]">{getConsistentTranslatedText("Statistics")}</h1>{" "}
        <div className="flex flex-wrap justify-center gap-2">
          {/* Tabs for the Cards section */}
          {(["Day", "Month", "Year"] as CardTab[]).map((tab) => (
            <button
              key={tab}
              className={cm(
                "px-4 py-2 rounded-full text-sm transition-colors",
                cardTab === tab
                  ? "bg-[#5EB89D] text-white font-bold"
                  : "text-gray-600 hover:bg-gray-200"
              )}
              onClick={() => {
                setCardTab(tab); // Update the card tab
                setCardDateRange(getDateRangeForTab(tab)); // Update the card date range
              }}
            >
              {getConsistentTranslatedText(tab)} {/* Use helper */}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-between flex-wrap">
        {cards.map((card) => (
          // UserCard should ideally handle its own translation internally if it uses `t()`
          // But since `type` and `text` are passed from `cards` array, they are already pre-translated here
          <UserCard key={card.type} type={card} />
        ))}
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="flex flex-col gap-8 lg:w-1/2 p-8 bg-white rounded-2xl">
          <div className="md:min-h-[300px]">
            {/* MinisterMap uses selectedRegion */}
            <MinisterMap
              key={selectedRegion}
              onRegionSelect={setSelectedRegion}
              selectedRegionId={selectedRegion}
            />
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:w-1/2 p-8 bg-white rounded-2xl">
          {/* DateRange component uses mainDateRange */}
          <DateRange
            onDateChange={handleMainDateRangeChange}
            initialStartDate={mainDateRange.startDate}
            initialEndDate={mainDateRange.endDate}
          />

          {/* Statistics component uses mainStats */}
          <Statistics
            attendance={mainStats.attendance}
            absence={mainStats.absence}
            late={mainStats.late}
            totalStudentsInRegion={mainStats.totalStudentsInRegion}
            totalPossibleAttendances={
              mainStats.attendance + mainStats.late + mainStats.absence
            }
            // rewards={mainStats.rewards} // Pass rewards if Statistics needs it
          />

          <div className="mx-auto">
            <button
              onClick={handleExport}
              className="bg-[#8447AB] py-2 px-6 font-bold text-base text-white rounded-full
                             hover:bg-[#6a3793] transition-colors"
            >
              {getConsistentTranslatedText("Export Report")} {/* Use helper */}
            </button>
          </div>
        </div>
      </div>
      <div className="h-[800px] flex flex-col gap-8 p-8 bg-white rounded-2xl">
        {/* MainChart uses mainDateRange and selectedRegion */}
        <MainChart
          startDate={mainDateRange.startDate}
          endDate={mainDateRange.endDate}
          regionId={selectedRegion}
        />
      </div>
    </div>
  );
};

export default MinisterPage;