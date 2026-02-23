export type RoomType = 'Single' | 'Double' | 'Suite' | 'Deluxe' | 'Dormitory';
export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance';
export type BookingStatus = 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Cancelled';

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: RoomType;
  pricePerNight: number; // for dormitory, this is price per bed per night
  status: RoomStatus;
  totalBeds?: number; // only for Dormitory type
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  idType: string;
  idNumber: string;
}

export interface Booking {
  id: string;
  guestId: string;
  roomId: string;
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  status: BookingStatus;
  totalAmount: number;
  createdAt: string;
  bedNumber?: number; // only for dormitory bookings
}
