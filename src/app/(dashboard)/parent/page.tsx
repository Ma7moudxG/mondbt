// src/app/parent/[parentId]/page.tsx (or your actual path)
"use client";

import { ExcusesTable } from "@/components/ExcusesTable"; // Ensure this component expects Excuse[]
import DataService, {
  Excuse,
  Student,
  School,
  Parent,
} from "@/services/dataService"; // Import types
import React, { useEffect, useState } from "react";
import StudentCard from "@/components/StudentCard"; // Ensure this can handle the student prop structure
import Link from "next/link";

// Define a type for the enriched student object returned by getStudentsByParentId
type ParentStudent = Student & { school?: School; parent?: Parent };

const ParentPage = () => {
  // If you get parentId from params, use it
  const parentId = 11; // Example parentId, replace with dynamic ID if needed (e.g., from URL params)

  const [parentStudents, setParentStudents] = useState<ParentStudent[]>([]);
  const [excusesForStudents, setExcusesForStudents] = useState<Excuse[]>([]);
  const [totalFines, setTotalFines] = useState<string>("0 SAR"); // Or number then format

  useEffect(() => {
    if (parentId) {
      const students = DataService.getStudentsByParentId(parentId);
      setParentStudents(students);

      // Call getTotalPenaltiesForParent and update the totalFines state
      const calculatedTotalPenalties =
        DataService.getTotalPenaltiesForParent(parentId);
      setTotalFines(`${calculatedTotalPenalties} SAR`); // Format it as "X SAR"

      if (students.length > 0) {
        const studentIds = students.map((s) => s.student_id);
        const excuses = DataService.getExcusesForStudents(studentIds);
        setExcusesForStudents(excuses);
      } else {
        setExcusesForStudents([]);
      }
    }
  }, [parentId]); // Re-run if parentId changes

  return (
    <div className="p-4 flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-black text-[#8447AB]">My Children</h1>
        </div>

        {/* Kids Cards */}
        {parentStudents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {" "}
            {/* Use gap-4 for consistency */}
            {parentStudents.map((student) => (
              <StudentCard key={student.student_id} student={student} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No children found for this parent.</p>
        )}
      </div>

      {/* Excuses Table */}
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-black text-[#8447AB]">Excuses</h1>
        <ExcusesTable items={excusesForStudents} />{" "}
      </div>

      {/* Total Fines Section */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 bg-white rounded-xl p-4 justify-between items-center shadow">
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold text-[#8447AB]">
            Total Fines
          </h1>
        </div>

        <div className="flex flex-col gap-2 sm:gap-4 items-center">
          <h1 className="text-lg sm:text-xl font-bold text-[#5EB89D]">
            {totalFines}
          </h1>{" "}
          {/* Dynamically set if calculated */}
          <Link
            href={`/parent/fines/${parentId}`} // Example link, adjust as needed
            className="px-4 py-2 text-sm font-medium text-white rounded-full bg-[#8447AB] hover:bg-[#643581]"
          >
            Pay Fines
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ParentPage;
