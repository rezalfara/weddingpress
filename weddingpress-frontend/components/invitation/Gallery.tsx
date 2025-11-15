import { Gallery } from "@/types/models";
import Image from "next/image";

export function GallerySection({ data }: { data: Gallery[] }) {
  if (!data || data.length === 0) return null;
  return (
    <section className="bg-gray-50 p-8">
      <h2 className="text-3xl font-semibold text-center mb-8" style={{ color: "var(--theme-color)" }}>
        Galeri
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((item) => (
          <div key={item.id} className="relative w-full h-48 md:h-72 rounded-md overflow-hidden shadow-lg">
            <Image
              src={item.file_url}
              alt={item.caption || "Gallery image"}
              layout="fill"
              objectFit="cover"
              className="hover:scale-110 transition-transform duration-300"
            />
            {item.caption && (
              <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-2 text-sm">
                {item.caption}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}