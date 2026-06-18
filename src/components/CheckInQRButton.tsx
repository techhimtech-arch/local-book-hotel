import { useState } from 'react';
import QRCode from 'qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';

interface Props {
  bookingId: string;
  guestName?: string;
}

export function CheckInQRButton({ bookingId, guestName }: Props) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>('');

  const generate = async (o: boolean) => {
    setOpen(o);
    if (o && !dataUrl) {
      const url = `${window.location.origin}/checkin/${bookingId}`;
      const png = await QRCode.toDataURL(url, { width: 320, margin: 1 });
      setDataUrl(png);
    }
  };

  const checkInUrl = `${window.location.origin}/checkin/${bookingId}`;

  return (
    <Dialog open={open} onOpenChange={generate}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" title="QR Check-in">
          <QrCode className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>QR Check-in</DialogTitle></DialogHeader>
        <div className="flex flex-col items-center gap-3 py-2">
          {guestName && <p className="text-sm text-muted-foreground">For {guestName}</p>}
          {dataUrl ? <img src={dataUrl} alt="Check-in QR" className="w-64 h-64" /> : <div className="w-64 h-64 animate-pulse bg-muted" />}
          <p className="text-xs text-center text-muted-foreground break-all">{checkInUrl}</p>
          <p className="text-xs text-center">Guest scans → opens check-in confirmation</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
