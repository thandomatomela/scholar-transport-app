const EARTH_RADIUS_METERS =
  6_371_000;

function degreesToRadians(
  degrees: number,
): number {
  return (
    degrees *
    Math.PI /
    180
  );
}

export function calculateDistanceMeters(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
): number {
  const lat1 =
    degreesToRadians(
      latitude1,
    );

  const lat2 =
    degreesToRadians(
      latitude2,
    );

  const deltaLatitude =
    degreesToRadians(
      latitude2 -
        latitude1,
    );

  const deltaLongitude =
    degreesToRadians(
      longitude2 -
        longitude1,
    );

  const a =
    Math.sin(
      deltaLatitude / 2,
    ) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(
        deltaLongitude / 2,
      ) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return (
    EARTH_RADIUS_METERS *
    c
  );
}