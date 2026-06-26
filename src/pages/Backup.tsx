import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEYS = ['hotel_rooms', 'hotel_guests', 'hotel_bookings', 'hotel_expenses'];

const Backup = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data: Record<string, unknown> = {};
    STORAGE_KEYS.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw) data[key] = JSON.parse(raw);
    });
    data._exportedAt = new Date().toISOString();

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotel-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Backup downloaded', description: 'Your hotel data has been exported successfully.' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        let restored = 0;
        STORAGE_KEYS.forEach((key) => {
          if (Array.isArray(data[key])) {
            localStorage.setItem(key, JSON.stringify(data[key]));
            restored++;
          }
        });

        if (restored === 0) {
          toast({ title: 'Invalid backup', description: 'No valid hotel data found in this file.', variant: 'destructive' });
          return;
        }

        toast({ title: 'Data restored!', description: `${restored} data set(s) imported. Reloading...` });
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        toast({ title: 'Import failed', description: "Could not parse the file. Make sure it's a valid JSON backup.", variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Backup & Restore</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Export Data</CardTitle>
            <CardDescription>Download all your hotel data (rooms, guests, bookings) as a JSON file.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} className="w-full">
              <Download className="mr-2 h-4 w-4" /> Download Backup
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Import Data</CardTitle>
            <CardDescription>Restore data from a previously exported JSON backup file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <span>Importing will <strong>replace</strong> all current data. Export a backup first if needed.</span>
            </div>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Choose Backup File
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Backup;
