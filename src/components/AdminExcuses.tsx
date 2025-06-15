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
import { useTranslation } from "react-i18next";

// --- Define the type for the items prop based on the enriched data ---
// This MUST match the EnrichedExcuse type in ParentPage.tsx
interface EnrichedExcuseItem extends Excuse {
  studentFirstName: string | null;
  studentLastName: string | null;
  descriptionText: string | null;
}

export function AdminExcuses({ items }: { items: EnrichedExcuseItem[] }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  // This console.log should now show the fully enriched data object for each item.
  // If this still shows an empty array or missing data, the problem is in ParentPage's enrichment logic.
  console.log("ExcusesTable received items (should be enriched):", items);

  const alignmentClass = isArabic ? "text-right" : "text-left";

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200  overflow-y h-[300px] w-full">
      <Table className={`custom-table`}>
        <TableHead className={`bg-[#F8F8F8]`}>
          <TableRow className="text-xs font-bold">
            <TableHeadCell className={`text-gray-700 font-semibold ${alignmentClass}`}>
              {t("DESCRIPTION")}
            </TableHeadCell>
            <TableHeadCell className={`text-gray-700 font-semibold ${alignmentClass}`}>
              {t("DATE")}
            </TableHeadCell>
            <TableHeadCell className={`text-gray-700 font-semibold ${alignmentClass}`}>
              {t("Student")}
            </TableHeadCell>
            <TableHeadCell className={`text-gray-700 font-semibold ${alignmentClass}`}>
              {t("STATUS")}
            </TableHeadCell>
            <TableHeadCell className={`text-gray-700 font-semibold ${alignmentClass}`}>
              {t("VIEW")}
            </TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            // >>> Directly use the pre-fetched and enriched properties from 'item'
            const { studentFirstName, studentLastName, descriptionText } = item;

            const date_to_format = isArabic
              ? item.excuse_date_h
              : item.excuse_date_g;

            const formattedDate = isArabic
              ? date_to_format
              : new Date(date_to_format).toLocaleDateString(i18n.language, {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                });

                // console.log('desc', descriptionText)

                // console.log("idddd", item.excuse_id)

            return (
              <TableRow
                key={item.id} // Use item.id (which is a string) for the key
                className="bg-white hover:bg-[#F8F8F8] border-b border-gray-200"
              >
                <TableCell
                  className={`text-gray-900 ${alignmentClass}`}
                  dir={isArabic ? "rtl" : "ltr"}
                >
                  {descriptionText || t("N/A")} {/* Use pre-fetched description */}
                </TableCell>
                <TableCell className={`${alignmentClass}`}>
                  {formattedDate}
                </TableCell>
                <TableCell className={`${alignmentClass}`}>
                  {`${studentFirstName || t("N/A")} ${studentLastName || ""}`} {/* Use pre-fetched student names */}
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
                    {isArabic ? item.status_ar : item.status_en}
                  </span>
                </TableCell>
                <TableCell className={`${alignmentClass}`}>
                  <Link
                    href={`/admin/excuses_admin/${item.id}`}
                    className="flex align-middle items-center"
                  >
                    <Image
                      src="/view.svg"
                      height={16}
                      width={16}
                      alt={t("view_icon_alt")}
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