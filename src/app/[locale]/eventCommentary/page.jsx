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

const EventCommentaryPage = () => {
  const [commentators, setCommentators] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const fetchCommentators = async () => {
      try {
        const query = `*[_type == "services" && serviceType == "event_commentary" && statusAdminApproved == true && isMainService == true] {
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
          eventCommentaryDetails {
            portfolioLink { url, description_ar, description_en },
            certifications
          },
          country->{ name_en, name_ar },
          government->{ name_en, name_ar }
        }`;

        const result = await client.fetch(query);
        setCommentators(result);
      } catch (err) {
        console.error("Error fetching event commentators:", err);
        setError(t("servicesPage:eventCommentary.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchCommentators();
  }, [t]);

  const filteredCommentators = commentators.filter(
    (commentator) =>
      commentator.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commentator.name_ar.toLowerCase().includes(searchQuery.toLowerCase())
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
              {t("servicesPage:eventCommentary.title")}
            </h1>
            <p className="text-lg md:text-xl text-center max-w-2xl">
              {t("servicesPage:eventCommentary.subtitle")}
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
              placeholder={t("servicesPage:eventCommentary.searchPlaceholder")}
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
          ) : filteredCommentators.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {t("servicesPage:eventCommentary.noCommentators")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommentators.map((commentator, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow duration-300"
                  onClick={() =>
                    router.push(
                      `/services/${commentator._id.replace("drafts.", "")}`
                    )
                  }
                >
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={
                        commentator.image
                          ? urlFor(commentator.image).url()
                          : "/api/placeholder/400/300"
                      }
                      alt={commentator.name_en || "Event Commentary Service"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      width={400}
                      height={300}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {isRTL ? commentator.name_ar : commentator.name_en}
                        </h3>
                      </div>
                      <span className="text-lg font-bold text-blue-500">
                        {t("servicesPage:eventCommentary.pricePerSession", {
                          price: commentator.price,
                          unit: commentator.priceUnit
                            ? t(`priceUnits:${commentator.priceUnit}`)
                            : "",
                        })}
                      </span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {isRTL
                        ? commentator.country?.name_ar
                        : commentator.country?.name_en}
                      ,{" "}
                      {isRTL
                        ? commentator.government?.name_ar
                        : commentator.government?.name_en}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {isRTL ? commentator.about_ar : commentator.about_en}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{commentator.servicePhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{commentator.serviceEmail}</span>
                      </div>
                      {commentator.links && commentator.links.length > 0 && (
                        <div className="flex items-center gap-2 text-blue-500">
                          <ExternalLink className="w-4 h-4" />
                          <a
                            href={commentator.links[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {t("servicesPage:eventCommentary.visitWebsite")}
                          </a>
                        </div>
                      )}
                      {commentator.eventCommentaryDetails?.portfolioLink
                        ?.url && (
                        <div className="text-gray-600">
                          <strong>
                            {t("servicesPage:eventCommentary.portfolioLink")}:
                          </strong>{" "}
                          <a
                            href={
                              commentator.eventCommentaryDetails.portfolioLink
                                .url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {isRTL
                              ? commentator.eventCommentaryDetails.portfolioLink
                                  .description_ar
                              : commentator.eventCommentaryDetails.portfolioLink
                                  .description_en}
                          </a>
                        </div>
                      )}
                      {commentator.eventCommentaryDetails?.certifications &&
                        commentator.eventCommentaryDetails.certifications
                          .length > 0 && (
                          <div className="text-gray-600">
                            <strong>
                              {t("servicesPage:eventCommentary.certifications")}
                              :
                            </strong>{" "}
                            <span>
                              {t("servicesPage:eventCommentary.certified")}
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

export default EventCommentaryPage;
