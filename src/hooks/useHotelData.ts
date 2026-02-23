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

  return {
    rooms, guests, bookings,
    addRoom, updateRoom, deleteRoom,
    addGuest, updateGuest,
    addBooking, updateBooking,
    getGuestById, getRoomById,
  };
}
