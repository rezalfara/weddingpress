"use client";

import { useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // <-- IMPORT DARI SONNER

interface ImageUploadProps {
  value: string; // URL gambar saat ini
  onChange: (value: string) => void; // Fungsi untuk mengupdate URL
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Buat FormData untuk mengirim file
    const formData = new FormData();
    formData.append("file", file); // Nama 'file' sesuai backend

    try {
      // Kirim request ke backend
      const response = await api.post("/admin/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { url } = response.data; // Respons backend
      onChange(url); // Update nilai form di parent
      toast.success("Upload Berhasil", {
        description: "File berhasil di-upload.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload Gagal", {
        description: "Gagal meng-upload file. Coba lagi.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {value && (
        <div className="relative w-full h-64 rounded-md overflow-hidden">
          <Image
            src={value}
            alt="Preview"
            layout="fill"
            objectFit="cover"
          />
        </div>
      )}
      <Input
        type="file"
        accept="image/*,video/*" // Backend mendukung 'auto'
        onChange={handleUpload}
        disabled={isUploading}
      />
      {isUploading && <p>Uploading...</p>}
    </div>
  );
}