import { useLocalStorage } from './useLocalStorage';
import { Room, Guest, Booking } from '@/types/hotel';

export function useHotelData() {
  const [rooms, setRooms] = useLocalStorage<Room[]>('hotel_rooms', []);
  const [guests, setGuests] = useLocalStorage<Guest[]>('hotel_guests', []);
  const [bookings, setBookings] = useLocalStorage<Booking[]>('hotel_bookings', []);

  const addRoom = (room: Room) => setRooms((prev) => [...prev, room]);
  const updateRoom = (room: Room) => setRooms((prev) => prev.map((r) => (r.id === room.id ? room : r)));
  const deleteRoom = (id: string) => setRooms((prev) => prev.filter((r) => r.id !== id));

  const addGuest = (guest: Guest) => setGuests((prev) => [...prev, guest]);
  const updateGuest = (guest: Guest) => setGuests((prev) => prev.map((g) => (g.id === guest.id ? guest : g)));

  const addBooking = (booking: Booking) => setBookings((prev) => [...prev, booking]);
  const updateBooking = (booking: Booking) => setBookings((prev) => prev.map((b) => (b.id === booking.id ? booking : b)));

  const getGuestById = (id: string) => guests.find((g) => g.id === id);
  const getRoomById = (id: string) => rooms.find((r) => r.id === id);

  // Get occupied bed numbers for a dormitory room (active bookings only)
  const getOccupiedBeds = (roomId: string): number[] => {
    return bookings
      .filter((b) => b.roomId === roomId && (b.status === 'Confirmed' || b.status === 'Checked-in') && b.bedNumber)
      .map((b) => b.bedNumber!);
  };

  // Get available bed numbers for a dormitory room
  const getAvailableBeds = (roomId: string): number[] => {
    const room = getRoomById(roomId);
    if (!room || room.type !== 'Dormitory' || !room.totalBeds) return [];
    const occupied = getOccupiedBeds(roomId);
    return Array.from({ length: room.totalBeds }, (_, i) => i + 1).filter((b) => !occupied.includes(b));
  };

  // Get detailed bed status for a dormitory room
  type BedInfo = {
    bedNumber: number;
    status: 'Available' | 'Confirmed' | 'Checked-in';
    booking?: Booking;
    guest?: Guest;
  };

  const getBedDetails = (roomId: string): BedInfo[] => {
    const room = getRoomById(roomId);
    if (!room || room.type !== 'Dormitory' || !room.totalBeds) return [];

    const activeBookings = bookings.filter(
      (b) => b.roomId === roomId && (b.status === 'Confirmed' || b.status === 'Checked-in') && b.bedNumber
    );

    return Array.from({ length: room.totalBeds }, (_, i) => {
      const bed = i + 1;
      const booking = activeBookings.find((b) => b.bedNumber === bed);
      if (booking) {
        return {
          bedNumber: bed,
          status: booking.status as 'Confirmed' | 'Checked-in',
          booking,
          guest: getGuestById(booking.guestId),
        };
      }
      return { bedNumber: bed, status: 'Available' as const };
    });
  };

  return {
    rooms, guests, bookings,
    addRoom, updateRoom, deleteRoom,
    addGuest, updateGuest,
    addBooking, updateBooking,
    getGuestById, getRoomById,
    getOccupiedBeds, getAvailableBeds, getBedDetails,
  };
}
