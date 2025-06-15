// src/components/AdminDataReports.tsx

"use client";
import React, { useState, useEffect } from "react";
import PieChart from "./AttendanceChart";
import Image from "next/image";
import DataService, {
  School,
  Student,
  StudentDetails,
} from "@/services/dataService";
import Link from "next/link";
import { Gauge, gaugeClasses } from "@mui/x-charts";
import { useTranslation } from "react-i18next"; // Import useTranslation

const cm = (...classes: (string | boolean)[]) => {
  return classes.filter(Boolean).join(" ");
};

interface CalculatedStatistics {
  attendance: number;
  absence: number;
  late: number;
}

interface AdminDataReportsProps {
  schools: School[]; // Filtered schools from AdminPage
  startDate: Date; // Start date from AdminPage
  endDate: Date; // End date from AdminPage
  // No need to pass 't' as a prop if using useTranslation here
}

const AdminDataReports: React.FC<AdminDataReportsProps> = ({
  schools,
  startDate,
  endDate,
}) => {
  const { t, i18n } = useTranslation(); // Initialize useTranslation hook and get i18n instance

  const [leftTab, setLeftTab] = useState("Statistics");
  const [rightTab, setRightTab] = useState("Schools");
  const [filteredStudents, setFilteredStudents] = useState<StudentDetails[]>(
    []
  );

  const [calculatedStats, setCalculatedStats] = useState<CalculatedStatistics>({
    attendance: 0,
    absence: 0,
    late: 0,
  });

  useEffect(() => {
    if (schools && schools.length > 0) {
      const schoolIds = schools.map((s) => s.school_id);

      const studentsInSelectedSchools = DataService.getStudentsInSchools(
        schoolIds
      );
      const studentsDetails = studentsInSelectedSchools
        .map((student) => DataService.getStudentDetailsById(student))
        .filter(Boolean) as StudentDetails[];
      setFilteredStudents(studentsDetails);

      const stats = DataService.getFilteredStats(schoolIds, startDate, endDate);
      setCalculatedStats(stats);
    } else {
      setFilteredStudents([]);
      setCalculatedStats({
        attendance: 0,
        absence: 0,
        late: 0,
      });
    }
  }, [schools, startDate, endDate]);

  const totalOccurrences =
    calculatedStats.attendance + calculatedStats.absence + calculatedStats.late;

  const attendance = calculatedStats.attendance;
  const absence = calculatedStats.absence;
  const late = calculatedStats.late;

  // The rates are already calculated to 2 decimal places.
  // We will round them when displaying in the Gauge component.
  const attendanceRate =
    totalOccurrences > 0
      ? parseFloat(((attendance / totalOccurrences) * 100).toFixed(2))
      : 0;
  const absenceRate =
    totalOccurrences > 0
      ? parseFloat(((absence / totalOccurrences) * 100).toFixed(2))
      : 0;
  const lateRate =
    totalOccurrences > 0
      ? parseFloat(((late / totalOccurrences) * 100).toFixed(2))
      : 0;

  console.log("attendanceeeeeeee", calculatedStats);

  // Helper function to get school name based on language
  const getSchoolName = (school: School) => {
    // Assuming school has name_ar property
    return i18n.language === "ar" ? school.name_ar : school.name_en;
  };

  // Helper function to get student name based on language
  const getStudentFullName = (student: Student) => {
    if (i18n.language === "ar") {
      return `${student.first_name_ar} ${student.last_name_ar}`;
    } else {
      return `${student.first_name_en} ${student.last_name_en}`;
    }
  };

  return (
    <div className="flex gap-4 flex-col lg:flex-row h-[750px]">
      {/* Left side: Schools/Students list */}
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
            {t("Schools")} {/* Translate "Schools" */}
          </button>
          <button
            className={cm(
              "px-4 py-2 rounded-full text-xs w-1/2",
              rightTab === "Students" &&
                "bg-[#5EB89D] shadow-xs text-sm text-white font-bold"
            )}
            onClick={() => setRightTab("Students")}
          >
            {t("Students")} {/* Translate "Students" */}
          </button>
        </div>
        {rightTab === "Schools" ? (
          <div className="h-full flex flex-col justify-between py-8">
            <h3 className="text-lg font-semibold mb-4 text-[#7C8B9D]">
              {t("Filtered Schools")} ({schools.length})
              {/* Translate "Filtered Schools" */}
            </h3>
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              {schools.length > 0 ? (
                schools.map((school) => (
                  <div
                    key={school.school_id}
                    className="flex items-center gap-2"
                  >
                    <div>
                      <p className="text-sm text-[#797c80]">
                        {getSchoolName(school)}
                        {/* Use helper function for school name */}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  {t("No schools selected or found.")}
                  {/* Translate this message */}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-between py-8">
            <h3 className="text-lg font-semibold mb-4 text-[#7C8B9D]">
              {t("Filtered Students")} ({filteredStudents.length})
              {/* Translate "Filtered Students" */}
            </h3>
            <div className="flex flex-col gap-4 h-full overflow-y-auto">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((studentDetails) => (
                  <div
                    key={studentDetails.student.student_id}
                    className="flex items-center gap-2 w-full"
                  >
                    <div>
                      <Image
                        src={
                          studentDetails.student.image_url || "male.png"
                        }
                        alt={t("student profile")} // Translate alt text
                        height={32}
                        width={32}
                        className="rounded-full"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-[#5EB89D]">
                        {getStudentFullName(studentDetails.student)}
                        {/* Use helper function for student full name */}
                      </p>
                      <p className="text-xs text-[#797c80]">
                        {t("School")}:
                        {studentDetails.school
                          ? getSchoolName(studentDetails.school)
                          : ""}
                        {/* Translate "School" and use helper for school name */}
                      </p>
                    </div>
                    <Link
                      href={`/students/${studentDetails.student.student_id}`}
                    >
                      <Image
                        src="/view.svg"
                        alt={t("view details")} // Translate alt text
                        height={16}
                        width={16}
                        className="cursor-pointer"
                      />
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  {t("No students found for selected schools.")}
                  {/* Translate this message */}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right side: Statistics/Reports */}
      <div className="bg-white rounded-2xl lg:w-1/2 flex md:block justify-center p-4">
        <div className="">
          <h3 className="text-lg font-semibold mb-4 text-[#7C8B9D]">
            {t("Filtered Statistics")} {/* Translate "Filtered Statistics" */}
          </h3>
        </div>

        <div className="h-full flex flex-col justify-between py-8">
          <div className="flex flex-col gap-4 p-4 rounded-lg">
            <div className="flex flex-col gap-2 items-center justify-between">
              <div className="flex gap-2 items-center">
                <Image
                  src="/stats_attendance.svg"
                  alt={t("Attendance stats icon")} // Translate alt text
                  width={32}
                  height={32}
                />
                <p>
                  {t("Attendance")}:
                  <strong>{attendance.toLocaleString()}</strong>
                  {/* Translate "Attendance" */}
                </p>
              </div>
              <div className="flex">
                <Gauge
                  value={attendanceRate}
                  valueMax={100}
                  startAngle={-180}
                  endAngle={180}
                  innerRadius="60%"
                  outerRadius="90%"
                  cornerRadius="50%"
                  sx={{
                    [`& .${gaugeClasses.valueText}`]: {
                      fontSize: 26,
                      transform: "translate(0px, 0px)",
                    },
                    [`& .${gaugeClasses.valueArc}`]: {
                      fill: "#5EB89D",
                    },
                    [`& .${gaugeClasses.referenceArc}`]: {
                      fill: "#E2E2E2",
                    },
                  }}
                  // --- CHANGE HERE ---
                  text={({ value }) => `${Math.round(value)}%`}
                  // --- END CHANGE ---
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 justify-between items-center">
              <div className="flex gap-2 items-center">
                <Image
                  src="/stats_absence.svg"
                  alt={t("Absence stats icon")} // Translate alt text
                  width={32}
                  height={32}
                />
                <p>
                  {t("Absence")}: <strong>{absence.toLocaleString()}</strong>
                  {/* Translate "Absence" */}
                </p>
              </div>
              <div className="flex">
                <Gauge
                  value={absenceRate}
                  valueMax={100}
                  startAngle={-180}
                  endAngle={180}
                  innerRadius="60%"
                  outerRadius="90%"
                  cornerRadius="50%"
                  sx={{
                    [`& .${gaugeClasses.valueText}`]: {
                      fontSize: 26,
                      transform: "translate(0px, 0px)",
                    },
                    [`& .${gaugeClasses.valueArc}`]: {
                      fill: "#519E87",
                    },
                    [`& .${gaugeClasses.referenceArc}`]: {
                      fill: "#E2E2E2",
                    },
                  }}
                  // --- CHANGE HERE ---
                  text={({ value }) => `${Math.round(value)}%`}
                  // --- END CHANGE ---
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 items-center justify-between ">
              <div className="flex gap-2 items-center">
                <Image
                  src="/stats_late.svg"
                  alt={t("Late stats icon")} // Translate alt text
                  width={32}
                  height={32}
                />
                <p>
                  {t("Late")}: <strong>{late.toLocaleString()}</strong>
                  {/* Translate "Late" */}
                </p>
              </div>
              <div className="flex">
                <Gauge
                  value={lateRate}
                  valueMax={100}
                  startAngle={-180}
                  endAngle={180}
                  innerRadius="60%"
                  outerRadius="90%"
                  cornerRadius="50%"
                  sx={{
                    [`& .${gaugeClasses.valueText}`]: {
                      fontSize: 26,
                      transform: "translate(0px, 0px)",
                    },
                    [`& .${gaugeClasses.valueArc}`]: {
                      fill: "#448571",
                    },
                    [`& .${gaugeClasses.referenceArc}`]: {
                      fill: "#E2E2E2",
                    },
                  }}
                  // --- CHANGE HERE ---
                  text={({ value }) => `${Math.round(value)}%`}
                  // --- END CHANGE ---
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDataReports;