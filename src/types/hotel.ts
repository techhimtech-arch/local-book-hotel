export type RoomType = 'Single' | 'Double' | 'Suite' | 'Deluxe' | 'Dormitory';
export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance';
export type BookingStatus = 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Cancelled';
export type HousekeepingStatus = 'Clean' | 'Dirty' | 'Cleaning' | 'Inspected';

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: RoomType;
  pricePerNight: number; // for dormitory, this is price per bed per night
  status: RoomStatus;
  totalBeds?: number; // only for Dormitory type
  housekeepingStatus?: HousekeepingStatus;
  lastCleanedAt?: string; // ISO date
  notes?: string;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  idType: string;
  idNumber: string;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other';

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: string; // ISO
  note?: string;
}

export type BookingSource =
  | 'Walk-in'
  | 'Booking.com'
  | 'OYO'
  | 'MakeMyTrip'
  | 'Goibibo'
  | 'Go-MMT'
  | 'Phone'
  | 'Referral'
  | 'Website'
  | 'Other';

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
  payments?: Payment[];
  groupId?: string; // links multi-room bookings together
  invoiceNumber?: string;
  source?: BookingSource;
  adults?: number;
  children?: number;
  specialRequests?: string;
}

export type ExpenseCategory =
  | 'Salary'
  | 'Electricity'
  | 'Water'
  | 'Maintenance'
  | 'Supplies'
  | 'Food & Beverage'
  | 'Marketing'
  | 'Rent'
  | 'Taxes'
  | 'Laundry'
  | 'Internet/Phone'
  | 'Other';

export interface Expense {
  id: string;
  date: string; // ISO date
  category: ExpenseCategory;
  amount: number;
  description: string;
  vendor?: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}
