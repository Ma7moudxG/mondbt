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

interface FilterValues {
  region: string;
  city: string;
  schoolName: string;
  schoolType: string;
  ministryNumber: string;
  sex: string;
}

const cards = [
  {
    type: "Attendance",
    number: "5,983,404",
    text: "student",
  },
  {
    type: "Absence",
    number: "314,916",
    text: "student",
  },
  {
    type: "Late",
    number: "1,180,935",
    text: "late student",
  },
  {
    type: "Excuses",
    number: "12,650",
    text: "Excuse",
  },
  {
    type: "Fines",
    number: "1,020,935",
    text: "Saudi Riyal",
  },
];

const AdminPage = () => {
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: new Date(),
    endDate: new Date(),
  });

  const handleDateChange = (dates: { startDate: Date; endDate: Date }) => {
    setDateRange(dates);
    // Pass to other functions here
    console.log("Selected dates:", dates);
  };

   // Explicit search action
  const handleSearchSubmit = () => {
    // Optional: Force refresh or additional actions
    fetchResults(filters, true);
  };

  const [filters, setFilters] = useState<FilterValues>({
    region: '',
    city: '',
    schoolName: '',
    schoolType: '',
    ministryNumber: '',
    sex: '',
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock implementation of fetchResults
  const fetchResults = async (filters: FilterValues, forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulated API call - replace with actual API endpoint
      const mockData = [
        {
          id: 1,
          name: "مدرسة الرياض الثانوية",
          region: "الرياض",
          type: "حكومي",
          ministryNumber: "M12345"
        },
        // Add more mock data entries
      ];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResults(mockData);
    } catch (err) {
      setError("فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect for real-time filtering
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (Object.values(filters).some(value => value !== '')) {
        fetchResults(filters);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters]);

  return (
    
    

    <div className="p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-black text-[#7C8B9D]">Statistics </h1>
        <div>{/* menu ( day - month - year )  */}</div>
      </div>
      {/* USER CARDS */}
      <div className="flex gap-2 justify-between flex-wrap">
        {cards.map((i) => (
          <UserCard key={i.type} type={i} />
        ))}
      </div>
      {/* ... rest of the component */}
      <FilteredSearch
        onFilterChange={setFilters}
        onSearchSubmit={handleSearchSubmit}
      />
      
      {/* Add loading and error states */}
      {loading && (
        <div className="p-4 text-center text-gray-500">Loading...</div>
      )}
      
      {error && (
        <div className="p-4 text-center text-red-500">{error} No Schools were found</div>
      )}

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* LEFT */}
        <div className="flex flex-col gap-8 lg:w-1/2 p-8 bg-white rounded-2xl">
          <div className="h-[400px]">
            <DetailedMap  />
          </div>
        </div>
        
        {/* RIGHT */}
        <div className="flex flex-col gap-8 lg:w-1/2">
          <AdminDataReports />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
