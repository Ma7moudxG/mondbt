import MainChart from '@/components/MainChart';
import MinisterMap from '@/components/MinisterMap';
import UserCard from '@/components/UserCard';
import React from 'react'

const cards = [
  {
    type:"Attendance",
    number:"5,983,404",
    text: "student"
  },
  {
    type:"Absence",
    number:"314,916",
    text: "student"
  },
  {
    type:"Late",
    number:"1,180,935",
    text: "late student"
  },
  {
    type:"Excuses",
    number:"12,650",
    text: "Excuse"
  },
  {
    type:"Fines",
    number:"1,020,935",
    text: "Saudi Riyal"
  },
]

const MinisterPage = () => {
  return (
    <div className='p-4 flex flex-col gap-4'>
      <div className='flex flex-col gap-4'>
        <h1 className="text-lg font-black text-[#7C8B9D]">Statistics </h1>
        <div>
          {/* menu ( day - month - year )  */}
        </div>
      </div>
      {/* USER CARDS */}
      <div className="flex gap-2 justify-between flex-wrap">
          {cards.map( i => (
            <UserCard key={i.type} type={i} />
          ))}
      </div>
    <div className="flex gap-4 flex-col md:flex-row">

      {/* LEFT */}
      <div className="w-1/2 bg-white rounded-2xl">
          <MinisterMap />
      </div>
      {/* RIGHT */}
      <div className="w-1/2 p-8 bg-white rounded-2xl">
          <div className="w-full h-[400px]">
            <MainChart />
          </div>
      </div>
    </div>
    </div>
  );
};

export default MinisterPage