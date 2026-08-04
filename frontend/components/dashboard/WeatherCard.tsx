type WeatherCardProps = {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  drivingMessage: string;
};

export function WeatherCard({
  location,
  temperature,
  condition,
  icon,
  drivingMessage,
}: WeatherCardProps) {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-lg">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sky-100">
              Current weather
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {location}
            </h2>

            <p className="mt-1 text-sm text-sky-100">
              {condition}
            </p>
          </div>

          <div
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-4xl backdrop-blur-sm"
          >
            {icon}
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between gap-4">
          <p className="text-5xl font-bold tracking-tight">
            {temperature}°
          </p>

          <div className="max-w-48 rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-100">
              Driving conditions
            </p>

            <p className="mt-1 text-sm font-semibold">
              {drivingMessage}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}