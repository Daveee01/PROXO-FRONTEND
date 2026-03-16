import { NextRequest, NextResponse } from "next/server";

type RecommendRequest = {
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  areaSqMeters?: number;
  preferences?: string[];
};

export async function POST(request: NextRequest) {
  const backendUrl = process.env.PROXO_BACKEND_URL;
  const backendApiKey = process.env.PROXO_API_KEY;

  if (!backendUrl) {
    return NextResponse.json(
      {
        error: "backend_not_configured",
        details: "Set PROXO_BACKEND_URL in frontend environment variables.",
      },
      { status: 500 },
    );
  }

  let payload: RecommendRequest;
  try {
    payload = (await request.json()) as RecommendRequest;
  } catch {
    return NextResponse.json(
      {
        error: "invalid_request_body",
        details: "Request body must be valid JSON.",
      },
      { status: 400 },
    );
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (backendApiKey) {
    headers["X-API-Key"] = backendApiKey;
  }

  try {
    const upstream = await fetch(`${backendUrl}/api/v1/recommend`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const responseBody = await upstream.text();
    const contentType = upstream.headers.get("content-type") ?? "application/json";

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "backend_unreachable",
        details:
          error instanceof Error
            ? error.message
            : "Unable to connect to backend service.",
      },
      { status: 502 },
    );
  }
}
