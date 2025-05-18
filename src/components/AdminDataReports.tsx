"use client";
import React, { useState } from "react";

const cm = (...classes: (string | boolean)[]) => {
  return classes.filter(Boolean).join(" ");
};

const AdminDataReports = () => {
  const [leftTab, setLeftTab] = useState("Statistics");
  const [rightTab, setRightTab] = useState("Schools");

  return (
    <div className="flex gap-4 flex-col lg:flex-row h-[100%]">
      <div className="bg-white rounded-2xl lg:w-1/2 flex md:block justify-center p-4">
        <div className="rounded-full border">
          <button
            className={cm(
              "px-4 py-2 rounded-full text-xs w-1/2",
              leftTab === "Statistics" && "bg-[#5EB89D] shadow-xs text-sm text-white font-bold"
            )}
            onClick={() => setLeftTab("Statistics")}
          >
            Statistics
          </button>
          <button
            className={cm(
              "px-4 py-2 rounded-full text-xs w-1/2",
              leftTab === "Students" && "bg-[#5EB89D] shadow-xs text-sm text-white font-bold"
            )}
            onClick={() => setLeftTab("Students")}
          >
            Reports
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl lg:w-1/2 flex md:block justify-center p-4">
        <div className="rounded-full border">
          <button
            className={cm(
              "px-4 py-2 rounded-full text-xs w-1/2",
              rightTab === "Students" && "bg-[#5EB89D] shadow-xs text-sm text-white font-bold"
            )}
            onClick={() => setRightTab("Students")}
          >
            Students
          </button>
          <button
            className={cm(
              "px-4 py-2 rounded-full text-xs w-1/2",
              rightTab === "Schools" && "bg-[#5EB89D] shadow-xs text-sm text-white font-bold"
            )}
            onClick={() => setRightTab("Schools")}
          >
            Schools
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDataReports;
