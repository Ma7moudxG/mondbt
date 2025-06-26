// app/minister/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import DataService, {
  type School,
  type Region,
  type Student,
  Excuse,
} from "@/services/dataService";
import MinisterMap from "@/components/MinisterMap";
import { validateDataStructure } from "@/utils/dataValidator";
import AttendanceStatistics from "@/components/AttendanceStatistics";
import UserCard from "@/components/UserCard";
import { useTranslation } from "react-i18next";
import { AdminExcuses } from "@/components/AdminExcuses";

const cm = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

type CardTab = "Day" | "Month" | "Year";

interface CardStats {
  attendance: number;
  absence: number;
  late: number;
  fines: number;
  totalStudentsInRegion: number;
  totalPossibleAttendances: number;
  rewards: number;
}



const AbsenceStatisticsPage = () => {
  const { t, i18n } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);

  type EnrichedExcuse = Excuse & {
    studentFirstName: string | null;
    studentLastName: string | null;
    descriptionText: string | null;
  };

  const [excusesForStudents, setExcusesForStudents] = useState<EnrichedExcuse[]>([]);

  useEffect(() => {
      const fetchData = async () => {
        try {
          const excuses = await DataService.getExcuses();
          console.log("esccccccc", excuses)
          const enrichedExcusesPromises = excuses.map(async (excuse) => {
            const [firstName, lastName] = await DataService.getStudentNameById(
              excuse.student_id,
              i18n.language
            );
            console.log("esccccccc1", enrichedExcusesPromises)
            const descriptionText = await DataService.getExcuseDescriptionById(
              excuse.reason_id.toLocaleString(),
              i18n.language
            );
  
            return {
              ...excuse,
              studentFirstName: firstName,
              studentLastName: lastName,
              descriptionText: descriptionText,
            } as EnrichedExcuse;
          });
  
          const enrichedExcuses = await Promise.all(enrichedExcusesPromises);
          console.log("Enriched excuses ready for table:", enrichedExcuses);
          setExcusesForStudents(enrichedExcuses);
  
        } catch (err) {
          console.error("Failed to fetch parent page data:", err);
          setError(t("failed_to_load_data"));
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [t, i18n.language]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getConsistentTranslatedText = useCallback(
    (key: string) => {
      if (!mounted) {
        return key;
      }
      return t(key);
    },
    [mounted, t]
  );





  // Effect to load region-specific grouped stats, now incorporating overallCardStats.attendance

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex gap-12">
        <h1 className="text-lg font-black text-[#7C8B9D]">
          {getConsistentTranslatedText("Excuses")}
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        <AdminExcuses items={excusesForStudents} />
      </div>
    </div>
  );
};

export default AbsenceStatisticsPage;
