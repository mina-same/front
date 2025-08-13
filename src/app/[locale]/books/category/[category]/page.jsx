"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Book, Grid, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import BooksList from "../../../../BooksList";
import Layout from "../../../../../../components/layout/Layout";
import { useTranslation } from "react-i18next";

// Using translations instead of hardcoded values
export default function BooksCategoryPage() {
  const { category, locale } = useParams();
  const { t } = useTranslation(['bookDetails', 'booksPage']);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Get category title from translations
  const categoryTitle = t(`bookDetails:categories.${category}`, category);

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
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{categoryTitle}</h1>
              <p className="text-lg md:text-xl max-w-2xl text-[#f5e6b8]">
                {t('booksPage:subtitle')}
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
                    placeholder={t('booksPage:searchPlaceholder', 'Search books...')}
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