import React from "react";

interface TimeInputProps {
  value: Date | null;
  onChange: (time: Date) => void;
  className?: string;
}

export default function TimeInput({ value, onChange, className }: TimeInputProps) {
  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = event.target.value.split(":").map(Number);

    if (value) {
      const newDate = new Date(value);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    } else {
      const today = new Date();
      today.setHours(hours, minutes, 0, 0);
      onChange(today);
    }
  };

  return (
    <div className={className}>
      <label htmlFor="time-picker" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Select Time
      </label>
      <input
        id="time-picker"
        type="time"
        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        value={
          value
            ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
            : ""
        }
        onChange={handleTimeChange}
      />
    </div>
  );
}
