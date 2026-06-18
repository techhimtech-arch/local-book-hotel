import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import BookingCalendar from '@/components/BookingCalendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHotelData } from '@/hooks/useHotelData';
import { Booking, BookingStatus, Guest } from '@/types/hotel';
import { Plus, Search, LogIn, LogOut, UserCheck, List, CalendarDays, Trash2, FileText } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { CheckInQRButton } from '@/components/CheckInQRButton';
import { PaymentDialog } from '@/components/PaymentDialog';
import { downloadInvoice, getPaidAmount, getPaymentStatus, ensureInvoiceNumber } from '@/lib/invoice';

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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Guest fields
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestIdType, setGuestIdType] = useState('Aadhar');
  const [guestIdNumber, setGuestIdNumber] = useState('');
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [showGuestSuggestions, setShowGuestSuggestions] = useState(false);

  type RoomLine = { roomId: string; bedNumber: string };
  const [lines, setLines] = useState<RoomLine[]>([{ roomId: '', bedNumber: '' }]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const updateLine = (i: number, patch: Partial<RoomLine>) => {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  };
  const addLine = () => setLines((prev) => [...prev, { roomId: '', bedNumber: '' }]);
  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));

  const bookableRooms = rooms.filter((r) => {
    if (r.status === 'Maintenance') return false;
    if (r.type === 'Dormitory') return getAvailableBeds(r.id).length > 0;
    return r.status === 'Available';
  });

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
    setLines([{ roomId: '', bedNumber: '' }]);
    setCheckIn('');
    setCheckOut('');
  };

  // Guest's past booking history
  const guestHistory = useMemo(() => {
    if (!selectedGuestId) return null;
    const past = bookings.filter((b) => b.guestId === selectedGuestId);
    if (past.length === 0) return null;
    const totalSpent = past.reduce((s, b) => s + b.totalAmount, 0);
    return { count: past.length, totalSpent, lastStay: past[past.length - 1] };
  }, [selectedGuestId, bookings]);

  const handleCreate = () => {
    if (!guestName || !checkIn || !checkOut) return;
    const days = differenceInDays(parseISO(checkOut), parseISO(checkIn));
    if (days <= 0) return;

    const validLines = lines.filter((l) => l.roomId);
    if (validLines.length === 0) return;
    for (const l of validLines) {
      const r = getRoomById(l.roomId);
      if (r?.type === 'Dormitory' && !l.bedNumber) return;
    }

    let guestId = selectedGuestId;
    if (!guestId) {
      const guest: Guest = { id: crypto.randomUUID(), name: guestName, phone: guestPhone, idType: guestIdType, idNumber: guestIdNumber };
      addGuest(guest);
      guestId = guest.id;
    }

    const groupId = validLines.length > 1 ? crypto.randomUUID() : undefined;
    validLines.forEach((l) => {
      const room = getRoomById(l.roomId)!;
      const booking: Booking = {
        id: crypto.randomUUID(),
        guestId: guestId!,
        roomId: l.roomId,
        checkIn,
        checkOut,
        status: 'Confirmed',
        totalAmount: days * room.pricePerNight,
        createdAt: new Date().toISOString(),
        ...(room.type === 'Dormitory' ? { bedNumber: Number(l.bedNumber) } : {}),
        ...(groupId ? { groupId } : {}),
      };
      addBooking(booking);
    });
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
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'list' | 'calendar')}>
            <ToggleGroupItem value="list" aria-label="List view"><List className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="calendar" aria-label="Calendar view"><CalendarDays className="h-4 w-4" /></ToggleGroupItem>
          </ToggleGroup>
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
      </div>

      {viewMode === 'calendar' ? (
        <BookingCalendar bookings={bookings} getGuestById={getGuestById} getRoomById={getRoomById} />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default Bookings;
