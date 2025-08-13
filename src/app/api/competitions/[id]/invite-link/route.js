import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";
import crypto from 'crypto';

// GET - Get current invite link
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user is the competition creator
    const competition = await client.fetch(`*[_type == "competition" && _id == $id][0]{
      _id,
      createdBy->{ _id }
    }`, { id });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    if (competition.createdBy._id !== userId) {
      return NextResponse.json(
        { error: "Only the competition creator can manage invite links" },
        { status: 403 }
      );
    }

    // Get existing invite link
    const existingInvitation = await client.fetch(`*[_type == "invitation" && competition._ref == $id && !invitedUser][0]{
      _id,
      inviteLink
    }`, { id });

    return NextResponse.json({
      inviteLink: existingInvitation?.inviteLink || null
    });
  } catch (error) {
    console.error("Error fetching invite link:", error);
    return NextResponse.json(
      { error: "Failed to fetch invite link" },
      { status: 500 }
    );
  }
}

// POST - Generate new invite link
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user is the competition creator
    const competition = await client.fetch(`*[_type == "competition" && _id == $id][0]{
      _id,
      createdBy->{ _id }
    }`, { id });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    if (competition.createdBy._id !== userId) {
      return NextResponse.json(
        { error: "Only the competition creator can generate invite links" },
        { status: 403 }
      );
    }

    // Generate unique invite link
    const inviteCode = crypto.randomBytes(16).toString('hex');
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/join/${inviteCode}`;

    // Delete existing open invitation if any
    const existingInvitation = await client.fetch(`*[_type == "invitation" && competition._ref == $id && !invitedUser][0]`, { id });
    if (existingInvitation) {
      await client.delete(existingInvitation._id);
    }

    // Create new open invitation
    const invitation = await client.create({
      _type: 'invitation',
      competition: {
        _type: 'reference',
        _ref: id
      },
      invitedBy: {
        _type: 'reference',
        _ref: userId
      },
      status: 'pending',
      inviteLink
    });

    return NextResponse.json({
      success: true,
      inviteLink,
      invitation
    });
  } catch (error) {
    console.error("Error generating invite link:", error);
    return NextResponse.json(
      { error: "Failed to generate invite link" },
      { status: 500 }
    );
  }
}
