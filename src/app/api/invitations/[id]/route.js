import { createClient } from 'next-sanity';
import { NextResponse } from 'next/server';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// PATCH - Update invitation status
export async function PATCH(req, { params }) {
  try {
    const { id } = params; // This is actually the inviteLink code
    const body = await req.json();
    const { status, horseName, userId } = body;

    // First, find the invitation by inviteLink using pattern matching
    const invitation = await sanityClient.fetch(
      `*[_type == "invitation" && inviteLink match "*${id}*"][0]`,
      { inviteLink: id }
    );

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or has expired' },
        { status: 404 }
      );
    }

    // Update invitation status using the actual _id
    const updatedInvitation = await sanityClient
      .patch(invitation._id)
      .set({ status })
      .commit();

    if (status === 'accepted') {
      // Get the invitation details to find the competition
      const invitationDetails = await sanityClient.fetch(
        `*[_type == "invitation" && _id == $id][0] {
          competition->{_id},
          invitedUser->{_id}
        }`,
        { id: invitation._id }
      );

      if (invitationDetails && invitationDetails.competition) {
        // Create competitor entry for the accepted user
        const competitorDoc = {
          _type: 'competitor',
          user: {
            _type: 'reference',
            _ref: userId || invitationDetails.invitedUser?._id
          },
          competition: {
            _type: 'reference',
            _ref: invitationDetails.competition._id
          },
          horseName,
          gifts: []
        };

        await sanityClient.create(competitorDoc);

        // Check if this is the second competitor (first acceptance)
        const competitors = await sanityClient.fetch(
          `count(*[_type == "competitor" && competition == $competitionId])`,
          { competitionId: invitationDetails.competition._id }
        );

        // If we have 2 or more competitors, activate the competition
        if (competitors >= 2) {
          await sanityClient
            .patch(invitationDetails.competition._id)
            .set({ status: 'active' })
            .commit();
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      invitation: updatedInvitation,
      message: `Invitation ${status} successfully` 
    });
  } catch (error) {
    console.error('Error updating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to update invitation' },
      { status: 500 }
    );
  }
}

// GET - Get specific invitation by inviteLink
export async function GET(req, { params }) {
  try {
    const { id } = params; // This is actually the inviteLink code

    // Try to find invitation by the invite code (extracted from URL)
    let invitation = await sanityClient.fetch(
      `*[_type == "invitation" && inviteLink match "*${id}*"][0] {
        _id,
        status,
        inviteLink,
        competition->{
          _id,
          nameAr,
          nameEn,
          date,
          location,
          status,
          createdBy->{
            _id,
            userName,
            fullName,
            image
          }
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
      }`,
      { inviteLink: id }
    );

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or has expired' },
        { status: 404 }
      );
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    );
  }
} 