"use client";

import { useState } from "react";
import { Book, BookOpen, Grid, List, Search, Filter, ChevronDown, X } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import ResourcesPageHeader from "./ResourcesPageHeader";
import CoursesList from "./CoursesList";
import BooksList from "./BooksList";
import ResourcesFilters from "./ResourcesFilters";
import Layout from "../../../../components/layout/Layout";
import { useTranslation } from "react-i18next";

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState("courses");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { t, i18n } = useTranslation("resourcesPage");
  const isRTL = i18n.dir() === "rtl";

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <ResourcesPageHeader activeTab={activeTab} />

        <main className="container mx-auto px-4 py-8 max-w-7xl -mt-16 relative z-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col space-y-6">
              {/* Tabs navigation */}
              <Tabs defaultValue="courses" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-between gap-4 mb-6">
              <TabsList className="bg-gray-100 p-1">
                <TabsTrigger value="courses" className="flex items-center gap-2 px-4 py-2">
                      <BookOpen className="h-4 w-4" />
                  <span>{t("tabs.courses")}</span>
                    </TabsTrigger>
                    <TabsTrigger value="books" className="flex items-center gap-2 px-4 py-2">
                      <Book className="h-4 w-4" />
                  <span>{t("tabs.books")}</span>
                    </TabsTrigger>
                  </TabsList>

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

                {/* Search & Filter UI */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                  <div className="relative flex-1">
                    <Search className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 ${isRTL ? "right-3" : "left-3"}`} />
                    <Input
                      type="text"
                      placeholder={t("searchPlaceholder", { tab: t(`tabs.${activeTab}`) })}
                      className={`${isRTL ? "pr-10" : "pl-10"} w-full`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4" />
                    <span>{t("filtersButton")}</span>
                    {showFilters && <X className="h-4 w-4 ml-2" />}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <span>{t("sort.by")}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>{t("sort.newest")}</DropdownMenuItem>
                      <DropdownMenuItem>{t("sort.priceLowHigh")}</DropdownMenuItem>
                      <DropdownMenuItem>{t("sort.priceHighLow")}</DropdownMenuItem>
                      <DropdownMenuItem>{t("sort.highestRated")}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Filters section */}
                {showFilters && <ResourcesFilters resourceType={activeTab} />}

                <TabsContent value="courses" className="mt-0">
                  <CoursesList viewMode={viewMode} searchQuery={searchQuery} />
                </TabsContent>

                <TabsContent value="books" className="mt-0">
                  <BooksList viewMode={viewMode} searchQuery={searchQuery} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}