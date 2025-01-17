import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;

    // If there's no token, user is not authenticated
    if (!token) {   
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // If verification is successful, user is authenticated
    return NextResponse.json({ authenticated: true, user: decoded }, { status: 200 });
  } catch (error) {
    // If token verification fails, user is not authenticated
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 401 });
  }
}
