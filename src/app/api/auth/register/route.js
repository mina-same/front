import bcrypt from 'bcryptjs';
import { createClient } from 'next-sanity';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Needs write access
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, userName } = body;

    if (!email || !password || !userName) {
      return new Response(JSON.stringify({ message: 'All fields are required.' }), { status: 400 });
    }

    // Check if user exists
    const existingUser = await sanityClient.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );
    if (existingUser) {
      return new Response(JSON.stringify({ message: 'User already exists.' }), { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await sanityClient.create({
      _type: 'user',
      email,
      password: hashedPassword,
      userName,
    });

    return new Response(JSON.stringify({ message: 'User created successfully.', user }), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal server error.', error }), { status: 500 });
  }
}
