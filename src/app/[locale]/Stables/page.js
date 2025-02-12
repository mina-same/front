"use client";

import React, { useEffect, useState } from 'react';
import { Search, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from 'components/layout/Layout';
import { client, urlFor } from '../../../lib/sanity'; // Import Sanity client and urlFor
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const HorseStablesPage = () => {
  const [stables, setStables] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const route = useRouter();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchStables = async () => {
      try {
        const query = `*[_type == "services" && serviceType == "horse_stable" && statusAdminApproved == true && isMainService == true] {
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

        const result = await client.fetch(query);
        setStables(result);
      } catch (err) {
        console.error('Error fetching horse stables:', err);
        setError(t('servicesPage:stables.errorMessage'));
      } finally {
        setLoading(false);
      }
    };

    fetchStables();
  }, [t]);

  console.log(stables)

  const filteredStables = stables.filter(stable =>
    stable.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stable.name_ar.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('servicesPage:stables.heroTitle')}</h1>
            <p className="text-lg md:text-xl text-center max-w-2xl">
              {t('servicesPage:stables.heroDescription')}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-8">
          <div className="relative">
            <Search className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} />
            <input
              type="text"
              placeholder={t('servicesPage:stables.searchPlaceholder')}
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
          ) : filteredStables.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('servicesPage:stables.noStablesMessage')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStables.map((stable, index) => (

                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow duration-300"
                  onClick={() => route.push(`/services/${stable._id.replace('drafts.', '')}`)}
                >

                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={stable.image ? urlFor(stable.image).url() : '/api/placeholder/400/300'}
                      alt={isArabic ? stable.name_ar : stable.name_en}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      width={100}
                      height={30}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className={`flex justify-between items-start ${isArabic ? 'flex-row-reverse' : ''}`}>
                      <div>
                        <h3 className="text-xl font-semibold">{isArabic ? stable.name_ar : stable.name_en}</h3>
                      </div>
                      <span className="text-lg font-bold text-blue-500">
                        ${stable.price}/month
                      </span>
                    </CardTitle>
                    <CardDescription className={`flex items-center gap-2 text-gray-600 ${isArabic ? 'flex-row-reverse' : ''}`}>
                      <MapPin className="w-4 h-4" />
                      {stable.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-gray-600 mb-4 line-clamp-3 ${isArabic ? 'text-right' : ''}`}>
                      {isArabic ? stable.about_ar : stable.about_en}
                    </p>
                    <div className="space-y-2">
                      <div className={`flex items-center gap-2 text-gray-600 ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <Phone className="w-4 h-4" />
                        <span>{stable.servicePhone}</span>
                      </div>
                      <div className={`flex items-center gap-2 text-gray-600 ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <Mail className="w-4 h-4" />
                        <span>{stable.serviceEmail}</span>
                      </div>
                      {stable.links && stable.links.length > 0 && (
                        <div className={`flex items-center gap-2 text-blue-500 ${isArabic ? 'flex-row-reverse' : ''}`}>
                          <ExternalLink className="w-4 h-4" />
                          <a href={stable.links[0]} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {t('servicesPage:stables.visitWebsite')}
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