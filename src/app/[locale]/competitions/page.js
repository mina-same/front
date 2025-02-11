"use client";

import React, { useEffect, useState } from 'react';
import { Search, MapPin, Phone, Mail, ExternalLink, Trophy, User, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from 'components/layout/Layout';
import { client, urlFor } from '../../../lib/sanity';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const route = useRouter();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const query = `*[_type == "services" && serviceType == "competitions" && statusAdminApproved == true && isMainService == true] {
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
          competitions,
          country->{name_en, name_ar},
          government->{name_en, name_ar},
          city->{name_en, name_ar}
        }`;

        const result = await client.fetch(query);
        setCompetitions(result);
      } catch (err) {
        console.error('Error fetching competitions:', err);
        setError(t('servicesPage:competitions.errorMessage'));
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, [t]);

  const filteredCompetitions = competitions.filter(competition =>
    competition.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    competition.name_ar.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRaceTypeLabel = (raceType) => {
    return t(`servicesPage:competitions.raceTypes.${raceType}`);
  };

  const isArabic = i18n.language === 'ar';

  return (
    <Layout>
      <div className={`min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 ${isArabic ? 'rtl' : 'ltr'}`}>
        <div className="relative h-64 bg-slate-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] bg-cover bg-center opacity-40" />
          </div>
          <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('servicesPage:competitions.heroTitle')}</h1>
            <p className="text-lg md:text-xl text-center max-w-2xl">
              {t('servicesPage:competitions.heroDescription')}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-8">
          <div className="relative">
            <Search className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} />
            <input
              type="text"
              placeholder={t('servicesPage:competitions.searchPlaceholder')}
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
          ) : filteredCompetitions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('servicesPage:competitions.noCompetitionsMessage')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompetitions.map((competition, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300" onClick={() => route.push(`/${competition._id}`)}>
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={competition.image ? urlFor(competition.image).url() : '/api/placeholder/400/300'}
                      alt={isArabic ? competition.name_ar : competition.name_en}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      width={100}
                      high={30}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className={`flex justify-between items-start ${isArabic ? 'flex-row-reverse' : ''}`}>
                      <div>
                        <h3 className="text-xl font-semibold">{isArabic ? competition.name_ar : competition.name_en}</h3>
                        <p className="text-sm text-blue-600">
                          {getRaceTypeLabel(competition.competitions?.raceType)}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-blue-500">
                        ${competition.price}
                      </span>
                    </CardTitle>
                    <CardDescription className={`flex items-center gap-2 text-gray-600 ${isArabic ? 'flex-row-reverse' : ''}`}>
                      <MapPin className="w-4 h-4" />
                      {isArabic ? `${competition.country?.name_ar}, ${competition.government?.name_ar}` : `${competition.country?.name_en}, ${competition.government?.name_en}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className={`text-gray-600 line-clamp-3 ${isArabic ? 'text-right' : ''}`}>
                        {isArabic ? competition.about_ar : competition.about_en}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className={`flex items-center gap-2 text-gray-600 ${isArabic ? 'flex-row-reverse' : ''}`}>
                          <Trophy className="w-4 h-4" />
                          <span>Level: {competition.competitions?.level}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-gray-600 ${isArabic ? 'flex-row-reverse' : ''}`}>
                          <Award className="w-4 h-4" />
                          <span>Prize: {competition.competitions?.prize}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className={`flex items-center gap-2 text-gray-600 ${isArabic ? 'flex-row-reverse' : ''}`}>
                          <User className="w-4 h-4" />
                          <span>Organizer: {competition.competitions?.organiserName}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-gray-600 ${isArabic ? 'flex-row-reverse' : ''}`}>
                          <Phone className="w-4 h-4" />
                          <span>{competition.servicePhone}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-gray-600 ${isArabic ? 'flex-row-reverse' : ''}`}>
                          <Mail className="w-4 h-4" />
                          <span>{competition.serviceEmail}</span>
                        </div>
                        {competition.links && competition.links.length > 0 && (
                          <div className={`flex items-center gap-2 text-blue-500 ${isArabic ? 'flex-row-reverse' : ''}`}>
                            <ExternalLink className="w-4 h-4" />
                            <a href={competition.links[0]} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {t('servicesPage:competitions.visitWebsite')}
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
