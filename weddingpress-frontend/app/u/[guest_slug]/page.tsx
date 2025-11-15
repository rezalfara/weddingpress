import { InvitationData } from "@/types/models";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationClientPage } from "./InvitationClientPage"; // File ini akan kita buat

// Fungsi fetcher data (akan berjalan di server)
async function getInvitationData(slug: string): Promise<InvitationData | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/invitation/slug/${slug}`, //
      {
        cache: "no-store", // Selalu ambil data terbaru
      }
    );
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return null;
  }
}

// --- PERBAIKAN 2 DI SINI (Fungsi generateMetadata) ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ guest_slug: string }>; // 'params' adalah Promise
}): Promise<Metadata> {
  
  const awaitedParams = await params; // 'await' Promise-nya
  const data = await getInvitationData(awaitedParams.guest_slug);

  if (!data) {
    return { title: "Undangan Tidak Ditemukan" };
  }

  return {
    title: `Undangan Pernikahan ${data.wedding.groom_bride.groom_name} & ${data.wedding.groom_bride.bride_name}`,
    description: `Kami mengundang Anda, ${data.guest.name}, untuk hadir di pernikahan kami.`,
    openGraph: {
      images: [data.wedding.cover_image_url || ""],
    },
  };
}

// --- PERBAIKAN 3 DI SINI (Komponen Halaman) ---
export default async function InvitationPage({
  params,
}: {
  params: Promise<{ guest_slug: string }>; // 'params' adalah Promise
}) {
  
  const awaitedParams = await params; // 'await' Promise-nya
  const data = await getInvitationData(awaitedParams.guest_slug);

  // Jika data tidak ditemukan, tampilkan halaman 404
  if (!data) {
    notFound();
  }

  // Render Client Component dan teruskan semua data
  return <InvitationClientPage data={data} />;
}