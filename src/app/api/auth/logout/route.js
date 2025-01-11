import { NextResponse } from 'next/server';

// Named export for POST method (Logout functionality)
export async function POST(req) {
  // Check if token exists in the cookies
  const token = req.cookies.get('token');

  if (!token) {
    return NextResponse.json({ message: 'No user is logged in.' }, { status: 400 });
  }

  // Create the response
  const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

  // Clear the token cookie by setting its expiration to a past date
  response.cookies.set('token', '', {
    httpOnly: true, // Prevent access from JavaScript
    secure: process.env.NODE_ENV === 'production', // Only set secure cookies in production
    sameSite: 'Strict', // Strict same-site policy for security
    path: '/', // Make the cookie available across the entire site
    expires: new Date(0), // Set the expiration date to a past time, effectively removing it
  });

  return response;
}
