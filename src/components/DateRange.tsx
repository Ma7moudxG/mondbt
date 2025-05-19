import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { addDays } from 'date-fns';  // Add this import
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangeProps {
  onDateChange: (dates: { startDate: Date; endDate: Date }) => void;
}

const DateRangeComponent = ({ onDateChange }: DateRangeProps) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 7));

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      onDateChange({ startDate: date, endDate });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setEndDate(date);
      onDateChange({ startDate, endDate: date });
    }
  };

  return (
    <div className="flex flex-col gap-4 w-[100%] items-center">
      <div className="flex gap-2 items-center">
        <DatePicker
          selected={startDate}
          onChange={handleStartDateChange}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          customInput={<input className="border p-2 rounded w-32" />}
        />
        <span>to</span>
        <DatePicker
          selected={endDate}
          onChange={handleEndDateChange}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          customInput={<input className="border p-2 rounded w-32" />}
        />
      </div>
    </div>
  );
};

export default DateRangeComponent;