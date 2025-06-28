// src/app/excuses/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";

import DataService, { Excuse, Student } from "@/services/dataService";

const AdminExcusesPage = () => {
  const getConsistentTranslatedText = (key: string) => {
    if (!mounted) {
      return key; // During SSR, return the key itself (assuming keys are in default language, e.g., English)
    }
    return t(key); // After hydration, use the actual translation
  };

  const [remarks, setRemarks] = useState("");

  const params = useParams();

  // Safely extract id with proper type handling.
  const excuseIdString: string | undefined = params?.id
    ? Array.isArray(params.id)
      ? params.id[0]
      : params.id
    : undefined;

  const { t, i18n } = useTranslation();

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

  // Mounted state to distinguish between server render and client hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Component has mounted on the client
    // Setting document direction globally is safe here as it runs client-side
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  const isArabic = i18n.language === "ar";
  const textDirectionClass = isArabic ? "text-right" : "text-left";

  // Conditionally apply dir attribute to the component's root div
  // On SSR, it will be 'ltr' (or your i18n default). On client mount, it updates.
  const dirAttribute = mounted && isArabic ? "rtl" : "ltr";

  // Memoized fetch function
  const fetchExcuseData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!excuseIdString) {
      setError("invalid_excuse_id");
      setLoading(false);
      return;
    }

    try {
      const details = await DataService.getExcuseDetailsById(excuseIdString);

      if (!details) {
        setError("excuse_not_found");
        setLoading(false);
        return;
      }

      setExcuseDetails(details);

      const [attachmentUrl, description, [firstName, lastName]] =
        await Promise.all([
          DataService.getExcuseAttachmentById(details.id.toString()),
          DataService.getExcuseDescriptionById(
            details.reason_id.toString(),
            i18n.language
          ),
          DataService.getStudentNameById(
            details.student_id as number,
            i18n.language
          ),
        ]);

      setExcuseAttachment(attachmentUrl);
      setExcuseDescription(description);
      setStudentFullName(`${firstName || t("N/A")} ${lastName || ""}`);
    } catch (err) {
      console.error("Failed to fetch Excuse details:", err);
      setError("failed_to_load_excuse_data_error");
    } finally {
      setLoading(false);
    }
  }, [excuseIdString, i18n.language, t]);

  useEffect(() => {
    if (mounted && excuseIdString) {
      fetchExcuseData();
    } else if (mounted && excuseIdString === undefined) {
      setLoading(false);
      setError("invalid_excuse_id");
    }
  }, [mounted, excuseIdString, fetchExcuseData]);

  const handleUpdateStatus = useCallback(
    async (status: "APPROVED" | "REJECTED") => {
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
    },
    [excuseDetails]
  );

  const handleImageClick = useCallback(() => {
    if (excuseAttachment) {
      setShowModal(true);
    }
  }, [excuseAttachment]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const excuseDate = useMemo(() => {
    if (!excuseDetails) return t("N/A");
    return isArabic
      ? excuseDetails.excuse_date_h || t("N/A")
      : excuseDetails.excuse_date_g
      ? new Date(excuseDetails.excuse_date_g).toLocaleDateString(
          i18n.language,
          {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          }
        )
      : t("N/A");
  }, [excuseDetails, isArabic, i18n.language, t]);

  const excuseStatusTranslated = useMemo(() => {
    if (!excuseDetails) return t("N/A");
    return isArabic ? excuseDetails.status_ar : excuseDetails.status_en;
  }, [excuseDetails, isArabic, t]);

  // --- Crucial change here for loading state text ---
  if (!mounted) {
    // During SSR, and initial client render before useEffect runs.
    // Render a consistent, non-localized loading message.
    return (
      <div
        className="p-4 flex flex-col gap-4 text-center text-gray-600"
        dir="ltr"
      >
        Loading... {/* This text will be consistently rendered on SSR */}
      </div>
    );
  }

  // Once mounted, subsequent renders can use localized text and dynamic dir.
  if (excuseIdString === undefined) {
    return (
      <div
        className="p-4 flex flex-col gap-4 text-center text-red-600"
        dir={dirAttribute}
      >
        {t("invalid_excuse_id_in_url")}
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="p-4 flex flex-col gap-4 text-center text-gray-600"
        dir={dirAttribute}
      >
        {t("loading")} {/* This will now be localized only on the client */}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-4 flex flex-col gap-4 text-center text-red-600"
        dir={dirAttribute}
      >
        {t("error_prefix")}: {t(error)}
      </div>
    );
  }

  if (!excuseDetails) {
    return (
      <div
        className="p-4 flex flex-col gap-4 text-center text-gray-600"
        dir={dirAttribute}
      >
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
                {t("Excuse Type")}
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
              <h3 className="text-[#6BBEA5] font-medium">{excuseDate}</h3>
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
            <div className="sm:w-full">
              <p className="text-sm font-bold text-[#9B9B9B]">{t("Remarks")}</p>
              <h3 className="text-[#6BBEA5] font-medium">
                {isArabic ? excuseDetails.remarks_ar : excuseDetails.remarks_en}
              </h3>
            </div>
          </div>

          <div>
            <label
              htmlFor="remarks"
              className={`block text-sm font-medium text-gray-700 mb-2 ${textDirectionClass}`}
            >
              {getConsistentTranslatedText("Remarks")}
            </label>
            <textarea
              id="remarks"
              name="remarks"
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8447AB] focus:ring-[#8447AB] sm:text-sm"
              placeholder={getConsistentTranslatedText(
                "Enter any additional remarks (optional)"
              )}
              dir={dirAttribute} // dirAttribute itself is now fixed for hydration
            ></textarea>
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
            className="relative bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] w-full h-[90vh] flex flex-col justify-center items-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-800 hover:text-gray-600 text-3xl font-bold p-1 leading-none z-50"
              aria-label={t("close_button_alt")}
            >
              &times;
            </button>

            <div
              className="relative flex-grow w-full flex justify-center items-center"
              style={{
                maxWidth: "calc(100vw - 64px)",
                maxHeight: "calc(90vh - 64px - 4rem)",
                position: "relative",
              }}
            >
              <Image
                key={excuseAttachment + "-modal"}
                src={excuseAttachment}
                alt={t("full_size_excuse_attachment_alt")}
                fill={true}
                objectFit="contain"
                className="rounded-md"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExcusesPage;
