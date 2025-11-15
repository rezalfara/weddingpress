"use client"; 

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; 
import { api } from "@/lib/api";
import { toast } from "sonner";
import { UploadCloud } from 'lucide-react';

// Tipe untuk props
interface GuestImportProps {
  onImportSuccess: () => void;
  children: React.ReactNode; // Ini akan menjadi tombol pemicu
}

export function GuestImport({ onImportSuccess, children }: GuestImportProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false); // State untuk mengontrol modal

  // Handler untuk input file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Handler untuk tombol "Unggah dan Impor"
  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Error", { description: "Silakan pilih file Excel terlebih dahulu." });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile); 

    try {
      const response = await api.post("/admin/guests/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onImportSuccess(); // Panggil mutate (refresh)
      
      toast.success("Sukses!", {
        description: `${response.data.guests_added} tamu berhasil diimpor.`,
      });

      // Reset state dan tutup modal
      setSelectedFile(null);
      setIsLoading(false);
      setOpen(false); 

    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Gagal mengimpor file.";
      toast.error("Gagal", { description: errorMsg });
      setIsLoading(false);
    }
  };

  // Handler saat modal ditutup (untuk reset state)
  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedFile(null);
      setIsLoading(false);
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 'children' adalah tombol pemicu dari page.tsx */}
      <DialogTrigger asChild>
        {children} 
      </DialogTrigger>
      
      {/* Konten Modal */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Impor Tamu</DialogTitle>
          <DialogDescription>
            Unggah file Excel (.xlsx) untuk menambah banyak tamu sekaligus.
            Format: Kolom A = Nama, Kolom B = Grup.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input 
            id="guest-file-input"
            type="file" 
            accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange} 
            disabled={isLoading}
            className="file:text-foreground"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
             <Button variant="outline" disabled={isLoading}>Batal</Button>
          </DialogClose>
          <Button 
            onClick={handleImport} 
            disabled={isLoading || !selectedFile}
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            {isLoading ? "Mengunggah..." : "Unggah dan Impor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}