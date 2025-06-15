// src/components/StudentPage.tsx

"use client";
import DataService, { StudentDetails, Reward, ParentPenalty, Excuse } from "@/services/dataService";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import ParentFinesTable from "@/components/ParentFinesTable";
import ParentExcuses from "@/components/ParentExcuses";
import { useTranslation } from "react-i18next";
import RewardsCard from "@/components/RewardsCard";

const cm = (...classes: (string | boolean)[]) =>
  classes.filter(Boolean).join(" ");

interface StudentPageProps {
  params: Promise<{ student_id: string }>;
}

const StudentPage = ({ params }: StudentPageProps) => {
  const { t, i18n } = useTranslation();
  const resolvedParams = React.use(params);
  const studentIdParam = resolvedParams.student_id;
  const studentId = Number(studentIdParam);

  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"this_month" | "academic_year">("this_month");
  const [attendanceRate, setAttendanceRate] = useState<number>(0);
  const [rewardsJson, setrewardsJson] = useState<Reward[]>();
  const [excusesJson, setExcusesJson] = useState<Excuse[]>();
  const [penaltiesJson, setPenaltiesJson] = useState<ParentPenalty[]>([]); // Add state for penalties

  const isArabic = i18n.language === "ar";
  const textDirectionClass = isArabic ? "text-right" : "text-left";
  const dirAttribute = isArabic ? "rtl" : "ltr";

  const getDateRange = (period: "this_month" | "academic_year") => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (period === "this_month") {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: firstDayOfMonth, end: yesterday };
    } else {
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const academicYearStart = new Date(
        currentMonth >= 8 ? currentYear : currentYear - 1,
        8,
        1
      );

      return { start: academicYearStart, end: yesterday };
    }
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      setError(null);

      if (isNaN(studentId)) {
        setError(t("invalid_student_id_error"));
        setLoading(false);
        return;
      }

      try {
        const dateRange = getDateRange(activeTab);
        const details = await DataService.getStudentDetailsById(studentId, dateRange);
        setStudentDetails(details);
        console.log("dettt", details);

        // --- FIX STARTS HERE ---
        // Use the 'details' variable which is guaranteed to be non-null here
        // after the await completes successfully.
        if (details?.student?.student_id) { // Defensive check, though 'details' should not be null here
          const penalties = await DataService.getPenaltiesForStudent(details.student.student_id);
          const filteredPenalties = penalties.filter(p => p.paid === "N");
          setPenaltiesJson(filteredPenalties); // Set the state for penalties

          const rewardsJsonAwait = await DataService.getRewardsForStudent(studentId);
          setrewardsJson(rewardsJsonAwait);

          const excusesJsonAwait = await DataService.getExcusesForStudent(studentId);
          setExcusesJson(excusesJsonAwait);
        } else {
          // Handle case where student details or student ID might be missing
          setError(t("no_student_details_found", { studentId: studentId }));
          setrewardsJson([]);
          setExcusesJson([]);
          setPenaltiesJson([]);
          setAttendanceRate(0);
        }
        // --- FIX ENDS HERE ---

        if (details?.attendanceSummary) {
          const { presentDays, lateDays, absentDays } = details.attendanceSummary;
          const totalDaysWithRecords = presentDays + lateDays + absentDays;

          if (totalDaysWithRecords > 0) {
            const rate = Math.round(((presentDays + lateDays) / totalDaysWithRecords) * 100);
            setAttendanceRate(rate);
          } else {
            setAttendanceRate(0);
          }
        } else {
          setAttendanceRate(0);
        }
      } catch (err) {
        console.error("Failed to fetch student details:", err);
        setError(t("failed_to_load_student_data_error"));
        setrewardsJson([]); // Clear previous data on error
        setExcusesJson([]); // Clear previous data on error
        setPenaltiesJson([]); // Clear previous data on error
        setAttendanceRate(0); // Reset attendance rate on error
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId, studentIdParam, activeTab, i18n.language, t]); // Add t and i18n.language to dependencies

  if (loading) {
    return (
      <div className="p-4 flex flex-col gap-4 text-center text-gray-600">
        {t("loading_student_details")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex flex-col gap-4 text-center text-red-600">
        {t("error_prefix")}: {error}
      </div>
    );
  }

  // This check correctly ensures studentDetails is not null before rendering main content
  if (!studentDetails) {
    return (
      <div className="p-4 flex flex-col gap-4 text-center text-gray-600">
        {t("no_student_details_found", { studentId: studentId })}
      </div>
    );
  }

  const [studentFirstName, studentLastName] = DataService.getStudentNameById(
    studentDetails.student.student_id,
    i18n.language
  );
  
  const studentAge = new Date().getFullYear() - new Date(studentDetails.student.date_of_birth).getFullYear();
  const studentSchool = DataService.getSchoolNameById(studentDetails.student.school_id, i18n.language);
  
  console.log("rewaaaaaards", studentDetails.rewards); // This log is fine as studentDetails is confirmed non-null here

  return (
    <div className={`p-4 flex flex-col gap-4`} dir={dirAttribute}>
      <div className="p-8 bg-white rounded-2xl flex flex-col gap-8">
        <h1 className={`text-lg font-black text-[#7C8B9D] ${textDirectionClass}`}>
          {t("My Children")}
        </h1>
        <div className={`flex gap-8 items-center`}>
          <div className="">
            <Image
              src={
                studentDetails.student?.image_url || "/profile.png"
              }
              height={128}
              width={128}
              alt={t("student_avatar_alt")}
              className=" rounded-full text-white pt-2 hover:opacity-75 transition-opacity flex justify-items-end items-end "
            />
          </div>
          <div className={`flex flex-col gap-4`}>
            <div className={`font-bold text-medium text-[#6BBEA5] ${textDirectionClass}`}>
              { `${studentFirstName} ${studentLastName} `}
            </div>
            <div className={`flex gap-8 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className="text-sm font-bold text-[#9B9B9B]">{t("Class")}</p>
                <h3 className="text-[#6BBEA5] font-medium">
                  {isArabic ? studentDetails?.student.class_ar : studentDetails?.student.class_en}
                </h3>
              </div>
              <div>
                <p className="text-sm font-bold text-[#9B9B9B]">{t("School")}</p>
                <h3 className="text-[#6BBEA5] font-medium">
                  {studentSchool}
                </h3>
              </div>
              <div>
                <p className="text-sm font-bold text-[#9B9B9B]">{t("Age")}</p>
                <h3 className="text-[#6BBEA5] font-medium">
                  {studentAge}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Attendance Card */}
        <div className={`p-8 bg-white rounded-2xl flex flex-col gap-8 items-center ${textDirectionClass}`}>
          <div className={`flex flex-col justify-items-start ${textDirectionClass}`}>
            <h1 className="text-lg font-black text-[#8447AB]">{t("Attendance")}</h1>
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
                      fill: "#8447AB",
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className={`flex gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
            <button
              className={cm(
                "px-4 py-2 rounded-full text-sm transition-colors",
                activeTab === "this_month"
                  ? "bg-[#8447AB] text-white font-bold"
                  : "text-gray-600 hover:bg-gray-200"
              )}
              onClick={() => setActiveTab("this_month")}
            >
              {t("Month")}
            </button>
            <button
              className={cm(
                "px-4 py-2 rounded-full text-sm transition-colors",
                activeTab === "academic_year"
                  ? "bg-[#8447AB] text-white font-bold"
                  : "text-gray-600 hover:bg-gray-200"
              )}
              onClick={() => setActiveTab("academic_year")}
            >
              {t("School Year")}
            </button>
          </div>
        </div>

        {/* Rewards Card */}
        <RewardsCard rewards={rewardsJson || []} attendance={attendanceRate}/>

        {/* Fines Card */}
        <div className={`p-8 bg-white rounded-2xl flex flex-col gap-8 ${textDirectionClass}`}>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-[#8447AB]">{t("Fines")}</h1>
          </div>
          <div>
            {/* Pass the penalties state here */}
            <ParentFinesTable penalties={penaltiesJson} />
          </div>
        </div>

        {/* Excuses Card */}
        <div className={`p-8 bg-white rounded-2xl flex flex-col gap-8 ${textDirectionClass}`}>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-[#8447AB]">{t("Excuses")}</h1>
          </div>
          <div>
            {/* Pass the excuses state here */}
            <ParentExcuses excuses={excusesJson || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPage;