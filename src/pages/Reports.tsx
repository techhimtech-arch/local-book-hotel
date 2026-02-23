import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHotelData } from '@/hooks/useHotelData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, eachDayOfInterval, isWithinInterval } from 'date-fns';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted-foreground))', 'hsl(var(--destructive))'];

const Reports = () => {
  const { rooms, bookings, getRoomById } = useHotelData();

  const today = new Date();
  const [fromDate, setFromDate] = useState(format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(today, 'yyyy-MM-dd'));

  const rangeBookings = useMemo(() => {
    const from = parseISO(fromDate);
    const to = parseISO(toDate);
    return bookings.filter((b) => {
      const ci = parseISO(b.checkIn);
      return b.status !== 'Cancelled' && isWithinInterval(ci, { start: from, end: to });
    });
  }, [bookings, fromDate, toDate]);

  const revenueData = useMemo(() => {
    const map: Record<string, number> = {};
    rangeBookings.forEach((b) => {
      const key = format(parseISO(b.checkIn), 'dd MMM');
      map[key] = (map[key] || 0) + b.totalAmount;
    });
    return Object.entries(map).map(([date, amount]) => ({ date, amount }));
  }, [rangeBookings]);

  const roomTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    rangeBookings.forEach((b) => {
      const room = getRoomById(b.roomId);
      if (room) map[room.type] = (map[room.type] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [rangeBookings, getRoomById]);

  const totalRevenue = rangeBookings.reduce((s, b) => s + b.totalAmount, 0);

  const roomStatusData = useMemo(() => {
    const counts = { Available: 0, Occupied: 0, Maintenance: 0 };
    rooms.forEach((r) => counts[r.status]++);
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [rooms]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>

      <div className="flex gap-4 items-end">
        <div className="space-y-2">
          <Label>From</Label>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>To</Label>
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <Card className="px-4 py-2">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-xl font-bold">₹{totalRevenue.toLocaleString()}</p>
        </Card>
        <Card className="px-4 py-2">
          <p className="text-sm text-muted-foreground">Bookings</p>
          <p className="text-xl font-bold">{rangeBookings.length}</p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by Day</CardTitle></CardHeader>
          <CardContent>
            {revenueData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No data for selected range</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Room Status</CardTitle></CardHeader>
          <CardContent>
            {roomStatusData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No rooms</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={roomStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {roomStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base">Bookings by Room Type</CardTitle></CardHeader>
          <CardContent>
            {roomTypeData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No bookings in range</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={roomTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
