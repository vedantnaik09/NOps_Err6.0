import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { DayPicker } from "react-day-picker";
import TimeInput from "@/components/ui/timeinput";
import { toast } from "sonner";

import "react-day-picker/dist/style.css"; // Include this if you haven't already

interface RescheduleCalendarProps {
  complaintId: number;
  onClose: () => void;
  onReschedule: () => void;
}

export default function RescheduleCalendar({
  complaintId,
  onClose,
  onReschedule,
}: RescheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const API_BASE_URL = "http://localhost:8000";

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both a date and time.");
      return;
    }

    // Combine date and time
    const rescheduledDatetime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes()
    );

    try {
      const response = await fetch(`${API_BASE_URL}/complaints/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaint_id: complaintId,
          callback_time: rescheduledDatetime.toISOString(),
        }),
      });

      if (response.ok) {
        toast.success("Callback rescheduled successfully.");
        onReschedule();
        onClose();
      } else {
        toast.error("Failed to reschedule the callback.");
      }
    } catch (error) {
      toast.error("An error occurred while rescheduling.");
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        aria-hidden="true"
      ></div>
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mx-auto max-w-md shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Reschedule Callback
          </h2>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => setSelectedDate(date)}
            className="mb-4 rounded-lg bg-gray-100 dark:bg-gray-700 p-4 shadow-sm"
            classNames={{
              months: "grid grid-cols-1",
              month: "space-y-4",
              caption:
                "flex justify-between items-center text-lg font-semibold text-gray-900 dark:text-white",
                nav: "space-x-1 flex items-center",

              nav_button:
                "h-9 w-9 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500",
              table: "w-full border-collapse",
              head_row: "flex",
              head_cell:
                "w-12 h-12 text-gray-600 dark:text-gray-300 text-sm font-medium text-center",
              row: "flex",
              cell: "w-12 h-12 text-center p-0 relative rounded-md focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-300",
              day: "flex items-center justify-center w-12 h-12 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-blue-100 dark:hover:bg-blue-800",
              day_selected:
                "bg-blue-500 text-white dark:bg-blue-600 dark:text-gray-100",
              day_today:
                "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100",
              day_outside: "text-gray-400 dark:text-gray-500 opacity-50",
            }}
          />

          <TimeInput
            value={selectedTime}
            onChange={(time) => setSelectedTime(time)}
            className="mb-4"
          />
          <div className="flex justify-end">
            <button
              onClick={handleReschedule}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="ml-4 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
