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

const cm = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

interface Stats {
  attendance: number;
  absence: number;
  late: number;
  fines: number;
  totalStudentsInRegion: number;
  totalPossibleAttendances: number;
  rewards: number; // Include rewards for cards too
}

type CardTab = "Day" | "Month" | "Year"; // Tabs specifically for cards

const MinisterPage = () => {
  // State for the card tabs (Day, Month, Year)
  const [cardTab, setCardTab] = useState<CardTab>("Day");
  // State for the date range used by cards
  const [cardDateRange, setCardDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  }); // Initialized, will be updated in useEffect

  // State for the main date range (MinisterMap, Statistics, MainChart)
  // Default to last week as per requirement
  const getInitialMainDateRange = (referenceDate: Date = new Date()): { startDate: Date; endDate: Date } => {
    // Clone the referenceDate to avoid modifying the original
    const today = new Date(referenceDate);
    today.setHours(0, 0, 0, 0); // Set to the very start of the current day

    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 1); // End of the day before today (yesterday)
    endDate.setHours(23, 59, 59, 999); // Set to the very end of yesterday

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 7); // 7 days before yesterday's end, plus yesterday itself makes 7 days
    startDate.setHours(0, 0, 0, 0); // Set to the very start of the day 7 days ago

    console.log("Initial Main Date Range (Last Week):");
    console.log("  Reference Date:", referenceDate.toISOString()); // For debugging if needed
    console.log("  Start Date:", startDate.toISOString());
    console.log("  End Date:", endDate.toISOString());

    return { startDate, endDate };
  };

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
  const getDateRangeForTab = (
    tab: CardTab
  ): { startDate: Date; endDate: Date } => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date(endDate);

    if (tab === "Day") {
      startDate.setHours(0, 0, 0, 0); // Start of current day
    } else if (tab === "Month") {
      startDate.setDate(1); // Start of current month
      startDate.setHours(0, 0, 0, 0);
    } else if (tab === "Year") {
      startDate.setMonth(0); // January
      startDate.setDate(1); // 1st
      startDate.setHours(0, 0, 0, 0); // Start of current year
    }
    return { startDate, endDate };
  };

  // Effect to set initial selectedRegion and handle initial card date range
  useEffect(() => {
    validateDataStructure();
    const allRegions = DataService.getAllRegions();
    if (allRegions && allRegions.length > 0 && selectedRegion === null) {
      setSelectedRegion(allRegions[0].region_id); // Set the first region as default
      console.log(
        "MinisterPage: Initial region set to:",
        allRegions[0].name_en,
        allRegions[0].region_id
      );
    }
    setCardDateRange(getDateRangeForTab(cardTab));
  }, []); // Run once on mount for initial setup. selectedRegion is in the dependency array for loadMainStats.
  
  
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

        console.log("reeeeeeeeeeee", totalFines)

        setCardStats({
          attendance: totalAttendance,
          absence: totalAbsence,
          late: totalLate,
          fines: totalFines,
          totalStudentsInRegion: totalStudentsAcrossAllRegions, // This might need clarification: total students in ALL regions for cards, or selected? Assuming ALL.
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
      // Ensure dates are valid
      loadCardStats();
    }
  }, [cardDateRange, cardTab]); // cardTab included as a dependency to ensure update on tab change
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
          console.error(
            "MinisterPage: Region not found in school data for ID:",
            selectedRegion
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
  }, [mainDateRange, selectedRegion]); // Dependency array for re-fetching main stats

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
      alert("Please select a region first");
      return;
    }

    const { startDate, endDate } = mainDateRange; // Use mainDateRange for export
    const region = DataService.getRegionById(selectedRegion);

    const csvContent = [
      ["Metric", "Value", "Unit", "Start Date", "End Date", "Region"],
      [
        "Attendance",
        mainStats.attendance,
        "students",
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        region?.name_en || "N/A",
      ],
      [
        "Absence",
        mainStats.absence,
        "students",
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        region?.name_en || "N/A",
      ],
      [
        "Late Arrivals",
        mainStats.late,
        "students",
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        region?.name_en || "N/A",
      ],
      [
        "Fines",
        mainStats.fines,
        "SAR",
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        region?.name_en || "N/A",
      ],
      [
        "Rewards",
        mainStats.rewards,
        "count",
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        region?.name_en || "N/A",
      ],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report_${
      region?.name_en || "all"
    }_${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Cards data for the top section (uses cardStats)
  const cards = [
    {
      type: "Attendance",
      number: cardStats.attendance.toLocaleString(),
      text: "student",
    },
    {
      type: "Absence",
      number: cardStats.absence.toLocaleString(),
      text: "student",
    },
    {
      type: "Late",
      number: cardStats.late.toLocaleString(),
      text: "late student",
    },
    {
      type: "Fines",
      number: cardStats.fines.toLocaleString(),
      text: "Saudi Riyal",
    },
    {
      type: "Rewards",
      number: cardStats.rewards.toLocaleString(),
      text: "count",
    },
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex gap-12">
        <h1 className="text-lg font-black text-[#7C8B9D]">Statistics</h1>
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
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-between flex-wrap">
        {cards.map((card) => (
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

          {/* DateRange component uses mainDateRange */}
          <DateRange
            onDateChange={handleMainDateRangeChange} // New handler for main date range
            initialStartDate={mainDateRange.startDate}
            initialEndDate={mainDateRange.endDate}
          />

          {/* Statistics component uses mainStats */}
          <Statistics
            attendance={mainStats.attendance}
            absence={mainStats.absence}
            late={mainStats.late}
            totalPossibleAttendances={mainStats.totalPossibleAttendances}
            // rewards={mainStats.rewards} // Pass rewards if Statistics needs it
          />

          <div className="mx-auto">
            <button
              onClick={handleExport}
              className="bg-[#8447AB] py-2 px-6 font-bold text-base text-white rounded-full
                               hover:bg-[#6a3793] transition-colors"
            >
              Export Report
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:w-1/2 p-8 bg-white rounded-2xl">
          <div className="h-[400px]">
            {/* MainChart uses mainDateRange and selectedRegion */}
            <MainChart
              startDate={mainDateRange.startDate}
              endDate={mainDateRange.endDate}
              regionId={selectedRegion}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinisterPage;
