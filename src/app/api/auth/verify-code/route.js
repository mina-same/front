import { createClient } from 'next-sanity';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Reuse the same sanitize function
const sanitizeId = (email) => {
  return `verification-${email.replace(/[^a-zA-Z0-9-]/g, '-')}`;
};

export async function POST(req) {
  try {
    const { email, code } = await req.json();
    const sanitizedId = sanitizeId(email);

    const storedCode = await sanityClient.fetch(
      `*[_type == "verificationCode" && _id == $id][0]`,
      { id: sanitizedId }
    );

    if (!storedCode || storedCode.code !== code || new Date(storedCode.expires) < new Date()) {
      return new Response(JSON.stringify({ message: 'Invalid or expired code' }), { status: 400 });
    }

    // Fetch user to return userId
    const user = await sanityClient.fetch(
      `*[_type == "user" && email == $email][0]{_id}`,
      { email }
    );

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    // Delete the used code
    await sanityClient.delete(sanitizedId);

    return new Response(JSON.stringify({ userId: user._id }), { status: 200 });
  } catch (error) {
    console.error('Error in verify-code:', error.message, error.stack);
    return new Response(JSON.stringify({ message: 'Failed to verify code', error: error.message }), { status: 500 });
  }
}