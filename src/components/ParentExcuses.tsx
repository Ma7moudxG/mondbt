import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import Link from "next/link";
import Image from "next/image";

const ParentExcuses = () => {

  const excuses = [
    {
      name: "Sickness of student/ Ahmed Ali",
      date: "23/10/2025",
      status: "accepted"
    },
    {
      name: "Death of a family member",
      date: "23/10/2025",
      status: "rejected"
    },
    {
      name: "Doctor appointment",
      date: "23/10/2025",
      status: "accepted"
    },
    {
      name: "National day represntation",
      date: "23/10/2025",
      status: "accepted"
    },
    
  ];
  return (
    <div className="overflow-x-auto rounded-xl flex flex-col gap-4">
      <div className="text-[#5EB89D] flex justify-between text-lg font-bold">
        <h1>Description</h1>
        <h1>Status</h1>
      </div>
      <hr />
      <div>
        {excuses.map((i) => (
          <div className=" flex justify-between">
            <h1>{i.name}</h1>
            <h1>{i.status}</h1>
          </div>
        ))}
      </div>
      <Link
        href={``}
        className="py-2 mt-4 text-sm font-bold text-white rounded-full bg-[#8447AB] hover:bg-[#643581]"
      >
        <p className="flex justify-center">New Excuse</p>
      </Link>
    </div>
  );
};

export default ParentExcuses;
