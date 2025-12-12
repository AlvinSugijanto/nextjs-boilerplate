import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    const { simulationId } = await req.json();

    const stopResponse = await axios.get(`${process.env.NEXT_PUBLIC_SIMULATION_URL}/stop/${simulationId}`);

    return NextResponse.json({
      success: true,
      message: "Simulation stopped",
      data: stopResponse.data,
    });
  } catch (error) {
    console.error("Stop simulation error:", error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || error.message || "Failed to stop simulation",
      },
      { status: error.response?.status || 500 }
    );
  }
}
