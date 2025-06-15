"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import DataService, { Excuse, Student } from "@/services/dataService";

export default function ExcusePage() {
  const params = useParams();

  // Safely extract id with proper type handling
  const excuseId = params?.id
    ? Array.isArray(params.id)
      ? params.id[0]
      : params.id
    : undefined;

  // Return early if ID is missing
  if (!excuseId) {
    return (
      <div className="p-4 flex flex-col gap-4 text-center text-red-600">
        Invalid excuse ID in URL
      </div>
    );
  }

  const { t, i18n } = useTranslation();

  const [excuseDetails, setExcuseDetails] = useState<Excuse | null>(null);
  const [excuseDescription, setExcuseDescription] = useState<string | null>(
    null
  );
  const [excuseAttachment, setExcuseAttachment] = useState<string | null>(null);
  const [studentFullName, setStudentFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const isArabic = i18n.language === "ar";
  const textDirectionClass = isArabic ? "text-right" : "text-left";
  const dirAttribute = isArabic ? "rtl" : "ltr";

  useEffect(() => {
    const fetchExcuseData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Now we can safely use excuseId as it's guaranteed to be a string
        const [details, attachment] = await Promise.all([
          DataService.getExcuseDetailsById(excuseId),
          DataService.getExcuseAttachmentById(excuseId),
        ]);

        if (!details) {
          setError(t("excuse_not_found"));
          setLoading(false);
          return;
        }

        setExcuseDetails(details);
        setExcuseAttachment(attachment);

        const [description, [firstName, lastName]] = await Promise.all([
          DataService.getExcuseDescriptionById(
            details.reason_id.toString(),
            i18n.language
          ),
          DataService.getStudentNameById(
            details.student_id as number,
            i18n.language
          ),
        ]);

        setExcuseDescription(description);
        setStudentFullName(`${firstName || t("N/A")} ${lastName || ""}`);
      } catch (err) {
        console.error("Failed to fetch Excuse details:", err);
        setError(t("failed_to_load_excuse_data_error"));
      } finally {
        setLoading(false);
      }
    };

    fetchExcuseData();
  }, [excuseId, i18n.language, t]);

  const handleImageClick = () => {
    if (excuseAttachment) {
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const excuseDate = isArabic
    ? excuseDetails?.excuse_date_h
    : excuseDetails?.excuse_date_g
    ? new Date(excuseDetails.excuse_date_g).toLocaleDateString(i18n.language, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })
    : null;

  const excuseStatus = isArabic
    ? excuseDetails?.status_ar
    : excuseDetails?.status_en;

  // if (loading) {
  //   return (
  //     <div className="p-4 flex flex-col gap-4 text-center text-gray-600">
  //       {t("loading")}
  //     </div>
  //   );
  // }

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
        {t("Loading...", { excuseId: excuseId })}
      </div>
    );
  }

  return (
    <div className={`p-4 flex flex-col gap-4 w-1/2`} dir={dirAttribute}>
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
                {excuseDate || t("N/A")}
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
                {excuseStatus || t("N/A")}
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
        </div>
        <Link
          href={`/parent/new_excuse`}
          className="px-4 w-full sm:w-[30%] mx-auto text-center py-2 text-sm font-medium text-white rounded-full bg-[#8447AB] hover:bg-[#643581]"
        >
          {t("New Excuse")}
        </Link>
      </div>
      
      {showModal && excuseAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={handleCloseModal}
        >
          <div
            // This div is the white background of the modal content
            // Added fixed w-full and h-full for debugging, will refine later
            className="relative bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] w-full h-[90vh] flex flex-col justify-center items-center overflow-hidden" // Changed to w-full h-[90vh] for explicit sizing within its parent's flex context
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-800 hover:text-gray-600 text-3xl font-bold p-1 leading-none z-50"
              aria-label={t("close_button_alt")}
            >
              &times;
            </button>

            {/* This is the direct parent of the Image with layout="fill" */}
            {/* It should now correctly take up the available space within the modal content */}
            <div
              className="relative flex-grow w-full flex justify-center items-center" // Use flex-grow to take available space
              style={{
                // These max values define the upper limit, but flex-grow will dictate actual size
                maxWidth: "calc(100vw - 64px)", // Adjusting for 2x p-4 padding on parent
                maxHeight: "calc(90vh - 64px - 4rem)", // Adjusting for padding and button height
                position: "relative", // Essential for layout="fill"
              }}
            >
              <Image
                key={excuseAttachment + "-modal"}
                src={excuseAttachment}
                alt={t("excuse_attachment")}
                layout="fill"
                objectFit="contain" // Keeps aspect ratio, fits within bounds
                className="rounded-md"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
