"use client";

import React, { useEffect, useState } from 'react';
import { Search, MapPin, Phone, Mail, ExternalLink, Calendar, Users, Star, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from 'components/layout/Layout';
import Preloader from 'components/elements/Preloader';
import { client, urlFor } from '../../../lib/sanity'; // Import Sanity client and urlFor
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const TripCoordinatorPage = () => {
  const [tripCoordinators, setTripCoordinators] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const route = useRouter();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchTripCoordinators = async () => {
      try {
        const query = `*[_type == "services" && serviceType == "trip_coordinator" && statusAdminApproved == true] {
          _id,
          name_en,
          name_ar,
          about_en,
          about_ar,
          price,
          images,
          country->{name_en, name_ar},
          government->{name_en, name_ar},
          servicePhone,
          serviceEmail,
          links,
          tripCoordinator
        }`;

        const result = await client.fetch(query);
        setTripCoordinators(result);
      } catch (err) {
        console.error('Error fetching trip coordinators:', err);
        setError(t('servicesPage:tripCoordinators.errorMessage'));
      } finally {
        setLoading(false);
      }
    };

    fetchTripCoordinators();
  }, [t]);

  const filteredTripCoordinators = tripCoordinators.filter(coordinator =>
    coordinator.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coordinator.name_ar.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isArabic = i18n.language === 'ar';

  // Function to get image URL with fallback
  const getImageUrl = (coordinator) => {
    console.log('Coordinator images:', coordinator.images);
    // Try service images array first
    if (coordinator.images && coordinator.images.length > 0) {
      const imageUrl = urlFor(coordinator.images[0]).url();
      console.log('Generated image URL:', imageUrl);
      return imageUrl;
    }
    // Use placeholder if no images
    console.log('Using placeholder image');
    return '/assets/imgs/placeholders/Couple-horses.jpeg';
  };

  // Function to get difficulty level color
  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'difficult':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Layout>
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 ${isArabic ? 'rtl' : 'ltr'}`}>
        {/* Hero Section */}
        <div className="relative h-80 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-black opacity-20" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
          </div>
          <div className="relative h-full flex flex-col items-center justify-center text-white px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              {t('servicesPage:tripCoordinators.heroTitle')}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl leading-relaxed">
              {t('servicesPage:tripCoordinators.heroDescription')}
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
          <div className="relative">
            <Search className={`absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              type="text"
              placeholder={t('servicesPage:tripCoordinators.searchPlaceholder')}
              className={`w-full ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl border-0 shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg bg-white/90 backdrop-blur-sm`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          {loading ? (
            <Preloader />
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                <p className="text-red-600 text-lg">{error}</p>
              </div>
            </div>
          ) : filteredTripCoordinators.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-md mx-auto">
                <p className="text-gray-600 text-lg">{t('servicesPage:tripCoordinators.noTripCoordinatorsMessage')}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTripCoordinators.map((coordinator, index) => (
                <Card 
                  key={index} 
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm overflow-hidden relative"
                  onClick={() => route.push(`/services/${coordinator._id.replace('drafts.', '')}`)}
                >
                  {/* Image Section */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={getImageUrl(coordinator)}
                      alt={isArabic ? coordinator.name_ar : coordinator.name_en}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      width={400}
                      height={256}
                      priority={index < 6}
                      onError={(e) => {
                        console.log('Image failed to load, using placeholder');
                        e.target.src = '/assets/imgs/placeholders/Couple-horses.jpeg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                      <span className="text-lg font-bold text-blue-600">
                        {coordinator.price} SAR
                      </span>
                    </div>

                    {/* Location Badge */}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {isArabic 
                            ? `${coordinator.country?.name_ar}, ${coordinator.government?.name_ar}` 
                            : `${coordinator.country?.name_en}, ${coordinator.government?.name_en}`
                          }
                        </span>
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-all duration-300" />
                  </div>

                  {/* Content Section */}
                  <CardHeader className="pb-4">
                    <CardTitle className={`text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors ${isArabic ? 'text-right' : ''}`}>
                      {isArabic ? coordinator.name_ar : coordinator.name_en}
                    </CardTitle>
                    <CardDescription className={`text-gray-600 line-clamp-2 ${isArabic ? 'text-right' : ''}`}>
                      {isArabic ? coordinator.about_ar : coordinator.about_en}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Trip Details */}
                    {coordinator.tripCoordinator && (
                      <div className="space-y-4">
                        {/* Key Info Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {coordinator.tripCoordinator.startDate && coordinator.tripCoordinator.endDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <span>{formatDate(coordinator.tripCoordinator.startDate)}</span>
                            </div>
                          )}
                          
                          {coordinator.tripCoordinator.levelOfHardship && (
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-orange-500" />
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(coordinator.tripCoordinator.levelOfHardship)}`}>
                                {coordinator.tripCoordinator.levelOfHardship}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Family Prices */}
                        {(coordinator.tripCoordinator.priceForFamilyOf2 || coordinator.tripCoordinator.priceForFamilyOf3 || coordinator.tripCoordinator.priceForFamilyOf4) && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              Family Packages
                            </h4>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              {coordinator.tripCoordinator.priceForFamilyOf2 && (
                                <div className="text-center bg-white rounded-lg p-2 shadow-sm">
                                  <div className="font-bold text-blue-600">2 People</div>
                                  <div className="text-gray-600">{coordinator.tripCoordinator.priceForFamilyOf2} SAR</div>
                                </div>
                              )}
                              {coordinator.tripCoordinator.priceForFamilyOf3 && (
                                <div className="text-center bg-white rounded-lg p-2 shadow-sm">
                                  <div className="font-bold text-blue-600">3 People</div>
                                  <div className="text-gray-600">{coordinator.tripCoordinator.priceForFamilyOf3} SAR</div>
                                </div>
                              )}
                              {coordinator.tripCoordinator.priceForFamilyOf4 && (
                                <div className="text-center bg-white rounded-lg p-2 shadow-sm">
                                  <div className="font-bold text-blue-600">4 People</div>
                                  <div className="text-gray-600">{coordinator.tripCoordinator.priceForFamilyOf4} SAR</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Contact Info */}
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          {coordinator.servicePhone && (
                            <div className={`flex items-center gap-2 text-sm text-gray-600 ${isArabic ? 'flex-row-reverse' : ''}`}>
                              <Phone className="w-4 h-4 text-green-500" />
                              <span className="truncate">{coordinator.servicePhone}</span>
                            </div>
                          )}
                          {coordinator.serviceEmail && (
                            <div className={`flex items-center gap-2 text-sm text-gray-600 ${isArabic ? 'flex-row-reverse' : ''}`}>
                              <Mail className="w-4 h-4 text-blue-500" />
                              <span className="truncate">{coordinator.serviceEmail}</span>
                            </div>
                          )}
                        </div>

                        {/* CTA Button */}
                        <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                          View Details
                        </button>
                      </div>
                    )}
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
