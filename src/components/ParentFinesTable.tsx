// components/ParentFinesTable.tsx
"use client"; // This component uses client-side hooks

import React from "react";
import { ParentPenalty } from "@/services/dataService"; // Make sure to import ParentPenalty interface
import Link from "next/link";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface ParentFinesTableProps {
  penalties: ParentPenalty[];
}

const ParentFinesTable: React.FC<ParentFinesTableProps> = ({ penalties }) => {
  const { t, i18n } = useTranslation(); // Initialize the hook

  // Determine text direction for Arabic
  const isArabic = i18n.language === "ar";
  const textDirectionClass = isArabic ? "text-right" : "text-left";
  const dirAttribute = isArabic ? "rtl" : "ltr";

  return (
    <div className="p-0" dir={dirAttribute}>
      {penalties && penalties.length > 0 ? (
        <div className="overflow-x-auto rounded-xl flex flex-col gap-4">
          <div className={`text-[#5EB89D] flex justify-between text-lg font-bold ${textDirectionClass}`}>
            <h1>{t("Description")}</h1> {/* Translated */}
            <h1>{t("Amount")}</h1>       {/* Translated */}
          </div>
          <hr />
          <div className="h-[300px] overflow-auto"> {/* Added overflow for scrollability */}
            {penalties.map((penalty) => (
              <div key={penalty.penalty_date_g} className={`flex justify-between ${textDirectionClass}`}>
                <h1>{t("Fine")}</h1> {/* Translated generic "Fine" */}
                <h1>{penalty.amount_due}</h1>
              </div>
            ))}
          </div>
          {/* A blank div is not needed here; it might have been for spacing or forgotten content */}
          <div></div>
          <Link
            href={`/parent/student_fines/${penalties[0].student_id}`}
            className="py-2 mt-4 text-sm font-bold text-white rounded-full bg-[#8447AB] hover:bg-[#643581] flex justify-center items-center"
          >
            <p>{t("Pay Fines")}</p> {/* Translated */}
          </Link>
        </div>
      ) : (
        <p className="text-gray-600 text-center py-4">
          {t("No fines recorded for this student.")} {/* Translated */}
        </p>
      )}
    </div>
  );
};

export default ParentFinesTable;