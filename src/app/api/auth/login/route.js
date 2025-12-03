import axios from "axios";
import { NextResponse } from "next/server";

const EMAIL = process.env.TRACCAR_EMAIL;
const PASSWORD = process.env.TRACCAR_PASSWORD;
const BASE_API_URL = process.env.API_GET_TOKEN;

export async function POST(req, { params }) {
  try {
    const { data } = await axios.post(`${BASE_API_URL}/login`, {
      email: EMAIL,
      password: PASSWORD,
    });

    const response = NextResponse.json({
      message: "Login successful",
      token: data.token,
    });

    response.cookies.set("T_SESSION", data.token);
    return response;
  } catch (error) {
    return NextResponse.json(error.response.data, {
      status: error?.status || 500,
    });
  }
}
