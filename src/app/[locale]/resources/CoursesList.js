"use client";

import { useState, useEffect } from "react";
import { Star, Clock, BookOpen, User } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { client } from "../../../lib/sanity";
import Link from "next/link";

const mockCourses = [
];

export default function CoursesList({ viewMode, searchQuery }) {
  const [courses, setCourses] = useState(mockCourses);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSanityCourses = async () => {
      try {
        const query = `*[_type == "course"] {
          _id,
          title,
          description,
          price,
          averageRating,
          ratingCount,
          level,
          language,
          duration,
          category,
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
          const processedImages = course.images?.map((img) => ({
            asset: {
              _ref: img.asset?._ref,
              url: img.asset?.url || "/placeholder.svg",
            },
          })) || [];

          return {
            ...course,
            images: processedImages.length > 0 ? processedImages : [{ asset: { url: "/placeholder.svg" } }],
          };
        });

        console.log("Fetched courses from Sanity:", processedSanityCourses);
        setCourses([...mockCourses, ...processedSanityCourses]);
      } catch (error) {
        console.error("Error fetching Sanity courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSanityCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  const formatLevel = (level) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  if (filteredCourses.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}`}>
      {filteredCourses.map((course) => (
        <Card
          key={course._id}
          className={`overflow-hidden transition-all hover:shadow-lg ${viewMode === "list" ? "flex flex-col md:flex-row" : ""}`}
        >
          <div
            className={`${viewMode === "list" ? "w-full md:w-1/3 h-48 md:h-auto relative" : "aspect-video overflow-hidden relative"}`}
          >
            <img
              src={course.images?.[0]?.asset?.url || "/placeholder.svg"}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-[#d4af37] text-white text-xs px-2 py-1 rounded">
              {course.level ? formatLevel(course.level) : "Beginner"}
            </div>
          </div>

          <div className={`flex flex-col ${viewMode === "list" ? "md:w-2/3" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg line-clamp-2">{course.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1">{renderStars(course.averageRating || 0)}</div>
                    <span className="text-sm text-gray-500">({course.ratingCount || 0})</span>
                  </div>
                </div>
                <div className="text-lg font-bold text-[#d4af37]">${course.price || 0}</div>
              </div>
            </CardHeader>

            <CardContent className="pb-2">
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">{course.description}</p>

              <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration || "Self-paced"}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {course.instructor?.fullName || "Unknown Instructor"}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2 mt-auto">
              <Link href={`/courses/view/${course._id}`} className="w-full">
                <Button className="w-full rounded bg-black text-white">View Course</Button>
              </Link>
            </CardFooter>
          </div>
        </Card>
      ))}
    </div>
  );
}