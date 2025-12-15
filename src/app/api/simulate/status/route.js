import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    const { simulationId } = await req.json();

    if (!simulationId) {
      return NextResponse.json({
        hasRunningSimulation: false,
        simulation: null,
      });
    }

    try {
      const statusResponse = await axios.get(`${process.env.NEXT_PUBLIC_SIMULATION_URL}/status/${simulationId}`);
      const isRunning = statusResponse.data.simulation_status === "running";

      return NextResponse.json({
        hasRunningSimulation: isRunning,
        simulation: statusResponse.data,
      });
    } catch (error) {
      if (error.response?.status === 404) {
        return NextResponse.json({
          hasRunningSimulation: false,
          simulation: null,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || error.message || "Failed to check status",
      },
      { status: error.response?.status || 500 }
    );
  }
}
