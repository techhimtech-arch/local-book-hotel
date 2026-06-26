import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHotelData } from '@/hooks/useHotelData';
import { Expense, ExpenseCategory, PaymentMethod } from '@/types/hotel';
import { Plus, Search, Trash2, IndianRupee, TrendingDown, TrendingUp, PiggyBank } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const expenseCategories: ExpenseCategory[] = [
  'Salary', 'Electricity', 'Water', 'Maintenance', 'Supplies',
  'Food & Beverage', 'Marketing', 'Rent', 'Taxes', 'Laundry',
  'Internet/Phone', 'Other',
];

const paymentMethods: PaymentMethod[] = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];

const categoryColors: Record<ExpenseCategory, string> = {
  Salary: 'bg-blue-100 text-blue-700 border-blue-200',
  Electricity: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Water: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  Maintenance: 'bg-orange-100 text-orange-700 border-orange-200',
  Supplies: 'bg-purple-100 text-purple-700 border-purple-200',
  'Food & Beverage': 'bg-pink-100 text-pink-700 border-pink-200',
  Marketing: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Rent: 'bg-red-100 text-red-700 border-red-200',
  Taxes: 'bg-gray-100 text-gray-700 border-gray-200',
  Laundry: 'bg-teal-100 text-teal-700 border-teal-200',
  'Internet/Phone': 'bg-sky-100 text-sky-700 border-sky-200',
  Other: 'bg-slate-100 text-slate-700 border-slate-200',
};

const Expenses = () => {
  const { expenses, addExpense, deleteExpense, bookings } = useHotelData();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form state
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState<ExpenseCategory>('Other');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Cash');

  const resetForm = () => {
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setCategory('Other');
    setAmount('');
    setDescription('');
    setVendor('');
    setPayMethod('Cash');
  };

  const handleSave = () => {
    const amt = Number(amount);
    if (!date || !amt || amt <= 0 || !description) return;
    const expense: Expense = {
      id: crypto.randomUUID(),
      date,
      category,
      amount: amt,
      description,
      vendor: vendor || undefined,
      paymentMethod: payMethod,
      createdAt: new Date().toISOString(),
    };
    addExpense(expense);
    setOpen(false);
    resetForm();
  };

  // Monthly stats
  const monthStats = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const monthRevenue = bookings
      .filter((b) => b.status !== 'Cancelled')
      .filter((b) => isWithinInterval(parseISO(b.checkIn), { start, end }))
      .reduce((s, b) => s + b.totalAmount, 0);

    const monthExpenses = expenses
      .filter((e) => isWithinInterval(parseISO(e.date), { start, end }))
      .reduce((s, e) => s + e.amount, 0);

    const byCategory = expenses
      .filter((e) => isWithinInterval(parseISO(e.date), { start, end }))
      .reduce<Record<string, number>>((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});

    return { monthRevenue, monthExpenses, profit: monthRevenue - monthExpenses, byCategory };
  }, [expenses, bookings]);

  const filtered = useMemo(() => {
    return expenses
      .filter((e) => {
        if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.vendor && e.vendor.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, search, categoryFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Add Expense</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={payMethod} onValueChange={(v) => setPayMethod(v as PaymentMethod)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was this expense for?" />
              </div>
              <div className="space-y-2">
                <Label>Vendor / Payee (optional)</Label>
                <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="e.g. Electric Board, Staff Name" />
              </div>
              <Button onClick={handleSave}>Save Expense</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Monthly P&L Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{monthStats.monthRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{monthStats.monthExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Profit / Loss</CardTitle>
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{monthStats.profit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown */}
      {Object.keys(monthStats.byCategory).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Expense Breakdown — This Month</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(monthStats.byCategory).map(([cat, amt]) => (
                <div key={cat} className={`rounded-lg border px-3 py-2 text-sm ${categoryColors[cat as ExpenseCategory]}`}>
                  <span className="font-medium">{cat}</span>
                  <span className="ml-2">₹{amt.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {expenseCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Expenses table */}
      {filtered.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">
          {expenses.length === 0 ? 'No expenses recorded yet. Click "Add Expense" to start tracking.' : 'No expenses match your filters.'}
        </CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{format(parseISO(e.date), 'dd MMM yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={categoryColors[e.category]}>{e.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{e.description}</TableCell>
                    <TableCell className="text-muted-foreground">{e.vendor || '—'}</TableCell>
                    <TableCell>{e.paymentMethod}</TableCell>
                    <TableCell className="text-right font-medium">₹{e.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => deleteExpense(e.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Expenses;
