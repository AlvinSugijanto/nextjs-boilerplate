import mapboxgl from 'mapbox-gl';

export const createPopupHtml = (properties) => {
  const {
    name,
    status,
    speed,
    course,
    address,
    latitude,
    longitude,
    lastUpdate
  } = properties;

  const statusColor = status === 'online' ? '#16a34a' : status === 'offline' ? '#dc2626' : '#6b7280';

  const speedLine =
    typeof speed === 'number'
      ? `<div style="color:#555;font-size:0.7rem;margin-bottom:2px;">Speed: ${Math.round(
        speed * 1.852 || 0
      )} km/h</div>`
      : '';

  const courseLine =
    typeof course === 'number'
      ? `<div style="color:#555;font-size:0.7rem;margin-bottom:2px;">Course: ${Math.round(course)}°</div>`
      : '';

  const addressLine = address ? `<div style="color:#555;font-size:0.7rem;margin-bottom:2px;">${address}</div>` : '';

  const latLonLine =
    Number.isFinite(latitude) && Number.isFinite(longitude)
      ? `<div style="color:#777;font-size:0.65rem;margin-top:4px;">${latitude.toFixed(5)}, ${longitude.toFixed(5)}</div>`
      : '';

  const updatedLine = lastUpdate
    ? `<div style="color:#777;font-size:0.65rem;">Updated: ${new Date(lastUpdate).toLocaleString()}</div>`
    : '';

  return `
    <div style="font-size:0.75rem;color:#111;min-width:200px">
      <div style="font-weight:600;margin-bottom:4px;">${name}</div>
      <div style="color:#555;font-size:0.7rem;margin-bottom:4px;">
        Status: <span style="color:${statusColor};font-weight:600;">${status || 'Unknown'}</span>
      </div>
      ${speedLine}
      ${courseLine}
      ${addressLine}
      ${latLonLine}
      ${updatedLine}
    </div>
  `;
};

export const openPopupFromFeature = (map, feature, currentPopupRef) => {
  if (!map) return;

  // Close existing popup
  if (currentPopupRef.current) {
    currentPopupRef.current.remove();
    currentPopupRef.current = null;
  }

  const coordinates = feature.geometry.coordinates.slice();
  const html = createPopupHtml(feature.properties);

  const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
    .setLngLat(coordinates)
    .setHTML(html)
    .addTo(map);

  currentPopupRef.current = popup;
};

export const openPopupForDeviceId = (map, deviceId, deviceFeatures, currentPopupRef) => {
  const normalizedId = Number(deviceId);
  const feature = deviceFeatures.find(
    (candidate) => Number(candidate.properties.deviceId) === normalizedId
  );

  if (feature) {
    openPopupFromFeature(map, feature, currentPopupRef);
  }
};

export const closePopup = (currentPopupRef) => {
  if (currentPopupRef.current) {
    currentPopupRef.current.remove();
    currentPopupRef.current = null;
  }
};
