// src/components/UserCard.tsx
import Image from "next/image";

interface cardType {
  type: string, // This refers to the category name (e.g., "Attendance", "Absence")
  number: string,
  text: string
}

const UserCard = ({ type }: { type: cardType }) => {
  return (
    <div className="rounded-2xl text-white odd:bg-[#8447AB] even:bg-[#5EB89D] p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center">
        <span className="font-bold">
          {type.type}
        </span>
      </div>
      <h1 className="text-2xl my-2 font-black">{type.number}</h1>
      <h2 className="capitalize text-sm font-medium">{type.text}</h2>
    </div>
  );
};

export default UserCard;