import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";

export async function POST(request) {
  try {
    console.log('🎁 Gift sending API called');
    const body = await request.json();
    console.log('📥 Request body:', body);
    
    const { competitorId, giftType, giftIcon, giftCost, giftedByUserId } = body;

    if (!competitorId || !giftType || !giftIcon || !giftCost || !giftedByUserId) {
      console.error('❌ Missing required fields:', { competitorId, giftType, giftIcon, giftCost, giftedByUserId });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log('✅ All required fields present');

    // OPTIMIZED: Get user and competitor data in parallel for faster response
    const [user, competitor] = await Promise.all([
      client.fetch(`*[_type == "user" && _id == $giftedByUserId][0]{
        _id,
        balance,
        fullName,
        name
      }`, { giftedByUserId }),
      
      client.fetch(`*[_type == "competitor" && _id == $competitorId][0]{
        _id,
        gifts[]{
          type,
          icon,
          cost,
          count,
          giftedBy
        }
      }`, { competitorId })
    ]);

    console.log('👤 User data:', user);
    console.log('🏇 Competitor data:', competitor);

    if (!user) {
      console.error('❌ User not found:', giftedByUserId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!competitor) {
      console.error('❌ Competitor not found:', competitorId);
      return NextResponse.json(
        { error: "Competitor not found" },
        { status: 404 }
      );
    }

    // Check if user has enough balance
    const currentBalance = user.balance || 0;
    console.log('💰 Current balance:', currentBalance, 'Gift cost:', giftCost);
    
    if (currentBalance < giftCost) {
      console.error('❌ Insufficient balance');
      return NextResponse.json(
        { 
          error: "Insufficient balance",
          currentBalance,
          requiredAmount: giftCost,
          shortfall: giftCost - currentBalance
        },
        { status: 400 }
      );
    }

    console.log('✅ Balance check passed');

    // Check if this gift type already exists for this competitor from this user
    const existingGiftIndex = competitor.gifts?.findIndex(gift => 
      gift.type === giftType && 
      gift.giftedBy._ref === giftedByUserId
    );

    console.log('🔍 Existing gift index:', existingGiftIndex);
    console.log('🎁 Current gifts:', competitor.gifts);

    let updatedGifts = [...(competitor.gifts || [])];

    if (existingGiftIndex !== -1 && existingGiftIndex !== undefined) {
      // Update existing gift count
      console.log('🔄 Updating existing gift');
      updatedGifts[existingGiftIndex] = {
        ...updatedGifts[existingGiftIndex],
        count: updatedGifts[existingGiftIndex].count + 1
      };
    } else {
      // Add new gift with a unique _key
      console.log('🆕 Adding new gift');
      const newGift = {
        _type: "object",
        _key: `${giftType}_${giftedByUserId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: giftType,
        icon: giftIcon,
        cost: giftCost,
        count: 1,
        giftedBy: {
          _type: "reference",
          _ref: giftedByUserId
        }
      };
      updatedGifts.push(newGift);
    }

    console.log('🎁 Updated gifts array:', updatedGifts);

    // Ensure all gifts have _key values
    updatedGifts = updatedGifts.map((gift, index) => {
      if (!gift._key) {
        return {
          ...gift,
          _key: `${gift.type}_${giftedByUserId}_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
        };
      }
      return gift;
    });

    console.log('🎁 Final gifts array with keys:', updatedGifts);

    // OPTIMIZED: Update competitor and user balance in parallel
    const newBalance = currentBalance - giftCost;
    console.log('💰 Updating user balance from', currentBalance, 'to', newBalance);
    
    const [updatedCompetitor, updatedUser] = await Promise.all([
      client
        .patch(competitorId)
        .set({
          gifts: updatedGifts
        })
        .commit(),
      
      client
        .patch(giftedByUserId)
        .set({
          balance: newBalance
        })
        .commit()
    ]);

    console.log('✅ Competitor updated:', updatedCompetitor);
    console.log('✅ User balance updated:', updatedUser);

    const response = { 
      success: true, 
      competitor: updatedCompetitor,
      user: updatedUser,
      deductedAmount: giftCost,
      newBalance: newBalance,
      message: "Gift sent successfully!"
    };

    console.log('🎉 Gift sending completed successfully:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ Error sending gift:", error);
    return NextResponse.json(
      { error: "Failed to send gift" },
      { status: 500 }
    );
  }
} 