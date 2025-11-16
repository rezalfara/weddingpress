'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { GuestbookEntry, GuestbookStatus } from '@/types/models'; 
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Trash2, 
  Loader2, 
  XCircle, 
  MoreHorizontal,
  Search 
} from 'lucide-react';
import { DeleteConfirmButton } from '@/components/admin/DeleteConfirmButton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/lib/hooks/useDebounce';

const fetcher = (url: string) => api.get(url).then((res) => res.data);


// --- KOMPONEN DROPDOWN AKSI (Tidak Berubah) ---
interface DropdownActionsProps {
  entry: GuestbookEntry;
  onUpdateStatus: (id: number, status: GuestbookStatus) => void;
  onDelete: (id: number) => void;
}

function DropdownActions({ entry, onUpdateStatus, onDelete }: DropdownActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Buka menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        
        {entry.status === 'pending' && (
          <DropdownMenuItem onClick={() => onUpdateStatus(entry.id, 'approved')}>
            <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve
          </DropdownMenuItem>
        )}
        {entry.status === 'approved' && (
          <DropdownMenuItem onClick={() => onUpdateStatus(entry.id, 'pending')}>
            <XCircle className="mr-2 h-4 w-4 text-orange-500" /> Reject
          </DropdownMenuItem>
        )}

        <DeleteConfirmButton onConfirm={() => onDelete(entry.id)}>
          <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
            <Trash2 className="mr-2 h-4 w-4" /> Hapus Permanen
          </DropdownMenuItem>
        </DeleteConfirmButton>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// --- FUNGSI BANTUAN TAMPILAN (Tidak Berubah) ---
const getStatusBadge = (status: GuestbookStatus) => {
    if (status === 'approved') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" /> Approved
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-orange-600 border-orange-300 bg-yellow-50 hover:bg-yellow-100">
        <Clock className="h-3 w-3 mr-1" /> Pending
      </Badge>
    );
  };

const formattedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };


// --- KOMPONEN HALAMAN UTAMA ---
export default function GuestbookPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all'); 
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedEntryIds, setSelectedEntryIds] = useState<number[]>([]);
  
  const params = new URLSearchParams();
  if (filterStatus !== 'all') { params.append('status', filterStatus); }
  if (debouncedSearchTerm) { params.append('search', debouncedSearchTerm); }
  const queryString = params.toString();
  const swrKey = `/admin/guestbook?${queryString}`;
  
  const { data: entries, error, mutate, isLoading } = useSWR<GuestbookEntry[]>(swrKey, fetcher);

  useEffect(() => { setSelectedEntryIds([]); }, [debouncedSearchTerm, filterStatus]);
  
  // --- Handler Aksi (Tidak Berubah) ---
  const handleUpdateStatus = async (id: number, newStatus: GuestbookStatus) => {
    try {
      await api.put(`/admin/guestbook/${id}`, { status: newStatus });
      mutate(); 
      toast.success('Sukses', { description: `Ucapan berhasil di-${newStatus}.` });
    } catch (err) {
      toast.error('Gagal memperbarui status.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/guestbook/${id}`);
      mutate();
      toast.success('Sukses', { description: 'Ucapan berhasil dihapus.' });
    } catch (err) {
      toast.error('Gagal menghapus ucapan.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEntryIds.length === 0) return;
    try {
      await api.delete('/admin/guestbook/bulk', { data: { ids: selectedEntryIds } });
      mutate();
      setSelectedEntryIds([]);
      toast.success('Sukses', { description: `${selectedEntryIds.length} ucapan berhasil dihapus.` });
    } catch (err) {
      toast.error('Gagal menghapus massal.');
    }
  };
  
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (!entries) return;
    if (checked === true) {
        setSelectedEntryIds(entries.map((e) => e.id));
    } else {
        setSelectedEntryIds([]);
    }
  };

  const handleSelectRow = (entryId: number, checked: boolean) => {
    if (checked) {
        setSelectedEntryIds((prev) => [...prev, entryId]);
    } else {
        setSelectedEntryIds((prev) => prev.filter((id) => id !== entryId));
    }
  };

  if (error) return <div>Gagal memuat data buku tamu.</div>;

  const isAllSelected = (entries?.length ?? 0) > 0 && selectedEntryIds.length === entries?.length;
  const isIndeterminate = selectedEntryIds.length > 0 && !isAllSelected;

  return (
    <div className="space-y-6">
      <Card>
        {/* --- PANEL AKSI MASSAL / HEADER --- */}
        {selectedEntryIds.length > 0 ? (
          <CardHeader className="bg-muted p-4">
            <div className="flex flex-row justify-between items-center gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                {selectedEntryIds.length} ucapan terpilih
              </p>
              <DeleteConfirmButton onConfirm={handleBulkDelete}>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Terpilih
                </Button>
              </DeleteConfirmButton>
            </div>
          </CardHeader>
        ) : (
          <CardHeader className="p-4 pb-0">
            <CardTitle>Daftar Ucapan</CardTitle>
            <CardDescription>
              Total {entries?.length || 0} ucapan ditemukan.
            </CardDescription>
          </CardHeader>
        )}
        
        {/* --- KONTROL FILTER DAN SEARCH (RESPONSIVE) --- */}
        <CardContent className="p-4 pt-4 border-t">
          <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:flex-1"> 
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama tamu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                
                <div className="w-full sm:w-[150px]">
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus} 
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
          </div>
        </CardContent>

        {/* --- TAMPILAN UTAMA (DESKTOP: Table) --- */}
        <CardContent className="hidden md:block p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="w-[50px] pl-6 py-3">
                    <Checkbox
                        checked={isAllSelected ? true : isIndeterminate ? 'indeterminate' : false}
                        onCheckedChange={handleSelectAll}
                        disabled={isLoading || (entries?.length ?? 0) === 0}
                    />
                  </TableHead>
                  <TableHead className="w-[250px] py-3">Nama Tamu</TableHead>
                  <TableHead className="w-auto min-w-[300px] py-3">Pesan</TableHead>
                  <TableHead className="w-[250px] py-3">Status</TableHead>
                  <TableHead className="w-[200px] py-3">Tanggal Kirim</TableHead>
                  <TableHead className="w-[150px] text-right pr-6 py-3">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                ) : (entries?.length || 0) === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Tidak ada ucapan ditemukan.</TableCell></TableRow>
                ) : (
                  entries!.map((entry) => (
                    <TableRow key={entry.id} data-state={selectedEntryIds.includes(entry.id) ? "selected" : ""}>
                      <TableCell className="pl-6 py-2">
                          <Checkbox
                              checked={selectedEntryIds.includes(entry.id)}
                              onCheckedChange={(checked) => handleSelectRow(entry.id, !!checked)}
                          />
                      </TableCell>
                      <TableCell className="font-medium py-2">{entry.guest_name}</TableCell>
                      <TableCell 
                        className="max-w-md overflow-hidden text-ellipsis whitespace-nowrap py-2"
                        title={entry.message}
                      >
                        {entry.message}
                      </TableCell>
                      <TableCell className="py-2">{getStatusBadge(entry.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm py-2">
                        {formattedDate(entry.created_at)}
                      </TableCell>
                      
                      {selectedEntryIds.length === 0 && (
                        <TableCell className="text-right pr-6 py-2">
                          <DropdownActions 
                            entry={entry} 
                            onUpdateStatus={handleUpdateStatus} 
                            onDelete={handleDelete}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* --- TAMPILAN UTAMA (MOBILE: Card List) --- */}
        <CardContent className="p-4 space-y-4 block md:hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (entries?.length || 0) === 0 ? (
            <p className="text-center text-muted-foreground">Tidak ada ucapan ditemukan.</p>
          ) : (
            entries!.map((entry) => (
              <Card 
                key={entry.id} 
                className={`shadow-sm ${selectedEntryIds.includes(entry.id) ? 'border-primary ring-2 ring-primary' : ''}`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                        checked={selectedEntryIds.includes(entry.id)}
                        onCheckedChange={(checked) => handleSelectRow(entry.id, !!checked)}
                    />
                    <CardTitle className="text-lg font-medium">{entry.guest_name}</CardTitle>
                  </div>
                  {selectedEntryIds.length === 0 && (
                    <DropdownActions 
                        entry={entry} 
                        onUpdateStatus={handleUpdateStatus} 
                        onDelete={handleDelete} 
                    />
                  )}
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            {getStatusBadge(entry.status)}
                            <span className="ml-3 text-muted-foreground">{formattedDate(entry.created_at)}</span>
                        </div>
                    </div>
                    <div className="text-gray-700 pt-1 border-t mt-2">
                        <p className="font-medium mb-1">Pesan:</p>
                        <p className="max-h-16 overflow-y-auto italic pr-1">{entry.message}</p>
                    </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}