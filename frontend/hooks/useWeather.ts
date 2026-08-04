"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getCurrentWeather,
  type CurrentWeather,
} from "@/services/weather.service";

type UseWeatherResult = {
  weather: CurrentWeather | null;
  loading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
};

export function useWeather(): UseWeatherResult {
  const [weather, setWeather] =
    useState<CurrentWeather | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refreshWeather = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const currentWeather =
          await getCurrentWeather();

        setWeather(currentWeather);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load weather.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void refreshWeather();
  }, [refreshWeather]);

  return {
    weather,
    loading,
    error,
    refreshWeather,
  };
}