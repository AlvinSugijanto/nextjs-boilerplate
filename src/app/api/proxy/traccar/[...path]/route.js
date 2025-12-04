import { logger } from "@/utils/logger";
import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_API_URL = process.env.TRACCAR_API_URL;

// Build target URL
function buildTargetUrl(path, req) {
  return `${BASE_API_URL}/${path.join("/")}${req.nextUrl.search}`;
}

// Get Token
async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("T_SESSION")?.value || null;
}

// Base Axios instance with dynamic token
function apiClient(token) {
  return axios.create({
    baseURL: BASE_API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Handle errors
function handleError(error, url) {
  const statusCode = error?.response?.status || 500;

  logger.error("Request failed", "TRACCAR_PROXY", {
    status: statusCode,
    url,
    message: error?.message,
  });

  return NextResponse.json(
    error?.response?.data || { error: "Internal server error" },
    { status: statusCode }
  );
}

// =============== GET ===============
export async function GET(req, { params }) {
  const token = await getToken();
  const paramsPath = await params;
  const path = paramsPath.path;
  const url = buildTargetUrl(path, req);

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const api = apiClient(token);
    const res = await api.get(url.replace(BASE_API_URL, ""));
    return NextResponse.json(res.data);
  } catch (error) {
    return handleError(error, url);
  }
}

// =============== POST ===============
export async function POST(req, { params }) {
  const token = await getToken();
  const paramsPath = await params;
  const path = paramsPath.path;
  const url = buildTargetUrl(path, req);

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  try {
    const api = apiClient(token);
    const res = await api.post(url.replace(BASE_API_URL, ""), body);
    return NextResponse.json(res.data);
  } catch (error) {
    return handleError(error, url);
  }
}

// =============== PUT ===============
export async function PUT(req, { params }) {
  const token = await getToken();
  const paramsPath = await params;
  const path = paramsPath.path;
  const url = buildTargetUrl(path, req);

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  try {
    const api = apiClient(token);
    const res = await api.put(url.replace(BASE_API_URL, ""), body);
    return NextResponse.json(res.data);
  } catch (error) {
    return handleError(error, url);
  }
}

// =============== PATCH ===============
export async function PATCH(req, { params }) {
  const token = await getToken();
  const paramsPath = await params;
  const path = paramsPath.path;
  const url = buildTargetUrl(path, req);

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  try {
    const api = apiClient(token);
    const res = await api.patch(url.replace(BASE_API_URL, ""), body);
    return NextResponse.json(res.data);
  } catch (error) {
    return handleError(error, url);
  }
}

// =============== DELETE ===============
export async function DELETE(req, { params }) {
  const token = await getToken();
  const paramsPath = await params;
  const path = paramsPath.path;
  const url = buildTargetUrl(path, req);

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const api = apiClient(token);
    const res = await api.delete(url.replace(BASE_API_URL, ""));
    return NextResponse.json(res.data);
  } catch (error) {
    return handleError(error, url);
  }
}
