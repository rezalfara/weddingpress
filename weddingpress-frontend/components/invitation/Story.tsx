import { Story } from "@/types/models";
import { format } from "date-fns";

export function StorySection({ data }: { data: Story[] }) {
  if (!data || data.length === 0) return null;
  // Backend sudah mengurutkan
  return (
    <section className="p-8">
      <h2 className="text-3xl font-semibold text-center mb-8" style={{ color: "var(--theme-color)" }}>
        Cerita Kami
      </h2>
      <div className="relative max-w-2xl mx-auto">
        {/* Garis Tengah (pseudo-element) */}
        <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gray-300 -translate-x-1/2"></div>
        {data.map((story, index) => (
          <div key={story.id} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} mb-8 relative`}>
            <div className="w-5/12 p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold" style={{ color: "var(--theme-color)" }}>{story.title}</h3>
              <span className="text-sm text-gray-500">{format(new Date(story.date), "dd MMMM yyyy")}</span>
              <p className="mt-2 text-gray-600">{story.description}</p>
            </div>
            {/* Titik di Timeline */}
            <div className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full bg-white border-2 -translate-x-1/2 -translate-y-1/2" style={{ borderColor: "var(--theme-color)" }}></div>
          </div>
        ))}
      </div>
    </section>
  );
}