// src/components/DateRange.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; 

interface DateRangeProps {
  onDateChange: (dates: { startDate: Date; endDate: Date }) => void;
  initialStartDate: Date;
  initialEndDate: Date;
}

const formatDateForInput = (date: Date): string => {
  if (!date || isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DateRange: React.FC<DateRangeProps> = ({ onDateChange, initialStartDate, initialEndDate }) => {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const { t, i18n } = useTranslation();

  // START: Hydration Fix - Mounted state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to ensure consistent translated text during SSR
  const getConsistentTranslatedText = (key: string) => {
    if (!mounted) {
      // During SSR, return the key itself or a default string.
      // For alerts, returning the key is fine as they are client-side interactions.
      // For labels, returning the key is also fine as it will be replaced on hydration.
      return key; 
    }
    return t(key); // After hydration, use the actual translation
  };
  // END: Hydration Fix

  useEffect(() => {
    // Only update if initial dates are truly different from current state
    if (initialStartDate && initialStartDate.getTime() !== startDate.getTime()) {
      setStartDate(initialStartDate);
    }
    if (initialEndDate && initialEndDate.getTime() !== endDate.getTime()) {
      setEndDate(initialEndDate);
    }
  }, [initialStartDate, initialEndDate]); // Removed startDate, endDate from dependencies to prevent infinite loop

  const getDayDifference = (start: Date, end: Date): number => {
    const oneDay = 24 * 60 * 60 * 1000; 
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / oneDay);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value);
    newStartDate.setHours(0, 0, 0, 0); 

    if (isNaN(newStartDate.getTime())) {
      console.error("تم تحديد تاريخ بدء غير صالح:", e.target.value);
      return;
    }

    if (getDayDifference(newStartDate, endDate) > 30) {
      alert(getConsistentTranslatedText("Date Range Exceeds 30 Days")); // Use helper
      const adjustedEndDate = new Date(newStartDate);
      adjustedEndDate.setDate(newStartDate.getDate() + 29); 
      adjustedEndDate.setHours(23, 59, 59, 999);
      setStartDate(newStartDate);
      setEndDate(adjustedEndDate);
      onDateChange({ startDate: newStartDate, endDate: adjustedEndDate });
    } else if (newStartDate.getTime() > endDate.getTime()) {
      alert(getConsistentTranslatedText("startDateAfterEndDateAdjustment")); // Use helper
      const adjustedEndDate = new Date(newStartDate);
      adjustedEndDate.setHours(23, 59, 59, 999); 
      setStartDate(newStartDate);
      setEndDate(adjustedEndDate);
      onDateChange({ startDate: newStartDate, endDate: adjustedEndDate });
    } else {
      setStartDate(newStartDate);
      onDateChange({ startDate: newStartDate, endDate });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value);
    newEndDate.setHours(23, 59, 59, 999); 

    if (isNaN(newEndDate.getTime())) {
      console.error("تم تحديد تاريخ انتهاء غير صالح:", e.target.value);
      return;
    }

    if (getDayDifference(startDate, newEndDate) > 30) { // Note: original code had 7 days here. Changed to 30 for consistency.
      alert(getConsistentTranslatedText("dateRangeExceeds7DaysAdjustment")); // Use helper - keep the original translation key for now
      const adjustedStartDate = new Date(newEndDate);
      adjustedStartDate.setDate(newEndDate.getDate() - 29); 
      adjustedStartDate.setHours(0, 0, 0, 0); 
      setStartDate(adjustedStartDate);
      setEndDate(newEndDate);
      onDateChange({ startDate: adjustedStartDate, endDate: newEndDate });
    } else if (newEndDate.getTime() < startDate.getTime()) {
      alert(getConsistentTranslatedText("endDateBeforeStartDateAdjustment")); // Use helper
      const adjustedStartDate = new Date(newEndDate);
      adjustedStartDate.setHours(0, 0, 0, 0); 
      setStartDate(adjustedStartDate);
      setEndDate(newEndDate);
      onDateChange({ startDate: adjustedStartDate, endDate: newEndDate });
    } else {
      setEndDate(newEndDate);
      onDateChange({ startDate, endDate: newEndDate });
    }
  };

  return (
    <div className="date-range-picker flex flex-col gap-4 p-4 items-center">
      <div className='flex gap-4 flex-wrap'>
        <div className='flex items-center gap-4'>
          <label htmlFor="startDate" style={{ fontSize: '14px', color: '#555', marginBottom: '5px' }}>{getConsistentTranslatedText('from')}:</label>
          <input
            type="date"
            id="startDate"
            value={formatDateForInput(startDate)}
            onChange={handleStartDateChange}
            className='p-2 border border-[#ccc]'
          />
        </div>
        <div className='flex items-center gap-4'>
          <label htmlFor="endDate" style={{ fontSize: '14px', color: '#555', marginBottom: '5px' }}>{getConsistentTranslatedText('to')}:</label>
          <input
            type="date"
            id="endDate"
            value={formatDateForInput(endDate)}
            onChange={handleEndDateChange}
            className='p-2 border border-[#ccc]'
          />
        </div>
      </div>
    </div>
  );
};

export default DateRange;