"use client";

import { ExcusesTable } from "@/components/ExcusesTable";
import DataService, {
  Excuse, // Base Excuse type from db.json (string IDs)
  Student, // Student type from schoolData.ts (numeric IDs)
  School,
  Parent,    
} from "@/services/dataService";
import React, { useEffect, useState } from "react";
import StudentCard from "@/components/StudentCard";
import Link from "next/link";
import { useTranslation } from "react-i18next";

// Define a type for the enriched student object returned by getStudentsByParentId
type ParentStudent = Student & { school?: School; parent?: Parent };

// Define the EnrichedExcuse type
type EnrichedExcuse = Excuse & {
  studentFirstName: string | null;
  studentLastName: string | null;
  descriptionText: string | null;
};

const ParentPage = () => {
  const { t, i18n } = useTranslation();
  const parentId = 2; // Keeping parentId as a hardcoded number as per your request

  const [parentStudents, setParentStudents] = useState<ParentStudent[]>([]);
  const [excusesForStudents, setExcusesForStudents] = useState<
    EnrichedExcuse[]
  >([]);
  const [totalFines, setTotalFines] = useState<string>("0 SAR");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false); // NEW: State to track if component is mounted on client

  // This useEffect runs once on the client after initial render to set isMounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // This useEffect handles data fetching. It now depends on `isMounted`
  useEffect(() => {
    // Only proceed with data fetching if the component is mounted on the client.
    // This ensures client-side logic and `t()` calls have the correct language context.
    if (!isMounted) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (isNaN(parentId) || !parentId) {
        // ERROR: Use a static string here or handle translation consistently across server/client
        // Since this `if` block can be hit on the very first client-side render (before `t` is stable),
        // it's safer to provide a static string or rely on the `error` state being rendered after mount.
        setError(t("invalid_parent_id_error")); // Now this `t` is safe because `isMounted` is true
        setLoading(false);
        return;
      }

      try {
        const [students, totalPenalties] = await Promise.all([
          DataService.getStudentsByParentId(parentId),
          DataService.getPenaltiesForParent(parentId),
        ]);

        setParentStudents(students || []);
        const unpaidPenalties = totalPenalties.filter(p => p.paid !== "Y")
        const calculatedTotalPenalties = unpaidPenalties.reduce((sum, penalty) => sum + (penalty.amount_due || 0), 0)

        setTotalFines(`${calculatedTotalPenalties} ${t("SAR")}`); // `t("SAR")` is now safe
        console.log("totttal fines", totalFines)
        if (students && students.length > 0) {
          const studentIds = students.map((s) => (s as any).student_id);

          const excuses = await DataService.getExcusesForStudents(studentIds);
          // console.log("Raw excuses fetched:", excuses); // For debugging

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
          // console.log("Enriched excuses ready for table:", enrichedExcuses); // For debugging
          setExcusesForStudents(enrichedExcuses);
        } else {
          setExcusesForStudents([]);
          // console.log("No students found for this parent, or no excuses."); // For debugging
        }
      } catch (err) {
        console.error("Failed to fetch parent page data:", err);
        setError(t("failed_to_load_data")); // `t("failed_to_load_data")` is now safe
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [parentId, t, i18n.language, isMounted]); // Add `isMounted` to dependencies

if (!isMounted || loading) {
    return (
      <div className="p-4 flex flex-col gap-8 items-center justify-center min-h-screen">
        <h1 className="text-xl font-black text-[#8447AB]">
          {isMounted ? t("loading") : "Loading..."} {/* Only translate "loading" when mounted */}
        </h1>
      </div>
    );
  }

  // Error state, rendered only when mounted and an error has occurred
  if (error) {
    return (
      <div className="p-4 flex flex-col gap-8 items-center justify-center min-h-screen">
        <h1 className="text-xl font-black text-red-500">
          {t("Error")}: {error} {/* Now safe to translate error messages */}
        </h1>
      </div>
    );
  }

  const numericTotalFines = parseFloat(totalFines);
  const isPayButtonDisabled = numericTotalFines <= 0;
  console.log("finesssss2", totalFines)
  // Main content, rendered only when mounted, data is loaded, and no error
  return (
    <div className="p-4 flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-black text-[#8447AB]">
            {t("My Children")}
          </h1>
        </div>

        {/* Kids Cards */}
        {parentStudents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Use slice(0, 3) to show a maximum of 3 students */}
            {parentStudents.slice(0, 3).map((student) => (
              <StudentCard key={student.student_id} student={student} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">{t("no Children Found")}</p>
        )}
      </div>

      {/* Excuses Table */}
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center gap-4">
          <h1 className="text-xl font-black text-[#8447AB]">{t("Excuses")}</h1>
          <Link
            href={`/parent/new_excuse`}
            className="px-2 w-full sm:w-[150px] xl:w-[200px] text-center py-2 text-sm xl:text-base font-medium text-white rounded-full bg-[#8447AB] hover:bg-[#643581]"
          >
            {t("New Excuse")}
          </Link>
        </div>
        <ExcusesTable items={excusesForStudents} />
      </div>

      {/* Total Fines Section */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 bg-white rounded-xl p-4 justify-between items-center shadow">
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold text-[#8447AB]">
            {t("Total Fines")}
          </h1>
        </div>

        <div className="flex flex-col gap-2 sm:gap-4 items-center">
          <h1 className="text-lg sm:text-xl font-bold text-[#5EB89D]">
            {totalFines}
          </h1>
          {/* Dynamically set if calculated */}
          {/* Conditionally render Link or a disabled button */}
          {isPayButtonDisabled ? (
            <button
              className="px-4 py-2 text-sm font-medium text-white rounded-full bg-gray-400 cursor-not-allowed"
              disabled // Standard HTML disabled attribute
            >
              {t("Pay Fines")} {/* Use specific key */}
            </button>
          ) : (
            <Link
              href={`/parent/fines/${parentId}`}
              className="px-4 py-2 text-sm font-medium text-white rounded-full bg-[#8447AB] hover:bg-[#643581]"
            >
              {t("Pay Fines")} {/* Use specific key */}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentPage;