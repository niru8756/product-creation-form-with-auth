import { useState } from "react";
import { format, addYears, subYears, parse, isAfter } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/Button";
import { Calendar } from "@/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CalendarIcon from "@/assets/images/calendar.svg";
import ChevronLeftIcon from "@/assets/icons/ChevronLeftIcon";
import ChevronRightIcon from "@/assets/icons/ChevronRightIcon";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";
import { DateRange } from "react-day-picker";
import Image from "next/image";

interface SingleDatePickerProps {
  alignIcon?: "left" | "right";
  calenderClassName?: string;
  setDateValue?: (date: Date | undefined | string) => void;
  monthYearOnly?: boolean;
  initialDate?: Date | string;
  className?: string;
  setFullDateValue?: (date: Date | undefined | string) => void;
  urlDate?: string;
  onClearDate?: () => void;
  // New props for range picker
  isRangePicker?: boolean;
  setDateRangeValue?: (range: DateRange | undefined) => void;
  initialDateRange?: DateRange;
  urlDateRange?: { from?: string; to?: string };
}

function SingleDatePicker({
  alignIcon = "left",
  calenderClassName,
  setDateValue,
  monthYearOnly = false,
  initialDate,
  className,
  setFullDateValue,
  urlDate,
  onClearDate,
  isRangePicker = false,
  setDateRangeValue,
  initialDateRange,
  urlDateRange,
}: SingleDatePickerProps) {
  const parseInitialDate = () => {
    if (urlDate) return new Date(urlDate);
    if (!initialDate) return undefined;

    if (typeof initialDate === "string") {
      try {
        if (initialDate.match(/^\d{2}\/\d{4}$/)) {
          return parse(initialDate, "MM/yyyy", new Date());
        } else {
          return new Date(initialDate);
        }
      } catch (e) {
        return undefined;
      }
    } else {
      return initialDate;
    }
  };

  const parseInitialDateRange = (): DateRange | undefined => {
    if (urlDateRange?.from || urlDateRange?.to) {
      return {
        from: urlDateRange.from ? new Date(urlDateRange.from) : undefined,
        to: urlDateRange.to ? new Date(urlDateRange.to) : undefined,
      };
    }
    return initialDateRange;
  };

  const [date, setDate] = useState<Date | undefined>(parseInitialDate());
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    parseInitialDateRange(),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(
    parseInitialDate(),
  );
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(
    parseInitialDateRange(),
  );
  const [view, setView] = useState<"month" | "year">("month");

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const handleClose = () => {
    setIsOpen(false);
    if (isRangePicker) {
      setTempDateRange(dateRange);
    } else {
      setTempDate(date);
    }
    onClearDate?.();
    if (isRangePicker) {
      setDateRange(undefined);
    } else {
      setDate(undefined);
    }
  };

  const handleApply = () => {
    if (isRangePicker) {
      if (tempDateRange) {
        setDateRange(tempDateRange);
        if (typeof setDateRangeValue === "function") {
          setDateRangeValue(tempDateRange);
        }
      }
    } else {
      if (tempDate) {
        setDate(tempDate);
        if (typeof setDateValue === "function") {
          const formattedDisplay = format(tempDate, "MM/yyyy");
          setDateValue(formattedDisplay);
        }
        if (typeof setFullDateValue === "function") {
          setFullDateValue(tempDate);
        }
      }
    }
    setIsOpen(false);
  };

  const handlePrevious = () => {
    if (tempDate) {
      if (view === "month") {
        setTempDate(subYears(tempDate, 1));
      } else if (view === "year") {
        setTempDate(subYears(tempDate, 10));
      }
    }
  };

  const handleNext = () => {
    if (tempDate) {
      const nextDate =
        view === "month" ? addYears(tempDate, 1) : addYears(tempDate, 10);

      // Don't allow navigation to future years
      if (view === "month" && nextDate.getFullYear() <= currentYear) {
        setTempDate(nextDate);
      } else if (view === "year" && nextDate.getFullYear() - 5 <= currentYear) {
        setTempDate(nextDate);
      }
    }
  };

  const toggleView = () => {
    setView(view === "month" ? "year" : "month");
  };

  const isMonthDisabled = (monthIndex: number, year: number) => {
    if (year > currentYear) return true;
    if (year === currentYear && monthIndex > currentMonth) return true;
    return false;
  };

  const isYearDisabled = (year: number) => {
    return year > currentYear;
  };

  const renderMonthYearSelector = () => {
    if (!tempDate) {
      setTempDate(new Date());
      return null;
    }

    const tempYear = tempDate.getFullYear();
    const canGoNext =
      view === "month" ? tempYear < currentYear : tempYear + 6 <= currentYear;

    return (
      <div className="p-5 w-64">
        <div className="flex items-center justify-between mb-4">
          <button
            className="p-1 rounded-sm outline-none hover:bg-Gray-200"
            onClick={handlePrevious}
          >
            <ChevronLeftIcon />
          </button>
          <button onClick={toggleView} className="font-medium text-base">
            {view === "month"
              ? format(tempDate, "yyyy")
              : `${tempDate.getFullYear() - 5} - ${tempDate.getFullYear() + 6}`}
          </button>
          <button
            className={cn(
              "p-1 rounded-sm outline-none",
              canGoNext
                ? "hover:bg-Gray-200"
                : "opacity-50 cursor-not-allowed",
            )}
            onClick={canGoNext ? handleNext : undefined}
            disabled={!canGoNext}
          >
            <ChevronRightIcon />
          </button>
        </div>

        {view === "month" && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {Array.from({ length: 12 }, (_, i) => {
              const monthDate = new Date(tempDate.getFullYear(), i, 1);
              const monthName = format(monthDate, "MMM");
              const isSelected = tempDate.getMonth() === i;
              const disabled = isMonthDisabled(i, tempYear);

              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!disabled) {
                      const newDate = new Date(tempDate);
                      newDate.setMonth(i);
                      setTempDate(newDate);
                    }
                  }}
                  disabled={disabled}
                  className={cn(
                    "h-9 w-full rounded-md text-center text-sm font-medium",
                    disabled
                      ? "opacity-50 cursor-not-allowed text-gray-400"
                      : isSelected
                        ? "bg-brand-600-orange-p-1 text-white"
                        : "hover:bg-Gray-200",
                  )}
                >
                  {monthName}
                </button>
              );
            })}
          </div>
        )}

        {view === "year" && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {Array.from({ length: 12 }, (_, i) => {
              const year = tempDate.getFullYear() - 5 + i;
              const isSelected = tempDate.getFullYear() === year;
              const disabled = isYearDisabled(year);

              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!disabled) {
                      const newDate = new Date(tempDate);
                      newDate.setFullYear(year);
                      setTempDate(newDate);
                      setView("month");
                    }
                  }}
                  disabled={disabled}
                  className={cn(
                    "h-9 w-full rounded-md text-center text-sm font-medium",
                    disabled
                      ? "opacity-50 cursor-not-allowed text-gray-400"
                      : isSelected
                        ? "bg-brand-600-orange-p-1 text-white"
                        : "hover:bg-Gray-200",
                  )}
                >
                  {year}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex justify-between gap-3">
          <button
            className="calendarFooterBtn calendarFooterCancleBtn"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="calendarFooterBtn calendarFooterApplyBtn"
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </div>
    );
  };

  const getButtonText = () => {
    if (isRangePicker) {
      if (dateRange?.from) {
        if (dateRange.to) {
          return `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`;
        }
        return format(dateRange.from, "PPP");
      }
      return "Select date range";
    } else {
      if (date) {
        return format(date, monthYearOnly ? "MMMM yyyy" : "PPP");
      }
      return monthYearOnly ? "Select month & year" : "Created Date";
    }
  };

const handleClearDate = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  if (isRangePicker) {
    setDateRange(undefined);
    setTempDateRange(undefined);
    setDateRangeValue?.(undefined);
  } else {
    setDate(undefined);
    setTempDate(undefined);
    setDateValue?.("");
    setFullDateValue?.(undefined);
  }
  onClearDate?.();
};

  const commonCalendarProps = {
    disabled: (day: Date) => isAfter(day, today),
    initialFocus: true,
    className: cn(
      "rounded-xl px-6 py-5 border border-[#EAECF0]",
      calenderClassName,
    ),
    classNames: {
      caption_label: "calendarMonthTxt",
      nav_button: "rounded-sm outline-none hover:bg-[#EAECF0]",
      head_cell: "calendarHead",
      cell: "calendarHead",
      day_selected: "dateSelected",
      day_today: "todayDate",
      day_range_middle: "bg-orange-100 text-orange-900",
      day_range_start: "dateSelected rounded-r-none",
      day_range_end: "dateSelected rounded-l-none",
    },
    components: {
      IconLeft: () => <ChevronLeftIcon />,
      IconRight: () => <ChevronRightIcon />,
      Footer: () => (
        <div className="pt-9 flex justify-between gap-3">
          <button
            className="calendarFooterBtn calendarFooterCancleBtn"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="calendarFooterBtn calendarFooterApplyBtn"
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      ),
    },
  };

return (
  <div className="relative">
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal px-3 py-2 border border-Gray-300 rounded-lg shadow-[0_1px_1px_0px_rgba(16,24,40,0.05)] gap-2 w-full text-base hover:text-Gray-700 hover:bg-transparent transition-all duration-300 ease-in-out  focus:bg-white focus:-border-Secondary-Blue-200 h-[42px]",
            !(date || dateRange?.from) && "text-muted-foreground",
            { "pe-7!": date || dateRange?.from },
            className,
            {
              "shadow-ring-brand-shadow-xs border-Secondary-Blue-200":
                isOpen && monthYearOnly,
            },
            { "shadow-ring-gray-shadow-xs": isOpen && !monthYearOnly }
          )}
        >
          {alignIcon === "left" && (
            <Image
              src={CalendarIcon}
              alt="calendar-icon"
              width={24}
              height={24}
            />
          )}
          <span className="flex-1">{getButtonText()}</span>
          {alignIcon === "right" && !(date || dateRange?.from) && (
            <ChevronDownIcon size={14} className="text-black w-3.5! h-3.5!" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-xl me-2">
        {monthYearOnly ? (
          renderMonthYearSelector()
        ) : isRangePicker ? (
          <Calendar
            id="date-range"
            mode="range"
            selected={tempDateRange}
            onSelect={setTempDateRange}
            // numberOfMonths={2}
            {...commonCalendarProps}
          />
        ) : (
          <Calendar
            id="date"
            mode="single"
            selected={tempDate || date}
            onSelect={setTempDate}
            {...commonCalendarProps}
          />
        )}
      </PopoverContent>
    </Popover>
    {(date || dateRange?.from) && (
      <button
        onPointerDown={handleClearDate}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 hover:text-gray-700 bg-transparent border-0 p-0"
        type="button"
        aria-label="Clear date"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    )}
  </div>
);
}

export default SingleDatePicker;
