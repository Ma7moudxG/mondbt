// src/app/parent/new_excuse/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import DataService, { ExcuseReason, Student } from "@/services/dataService";

const NewExcusePage = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  // START: Hydration Fix - Mounted state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // END: Hydration Fix

  const parentId = 7; // Mock parent ID

  const [students, setStudents] = useState<Student[]>([]);
  const [excuseReasons, setExcuseReasons] = useState<ExcuseReason[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);

  const [selectedDateG, setSelectedDateG] = useState<string>(""); // State for Gregorian date input (e.g., "YYYY-MM-DD")
  const [remarks, setRemarks] = useState("");
  const [attachment, setAttachment] = useState<File | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);

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

  const textDirectionClass = isArabic ? "text-right" : "text-left";
  // The dirAttribute should also be consistent for SSR
  const dirAttribute = mounted ? (isArabic ? "rtl" : "ltr") : "ltr"; // Default to 'ltr' for SSR

  useEffect(() => {
    const fetchData = async () => {
      const parentStudents = DataService.getStudentsByParentId(parentId);
      console.log("Students loaded for parentId:", parentId, parentStudents);
      setStudents(parentStudents);

      try {
        const reasons = await DataService.getExcuseReasons();
        console.log("Fetched raw Excuse Reasons:", reasons);

        const processedReasons = reasons.map(reason => {
            const numericId = Number(reason.id);
            const safeReasonId = isNaN(numericId) ? 0 : numericId;
            console.log("Processing reason:", reason, "-> numericId:", numericId, "-> safeReasonId:", safeReasonId);
            return {
              ...reason,
              reason_id: safeReasonId
            };
        }) as ExcuseReason[];
        setExcuseReasons(processedReasons);
      } catch (error) {
        console.error("Failed to fetch excuse reasons:", error);
        setSubmissionError(getConsistentTranslatedText("failed_to_load_excuse_reasons")); // Use helper
      }
    };

    fetchData();
    // Depend on parentId and t (though t is stable, parentId might change)
  }, [parentId]); // Removed 't' from dependency array as it's stable

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionError(null);
    setSubmissionSuccess(false);

    console.log("Submit Check: selectedStudentId", selectedStudentId);
    console.log("Submit Check: selectedReasonId", selectedReasonId);
    console.log("Submit Check: selectedDateG", selectedDateG);
    console.log("Submit Check: attachment", attachment);

    if (
      selectedStudentId === null ||
      selectedReasonId === null ||
      !selectedDateG || // selectedDateG must be a valid date string
      !attachment
    ) {
      console.log("Submit Check: Required field missing!");
      setSubmissionError(getConsistentTranslatedText("please_fill_all_required_fields")); // Use helper
      setSubmitting(false);
      return;
    }

    let excuseDateH = "";
    let excuseDateGFormatted = "";

    try {
      // 1. Parse the Gregorian date string from the input
      const gregorianDateObject = new Date(selectedDateG + 'T00:00:00'); // Add T00:00:00 to ensure UTC interpretation and avoid timezone issues
      if (isNaN(gregorianDateObject.getTime())) { // Check for invalid date
        throw new Error("Invalid Gregorian date selected.");
      }

      // 2. Format Gregorian date for storage (as YYYY-MM-DD HH:mm:ss, but with 00:00:00 time)
      const year = gregorianDateObject.getFullYear();
      const month = String(gregorianDateObject.getMonth() + 1).padStart(2, '0');
      const day = String(gregorianDateObject.getDate()).padStart(2, '0');
      excuseDateGFormatted = `${year}-${month}-${day} 00:00:00`;

      // 3. Convert Gregorian date to Hijri date using Intl.DateTimeFormat
      // Note: This conversion is fine because it happens *after* mount on client-side
      // and isn't part of the initial SSR HTML.
      const hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      excuseDateH = hijriFormatter.format(gregorianDateObject);
      excuseDateH = excuseDateH.replace(/\//g, '-');
    } catch (error) {
      console.error("Date conversion error:", error);
      setSubmissionError(getConsistentTranslatedText("Invalid date format or conversion failed.")); // Use helper
      setSubmitting(false);
      return;
    }
    console.log("daaaaaaaaaaaaaaaaaaaaaa", excuseDateH)
    try {
      const { newExcuse } = await DataService.createExcuse(
        parentId,
        selectedStudentId,
        selectedReasonId,
        remarks,
        attachment,
        excuseDateGFormatted, // Pass the formatted Gregorian date
        excuseDateH // Pass the converted Hijri date
      );
      setSubmissionSuccess(true);
      router.push(`/excuses/${newExcuse.id}`);
    } catch (err) {
      console.error("Failed to submit excuse:", err);
      setSubmissionError(getConsistentTranslatedText("failed_to_submit_excuse")); // Use helper
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`p-4 flex flex-col gap-8 w-1/2`}>
      <div className="p-8 bg-white rounded-2xl flex flex-col gap-8 shadow-md">
        <h1
          className={`text-2xl font-black text-[#8447AB] ${textDirectionClass}`}
        >
          {getConsistentTranslatedText("New Excuse")}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Student Select */}
          <div>
            <label
              htmlFor="student"
              className={`block text-sm font-medium text-gray-700 mb-2 ${textDirectionClass}`}
            >
              {getConsistentTranslatedText("Select Student")} <span className="text-red-500">*</span>
            </label>
            <select
              id="student"
              name="student"
              value={
                selectedStudentId === null ? "" : String(selectedStudentId)
              }
              onChange={(e) => {
                const value = e.target.value;
                setSelectedStudentId(value === "" ? null : Number(value));
              }}
              required
              className="px-4 py-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8447AB] focus:ring-[#8447AB] sm:text-sm"
            >
              <option value="">{getConsistentTranslatedText("Select Student")}</option>
              {students.map((student) => {
                // START: Hydration Fix - Student Name
                const [firstName, lastName] = mounted
                  ? DataService.getStudentNameById(student.student_id, i18n.language)
                  : DataService.getStudentNameById(student.student_id, "en"); // Consistent English for SSR
                // END: Hydration Fix
                return (
                  <option key={student.student_id} value={student.student_id}>
                    {firstName} {lastName}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Reason Select */}
          <div>
            <label
              htmlFor="reason"
              className={`block text-sm font-medium text-gray-700 mb-2 ${textDirectionClass}`}
            >
              {getConsistentTranslatedText("Excuse Reason")} <span className="text-red-500">*</span>
            </label>
            <select
              id="reason"
              name="reason"
              value={selectedReasonId === null ? "" : String(selectedReasonId)}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedReasonId(value === "" ? null : Number(value));
              }}
              required
              className="px-4 py-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8447AB] focus:ring-[#8447AB] sm:text-sm"
            >
              <option value="" disabled>
                {getConsistentTranslatedText("Excuse Reason")}
              </option>
              {excuseReasons.map((reason) => {
                return (
                  <option key={reason.reason_id} value={reason.reason_id}>
                    {/* START: Hydration Fix - Excuse Reason Description */}
                    {mounted ? (isArabic ? reason.description_ar : reason.description_en) : reason.description_en}
                    {/* END: Hydration Fix */}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Date Input */}
          <div>
            <label
              htmlFor="excuseDate"
              className={`block text-sm font-medium text-gray-700 mb-2 ${textDirectionClass}`}
            >
              {getConsistentTranslatedText("Date of Absence")} <span className="text-red-500">*</span>
            </label>
            <input
              id="excuseDate"
              type="date"
              name="excuseDate"
              value={selectedDateG}
              onChange={(e) => setSelectedDateG(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8447AB] focus:ring-[#8447AB] sm:text-sm"
            />
          </div>

          {/* Remarks Textarea (new field) */}
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
              placeholder={getConsistentTranslatedText("Enter any additional remarks (optional)")}
              dir={dirAttribute} // dirAttribute itself is now fixed for hydration
            ></textarea>
          </div>

          {/* Attachment Upload */}
          <div>
            <label
              htmlFor="attachment"
              className={`block text-sm font-medium text-gray-700 mb-2 ${textDirectionClass}`}
            >
              {getConsistentTranslatedText("Attachment")} <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="attachment"
              name="attachment"
              required
              onChange={(e) => setAttachment(e.target.files?.[0] || undefined)}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#8447AB] file:text-white hover:file:bg-[#643581]"
              dir="ltr" // This is hardcoded to 'ltr', so it's consistent. No change needed.
            />
            <p className="mt-1 text-sm text-gray-500">
              {getConsistentTranslatedText("Max file size: 5MB")}
            </p>
          </div>

          {/* Submission Feedback */}
          {submissionError && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {submissionError}
            </div>
          )}
          {submissionSuccess && (
            <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
              {getConsistentTranslatedText("Excuse submitted successfully!")}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto self-end px-6 py-3 text-lg font-medium text-white rounded-full bg-[#5EB89D] hover:bg-[#4a9780] focus:outline-none focus:ring-2 focus:ring-[#5EB89D] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? getConsistentTranslatedText("Submitting...") : getConsistentTranslatedText("Submit Excuse")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewExcusePage;