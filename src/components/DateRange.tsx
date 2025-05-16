import { useState } from 'react';
import { DateRangePicker, Range, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { addDays } from 'date-fns';

interface DateRangeProps {
  onDateChange: (dates: { startDate: Date; endDate: Date }) => void;
}

const DateRangeComponent = ({ onDateChange }: DateRangeProps) => {
  const [state, setState] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection'
    }
  ]);

  const handleSelect = (ranges: RangeKeyDict) => {
    const selection = ranges.selection;
    setState([selection]);
    onDateChange({
      startDate: selection.startDate!,
      endDate: selection.endDate!
    });
  };

  return (
    <div className="flex flex-col gap-4 w-[100%] items-center">
      <div className="justify-center sm:flex md:block xl:flex gap-2 items-center sm:justify-between ">
        <p>From</p>
        <input
          type="text"
          value={state[0].startDate?.toLocaleDateString()}
          placeholder="From"
          readOnly
          className="border p-2 rounded"
        />
        <p>To</p>
        <input
          type="text"
          value={state[0].endDate?.toLocaleDateString()}
          placeholder="To"
          readOnly
          className="border p-2 rounded"
        />
      </div>

      {/* <DateRangePicker
        onChange={handleSelect}
        moveRangeOnFirstSelection={false}
        months={2}
        ranges={state}
        direction="horizontal"
      /> */}
    </div>
  );
};

export default DateRangeComponent;