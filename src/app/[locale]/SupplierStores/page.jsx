"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "../../../components/ui/button";
import { Package2, Filter, LayoutGrid, LayoutList, Store, MapPin, Phone, Mail, ExternalLink, Globe } from "lucide-react";
import {
  FaPinterest,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaFacebook,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";
import Layout from "components/layout/Layout";
import Preloader from "components/elements/Preloader";
import { client, urlFor } from "../../../lib/sanity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { useTranslation } from "react-i18next";
import Link from "next/link";

const SupplierStoresPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  
  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);
  
  const [filteredStores, setFilteredStores] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Get query parameters
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  // Ref for the carousel container
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const storeCategories = [
    {
      title: "Feed and Nutrition",
      titleAr: "الأعلاف والتغذية",
      category: "feed_nutrition",
      image: "/assets/imgs/placeholders/Categories/Feed_and_Nutrition.jpg",
      color: "from-[#8B4513]/80",
    },
    {
      title: "Tack and Equipment",
      titleAr: "الأدوات والمعدات",
      category: "tack_equipment",
      image: "/assets/imgs/placeholders/Categories/Tack_and_Equipment.jpg",
      color: "from-[#d4af37]/80",
    },
    {
      title: "Apparel & Accessories",
      titleAr: "الملابس والإكسسوارات",
      category: "apparel_accessories",
      image: "/assets/imgs/placeholders/Categories/Apparel_&_Accessories.jpg",
      color: "from-[#2F4F4F]/90",
    },
    {
      title: "Health & Wellness",
      titleAr: "الصحة والرفاهية",
      category: "health_wellness",
      image:
        "https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&q=80",
      color: "from-[#2e4a2e]/90",
    },
    {
      title: "Barn & Stable Supplies",
      titleAr: "مستلزمات الإسطبل",
      category: "barn_stable",
      image: "/assets/imgs/placeholders/Categories/Barn_&_Stable_Supplies.jpg",
      color: "from-[#8B4513]/90",
    },
    {
      title: "Riding & Competition",
      titleAr: "الركوب والمنافسات",
      category: "riding_competition",
      image: "/assets/imgs/placeholders/Categories/Riding_&_Competition.jpg",
      color: "from-[#B8860B]/90",
    },
    {
      title: "Other",
      titleAr: "أخرى",
      category: "other",
      image:
        "https://images.unsplash.com/photo-1553284966-19b8815c7817?auto=format&fit=crop&q=80",
      color: "from-[#696969]/90",
    },
  ];

  // Duplicate categories for infinite loop
  const duplicatedCategories = [...storeCategories, ...storeCategories];

  useEffect(() => {
    const fetchSupplierStores = async () => {
      try {
        const query = `*[_type == "user" && userType == "suppliers" && supplierDetails != null] {
          _id,
          userName,
          email,
          phone,
          supplierDetails {
            storeNameEn,
            storeNameAr,
            storeLinks,
            storeLogo,
            storeLocationLink,
            storeAddress,
            products[]-> {
              _id,
              name_en,
              name_ar,
              category,
              price,
              images[] {
                asset-> {
                  url
                }
              }
            }
          }
        }`;

        const stores = await client.fetch(query);

        const formattedStores = stores.map((store) => ({
          id: store._id,
          userName: store.userName,
          email: store.email,
          phone: store.phone,
          storeNameEn: store.supplierDetails?.storeNameEn || store.userName,
          storeNameAr: store.supplierDetails?.storeNameAr || store.userName,
          storeLogo: store.supplierDetails?.storeLogo,
          storeLinks: store.supplierDetails?.storeLinks || [],
          storeLocationLink: store.supplierDetails?.storeLocationLink,
          storeAddress: store.supplierDetails?.storeAddress,
          products: store.supplierDetails?.products || [],
          productCount: store.supplierDetails?.products?.length || 0,
        }));

        setAllStores(formattedStores);
        setFilteredStores(formattedStores);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching supplier stores:", err);
        setError("Failed to load supplier stores. Please try again later.");
        setLoading(false);
      }
    };

    fetchSupplierStores();
  }, []);

  // Auto-scrolling animation
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        // Reset to 0 when reaching the original categories length
        if (nextIndex >= storeCategories.length) {
          // Use setTimeout to allow transition to complete before resetting
          setTimeout(() => {
            if (carouselRef.current) {
              carouselRef.current.style.transition = "none";
              setCurrentIndex(0);
            }
          }, 700); // Match transition duration
          return nextIndex % storeCategories.length;
        }
        return nextIndex;
      });
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [isPaused, storeCategories.length]);

  // Reset transition after instant jump
  useEffect(() => {
    if (currentIndex === 0 && carouselRef.current) {
      setTimeout(() => {
        carouselRef.current.style.transition = "transform 0.7s ease-in-out";
      }, 50);
    }
  }, [currentIndex]);

  // Filter and sort stores
  useEffect(() => {
    let filtered = [...allStores];

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter((store) =>
        store.storeNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.storeNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((store) =>
        store.products.some((product) => product.category === selectedCategory)
      );
    }

    // Sort stores
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.storeNameEn.localeCompare(b.storeNameEn));
        break;
      case "products":
        filtered.sort((a, b) => b.productCount - a.productCount);
        break;
      case "newest":
        // You can add a date field to sort by newest if needed
        break;
      default:
        break;
    }

    setFilteredStores(filtered);
  }, [searchTerm, allStores, selectedCategory, sortBy]);

  if (loading) {
    return (
      <Layout className="min-h-screen bg-[#f8f1e9]">
        <Preloader />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout className="min-h-screen bg-[#f8f1e9]">
        <div className="container mx-auto py-12 px-4 text-center">
          <p className="text-[#1a1a1a] text-lg">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-[#f8f1e9]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://i.pinimg.com/736x/ac/30/74/ac30748aaf0aa7338cbeb623ef73736f.jpg')",
          }}
        ></div>
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="absolute bottom-0 left-0 right-0 h-16"></div>
        <div className="container mx-auto relative z-10 py-12 md:py-20 px-4">
          <div className={`flex flex-col items-center text-center mb-6 ${isRTL ? 'rtl' : ''}`}>
            <Store size={42} className="mb-4 animate-fade-in text-white" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight text-white">
              {t('supplierStores:heroTitle')}
            </h1>
            <p className="text-base md:text-lg lg:text-xl opacity-90 max-w-2xl mx-auto text-white">
              {t('supplierStores:heroDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Featured Categories Banner */}
      <div className="pt-4 pb-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <h2 className={`text-2xl font-semibold text-[#1a1a1a] ${isRTL ? 'text-right' : ''}`}>
              {t('supplierStores:browseByCategory')}
            </h2>
          </div>
          <div
            className="relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              ref={carouselRef}
              className="flex snap-x snap-mandatory"
              style={{
                transform: isRTL ? 
                  `translateX(${currentIndex * (256 + 16)}px)` : 
                  `translateX(-${currentIndex * (256 + 16)}px)`,
                transition: "transform 0.7s ease-in-out",
              }}
            >
              {duplicatedCategories.map((category, index) => (
                <div
                  key={`${category.category}-${index}`}
                  className={`flex-shrink-0 w-64 h-48 mx-2 snap-center relative rounded-lg overflow-hidden group shadow-md cursor-pointer transition-transform duration-300 ${
                    index % storeCategories.length === currentIndex
                      ? "scale-105"
                      : "scale-100"
                  }`}
                  onClick={() => {
                    window.location.href = `?category=${category.category}`;
                  }}
                >
                  <Image
                    src={category.image}
                    alt={isRTL ? category.titleAr : category.title}
                    fill
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-700 group-hover:scale-110 z-0"
                    onError={(e) => {
                      e.target.src = "/assets/imgs/placeholders/default.jpg";
                    }}
                    sizes="(max-width: 768px) 100vw, 256px"
                    quality={80}
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${category.color} to-transparent opacity-80 z-10`}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="text-center">
                      <h3 className="text-white text-lg font-bold drop-shadow-lg mb-1">
                        {isRTL ? category.titleAr : category.title}
                      </h3>
                      <p className="text-white/90 text-sm drop-shadow-lg">
                        {isRTL ? category.title : category.titleAr}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* All Products Link */}
      <div className="bg-[#f8f1e9] py-6">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Link href="/products">
              <Button className="bg-[#2e4a2e] hover:bg-[#1a3a1a] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105">
                <Package2 className="w-5 h-5 mr-2" />
                {t('supplierStores:allProducts')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white pb-12 pt-1">
        <div className="container mx-auto px-4">
          {/* Filter controls */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 ${isRTL ? 'sm:' : ''}`}>
            <div className={`flex items-center ${isRTL ? '' : ''} w-full sm:w-auto`}>
              <h2 className={`text-xl sm:text-2xl font-semibold text-[#1a1a1a] ${isRTL ? 'text-right' : ''}`}>
                {t('supplierStores:browseStores')}
              </h2>
              <span className={`px-3 py-1 bg-[#e0d7c8] text-[#4a4a4a] rounded-full text-sm ${isRTL ? 'mr-3' : 'ml-3'}`}>
                {t('supplierStores:storesCount', { count: filteredStores.length })}
              </span>
            </div>
            <div className={`flex items-center gap-2 ${isRTL ? '' : ''} w-full sm:w-auto justify-between sm:justify-end`}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className="flex items-center gap-1 border-[#e0d7c8] text-[#2e4a2e] hover:bg-[#a68b00] hover:text-white transition-colors"
              >
                <Filter size={16} className={isRTL ? 'ml-1' : 'mr-1'} />
                {isFilterVisible ? t('supplierStores:hideFilters') : t('supplierStores:showFilters')}
              </Button>
              <div className="border-l h-6 mx-2 border-[#e0d7c8] hidden sm:block"></div>
              <div className="flex bg-white border rounded-md overflow-hidden border-[#e0d7c8]">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-none border-none ${
                    viewMode === "grid"
                      ? "bg-[#2e4a2e] text-white"
                      : "text-[#2e4a2e] hover:bg-[#e0d7c8]"
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={18} />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`rounded-none border-none ${
                    viewMode === "list"
                      ? "bg-[#2e4a2e] text-white"
                      : "text-[#2e4a2e] hover:bg-[#e0d7c8]"
                  }`}
                  aria-label="List view"
                >
                  <LayoutList size={18} />
                </Button>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder={t('supplierStores:searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} border border-[#e0d7c8] rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all duration-300`}
                dir={isRTL ? 'rtl' : 'ltr'}
                aria-label={t('supplierStores:searchPlaceholder')}
              />
              <Store className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              {searchTerm && (
                <button 
                  className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors`}
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters sidebar */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                isFilterVisible
                  ? "max-h-[2000px] opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden lg:max-h-[2000px] lg:opacity-100"
              }`}
            >
              <div className="bg-white border border-[#e0d7c8] rounded-lg shadow-sm p-4 md:p-6 sticky top-20">
                <h3 className={`text-lg font-semibold mb-4 text-[#1a1a1a] ${isRTL ? 'text-right' : ''}`}>
                  {t('supplierStores:filters')}
                </h3>
                
                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className={`text-sm font-medium text-gray-700 mb-3 ${isRTL ? 'text-right' : ''}`}>
                    {t('supplierStores:category')}
                  </h4>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e0d7c8] rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <option value="all">{t('supplierStores:allCategories')}</option>
                    <option value="feed_nutrition">{t('supplierStores:feedNutrition')}</option>
                    <option value="tack_equipment">{t('supplierStores:tackEquipment')}</option>
                    <option value="apparel_accessories">{t('supplierStores:apparelAccessories')}</option>
                    <option value="health_wellness">{t('supplierStores:healthWellness')}</option>
                    <option value="barn_stable">{t('supplierStores:barnStable')}</option>
                    <option value="riding_competition">{t('supplierStores:ridingCompetition')}</option>
                    <option value="other">{t('supplierStores:other')}</option>
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="mb-6">
                  <h4 className={`text-sm font-medium text-gray-700 mb-3 ${isRTL ? 'text-right' : ''}`}>
                    {t('supplierStores:sortBy')}
                  </h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e0d7c8] rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <option value="name">{t('supplierStores:nameAZ')}</option>
                    <option value="products">{t('supplierStores:mostProducts')}</option>
                    <option value="newest">{t('supplierStores:newest')}</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSortBy("name");
                    setSearchTerm("");
                  }}
                  className="w-full border-[#e0d7c8] text-[#2e4a2e] hover:bg-[#e0d7c8]"
                >
                  {t('supplierStores:clearFilters')}
                </Button>
              </div>
            </div>

            {/* Stores grid */}
            <div
              className={`${
                isFilterVisible ? "lg:col-span-3" : "col-span-full"
              }`}
            >
              {filteredStores.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-[#e0d7c8] p-6">
                  <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('supplierStores:noStoresFound')}</h3>
                  <p className="text-gray-500 max-w-md mx-auto">{t('supplierStores:noStoresMessage')}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSortBy("name");
                      setSearchTerm("");
                    }}
                    className="mt-4 border-[#e0d7c8] text-[#2e4a2e] hover:bg-[#e0d7c8]"
                  >
                    {t('supplierStores:clearFilters')}
                  </Button>
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === "grid" 
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                    : "grid-cols-1"
                }`}>
                  {filteredStores.map((store) => (
                    <StoreCard key={store.id} store={store} viewMode={viewMode} isRTL={isRTL} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Store Card Component
const StoreCard = ({ store, viewMode, isRTL }) => {
  const { t } = useTranslation();
  const isGridView = viewMode === "grid";

  // Function to get the appropriate icon for each platform
  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'website':
        return <Globe className="w-4 h-4" />;
      case 'facebook':
        return <FaFacebook className="w-4 h-4" />;
      case 'twitter':
        return <FaTwitter className="w-4 h-4" />;
      case 'youtube':
        return <FaYoutube className="w-4 h-4" />;
      case 'instagram':
        return <FaInstagram className="w-4 h-4" />;
      case 'linkedin':
        return <FaLinkedin className="w-4 h-4" />;
      case 'pinterest':
        return <FaPinterest className="w-4 h-4" />;
      case 'tiktok':
        return <FaTiktok className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  // Function to get platform-specific colors
  const getPlatformColor = (platform) => {
    switch (platform.toLowerCase()) {
      case 'website':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'facebook':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'twitter':
        return 'bg-sky-500 hover:bg-sky-600';
      case 'youtube':
        return 'bg-red-500 hover:bg-red-600';
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600';
      case 'linkedin':
        return 'bg-blue-700 hover:bg-blue-800';
      case 'pinterest':
        return 'bg-red-600 hover:bg-red-700';
      case 'tiktok':
        return 'bg-black hover:bg-gray-800';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer ${
        isGridView ? "" : "flex flex-col md:flex-row"
      } ${isRTL ? 'rtl' : 'ltr'}`} 
      onClick={() => window.location.href = `/SupplierStores/${store.id}`}
    >
      <div 
        className={`${
          isGridView 
            ? "aspect-video" 
            : "md:flex-shrink-0 md:w-1/3 w-full aspect-video"
        } overflow-hidden relative`}
      >
        <Image
          src={
            store.storeLogo 
              ? urlFor(store.storeLogo).url()
              : "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center"
          }
          alt={isRTL ? store.storeNameAr : store.storeNameEn}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          width={500}
          height={300}
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center";
          }}
        />
        <Badge className={`absolute ${isRTL ? 'top-3 left-3' : 'top-3 right-3'} bg-[#d4af37] hover:bg-[#b8860b]`}>
          {t('supplierStores:productsCount', { count: store.productCount })}
        </Badge>
      </div>

      <CardContent className={`p-4 ${isGridView ? "" : "md:flex-grow"}`}>
        <CardHeader className="p-0 mb-3">
          <CardTitle className={`text-xl font-semibold text-[#1a1a1a] mb-1 ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? store.storeNameAr : store.storeNameEn}
          </CardTitle>
          <CardDescription className={`text-gray-600 ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? store.storeNameEn : store.storeNameAr}
          </CardDescription>
        </CardHeader>

        <div className={`space-y-2 mb-4 ${isRTL ? 'text-right' : ''}`}>
          {store.storeAddress && (
            <div className={`flex items-center gap-2 text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">{store.storeAddress}</span>
            </div>
          )}
          {store.phone && (
            <div className={`flex items-center gap-2 text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{store.phone}</span>
            </div>
          )}
          {store.email && (
            <div className={`flex items-center gap-2 text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">{store.email}</span>
            </div>
          )}
        </div>

        {store.storeLinks && store.storeLinks.length > 0 && (
          <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'justify-end' : ''}`}>
            <div className="flex items-center gap-2 flex-wrap">
              {store.storeLinks.slice(0, 3).map((link, index) => (
                <a
                  key={index}
                  href={link.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-white transition-all duration-300 hover:scale-110 ${getPlatformColor(link.platform)}`}
                  title={link.platform}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={link.platform}
                >
                  {getPlatformIcon(link.platform)}
                </a>
              ))}
              {store.storeLinks.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{store.storeLinks.length - 3} {isRTL ? 'المزيد' : 'more'}
                </span>
              )}
            </div>
          </div>
        )}

        <div className={`flex items-center justify-between flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            variant="default"
            size="sm"
            className="bg-[#2e4a2e] hover:bg-[#1a3a1a] text-white transition-colors"
          >
            {t('supplierStores:viewStore')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/products?supplier=${store.id}`;
            }}
          >
            {t('supplierStores:seeAllProducts')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierStoresPage;
