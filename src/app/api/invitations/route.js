import { createClient } from 'next-sanity';
import { NextResponse } from 'next/server';
import { client } from "@/lib/sanity";

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// GET - Fetch invitations
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const invitedBy = searchParams.get('invitedBy');
    const invitedUser = searchParams.get('invitedUser');
    const competitionId = searchParams.get('competitionId');
    const inviteLink = searchParams.get('inviteLink');

    let query = `*[_type == "invitation"`;
    
    if (status) {
      query += ` && status == $status`;
    }
    
    if (invitedBy) {
      query += ` && invitedBy == $invitedBy`;
    }
    
    if (invitedUser) {
      query += ` && invitedUser == $invitedUser`;
    }
    
    if (competitionId) {
      query += ` && competition == $competitionId`;
    }

    if (inviteLink) {
      query += ` && inviteLink == $inviteLink`;
    }
    
    query += `] {
      _id,
      status,
      inviteLink,
      competition->{
        _id,
        nameAr,
        nameEn,
        date,
        location,
        status
      },
      invitedUser->{
        _id,
        userName,
        fullName,
        image
      },
      invitedBy->{
        _id,
        userName,
        fullName,
        image
      }
    } | order(_createdAt desc)`;

    const invitations = await sanityClient.fetch(query, { 
      status, 
      invitedBy, 
      invitedUser, 
      competitionId,
      inviteLink
    });
    
    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

// POST - Create new invitation
export async function POST(request) {
  try {
    const body = await request.json();
    const { competitionId, invitedUserId, invitedBy, inviteLink } = body;

    if (!competitionId || !invitedBy || !inviteLink) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create invitation document
    const invitationDoc = {
      _type: 'invitation',
      competition: {
        _type: 'reference',
        _ref: competitionId
      },
      invitedBy: {
        _type: 'reference',
        _ref: invitedBy
      },
      status: 'pending',
      inviteLink
    };

    // Only add invitedUser field if a specific user is invited
    if (invitedUserId) {
      invitationDoc.invitedUser = {
        _type: 'reference',
        _ref: invitedUserId
      };
    }

    const invitation = await client.create(invitationDoc);

    return NextResponse.json({ 
      success: true, 
      invitation,
      message: invitedUserId ? 'Invitation sent successfully!' : 'Open invitation created successfully!'
    });

  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
} 