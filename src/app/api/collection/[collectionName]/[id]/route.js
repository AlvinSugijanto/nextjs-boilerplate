// Next Imports
import { NextResponse } from "next/server";

import pb from "@/utils/pocketbase";

function getAccessToken(data) {
  const match = data.match(/accessToken=([^;]+)/);

  return match ? match[1] : null;
}

// METHOD GET
export async function GET(req, { params }) {
  const { collectionName, id } = await params;
  const collection = collectionName;

  const cookie = req.headers.get("cookie");
  const token = getAccessToken(cookie);

  const authorization = req.headers.get("authorization") || `Bearer ${token}`;
  const expand = req.headers.get("expand") || "";

  try {
    const record = await pb.collection(collection).getOne(id, {
      headers: {
        Authorization: authorization,
      },
      expand,
    });

    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json(error.response, { status: error?.status || 500 });
  }
}

// METHOD PUT
export async function PUT(req, { params }) {
  const { collectionName, id } = await params;
  const collection = collectionName;

  const cookie = req.headers.get("cookie");
  const token = getAccessToken(cookie);

  const authorization = req.headers.get("authorization") || `Bearer ${token}`;
  const contentType = req.headers.get("content-type");

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();

    const data = {};

    // Create a Map to handle array fields
    const arrayFields = new Map();

    for (const entry of formData.entries()) {
      const [key, value] = entry;

      // Check if the key ends with '[]' to handle array fields
      if (key.endsWith("[]")) {
        const arrayKey = key.slice(0, -2);

        if (!arrayFields.has(arrayKey)) {
          arrayFields.set(arrayKey, []);
        }

        arrayFields.get(arrayKey).push(value);
      } else {
        data[key] = value;
      }
    }

    // Add array fields to data
    for (const [key, values] of arrayFields) {
      data[key] = values;
    }

    try {
      const record = await pb.collection(collection).update(id, data, {
        headers: {
          Authorization: authorization,
        },
      });

      return NextResponse.json(record);
    } catch (error) {
      return NextResponse.json(error.response, {
        status: error?.status || 500,
      });
    }
  } else {
    const data = await req.json();

    try {
      const record = await pb.collection(collection).update(id, data, {
        headers: {
          Authorization: authorization,
        },
      });

      return NextResponse.json(record);
    } catch (error) {
      return NextResponse.json(error.response, {
        status: error?.status || 500,
      });
    }
  }
}

// METHOD PATCH
export async function PATCH(req, { params }) {
  const { collectionName, id } = await params;
  const collection = collectionName;

  const cookie = req.headers.get("cookie");
  const token = getAccessToken(cookie);

  const authorization = req.headers.get("authorization") || `Bearer ${token}`;
  const contentType = req.headers.get("content-type");

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();

    const data = {};

    // Create a Map to handle array fields
    const arrayFields = new Map();

    for (const entry of formData.entries()) {
      const [key, value] = entry;

      // Check if the key ends with '[]' to handle array fields
      if (key.endsWith("[]")) {
        const arrayKey = key.slice(0, -2);

        if (!arrayFields.has(arrayKey)) {
          arrayFields.set(arrayKey, []);
        }

        arrayFields.get(arrayKey).push(value);
      } else {
        data[key] = value;
      }
    }

    // Add array fields to data
    for (const [key, values] of arrayFields) {
      data[key] = values;
    }

    try {
      const record = await pb.collection(collection).update(id, data, {
        headers: {
          Authorization: authorization,
        },
      });

      return NextResponse.json(record);
    } catch (error) {
      return NextResponse.json(error.response, {
        status: error?.status || 500,
      });
    }
  } else {
    const data = await req.json();

    try {
      const record = await pb.collection(collection).update(id, data, {
        headers: {
          Authorization: authorization,
        },
      });

      return NextResponse.json(record);
    } catch (error) {
      return NextResponse.json(error.response, {
        status: error?.status || 500,
      });
    }
  }
}

// METHOD DELETE
export async function DELETE(req, { params }) {
  const { collectionName, id } = await params;
  const collection = collectionName;

  const cookie = req.headers.get("cookie");
  const token = getAccessToken(cookie);

  const authorization = req.headers.get("authorization") || `Bearer ${token}`;

  try {
    const record = await pb.collection(collection).delete(id, {
      headers: {
        Authorization: authorization,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json(error.response, { status: error?.status || 500 });
  }
}
