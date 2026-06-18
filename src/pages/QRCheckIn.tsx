import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHotelData } from '@/hooks/useHotelData';
import { CheckCircle2, XCircle, LogIn } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const QRCheckIn = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { bookings, updateBooking, getGuestById, getRoomById, updateRoom } = useHotelData();
  const booking = bookings.find((b) => b.id === bookingId);
  const [done, setDone] = useState(false);

  const guest = booking ? getGuestById(booking.guestId) : null;
  const room = booking ? getRoomById(booking.roomId) : null;

  const confirm = () => {
    if (!booking) return;
    updateBooking({ ...booking, status: 'Checked-in' });
    if (room && room.type !== 'Dormitory') updateRoom({ ...room, status: 'Occupied' });
    setDone(true);
  };

  useEffect(() => {
    if (booking?.status === 'Checked-in') setDone(true);
  }, [booking]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {!booking ? <XCircle className="h-5 w-5 text-destructive" /> : done ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <LogIn className="h-5 w-5" />}
            {!booking ? 'Booking Not Found' : done ? 'Checked In' : 'Confirm Check-in'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {booking && (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Guest</p><p className="font-medium">{guest?.name || '—'}</p></div>
                <div><p className="text-muted-foreground">Room</p><p className="font-medium">{room?.roomNumber || '—'}{booking.bedNumber ? ` · Bed #${booking.bedNumber}` : ''}</p></div>
                <div><p className="text-muted-foreground">Check-in</p><p className="font-medium">{format(parseISO(booking.checkIn), 'dd MMM yyyy')}</p></div>
                <div><p className="text-muted-foreground">Check-out</p><p className="font-medium">{format(parseISO(booking.checkOut), 'dd MMM yyyy')}</p></div>
              </div>
              {!done && booking.status === 'Confirmed' && (
                <Button className="w-full" onClick={confirm}>Confirm Check-in</Button>
              )}
              {booking.status !== 'Confirmed' && !done && (
                <p className="text-sm text-muted-foreground text-center">Booking status: {booking.status}</p>
              )}
              {done && <p className="text-sm text-center text-green-600">Welcome! Enjoy your stay.</p>}
            </>
          )}
          <Button variant="outline" className="w-full" onClick={() => navigate('/bookings')}>Back to Bookings</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCheckIn;
