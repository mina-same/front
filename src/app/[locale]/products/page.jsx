"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "../../../components/ui/button";
import ProductFilter from "../../../../components/product/ProductFilter";
import ProductsList from "../../../../components/product/ProductsList";
import { Package2, Filter, LayoutGrid, LayoutList } from "lucide-react";
import Layout from "components/layout/Layout";
import { client } from "../../../lib/sanity";
import { useTranslation } from "react-i18next";
import TranslationsProvider from "../../../../components/TranslationsProvider";

export const ProductsPageContent = () => {
  const { t } = useTranslation(['productsPage', 'product']);
  const params = useParams();
  const isRtl = params.locale === 'ar';

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get query parameters
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  // Ref for the carousel container
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const collections = [
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

  // Duplicate collections for infinite loop
  const duplicatedCollections = [...collections, ...collections];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = `*[_type == "product"] {
          _id,
          name_en,
          name_ar,
          description_en,
          description_ar,
          price,
          originalPrice,
          listingType,
          category,
          stock,
          averageRating,
          ratingCount,
          rentalDurationUnit,
          supplier-> {
            _id,
            userName,
            email,
            phone
          },
          images[] {
            asset-> {
              url
            }
          }
        }`;
        const products = await client.fetch(query);

        const formattedProducts = products.map((product) => ({
          id: product._id,
          name_en: product.name_en,
          name_ar: product.name_ar,
          description_en: product.description_en || "",
          description_ar: product.description_ar || "",
          price: product.price,
          originalPrice: product.originalPrice,
          listingType: product.listingType,
          category: product.category,
          images: product.images
            ? product.images.map((img) => img.asset.url).filter(Boolean)
            : ["/placeholder.svg"],
          stock: product.stock || 0,
          averageRating: product.averageRating || 0,
          ratingCount: product.ratingCount || 0,
          rentalDurationUnit: product.rentalDurationUnit || null,
          supplier: product.supplier || { _id: DEFAULT_SUPPLIER_ID, userName: "Unknown", email: "", phone: "" },
        }));

        setAllProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Auto-scrolling animation
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        // Reset to 0 when reaching the original collections length
        if (nextIndex >= collections.length) {
          // Use setTimeout to allow transition to complete before resetting
          setTimeout(() => {
            if (carouselRef.current) {
              carouselRef.current.style.transition = "none";
              setCurrentIndex(0);
            }
          }, 700); // Match transition duration
          return nextIndex % collections.length;
        }
        return nextIndex;
      });
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [isPaused, collections.length]);

  // Reset transition after instant jump
  useEffect(() => {
    if (currentIndex === 0 && carouselRef.current) {
      setTimeout(() => {
        carouselRef.current.style.transition = "transform 0.7s ease-in-out";
      }, 50);
    }
  }, [currentIndex]);

  if (loading) {
    return (
      <Layout className="min-h-screen bg-[#f8f1e9]">
        <div className="container mx-auto py-12 px-4 text-center">
          <p className="text-[#1a1a1a] text-lg">{t('loading')}</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout className="min-h-screen bg-[#f8f1e9]">
        <div className="container mx-auto py-12 px-4 text-center">
          <p className="text-[#1a1a1a] text-lg">{error || t('error')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-[#f8f1e9]" dir={isRtl ? 'rtl' : 'ltr'}>
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
        <div className="container mx-auto relative z-10 py-16 md:py-20 px-4">
          <div className="flex flex-col items-center text-center mb-6">
            <Package2 size={42} className="mb-4 animate-fade-in text-white" />
            <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight text-white">
              {t('hero.title')}
            </h1>
            <p className="text-base md:text-xl opacity-90 max-w-2xl mx-auto text-white">
              {t('hero.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Featured Collections Banner */}
      <div className="pt-4 pb-8 bg-white">
        <div className="container mx-auto px-4">
          <div
            className="relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              ref={carouselRef}
              className="flex snap-x snap-mandatory"
              style={{
                transform: `translateX(-${currentIndex * (256 + 16)}px)`,
                transition: "transform 0.7s ease-in-out",
              }}
            >
              {duplicatedCollections.map((collection, index) => (
                <div
                  key={`${collection.category}-${index}`}
                  className={`flex-shrink-0 w-64 h-48 mx-2 snap-center relative rounded-lg overflow-hidden group shadow-md cursor-pointer transition-transform duration-300 ${
                    index % collections.length === currentIndex
                      ? "scale-105"
                      : "scale-100"
                  }`}
                  onClick={() => {
                    window.location.href = `?category=${collection.category}`;
                  }}
                >
                  <Image
                    src={collection.image}
                    alt={collection.title}
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
                    className={`absolute inset-0 bg-gradient-to-t ${collection.color} to-transparent opacity-80 z-10`}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="text-center">
                    <h3 className="text-white text-lg font-bold drop-shadow-lg mb-1">
                      {isRtl ? collection.titleAr : collection.title}
                    </h3>
                    <p className="text-white/90 text-sm drop-shadow-lg">
                      {isRtl ? collection.title : collection.titleAr}
                    </p>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white pb-12 pt-1">
        <div className="container mx-auto px-4">
          {/* Filter controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center">
              <h2 className="text-xl md:text-2xl font-semibold text-[#1a1a1a]">
                {t('browse.title')}
              </h2>
              <span className={`${isRtl ? 'mr-3' : 'ml-3'} px-3 py-1 bg-[#e0d7c8] text-[#4a4a4a] rounded-full text-sm`}>
                {filteredProducts.length} {t('browse.items')}
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className="flex items-center gap-1 border-[#e0d7c8] text-[#2e4a2e] hover:bg-[#a68b00] hover:text-white transition-colors"
              >
                <Filter size={16} className={isRtl ? 'ml-1' : 'mr-1'} />
                {isFilterVisible ? t('browse.hideFilters') : t('browse.showFilters')}
              </Button>
              <div className="border-l h-6 mx-2 border-[#e0d7c8]"></div>
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
                >
                  <LayoutList size={18} />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
            {/* Filters sidebar */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                isFilterVisible
                  ? "max-h-[2000px] opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden lg:hidden"
              }`}
            >
              <ProductFilter
                onFilterChange={setFilteredProducts}
                initialProducts={allProducts}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                initialCategory={initialCategory}
                className="bg-white border border-[#e0d7c8] rounded-lg shadow-sm"
                isRtl={isRtl}
              />
            </div>

            {/* Products grid */}
            <div
              className={`${
                isFilterVisible ? "lg:col-span-3" : "col-span-full"
              }`}
            >
              <ProductsList
                products={filteredProducts}
                searchTerm={searchTerm}
                viewMode={viewMode}
                className="bg-white border border-[#e0d7c8] rounded-lg shadow-sm"
                isRtl={isRtl}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ProductsPage = ({ params }) => {
  const unwrappedParams = React.use(params);
  return (
    <TranslationsProvider 
      locale={unwrappedParams.locale} 
      namespaces={['productsPage', 'product']}
    >
      <ProductsPageContent />
    </TranslationsProvider>
  );
};

export default ProductsPage;
