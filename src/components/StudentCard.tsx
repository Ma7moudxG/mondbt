import { Student } from "@/services/dataService";
import DataService from "@/services/dataService";
import Image from "next/image";
import Link from "next/link";

const StudentCard = ({ student }: { student: Student }) => {
  const school = DataService.getSchoolNameById(student.school_id);
  console.log("student inside card", student)
  return (
    <div className="rounded-2xl flex justify-between text-white odd:bg-[#8447AB] even:bg-[#5EB89D] p-4 flex-1 min-w-[130px]">
      <div className="">
        <div className="flex justify-between items-center">
          <span className="font-bold">
            {student.first_name_en} {student.last_name_en}
          </span>
        </div>
        <p className="my-2 font-bold">Class: {student.school_id}</p>
        <p className="my-2 font-bold">School: {school}</p>
      </div>
      <div>
        <Link href={`/students/${student.student_id}`}>
          <Image
            src="/view_w.svg"
            height={16}
            width={16}
            alt="view"
            className=" text-white pt-2 hover:opacity-75 transition-opacity flex justify-items-end items-end "
          />
        </Link>
      </div>
    </div>
  );
};

export default StudentCard;
