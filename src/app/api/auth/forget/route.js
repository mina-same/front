import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { client } from '../../../../lib/sanity';

const JWT_SECRET = process.env.JWT_SECRET_KEY;
const NODEMAILER_USER = process.env.NODEMAILER_USER;
const NODEMAILER_PASS = process.env.NODEMAILER_PASS;

export async function POST(req) {
  try {
    const { email } = await req.json();

    // Check if the email exists in the database (Sanity)
    const user = await client.fetch(`*[_type == "user" && email == "${email}"]`);
    
    if (user.length === 0) {
      return new Response(
        JSON.stringify({ message: 'User not found' }), 
        { status: 400 }
      );
    }

    // Generate a reset token that expires in 1 hour
    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

    // Send an email with the reset link
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: NODEMAILER_USER,
        pass: NODEMAILER_PASS,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: NODEMAILER_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `Click the link to reset your password: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);
    return new Response(
      JSON.stringify({ message: 'Password reset link sent' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return new Response(
      JSON.stringify({ message: 'Error processing request' }),
      { status: 500 }
    );
  }
}