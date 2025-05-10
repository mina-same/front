// /api/auth/login
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from 'next-sanity';
import { OAuth2Client } from 'google-auth-library';
import { NextResponse } from 'next/server';

const googleClient = new OAuth2Client({
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-01-01',
  useCdn: false,
});

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ message: 'Invalid JSON or empty body.' }, { status: 400 });
  }

  const { email, password, googleToken } = body;

  try {
    if (googleToken) {
      // Verify Google token
      const ticket = await googleClient.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const googleId = payload.sub;

      // Find user by googleId
      const user = await sanityClient.fetch(
        `*[_type == "user" && googleId == $googleId][0]`,
        { googleId }
      );

      if (!user) {
        return NextResponse.json(
          { message: 'No account found with this Google ID. Please sign up first.' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1d' }
      );

      const response = NextResponse.json(
        { message: 'Login successful with Google', userId: user._id },
        { status: 200 }
      );
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/',
        maxAge: 24 * 60 * 60,
      });

      return response;
    }

    // Email/Password Login
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const user = await sanityClient.fetch(`*[_type == "user" && email == $email][0]`, { email });

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({ message: 'Login successful', userId: user._id }, { status: 200 });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.', error: error.message }, { status: 500 });
  }
}