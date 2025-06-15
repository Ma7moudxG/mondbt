// src/app/excuses/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react"; // Added useCallback
import Image from "next/image";
import Link from "next/link"; // Not used but good to keep if needed
import { useTranslation } from "react-i18next";

import DataService, { Excuse, Student } from "@/services/dataService";

interface ExcusePageProps {
  params: {
    id: string; // The ID from the URL is always a string
  };
}

const AdminExcusesPage = ({ params }: ExcusePageProps) => {
  const { t, i18n } = useTranslation();

  const excuseIdString: string = params.id;

  const [excuseDetails, setExcuseDetails] = useState<Excuse | null>(null);
  const [excuseDescription, setExcuseDescription] = useState<string | null>(
    null
  );
  const [excuseAttachment, setExcuseAttachment] = useState<string | null>(null);
  const [studentFullName, setStudentFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const [showModal, setShowModal] = useState(false);

  // Use a state for mounted to ensure client-side only rendering for critical parts
  // and prevent hydration errors when client-side language or data differs from server.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Set document direction based on language
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const isArabic = i18n.language === "ar";
  const textDirectionClass = isArabic ? "text-right" : "text-left";
  const dirAttribute = isArabic ? "rtl" : "ltr";

  // Memoize fetchExcuseData to prevent unnecessary re-creations
  const fetchExcuseData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch details and attachment first
      const [details, attachment] = await Promise.all([
        DataService.getExcuseDetailsById(excuseIdString),
        DataService.getExcuseAttachmentById(excuseIdString),
      ]);

      console.log("Fetched details:", details);
      console.log("Fetched attachment:", attachment);

      if (!details) {
        setError("excuse_not_found"); // Use string key for translation later
        setLoading(false);
        return;
      }

      setExcuseDetails(details);
      setExcuseAttachment(attachment);

      // Fetch description and student name *after* details are available
      // and ensure language is considered for translation.
      const [description, [firstName, lastName]] = await Promise.all([
        DataService.getExcuseDescriptionById(
          details.reason_id.toString(),
          i18n.language // Pass current language
        ),
        DataService.getStudentNameById(
          details.student_id as number,
          i18n.language // Pass current language
        ),
      ]);

      setExcuseDescription(description);
      setStudentFullName(`${firstName || t("N/A")} ${lastName || ""}`);
    } catch (err) {
      console.error("Failed to fetch Excuse details:", err);
      setError("failed_to_load_excuse_data_error"); // Use string key for translation later
    } finally {
      setLoading(false);
    }
  }, [excuseIdString, i18n.language, t]); // Dependencies for useCallback

  useEffect(() => {
    // Only fetch data if mounted (ensures client-side fetch, less critical for this component
    // as it's 'use client', but good for general data fetching after hydration).
    // The main reason for `mounted` is to ensure `i18n.language` is stable.
    if (mounted) {
      fetchExcuseData();
    }
  }, [mounted, fetchExcuseData]); // Added fetchExcuseData to dependencies

  const handleUpdateStatus = useCallback(async (status: "APPROVED" | "REJECTED") => {
    if (!excuseDetails) return;

    setIsUpdatingStatus(true);
    setError(null);

    const statusEn = status;
    const statusAr = status === "APPROVED" ? "مقبول" : "مرفوض";

    try {
      const updatedExcuse = await DataService.updateExcuseStatus(
        excuseDetails.id.toLocaleString(),
        statusEn,
        statusAr
      );
      setExcuseDetails(updatedExcuse);
      console.log(`Excuse ${excuseDetails.id} status updated to ${statusEn}`);
    } catch (err) {
      console.error("Error updating excuse status:", err);
      setError("failed_to_update_excuse_status_error");
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [excuseDetails, t]); // Added excuseDetails to dependencies

  const handleImageClick = useCallback(() => {
    if (excuseAttachment) {
      setShowModal(true);
    }
  }, [excuseAttachment]); // Added excuseAttachment to dependencies

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  // Ensure consistent date formatting on client-side
  const excuseDate = useMemo(() => {
    if (!excuseDetails) return t("N/A");

    if (isArabic) {
      return excuseDetails.excuse_date_h || t("N/A");
    } else {
      return excuseDetails.excuse_date_g
        ? new Date(excuseDetails.excuse_date_g).toLocaleDateString(i18n.language, {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          })
        : t("N/A");
    }
  }, [excuseDetails, isArabic, i18n.language, t]); // Dependencies for useMemo

  const excuseStatusTranslated = useMemo(() => {
    if (!excuseDetails) return t("N/A");
    return isArabic ? excuseDetails.status_ar : excuseDetails.status_en;
  }, [excuseDetails, isArabic, t]);

  // Render nothing or a minimal loading skeleton if not mounted yet,
  // or if still loading data. This helps prevent hydration errors by
  // ensuring the client's initial render matches the server's.
  if (!mounted || loading) { // Combine mounted check with loading
    return (
      <div className="p-4 flex flex-col gap-4 text-center text-gray-600">
        {t("loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex flex-col gap-4 text-center text-red-600">
        {t("error_prefix")}: {t(error)}
      </div>
    );
  }

  if (!excuseDetails) {
    return (
      <div className="p-4 flex flex-col gap-4 text-center text-gray-600">
        {t("no_excuse_details_found", { excuseId: excuseIdString })}
      </div>
    );
  }

  return (
    <div className={`p-4 flex flex-col gap-4 xl:w-1/2`} dir={dirAttribute}>
      <div className="p-8 bg-white rounded-2xl flex flex-col gap-8 shadow-md">
        <h1
          className={`text-lg font-black text-[#7C8B9D] ${textDirectionClass}`}
        >
          {t("Excuse Details")}
        </h1>

        <div className={`flex flex-col gap-4 ${textDirectionClass}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <div className="sm:w-1/2 lg:w-1/3">
              <p className="text-sm font-bold text-[#9B9B9B]">
                {t("Excuse ID")}
              </p>
              <h3 className="text-[#6BBEA5] font-medium">
                {excuseDetails?.id}{" "}
              </h3>
            </div>
            <div className="sm:w-1/2 lg:w-1/3">
              <p className="text-sm font-bold text-[#9B9B9B]">
                {t("Description")}
              </p>
              <h3 className="text-[#6BBEA5] font-medium">
                {excuseDescription || t("N/A")}{" "}
              </h3>
            </div>
            <div className="sm:w-1/2 lg:w-1/3">
              <p className="text-sm font-bold text-[#9B9B9B]">{t("Date")}</p>
              <h3 className="text-[#6BBEA5] font-medium">
                {excuseDate}
              </h3>
            </div>
            <div className="sm:w-1/2 lg:w-1/3">
              <p className="text-sm font-bold text-[#9B9B9B]">{t("Student")}</p>
              <h3 className="text-[#6BBEA5] font-medium">
                {studentFullName || t("N/A")}
              </h3>
            </div>
            <div className="sm:w-1/2 lg:w-1/3">
              <p className="text-sm font-bold text-[#9B9B9B]">{t("Status")}</p>
              <h3
                className={`font-medium ${
                  excuseDetails?.status_en === "APPROVED"
                    ? "text-green-500"
                    : excuseDetails?.status_en === "PENDING"
                    ? "text-orange-500"
                    : "text-red-500"
                }`}
              >
                {excuseStatusTranslated}
              </h3>
            </div>
            <div className="sm:w-1/2 lg:w-1/3">
              <p className="text-sm font-bold text-[#9B9B9B]">
                {t("Attachment")}
              </p>
              {excuseAttachment ? (
                <button
                  onClick={handleImageClick}
                  className="focus:outline-none"
                >
                  <Image
                    src={excuseAttachment}
                    height={150}
                    width={150}
                    alt={t("excuse_attachment_thumbnail_alt")}
                    className="cursor-pointer rounded-md shadow-md hover:opacity-75 transition-opacity"
                  />
                </button>
              ) : (
                <p className="text-gray-500">{t("no_attachment_available")}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 items-center justify-center">
          <button
            onClick={() => handleUpdateStatus("APPROVED")}
            disabled={
              isUpdatingStatus || excuseDetails?.status_en === "APPROVED"
            }
            className={`px-4 w-full sm:w-[30%] text-center py-2 text-sm font-medium text-white rounded-full
                                ${
                                  isUpdatingStatus ||
                                  excuseDetails?.status_en === "APPROVED"
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-500 hover:bg-green-700"
                                }`}
          >
            {isUpdatingStatus && excuseDetails?.status_en !== "REJECTED"
              ? t("Updating...")
              : t("Accept")}
          </button>
          <button
            onClick={() => handleUpdateStatus("REJECTED")}
            disabled={
              isUpdatingStatus || excuseDetails?.status_en === "REJECTED"
            }
            className={`px-4 w-full sm:w-[30%] text-center py-2 text-sm font-medium text-white rounded-full
                                ${
                                  isUpdatingStatus ||
                                  excuseDetails?.status_en === "REJECTED"
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-red-500 hover:bg-red-700"
                                }`}
          >
            {isUpdatingStatus && excuseDetails?.status_en !== "APPROVED"
              ? t("Updating...")
              : t("Reject")}
          </button>
        </div>
      </div>

      {showModal && excuseAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="relative bg-white rounded-lg p-4 w-full max-w-4xl max-h-[90vh] overflow-hidden flex justify-center items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-800 hover:text-gray-600 text-3xl font-bold p-1 leading-none"
              aria-label={t("close_button_alt")}
            >
              &times;
            </button>
            <div
              className="relative w-full"
              style={{
                height: "calc(90vh - 8rem)", // Adjusted height based on context
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {excuseAttachment && (
                <Image
                  key={excuseAttachment + "-modal"}
                  src={excuseAttachment}
                  alt={t("full_size_excuse_attachment_alt")}
                  layout="fill" // This is deprecated in Next.js 13+
                  objectFit="contain"
                  className="rounded-md"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExcusesPage;