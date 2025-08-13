"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  ArrowLeft,
  Package2,
  Star,
  Users,
  Calendar,
  Shield,
  Award,
  Globe
} from "lucide-react";
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
import { client, urlFor } from "../../../../lib/sanity";
import ProductsList from "../../../../../components/product/ProductsList";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const StoreDetailPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        // Fetch store details
        const storeQuery = `*[_type == "user" && _id == $storeId && userType == "suppliers"] {
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
            certifications
          }
        }`;

        const storeData = await client.fetch(storeQuery, { storeId });
        
        if (!storeData || storeData.length === 0) {
          setError("Store not found");
          setLoading(false);
          return;
        }

        const storeInfo = storeData[0];
        setStore({
          id: storeInfo._id,
          userName: storeInfo.userName,
          email: storeInfo.email,
          phone: storeInfo.phone,
          storeNameEn: storeInfo.supplierDetails?.storeNameEn || storeInfo.userName,
          storeNameAr: storeInfo.supplierDetails?.storeNameAr || storeInfo.userName,
          storeLogo: storeInfo.supplierDetails?.storeLogo,
          storeLinks: storeInfo.supplierDetails?.storeLinks || [],
          storeLocationLink: storeInfo.supplierDetails?.storeLocationLink,
          storeAddress: storeInfo.supplierDetails?.storeAddress,
          certifications: storeInfo.supplierDetails?.certifications,
        });

        // Fetch store products
        const productsQuery = `*[_type == "product" && supplier._ref == $storeId] {
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
          images[] {
            asset-> {
              url
            }
          }
        }`;

        const products = await client.fetch(productsQuery, { storeId });

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
          supplier: { _id: storeId, userName: storeInfo.userName, email: storeInfo.email, phone: storeInfo.phone },
        }));

        setStoreProducts(formattedProducts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching store details:", err);
        setError("Failed to load store details. Please try again later.");
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStoreDetails();
    }
  }, [storeId]);

  // Function to get the appropriate icon for each platform
  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'website':
        return <Globe className="w-5 h-5" />;
      case 'facebook':
        return <FaFacebook className="w-5 h-5" />;
      case 'twitter':
        return <FaTwitter className="w-5 h-5" />;
      case 'youtube':
        return <FaYoutube className="w-5 h-5" />;
      case 'instagram':
        return <FaInstagram className="w-5 h-5" />;
      case 'linkedin':
        return <FaLinkedin className="w-5 h-5" />;
      case 'pinterest':
        return <FaPinterest className="w-5 h-5" />;
      case 'tiktok':
        return <FaTiktok className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
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
          <Button 
            onClick={() => router.back()} 
            className="mt-4 bg-[#2e4a2e] hover:bg-[#1a3a1a] text-white"
          >
            {t('supplierStores:backToStores')}
          </Button>
        </div>
      </Layout>
    );
  }

  if (!store) {
    return (
      <Layout className="min-h-screen bg-[#f8f1e9]">
        <div className="container mx-auto py-12 px-4 text-center">
          <p className="text-[#1a1a1a] text-lg">Store not found</p>
          <Button 
            onClick={() => router.back()} 
            className="mt-4 bg-[#2e4a2e] hover:bg-[#1a3a1a] text-white"
          >
            {t('supplierStores:backToStores')}
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-[#f8f1e9]">
      {/* Back Button */}
      <div className="bg-white border-b border-[#e0d7c8]">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className={`flex items-center gap-2 text-[#2e4a2e] hover:bg-[#e0d7c8] ${isRTL ? '' : ''}`}
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {t('supplierStores:backToStores')}
          </Button>
        </div>
      </div>

      {/* Store Header */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className={`flex flex-col lg:flex-row gap-8 ${isRTL ? '' : ''}`}>
            {/* Store Logo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border border-[#e0d7c8]">
                <Image
                  src={
                    store.storeLogo 
                      ? urlFor(store.storeLogo).url()
                      : "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center"
                  }
                  alt={isRTL ? store.storeNameAr : store.storeNameEn}
                  className="w-full h-full object-cover"
                  width={128}
                  height={128}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center";
                  }}
                />
              </div>
            </div>

            {/* Store Info */}
            <div className="flex-grow">
              <div className={`flex items-start justify-between mb-4 ${isRTL ? '' : ''}`}>
                <div>
                  <h1 className={`text-3xl font-bold text-[#1a1a1a] mb-2 ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? store.storeNameAr : store.storeNameEn}
                  </h1>
                  <p className={`text-xl text-gray-600 mb-4 ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? store.storeNameEn : store.storeNameAr}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#d4af37] text-white px-3 py-1">
                    {t('supplierStores:productsCount', { count: storeProducts.length })}
                  </Badge>
                </div>
              </div>

              {/* Contact Info */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ${isRTL ? 'text-right' : ''}`}>
                {store.storeAddress && (
                  <div className={`flex items-center gap-2 text-gray-600 ${isRTL ? '' : ''}`}>
                    <MapPin className="w-5 h-5 text-[#d4af37]" />
                    <span>{store.storeAddress}</span>
                  </div>
                )}
                {store.phone && (
                  <div className={`flex items-center gap-2 text-gray-600 ${isRTL ? '' : ''}`}>
                    <Phone className="w-5 h-5 text-[#d4af37]" />
                    <a href={`tel:${store.phone}`} className="hover:text-[#d4af37]">
                      {store.phone}
                    </a>
                  </div>
                )}
                {store.email && (
                  <div className={`flex items-center gap-2 text-gray-600 ${isRTL ? '' : ''}`}>
                    <Mail className="w-5 h-5 text-[#d4af37]" />
                    <a href={`mailto:${store.email}`} className="hover:text-[#d4af37]">
                      {store.email}
                    </a>
                  </div>
                )}
                {store.storeLocationLink && (
                  <div className={`flex items-center gap-2 text-gray-600 ${isRTL ? '' : ''}`}>
                    <ExternalLink className="w-5 h-5 text-[#d4af37]" />
                    <a 
                      href={store.storeLocationLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-[#d4af37]"
                    >
                      {t('supplierStores:visitStore')}
                    </a>
                  </div>
                )}
              </div>

              {/* Store Links */}
              {store.storeLinks && store.storeLinks.length > 0 && (
                <div className={`flex items-center gap-4 mb-6 ${isRTL ? '' : ''}`}>
                  <span className={`text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                    {t('supplierStores:followUs')}
                  </span>
                  <div className="flex items-center gap-3">
                    {store.storeLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center w-10 h-10 rounded-full text-white transition-all duration-300 hover:scale-110 ${getPlatformColor(link.platform)}`}
                        title={link.platform}
                      >
                        {getPlatformIcon(link.platform)}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {store.certifications && (
                <div className={`flex items-center gap-2 text-green-600 ${isRTL ? '' : ''}`}>
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">{t('supplierStores:certifiedSupplier')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Store Stats */}
      <div className="bg-[#f8f1e9] py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <Package2 className="w-8 h-8 text-[#d4af37] mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-[#1a1a1a]">{storeProducts.length}</h3>
              <p className="text-gray-600">{t('supplierStores:totalProducts')}</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <Star className="w-8 h-8 text-[#d4af37] mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-[#1a1a1a]">
                {storeProducts.length > 0 
                  ? (storeProducts.reduce((acc, product) => acc + (product.averageRating || 0), 0) / storeProducts.length).toFixed(1)
                  : "0.0"
                }
              </h3>
              <p className="text-gray-600">{t('supplierStores:averageRating')}</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <Users className="w-8 h-8 text-[#d4af37] mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-[#1a1a1a]">
                {storeProducts.filter(p => p.stock > 0).length}
              </h3>
              <p className="text-gray-600">{t('supplierStores:inStock')}</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <Award className="w-8 h-8 text-[#d4af37] mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-[#1a1a1a]">
                {storeProducts.filter(p => p.listingType === "rent").length}
              </h3>
              <p className="text-gray-600">{t('supplierStores:forRent')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between mb-8 ${isRTL ? '' : ''}`}>
            <div>
              <h2 className={`text-2xl font-bold text-[#1a1a1a] mb-2 ${isRTL ? 'text-right' : ''}`}>
                {t('supplierStores:storeProducts')}
              </h2>
              <p className={`text-gray-600 ${isRTL ? 'text-right' : ''}`}>
                {t('supplierStores:browseAllProducts', { storeName: isRTL ? store.storeNameAr : store.storeNameEn })}
              </p>
            </div>
            <Button
              onClick={() => router.push(`/products?supplier=${store.id}`)}
              className="bg-[#2e4a2e] hover:bg-[#1a3a1a] text-white"
            >
              {t('supplierStores:viewAllProducts')}
            </Button>
          </div>

          {storeProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('supplierStores:noProductsAvailable')}</h3>
              <p className="text-gray-500">{t('supplierStores:noProductsMessage')}</p>
            </div>
          ) : (
            <ProductsList
              products={storeProducts}
              searchTerm=""
              viewMode="grid"
              className="bg-white"
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StoreDetailPage; 