  "use client";

  import React, { useEffect, useState } from 'react';
  import { Search, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
  import Layout from 'components/layout/Layout';
  import { client, urlFor } from '../../../lib/sanity'; // Import Sanity client and urlFor
  import { useRouter } from 'next/navigation';
  import { useTranslation } from 'react-i18next'; // Import useTranslation hook
  import Image from 'next/image';

  const HoofTrimmerPage = () => {
    const [trimmers, setTrimmers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const route = useRouter();
    const { t, i18n } = useTranslation(); // Initialize useTranslation hook
    const isRTL = i18n.language === 'ar'; // Check if the language is Arabic

    useEffect(() => {
      const fetchTrimmers = async () => {
        try {
          const query = `*[_type == "services" && serviceType == "hoof_trimmer" && statusAdminApproved == true && isMainService == true] {
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
            hoofTrimmerDetails {
              certification,
              experienceYears
            },
            country->{ name_en, name_ar },
            government->{ name_en, name_ar }
          }`;

          const result = await client.fetch(query);
          setTrimmers(result);
        } catch (err) {
          console.error('Error fetching hoof trimmers:', err);
          setError(t('servicesPage:hoofTrimmer.error'));
        } finally {
          setLoading(false);
        }
      };

      fetchTrimmers();
    }, [t]);

    const filteredTrimmers = trimmers.filter(trimmer =>
      trimmer.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trimmer.name_ar.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <Layout>
        <div className={`min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 ${isRTL ? 'rtl' : 'ltr'}`}>
          <div className="relative h-64 bg-slate-900">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] bg-cover bg-center opacity-40" />
            </div>
            <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('servicesPage:hoofTrimmer.title')}</h1>
              <p className="text-lg md:text-xl text-center max-w-2xl">
                {t('servicesPage:hoofTrimmer.subtitle')}
              </p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 -mt-8">
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} />
              <input
                type="text"
                placeholder={t('servicesPage:hoofTrimmer.searchPlaceholder')}
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
            ) : filteredTrimmers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">{t('servicesPage:hoofTrimmer.noTrimmers')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrimmers.map((trimmer, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-300" onClick={() => route.push(`/services/${trimmer._id.replace('drafts.', '')}`)}>
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <Image
                        src={trimmer.image ? urlFor(trimmer.image).url() : '/api/placeholder/400/300'}
                        alt={trimmer.name_en || "service name"}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        width={100}
                        height={30}
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold">{isRTL ? trimmer.name_ar : trimmer.name_en}</h3>
                        </div>
                        <span className="text-lg font-bold text-blue-500">
                          {t('servicesPage:hoofTrimmer.pricePerSession', { price: trimmer.price })}
                        </span>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {isRTL ? trimmer.country?.name_ar : trimmer.country?.name_en}, {isRTL ? trimmer.government?.name_ar : trimmer.government?.name_en}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-3">{isRTL ? trimmer.about_ar : trimmer.about_en}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{trimmer.servicePhone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{trimmer.serviceEmail}</span>
                        </div>
                        {trimmer.links && trimmer.links.length > 0 && (
                          <div className="flex items-center gap-2 text-blue-500">
                            <ExternalLink className="w-4 h-4" />
                            <a href={trimmer.links[0]} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {t('servicesPage:hoofTrimmer.visitWebsite')}
                            </a>
                          </div>
                        )}
                        {trimmer.hoofTrimmerDetails && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-800">{t('servicesPage:hoofTrimmer.hoofTrimmerDetails')}</h4>
                            <p className="text-sm text-gray-600">Certification: {trimmer.hoofTrimmerDetails.certification}</p>
                            <p className="text-sm text-gray-600">Experience: {trimmer.hoofTrimmerDetails.experienceYears} years</p>
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

  export default HoofTrimmerPage;
