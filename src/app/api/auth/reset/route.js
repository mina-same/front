// src/app/api/auth/reset/route.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { client } from '../../../../lib/sanity';

const JWT_SECRET = process.env.JWT_SECRET_KEY;

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    // Verify the reset token
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // First find the user document
    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );

    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found' }),
        { status: 404 }
      );
    }

    // Update the user's password
    await client
      .patch(user._id)  // Use the document ID
      .set({ password: hashedPassword })
      .commit();

    return new Response(
      JSON.stringify({ message: 'Password reset successful' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return new Response(
        JSON.stringify({ message: 'Invalid or expired token' }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ message: 'An error occurred while resetting password' }),
      { status: 500 }
    );
  }
}