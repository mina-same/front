import { createClient } from 'next-sanity';
import nodemailer from 'nodemailer';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const sanitizeId = (email) => {
  return `verification-${email.replace(/[^a-zA-Z0-9-]/g, '-')}`;
};

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ message: 'Email is required' }), { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const sanitizedId = sanitizeId(email);

    await sanityClient.createOrReplace({
      _id: sanitizedId,
      _type: 'verificationCode',
      email,
      code,
      expires: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
    console.log(`Verification code ${code} stored for ${email} with ID ${sanitizedId}`);

    console.log('VERVECTION_USER:', process.env.VERVECTION_USER);
    console.log('VERVECTION_PASS:', process.env.VERVECTION_PASS);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.VERVECTION_USER,
        pass: process.env.VERVECTION_PASS,
      },
    });

    await transporter.verify();
    console.log('SMTP connection verified');

    // Enhanced HTML email template
    const htmlEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>cantrot Horses - Verification Code</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #eaeaea;
          }
          .logo {
            max-width: 200px;
            height: auto;
          }
          .content {
            padding: 30px 20px;
            text-align: center;
          }
          .verification-code {
            font-size: 32px;
            font-weight: bold;
            color: #4a6741;
            letter-spacing: 4px;
            background-color: #f5f7f5;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            display: inline-block;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #777;
            font-size: 14px;
            border-top: 1px solid #eaeaea;
          }
          .note {
            font-size: 14px;
            color: #888;
            margin-top: 30px;
          }
          h1 {
            color: #4a6741;
            margin-bottom: 20px;
          }
          p {
            margin-bottom: 15px;
          }
          .highlight {
            color: #4a6741;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>cantrot Horses</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for choosing cantrot Horses. To complete your registration, please use the verification code below:</p>
            <div class="verification-code">${code}</div>
            <p>This code is valid for <span class="highlight">15 minutes</span> and can only be used once.</p>
            <p>If you didn't request this code, please disregard this email.</p>
            <div class="note">
              <p>For assistance, please contact our support team.</p>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} cantrot Horses. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: {
        name: 'cantrot Horses',
        address: process.env.VERVECTION_USER
      },
      to: email,
      subject: 'cantrot Horses - Your Verification Code',
      text: `Your cantrot Horses verification code is: ${code}\n\nThis code is valid for 15 minutes.\n\nIf you didn't request this code, please disregard this email.`,
      html: htmlEmail
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully. Message ID:', info.messageId);
    console.log('SMTP response:', info.response);

    return new Response(JSON.stringify({ message: 'Code sent' }), { status: 200 });
  } catch (error) {
    console.error('Error in send-verification:', error.message, error.stack);
    return new Response(JSON.stringify({ message: 'Failed to send code', error: error.message }), { status: 500 });
  }
}