// app/api/upload/route.js
import { createClient } from '@sanity/client';
import { NextResponse } from 'next/server';

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2023-01-01',
    token: process.env.SANITY_API_TOKEN, // Server-side token with write permissions
    useCdn: false,
});

export async function POST(request) {
    try {
        const formData = await request.formData();
        const imageFile = formData.get('image');
        const userId = formData.get('userId');
        const userType = formData.get('userType');
        const phone = formData.get('phone');

        if (!imageFile || !userId || !userType || !phone) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Upload image to Sanity
        const imageAsset = await client.assets.upload('image', imageFile, {
            filename: imageFile.name
        });

        // Update user document
        await client
            .patch(userId)
            .set({
                userType: userType,
                phoneNumber: phone,
                image: {
                    _type: 'image',
                    asset: {
                        _type: "reference",
                        _ref: imageAsset._id
                    }
                },
                isProfileCompleted: true
            })
            .commit();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        );
    }
}