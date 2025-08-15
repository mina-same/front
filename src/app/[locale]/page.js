import { groq } from 'next-sanity';
import { client } from '../../../src/lib/sanity';
import HomeClient from '@/components/HomeClient';

export default async function Home({ params }) {
  const locale = params?.locale || params.locale;

  // Fetch data from Sanity
  const query = groq`{
    "horses": count(*[_type == "horse"]),
    "services": count(*[_type == "provider"]),
    "products": count(*[_type == "product"]),
    "books": count(*[_type == "book"]),
    "courses": count(*[_type == "course"])
  }`;

  let statsData;
  try {
    const data = await client.fetch(query, {}, { next: { revalidate: 3600 } });
    statsData = {
      horses: data.horses || 0,
      services: data.services || 0,
      products: data.products || 0,
      educationalServices: (data.books || 0) + (data.courses || 0),
    };
  } catch (error) {
    console.error('Error fetching stats from Sanity:', error);
    statsData = {
      horses: 0,
      services: 0,
      products: 0,
      educationalServices: 0,
    };
  }

  return <HomeClient locale={locale} statsData={statsData} />;
}

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'ar' },
    // Add other supported locales as needed
  ];
}