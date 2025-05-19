"use client";
import React, { useState } from "react";
import PieChart from "./AttendanceChart";
import Image from "next/image";

const cm = (...classes: (string | boolean)[]) => {
  return classes.filter(Boolean).join(" ");
};

const students = [
  {
    id: 11,
    name: "Ahmed Ali Ibrahim Mahmoud",
    grade: "Grade 3",
    photo: "/profile.png",
  },
  {
    id: 12,
    name: "Adham Mahmoud Ibrahim Mahmoud",
    grade: "Grade 3",
    photo: "/profile.png",
  },
  {
    id: 13,
    name: "Ahmed Ali Ibrahim Mahmoud",
    grade: "Grade 3",
    photo: "/profile.png",
  },
  {
    id: 14,
    name: "Adham Mahmoud Ibrahim Mahmoud",
    grade: "Grade 3",
    photo: "/profile.png",
  },
  {
    id: 15,
    name: "Ahmed Ali Ibrahim Mahmoud",
    grade: "Grade 3",
    photo: "/profile.png",
  },
  {
    id: 16,
    name: "Adham Mahmoud Ibrahim Mahmoud",
    grade: "Grade 3",
    photo: "/profile.png",
  },
  {
    id: 17,
    name: "Ahmed Ali Ibrahim Mahmoud",
    grade: "Grade 3",
    photo: "/profile.png",
  },
  {
    id: 18,
    name: "Ahmed Ali Ibrahim Mahmoud",
    grade: "Grade 3",
    photo: "/profile.png",
  },
];
const schools = [
  {
    id: 11,
    name: "school 1",
  },
  {
    id: 12,
    name: "school 2",
  },
  {
    id: 13,
    name: "school 13",
  },
  {
    id: 14,
    name: "school 14",
  },
  {
    id: 15,
    name: "school 15",
  },
];
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
              rightTab === "Schools" &&
                "bg-[#5EB89D] shadow-xs text-sm text-white font-bold"
            )}
            onClick={() => setRightTab("Schools")}
          >
            Schools
          </button>
          <button
            className={cm(
              "px-4 py-2 rounded-full text-xs w-1/2",
              rightTab === "Students" &&
                "bg-[#5EB89D] shadow-xs text-sm text-white font-bold"
            )}
            onClick={() => setRightTab("Students")}
          >
            Students
          </button>
        </div>
        {rightTab === "Schools" ? (
          <div className="h-full flex flex-col justify-between py-8">
            <div className="flex flex-col gap-4">
              {schools.map((school) => (
                <div key={school.id} className="flex items-center gap-2">

                  <div>
                    <p className="text-sm text-[#797c80]">{school.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
            <div className="h-full flex flex-col justify-between py-8">
            <div className="flex flex-col justify-between items-center gap-2">
              {students.map((student) => (
                <div key={student.id} className="flex items-center gap-2">
                  <div>
                    <Image
                      src={student.photo}
                      alt="view"
                      height={32}
                      width={32}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-[#797c80]">{student.name}</p>
                    <p className="text-xs text-[#797c80]">
                      Grade {student.grade}
                    </p>
                  </div>
                  <div>
                    <Image
                      src="view.svg"
                      alt="view"
                      height={16}
                      width={16}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="bg-white rounded-2xl lg:w-1/2 flex md:block justify-center p-4">
        <div className="rounded-full border">
          <button
            className={cm(
              "px-4 py-2 rounded-full text-xs w-1/2",
              leftTab === "Statistics" &&
                "bg-[#5EB89D] shadow-xs text-sm text-white font-bold"
            )}
            onClick={() => setLeftTab("Statistics")}
          >
            Statistics
          </button>
          <button
            className={cm(
              "px-4 py-2 rounded-full text-xs w-1/2",
              leftTab === "Students" &&
                "bg-[#5EB89D] shadow-xs text-sm text-white font-bold"
            )}
            onClick={() => setLeftTab("Students")}
          >
            Reports
          </button>
        </div>
        {leftTab === "Statistics" ? (
          <div className="h-full flex flex-col justify-between py-8">
            <div className="flex justify-between items-center">
              <p>Attendance</p>
              <PieChart />
            </div>
            <div className="flex justify-between items-center">
              <p>Absence</p>
              <PieChart />
            </div>
            <div className="flex justify-between items-center">
              <p>Rewards</p>
              <PieChart />
            </div>
          </div>
        ) : (
          <div>Reports</div>
        )}
      </div>
    </div>
  );
};

export default AdminDataReports;
