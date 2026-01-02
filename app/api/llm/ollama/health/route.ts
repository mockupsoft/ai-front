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
          connected: false, 
          base_url: "http://localhost:11434",
          error: `Ollama API returned status ${response.status}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      connected: true,
      base_url: "http://localhost:11434",
      model_count: data.models?.length || 0,
      models: (data.models || []).map((m: any) => m.name),
    });
  } catch (error: any) {
    console.error("Ollama health check proxy error:", error);
    return NextResponse.json(
      { 
        connected: false, 
        base_url: "http://localhost:11434",
        error: error.message || "Failed to connect to Ollama" 
      },
      { status: 503 }
    );
  }
}

