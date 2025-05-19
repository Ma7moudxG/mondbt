"use client";
import MainChart from "@/components/MainChart";
import MinisterMap from "@/components/MinisterMap";
import DateRange from "@/components/DateRange";
import UserCard from "@/components/UserCard";
import React, { useState } from "react";
import Statistics from "@/components/Statistics";

const cards = [
  { type: "Attendance", number: "5,983,404", text: "student" },
  { type: "Absence", number: "314,916", text: "student" },
  { type: "Late", number: "1,180,935", text: "late student" },
  { type: "Excuses", number: "12,650", text: "Excuse" },
  { type: "Fines", number: "1,020,935", text: "Saudi Riyal" },
];

const MinisterPage = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [selectedRegion, setSelectedRegion] = useState<{
    code: string;
    name: string;
  } | null>(null);

  const handleDateChange = (dates: { startDate: Date; endDate: Date }) => {
    setDateRange(dates);
  };

  const handleRegionSelect = (code: string, name: string) => {
    setSelectedRegion({ code, name });
  };

  const handleExport = () => {
    if (!selectedRegion) {
      alert("Error: Please select a region from the map first.");
      return;
    }

    // Create CSV content
    const csvContent = [
      ["Region Code", "Region Name", "Start Date", "End Date", "Metric", "Value", "Unit"],
      ...cards.map(card => [
        selectedRegion.code,
        selectedRegion.name,
        dateRange.startDate.toISOString().split("T")[0],
        dateRange.endDate.toISOString().split("T")[0],
        card.type,
        card.number,
        card.text
      ])
    ].map(e => e.join(",")).join("\n");

    // Create and download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `report_${selectedRegion.code}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-black text-[#7C8B9D]">Statistics</h1>
      </div>
      
      {/* Cards Section */}
      <div className="flex gap-2 justify-between flex-wrap">
        {cards.map((card) => (
          <UserCard key={card.type} type={card} />
        ))}
      </div>

      {/* Main Content */}
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Left Section */}
        <div className="flex flex-col gap-8 lg:w-1/2 p-8 bg-white rounded-2xl">
          <div className="md:min-h-[300px]">
            <MinisterMap 
              onRegionSelect={handleRegionSelect}
              selectedRegionCode={selectedRegion?.code}
            />
          </div>
          <DateRange onDateChange={handleDateChange} />
          <Statistics />
          <div className="mx-auto">
            <button
              onClick={handleExport}
              className="bg-[#8447AB] py-2 px-6 font-bold text-base text-white rounded-full hover:bg-[#6a3793] transition-colors"
            >
              Export Report
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col gap-8 lg:w-1/2 p-8 bg-white rounded-2xl">
          <div className="h-[100%]">
            <MainChart />
          </div>
          <DateRange onDateChange={handleDateChange} />
        </div>
      </div>
    </div>
  );
};

export default MinisterPage;