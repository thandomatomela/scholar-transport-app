import type {
  ApiResponse,
  DriverDashboard,
  DriverTripStop,
} from "@/src/types/driver-dashboard"

function getApiUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  return apiUrl;
}

async function readApiResponse<T>(
  response: Response,
): Promise<ApiResponse<T>> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return {
      error:
        "The server returned an invalid response.",
    };
  }
}

export async function fetchDriverDashboard(): Promise<DriverDashboard> {
  const apiUrl = getApiUrl();

  const response = await fetch(
    `${apiUrl}/driver/me/dashboard`,
    {
      cache: "no-store",
    },
  );

  const result =
    await readApiResponse<DriverDashboard>(
      response,
    );

  if (!response.ok || !result.data) {
    throw new Error(
      result.error ??
        "Failed to load the driver dashboard.",
    );
  }

  return result.data;
}

export async function startDriverTrip(
  tripId: string,
): Promise<void> {
  const apiUrl = getApiUrl();

  const response = await fetch(
    `${apiUrl}/driver/trips/${tripId}/start`,
    {
      method: "POST",
    },
  );

  const result =
    await readApiResponse<{
      tripId: string;
      status: "in_progress";
    }>(response);

  if (!response.ok) {
    throw new Error(
      result.error ??
        "Failed to start the trip.",
    );
  }
}

export async function notifyParentDriverArrived(
  tripId: string,
  stopId: string,
): Promise<void> {
  const apiUrl = getApiUrl();

  const response = await fetch(
    `${apiUrl}/driver/trips/${tripId}/stops/${stopId}/notify-parent`,
    {
      method: "POST",
    },
  );

  const result =
    await readApiResponse<{
      tripId: string;
      stopId: string;
      notification: string;
    }>(response);

  if (!response.ok) {
    throw new Error(
      result.error ??
        "Failed to notify the parent.",
    );
  }
}

export async function startMorningRun(): Promise<DriverDashboard> {
  const apiUrl = getApiUrl();

  const response = await fetch(
    `${apiUrl}/driver/me/start-morning-run`,
    {
      method: "POST",
    },
  );

  const result =
    await readApiResponse<DriverDashboard>(
      response,
    );

  if (!response.ok || !result.data) {
    throw new Error(
      result.error ??
        "Failed to start the morning run.",
    );
  }

  return result.data;
}

export async function startAfternoonRun(): Promise<DriverDashboard> {
  const apiUrl = getApiUrl();

  const response = await fetch(
    `${apiUrl}/driver/me/start-afternoon-run`,
    {
      method: "POST",
    },
  );

  const result =
    await readApiResponse<DriverDashboard>(
      response,
    );

  if (!response.ok || !result.data) {
    throw new Error(
      result.error ??
        "Failed to start the afternoon run.",
    );
  }

  return result.data;
}

export async function updateDriverTripStop(
  tripId: string,
  stopId: string,
  action:
    | "pick-up"
    | "absent"
    | "drop-off",
): Promise<DriverTripStop> {
  const apiUrl = getApiUrl();

  const response = await fetch(
    `${apiUrl}/driver/trips/${tripId}/stops/${stopId}/${action}`,
    {
      method: "POST",
    },
  );

  const result =
    await readApiResponse<DriverTripStop>(
      response,
    );

  if (!response.ok || !result.data) {
    throw new Error(
      result.error ??
        "Failed to update the trip stop.",
    );
  }

  return result.data;
}