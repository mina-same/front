"use client";

import React, { useEffect, useState } from 'react';
import { Search, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from 'components/layout/Layout';
import { client, urlFor } from '../../../lib/sanity'; // Import Sanity client and urlFor
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook
import Image from 'next/image';

const HousingPage = () => {
  const [housings, setHousings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const route = useRouter();
  const { t, i18n } = useTranslation(); // Initialize useTranslation hook
  const isRTL = i18n.language === 'ar'; // Check if the language is Arabic

  useEffect(() => {
    const fetchHousings = async () => {
      try {
        const query = `*[_type == "services" && serviceType == "housing" && statusAdminApproved == true && isMainService == true] {
          _id,
          name_en,
          name_ar,
          about_en,
          about_ar,
          price,
          image,
          servicePhone,
          serviceEmail,
          country->{name_en, name_ar},
          government->{name_en, name_ar},
          links,
          housingDetails
        }`;

        const result = await client.fetch(query);
        setHousings(result);
      } catch (err) {
        console.error('Error fetching housing services:', err);
        setError(t('servicesPage:housing.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchHousings();
  }, [t]);

  const filteredHousings = housings.filter(housing =>
    housing.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    housing.name_ar.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className={`min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="relative h-64 bg-slate-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] bg-cover bg-center opacity-40" />
          </div>
          <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('servicesPage:housing.title')}</h1>
            <p className="text-lg md:text-xl text-center max-w-2xl">
              {t('servicesPage:housing.subtitle')}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-8">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} />
            <input
              type="text"
              placeholder={t('servicesPage:housing.searchPlaceholder')}
              className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b28a30] mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredHousings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('servicesPage:housing.noHousings')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHousings.map((housing, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300" onClick={() => route.push(`/services/${housing._id.replace('drafts.', '')}`)}>
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={housing.image ? urlFor(housing.image).url() : '/api/placeholder/400/300'}
                      alt={housing.name_en|| "service name"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      width={100}
                      height={30}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{isRTL ? housing.name_ar : housing.name_en}</h3>
                      </div>
                      <span className="text-lg font-bold text-blue-500">
                        {t('servicesPage:housing.pricePerService', { price: housing.price })}
                      </span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {isRTL ? housing.country?.name_ar : housing.country?.name_en}, {isRTL ? housing.government?.name_ar : housing.government?.name_en}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">{isRTL ? housing.about_ar : housing.about_en}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{housing.servicePhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{housing.serviceEmail}</span>
                      </div>
                      {housing.links && housing.links.length > 0 && (
                        <div className="flex items-center gap-2 text-blue-500">
                          <ExternalLink className="w-4 h-4" />
                          <a href={housing.links[0]} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {t('servicesPage:housing.visitWebsite')}
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

export default HousingPage;
