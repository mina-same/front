import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from 'next-sanity';
import { NextResponse } from 'next/server';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-01-01',
  useCdn: false,
});

// Named export for POST method
export async function POST(req) {
  // Check if the request body is empty or malformed
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ message: 'Invalid JSON or empty body.' }, { status: 400 });
  }

  const { email, password } = body;

  // Check if email and password are provided
  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
  }

  try {
    // Fetch the user from the database based on email
    const user = await sanityClient.fetch(`*[_type == "user" && email == $email][0]`, { email });

    // If user doesn't exist or password doesn't match, return an error
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1d' }
    );

    // Create the response
    const response = NextResponse.json({ message: 'Login successful', userId: user._id }, { status: 200 });
    console.log("user login id", user._id);

    // Set the token in the HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true, // Prevent access from JavaScript
      secure: process.env.NODE_ENV === 'production', // Only set secure cookies in production
      sameSite: 'Strict', // Strict same-site policy for security
      path: '/', // Make the cookie available across the entire site
      maxAge: 24 * 60 * 60, // 1 day expiration
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.', error }, { status: 500 });
  }
}
