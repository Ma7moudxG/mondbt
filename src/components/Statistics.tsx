// src/components/Statistics.tsx
import React from "react";
import Image from "next/image";
import { Gauge, gaugeClasses } from "@mui/x-charts";

interface StatisticsProps {
  attendance: number;
  absence: number;
  late: number;
  totalPossibleAttendances: number;
  // rewards?: number; // Uncomment if you pass rewards
}

const Statistics: React.FC<StatisticsProps> = ({
  attendance,
  absence,
  late,
  totalPossibleAttendances,
  // rewards,
}) => {
  // Calculate attendance rate
  const attendanceRate =
    totalPossibleAttendances > 0
      ? Math.round((attendance / totalPossibleAttendances) * 100)
      : 0; // Avoid division by zero, round to nearest whole number

  return (
    <div className="statistics-component-container flex justify-between">
      <div className="flex flex-col gap-4 p-4 rounded-lg">
        <div className="flex gap-2 items-center">
          <Image src="/list-icon.svg" alt="list icon" width={32} height={32} />
          <p>
            Attendance: <strong>{attendance.toLocaleString()}</strong>
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Image src="/list-icon.svg" alt="list icon" width={32} height={32} />
          <p>
            Absence: <strong>{absence.toLocaleString()}</strong>
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Image src="/list-icon.svg" alt="list icon" width={32} height={32} />
          <p>
            Late: <strong>{late.toLocaleString()}</strong>
          </p>
        </div>
            {/* {rewards !== undefined && (
            <div className='flex gap-2 items-center'>
                <Image src="/list-icon.svg" alt="list icon" width={32} height={32}/>
                <p>Rewards: <strong>{rewards.toLocaleString()}</strong></p>
            </div>
          )} */}
      </div>
      <div className="flex">
        {/* Added flex-col to center text and gauge */}
        <Gauge
          value={attendanceRate} // Use attendanceRate here
          valueMax={100} // Set max value to 100 for percentage
          startAngle={-180} // Adjust angles for a more traditional gauge look if desired
          endAngle={180} // e.g., 220 degree arc for 0-100%
          innerRadius="60%"
          outerRadius="90%" // Adjusted outerRadius for better text visibility
          cornerRadius="50%"
          sx={{
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 26,
              transform: "translate(0px, 0px)", // Center the text
            },
            [`& .${gaugeClasses.valueArc}`]: {
              fill: "#6BBEA5",
            },
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: "#8447AB",
            },
          }}
          text={({ value }) => `${value}%`} // Display value with a percentage sign
        />
      </div>
    </div>
  );
};

export default Statistics;
