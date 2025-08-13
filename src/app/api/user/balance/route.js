import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const query = `*[_type == "user" && _id == $userId][0]{
      _id,
      balance,
      fullName,
      name,
      email
    }`;

    const user = await client.fetch(query, { userId });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      balance: user.balance || 0,
      user: {
        id: user._id,
        name: user.fullName || user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Error fetching user balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch user balance" },
      { status: 500 }
    );
  }
} 