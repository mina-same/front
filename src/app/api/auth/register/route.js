// /api/auth/register
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from 'next-sanity';
import { OAuth2Client } from 'google-auth-library';
import { NextResponse } from 'next/server';

const googleClient = new OAuth2Client({
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI, // e.g., 'http://localhost:3000/api/auth/callback'
});

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, userName, googleToken } = body;

    if (googleToken) {
      // Verify Google token
      const ticket = await googleClient.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const googleEmail = payload.email;
      const googleName = payload.name;
      const googleId = payload.sub;

      // Check if user exists by email or googleId
      const existingUser = await sanityClient.fetch(
        `*[_type == "user" && (email == $email || googleId == $googleId)][0]`,
        { email: googleEmail, googleId }
      );

      if (existingUser) {
        return NextResponse.json({ message: 'User already exists.' }, { status: 400 });
      }

      // Create user with Google data
      const user = await sanityClient.create({
        _type: 'user',
        email: googleEmail,
        userName: googleName || userName || googleEmail.split('@')[0],
        googleId,
        signupMethod: 'google',
        isEmailVerified: true, // Google verifies email automatically
      });

      // Generate JWT token for auto-login
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1d' }
      );

      const response = NextResponse.json(
        { message: 'User created successfully with Google.', userId: user._id },
        { status: 201 }
      );

      // Set token in cookie
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/',
        maxAge: 24 * 60 * 60,
      });

      return response;
    }

    // Email/Password Sign-Up
    if (!email || !password || !userName) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    const existingUser = await sanityClient.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await sanityClient.create({
      _type: 'user',
      email,
      password: hashedPassword,
      userName,
      signupMethod: 'email',
      isEmailVerified: false,
    });

    return NextResponse.json(
      { message: 'User created successfully. Please verify your email.', userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.', error: error.message }, { status: 500 });
  }
}