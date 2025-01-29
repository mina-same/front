"use client";

import React from 'react';
import { useEffect, useState } from 'react';
import { Search, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from 'components/layout/Layout';
import { client, urlFor } from '../../lib/sanity'; // Import Sanity client and urlFor

const TripCoordinatorPage = () => {
  const [tripCoordinators, setTripCoordinators] = useState([]); // State to store fetched trip coordinators
  const [searchQuery, setSearchQuery] = useState(''); // State for search functionality
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  // Fetch trip coordinators from Sanity
  useEffect(() => {
    const fetchTripCoordinators = async () => {
      try {
        // Define the query to fetch trip coordinators
        const query = `*[_type == "services" && serviceType == "trip_coordinator" && statusAdminApproved == true] {
          name_en,
          name_ar,
          about_en,
          about_ar,
          price,
          image,
          country->{name_en, name_ar},
          government->{name_en, name_ar},
          servicePhone,
          serviceEmail,
          links,
          tripCoordinator
        }`;

        // Fetch data from Sanity
        const result = await client.fetch(query);

        // Update the tripCoordinators state with the fetched data
        setTripCoordinators(result);
      } catch (err) {
        // Handle errors
        console.error('Error fetching trip coordinators:', err);
        setError('Failed to load trip coordinators. Please try again later.');
      } finally {
        // Set loading to false after the operation is complete
        setLoading(false);
      }
    };

    fetchTripCoordinators();
  }, []);

  // Filter trip coordinators based on search query
  const filteredTripCoordinators = tripCoordinators.filter(coordinator =>
    coordinator.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coordinator.name_ar.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Trip Coordinator Services</h1>
            <p className="text-lg md:text-xl text-center max-w-2xl">
              Expert coordination for your horse trips and adventures
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-7xl mx-auto px-4 -mt-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search trip coordinators..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Trip Coordinators Grid */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredTripCoordinators.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No trip coordinators found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTripCoordinators.map((coordinator, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={coordinator.image ? urlFor(coordinator.image).url() : '/api/placeholder/400/300'}
                      alt={coordinator.name_en}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{coordinator.name_en}</h3>
                      </div>
                      <span className="text-lg font-bold text-blue-500">
                        ${coordinator.price}/month
                      </span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {coordinator.country?.name_en}, {coordinator.government?.name_en}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">{coordinator.about_en}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{coordinator.servicePhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{coordinator.serviceEmail}</span>
                      </div>
                      {coordinator.links && coordinator.links.length > 0 && (
                        <div className="flex items-center gap-2 text-blue-500">
                          <ExternalLink className="w-4 h-4" />
                          <a href={coordinator.links[0]} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Visit Website
                          </a>
                        </div>
                      )}
                      {/* Display Trip Coordinator Details */}
                      {coordinator.tripCoordinator && (
                        <div className="space-y-2">
                          <p className="text-gray-600">
                            <span className="font-semibold">Location of Horses:</span> {coordinator.tripCoordinator.locationOfHorses}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Location of Tent:</span> {coordinator.tripCoordinator.locationOfTent}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Start Date:</span> {new Date(coordinator.tripCoordinator.startDate).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">End Date:</span> {new Date(coordinator.tripCoordinator.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Break Times:</span> {coordinator.tripCoordinator.breakTimes}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Meals:</span>
                            <ul>
                              {coordinator.tripCoordinator.meals.map((meal, idx) => (
                                <li key={idx}>{meal.mealType}: {meal.mealDescription}</li>
                              ))}
                            </ul>
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Contains Aid Bag:</span> {coordinator.tripCoordinator.containsAidBag ? 'Yes' : 'No'}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Activities:</span> {coordinator.tripCoordinator.activities}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Price for Family of 2:</span> ${coordinator.tripCoordinator.priceForFamilyOf2}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Price for Family of 3:</span> ${coordinator.tripCoordinator.priceForFamilyOf3}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Price for Family of 4:</span> ${coordinator.tripCoordinator.priceForFamilyOf4}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Trip Program:</span> {coordinator.tripCoordinator.tripProgram}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Level of Hardship:</span> {coordinator.tripCoordinator.levelOfHardship}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Conditions & Requirements:</span> {coordinator.tripCoordinator.conditionsAndRequirements}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Safety & Equipment:</span> {coordinator.tripCoordinator.safetyAndEquipment}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Cancellation & Refund Policy:</span> {coordinator.tripCoordinator.cancellationAndRefundPolicy}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">More Details:</span> {coordinator.tripCoordinator.moreDetails}
                          </p>
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

export default TripCoordinatorPage;