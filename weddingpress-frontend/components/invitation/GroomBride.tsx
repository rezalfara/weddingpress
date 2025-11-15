import { GroomBride } from "@/types/models";
import Image from "next/image";

export function GroomBrideSection({ data }: { data: GroomBride }) {
  if (!data) return null;
  return (
    <section className="text-center p-8">
      <h2 className="text-3xl font-semibold mb-8" style={{ color: "var(--theme-color)" }}>
        Mempelai
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mempelai Pria */}
        <div className="flex flex-col items-center">
          <Image src={data.groom_photo_url || "/placeholder.jpg"} width={200} height={200} alt={data.groom_name} className="rounded-full object-cover w-48 h-48" />
          <h3 className="text-2xl font-medium mt-4">{data.groom_name}</h3>
          <p className="mt-2 text-gray-600">{data.groom_bio}</p>
        </div>
        {/* Mempelai Wanita */}
        <div className="flex flex-col items-center">
          <Image src={data.bride_photo_url || "/placeholder.jpg"} width={200} height={200} alt={data.bride_name} className="rounded-full object-cover w-48 h-48" />
          <h3 className="text-2xl font-medium mt-4">{data.bride_name}</h3>
          <p className="mt-2 text-gray-600">{data.bride_bio}</p>
        </div>
      </div>
    </section>
  );
}