"use client";

import React from 'react';
import { useEffect, useState } from 'react';
import { Search, MapPin, Phone, Mail, ExternalLink, Trophy, User, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from 'components/layout/Layout';
import { client, urlFor } from '../../lib/sanity';

const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const query = `*[_type == "services" && serviceType == "competitions" && statusAdminApproved == true] {
          name_en,
          name_ar,
          about_en,
          about_ar,
          price,
          image,
          servicePhone,
          serviceEmail,
          links,
          competitions,
          country->{name_en},
          government->{name_en},
          city->{name_en}
        }`;

        const result = await client.fetch(query);
        setCompetitions(result);
      } catch (err) {
        console.error('Error fetching competitions:', err);
        setError('Failed to load competitions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  const filteredCompetitions = competitions.filter(competition =>
    competition.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    competition.name_ar.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRaceTypeLabel = (raceType) => {
    const types = {
      endurance_race: "Endurance Race",
      shooting_arrows: "Shooting Arrows",
      pickup_pegs: "Pickup Pegs",
      dressage: "Dressage"
    };
    return types[raceType] || raceType;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        {/* Hero Section */}
        <div className="relative h-64 bg-slate-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] bg-cover bg-center opacity-40" />
          </div>
          <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Horse Competitions</h1>
            <p className="text-lg md:text-xl text-center max-w-2xl">
              Discover and participate in prestigious equestrian competitions
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-7xl mx-auto px-4 -mt-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search competitions..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Competitions Grid */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredCompetitions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No competitions found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompetitions.map((competition, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={competition.image ? urlFor(competition.image).url() : '/api/placeholder/400/300'}
                      alt={competition.name_en}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{competition.name_en}</h3>
                        <p className="text-sm text-blue-600">
                          {getRaceTypeLabel(competition.competitions?.raceType)}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-blue-500">
                        ${competition.price}
                      </span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {competition.country?.name_en}, {competition.government?.name_en}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-600 line-clamp-3">{competition.about_en}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Trophy className="w-4 h-4" />
                          <span>Level: {competition.competitions?.level}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Award className="w-4 h-4" />
                          <span>Prize: {competition.competitions?.prize}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span>Organizer: {competition.competitions?.organiserName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{competition.servicePhone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{competition.serviceEmail}</span>
                        </div>
                        {competition.links && competition.links.length > 0 && (
                          <div className="flex items-center gap-2 text-blue-500">
                            <ExternalLink className="w-4 h-4" />
                            <a href={competition.links[0]} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              Competition Details
                            </a>
                          </div>
                        )}
                      </div>
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

export default CompetitionsPage;