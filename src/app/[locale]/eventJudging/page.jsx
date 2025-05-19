"use client";

import React, { useEffect, useState } from "react";
import { Search, MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Layout from "components/layout/Layout";
import { client, urlFor } from "../../../lib/sanity";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Image from "next/image";

const EventJudgingPage = () => {
  const [judges, setJudges] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const fetchJudges = async () => {
      try {
        const query = `*[_type == "services" && serviceType == "event_judging" && statusAdminApproved == true && isMainService == true] {
          _id,
          name_en,
          name_ar,
          about_en,
          about_ar,
          price,
          priceUnit,
          image,
          servicePhone,
          serviceEmail,
          links,
          eventJudgingDetails {
            eventTypes,
            judgingLevel,
            certifications
          },
          country->{ name_en, name_ar },
          government->{ name_en, name_ar }
        }`;

        const result = await client.fetch(query);
        setJudges(result);
      } catch (err) {
        console.error("Error fetching event judges:", err);
        setError(t("servicesPage:eventJudging.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchJudges();
  }, [t]);

  const filteredJudges = judges.filter(
    (judge) =>
      judge.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      judge.name_ar.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div
        className={`min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 ${
          isRTL ? "rtl" : "ltr"
        }`}
      >
        <div className="relative h-64 bg-slate-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] bg-cover bg-center opacity-40" />
          </div>
          <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("servicesPage:eventJudging.title")}
            </h1>
            <p className="text-lg md:text-xl text-center max-w-2xl">
              {t("servicesPage:eventJudging.subtitle")}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-8">
          <div className="relative">
            <Search
              className={`absolute ${
                isRTL ? "right-3" : "left-3"
              } top-1/2 transform -translate-y-1/2 text-gray-400`}
            />
            <input
              type="text"
              placeholder={t("servicesPage:eventJudging.searchPlaceholder")}
              className={`w-full ${
                isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
              } py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
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
          ) : filteredJudges.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {t("servicesPage:eventJudging.noJudges")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJudges.map((judge, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow duration-300"
                  onClick={() =>
                    router.push(`/services/${judge._id.replace("drafts.", "")}`)
                  }
                >
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={
                        judge.image
                          ? urlFor(judge.image).url()
                          : "/api/placeholder/400/300"
                      }
                      alt={judge.name_en || "Event Judging Service"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      width={400}
                      height={300}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {isRTL ? judge.name_ar : judge.name_en}
                        </h3>
                      </div>
                      <span className="text-lg font-bold text-blue-500">
                        {t("servicesPage:eventJudging.pricePerSession", {
                          price: judge.price,
                          unit: judge.priceUnit
                            ? t(`priceUnits:${judge.priceUnit}`)
                            : "",
                        })}
                      </span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {isRTL
                        ? judge.country?.name_ar
                        : judge.country?.name_en},{" "}
                      {isRTL
                        ? judge.government?.name_ar
                        : judge.government?.name_en}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {isRTL ? judge.about_ar : judge.about_en}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{judge.servicePhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{judge.serviceEmail}</span>
                      </div>
                      {judge.links && judge.links.length > 0 && (
                        <div className="flex items-center gap-2 text-blue-500">
                          <ExternalLink className="w-4 h-4" />
                          <a
                            href={judge.links[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {t("servicesPage:eventJudging.visitWebsite")}
                          </a>
                        </div>
                      )}
                      {judge.eventJudgingDetails?.eventTypes && (
                        <div className="text-gray-600">
                          <strong>
                            {t("servicesPage:eventJudging.eventTypes")}:
                          </strong>{" "}
                          <span className="line-clamp-2">
                            {judge.eventJudgingDetails.eventTypes.join(", ")}
                          </span>
                        </div>
                      )}
                      {judge.eventJudgingDetails?.judgingLevel && (
                        <div className="text-gray-600">
                          <strong>
                            {t("servicesPage:eventJudging.judgingLevel")}:
                          </strong>{" "}
                          <span>{judge.eventJudgingDetails.judgingLevel}</span>
                        </div>
                      )}
                      {judge.eventJudgingDetails?.certifications &&
                        judge.eventJudgingDetails.certifications.length > 0 && (
                          <div className="text-gray-600">
                            <strong>
                              {t("servicesPage:eventJudging.certifications")}:
                            </strong>{" "}
                            <span>
                              {t("servicesPage:eventJudging.certified")}
                            </span>
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

export default EventJudgingPage;
