"use client";

import { useState, useEffect } from 'react';

/**
 * Hook kustom untuk mengecek apakah komponen sudah
 * di-mount di sisi client.
 * * Ini membantu menghindari error hidrasi Next.js.
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // useEffect() hanya berjalan di client,
    // jadi kita set state-nya di sini.
    setIsClient(true);
  }, []); // Array dependensi kosong, jadi hanya berjalan sekali

  return isClient;
}