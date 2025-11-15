'use client';

import { useState } from 'react';
import { GiftAccount } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react'; // Icons

// Komponen untuk satu item rekening
const GiftAccountItem = ({ account }: { account: GiftAccount }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(account.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    // --- PERUBAHAN 1: TAMBAHKAN LEBAR ---
    // w-full: Lebar penuh di HP
    // max-w-sm: Tapi tidak lebih lebar dari 384px
    // sm:w-[320px]: Di layar lebih besar, set lebar tetap 320px
    <div className="bg-white p-4 rounded-lg shadow-md text-center w-full max-w-sm sm:w-[320px]">
      <h3 className="text-lg font-semibold text-gray-800">{account.bank_name}</h3>
      {account.qr_code_url && (
        <div className="my-4">
          <img 
            src={account.qr_code_url} 
            alt={`QRIS ${account.bank_name}`} 
            className="w-40 h-40 object-contain mx-auto" 
          />
        </div>
      )}
      <p className="text-gray-600 mt-2">a.n. {account.account_name}</p>
      <p className="text-xl font-bold text-gray-900 my-1">{account.account_number}</p>
      <Button onClick={handleCopy} variant="outline" size="sm">
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-2" /> Disalin
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" /> Salin Nomor
          </>
        )}
      </Button>
    </div>
  );
};

// Komponen utama section
export const GiftSection = ({ accounts }: { accounts: GiftAccount[] }) => {
  return (
    <section id="gift" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Kirim Hadiah
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Doa restu Anda adalah hadiah terindah bagi kami. Namun, jika Anda
          ingin mengirimkan sesuatu yang lebih, kami telah menyediakan amplop
          digital di bawah ini.
        </p>

        {/* --- PERUBAHAN 2: UBAH DIV INI --- */}
        {/* Ubah dari 'grid' menjadi 'flex' */}
        {/* 'flex-wrap' agar bisa turun baris jika ada banyak kartu */}
        {/* 'justify-center' untuk meletakkan kartu di tengah */}
        <div className="flex justify-center flex-wrap gap-6">
          {accounts.map((acc) => (
            <GiftAccountItem key={acc.id} account={acc} />
          ))}
        </div>
      </div>
    </section>
  );
};