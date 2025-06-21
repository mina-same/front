"use client";

import React, { useEffect, useState } from 'react';
import { Search, MapPin, Phone, Mail, ExternalLink, Star, ChevronDown, Heart, Share2, Grid, List } from 'lucide-react';
import Layout from 'components/layout/Layout';
import { client, urlFor } from '../../../lib/sanity';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { v4 as uuidv4 } from "uuid"; 

const HorseStablesPage = () => {
  const [stables, setStables] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [wishlistedStables, setWishlistedStables] = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [priceFilter, setPriceFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  useEffect(() => {
    const fetchStables = async () => {
      try {
        const query = `*[_type == "stables" && statusAdminApproved == true] {
          _id,
          name_en,
          name_ar,
          about_en,
          about_ar,
          boardingDetails,
          images,
          city->{name_ar, name_en},
          servicePhone,
          serviceEmail,
          links,
          serviceAverageRating,
          kindOfStable
        }`;

        const result = await client.fetch(query);
        setStables(result);
      } catch (err) {
        console.error('Error fetching horse stables:', err);
        setError(t('stablesPage:errorMessage'));
      } finally {
        setLoading(false);
      }
    };

    const verifyAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok)
          throw new Error(`Verify API failed with status: ${response.status}`);
        const data = await response.json();
        if (data.authenticated) {
          const userId = data.userId || data.user?.id || data.user?.userId;
          setCurrentUserId(userId);
          const userQuery = `*[_type == "user" && _id == $userId][0]{wishlistStables[]->{_id}}`;
          const userData = await client.fetch(userQuery, { userId });
          const stableIds = userData?.wishlistStables?.map((s) => s._id) || [];
          setWishlistedStables(new Set(stableIds));
        }
      } catch (error) {
        console.error("Auth verification failed:", error.message);
      }
    };

    fetchStables();
    verifyAuth();
  }, [t]);

  const filteredStables = stables.filter(stable => {
    const matchesSearch = (stable.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stable.name_ar?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPrice = priceFilter === 'all' ||
      (priceFilter === 'low' && stable.boardingDetails?.boardingPrice < 2000) ||
      (priceFilter === 'medium' && stable.boardingDetails?.boardingPrice >= 2000 && stable.boardingDetails?.boardingPrice < 3000) ||
      (priceFilter === 'high' && stable.boardingDetails?.boardingPrice >= 3000);

    const matchesCity = cityFilter === 'all' || (isArabic ? stable.city?.name_ar === cityFilter : stable.city?.name_en === cityFilter);

    return matchesSearch && matchesPrice && matchesCity;
  });

  const toggleWishlist = async (stableId) => {
    if (!currentUserId) {
      alert(t('stablesPage:loginToWishlist')); // Replace with AlertNotification
      router.push("/login");
      return;
    }

    const cleanStableId = stableId.replace('drafts.', '');
    setWishlistLoading(true);

    try {
      const userQuery = `*[_type == "user" && _id == $userId][0]{wishlistStables[]->{_id}}`;
      const userData = await client.fetch(userQuery, { userId: currentUserId });
      const wishlistStables = userData?.wishlistStables?.map((s) => s._id) || [];
      const isWishlisted = wishlistStables.includes(cleanStableId);

      if (isWishlisted) {
        const index = wishlistStables.findIndex((id) => id === cleanStableId);
        if (index === -1) {
          alert(t('stablesPage:errors.stableNotInWishlist')); // Replace with AlertNotification
          return;
        }
        await client
          .patch(currentUserId)
          .unset([`wishlistStables[${index}]`])
          .commit();
        setWishlistedStables((prev) => {
          const newSet = new Set(prev);
          newSet.delete(cleanStableId);
          alert(t('stablesPage:removedFromWishlist')); // Replace with AlertNotification
          return newSet;
        });
      } else {
        const wishlistItem = {
          _key: uuidv4(),
          _type: "reference",
          _ref: cleanStableId,
        };
        await client
          .patch(currentUserId)
          .setIfMissing({ wishlistStables: [] })
          .append("wishlistStables", [wishlistItem])
          .commit();
        setWishlistedStables((prev) => {
          const newSet = new Set(prev);
          newSet.add(cleanStableId);
          alert(t('stablesPage:addedToWishlist')); // Replace with AlertNotification
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert(t('stablesPage:wishlistUpdateFailed')); // Replace with AlertNotification
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = async (stable) => {
    const url = `${window.location.origin}/Stables/${stable._id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: isArabic ? stable.name_ar : stable.name_en,
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert(t('stablesPage:linkCopied'));
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const LoadingCard = () => (
    <div className="bg-card rounded-2xl overflow-hidden shadow-lg animate-pulse">
      <div className="h-48 bg-muted"></div>
      <div className="p-6">
        <div className="h-6 bg-muted rounded mb-3"></div>
        <div className="h-4 bg-muted rounded mb-2"></div>
        <div className="h-4 bg-muted rounded w-3/4"></div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className={`min-h-screen ${isArabic ? 'rtl' : 'ltr'}`}>
        {/* Hero Section */}
        <div className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1920&h=1080&fit=crop"
              alt="Hero"
              className="w-full h-full object-cover"
              width={1920}
              height={1080}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          </div>

          <div className="relative h-full flex flex-col justify-center px-4 max-w-7xl mx-auto">
            <div className="text-white max-w-3xl animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                {t('stablesPage:heroTitle')}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-600">
                  {t('stablesPage:heroSubtitle')}
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 leading-relaxed opacity-90">
                {t('stablesPage:heroDescription')}
              </p>

            </div>
          </div>

          {/* Floating scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white opacity-70" />
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
          <div className="bg-card rounded-2xl shadow-2xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className={`absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5`} />
                <input
                  type="text"
                  placeholder={t('stablesPage:searchPlaceholder')}
                  className={`w-full ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-xl border-2 border-input bg-background focus:border-primary focus:ring-2 focus:ring-ring/50 outline-none transition-all duration-300 text-lg`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="px-4 py-4 rounded-xl border-2 border-input bg-background focus:border-primary outline-none"
                >
                  <option value="all">{t('stablesPage:filters.allPrices')}</option>
                  <option value="low">{t('stablesPage:filters.lowPrice')}</option>
                  <option value="medium">{t('stablesPage:filters.mediumPrice')}</option>
                  <option value="high">{t('stablesPage:filters.highPrice')}</option>
                </select>

                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="px-4 py-4 rounded-xl border-2 border-input bg-background focus:border-primary outline-none"
                >
                  <option value="all">{t('stablesPage:filters.allCities')}</option>
                  {[...new Set(stables.map(stable => isArabic ? stable.city?.name_ar : stable.city?.name_en).filter(Boolean))].map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                {/* View Toggle */}
                <div className="flex bg-muted rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg transition-all duration-300 ${viewMode === 'grid'
                      ? 'bg-background shadow-md text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg transition-all duration-300 ${viewMode === 'list'
                      ? 'bg-background shadow-md text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-gray-600">
              {t('stablesPage:resultsDescription')}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 max-w-md mx-auto">
                <p className="text-destructive text-lg">{error}</p>
              </div>
            </div>
          ) : filteredStables.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-muted border border-border rounded-2xl p-8 max-w-md mx-auto">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">{t('stablesPage:noResults')}</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPriceFilter('all');
                    setCityFilter('all');
                  }}
                  className="mt-4 text-primary hover:text-primary/80 font-medium"
                >
                  {t('stablesPage:clearFilters')}
                </button>
              </div>
            </div>
          ) : (
            <div className={`grid gap-8 ${viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
              }`}>
              {filteredStables.map((stable, index) => (
                <div
                  key={stable._id}
                  className={`group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in ${viewMode === 'list' ? 'flex' : ''
                    }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-80 flex-shrink-0' : 'aspect-video'
                    }`}>
                    <Image
                      src={stable.images?.[0] ? urlFor(stable.images[0]).url() : '/api/placeholder/800/600'}
                      alt={isArabic ? stable.name_ar : stable.name_en}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      width={800}
                      height={600}
                    />

                    {/* Overlay Actions */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => toggleWishlist(stable._id)}
                        disabled={wishlistLoading}
                        className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 ${wishlistedStables.has(stable._id.replace('drafts.', ''))
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-background/80 text-foreground hover:bg-background'
                          }`}
                      >
                        {wishlistLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Heart className={`w-5 h-5 ${wishlistedStables.has(stable._id.replace('drafts.', '')) ? 'fill-current' : ''}`} />
                        )}
                      </button>
                      <button
                        onClick={() => handleShare(stable)}
                        className="p-2 rounded-full bg-background/80 text-foreground hover:bg-background backdrop-blur-md transition-all duration-300"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Rating Badge */}
                    {stable.serviceAverageRating && (
                      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1">
                        <Star className="w-4 h-4 fill-gold text-gold" />
                        <span className="font-semibold text-sm">{stable.serviceAverageRating}</span>
                      </div>
                    )}

                    {/* Price Badge */}
                    <div className="absolute bottom-4 left-4 bg-primary text-primary-foreground rounded-full px-4 py-2 font-bold">
                      {stable.boardingDetails?.boardingPrice
                        ? `${stable.boardingDetails.boardingPrice} ${t('stablesPage:currency')}/${t(`stablesPage:priceUnits.${stable.boardingDetails.boardingPriceUnit}`)}`
                        : t('stablesPage:priceOnRequest')}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h3
                        className="text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300 cursor-pointer"
                        onClick={() => router.push(`/Stables/${stable._id.replace('drafts.', '')}`)}
                      >
                        {isArabic ? stable.name_ar : stable.name_en}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{isArabic ? stable.city?.name_ar : stable.city?.name_en}</span>
                    </div>

                    <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                      {isArabic ? stable.about_ar : stable.about_en}
                    </p>

                    {/* Features */}
                    {stable.kindOfStable?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {stable.kindOfStable.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-medium"
                          >
                            {t(`stablesPage:stableTypes.${feature}`)}
                          </span>
                        ))}
                        {stable.kindOfStable.length > 3 && (
                          <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                            +{stable.kindOfStable.length - 3} {t('stablesPage:more')}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-3 mb-6">
                      {stable.servicePhone && (
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <div className="p-2 bg-success/10 rounded-lg">
                            <Phone className="w-4 h-4 text-success" />
                          </div>
                          <span className="font-medium">{stable.servicePhone}</span>
                        </div>
                      )}
                      {stable.serviceEmail && (
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <div className="p-2 bg-info/10 rounded-lg">
                            <Mail className="w-4 h-4 text-info" />
                          </div>
                          <span className="font-medium">{stable.serviceEmail}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => router.push(`/Stables/${stable._id.replace('drafts.', '')}`)}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                      >
                        {t('stablesPage:viewDetails')}
                      </button>
                      {stable.links?.[0] && (
                        <a
                          href={stable.links[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 border-2 border-border hover:border-primary rounded-xl transition-all duration-300 hover:bg-accent"
                        >
                          <ExternalLink className="w-5 h-5 text-muted-foreground hover:text-primary" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
          }

          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default HorseStablesPage;
