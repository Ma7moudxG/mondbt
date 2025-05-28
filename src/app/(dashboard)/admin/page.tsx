"use client";
import MainChart from "@/components/MainChart";
import MinisterMap from "@/components/MinisterMap";
import DateRange from "@/components/DateRange";
import UserCard from "@/components/UserCard";
import React, { useEffect, useState } from "react";
import Statistics from "@/components/Statistics";
import DetailedMap from "@/components/DetailedMap";
import FilteredSearch from "@/components/FilteredSearch";
import AdminDataReports from "@/components/AdminDataReports";
import DataService, { 
  type School,
  type Region,
  type City,
  type FilterValues 
} from "@/services/dataService";

// interface Stats {
//   attendance: number;
//   absence: number;
//   late: number;
//   excuses: number;
//   fines: number;
// }

const AdminPage = () => {
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: new Date(),
    endDate: new Date(),
  });

  const [stats, setStats] = useState<DataService.Stats>({
    attendance: 0,
    absence: 0,
    late: 0,
    excuses: 0,
    fines: 0,
  });

  const [filters, setFilters] = useState<FilterValues>({
    region: '',
    city: '',
    schoolName: '',
    schoolType: '',
    ministryNumber: '',
    sex: '',
  });

  const [results, setResults] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial stats
  useEffect(() => {
    loadStatistics();
  }, [dateRange, filters]);

  const loadStatistics = () => {
    const filteredSchools = DataService.getSchoolsByFilters(filters);
    const studentIds = DataService.getStudentsInSchools(filteredSchools.map(s => s.school_id));
    
    const stats = {
      attendance: DataService.calculateAttendance(studentIds, dateRange.startDate, dateRange.endDate),
      absence: DataService.countAbsences(studentIds, dateRange.startDate, dateRange.endDate),
      late: DataService.countLateArrivals(studentIds, dateRange.startDate, dateRange.endDate),
      // excuses: DataService.countExcuses(studentIds, dateRange.startDate, dateRange.endDate),
      fines: DataService.sumPenalties(studentIds, dateRange.startDate, dateRange.endDate)
    };

    setStats(stats);
  };

  const handleDateChange = (dates: { startDate: Date; endDate: Date }) => {
    setDateRange(dates);
  };

  const handleSearchSubmit = () => {
    fetchResults(filters);
  };

  const fetchResults = async (filters: FilterValues) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = DataService.getSchoolsByFilters(filters);
      setResults(results);
    } catch (err) {
      setError("فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { type: "Attendance", number: stats.attendance.toLocaleString(), text: "student" },
    { type: "Absence", number: stats.absence.toLocaleString(), text: "student" },
    { type: "Late", number: stats.late.toLocaleString(), text: "late student" },
    // { type: "Excuses", number: stats.excuses.toLocaleString(), text: "Excuse" },
    { type: "Fines", number: stats.fines.toLocaleString(), text: "Saudi Riyal" },
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-black text-[#7C8B9D]">Statistics</h1>
        <DateRange onDateChange={handleDateChange} />
      </div>

      {/* Statistics Cards */}
      <div className="flex gap-2 justify-between flex-wrap">
        {cards.map((i) => (
          <UserCard key={i.type} type={i} />
        ))}
      </div>

      <FilteredSearch
        onFilterChange={setFilters}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Search Results */}
      {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
      {error && <div className="p-4 text-center text-red-500">{error}</div>}

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
            <DetailedMap 
              schools={results}
              regionFilter={filters.region}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;