"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Book, Grid, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import BooksList from "../../../../BooksList";
import Layout from "../../../../../../components/layout/Layout";

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

export default function BooksCategoryPage() {
  const { category, locale } = useParams();
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const categoryTitle = CATEGORY_TITLES[category] || "Books";

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
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{categoryTitle} Books</h1>
              <p className="text-lg md:text-xl max-w-2xl text-[#f5e6b8]">
                Explore our collection of specialized equine literature in {categoryTitle.toLowerCase()}
              </p>
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50"
              style={{
                borderTopLeftRadius: "50% 100%",
                borderTopRightRadius: "50% 100%",
                transform: "scaleX(1.5)",
              }}
            />
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-7xl -mt-16 relative z-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col space-y-6">
              {/* Search & View Mode */}
              <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search books..."
                    className="pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={viewMode === "grid" ? "bg-gray-100" : ""}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={viewMode === "list" ? "bg-gray-100" : ""}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Books List */}
              {/* <BooksList viewMode={viewMode} searchQuery={searchQuery} category={category} /> */}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}