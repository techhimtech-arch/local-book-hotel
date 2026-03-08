import { useState, useMemo } from 'react';
import { Booking, Guest, Room } from '@/types/hotel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight, LogIn, LogOut } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval,
  format, addMonths, subMonths, parseISO,
} from 'date-fns';

interface BookingCalendarProps {
  bookings: Booking[];
  getGuestById: (id: string) => Guest | undefined;
  getRoomById: (id: string) => Room | undefined;
}

type DayBooking = {
  booking: Booking;
  type: 'check-in' | 'check-out' | 'stay';
};

const BookingCalendar = ({ bookings, getGuestById, getRoomById }: BookingCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const dayBookingsMap = useMemo(() => {
    const map = new Map<string, DayBooking[]>();
    const activeBookings = bookings.filter((b) => b.status !== 'Cancelled');

    for (const day of calendarDays) {
      const key = format(day, 'yyyy-MM-dd');
      const entries: DayBooking[] = [];

      for (const booking of activeBookings) {
        const checkIn = parseISO(booking.checkIn);
        const checkOut = parseISO(booking.checkOut);

        if (isSameDay(day, checkIn)) {
          entries.push({ booking, type: 'check-in' });
        } else if (isSameDay(day, checkOut)) {
          entries.push({ booking, type: 'check-out' });
        } else if (isWithinInterval(day, { start: checkIn, end: checkOut })) {
          entries.push({ booking, type: 'stay' });
        }
      }

      if (entries.length > 0) map.set(key, entries);
    }
    return map;
  }, [calendarDays, bookings]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getBadgeStyle = (type: DayBooking['type'], status: string) => {
    if (type === 'check-in') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (type === 'check-out') return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    if (status === 'Checked-in') return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200 dark:border-sky-800';
    return 'bg-muted text-muted-foreground border-border';
  };

  const getIcon = (type: DayBooking['type']) => {
    if (type === 'check-in') return <LogIn className="h-3 w-3 shrink-0" />;
    if (type === 'check-out') return <LogOut className="h-3 w-3 shrink-0" />;
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border rounded-lg overflow-hidden">
        {/* Header */}
        {weekDays.map((d) => (
          <div key={d} className="bg-muted px-2 py-2 text-center text-xs font-medium text-muted-foreground border-b">
            {d}
          </div>
        ))}

        {/* Day cells */}
        {calendarDays.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const entries = dayBookingsMap.get(key) || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const hasStay = entries.some((e) => e.type === 'stay');

          return (
            <div
              key={key}
              className={`min-h-[90px] border-b border-r p-1 transition-colors ${
                !isCurrentMonth ? 'bg-muted/30 text-muted-foreground/50' : ''
              } ${hasStay && isCurrentMonth ? 'bg-sky-50/50 dark:bg-sky-950/20' : ''}`}
            >
              <div className={`text-xs font-medium mb-1 ${
                isToday
                  ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center'
                  : ''
              }`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {entries
                  .filter((e) => e.type !== 'stay')
                  .slice(0, 3)
                  .map((entry) => {
                    const guest = getGuestById(entry.booking.guestId);
                    const room = getRoomById(entry.booking.roomId);
                    return (
                      <Popover key={`${entry.booking.id}-${entry.type}`}>
                        <PopoverTrigger asChild>
                          <button
                            className={`flex items-center gap-1 w-full rounded px-1 py-0.5 text-[10px] leading-tight border truncate cursor-pointer hover:opacity-80 ${getBadgeStyle(entry.type, entry.booking.status)}`}
                          >
                            {getIcon(entry.type)}
                            <span className="truncate">{guest?.name || '—'}</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-3 text-sm space-y-1">
                          <p className="font-semibold">{guest?.name}</p>
                          <p className="text-muted-foreground">
                            Room {room?.roomNumber}
                            {entry.booking.bedNumber ? ` · Bed #${entry.booking.bedNumber}` : ''}
                          </p>
                          <p className="text-muted-foreground">
                            {format(parseISO(entry.booking.checkIn), 'dd MMM')} → {format(parseISO(entry.booking.checkOut), 'dd MMM yyyy')}
                          </p>
                          <Badge variant={entry.booking.status === 'Checked-in' ? 'secondary' : 'default'}>
                            {entry.booking.status}
                          </Badge>
                          <p className="font-medium">₹{entry.booking.totalAmount.toLocaleString()}</p>
                        </PopoverContent>
                      </Popover>
                    );
                  })}
                {entries.filter((e) => e.type !== 'stay').length > 3 && (
                  <span className="text-[10px] text-muted-foreground pl-1">
                    +{entries.filter((e) => e.type !== 'stay').length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><LogIn className="h-3 w-3 text-emerald-600" /> Check-in</span>
        <span className="flex items-center gap-1"><LogOut className="h-3 w-3 text-orange-600" /> Check-out</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-sky-100 dark:bg-sky-900/30 border border-sky-200" /> Ongoing stay</span>
      </div>
    </div>
  );
};

export default BookingCalendar;
