import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch HTML content from your backend
    const res = await fetch(
      `http://localhost:8000/api/users/knowledge-graph/${params.id}`
    );

    // Handle fetch errors
    if (!res.ok) {
      throw new Error("Failed to fetch knowledge graph HTML");
    }

    // Get the HTML content
    const html = await res.text();

    // Return the HTML with appropriate headers
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Security-Policy": "default-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow scripts in the iframe
      },
    });
  } catch (error) {
    console.error("Error fetching knowledge graph:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}