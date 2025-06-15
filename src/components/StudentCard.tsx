"use client"; // This is a client component

import { Student } from "@/services/dataService";
import DataService from "@/services/dataService";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next"; // Import useTranslation

const StudentCard = ({ student }: { student: Student }) => {
  const { t, i18n } = useTranslation(); // Initialize the translation hook and get i18n instance

  const school = DataService.getSchoolNameById(student.school_id, i18n.language);
  console.log("School inside card", school);

  // Determine which name to display based on the current language
  const firstName = i18n.language === 'ar' ? student.first_name_ar : student.first_name_en;
  const lastName = i18n.language === 'ar' ? student.last_name_ar : student.last_name_en;
  const classN = i18n.language === 'ar' ? student.class_ar : student.class_en;
  return (
    <div className="rounded-2xl flex justify-between text-white odd:bg-[#8447AB] even:bg-[#5EB89D] p-4 flex-1 min-w-[130px]">
      <div className="flex items-center gap-4 p-2">
        <Image
          src={student?.image_url || "/zahra.png"}
          height={90}
          width={90}
          alt={t("student_img")} // Translated alt text
          className=" rounded-full text-white hover:opacity-75 transition-opacity flex justify-items-end items-end "
        />
        <div className="">
          <div className="flex justify-between items-center">
            <span className="font-bold">
              {firstName} {lastName} {/* Dynamically display name */}
            </span>
          </div>
          <p className="my-2 font">{t("Class")}: {classN}</p> 
          <p className="my-2 font">{t("School")}: {school}</p> {/* Translated "School" */}
        </div>
      </div>
      <div>
        <Link href={`/students/${student.student_id}`}>
          <Image
            src="/view_w.svg"
            height={16}
            width={16}
            alt={t("view_icon_alt")} // Translated alt text
            className=" text-white pt-2 hover:opacity-75 transition-opacity flex justify-items-end items-end "
          />
        </Link>
      </div>
    </div>
  );
};

export default StudentCard;