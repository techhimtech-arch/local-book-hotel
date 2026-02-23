import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHotelData } from '@/hooks/useHotelData';
import { Room, RoomType, RoomStatus } from '@/types/hotel';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const roomTypes: RoomType[] = ['Single', 'Double', 'Suite', 'Deluxe', 'Dormitory'];
const roomStatuses: RoomStatus[] = ['Available', 'Occupied', 'Maintenance'];

const statusColor: Record<RoomStatus, 'default' | 'secondary' | 'destructive'> = {
  Available: 'default',
  Occupied: 'secondary',
  Maintenance: 'destructive',
};

const emptyRoom: Omit<Room, 'id'> = { roomNumber: '', floor: 1, type: 'Single', pricePerNight: 0, status: 'Available' };

const Rooms = () => {
  const { rooms, addRoom, updateRoom, deleteRoom, getAvailableBeds, getOccupiedBeds } = useHotelData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState<Omit<Room, 'id'>>(emptyRoom);

  const handleOpen = (room?: Room) => {
    if (room) {
      setEditing(room);
      setForm({ roomNumber: room.roomNumber, floor: room.floor, type: room.type, pricePerNight: room.pricePerNight, status: room.status, totalBeds: room.totalBeds });
    } else {
      setEditing(null);
      setForm(emptyRoom);
    }
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.roomNumber) return;
    const roomData = { ...form };
    if (roomData.type !== 'Dormitory') {
      delete roomData.totalBeds;
    }
    if (editing) {
      updateRoom({ ...editing, ...roomData });
    } else {
      addRoom({ id: crypto.randomUUID(), ...roomData });
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rooms</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpen()}><Plus className="h-4 w-4 mr-1" /> Add Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Room' : 'Add Room'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Number</Label>
                  <Input value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} placeholder="101" />
                </div>
                <div className="space-y-2">
                  <Label>Floor</Label>
                  <Input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as RoomType, totalBeds: v === 'Dormitory' ? (form.totalBeds || 6) : undefined })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{roomTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{form.type === 'Dormitory' ? 'Price / Bed / Night (₹)' : 'Price / Night (₹)'}</Label>
                  <Input type="number" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: Number(e.target.value) })} />
                </div>
              </div>
              {form.type === 'Dormitory' && (
                <div className="space-y-2">
                  <Label>Total Beds</Label>
                  <Input type="number" min={1} value={form.totalBeds || ''} onChange={(e) => setForm({ ...form, totalBeds: Number(e.target.value) })} placeholder="e.g. 6" />
                </div>
              )}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as RoomStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{roomStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave}>{editing ? 'Update' : 'Add'} Room</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {rooms.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No rooms added yet. Click "Add Room" to get started.</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room #</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price/Night</TableHead>
                  <TableHead>Beds</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => {
                  const availBeds = room.type === 'Dormitory' ? getAvailableBeds(room.id).length : null;
                  return (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.roomNumber}</TableCell>
                      <TableCell>{room.floor}</TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell>₹{room.pricePerNight.toLocaleString()}{room.type === 'Dormitory' ? '/bed' : ''}</TableCell>
                      <TableCell>
                        {room.type === 'Dormitory' ? (
                          <span>{availBeds}/{room.totalBeds} free</span>
                        ) : '—'}
                      </TableCell>
                      <TableCell><Badge variant={statusColor[room.status]}>{room.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpen(room)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteRoom(room.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Rooms;
