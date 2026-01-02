import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Proxy request to Ollama
    const response = await fetch("http://localhost:11434/api/tags", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          models: [], 
          connected: false, 
          base_url: "http://localhost:11434",
          error: `Ollama API returned status ${response.status}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      models: (data.models || []).map((m: any) => ({
        name: m.name,
        size: m.size,
        modified_at: m.modified_at,
      })),
      connected: true,
      base_url: "http://localhost:11434",
    });
  } catch (error: any) {
    console.error("Ollama proxy error:", error);
    return NextResponse.json(
      { 
        models: [], 
        connected: false, 
        base_url: "http://localhost:11434",
        error: error.message || "Failed to connect to Ollama" 
      },
      { status: 503 }
    );
  }
}

