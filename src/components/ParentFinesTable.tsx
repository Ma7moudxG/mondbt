// components/ParentFinesTable.tsx
"use client"; // If it's a client component

import React from "react";
import { Penalty } from "@/services/dataService"; // Make sure to import Penalty interface
import Link from "next/link";

interface ParentFinesTableProps {
  penalties: Penalty[];
}

const ParentFinesTable: React.FC<ParentFinesTableProps> = ({ penalties }) => {
  console.log("caadcda", penalties);
  return (
    <div className="p-0">
      {penalties && penalties.length > 0 ? (
        <div className="overflow-x-auto rounded-xl flex flex-col gap-4">
          <div className="text-[#5EB89D] flex justify-between text-lg font-bold">
            <h1>Description</h1>
            <h1>Amount</h1>
          </div>
          <hr />
          <div>
            {penalties.map((penalty) => (
              <div className=" flex justify-between">
                <h1>Fine</h1>
                <h1>{penalty.amount_due}</h1>
              </div>
            ))}
          </div>
          <Link
            href={`/parent/student_fines/${penalties[0].student_id}`}
            className="py-2 mt-4 text-sm font-bold text-white rounded-full bg-[#8447AB] hover:bg-[#643581]"
          >
            <p className="flex justify-center">Pay Fines</p>
          </Link>
        </div>
      ) : (
        <p className="text-gray-600 text-center py-4">
          No fines recorded for this student.
        </p>
      )}
    </div>
  );
};

export default ParentFinesTable;
