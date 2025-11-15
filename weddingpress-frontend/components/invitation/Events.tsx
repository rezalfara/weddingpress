import { Event } from "@/types/models";
import { format } from "date-fns";

export function EventsSection({ data }: { data: Event[] }) {
  if (!data || data.length === 0) return null;
  return (
    <section className="bg-gray-50 p-8">
      <h2 className="text-3xl font-semibold text-center mb-8" style={{ color: "var(--theme-color)" }}>
        Acara
      </h2>
      <div className="flex flex-wrap justify-center gap-8">
        {data.map((event) => (
          <div key={event.id} className="bg-white p-6 rounded-lg shadow-md text-center max-w-sm">
            <h3 className="text-2xl font-medium">{event.name}</h3>
            <p className="text-lg mt-2">{format(new Date(event.date), "EEEE, dd MMMM yyyy")}</p>
            <p className="text-gray-700">{event.start_time} - {event.end_time}</p>
            <p className="mt-4 text-gray-600">{event.address}</p>
            {event.maps_url && (
              <a href={event.maps_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-4 py-2 rounded text-white" style={{ backgroundColor: "var(--theme-color)" }}>
                Lihat Peta
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}