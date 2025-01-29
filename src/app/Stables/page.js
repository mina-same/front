"use client";

import React from 'react';
import { useEffect, useState } from 'react';
import { Search, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from 'components/layout/Layout';
import { client, urlFor } from '../../lib/sanity'; // Import Sanity client and urlFor
import { useRouter } from 'next/navigation'; 

const HorseStablesPage = () => {
  const [stables, setStables] = useState([]); // State to store fetched stables
  const [searchQuery, setSearchQuery] = useState(''); // State for search functionality
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling
  const route = useRouter();

  // Fetch horse stables from Sanity
  useEffect(() => {
    const fetchStables = async () => {
      try {
        // Define the query to fetch horse stables
        const query = `*[_type == "services" && serviceType == "horse_stable" && statusAdminApproved == true] {
          _id,
          name_en,
          name_ar,
          about_en,
          about_ar,
          price,
          image,
          location,
          servicePhone,
          serviceEmail,
          links
        }`;

        // Fetch data from Sanity
        const result = await client.fetch(query);

        // Update the stables state with the fetched data
        setStables(result);
      } catch (err) {
        // Handle errors
        console.error('Error fetching horse stables:', err);
        setError('Failed to load horse stables. Please try again later.');
      } finally {
        // Set loading to false after the operation is complete
        setLoading(false);
      }
    };

    fetchStables();
  }, []);

  // Filter stables based on search query
  const filteredStables = stables.filter(stable =>
    stable.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stable.name_ar.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        {/* Hero Section */}
        <div className="relative h-64 bg-slate-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] bg-cover bg-center opacity-40" />
          </div>
          <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Premium Horse Stables</h1>
            <p className="text-lg md:text-xl text-center max-w-2xl">
              Discover the finest equestrian facilities for your beloved horses
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-7xl mx-auto px-4 -mt-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search stables..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
        </div>

        {/* Stables Grid */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredStables.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No stables found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStables.map((stable, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300" onClick={() => route.push(`/${stable._id}`)}>
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={stable.image ? urlFor(stable.image).url() : '/api/placeholder/400/300'}
                      alt={stable.name_en}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{stable.name_en}</h3>
                      </div>
                      <span className="text-lg font-bold text-blue-500">
                        ${stable.price}/month
                      </span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {stable.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">{stable.about_en}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{stable.servicePhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{stable.serviceEmail}</span>
                      </div>
                      {stable.links && stable.links.length > 0 && (
                        <div className="flex items-center gap-2 text-blue-500">
                          <ExternalLink className="w-4 h-4" />
                          <a href={stable.links[0]} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HorseStablesPage;