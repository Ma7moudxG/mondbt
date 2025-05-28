
"use client";
import DataService, { StudentDetails, Reward, Penalty, Excuse } from "@/services/dataService";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import ParentFinesTable from "@/components/ParentFinesTable"; // This component needs to be updated to accept studentId
import ParentExcuses from "@/components/ParentExcuses"; // This component needs to be updated to accept studentId

  const rewards = [
    {
      img: "/reward3.svg",
      month: "November",
    },
    {
      img: "/reward3.svg",
      month: "December",
    },
    {
      img: "/reward3.svg",
      month: "January",
    },
    {
      img: "/reward3.svg",
      month: "February",
    },
    {
      img: "/reward3.svg",
      month: "March",
    },
    {
      img: "/reward3.svg",
      month: "April",
    },
    {
      img: "/reward3.svg",
      month: "May",
    },
    {
      img: "/reward3.svg",
      month: "June",
    },
  ];

const cm = (...classes: (string | boolean)[]) =>
  classes.filter(Boolean).join(" ");

const StudentPage = ({
  params: { student_id: studentIdParam }, // Renamed to avoid conflict with numeric studentId
}: {
  params: { student_id: string };
}) => {
  const studentId = Number(studentIdParam);

  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(
    null
  );
  const [attendanceRate, setAttendanceRate] = useState<number>(0);
  const [studentRewards, setStudentRewards] = useState<Reward[]>([]);
  const [studentPenalties, setStudentPenalties] = useState<Penalty[]>([]);
  const [studentExcuses, setStudentExcuses] = useState<Excuse[]>([]);

  // Chart data state, though not fully implemented with dynamic calculation based on current logic
  type ChartTab = "this_month" | "all_months";
  const [chartTab, setChartTab] = useState<ChartTab>("this_month");
  // For actual chart data, you'd calculate based on studentDetails.attendance and date ranges
  const [chartData, setChartData] = useState<
    Record<ChartTab, Array<{ name: string; value: number }>>
  >({
    this_month: [], // You'd populate this based on monthly attendance data if available
    all_months: [], // You'd populate this based on all-time attendance data
  });

  useEffect(() => {
    if (!isNaN(studentId)) {
      const details = DataService.getStudentDetailsById(studentId);
      setStudentDetails(details);
  
      if (details?.attendance) {
        // Use 'in_time' and 'violation' from the new structure
        const inTimeDays = details.attendance.in_time || 0;
        const violationDays = details.attendance.violation || 0; // This now includes what was 'absent' and 'late'
        const totalAttendanceDays = inTimeDays + violationDays;
  
        if (totalAttendanceDays > 0) {
          setAttendanceRate(
            Math.round((inTimeDays / totalAttendanceDays) * 100)
          );
        } else {
          setAttendanceRate(0); // No attendance records or no categorizable statuses
        }
      } else {
        setAttendanceRate(0);
      }
  
      setStudentRewards(details?.rewards || []);
      setStudentPenalties(DataService.getPenaltiesForStudent(studentId));
      setStudentExcuses(DataService.getExcusesForStudent(studentId)); // Ensure this is the singular version
    }
  }, [studentId]);

  // You can add a loading state here if data fetching is asynchronous
  if (!studentDetails) {
    return (
      <div className="p-4 flex flex-col gap-4 text-center text-gray-600">
        Loading student details...
      </div>
    );
  }

  // Placeholder for age - you might need to calculate this from a birthdate if available
  // Or add an 'age' property to your Student interface
  const studentAge = new Date().getFullYear() - new Date(studentDetails.student.date_of_birth).getFullYear();
  const studentSchool = DataService.getSchoolNameById(studentDetails.student.school_id)
  const penalties = DataService.getPenaltiesForStudent(studentDetails.student.student_id)
  console.log("pennnnnnn", penalties)
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="p-8 bg-white rounded-2xl flex flex-col gap-8">
        <h1 className="text-lg font-black text-[#7C8B9D]">My Children</h1>
        <div className="flex gap-8 items-center">
          <div className="">
            <Image
              src="/zahra.png"
              height={128}
              width={128}
              alt="view"
              className=" text-white pt-2 hover:opacity-75 transition-opacity flex justify-items-end items-end "
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="font-bold text-medium text-[#6BBEA5]">
              {studentDetails?.student.first_name_en}
              {studentDetails?.student.last_name_en}
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-sm font-bold text-[#9B9B9B]">Class</p>
                <h3 className="text-[#6BBEA5] font-medium">
                  {studentDetails?.student.class_ar}
                </h3>
              </div>
              <div>
                <p className="text-sm font-bold text-[#9B9B9B]">School</p>
                <h3 className="text-[#6BBEA5] font-medium">
                  {studentSchool}
                </h3>
              </div>
              <div>
                <p className="text-sm font-bold text-[#9B9B9B]">Age</p>
                <h3 className="text-[#6BBEA5] font-medium">
                  {studentAge}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-8 bg-white rounded-2xl flex flex-col gap-8 items-center">
          <div className="flex flex-col justify-items-start">
            <h1 className="text-lg font-black text-[#8447AB]">Attendance</h1>
          </div>
          <div>
            <div className=" flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <Gauge
                  value={attendanceRate}
                  startAngle={0}
                  endAngle={360}
                  innerRadius="60%"
                  outerRadius="100%"
                  cornerRadius="50%"
                  sx={{
                    [`& .${gaugeClasses.valueText}`]: {
                      fontSize: 32,
                    },
                    [`& .${gaugeClasses.valueArc}`]: {
                      fill: "#6BBEA5",
                    },
                    [`& .${gaugeClasses.referenceArc}`]: {
                      fill: "#8447AB", // Replace theme color with static value
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            {(Object.keys(chartData) as ChartTab[]).map((tab) => (
              <button
                key={tab}
                className={cm(
                  "px-4 py-2 rounded-full text-sm transition-colors",
                  chartTab === tab
                    ? "bg-[#8447AB] text-white font-bold"
                    : "text-gray-600 hover:bg-gray-200"
                )}
                onClick={() => setChartTab(tab)}
              >
                {tab === "this_month" ? "This Month" : "All months"}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-8 bg-white rounded-2xl flex flex-col gap-8">
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-[#8447AB]">Rewards</h1>
          </div>
          <div>
            <div className=" flex flex-col justify-between py-8">
              <div className="grid gap-2 grid-cols-2 md:grid-cols-3 xl:grid-cols-5 justify-between items-center">
                <div className="flex flex-col gap-2 items-center">
                  <Image
                    src="/reward1.svg"
                    height={128}
                    width={128}
                    alt="view"
                    className=" text-white pt-2 hover:opacity-75 transition-opacity flex justify-items-end items-end "
                  />
                  <p className="text-[10px] text-[#D4AE0E] font-medium">September</p>
                </div>
                <div className="flex flex-col gap-2 items-center">
                  <Image
                    src="/reward2.svg"
                    height={128}
                    width={128}
                    alt="view"
                    className=" text-white pt-2 hover:opacity-75 transition-opacity flex justify-items-end items-end "
                  />
                  <p className="text-[10px] font-bold text-[#FFD009]">October</p>
                </div>

                {rewards.map((i) => (
                  <div key={i.month} className="flex flex-col gap-2 items-center">
                    <Image
                      src={i.img}
                      height={128}
                      width={128}
                      alt="view"
                      className=" text-white pt-2 hover:opacity-75 transition-opacity flex justify-items-end items-end "
                    />
                    <p className="text-[10px] text-[#CCCCCC]">{i.month}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-8 bg-white rounded-2xl flex flex-col gap-8">
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-[#8447AB]">Fines</h1>
          </div>
          <div>
            <ParentFinesTable penalties={studentPenalties}/>
          </div>
        </div>
        
        <div className="p-8 bg-white rounded-2xl flex flex-col gap-8">
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-[#8447AB]">Excuses</h1>
          </div>
          <div>
            <ParentExcuses  />
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentPage;
