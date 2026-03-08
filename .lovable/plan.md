

## Plan: Add Calendar View for Bookings

### What We'll Build
A toggle-able calendar view on the Bookings page that shows check-ins and check-outs visually on a monthly grid. Each day cell will display colored indicators for bookings — green dots for check-ins, red dots for check-outs, and blue for ongoing stays.

### Implementation

**1. Add view toggle to Bookings page (`src/pages/Bookings.tsx`)**
- Add a `List | Calendar` toggle button group next to the existing header
- When "Calendar" is selected, render the new `BookingCalendar` component instead of the table

**2. Create `src/components/BookingCalendar.tsx`**
- Build a custom monthly calendar grid (not using DayPicker — we need custom cell content)
- Use `date-fns` (already installed) for month navigation, day iteration, `isSameDay`, `isWithinInterval`
- Each day cell shows:
  - **Check-in indicators**: Green badge with guest name for bookings starting that day
  - **Check-out indicators**: Red/orange badge with guest name for bookings ending that day
  - **Ongoing stay**: Subtle background highlight for days within a booking range
- Month navigation with prev/next arrows
- Click on a booking badge to see details (guest, room, status) in a popover
- Color-code by booking status (Confirmed = blue, Checked-in = green, Cancelled = gray strikethrough)

**3. Wire up data**
- Reuse `useHotelData()` — iterate over `bookings` array, parse `checkIn`/`checkOut` ISO dates
- Group bookings by date for efficient rendering
- Show room number + bed number (for dormitory) alongside guest name

### Technical Notes
- No new dependencies needed — `date-fns` handles all date logic
- Custom grid built with Tailwind CSS (`grid grid-cols-7`)
- Responsive: on mobile, show abbreviated day names and smaller badges

