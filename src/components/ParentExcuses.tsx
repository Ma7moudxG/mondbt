"use client";

import React from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation

// If you're not using these Flowbite components in ParentExcuses.tsx,
// you can remove them to reduce bundle size, but leaving them for now.
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";

import Link from "next/link";
import Image from "next/image"; // Image is currently unused in this component, but keeping if you plan to add it.
import DataService, { Excuse } from "@/services/dataService";

const ParentExcuses = ({ excuses }: { excuses: Excuse[] }) => {
  const { t, i18n } = useTranslation(); // Initialize the hook

  // Determine text direction for Arabic
  const isArabic = i18n.language === "ar";
  const textDirectionClass = isArabic ? "text-right" : "text-left";
  const dirAttribute = isArabic ? "rtl" : "ltr";

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div
      className="overflow-x-auto rounded-xl flex flex-col gap-4"
      dir={dirAttribute}
    >
      <div
        className={`text-[#5EB89D] flex justify-between text-lg font-bold ${textDirectionClass}`}
      >
        <h1>{t("Description")}</h1> {/* Translated */}
        <h1>{t("Status")}</h1> {/* Translated */}
      </div>
      <hr />
      <div className=" h-[300px] overflow-auto flex flex-col gap-4">
        {excuses.map((excuse) => (
          <div
            key={excuse.id}
            className={`flex justify-between ${textDirectionClass}`}
          >
            <h1 className="text-sm">
              {/* DataService.getReasonForExcuse needs to be updated to accept language */}
              {truncateText(DataService.getReasonForExcuse(excuse.reason_id, i18n.language) || '', 25)}
            </h1>
            <h1 className="text-xs">
              {/* Display status based on current language */}
              {isArabic ? excuse.status_ar : excuse.status_en}
            </h1>
          </div>
        ))}
      </div>
      <div>
      </div>
        <Link
          href={`/parent/new_excuse`}
          className="py-2 mt-4 text-sm font-bold text-white rounded-full bg-[#8447AB] hover:bg-[#643581] flex justify-center items-center"
        >
          {t("New Excuse")}
        </Link>
    </div>
  );
};

export default ParentExcuses;
