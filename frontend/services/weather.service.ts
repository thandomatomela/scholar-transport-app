export type CurrentWeather = {
  temperature: number;
  condition: string;
  icon: string;
  drivingMessage: string;
};

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
};

const JOHANNESBURG_LATITUDE = -26.2041;
const JOHANNESBURG_LONGITUDE = 28.0473;

export async function getCurrentWeather(): Promise<CurrentWeather> {
  const params = new URLSearchParams({
    latitude: String(JOHANNESBURG_LATITUDE),
    longitude: String(JOHANNESBURG_LONGITUDE),
    current: [
      "temperature_2m",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
    timezone: "auto",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to load weather.");
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const current = data.current;

  if (
    !current ||
    typeof current.temperature_2m !== "number" ||
    typeof current.weather_code !== "number"
  ) {
    throw new Error("The weather server returned an invalid response.");
  }

  const weather = getWeatherDetails(current.weather_code);

  return {
    temperature: Math.round(current.temperature_2m),
    condition: weather.condition,
    icon: weather.icon,
    drivingMessage: getDrivingMessage(
      current.weather_code,
      current.wind_speed_10m ?? 0,
    ),
  };
}

function getWeatherDetails(
  code: number,
): {
  condition: string;
  icon: string;
} {
  if (code === 0) {
    return {
      condition: "Clear sky",
      icon: "☀️",
    };
  }

  if ([1, 2].includes(code)) {
    return {
      condition: "Partly cloudy",
      icon: "🌤️",
    };
  }

  if (code === 3) {
    return {
      condition: "Overcast",
      icon: "☁️",
    };
  }

  if ([45, 48].includes(code)) {
    return {
      condition: "Foggy",
      icon: "🌫️",
    };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return {
      condition: "Drizzle",
      icon: "🌦️",
    };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return {
      condition: "Rain",
      icon: "🌧️",
    };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      condition: "Snow",
      icon: "🌨️",
    };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      condition: "Thunderstorm",
      icon: "⛈️",
    };
  }

  return {
    condition: "Unknown conditions",
    icon: "🌤️",
  };
}

function getDrivingMessage(
  weatherCode: number,
  windSpeed: number,
): string {
  if ([45, 48].includes(weatherCode)) {
    return "Reduced visibility. Drive carefully.";
  }

  if (
    [61, 63, 65, 66, 67, 80, 81, 82].includes(
      weatherCode,
    )
  ) {
    return "Wet roads. Increase following distance.";
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return "Storm conditions. Use extra caution.";
  }

  if (windSpeed >= 40) {
    return "Strong winds. Keep both hands on the wheel.";
  }

  return "Good driving conditions.";
}