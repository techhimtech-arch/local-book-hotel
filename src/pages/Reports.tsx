import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHotelData } from '@/hooks/useHotelData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, isWithinInterval } from 'date-fns';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted-foreground))', 'hsl(var(--destructive))', '#10b981', '#f59e0b', '#8b5cf6'];

const Reports = () => {
  const { rooms, bookings, expenses, getRoomById } = useHotelData();

  const today = new Date();
  const [fromDate, setFromDate] = useState(format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(today, 'yyyy-MM-dd'));

  const from = parseISO(fromDate);
  const to = parseISO(toDate);

  const rangeBookings = useMemo(() => {
    return bookings.filter((b) => {
      const ci = parseISO(b.checkIn);
      return b.status !== 'Cancelled' && isWithinInterval(ci, { start: from, end: to });
    });
  }, [bookings, from, to]);

  const rangeExpenses = useMemo(() => {
    return expenses.filter((e) => isWithinInterval(parseISO(e.date), { start: from, end: to }));
  }, [expenses, from, to]);

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

  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    rangeBookings.forEach((b) => {
      const src = b.source || 'Walk-in';
      map[src] = (map[src] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [rangeBookings]);

  const expenseCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    rangeExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [rangeExpenses]);

  const totalRevenue = rangeBookings.reduce((s, b) => s + b.totalAmount, 0);
  const totalExpenses = rangeExpenses.reduce((s, e) => s + e.amount, 0);
  const profit = totalRevenue - totalExpenses;

  const roomStatusData = useMemo(() => {
    const counts = { Available: 0, Occupied: 0, Maintenance: 0 };
    rooms.forEach((r) => counts[r.status]++);
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [rooms]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <Label>From</Label>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>To</Label>
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <Card className="px-4 py-2">
          <p className="text-sm text-muted-foreground">Revenue</p>
          <p className="text-xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
        </Card>
        <Card className="px-4 py-2">
          <p className="text-sm text-muted-foreground">Expenses</p>
          <p className="text-xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
        </Card>
        <Card className="px-4 py-2">
          <p className="text-sm text-muted-foreground">Net Profit</p>
          <p className={`text-xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{profit.toLocaleString()}</p>
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
          <CardHeader><CardTitle className="text-base">Expense Categories</CardTitle></CardHeader>
          <CardContent>
            {expenseCategoryData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No expenses in range</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={expenseCategoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}>
                    {expenseCategoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
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

        <Card>
          <CardHeader><CardTitle className="text-base">Bookings by Source</CardTitle></CardHeader>
          <CardContent>
            {sourceData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No source data in range</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base">Room Status Overview</CardTitle></CardHeader>
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
      </div>
    </div>
  );
};

export default Reports;
