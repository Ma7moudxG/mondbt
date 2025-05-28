import { Excuse } from "@/services/dataService";
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

export function ExcusesTable({ items }: { items: Excuse[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <Table className="custom-table">
        <TableHead className="bg-[#F8F8F8]">
          <TableRow className="text-xs font-bold">
            <TableHeadCell className="text-gray-700 font-semibold">
              Description
            </TableHeadCell>
            <TableHeadCell className="text-gray-700 font-semibold">
              Date
            </TableHeadCell>
            <TableHeadCell className="text-gray-700 font-semibold">
              Student
            </TableHeadCell>
            <TableHeadCell className="text-gray-700 font-semibold">
              Status
            </TableHeadCell>
            <TableHeadCell className="text-gray-700 font-semibold">
              View
            </TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.student_id}
              className="bg-white hover:bg-[#F8F8F8] border-b border-gray-200"
            >
              <TableCell className="text-gray-900">
                {item.description}
              </TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.first_name_en}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded ${
                    item.status === "approved"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {item.status}
                </span>
              </TableCell>
              <TableCell>
                <Link
                  href={`/student/${item.student_id}`}
                  className="flex align-middle items-center"
                >
                  <Image
                    src="/view.svg"
                    height={16}
                    width={16}
                    alt="view"
                    className="hover:opacity-75 transition-opacity flex justify-items-end items-end "
                  />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
