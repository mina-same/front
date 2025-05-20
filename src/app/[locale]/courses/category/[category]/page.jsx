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


const mockBooks = [
];

const CATEGORY_TITLES = {
  equine_anatomy_physiology: "Equine Anatomy and Physiology",
  equine_nutrition: "Equine Nutrition",
  stable_management: "Stable Management",
  horse_care_grooming: "Horse Care and Grooming",
  riding_instruction: "Riding Instruction (English and Western)",
  equine_health_first_aid: "Equine Health and First Aid",
  equine_reproduction_breeding: "Equine Reproduction and Breeding",
  horse_training_behavior: "Horse Training and Behavior",
  equine_business_management: "Equine Business Management",
  equine_law_ethics: "Equine Law and Ethics",
  horse_show_management_judging: "Horse Show Management and Judging",
  equine_assisted_services: "Equine-Assisted Services",
  equine_competition_disciplines: "Equine Competition Disciplines",
  equine_recreation_tourism: "Equine Recreation and Tourism",
  equine_rescue_rehabilitation: "Equine Rescue and Rehabilitation",
  equine_sports_medicine: "Equine Sports Medicine",
  equine_facility_design_management: "Equine Facility Design and Management",
  equine_marketing_promotion: "Equine Marketing and Promotion",
  equine_photography_videography: "Equine Photography and Videography",
  equine_journalism_writing: "Equine Journalism and Writing",
  equine_history_culture: "Equine History and Culture",
  equine_environmental_stewardship: "Equine Environmental Stewardship",
  equine_technology_innovation: "Equine Technology and Innovation",
  equine_entrepreneurship: "Equine Entrepreneurship",
  equine_dentistry: "Equine Dentistry",
  equine_podiatry: "Equine Podiatry",
  english_riding: "English Riding",
  western_riding: "Western Riding",
  jumping_hunter: "Jumping and Hunter",
  other: "Other",
};

export default function BooksList({ viewMode, searchQuery, category, router }) {
  const [books, setBooks] = useState(mockBooks);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSanityBooks = async () => {
      try {
        const query = `*[_type == "book"] {
          _id,
          title,
          description,
          price,
          averageRating,
          ratingCount,
          language,
          category,
          accessLink,
          file,
          ratings,
          author->{_id, fullName},
          "images": images[]{
            "_key": _key,
            "asset": {
              "_ref": asset._ref,
              "url": asset->url
            }
          }
        }`;

        const sanityBooks = await client.fetch(query);

        const processedSanityBooks = sanityBooks.map((book) => {
          const processedImages =
            book.images?.map((img) => ({
              asset: {
                _ref: img.asset?._ref,
                url: img.asset?.url || "/placeholder.svg",
              },
            })) || [];

          return {
            ...book,
            images:
              processedImages.length > 0
                ? processedImages
                : [{ asset: { url: "/placeholder.svg" } }],
          };
        });

        console.log("Fetched books from Sanity:", processedSanityBooks);
        setBooks([...mockBooks, ...processedSanityBooks]);
      } catch (error) {
        console.error("Error fetching Sanity books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSanityBooks();
  }, []);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!category || book.category === category)
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  if (filteredBooks.length === 0) {
    return (
      <div className="text-center py-16">
        <Book className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No books found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-6"
      }`}
    >
      {filteredBooks.map((book) => (
        <Card
          key={book._id}
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
              src={book.images?.[0]?.asset?.url || "/placeholder.svg"}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-[#d4af37] text-white text-xs px-2 py-1 rounded">
              Book
            </div>
          </div>

          <div
            className={`flex flex-col ${viewMode === "list" ? "md:w-2/3" : ""}`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg line-clamp-2">
                    {book.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1">
                      {renderStars(book.averageRating || 0)}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({book.ratingCount || 0})
                    </span>
                  </div>
                </div>
                <div className="text-lg font-bold text-[#d4af37]">
                  ${book.price || 0}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pb-2">
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {book.description}
              </p>

              <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {book.author?.fullName || "Unknown Author"}
                </div>
                <div className="flex items-center">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                    {book.language || "English"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span
                    className="text-xs px-2 py-0.5 bg-[#d4af37] text-white rounded-full cursor-pointer hover:bg-[#b8972e]"
                    onClick={() =>
                      router.push(`/books/category/${book.category}`)
                    }
                  >
                    {CATEGORY_TITLES[book.category] || book.category}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2 mt-auto">
              <Link href={`/books/view/${book._id}`} className="w-full">
                <Button className="w-full" variant="outline">
                  View Book
                </Button>
              </Link>
            </CardFooter>
          </div>
        </Card>
      ))}
    </div>
  );
}
