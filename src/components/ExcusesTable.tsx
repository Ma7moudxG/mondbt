// src/components/ExcusesTable.tsx
"use client";

// --- REMOVE DataService import ---
// import DataService, { Excuse } from "@/services/dataService";
import { Excuse } from "@/services/dataService"; // Keep Excuse if you need its base structure for extending

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react"; // IMPORT useState and useEffect
import { useTranslation } from "react-i18next";

// --- Define the type for the items prop based on the enriched data ---
// This MUST match the EnrichedExcuse type in ParentPage.tsx
interface EnrichedExcuseItem extends Excuse {
  studentFirstName: string | null;
  studentLastName: string | null;
  descriptionText: string | null;
}

export function ExcusesTable({ items }: { items: EnrichedExcuseItem[] }) {
  const { t, i18n } = useTranslation();

  // START: Hydration Fix - Mounted state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // END: Hydration Fix

  // Determine current language safely for SSR
  // During SSR, we'll default to 'en' or a consistent language for string keys
  const currentLanguageForRender = mounted ? i18n.language : "en";
  const isArabic = currentLanguageForRender === "ar";

  // Helper to ensure consistent translated text during SSR
  const getConsistentTranslatedText = (key: string) => {
    if (!mounted) {
      return key; // During SSR, return the key itself (assuming keys are in default language, e.g., English)
    }
    return t(key); // After hydration, use the actual translation
  };

  const alignmentClass = isArabic ? "text-right" : "text-left";

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 overflow-y h-[350px] w-full">
      <Table className={`custom-table`}>
        <TableHead className={`bg-[#F8F8F8]`}>
          <TableRow className="text-xs font-bold">
            <TableHeadCell className={`text-gray-700 font-semibold ${alignmentClass}`}>
              {getConsistentTranslatedText("DESCRIPTION")}
            </TableHeadCell>
            <TableHeadCell className={`text-gray-700 font-semibold ${alignmentClass}`}>
              {getConsistentTranslatedText("DATE")}
            </TableHeadCell>
            <TableHeadCell className={`text-gray-700 font-semibold ${alignmentClass}`}>
              {getConsistentTranslatedText("Student")}
            </TableHeadCell>
            <TableHeadCell className={`text-gray-700 font-semibold ${alignmentClass}`}>
              {getConsistentTranslatedText("STATUS")}
            </TableHeadCell>
            <TableHeadCell className={`text-gray-700 font-semibold ${alignmentClass}`}>
              {getConsistentTranslatedText("VIEW")}
            </TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            // >>> Directly use the pre-fetched and enriched properties from 'item'
            const { studentFirstName, studentLastName, descriptionText } = item;

            // START: Hydration Fix - Date Formatting
            let formattedDate;
            if (!mounted) {
              // For SSR, provide a consistent, non-locale-dependent date format
              // E.g., Gregorian date in a fixed locale like 'en-US' or just a simple string
              formattedDate = new Date(item.excuse_date_g).toLocaleDateString("en-US", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
              });
            } else {
              // On client, after hydration, use the actual i18n language
              const date_to_format = isArabic ? item.excuse_date_h : item.excuse_date_g;
              formattedDate = isArabic
                ? date_to_format // Assuming excuse_date_h is already formatted as a string for Arabic
                : new Date(date_to_format).toLocaleDateString(i18n.language, {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                  });
            }
            // END: Hydration Fix

            return (
              <TableRow
                key={item.id} // Use item.id (which is a string) for the key
                className="bg-white hover:bg-[#F8F8F8] border-b border-gray-200"
              >
                <TableCell
                  className={`text-gray-900 ${alignmentClass}`}
                  // START: Hydration Fix - dir attribute
                  dir={mounted ? (isArabic ? "rtl" : "ltr") : "ltr"} // Consistent 'ltr' for SSR
                  // END: Hydration Fix
                >
                  {descriptionText || getConsistentTranslatedText("N/A")} {/* Use helper */}
                </TableCell>
                <TableCell className={`${alignmentClass}`}>
                  {formattedDate}
                </TableCell>
                <TableCell className={`${alignmentClass}`}>
                  {`${studentFirstName || getConsistentTranslatedText("N/A")} ${studentLastName || ""}`} {/* Use helper */}
                </TableCell>
                <TableCell className={`${alignmentClass}`}>
                  <span
                    className={`px-2 py-1 rounded font-bold ${
                      item.status_en === "APPROVED"
                        ? "text-green-500"
                        : item.status_en === "PENDING"
                        ? "text-orange-500"
                        : "text-red-500"
                    }`}
                  >
                    {/* START: Hydration Fix - Status text based on language */}
                    {mounted ? (isArabic ? item.status_ar : item.status_en) : item.status_en} {/* Consistent English for SSR */}
                    {/* END: Hydration Fix */}
                  </span>
                </TableCell>
                <TableCell className={`${alignmentClass}`}>
                  <Link
                    href={`/excuses/${item.id}`}
                    className="flex align-middle items-center"
                  >
                    <Image
                      src="/view.svg"
                      height={16}
                      width={16}
                      alt={getConsistentTranslatedText("view_icon_alt")} // Use helper
                      className="hover:opacity-75 transition-opacity flex justify-items-end items-end "
                    />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}