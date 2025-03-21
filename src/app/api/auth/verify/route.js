import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, message: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return NextResponse.json({ authenticated: true, user: decoded }, { status: 200 });
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 401 });
  }
}