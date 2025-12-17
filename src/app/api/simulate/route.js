import { NextResponse } from "next/server";
import axios from "axios";
import { parseGeofence } from "@/components/map/geofenceParser";
import * as turf from "@turf/turf";

function getAccessToken(cookie) {
  const match = cookie?.match(/T_SESSION=([^;]+)/);
  return match ? match[1] : null;
}

export async function POST(req) {
  try {
    const cookie = req.headers.get("cookie");
    const token = getAccessToken(cookie);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uniqueId, sourceGeofenceId, destinationGeofenceId, speed } = await req.json();

    if (!uniqueId || !sourceGeofenceId || !destinationGeofenceId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const sourceResponse = await axios.get(
      `${process.env.TRACCAR_API_URL}/geofences/${sourceGeofenceId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const destinationResponse = await axios.get(
      `${process.env.TRACCAR_API_URL}/geofences/${destinationGeofenceId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const sourceGeofence = sourceResponse.data;
    const destinationGeofence = destinationResponse.data;

    if (!sourceGeofence || !destinationGeofence) {
      return NextResponse.json(
        { error: "Geofences not found" },
        { status: 404 }
      );
    }

    const sourceParsed = parseGeofence(sourceGeofence.area);
    const destinationParsed = parseGeofence(destinationGeofence.area);

    if (!sourceParsed || !destinationParsed) {
      return NextResponse.json(
        { error: "Failed to parse geofence coordinates" },
        { status: 400 }
      );
    }

    let sourceCentroid, destinationCentroid;

    if (sourceParsed.center) {
      sourceCentroid = sourceParsed.center;
    } else {
      sourceCentroid = turf.centroid({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: sourceParsed.coordinates,
        },
      }).geometry.coordinates;
    }

    if (destinationParsed.center) {
      destinationCentroid = destinationParsed.center;
    } else {
      destinationCentroid = turf.centroid({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: destinationParsed.coordinates,
        },
      }).geometry.coordinates;
    }

    const simulationUrl = new URL(`${process.env.NEXT_PUBLIC_SIMULATION_URL}/quick-start`);
    simulationUrl.searchParams.set("imei", uniqueId);
    simulationUrl.searchParams.set("start_lat", sourceCentroid[1]);
    simulationUrl.searchParams.set("start_lon", sourceCentroid[0]);
    simulationUrl.searchParams.set("end_lat", destinationCentroid[1]);
    simulationUrl.searchParams.set("end_lon", destinationCentroid[0]);
    simulationUrl.searchParams.set("speed", parseFloat(speed) / 1.852);

    const simulationResponse = await axios.get(simulationUrl.toString());

    return NextResponse.json({
      success: true,
      message: "Simulation started",
      data: simulationResponse.data,
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || error.message || "Failed to start simulation",
      },
      { status: error.response?.status || 500 }
    );
  }
}
