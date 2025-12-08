// Referensi dari https://gist.github.com/chriswhong/694779bc1f1e5d926e47bab7205fa559

import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';

const RadiusMode = { ...MapboxDraw.modes.draw_line_string };

function createVertex(parentId, coordinates, path, selected) {
  return {
    type: 'Feature',
    properties: {
      meta: 'vertex',
      parent: parentId,
      coord_path: path,
      active: selected ? 'true' : 'false',
    },
    geometry: {
      type: 'Point',
      coordinates,
    },
  };
}

// Create a circle-like polygon given a center point and radius
function createGeoJSONCircle(center, radiusInMeters, parentId, points = 64) {
  const options = { steps: points, units: 'meters' };
  const circle = turf.circle(center, radiusInMeters, options);

  return {
    type: 'Feature',
    geometry: circle.geometry,
    properties: {
      parent: parentId,
      meta: 'radius',
    },
  };
}

function getDisplayMeasurements(radiusInMeters) {
  let metricUnits = 'm';
  let metricMeasurement = radiusInMeters;

  if (radiusInMeters >= 1000) {
    metricMeasurement = radiusInMeters / 1000;
    metricUnits = 'km';
  }

  const feet = radiusInMeters * 3.28084;
  let standardUnits = 'ft';
  let standardMeasurement = feet;

  if (feet >= 5280) {
    standardMeasurement = feet / 5280;
    standardUnits = 'mi';
  }

  return {
    metric: `${metricMeasurement.toFixed(2)} ${metricUnits}`,
    standard: `${standardMeasurement.toFixed(2)} ${standardUnits}`,
  };
}

const doubleClickZoom = {
  enable: (ctx) => {
    setTimeout(() => {
      if (
        !ctx.map ||
        !ctx.map.doubleClickZoom ||
        !ctx._ctx ||
        !ctx._ctx.store ||
        !ctx._ctx.store.getInitialConfigValue
      )
        return;
      if (!ctx._ctx.store.getInitialConfigValue('doubleClickZoom')) return;
      ctx.map.doubleClickZoom.enable();
    }, 0);
  },
};

// Override clickAnywhere to end drawing after second click
RadiusMode.clickAnywhere = function(state, e) {
  // First click: set center point
  if (state.currentVertexPosition === 0) {
    state.line.updateCoordinate(0, e.lngLat.lng, e.lngLat.lat);
    state.currentVertexPosition = 1;
    state.line.addCoordinate(1, e.lngLat.lng, e.lngLat.lat);
    return null;
  }

  // Second click: confirm radius and finish
  if (state.currentVertexPosition === 1) {
    state.line.updateCoordinate(1, e.lngLat.lng, e.lngLat.lat);
    return this.changeMode('simple_select', { featureIds: [state.line.id] });
  }

  return null;
};

// Override onMouseMove to update the radius point dynamically
RadiusMode.onMouseMove = function(state, e) {
  if (state.currentVertexPosition === 1) {
    state.line.updateCoordinate(1, e.lngLat.lng, e.lngLat.lat);

    // Force a re-render
    if (this.map && this.map._update) {
      this.map._update();
    }
  }
};

// Create the final geojson circle feature
RadiusMode.onStop = function(state) {
  doubleClickZoom.enable(this);
  this.activateUIButton();

  // Check if feature was deleted
  if (this.getFeature(state.line.id) === undefined) return;

  // Remove the line coordinate
  if (state.line.coordinates.length > 1) {
    const lineGeoJson = state.line.toGeoJSON();
    const center = lineGeoJson.geometry.coordinates[0];
    const radiusPoint = lineGeoJson.geometry.coordinates[1];

    // Calculate radius in meters using Turf
    const from = turf.point(center);
    const to = turf.point(radiusPoint);
    const radiusInMeters = turf.distance(from, to, { units: 'meters' });

    // Create a circle feature that will be converted to Traccar format
    const circleFeature = createGeoJSONCircle(center, radiusInMeters, state.line.id);

    // Add radius as a property for later conversion
    circleFeature.properties.radius = radiusInMeters;
    circleFeature.properties.center = center;

    this.deleteFeature([state.line.id], { silent: true });

    this.map.fire('draw.create', {
      features: [circleFeature],
    });
  } else {
    this.deleteFeature([state.line.id], { silent: true });
    this.changeMode('simple_select', {}, { silent: true });
  }
};

// Display features during drawing
RadiusMode.toDisplayFeatures = function(state, geojson, display) {
  const isActiveLine = geojson.properties.id === state.line.id;
  geojson.properties.active = isActiveLine ? 'true' : 'false';

  if (!isActiveLine) return display(geojson);

  // Only render if we have at least the center point
  if (geojson.geometry.coordinates.length < 2) return null;

  const center = geojson.geometry.coordinates[0];
  const radiusPoint = geojson.geometry.coordinates[1];

  // Display center vertex
  display(
    createVertex(state.line.id, center, '0', false)
  );

  // Calculate radius
  const from = turf.point(center);
  const to = turf.point(radiusPoint);
  const radiusInMeters = turf.distance(from, to, { units: 'meters' });

  // Display radius line
  display(geojson);

  // Display current radius point with measurements
  const displayMeasurements = getDisplayMeasurements(radiusInMeters);
  const currentVertex = {
    type: 'Feature',
    properties: {
      meta: 'currentPosition',
      radiusMetric: displayMeasurements.metric,
      radiusStandard: displayMeasurements.standard,
      parent: state.line.id,
    },
    geometry: {
      type: 'Point',
      coordinates: radiusPoint,
    },
  };
  display(currentVertex);

  // Display circle preview
  const circleFeature = createGeoJSONCircle(center, radiusInMeters, state.line.id);
  display(circleFeature);

  return null;
};

export default RadiusMode;
