import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const query = `*[_type == "competition" && _id == $id][0]{
      _id,
      nameEn,
      nameAr,
      about,
      date,
      location,
      addressDetails,
      liveLink,
      image,
      status,
      country->{ _id, name_en, name_ar },
      government->{ _id, name_en, name_ar },
      city->{ _id, name_en, name_ar },
      createdBy->{
        _id,
        name,
        email
      },
      createdAt
    }`;

    const competition = await client.fetch(query, { id });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ competition });
  } catch (error) {
    console.error("Error fetching competition:", error);
    return NextResponse.json(
      { error: "Failed to fetch competition" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if competition exists and user is the creator
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
        { error: "Only the competition creator can edit it" },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData = {};
    if (updates.nameEn !== undefined) updateData.nameEn = updates.nameEn;
    if (updates.nameAr !== undefined) updateData.nameAr = updates.nameAr;
    if (updates.about !== undefined) updateData.about = updates.about;
    if (updates.liveLink !== undefined) updateData.liveLink = updates.liveLink;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.addressDetails !== undefined) updateData.addressDetails = updates.addressDetails;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update the competition
    const updatedCompetition = await client.patch(id).set(updateData).commit();

    return NextResponse.json({ 
      success: true, 
      competition: updatedCompetition,
      message: "Competition updated successfully" 
    });
  } catch (error) {
    console.error("Error updating competition:", error);
    return NextResponse.json(
      { error: "Failed to update competition" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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

    // Check if competition exists and user is the creator
    const competition = await client.fetch(`*[_type == "competition" && _id == $id][0]{
      _id,
      createdBy->{ _id },
      status
    }`, { id });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    if (competition.createdBy._id !== userId) {
      return NextResponse.json(
        { error: "Only the competition creator can delete it" },
        { status: 403 }
      );
    }

    // Check if any gifts have been sent to this competition
    const competitors = await client.fetch(`*[_type == "competitor" && competition._ref == $id]{
      _id,
      gifts[]{
        count
      }
    }`, { id });

    const hasGifts = competitors.some(competitor => 
      competitor.gifts && competitor.gifts.some(gift => gift.count > 0)
    );

    if (hasGifts) {
      return NextResponse.json(
        { error: "Cannot delete competition after gifts have been sent" },
        { status: 400 }
      );
    }

    // Delete all related documents first
    // Delete competitors
    await client.delete({
      query: `*[_type == "competitor" && competition._ref == $id]`
    }, { id });

    // Delete invitations
    await client.delete({
      query: `*[_type == "invitation" && competition._ref == $id]`
    }, { id });

    // Delete the competition
    await client.delete(id);

    return NextResponse.json({ 
      success: true, 
      message: "Competition deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting competition:", error);
    return NextResponse.json(
      { error: "Failed to update competition" },
      { status: 500 }
    );
  }
} 