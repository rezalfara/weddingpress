"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmButtonProps {
  onConfirm: () => void;     // Fungsi yang dijalankan saat "Ya, Hapus" diklik
  children: React.ReactNode; // Tombol/elemen yang memicu dialog (misal: tombol "Hapus")
}

/**
 * Komponen pembungkus untuk menampilkan dialog konfirmasi penghapusan.
 * Ini membungkus tombol pemicu (children) dan menjalankan `onConfirm`
 * hanya jika dikonfirmasi.
 */
export function DeleteConfirmButton({ onConfirm, children }: DeleteConfirmButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat diurungkan. Data akan dihapus secara permanen dari server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          {/* Kita menggunakan 'onClick' pada AlertDialogAction untuk menjalankan
            fungsi 'handleDelete' yang kita teruskan.
          */}
          <AlertDialogAction onClick={onConfirm}>
            Ya, Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}