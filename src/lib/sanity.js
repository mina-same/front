import { createClient } from '@sanity/client';

export const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2023-01-01',
    token: process.env.SANITY_API_TOKEN, // Optional if you need to authenticate
    useCdn: false, // Use CDN in production for faster queries
});

export default client;
