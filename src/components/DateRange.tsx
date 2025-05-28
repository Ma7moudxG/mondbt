// src/components/DateRange.tsx
import React, { useState, useEffect } from 'react';

interface DateRangeProps {
  onDateChange: (dates: { startDate: Date; endDate: Date }) => void;
  initialStartDate: Date;
  initialEndDate: Date;
}

// Ensure this formats to "YYYY-MM-DD" correctly
const formatDateForInput = (date: Date): string => {
  if (!date || isNaN(date.getTime())) { // Check if date is valid
    return '';
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DateRange: React.FC<DateRangeProps> = ({ onDateChange, initialStartDate, initialEndDate }) => {
  // State for the component's internal date inputs
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  useEffect(() => {
    // Only update if the incoming props are different from current state
    if (startDate.getTime() !== initialStartDate.getTime()) {
      setStartDate(initialStartDate);
    }
    if (endDate.getTime() !== initialEndDate.getTime()) {
      setEndDate(initialEndDate);
    }
    // No need to call onDateChange here, as it's triggered by the parent's `useState`
  }, [initialStartDate, initialEndDate, startDate, endDate]); // Added startDate, endDate to deps for strict check

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value);
    // Ensure the new date is valid before setting state and propagating
    if (!isNaN(newStartDate.getTime())) {
      setStartDate(newStartDate);
      // Call parent's onDateChange with the correct, full date objects
      onDateChange({ startDate: newStartDate, endDate });
    } else {
      console.error("Invalid start date selected:", e.target.value);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value);
    // Ensure the new date is valid before setting state and propagating
    if (!isNaN(newEndDate.getTime())) {
      setEndDate(newEndDate);
      // Call parent's onDateChange with the correct, full date objects
      onDateChange({ startDate, endDate: newEndDate });
    } else {
      console.error("Invalid end date selected:", e.target.value);
    }
  };

  return (
    <div className="date-range-picker flex flex-col gap-4 p-4 items-center">
      <div className='flex gap-4 flex-wrap'>
        <div className='flex items-center gap-4'>
          <label htmlFor="startDate" style={{ fontSize: '14px', color: '#555', marginBottom: '5px' }}>From:</label>
          <input
            type="date"
            id="startDate"
            value={formatDateForInput(startDate)} // This is the key
            onChange={handleStartDateChange}
            className='p-2 border border-[#ccc]'
          />
        </div>
        <div className='flex items-center gap-4'>
          <label htmlFor="endDate" style={{ fontSize: '14px', color: '#555', marginBottom: '5px' }}>To:</label>
          <input
            type="date"
            id="endDate"
            value={formatDateForInput(endDate)} // This is the key
            onChange={handleEndDateChange}
            className='p-2 border border-[#ccc]'
          />
        </div>
      </div>
    </div>
  );
};

export default DateRange;