import { createClient } from 'next-sanity';
import { NextResponse } from 'next/server';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// GET - Fetch competitions
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const countryId = searchParams.get('countryId');
    const governorateId = searchParams.get('governorateId');
    const cityId = searchParams.get('cityId');

    let query = `*[_type == "competition"`;
    
    if (status) {
      query += ` && status == $status`;
    }
    
    if (userId) {
      query += ` && createdBy == $userId`;
    }

    if (countryId) {
      query += ` && country._ref == $countryId`;
    }
    if (governorateId) {
      query += ` && government._ref == $governorateId`;
    }
    if (cityId) {
      query += ` && city._ref == $cityId`;
    }
    
    query += `] {
      _id,
      nameAr,
      nameEn,
      image,
      date,
      location,
      addressDetails,
      liveLink,
      about,
      status,
      country->{ _id, name_en, name_ar },
      government->{ _id, name_en, name_ar },
      city->{ _id, name_en, name_ar },
      createdBy->{
        _id,
        userName,
        fullName,
        image
      }
    } | order(date desc)`;

    const competitions = await sanityClient.fetch(query, { status, userId, countryId, governorateId, cityId });
    
    return NextResponse.json({ competitions });
  } catch (error) {
    console.error('Error fetching competitions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitions' },
      { status: 500 }
    );
  }
}

// POST - Create new competition
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      nameAr,
      nameEn,
      date,
      time,
      address,
      locationLink,
      streamLink,
      about,
      createdBy,
      horseName,
      surpriseHorseName,
      competitionImage,
      country,
      governorate,
      city
    } = body;

    // Combine date and time
    const dateTime = new Date(`${date}T${time}`).toISOString();

    // Handle image upload if provided
    let imageAsset = null;
    if (competitionImage && competitionImage.base64) {
      try {
        // Upload image to Sanity
        const imageBuffer = Buffer.from(competitionImage.base64, 'base64');
        const uploadedAsset = await sanityClient.assets.upload('image', imageBuffer, {
          filename: competitionImage.name,
          contentType: competitionImage.type
        });
        
        imageAsset = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: uploadedAsset._id
          }
        };
      } catch (imageError) {
        console.error('Error uploading image:', imageError);
        // Continue without image if upload fails
      }
    }

    // Create competition document with proper field mapping
    const competitionDoc = {
      _type: 'competition',
      nameAr,
      nameEn,
      date: dateTime,
      location: locationLink || address || '', // Use locationLink or address
      addressDetails: address || '',
      liveLink: streamLink || '',
      about: about || '',
      status: 'draft',
      createdBy: {
        _type: 'reference',
        _ref: createdBy
      }
    };

    // Location references if provided
    if (country) {
      competitionDoc.country = {
        _type: 'reference',
        _ref: typeof country === 'string' ? country : country._ref || country,
      };
    }
    if (governorate) {
      // Field name is 'government' in schema (reference to 'governorate')
      competitionDoc.government = {
        _type: 'reference',
        _ref: typeof governorate === 'string' ? governorate : governorate._ref || governorate,
      };
    }
    if (city) {
      competitionDoc.city = {
        _type: 'reference',
        _ref: typeof city === 'string' ? city : city._ref || city,
      };
    }

    // Only add image field if we have an image asset
    if (imageAsset) {
      competitionDoc.image = imageAsset;
    }

    const competition = await sanityClient.create(competitionDoc);

    // Create competitor entry for the creator
    const competitorDoc = {
      _type: 'competitor',
      user: {
        _type: 'reference',
        _ref: createdBy
      },
      competition: {
        _type: 'reference',
        _ref: competition._id
      },
      horseName: horseName || 'Default Horse',
      surpriseHorseName: surpriseHorseName || '',
      activeHorse: 'main',
      gifts: []
    };

    await sanityClient.create(competitorDoc);

    return NextResponse.json({ 
      success: true, 
      competition,
      message: 'Competition created successfully' 
    });
  } catch (error) {
    console.error('Error creating competition:', error);
    return NextResponse.json(
      { error: 'Failed to create competition' },
      { status: 500 }
    );
  }
} 