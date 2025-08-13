import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";

// GET - Get competition management data
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
      createdBy->{ _id },
      nameEn,
      nameAr
    }`, { id });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    if (competition.createdBy._id !== userId) {
      return NextResponse.json(
        { error: "Only the competition creator can manage it" },
        { status: 403 }
      );
    }

    // Get competitors
    const competitors = await client.fetch(`*[_type == "competitor" && competition._ref == $id]{
      _id,
      horseName,
      surpriseHorseName,
      activeHorse,
      user->{
        _id,
        name,
        fullName,
        userName,
        email,
        "imageUrl": image.asset->url
      }
    }`, { id });

    // Get invitations
    const invitations = await client.fetch(`*[_type == "invitation" && competition._ref == $id]{
      _id,
      status,
      inviteLink,
      invitedUser->{
        _id,
        name,
        fullName,
        userName,
        email,
        "imageUrl": image.asset->url
      },
      invitedBy->{
        _id,
        name,
        fullName
      }
    }`, { id });

    return NextResponse.json({
      competition: {
        id: competition._id,
        nameEn: competition.nameEn,
        nameAr: competition.nameAr
      },
      competitors,
      invitations
    });
  } catch (error) {
    console.error("Error fetching competition management data:", error);
    return NextResponse.json(
      { error: "Failed to fetch competition management data" },
      { status: 500 }
    );
  }
}

// POST - Invite user to competition
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, invitedUserId, inviteLink } = body;

    if (!userId || !invitedUserId || !inviteLink) {
      return NextResponse.json(
        { error: "Missing required fields" },
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
        { error: "Only the competition creator can invite users" },
        { status: 403 }
      );
    }

    // Check if user is already invited
    const existingInvitation = await client.fetch(`*[_type == "invitation" && competition._ref == $id && invitedUser._ref == $invitedUserId][0]`, {
      id,
      invitedUserId
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "User is already invited to this competition" },
        { status: 400 }
      );
    }

    // Create invitation
    const invitation = await client.create({
      _type: 'invitation',
      competition: {
        _type: 'reference',
        _ref: id
      },
      invitedUser: {
        _type: 'reference',
        _ref: invitedUserId
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
      invitation,
      message: "Invitation sent successfully"
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    return NextResponse.json(
      { error: "Failed to invite user" },
      { status: 500 }
    );
  }
}

// DELETE - Remove user from competition
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const invitedUserId = searchParams.get('invitedUserId');

    if (!userId || !invitedUserId) {
      return NextResponse.json(
        { error: "User ID and invited user ID are required" },
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
        { error: "Only the competition creator can remove users" },
        { status: 403 }
      );
    }

    // Delete invitation
    const invitation = await client.fetch(`*[_type == "invitation" && competition._ref == $id && invitedUser._ref == $invitedUserId][0]`, {
      id,
      invitedUserId
    });

    if (invitation) {
      await client.delete(invitation._id);
    }

    // Delete competitor if exists
    const competitor = await client.fetch(`*[_type == "competitor" && competition._ref == $id && user._ref == $invitedUserId][0]`, {
      id,
      invitedUserId
    });

    if (competitor) {
      await client.delete(competitor._id);
    }

    return NextResponse.json({
      success: true,
      message: "User removed successfully"
    });
  } catch (error) {
    console.error("Error removing user:", error);
    return NextResponse.json(
      { error: "Failed to remove user" },
      { status: 500 }
    );
  }
}
