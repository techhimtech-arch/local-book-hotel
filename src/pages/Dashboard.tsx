import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHotelData } from '@/hooks/useHotelData';
import { BedDouble, CalendarCheck, DollarSign, TrendingUp, LogIn, LogOut } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';

const Dashboard = () => {
  const { rooms, bookings, getGuestById, getRoomById } = useHotelData();

  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const occupied = rooms.filter((r) => r.status === 'Occupied').length;
    const available = rooms.filter((r) => r.status === 'Available').length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

    const todayCheckIns = bookings.filter(
      (b) => b.status === 'Confirmed' && isToday(parseISO(b.checkIn))
    );
    const todayCheckOuts = bookings.filter(
      (b) => b.status === 'Checked-in' && isToday(parseISO(b.checkOut))
    );

    const monthStart = new Date();
    monthStart.setDate(1);
    const monthRevenue = bookings
      .filter((b) => b.status !== 'Cancelled' && parseISO(b.createdAt) >= monthStart)
      .reduce((sum, b) => sum + b.totalAmount, 0);

    return { totalRooms, occupied, available, occupancyRate, todayCheckIns, todayCheckOuts, monthRevenue };
  }, [rooms, bookings]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
            <p className="text-xs text-muted-foreground">{stats.available} available · {stats.occupied} occupied</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${stats.occupancyRate}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCheckIns.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.monthRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><LogIn className="h-4 w-4" /> Today's Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.todayCheckIns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No check-ins today</p>
            ) : (
              <div className="space-y-3">
                {stats.todayCheckIns.map((b) => {
                  const guest = getGuestById(b.guestId);
                  const room = getRoomById(b.roomId);
                  return (
                    <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{guest?.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">Room {room?.roomNumber}</p>
                      </div>
                      <Badge>Confirmed</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><LogOut className="h-4 w-4" /> Today's Check-outs</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.todayCheckOuts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No check-outs today</p>
            ) : (
              <div className="space-y-3">
                {stats.todayCheckOuts.map((b) => {
                  const guest = getGuestById(b.guestId);
                  const room = getRoomById(b.roomId);
                  return (
                    <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{guest?.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">Room {room?.roomNumber}</p>
                      </div>
                      <Badge variant="secondary">Checked-in</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
