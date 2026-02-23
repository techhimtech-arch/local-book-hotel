import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useHotelData } from '@/hooks/useHotelData';
import { Booking, BookingStatus, Guest } from '@/types/hotel';
import { Plus, Search, LogIn, LogOut, UserCheck } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';

const statusVariant: Record<BookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Confirmed: 'default',
  'Checked-in': 'secondary',
  'Checked-out': 'outline',
  Cancelled: 'destructive',
};

const Bookings = () => {
  const { rooms, guests, bookings, addBooking, updateBooking, addGuest, getGuestById, getRoomById, updateRoom, getAvailableBeds } = useHotelData();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Guest fields
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestIdType, setGuestIdType] = useState('Aadhar');
  const [guestIdNumber, setGuestIdNumber] = useState('');
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [showGuestSuggestions, setShowGuestSuggestions] = useState(false);

  const [roomId, setRoomId] = useState('');
  const [bedNumber, setBedNumber] = useState<string>('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const selectedRoom = roomId ? getRoomById(roomId) : null;
  const isDormitory = selectedRoom?.type === 'Dormitory';
  const availableBeds = isDormitory ? getAvailableBeds(roomId) : [];

  // Rooms available for booking: Available rooms + Dormitory rooms with free beds
  const bookableRooms = rooms.filter((r) => {
    if (r.status === 'Maintenance') return false;
    if (r.type === 'Dormitory') return getAvailableBeds(r.id).length > 0;
    return r.status === 'Available';
  });

  // Guest autofill suggestions
  const guestSuggestions = useMemo(() => {
    if (!guestSearchQuery || guestSearchQuery.length < 2) return [];
    const q = guestSearchQuery.toLowerCase();
    return guests.filter((g) =>
      g.name.toLowerCase().includes(q) || g.phone.includes(q)
    ).slice(0, 5);
  }, [guests, guestSearchQuery]);

  const selectExistingGuest = (guest: Guest) => {
    setSelectedGuestId(guest.id);
    setGuestName(guest.name);
    setGuestPhone(guest.phone);
    setGuestIdType(guest.idType);
    setGuestIdNumber(guest.idNumber);
    setGuestSearchQuery('');
    setShowGuestSuggestions(false);
  };

  const clearGuestSelection = () => {
    setSelectedGuestId(null);
    setGuestName('');
    setGuestPhone('');
    setGuestIdType('Aadhar');
    setGuestIdNumber('');
  };

  const resetForm = () => {
    clearGuestSelection();
    setGuestSearchQuery('');
    setRoomId('');
    setBedNumber('');
    setCheckIn('');
    setCheckOut('');
  };

  const handleCreate = () => {
    if (!guestName || !roomId || !checkIn || !checkOut) return;
    const room = getRoomById(roomId);
    if (!room) return;

    const days = differenceInDays(parseISO(checkOut), parseISO(checkIn));
    if (days <= 0) return;

    // Dormitory requires bed selection
    if (isDormitory && !bedNumber) return;

    let guestId = selectedGuestId;
    if (!guestId) {
      const guest: Guest = { id: crypto.randomUUID(), name: guestName, phone: guestPhone, idType: guestIdType, idNumber: guestIdNumber };
      addGuest(guest);
      guestId = guest.id;
    }

    const pricePerUnit = room.pricePerNight; // per bed for dormitory, per room otherwise
    const booking: Booking = {
      id: crypto.randomUUID(),
      guestId,
      roomId,
      checkIn,
      checkOut,
      status: 'Confirmed',
      totalAmount: days * pricePerUnit,
      createdAt: new Date().toISOString(),
      ...(isDormitory ? { bedNumber: Number(bedNumber) } : {}),
    };
    addBooking(booking);
    setOpen(false);
    resetForm();
  };

  const handleCheckIn = (booking: Booking) => {
    updateBooking({ ...booking, status: 'Checked-in' });
    const room = getRoomById(booking.roomId);
    if (room && room.type !== 'Dormitory') {
      updateRoom({ ...room, status: 'Occupied' });
    }
  };

  const handleCheckOut = (booking: Booking) => {
    updateBooking({ ...booking, status: 'Checked-out' });
    const room = getRoomById(booking.roomId);
    if (room && room.type !== 'Dormitory') {
      updateRoom({ ...room, status: 'Available' });
    }
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
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> New Booking</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Booking</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Guest autofill search */}
              {guests.length > 0 && !selectedGuestId && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><UserCheck className="h-3 w-3" /> Search Existing Guest</Label>
                  <div className="relative">
                    <Input
                      value={guestSearchQuery}
                      onChange={(e) => { setGuestSearchQuery(e.target.value); setShowGuestSuggestions(true); }}
                      onFocus={() => setShowGuestSuggestions(true)}
                      placeholder="Type name or phone to autofill..."
                    />
                    {showGuestSuggestions && guestSuggestions.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
                        {guestSuggestions.map((g) => (
                          <button
                            key={g.id}
                            className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm hover:bg-accent"
                            onClick={() => selectExistingGuest(g)}
                          >
                            <span className="font-medium">{g.name}</span>
                            <span className="text-muted-foreground">{g.phone}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedGuestId && (
                <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{guestName}</p>
                    <p className="text-xs text-muted-foreground">{guestPhone} · {guestIdType}: {guestIdNumber}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearGuestSelection}>Change</Button>
                </div>
              )}

              {!selectedGuestId && (
                <>
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
                </>
              )}

              <div className="space-y-2">
                <Label>Room</Label>
                <Select value={roomId} onValueChange={(v) => { setRoomId(v); setBedNumber(''); }}>
                  <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                  <SelectContent>
                    {bookableRooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        Room {r.roomNumber} — {r.type}
                        {r.type === 'Dormitory'
                          ? ` (${getAvailableBeds(r.id).length} beds free · ₹${r.pricePerNight}/bed/night)`
                          : ` (₹${r.pricePerNight}/night)`
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isDormitory && (
                <div className="space-y-2">
                  <Label>Select Bed</Label>
                  <Select value={bedNumber} onValueChange={setBedNumber}>
                    <SelectTrigger><SelectValue placeholder="Choose bed number" /></SelectTrigger>
                    <SelectContent>
                      {availableBeds.map((b) => (
                        <SelectItem key={b} value={String(b)}>Bed #{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                      <TableCell>
                        {room?.roomNumber || '—'}
                        {b.bedNumber ? <span className="text-muted-foreground text-xs ml-1">(Bed #{b.bedNumber})</span> : ''}
                      </TableCell>
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
