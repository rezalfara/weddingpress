import { InvitationData } from "@/types/models";

// Kita tidak perlu 'Inter' or 'globals.css' di sini
// karena app/layout.tsx (root) sudah mengaturnya.

// Fungsi fetcher data (akan berjalan di server)
async function getInvitationData(slug: string): Promise<InvitationData | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/invitation/slug/${slug}`,
      {
        next: { revalidate: 10 }, // Cache data selama 10 detik
      }
    );
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Failed to fetch data for layout:", error);
    return null;
  }
}

export default async function InvitationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ guest_slug: string }>; // 'params' adalah Promise
}) {
  
  const awaitedParams = await params;
  const data = await getInvitationData(awaitedParams.guest_slug);

  const themeColor = data?.wedding.theme_color || "#333333";

  // --- PERBAIKAN ---
  // Hapus tag <html> dan <body>.
  // Cukup render sebuah <div> sebagai wrapper
  // untuk menerapkan CSS variable.
  return (
    <div 
      style={
        {
          "--theme-color": themeColor,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}