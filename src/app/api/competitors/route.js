import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get('competitionId');

    if (!competitionId) {
      return NextResponse.json(
        { error: "Competition ID is required" },
        { status: 400 }
      );
    }

    // Fetch real competitors from Sanity with resolved image URLs
    const query = `*[_type == "competitor" && competition._ref == $competitionId]{
      _id,
      horseName,
      surpriseHorseName,
      activeHorse,
      user->{
        _id,
        name,
        fullName,
        "imageUrl": image.asset->url,
        userName
      },
      gifts[]{
        type,
        icon,
        cost,
        count,
        giftedBy->{
          _id,
          name,
          fullName
        }
      }
    }`;

    const competitors = await client.fetch(query, { competitionId });

    // Transform the data to match the expected format
    const transformedCompetitors = competitors.map((competitor, index) => {
      // Calculate total gifts value
      const totalGifts = competitor.gifts?.reduce((sum, gift) => sum + (gift.cost * gift.count), 0) || 0;
      
      // Group gifts by type and count them
      const giftCounts = {};
      competitor.gifts?.forEach(gift => {
        if (!giftCounts[gift.type]) {
          giftCounts[gift.type] = {
            type: gift.type,
            icon: gift.icon,
            cost: gift.cost,
            count: 0,
            _key: gift._key || `${gift.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
        }
        giftCounts[gift.type].count += gift.count;
      });

      const giftsArray = Object.values(giftCounts).map((gift, index) => ({
        ...gift,
        _key: gift._key || `${gift.type}_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));

      // Use user's image, fallback to user's name for avatar generation
      const userImage = competitor.user?.imageUrl;
      const fallbackAvatar = userImage ? null : `https://ui-avatars.com/api/?name=${encodeURIComponent(competitor.user?.fullName || competitor.user?.name || "Unknown")}&size=300&background=e5e7eb&color=374151`;

      return {
        id: competitor._id,
        name: competitor.user?.fullName || competitor.user?.name || "Unknown Rider",
        horseName: competitor.horseName,
        surpriseHorseName: competitor.surpriseHorseName,
        activeHorse: competitor.activeHorse || 'main',
        image: userImage || fallbackAvatar,
        totalGifts: totalGifts,
        rank: index + 1, // Simple ranking based on order
        streak: Math.floor(Math.random() * 5) + 1, // Mock streak for now
        level: Math.floor(Math.random() * 50) + 1, // Mock level for now
        xp: Math.floor(Math.random() * 10000) + 1000, // Mock XP for now
        country: "🇦🇪", // Mock country for now
        title: getRandomTitle(), // Mock title for now
        powerLevel: Math.floor(Math.random() * 5000) + 5000, // Mock power level for now
        gifts: giftsArray // Only real gifts from database, no default gifts
      };
    });

    // Sort by total gifts (highest first) and update ranks
    transformedCompetitors.sort((a, b) => b.totalGifts - a.totalGifts);
    transformedCompetitors.forEach((competitor, index) => {
      competitor.rank = index + 1;
    });

    return NextResponse.json({ competitors: transformedCompetitors });
  } catch (error) {
    console.error("Error fetching competitors:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitors" },
      { status: 500 }
    );
  }
}

// PATCH - Update competitor (owner can switch active horse or set surprise horse) before competition starts
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { competitorId, surpriseHorseName, activeHorse } = body;

    if (!competitorId) {
      return NextResponse.json({ error: 'competitorId is required' }, { status: 400 });
    }

    // Fetch competitor and competition date
    const competitor = await client.fetch(`*[_type == "competitor" && _id == $id][0]{
      _id,
      horseName,
      surpriseHorseName,
      activeHorse,
      competition-> { _id, date }
    }`, { id: competitorId });

    if (!competitor) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 });
    }

    // Ensure competition hasn't started yet
    const now = new Date();
    const compDate = competitor.competition?.date ? new Date(competitor.competition.date) : null;
    if (!compDate || now >= compDate) {
      return NextResponse.json({ error: 'Cannot edit after competition start' }, { status: 400 });
    }

    const patch = {};
    if (typeof surpriseHorseName === 'string') patch.surpriseHorseName = surpriseHorseName;
    if (activeHorse === 'main' || activeHorse === 'surprise') patch.activeHorse = activeHorse;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updated = await client.patch(competitorId).set(patch).commit();
    return NextResponse.json({ success: true, competitor: updated });
  } catch (error) {
    console.error('Error updating competitor:', error);
    return NextResponse.json({ error: 'Failed to update competitor' }, { status: 500 });
  }
}

// Helper function to generate random titles
function getRandomTitle() {
  const titles = [
    "Storm Rider",
    "Golden Champion", 
    "Desert Warrior",
    "Arabian Knight",
    "Royal Rider",
    "Elite Competitor",
    "Champion Rider",
    "Victory Seeker"
  ];
  return titles[Math.floor(Math.random() * titles.length)];
} 