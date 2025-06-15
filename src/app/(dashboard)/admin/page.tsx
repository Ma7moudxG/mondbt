"use client";
import UserCard from "@/components/UserCard";
import React, { useEffect, useState, useCallback } from "react";
import DetailedMap from "@/components/DetailedMap"; // This component seems unused in the provided code
import FilteredSearch from "@/components/FilteredSearch";
import AdminDataReports from "@/components/AdminDataReports";
import DataService, {
  type School,
  type Excuse,
  type FilterValues,
  type Stats as DataServiceStats,
  type Student // Import Student type if you have it
} from "@/services/dataService";
import SchoolMap from "@/components/SchoolMap";
import { useTranslation } from "react-i18next";
import { AdminExcuses } from "@/components/AdminExcuses";

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

const AdminPage = () => {
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

  const [filters, setFilters] = useState<FilterValues>({
    region: '',
    city: '',
    area: '',
    schoolName: '',
    schoolType: '',
    ministryNumber: '',
    sex: '',
  });

  const [results, setResults] = useState<School[]>([]);
  const [filteredStudentIdsForExport, setFilteredStudentIdsForExport] = useState<number[]>([]); // New state for student IDs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

    const initialDateRange = getDateRangeForTab("Day");
    setCardDateRange(initialDateRange);
    setDateRange(initialDateRange);
  }, [i18n.language]);

  const loadFilteredData = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      console.log("AdminPage: Filtering data with filters:", filters, "and date range:", dateRange.startDate.toLocaleDateString(), "to", dateRange.endDate.toLocaleDateString());

      const schoolFilterCriteria = {
        region: filters.region,
        city: filters.city,
        area: filters.area,
        schoolName: filters.schoolName,
        ministryNumber: filters.ministryNumber,
        schoolType: filters.schoolType,
        sex: filters.sex,
      };

      console.log("AdminPage: schoolFilterCriteria passed to DataService.getSchoolsByFilters:", schoolFilterCriteria);

      // Pass the current language to DataService.getSchoolsByFilters
      let filteredSchools = DataService.getSchoolsByFilters(schoolFilterCriteria, i18n.language);
      console.log("AdminPage: Number of schools returned by DataService.getSchoolsByFilters (initial school-level filter):", filteredSchools.length);

      let studentIdsFromFilteredSchools: number[] = DataService.getStudentsInSchools(
        filteredSchools.map(s => s.school_id)
      );
      console.log("AdminPage: Found", studentIdsFromFilteredSchools.length, "students initially in filtered schools.");

      let finalFilteredStudentIds: number[] = studentIdsFromFilteredSchools;
      if (filters.sex && filters.sex.trim() !== '') {
        console.log("AdminPage: Passing these student IDs to getStudentsBySex:", finalFilteredStudentIds.length, finalFilteredStudentIds.slice(0, 50));
        // Note: getStudentsBySex should internally handle sex filtering, probably not needing `i18n.language`
        // unless the `sex` filter value itself needs translation mapping, which DataService.getSchoolsByFilters now handles.
        finalFilteredStudentIds = DataService.getStudentsBySex(studentIdsFromFilteredSchools, filters.sex, i18n.language); // Pass language here as well
        console.log("AdminPage: After sex filter ('", filters.sex, "'), found", finalFilteredStudentIds.length, "students.");
      }

      let schoolsToDisplay = filteredSchools;

      if (finalFilteredStudentIds.length === 0 && (filters.sex && filters.sex.trim() !== '')) {
        schoolsToDisplay = [];
        console.log("AdminPage: No students found after sex filter, so no schools will be displayed.");
      } else if (finalFilteredStudentIds.length > 0 && (filters.sex && filters.sex.trim() !== '')) {
        const schoolIdsWithFilteredStudents = new Set<number>();
        DataService.getAllStudents().forEach(student => {
          if (finalFilteredStudentIds.includes(student.student_id)) {
            schoolIdsWithFilteredStudents.add(student.school_id);
          }
        });

        schoolsToDisplay = filteredSchools.filter(school =>
          schoolIdsWithFilteredStudents.has(school.school_id)
        );
        console.log("AdminPage: Schools refined based on filtered students (sex filter):", schoolsToDisplay.length);
      }

      setResults(schoolsToDisplay);
      setFilteredStudentIdsForExport(finalFilteredStudentIds); // Store for export

      const calculatedStats: DataServiceStats = {
        attendance: DataService.calculateAttendance(finalFilteredStudentIds, dateRange.startDate, dateRange.endDate),
        absence: DataService.countAbsences(finalFilteredStudentIds, dateRange.startDate, dateRange.endDate),
        late: DataService.countLateArrivals(finalFilteredStudentIds, dateRange.startDate, dateRange.endDate),
        fines: DataService.sumPenalties(finalFilteredStudentIds, dateRange.startDate, dateRange.endDate),
      };

      setStats(calculatedStats);
      console.log("AdminPage: Calculated main stats (for filtered data):", calculatedStats);

    } catch (err) {
      console.error("AdminPage: Error loading filtered data:", err);
      setError(t("Failed to load data. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [filters, dateRange, t, i18n.language]); // Add i18n.language to dependencies

  useEffect(() => {
    console.log("AdminPage: Main Data Date Range (for reports):", dateRange.startDate.toLocaleString(), "to", dateRange.endDate.toLocaleString());
    loadFilteredData();
  }, [loadFilteredData]);

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
      if (currentMonth < 8) { // Assuming school year starts in September (month 8)
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
  }, []);

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
    const loadCardStats = () => {
      try {
        const allRegions = DataService.getAllRegions(); // Pass language to get all regions
        if (!allRegions || allRegions.length === 0) {
          setCardStats({
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
          console.log("daaaaaaaaaaaaaaaaaaaaaaaaaaaaate", cardDateRange.startDate)
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

        console.log("AdminPage: Card Date Range (for cards):", cardDateRange.startDate.toLocaleString(), "to", cardDateRange.endDate.toLocaleString());

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
        console.error("AdminPage: Error loading card stats:", error);
        setCardStats({
          attendance: 0, absence: 0, late: 0, fines: 0,
          totalStudentsInRegion: 0, totalPossibleAttendances: 0, rewards: 0,
        });
      }
    };

    if (cardDateRange.startDate && cardDateRange.endDate) {
      loadCardStats();
    }
  }, [cardDateRange, i18n.language]); // Add i18n.language to dependencies

  const handleDateChange = useCallback((dates: { startDate: Date; endDate: Date }) => {
    setDateRange(dates);
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    loadFilteredData(); // This will now use the latest filters and i18n.language
  }, [loadFilteredData]);

  const cards = [
    { type: t("Attendance"), number: cardStats.attendance.toLocaleString(), text: t("student") },
    { type: t("Absence"), number: cardStats.absence.toLocaleString(), text: t("student") },
    { type: t("Late"), number: cardStats.late.toLocaleString(), text: t("late student") },
    { type: t("Fines"), number: cardStats.fines.toLocaleString(), text: t("Saudi Riyal") },
    { type: t("Rewards"), number: cardStats.rewards.toLocaleString(), text: t("Reward") },
  ];
  type EnrichedExcuse = Excuse & {
    studentFirstName: string | null;
    studentLastName: string | null;
    descriptionText: string | null;
  };

  const [excusesForStudents, setExcusesForStudents] = useState<EnrichedExcuse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const excuses = await DataService.getExcuses();
        const enrichedExcusesPromises = excuses.map(async (excuse) => {
          const [firstName, lastName] = await DataService.getStudentNameById(
            excuse.student_id,
            i18n.language
          );

          const descriptionText = await DataService.getExcuseDescriptionById(
            excuse.reason_id.toLocaleString(),
            i18n.language
          );

          return {
            ...excuse,
            studentFirstName: firstName,
            studentLastName: lastName,
            descriptionText: descriptionText,
          } as EnrichedExcuse;
        });

        const enrichedExcuses = await Promise.all(enrichedExcusesPromises);
        console.log("Enriched excuses ready for table:", enrichedExcuses);
        setExcusesForStudents(enrichedExcuses);

      } catch (err) {
        console.error("Failed to fetch parent page data:", err);
        setError(t("failed_to_load_data"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t, i18n.language]);

  const handleExport = useCallback(async () => { // Made async to await getExcuses
    const BOM = "\ufeff";
    const csvRows: string[] = [];

    // --- Section 1: Applied Filters ---
    csvRows.push(t("Applied Filters"));
    csvRows.push(`${t("Filter Name")},${t("Value")}`);
    for (const key in filters) {
      if (filters.hasOwnProperty(key) && filters[key as keyof FilterValues] && filters[key as keyof FilterValues] !== '') { // Added check for empty strings
        csvRows.push(`${t(key)},"${filters[key as keyof FilterValues]}"`); // Quoted value
      }
    }
    csvRows.push(''); // Empty line for separation

    // --- Section 2: Summary Statistics (from filtered data) ---
    csvRows.push(t("Filtered Data Summary Statistics"));
    csvRows.push(`${t("Metric")},${t("Value")},${t("Unit")},${t("Start Date")},${t("End Date")}`);
    csvRows.push(`${t("Attendance")},${stats.attendance},${t("Student")},${dateRange.startDate.toISOString().split("T")[0]},${dateRange.endDate.toISOString().split("T")[0]}`);
    csvRows.push(`${t("Absence")},${stats.absence},${t("Student")},${dateRange.startDate.toISOString().split("T")[0]},${dateRange.endDate.toISOString().split("T")[0]}`);
    csvRows.push(`${t("Late")},${stats.late},${t("Student")},${dateRange.startDate.toISOString().split("T")[0]},${dateRange.endDate.toISOString().split("T")[0]}`);
    csvRows.push(`${t("Fines")},${stats.fines},${t("Saudi Riyal")},${dateRange.startDate.toISOString().split("T")[0]},${dateRange.endDate.toISOString().split("T")[0]}`);
    csvRows.push(''); // Empty line for separation

    // --- Section 3: Filtered Schools Details ---
    csvRows.push(t("Filtered Schools Details"));
    csvRows.push(`${t("School ID")},${t("School Name (EN)")},${t("School Name (AR)")},${t("Region")},${t("City")},${t("Area")},${t("Ministry Number")},${t("School Type")},${t("Gender Type")}`);

    results.forEach(school => {
      // These functions need to be robust in DataService to return appropriate names
      const regionName = DataService.getRegionNameFromId(school.region_id, i18n.language);
      const cityName = DataService.getCityNameFromId(school.city_id, i18n.language);
      const areaName = DataService.getAreaNameFromId(school.area_id, i18n.language);
      const schoolTypeName = DataService.getEducationTypeNameFromId(school.education_type_id, i18n.language);

      csvRows.push([
        school.school_id,
        `"${school.name_en}"`,
        `"${school.name_ar}"`,
        `"${regionName || t("N/A")}"`,
        `"${cityName || t("N/A")}"`,
        `"${areaName || t("N/A")}"`,
        `"${school.ministerial_number || t("N/A")}"`,
        `"${schoolTypeName || t("N/A")}"`,
        `"${school.type_en || t("N/A")}"`
      ].join(','));
    });
    csvRows.push(''); // Empty line for separation

    // --- Section 4: Filtered Students Details ---
    csvRows.push(t("Filtered Students Details"));
    csvRows.push(`${t("Student ID")},${t("First Name (EN)")},${t("Last Name (EN)")},${t("First Name (AR)")},${t("Last Name (AR)")},${t("School Name (EN)")},${t("School Name (AR)")},${t("Gender")}`);

    const allStudents = DataService.getAllStudents();
    const studentsToExport = allStudents.filter(student => filteredStudentIdsForExport.includes(student.student_id));

    studentsToExport.forEach(student => {
      const school = DataService.getSchoolById(student.school_id);
      const schoolNameEn = school ? school.name_en : t("N/A");
      const schoolNameAr = school ? school.name_ar : t("N/A");
      const [firstNameEn, lastNameEn] = DataService.getStudentNameById(student.student_id, 'en');
      const [firstNameAr, lastNameAr] = DataService.getStudentNameById(student.student_id, 'ar');

      csvRows.push([
        student.student_id,
        `"${firstNameEn || t("N/A")}"`,
        `"${lastNameEn || t("N/A")}"`,
        `"${firstNameAr || t("N/A")}"`,
        `"${lastNameAr || t("N/A")}"`,
        `"${schoolNameEn}"`,
        `"${schoolNameAr}"`,
        `"${student.gender || t("N/A")}"`
      ].join(','));
    });
    csvRows.push(''); // Empty line for separation

    const finalCsvContent = BOM + csvRows.join("\n");

    const blob = new Blob([finalCsvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${t("Admin_Report")}_${dateRange.startDate.toISOString().split("T")[0]}_${dateRange.endDate.toISOString().split("T")[0]}_${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filters, stats, dateRange, results, filteredStudentIdsForExport, t, i18n.language]); // Removed excusesForStudents from dependencies


  return (
    <div className="p-4 flex flex-col gap-8">

      <div className="flex gap-12 items-center">
        <h1 className="text-lg font-black text-[#7C8B9D]">{t("Statistics")}</h1>
        <div className="flex flex-wrap justify-center gap-2">
          {([t("Day"), t("Month"), t("Year")] as CardTab[]).map((tab) => ( // Translate tab names here
            <button
              key={tab}
              className={cm(
                "px-4 py-2 rounded-full text-sm transition-colors",
                t(cardTab) === tab // Compare translated tab with translated current tab
                  ? "bg-[#5EB89D] text-white font-bold"
                  : "text-gray-600 hover:bg-gray-200"
              )}
              onClick={() => {
                const originalTab = Object.keys({ "Day": t("Day"), "Month": t("Month"), "Year": t("Year") }).find(key => t(key as CardTab) === tab) as CardTab;
                const newDateRange = getDateRangeForTab(originalTab);
                setCardTab(originalTab); // Store original English tab name in state
                setCardDateRange(newDateRange);
                setDateRange(newDateRange);
              }}
            >
              {tab} {/* Display the translated tab name */}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-between flex-wrap">
        {cards.map((i) => (
          <UserCard key={i.type} type={i} />
        ))}
      </div>

      <FilteredSearch
        onFilterChange={handleFilterChange}
        onSearchSubmit={handleSearchSubmit}
      />

     <div className="flex gap-4 flex-col lg:flex-row">
        <div className="flex flex-col gap-8 lg:w-1/2">
          <AdminDataReports
            schools={results}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>
        <div className="flex flex-col gap-8 lg:w-1/2 p-8 bg-white rounded-2xl">
          <div className="h-[400px]">
            <div className="mb-8">
              <SchoolMap schools={results} />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto">
        <button
          onClick={handleExport}
          className="bg-[#8447AB] py-2 px-6 font-bold text-base text-white rounded-full
                             hover:bg-[#6a3793] transition-colors"
        >
          {t("Export Report")}
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-black text-[#7C8B9D]">{t("Excuses")}</h1>
        <AdminExcuses items={excusesForStudents} />
      </div>
    </div>
  );
};

export default AdminPage;