import { useState, useEffect } from 'react';

// Hook ini mengambil nilai 'value' (misal: "John") dan 'delay' (misal: 500ms)
// Dia akan mengembalikan nilai "John" HANYA setelah 500ms berlalu
export function useDebounce<T>(value: T, delay: number): T {
  // State untuk menyimpan nilai yang di-debounce
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timeout untuk update value setelah 'delay'
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Ini adalah fungsi cleanup
    // Dia akan membatalkan timeout jika 'value' atau 'delay' berubah
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Hanya jalankan ulang jika value atau delay berubah

  return debouncedValue;
}