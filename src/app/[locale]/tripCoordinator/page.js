"use client";

import React, { useEffect, useState } from 'react';
import { Search, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from 'components/layout/Layout';
import { client, urlFor } from '../../../lib/sanity'; // Import Sanity client and urlFor
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

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
        const query = `*[_type == "services" && serviceType == "trip_coordinator" && statusAdminApproved == true && isMainService == true] {
          _id,
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

  return (
    <Layout>
      <div className={`min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 ${isArabic ? 'rtl' : 'ltr'}`}>
        <div className="relative h-64 bg-slate-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] bg-cover bg-center opacity-40" />
          </div>
          <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('servicesPage:tripCoordinators.heroTitle')}</h1>
            <p className="text-lg md:text-xl text-center max-w-2xl">
              {t('servicesPage:tripCoordinators.heroDescription')}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-8">
          <div className="relative">
            <Search className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} />
            <input
              type="text"
              placeholder={t('servicesPage:tripCoordinators.searchPlaceholder')}
              className={`w-full ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

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
              <p className="text-gray-500">{t('servicesPage:tripCoordinators.noTripCoordinatorsMessage')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTripCoordinators.map((coordinator, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300" onClick={() => route.push(`/${coordinator._id}`)}>
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={coordinator.image ? urlFor(coordinator.image).url() : '/api/placeholder/400/300'}
                      alt={isArabic ? coordinator.name_ar : coordinator.name_en}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className={`flex justify-between items-start ${isArabic ? 'flex-row-reverse' : ''}`}>
                      <div>
                        <h3 className="text-xl font-semibold">{isArabic ? coordinator.name_ar : coordinator.name_en}</h3>
                      </div>
                      <span className="text-lg font-bold text-blue-500">
                        ${coordinator.price}/month
                      </span>
                    </CardTitle>
                    <CardDescription className={`flex items-center gap-2 text-gray-600 ${isArabic ? 'flex-row-reverse' : ''}`}>
                      <MapPin className="w-4 h-4" />
                      {isArabic ? `${coordinator.country?.name_ar}, ${coordinator.government?.name_ar}` : `${coordinator.country?.name_en}, ${coordinator.government?.name_en}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-gray-600 mb-4 line-clamp-3 ${isArabic ? 'text-right' : ''}`}>
                      {isArabic ? coordinator.about_ar : coordinator.about_en}
                    </p>
                    <div className="space-y-2">
                      <div className={`flex items-center gap-2 text-gray-600 ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <Phone className="w-4 h-4" />
                        <span>{coordinator.servicePhone}</span>
                      </div>
                      <div className={`flex items-center gap-2 text-gray-600 ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <Mail className="w-4 h-4" />
                        <span>{coordinator.serviceEmail}</span>
                      </div>
                      {coordinator.links && coordinator.links.length > 0 && (
                        <div className={`flex items-center gap-2 text-blue-500 ${isArabic ? 'flex-row-reverse' : ''}`}>
                          <ExternalLink className="w-4 h-4" />
                          <a href={coordinator.links[0]} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {t('servicesPage:tripCoordinators.visitWebsite')}
                          </a>
                        </div>
                      )}
                      {/* Display Trip Coordinator Details */}
                      {coordinator.tripCoordinator && (
                        <div className="space-y-2">
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('Location of Horses')}:</span> {coordinator.tripCoordinator.locationOfHorses}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('Location of Tent')}:</span> {coordinator.tripCoordinator.locationOfTent}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('Start Date')}:</span> {new Date(coordinator.tripCoordinator.startDate).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('End Date')}:</span> {new Date(coordinator.tripCoordinator.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('Break Times')}:</span> {coordinator.tripCoordinator.breakTimes}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('Meals')}:</span>
                            <ul>
                              {coordinator.tripCoordinator.meals.map((meal, idx) => (
                                <li key={idx}>{meal.mealType}: {meal.mealDescription}</li>
                              ))}
                            </ul>
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('Contains Aid Bag')}:</span> {coordinator.tripCoordinator.containsAidBag ? 'Yes' : 'No'}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('Activities')}:</span> {coordinator.tripCoordinator.activities}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('Price for Family of 2')}:</span> ${coordinator.tripCoordinator.priceForFamilyOf2}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('Price for Family of 3')}:</span> ${coordinator.tripCoordinator.priceForFamilyOf3}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('Price for Family of 4')}:</span> ${coordinator.tripCoordinator.priceForFamilyOf4}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('Trip Program')}:</span> {coordinator.tripCoordinator.tripProgram}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('Level of Hardship')}:</span> {coordinator.tripCoordinator.levelOfHardship}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('Conditions & Requirements')}:</span> {coordinator.tripCoordinator.conditionsAndRequirements}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('Safety & Equipment')}:</span> {coordinator.tripCoordinator.safetyAndEquipment}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('Cancellation & Refund Policy')}:</span> {coordinator.tripCoordinator.cancellationAndRefundPolicy}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">{t('More Details')}:</span> {coordinator.tripCoordinator.moreDetails}
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
