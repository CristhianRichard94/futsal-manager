'use client';

import { cn } from '@/lib/utils';
import { Availability } from '@/lib/types';

const START_HOUR = 8;
const END_HOUR = 22;

export interface TimeSlot {
  start: Date;
  end: Date;
  label: string;
}

// Slots are computed as UTC instants for the calendar date represented by
// `date` (using its local y/m/d components as the "UTC calendar day" label).
// This must stay consistent with the backend, which interprets the `date`
// query param of GET /fields/{id}/availability as a UTC calendar day.
export function buildTimeSlots(date: Date): TimeSlot[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const slots: TimeSlot[] = [];
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    const start = new Date(Date.UTC(year, month, day, hour, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, day, hour + 1, 0, 0, 0));
    slots.push({
      start,
      end,
      label: `${String(hour).padStart(2, '0')}:00 UTC`,
    });
  }
  return slots;
}

function isBooked(slot: TimeSlot, bookedRanges: Availability[]) {
  return bookedRanges.some((range) => {
    const rangeStart = new Date(range.start_time).getTime();
    const rangeEnd = new Date(range.end_time).getTime();
    return slot.start.getTime() < rangeEnd && slot.end.getTime() > rangeStart;
  });
}

export default function TimeSlotGrid({
  date,
  bookedRanges,
  selectedStart,
  onSelect,
}: {
  date: Date;
  bookedRanges: Availability[];
  selectedStart: Date | null;
  onSelect: (slot: TimeSlot) => void;
}) {
  const slots = buildTimeSlots(date);
  const now = Date.now();

  return (
    <div
      role="listbox"
      aria-label="Available time slots"
      className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5"
    >
      {slots.map((slot) => {
        const booked = isBooked(slot, bookedRanges);
        const past = slot.start.getTime() < now;
        const disabled = booked || past;
        const selected =
          !!selectedStart && selectedStart.getTime() === slot.start.getTime();

        return (
          <button
            key={slot.label}
            type="button"
            role="option"
            aria-disabled={disabled}
            aria-selected={selected}
            disabled={disabled}
            onClick={() => !disabled && onSelect(slot)}
            className={cn(
              'rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              disabled &&
                'cursor-not-allowed border-input bg-muted text-muted-foreground opacity-60 line-through',
              !disabled &&
                !selected &&
                'border-input bg-background hover:bg-accent hover:text-accent-foreground',
              selected &&
                'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {slot.label}
          </button>
        );
      })}
    </div>
  );
}
