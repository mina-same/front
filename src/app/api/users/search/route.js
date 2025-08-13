import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters long" },
        { status: 400 }
      );
    }

    // Search users by name, username, or email
    const users = await client.fetch(`*[_type == "user" && (
      name match $query + "*" || 
      fullName match $query + "*" || 
      userName match $query + "*" || 
      email match $query + "*"
    )] | order(name asc)[0...$limit]{
      _id,
      name,
      fullName,
      userName,
      email,
      "imageUrl": image.asset->url
    }`, { 
      query: query.trim(), 
      limit 
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
} 