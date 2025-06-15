// src/components/ManagerDataReports.tsx

"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import DataService, {
  School,
  Student,
  StudentDetails,
} from "@/services/dataService";
import Link from "next/link";
import { Gauge, gaugeClasses } from "@mui/x-charts";
import { useTranslation } from "react-i18next";

const cm = (...classes: (string | boolean)[]) => {
  return classes.filter(Boolean).join(" ");
};

interface CalculatedStatistics {
  attendance: number;
  absence: number;
  late: number;
}

interface CardStats {
  attendance: number;
  absence: number;
  late: number;
  fines: number;
  totalStudentsInRegion: number;
  totalPossibleAttendances: number;
  rewards: number;
}

interface ManagerDataReportsProps {
  students: Student[];
  stats: CardStats;
  startDate: Date;
  endDate: Date;
}

const ManagerDataReports: React.FC<ManagerDataReportsProps> = ({
  students,
  stats,
  startDate,
  endDate,
}) => {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false); // New state to track client-side mount

  useEffect(() => {
    setMounted(true); // Set to true once component mounts on the client
  }, []);

  const isArabic = i18n.language === "ar";
  // The dirAttribute and textDirectionClass can now safely be derived as they are used
  // after the `mounted` check or in elements that are always present.

  const [leftTab, setLeftTab] = useState("Statistics");
  const [rightTab, setRightTab] = useState("Schools");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const [calculatedStats, setCalculatedStats] = useState<CalculatedStatistics>({
    attendance: 0,
    absence: 0,
    late: 0,
  });

  useEffect(() => {
    const fetchStats = () => {
      const studentIds = students.map((s) => s.student_id);
      const attendanceRecords = DataService.getStudentAttendances(
        studentIds,
        startDate,
        endDate
      );

      console.log("stttttt", studentIds);

      const stats = {
        attendance: 0,
        absence: 0,
        late: 0,
      };

      for (const record of attendanceRecords) {
        switch (record.status) {
          case "Present":
            stats.attendance++;
            break;
          case "Absent":
            stats.absence++;
            break;
          case "Late":
            stats.late++;
            break;
        }
      }

      setCalculatedStats(stats);
    };

    if (students.length > 0) {
      fetchStats();
    }
  }, [students, startDate, endDate]);

  const totalOccurrences =
    calculatedStats.attendance + calculatedStats.absence + calculatedStats.late;

  const attendance = calculatedStats.attendance;
  const absence = calculatedStats.absence;
  const late = calculatedStats.late;

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
    // Only use i18n.language when mounted on client to prevent hydration mismatch
    if (!mounted) {
      // Return a consistent default for SSR, or handle based on your needs
      return school.name_en; // Or primary language name
    }
    return i18n.language === "ar" ? school.name_ar : school.name_en;
  };

  // Helper function to get student name based on language
  const getStudentFullName = (student: Student) => {
    if (!mounted) {
      return `${student.first_name_en} ${student.last_name_en}`; // Consistent for SSR
    }
    if (i18n.language === "ar") {
      return `${student.first_name_ar} ${student.last_name_ar}`;
    } else {
      return `${student.first_name_en} ${student.last_name_en}`;
    }
  };

  // Helper function to safely calculate percentage for Gauge and round to nearest whole number
  const calculateGaugeValue = (numerator: number, denominator: number) => {
    if (denominator === 0) {
      return 0; // Return 0 if denominator is zero to avoid NaN
    }
    return Math.round((numerator / denominator) * 100);
  };

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 lg:h-[750px] w-full">
      <div className="bg-white rounded-2xl flex justify-center p-4 w-full">
        <div className=" flex flex-col w-full h-[700px] overflow-y">
          <h3 className="text-lg font-semibold mb-4 text-[#7C8B9D]">
            {t("Students")}
          </h3>
          <div className="flex flex-col gap-4 h-full overflow-y-auto">
            {students.length > 0 ? (
              students.map((student) => (
                <div
                  key={student.student_id}
                  className="flex items-center gap-2 w-full"
                >
                  <div>
                    <Image
                      src={student.image_url || "/profile.png"}
                      alt={t("Student profile picture")} // Translated alt text
                      height={32}
                      width={32}
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-[#5EB89D]">
                      {getStudentFullName(student)}
                    </p>
                    <p className="text-xs text-[#797c80]">
                      {t("Class")}:
                      {mounted // Conditionally render class name based on mount
                        ? i18n.language == "ar"
                          ? student.class_ar
                          : student.class_en
                        : student.class_en // Default for SSR
                      }
                    </p>
                  </div>
                  <Link href={`/students/${student.student_id}`}>
                    <Image
                      src="/view.svg"
                      alt={t("view details")}
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
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Statistics/Reports */}
      <div className="bg-white rounded-2xl flex md:block justify-center p-4">
        <div className="">
          <h3 className="text-lg font-semibold mb-4 text-[#7C8B9D]">
            {t("Filtered Statistics")}
          </h3>
        </div>

        <div className="h-full flex flex-col justify-between py-8">
          <div className="flex flex-col gap-4 p-4 rounded-lg">
            <div className="flex flex-col gap-2 items-center justify-between">
              <div className="flex gap-2 items-center">
                <Image
                  src="/stats_attendance.svg"
                  alt={t("Attendance stats icon")}
                  width={32}
                  height={32}
                />
                <p>
                  {t("Attendance")}:
                  <strong>{stats.attendance}</strong>
                </p>
              </div>
              <div className="flex">
                <Gauge
                  value={calculateGaugeValue(
                    stats.attendance,
                    stats.totalPossibleAttendances
                  )}
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
                  text={({ value }) => `${value}%`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 justify-between items-center">
              <div className="flex gap-2 items-center">
                <Image
                  src="/stats_absence.svg"
                  alt={t("Absence stats icon")}
                  width={32}
                  height={32}
                />
                <p>
                  {t("Absence")}: <strong>{stats.absence}</strong>
                </p>
              </div>
              <div className="flex">
                <Gauge
                  value={calculateGaugeValue(
                    stats.absence,
                    stats.totalPossibleAttendances
                  )}
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
                  text={({ value }) => `${value}%`}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 items-center justify-between ">
              <div className="flex gap-2 items-center">
                <Image
                  src="/stats_late.svg"
                  alt={t("Late stats icon")}
                  width={32}
                  height={32}
                />
                <p>
                  {t("Late")}: <strong>{stats.late}</strong>
                </p>
              </div>
              <div className="flex">
                <Gauge
                  value={calculateGaugeValue(
                    stats.late,
                    stats.totalPossibleAttendances
                  )}
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
                  text={({ value }) => `${value}%`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDataReports;