export const convertDrawFeatureToTraccarArea = (feature) => {
  if (!feature || !feature.geometry) {
    throw new Error('Invalid feature');
  }

  const { type, coordinates } = feature.geometry;

  switch (type) {
    case 'Point':
      return convertPointToTraccar(coordinates);
    case 'LineString':
      return convertLineStringToTraccar(coordinates);
    case 'Polygon':
      return convertPolygonToTraccar(coordinates);
    default:
      throw new Error(`Unsupported geometry type: ${type}`);
  }
};

const convertPointToTraccar = (coordinates) => {
  const [lng, lat] = coordinates;
  const radius = 50;
  return `CIRCLE (${lat} ${lng}, ${radius})`;
};

const convertLineStringToTraccar = (coordinates) => {
  const coordString = coordinates
    .map(([lng, lat]) => `${lat} ${lng}`)
    .join(', ');

  return `LINESTRING (${coordString})`;
};

const convertPolygonToTraccar = (coordinates) => {
  const outerRing = coordinates[0];
  const coordString = outerRing
    .map(([lng, lat]) => `${lat} ${lng}`)
    .join(', ');

  return `POLYGON ((${coordString}))`;
};
