import jsPDF from 'jspdf';
import { Booking, Guest, Room, Payment } from '@/types/hotel';
import { format, differenceInDays, parseISO } from 'date-fns';

export function getPaidAmount(b: Booking): number {
  return (b.payments || []).reduce((s, p) => s + p.amount, 0);
}

export function getBalance(b: Booking): number {
  return Math.max(0, b.totalAmount - getPaidAmount(b));
}

export function getPaymentStatus(b: Booking): 'Unpaid' | 'Partial' | 'Paid' {
  const paid = getPaidAmount(b);
  if (paid <= 0) return 'Unpaid';
  if (paid >= b.totalAmount) return 'Paid';
  return 'Partial';
}

export function ensureInvoiceNumber(b: Booking): string {
  if (b.invoiceNumber) return b.invoiceNumber;
  const d = new Date(b.createdAt);
  const yyyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  return `INV-${yyyymm}-${b.id.slice(0, 6).toUpperCase()}`;
}

interface InvoiceOptions {
  hotelName?: string;
  hotelAddress?: string;
  hotelPhone?: string;
  gstNumber?: string;
}

export function downloadInvoice(
  booking: Booking,
  guest: Guest | undefined,
  room: Room | undefined,
  groupBookings: { booking: Booking; room?: Room }[] | null,
  opts: InvoiceOptions = {}
) {
  const doc = new jsPDF();
  const hotelName = opts.hotelName || 'Hotel Manager';
  const W = doc.internal.pageSize.getWidth();
  let y = 18;

  doc.setFontSize(20).setFont('helvetica', 'bold').text(hotelName, 14, y);
  doc.setFontSize(10).setFont('helvetica', 'normal');
  if (opts.hotelAddress) doc.text(opts.hotelAddress, 14, (y += 6));
  if (opts.hotelPhone) doc.text(`Phone: ${opts.hotelPhone}`, 14, (y += 5));
  if (opts.gstNumber) doc.text(`GSTIN: ${opts.gstNumber}`, 14, (y += 5));

  doc.setFontSize(16).setFont('helvetica', 'bold').text('INVOICE', W - 14, 18, { align: 'right' });
  doc.setFontSize(10).setFont('helvetica', 'normal');
  const invNo = ensureInvoiceNumber(booking);
  doc.text(`Invoice #: ${invNo}`, W - 14, 26, { align: 'right' });
  doc.text(`Date: ${format(new Date(), 'dd MMM yyyy')}`, W - 14, 32, { align: 'right' });

  y = Math.max(y, 38) + 8;
  doc.setDrawColor(200).line(14, y, W - 14, y);
  y += 8;

  doc.setFont('helvetica', 'bold').text('Bill To:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 6;
  doc.text(guest?.name || '—', 14, y);
  if (guest?.phone) doc.text(`Phone: ${guest.phone}`, 14, (y += 5));
  if (guest?.idNumber) doc.text(`${guest.idType}: ${guest.idNumber}`, 14, (y += 5));

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 14, y);
  doc.text('Nights', 110, y, { align: 'right' });
  doc.text('Rate', 150, y, { align: 'right' });
  doc.text('Amount', W - 14, y, { align: 'right' });
  doc.setDrawColor(150).line(14, y + 2, W - 14, y + 2);
  y += 8;
  doc.setFont('helvetica', 'normal');

  const items = groupBookings && groupBookings.length > 1 ? groupBookings : [{ booking, room }];
  let grandTotal = 0;
  items.forEach(({ booking: b, room: r }) => {
    const nights = Math.max(1, differenceInDays(parseISO(b.checkOut), parseISO(b.checkIn)));
    const rate = nights ? b.totalAmount / nights : b.totalAmount;
    const desc = r
      ? `Room ${r.roomNumber} (${r.type})${b.bedNumber ? ` Bed #${b.bedNumber}` : ''}`
      : 'Room';
    const stay = `${format(parseISO(b.checkIn), 'dd MMM')} - ${format(parseISO(b.checkOut), 'dd MMM yyyy')}`;
    doc.text(desc, 14, y);
    doc.setFontSize(8).setTextColor(120).text(stay, 14, y + 4);
    doc.setFontSize(10).setTextColor(0);
    doc.text(String(nights), 110, y, { align: 'right' });
    doc.text(`₹${rate.toFixed(0)}`, 150, y, { align: 'right' });
    doc.text(`₹${b.totalAmount.toLocaleString()}`, W - 14, y, { align: 'right' });
    grandTotal += b.totalAmount;
    y += 12;
  });

  doc.setDrawColor(150).line(14, y, W - 14, y);
  y += 8;
  const totalPaid = items.reduce((s, it) => s + getPaidAmount(it.booking), 0);
  const balance = Math.max(0, grandTotal - totalPaid);

  doc.setFont('helvetica', 'bold');
  doc.text('Total', 150, y, { align: 'right' });
  doc.text(`₹${grandTotal.toLocaleString()}`, W - 14, y, { align: 'right' });
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.text('Paid', 150, y, { align: 'right' });
  doc.text(`₹${totalPaid.toLocaleString()}`, W - 14, y, { align: 'right' });
  y += 7;
  doc.setFont('helvetica', 'bold').setTextColor(balance > 0 ? 200 : 0, balance > 0 ? 30 : 120, balance > 0 ? 30 : 0);
  doc.text('Balance Due', 150, y, { align: 'right' });
  doc.text(`₹${balance.toLocaleString()}`, W - 14, y, { align: 'right' });
  doc.setTextColor(0);

  // Payment history
  const allPayments: Payment[] = items.flatMap((it) => it.booking.payments || []);
  if (allPayments.length) {
    y += 14;
    doc.setFont('helvetica', 'bold').text('Payment History', 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal').setFontSize(9);
    allPayments.forEach((p) => {
      doc.text(`${format(parseISO(p.date), 'dd MMM yyyy')} — ${p.method} — ₹${p.amount.toLocaleString()}${p.note ? ` (${p.note})` : ''}`, 14, y);
      y += 5;
    });
    doc.setFontSize(10);
  }

  y += 14;
  doc.setFontSize(9).setTextColor(120);
  doc.text('Thank you for your stay!', W / 2, y, { align: 'center' });

  doc.save(`${invNo}.pdf`);
}
