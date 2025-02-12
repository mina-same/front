"use client";

import React, { useEffect, useState } from 'react';
import { Search, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from 'components/layout/Layout';
import { client, urlFor } from '../../../lib/sanity'; // Import Sanity client and urlFor
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook
import Image from 'next/image';

const HorseCateringPage = () => {
  const [cateringServices, setCateringServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const route = useRouter();
  const { t, i18n } = useTranslation(); // Initialize useTranslation hook
  const isRTL = i18n.language === 'ar'; // Check if the language is Arabic

  useEffect(() => {
    const fetchCateringServices = async () => {
      try {
        const query = `*[_type == "services" && serviceType == "horse_catering" && statusAdminApproved == true && isMainService == true] {
          _id,
          name_en,
          name_ar,
          about_en,
          about_ar,
          price,
          image,
          servicePhone,
          serviceEmail,
          links,
          cateringOptions,
          country->{ name_en, name_ar },
          government->{ name_en, name_ar }
        }`;

        const result = await client.fetch(query);
        setCateringServices(result);
      } catch (err) {
        console.error('Error fetching horse catering services:', err);
        setError(t('servicesPage:horseCatering.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchCateringServices();
  }, [t]);

  const filteredCateringServices = cateringServices.filter(service =>
    service.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.name_ar.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className={`min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="relative h-64 bg-slate-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] bg-cover bg-center opacity-40" />
          </div>
          <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('servicesPage:horseCatering.title')}</h1>
            <p className="text-lg md:text-xl text-center max-w-2xl">
              {t('servicesPage:horseCatering.subtitle')}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-8">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} />
            <input
              type="text"
              placeholder={t('servicesPage:horseCatering.searchPlaceholder')}
              className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
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
          ) : filteredCateringServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('servicesPage:horseCatering.noCateringServices')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCateringServices.map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300" onClick={() => route.push(`/services/${service._id.replace('drafts.', '')}`)}>
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={service.image ? urlFor(service.image).url() : '/api/placeholder/400/300'}
                      alt={service.name_en || "service name"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      width={100}
                      height={30}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{isRTL ? service.name_ar : service.name_en}</h3>
                      </div>
                      <span className="text-lg font-bold text-blue-500">
                        {t('servicesPage:horseCatering.pricePerMonth', { price: service.price })}
                      </span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {isRTL ? service.country?.name_ar : service.country?.name_en}, {isRTL ? service.government?.name_ar : service.government?.name_en}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">{isRTL ? service.about_ar : service.about_en}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{service.servicePhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{service.serviceEmail}</span>
                      </div>
                      {service.links && service.links.length > 0 && (
                        <div className="flex items-center gap-2 text-blue-500">
                          <ExternalLink className="w-4 h-4" />
                          <a href={service.links[0]} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {t('servicesPage:horseCatering.visitWebsite')}
                          </a>
                        </div>
                      )}
                      {service.cateringOptions && service.cateringOptions.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold">{t('servicesPage:horseCatering.cateringOptions')}</h4>
                          <ul className="list-disc list-inside">
                            {service.cateringOptions.map((option, idx) => (
                              <li key={idx} className="text-gray-600">{option}</li>
                            ))}
                          </ul>
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

export default HorseCateringPage;
