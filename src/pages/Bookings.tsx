import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHotelData } from '@/hooks/useHotelData';
import { Booking, BookingStatus, Guest } from '@/types/hotel';
import { Plus, Search, LogIn, LogOut } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';

const statusVariant: Record<BookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Confirmed: 'default',
  'Checked-in': 'secondary',
  'Checked-out': 'outline',
  Cancelled: 'destructive',
};

const Bookings = () => {
  const { rooms, guests, bookings, addBooking, updateBooking, addGuest, getGuestById, getRoomById, updateRoom } = useHotelData();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestIdType, setGuestIdType] = useState('Aadhar');
  const [guestIdNumber, setGuestIdNumber] = useState('');
  const [roomId, setRoomId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const availableRooms = rooms.filter((r) => r.status === 'Available');

  const handleCreate = () => {
    if (!guestName || !roomId || !checkIn || !checkOut) return;
    const room = getRoomById(roomId);
    if (!room) return;

    const days = differenceInDays(parseISO(checkOut), parseISO(checkIn));
    if (days <= 0) return;

    const guest: Guest = { id: crypto.randomUUID(), name: guestName, phone: guestPhone, idType: guestIdType, idNumber: guestIdNumber };
    addGuest(guest);

    const booking: Booking = {
      id: crypto.randomUUID(),
      guestId: guest.id,
      roomId,
      checkIn,
      checkOut,
      status: 'Confirmed',
      totalAmount: days * room.pricePerNight,
      createdAt: new Date().toISOString(),
    };
    addBooking(booking);
    setOpen(false);
    setGuestName(''); setGuestPhone(''); setGuestIdNumber(''); setRoomId(''); setCheckIn(''); setCheckOut('');
  };

  const handleCheckIn = (booking: Booking) => {
    updateBooking({ ...booking, status: 'Checked-in' });
    const room = getRoomById(booking.roomId);
    if (room) updateRoom({ ...room, status: 'Occupied' });
  };

  const handleCheckOut = (booking: Booking) => {
    updateBooking({ ...booking, status: 'Checked-out' });
    const room = getRoomById(booking.roomId);
    if (room) updateRoom({ ...room, status: 'Available' });
  };

  const handleCancel = (booking: Booking) => {
    updateBooking({ ...booking, status: 'Cancelled' });
  };

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const guest = getGuestById(b.guestId);
      const room = getRoomById(b.roomId);
      const matchSearch = !search || 
        guest?.name.toLowerCase().includes(search.toLowerCase()) ||
        room?.roomNumber.includes(search);
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchSearch && matchStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, search, statusFilter, getGuestById, getRoomById]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bookings</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> New Booking</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Booking</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Guest Name</Label>
                <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="+91..." />
                </div>
                <div className="space-y-2">
                  <Label>ID Number</Label>
                  <Input value={guestIdNumber} onChange={(e) => setGuestIdNumber(e.target.value)} placeholder="ID number" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Room</Label>
                <Select value={roomId} onValueChange={setRoomId}>
                  <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>Room {r.roomNumber} — {r.type} (₹{r.pricePerNight}/night)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-in</Label>
                  <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Check-out</Label>
                  <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleCreate}>Create Booking</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by guest or room..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Checked-in">Checked-in</SelectItem>
            <SelectItem value="Checked-out">Checked-out</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No bookings found.</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => {
                  const guest = getGuestById(b.guestId);
                  const room = getRoomById(b.roomId);
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{guest?.name || '—'}</TableCell>
                      <TableCell>{room?.roomNumber || '—'}</TableCell>
                      <TableCell>{format(parseISO(b.checkIn), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{format(parseISO(b.checkOut), 'dd MMM yyyy')}</TableCell>
                      <TableCell>₹{b.totalAmount.toLocaleString()}</TableCell>
                      <TableCell><Badge variant={statusVariant[b.status]}>{b.status}</Badge></TableCell>
                      <TableCell className="text-right space-x-1">
                        {b.status === 'Confirmed' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleCheckIn(b)}><LogIn className="h-3 w-3 mr-1" />Check In</Button>
                            <Button size="sm" variant="ghost" onClick={() => handleCancel(b)}>Cancel</Button>
                          </>
                        )}
                        {b.status === 'Checked-in' && (
                          <Button size="sm" variant="outline" onClick={() => handleCheckOut(b)}><LogOut className="h-3 w-3 mr-1" />Check Out</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Bookings;
