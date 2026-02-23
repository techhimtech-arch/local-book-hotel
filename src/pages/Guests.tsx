import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHotelData } from '@/hooks/useHotelData';
import { Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const Guests = () => {
  const { guests, bookings, getRoomById } = useHotelData();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return guests.filter((g) =>
      !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.includes(search)
    );
  }, [guests, search]);

  const getGuestBookings = (guestId: string) =>
    bookings.filter((b) => b.guestId === guestId);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Guests</h1>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No guests found.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((guest) => {
            const guestBookings = getGuestBookings(guest.id);
            return (
              <Card key={guest.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{guest.name}</h3>
                      <p className="text-sm text-muted-foreground">{guest.phone} · {guest.idType}: {guest.idNumber}</p>
                    </div>
                    <Badge variant="secondary">{guestBookings.length} booking{guestBookings.length !== 1 ? 's' : ''}</Badge>
                  </div>
                  {guestBookings.length > 0 && (
                    <div className="mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Room</TableHead>
                            <TableHead>Check-in</TableHead>
                            <TableHead>Check-out</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {guestBookings.map((b) => {
                            const room = getRoomById(b.roomId);
                            return (
                              <TableRow key={b.id}>
                                <TableCell>{room?.roomNumber || '—'}</TableCell>
                                <TableCell>{format(parseISO(b.checkIn), 'dd MMM yyyy')}</TableCell>
                                <TableCell>{format(parseISO(b.checkOut), 'dd MMM yyyy')}</TableCell>
                                <TableCell>₹{b.totalAmount.toLocaleString()}</TableCell>
                                <TableCell><Badge variant="outline">{b.status}</Badge></TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Guests;
