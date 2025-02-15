import React from 'react';
import { format, parseISO, add } from "date-fns";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { DayPicker, DayPickerSingleProps } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Complaint {
  complaint_id: number;
  customer_name: string;
  customer_phone_number: string;
  complaint_description: string;
  sentiment_score: number;
  urgency_score: number;
  priority_score: number;
  status: string;
  scheduled_callback: string | null;
  created_at: string;
}

type CalendarProps = {
  complaints: Complaint[];
  className?: string;
} & Omit<DayPickerSingleProps, 'mode'>;

const formatToIST = (dateString: string): string => {
  if (!dateString) return "";
  const date = parseISO(dateString);
  // Add 5 hours and 30 minutes to convert to IST
  const istDate = add(date, { hours: 5, minutes: 30 });
  return format(istDate, "yyyy-MM-dd");
};

export default function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  complaints,
  ...props
}: CalendarProps) {
  const modifiersClassNames = {
    highSeverity: "bg-red-200 hover:bg-red-300 dark:bg-red-900 dark:hover:bg-red-800",
    mediumSeverity: "bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-900 dark:hover:bg-yellow-800",
    lowSeverity: "bg-green-200 hover:bg-green-300 dark:bg-green-900 dark:hover:bg-green-800",
  };

  const modifiers = React.useMemo(() => {
    const mods: { [key: string]: (date: Date) => boolean } = {
      highSeverity: (date: Date) => {
        const formattedDay = format(date, "yyyy-MM-dd");
        const dayComplaints = complaints.filter(
          complaint => complaint.scheduled_callback && 
            formatToIST(complaint.scheduled_callback).startsWith(formattedDay)
        );
        if (dayComplaints.length === 0) return false;
        const highestSeverity = Math.max(...dayComplaints.map(c => c.sentiment_score));
        return highestSeverity >= 0.8;
      },
      mediumSeverity: (date: Date) => {
        const formattedDay = format(date, "yyyy-MM-dd");
        const dayComplaints = complaints.filter(
          complaint => complaint.scheduled_callback && 
            formatToIST(complaint.scheduled_callback).startsWith(formattedDay)
        );
        if (dayComplaints.length === 0) return false;
        const highestSeverity = Math.max(...dayComplaints.map(c => c.sentiment_score));
        return highestSeverity >= 0.5 && highestSeverity < 0.8;
      },
      lowSeverity: (date: Date) => {
        const formattedDay = format(date, "yyyy-MM-dd");
        const dayComplaints = complaints.filter(
          complaint => complaint.scheduled_callback && 
            formatToIST(complaint.scheduled_callback).startsWith(formattedDay)
        );
        if (dayComplaints.length === 0) return false;
        const highestSeverity = Math.max(...dayComplaints.map(c => c.sentiment_score));
        return highestSeverity < 0.5;
      },
    };
    return mods;
  }, [complaints]);

  return (
    <DayPicker
      mode="single"
      showOutsideDays={showOutsideDays}
      className={cn("p-6", className)}
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-1 relative items-center text-lg",
        caption_label: "text-lg font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-2",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-14 font-normal text-base",
        row: "flex w-full mt-2",
        cell: "h-14 w-14 text-center text-base p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-14 w-14 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground"
        ),
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-6 w-6" />,
        IconRight: () => <ChevronRight className="h-6 w-6" />,
      }}
      {...props}
    />
  );
}