import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Booking, Payment, PaymentMethod } from '@/types/hotel';
import { getBalance, getPaidAmount } from '@/lib/invoice';
import { Wallet } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Props {
  booking: Booking;
  onUpdate: (b: Booking) => void;
}

const METHODS: PaymentMethod[] = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];

export function PaymentDialog({ booking, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [note, setNote] = useState('');

  const balance = getBalance(booking);
  const paid = getPaidAmount(booking);

  const addPayment = () => {
    const n = Number(amount);
    if (!n || n <= 0) return;
    const payment: Payment = {
      id: crypto.randomUUID(),
      amount: n,
      method,
      date: new Date().toISOString(),
      note: note || undefined,
    };
    onUpdate({ ...booking, payments: [...(booking.payments || []), payment] });
    setAmount(''); setNote(''); setMethod('Cash');
  };

  const removePayment = (id: string) => {
    onUpdate({ ...booking, payments: (booking.payments || []).filter((p) => p.id !== id) });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" title="Payments"><Wallet className="h-3 w-3" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Payments</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-md border p-2"><p className="text-muted-foreground text-xs">Total</p><p className="font-semibold">₹{booking.totalAmount.toLocaleString()}</p></div>
            <div className="rounded-md border p-2"><p className="text-muted-foreground text-xs">Paid</p><p className="font-semibold text-green-600">₹{paid.toLocaleString()}</p></div>
            <div className="rounded-md border p-2"><p className="text-muted-foreground text-xs">Balance</p><p className={`font-semibold ${balance > 0 ? 'text-destructive' : ''}`}>₹{balance.toLocaleString()}</p></div>
          </div>

          {(booking.payments || []).length > 0 && (
            <div className="space-y-1 max-h-40 overflow-auto">
              {(booking.payments || []).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded border p-2 text-sm">
                  <div>
                    <p className="font-medium">₹{p.amount.toLocaleString()} <span className="text-xs text-muted-foreground">· {p.method}</span></p>
                    <p className="text-xs text-muted-foreground">{format(parseISO(p.date), 'dd MMM yyyy, HH:mm')}{p.note ? ` · ${p.note}` : ''}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removePayment(p.id)}>×</Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 border-t pt-3">
            <Label>Add Payment</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setAmount(String(balance))} disabled={balance <= 0}>Pay Balance (₹{balance.toLocaleString()})</Button>
              <Button size="sm" onClick={addPayment} className="ml-auto">Add</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
