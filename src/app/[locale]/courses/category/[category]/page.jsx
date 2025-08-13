"use client";

import { useState, useEffect } from "react";
import { Star, Book, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { client } from "../../../../../lib/sanity";
import Link from "next/link";
import Image from 'next/image';
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import Layout from "../../../../../../components/layout/Layout";

export default function CoursesCategoryPage() {
  const { category, locale } = useParams();
  const { t } = useTranslation(['bookDetails', 'coursesPage']);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSanityCourses = async () => {
      try {
        const query = `*[_type == "course" && category == "${category}"] {
          _id,
          title,
          description,
          price,
          averageRating,
          ratingCount,
          language,
          category,
          accessLink,
          level,
          duration,
          ratings,
          instructor->{_id, fullName},
          "images": images[]{
            "_key": _key,
            "asset": {
              "_ref": asset._ref,
              "url": asset->url
            }
          }
        }`;

        const sanityCourses = await client.fetch(query);

        const processedSanityCourses = sanityCourses.map((course) => {
          const processedImages =
            course.images?.map((img) => ({
              asset: {
                _ref: img.asset?._ref,
                url: img.asset?.url || "/placeholder.svg",
              },
            })) || [];

          return {
            ...course,
            images:
              processedImages.length > 0
                ? processedImages
                : [{ asset: { url: "/placeholder.svg" } }],
          };
        });

        console.log("Fetched courses from Sanity:", processedSanityCourses);
        setCourses(processedSanityCourses);
      } catch (error) {
        console.error("Error fetching Sanity books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSanityCourses();
  }, [category]);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <Layout locale={locale}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="relative">
          <div className="bg-[#d4af37] h-64">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80')",
              }}
            />
            <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white pt-8">
              <Book className="w-12 h-12 mb-4" />
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{t(`bookDetails:categories.${category}`, category)}</h1>
              <p className="text-lg md:text-xl max-w-2xl text-[#f5e6b8]">
                {t('coursesPage:subtitle')}
              </p>
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50"
              style={{
                clipPath: "polygon(0 100%, 100% 100%, 100% 0, 0 100%)",
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8 -mt-8 relative z-10">
          {/* Search and View Controls */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="w-full md:w-2/3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('coursesPage:searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Courses List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <Book className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t('coursesPage:noMatchingCourses')}
              </h3>
              <p className="text-gray-500">
                {t('coursesPage:tryAdjustingSearch')}
              </p>
            </div>
          )

          : (
            <div
              className={`${
                viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-6"
                }`}
            >
              {filteredCourses.map((course) => (
                <Card
                  key={course._id}
                  className={`overflow-hidden transition-all hover:shadow-lg ${
                    viewMode === "list" ? "flex flex-col md:flex-row" : ""
                  }`}
                >
                  <div
                    className={`${
                      viewMode === "list"
                      ? "w-full md:w-1/3 h-48 md:h-auto relative"
                      : "aspect-[3/4] overflow-hidden relative"
                      }`}
                  >
                    <Image
                      fill
                      src={course.images?.[0]?.asset?.url || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-[#d4af37] text-white text-xs px-2 py-1 rounded">
                      {t('coursesPage:course')}
                    </div>
                  </div>

                  <div
                    className={`flex flex-col ${viewMode === "list" ? "md:w-2/3" : ""}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg line-clamp-2">
                            {course.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              {renderStars(course.averageRating || 0)}
                            </div>
                            <span className="text-sm text-gray-500">
                              ({course.ratingCount || 0})
                            </span>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-[#d4af37]">
                          {course.price ? t('coursesPage:price', { value: course.price }) : t('coursesPage:free')}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-2">
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {course.description}
                      </p>

                      <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {course.instructor?.fullName || t('coursesPage:unknownInstructor')}
                        </div>
                        {course.duration && (
                          <div className="flex items-center">
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                              {t('coursesPage:duration')}: {course.duration}
                            </span>
                          </div>
                        )}
                        {course.level && (
                          <div className="flex items-center">
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                              {t(`coursesPage:courseDetails.levels.${course.level}`, course.level)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2 mt-auto">
                      <Link href={`/courses/view/${course._id}`} className="w-full">
                        <Button className="w-full" variant="outline">
                          {t('coursesPage:viewDetails')}
                        </Button>
                      </Link>
                    </CardFooter>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
