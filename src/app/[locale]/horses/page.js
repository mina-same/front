"use client";

import React, { useEffect, useState } from "react";
import { Search, Heart, Filter, X, Star, ChevronDown, Trophy, Award, Medal, Shield, DollarSign, Home, Dumbbell, User, MapPin, Share2, Grid, List, ExternalLink, Palette, ImageOff } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "../../../../components/layout/Layout";
import { client, urlFor } from "@/lib/sanity";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import SearchableBreedDropdown from "../../../../components/elements/SearchableBreedDropdown";
import { v4 as uuidv4 } from "uuid";
import Preloader from "components/elements/Preloader";

const HorsePage = () => {
  
  
  const [horses, setHorses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [wishlistedHorses, setWishlistedHorses] = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const isArabic = i18n.language === "ar";

  // Filter states
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({
    breed: "",
    gender: "",
    mainColor: "",
    priceRange: { min: "", max: "" },
    listingPurpose: "",
    profileLevel: "",
    ratingRange: { min: 0, max: 5 }
  });

  // Active filters count badge
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Define schema-based filter options
  const COLOR_OPTIONS = [
    { title: "Grey || الأبيض", value: "grey" },
    { title: "Black || الأسود", value: "black" },
    { title: "Bay || الكميت", value: "bay" },
    { title: "Chestnut || الأشقر", value: "chestnut" },
    { title: "Dapple Grey || الرمادي المنقوش", value: "dappleGrey" },
    { title: "Pinto || الأبلق", value: "pinto" },
    { title: "Dark Black || الأدهم", value: "darkBlack" },
    { title: "Light Grey || الأشهب", value: "lightGrey" },
    { title: "Reddish Bay || الكميت", value: "reddishBay" },
    { title: "Golden Chestnut || الأشقر", value: "goldenChestnut" },
    { title: "Golden Yellow || الأصفر", value: "goldenYellow" },
    { title: "Blazed White || الأشعل", value: "blazedWhite" },
  ];

  const GENDER_OPTIONS = [
    { title: "Male || ذكر", value: "male" },
    { title: "Female || أنثى", value: "female" },
  ];

  const PURPOSE_OPTIONS = [
    { title: "Sale || بيع", value: "sale" },
    { title: "Rent || إيجار", value: "rent" },
    { title: "Training || تدريب", value: "training" },
    { title: "Personal Use || استعمال شخصي", value: "personalUse" },
  ];

  const PROFILE_LEVEL_OPTIONS = [
    { title: "Basic || أساسي", value: "basic" },
    { title: "Bronze || برونزي", value: "bronze" },
    { title: "Silver || فضي", value: "silver" },
    { title: "Gold || ذهبي", value: "gold" },
  ];

  useEffect(() => {
    const fetchHorses = async () => {
      try {
        const query = `*[_type == "horse"] {
          _id,
          fullName,
          breed,
          gender,
          mainColor,
          images,
          marketValue,
          listingPurpose,
          profileLevel,
          averageRating,
          loveCounter
        }`;

        const result = await client.fetch(query);
        setHorses(result);
      } catch (err) {
        console.error("Error fetching horses:", err);
        setError(t("horsePage:error"));
      } finally {
        setLoading(false);
      }
    };

    fetchHorses();
  }, [t]);

  // Update active filter count
  useEffect(() => {
    const count = Object.entries(filters).filter(([key, value]) => {
      if (key === "priceRange") {
        return value.min || value.max;
      } else if (key === "ratingRange") {
        return value.min > 0 || value.max < 5;
      }
      return value !== "";
    }).length;

    setActiveFilterCount(count);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePriceRangeChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: { ...prev.priceRange, [field]: value },
    }));
  };

  const handleRatingRangeChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      ratingRange: { ...prev.ratingRange, [field]: parseFloat(value) },
    }));
  };

  const clearFilters = () => {
    setFilters({
      breed: "",
      gender: "",
      mainColor: "",
      priceRange: { min: "", max: "" },
      listingPurpose: "",
      profileLevel: "",
      ratingRange: { min: 0, max: 5 }
    });
  };

  const filteredHorses = horses.filter((horse) => {
    const nameMatch = horse.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery;
    const breedMatch = !filters.breed || horse.breed === filters.breed;
    const genderMatch = !filters.gender || horse.gender === filters.gender;
    const colorMatch = !filters.mainColor || horse.mainColor === filters.mainColor;
    const priceMinMatch = !filters.priceRange.min || (horse.marketValue && horse.marketValue >= parseInt(filters.priceRange.min));
    const priceMaxMatch = !filters.priceRange.max || (horse.marketValue && horse.marketValue <= parseInt(filters.priceRange.max));
    const purposeMatch = !filters.listingPurpose || horse.listingPurpose === filters.listingPurpose;
    const levelMatch = !filters.profileLevel || horse.profileLevel === filters.profileLevel;
    const ratingMinMatch = horse.averageRating >= filters.ratingRange.min;
    const ratingMaxMatch = horse.averageRating <= filters.ratingRange.max;

    return nameMatch && breedMatch && genderMatch && colorMatch && priceMinMatch &&
      priceMaxMatch && purposeMatch && levelMatch && ratingMinMatch && ratingMaxMatch;
  });

  // Star rating renderer
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
    return stars;
  };

  // Get profile tier details
  const getProfileTier = (level) => {
    switch (level) {
      case "gold":
        return {
          name: t("user:horseRegistration.profileTier.gold"),
          level: "gold",
          color: "text-amber-500",
          message: t("user:horseRegistration.profileTier.goldMessage"),
          icon: <Trophy className="text-amber-500" size={20} />,
        };
      case "silver":
        return {
          name: t("user:horseRegistration.profileTier.silver"),
          level: "silver",
          color: "text-gray-400",
          message: t("user:horseRegistration.profileTier.silverMessage"),
          icon: <Award className="text-gray-400" size={20} />,
        };
      case "bronze":
        return {
          name: t("user:horseRegistration.profileTier.bronze"),
          level: "bronze",
          color: "text-orange-400",
          message: t("user:horseRegistration.profileTier.bronzeMessage"),
          icon: <Medal className="text-orange-400" size={20} />,
        };
      default:
        return {
          name: t("user:horseRegistration.profileTier.basic"),
          level: "basic",
          color: "text-gray-600",
          message: t("user:horseRegistration.profileTier.basicMessage"),
          icon: <Shield className="text-gray-600" size={20} />,
        };
    }
  };

  const getBreedName = (breedValue, language = 'en') => {
    const breedMap = {
      "purebredArabian": {
        "en": "Purebred Arabian",
        "ar": "حصان عربي أصيل"
      },
      "tibetanPony": {
        "en": "Tibetan Pony",
        "ar": "حصان تبتي"
      },
      "mongolianHorse": {
        "en": "Mongolian Horse",
        "ar": "حصان منغولي"
      },
      "andalusian": {
        "en": "Andalusian",
        "ar": "أندلسي"
      },
      "friesian": {
        "en": "Friesian",
        "ar": "فريزي"
      },
      "hungarianHorse": {
        "en": "Hungarian Horse",
        "ar": "حصان مجري"
      },
      "bulgarianHorse": {
        "en": "Bulgarian Horse",
        "ar": "حصان بلغاري"
      },
      "uzbekHorse": {
        "en": "Uzbek Horse",
        "ar": "حصان أوزبكي"
      },
      "afghanHorse": {
        "en": "Afghan Horse",
        "ar": "حصان أفغاني"
      },
      "turkishHorse": {
        "en": "Turkish Horse",
        "ar": "حصان تركي"
      },
      "persianHorse": {
        "en": "Persian Horse",
        "ar": "حصان فارسي"
      },
      "kurdishHorse": {
        "en": "Kurdish Horse",
        "ar": "حصان كردي"
      },
      "armenianHorse": {
        "en": "Armenian Horse",
        "ar": "حصان أرمني"
      },
      "georgianHorse": {
        "en": "Georgian Horse",
        "ar": "حصان جورجي"
      },
      "abkhazianHorse": {
        "en": "Abkhazian Horse",
        "ar": "حصان أبخازي"
      },
      "altaiHorse": {
        "en": "Altai Horse",
        "ar": "حصان ألتاي"
      },
      "bashkirHorse": {
        "en": "Bashkir Horse",
        "ar": "حصان باشكيري"
      },
      "tatarHorse": {
        "en": "Tatar Horse",
        "ar": "حصان تتاري"
      },
      "kirghizHorse": {
        "en": "Kirghiz Horse",
        "ar": "حصان قيرغيزي"
      },
      "tajikHorse": {
        "en": "Tajik Horse",
        "ar": "حصان طاجيكي"
      },
      "turkmenHorse": {
        "en": "Turkmen Horse",
        "ar": "حصان تركماني"
      },
      "karakalpakUzbekHorse": {
        "en": "Karakalpak Uzbek Horse",
        "ar": "حصان قره قلباق أوزبكي"
      },
      "kazakhHorse": {
        "en": "Kazakh Horse",
        "ar": "حصان كازاخي"
      },
      "donHorse": {
        "en": "Don Horse",
        "ar": "حصان دون"
      },
      "kubanHorse": {
        "en": "Kuban Horse",
        "ar": "حصان كوبان"
      },
      "belarusianHorse": {
        "en": "Belarusian Horse",
        "ar": "حصان بيلاروسي"
      },
      "ukrainianHorse": {
        "en": "Ukrainian Horse",
        "ar": "حصان أوكراني"
      },
      "polishHorse": {
        "en": "Polish Horse",
        "ar": "حصان بولندي"
      },
      "czechHorse": {
        "en": "Czech Horse",
        "ar": "حصان تشيكي"
      },
      "slovakHorse": {
        "en": "Slovak Horse",
        "ar": "حصان سلوفاكي"
      },
      "hungarianHorse2": {
        "en": "Hungarian Horse",
        "ar": "حصان مجري"
      },
      "romanianHorse": {
        "en": "Romanian Horse",
        "ar": "حصان روماني"
      },
      "shaggyBulgarianHorse": {
        "en": "Shaggy Bulgarian Horse",
        "ar": "حصان بلغاري مجعد"
      },
      "greekHorse": {
        "en": "Greek Horse",
        "ar": "حصان يوناني"
      },
      "anatolianHorse": {
        "en": "Anatolian Horse",
        "ar": "حصان أناضولي"
      },
      "persianBlueHorse": {
        "en": "Persian Blue Horse",
        "ar": "حصان فارسي أزرق"
      },
      "hazaragiHorse": {
        "en": "Hazaragi Horse",
        "ar": "حصان هزارة"
      },
      "pashtunHorse": {
        "en": "Pashtun Horse",
        "ar": "حصان بشتوني"
      },
      "marwari": {
        "en": "Marwari",
        "ar": "مارواري"
      },
      "nepalesePony": {
        "en": "Nepalese Pony",
        "ar": "حصان نيبالي"
      },
      "bhutanesePony": {
        "en": "Bhutanese Pony",
        "ar": "حصان بوتاني"
      },
      "thaiPony": {
        "en": "Thai Pony",
        "ar": "حصان تايلاندي"
      },
      "cambodianPony": {
        "en": "Cambodian Pony",
        "ar": "حصان كمبودي"
      },
      "vietnamesePony": {
        "en": "Vietnamese Pony",
        "ar": "حصان فيتنامي"
      },
      "laotianPony": {
        "en": "Laotian Pony",
        "ar": "حصان لاوسي"
      },
      "burmesePony": {
        "en": "Burmese Pony",
        "ar": "حصان ميانماري"
      },
      "manchuHorse": {
        "en": "Manchu Horse",
        "ar": "حصان منشوري"
      },
      "kisoHorse": {
        "en": "Kiso Horse",
        "ar": "حصان كيسو"
      },
      "koreanHorse": {
        "en": "Korean Horse",
        "ar": "حصان كوري"
      },
      "bayankhongorMongolianHorse": {
        "en": "Bayankhongor Mongolian Horse",
        "ar": "حصان منغولي بايانخونغور"
      },
      "khentiiMongolianHorse": {
        "en": "Khentii Mongolian Horse",
        "ar": "حصان منغولي خينتي"
      },
      "tibetanPony2": {
        "en": "Tibetan Pony",
        "ar": "حصان تبتي"
      },
      "nepalesePony2": {
        "en": "Nepalese Pony",
        "ar": "حصان نيبالي"
      },
      "bhutanesePony2": {
        "en": "Bhutanese Pony",
        "ar": "حصان بوتاني"
      },
      "thaiPony2": {
        "en": "Thai Pony",
        "ar": "حصان تايلاندي"
      },
      "cambodianPony2": {
        "en": "Cambodian Pony",
        "ar": "حصان كمبودي"
      },
      "vietnamesePony2": {
        "en": "Vietnamese Pony",
        "ar": "حصان فيتنامي"
      },
      "laotianPony2": {
        "en": "Laotian Pony",
        "ar": "حصان لاوسي"
      },
      "burmesePony2": {
        "en": "Burmese Pony",
        "ar": "حصان ميانماري"
      },
      "manchuHorse2": {
        "en": "Manchu Horse",
        "ar": "حصان منشوري"
      },
      "kisoHorse2": {
        "en": "Kiso Horse",
        "ar": "حصان كيسو"
      },
      "koreanHorse2": {
        "en": "Korean Horse",
        "ar": "حصان كوري"
      },
      "bayankhongorMongolianHorse2": {
        "en": "Bayankhongor Mongolian Horse",
        "ar": "حصان منغولي بايانخونغور"
      },
      "khentiiMongolianHorse2": {
        "en": "Khentii Mongolian Horse",
        "ar": "حصان منغولي خينتي"
      },
      "tibetanPony3": {
        "en": "Tibetan Pony",
        "ar": "حصان تبتي"
      },
      "nepalesePony3": {
        "en": "Nepalese Pony",
        "ar": "حصان نيبالي"
      },
      "bhutanesePony3": {
        "en": "Bhutanese Pony",
        "ar": "حصان بوتاني"
      },
      "thaiPony3": {
        "en": "Thai Pony",
        "ar": "حصان تايلاندي"
      },
      "cambodianPony3": {
        "en": "Cambodian Pony",
        "ar": "حصان كمبودي"
      },
      "vietnamesePony3": {
        "en": "Vietnamese Pony",
        "ar": "حصان فيتنامي"
      },
      "laotianPony3": {
        "en": "Laotian Pony",
        "ar": "حصان لاوسي"
      },
      "burmesePony3": {
        "en": "Burmese Pony",
        "ar": "حصان ميانماري"
      },
      "manchuHorse3": {
        "en": "Manchu Horse",
        "ar": "حصان منشوري"
      },
      "kisoHorse3": {
        "en": "Kiso Horse",
        "ar": "حصان كيسو"
      },
      "koreanHorse3": {
        "en": "Korean Horse",
        "ar": "حصان كوري"
      },
      "arabian": {
        "en": "Arabian",
        "ar": "عربي"
      },
      "spanishAndalusian": {
        "en": "Spanish Andalusian",
        "ar": "أندلسي إسباني"
      },
      "thoroughbred": {
        "en": "Thoroughbred",
        "ar": "صميم النسل"
      },
      "frenchHorse": {
        "en": "French Horse",
        "ar": "حصان فرنسي"
      },
      "germanHorse": {
        "en": "German Horse",
        "ar": "حصان ألماني"
      },
      "italianHorse": {
        "en": "Italian Horse",
        "ar": "حصان إيطالي"
      },
      "belgianDraft": {
        "en": "Belgian Draft",
        "ar": "حصان بلجيكي ضخم"
      },
      "dutchHorse": {
        "en": "Dutch Horse",
        "ar": "حصان هولندي"
      },
      "danishHorse": {
        "en": "Danish Horse",
        "ar": "حصان دنماركي"
      },
      "norwegianFjord": {
        "en": "Norwegian Fjord",
        "ar": "حصان نرويجي فيورد"
      },
      "swedishHorse": {
        "en": "Swedish Horse",
        "ar": "حصان سويدي"
      },
      "finnhorse": {
        "en": "Finnhorse",
        "ar": "حصان فنلندي"
      },
      "estonianHorse": {
        "en": "Estonian Horse",
        "ar": "حصان إستوني"
      },
      "latvianHorse": {
        "en": "Latvian Horse",
        "ar": "حصان لاتفي"
      },
      "lithuanianHorse": {
        "en": "Lithuanian Horse",
        "ar": "حصان ليتواني"
      },
      "konik": {
        "en": "Konik",
        "ar": "كونيك"
      },
      "donHorse2": {
        "en": "Don Horse",
        "ar": "حصان دون"
      },
      "kubanHorse2": {
        "en": "Kuban Horse",
        "ar": "حصان كوبان"
      },
      "ukrainianHorse2": {
        "en": "Ukrainian Horse",
        "ar": "حصان أوكراني"
      },
      "belarusianHorse2": {
        "en": "Belarusian Horse",
        "ar": "حصان بيلاروسي"
      }
    };

    if (!isRTL) {
      return `${breedMap[breedValue]?.en || breedValue}`;
    } else {
      return `${breedMap[breedValue]?.ar || breedValue}`;
    }
  };

  const getColorName = (colorValue, language = 'en') => {
    const colorMap = {
      "grey": {
        "en": "Grey / White",
        "ar": "رمادي / أبيض"
      },
      "black": {
        "en": "Black",
        "ar": "أسود"
      },
      "bay": {
        "en": "Bay",
        "ar": "حناء"
      },
      "chestnut": {
        "en": "Chestnut",
        "ar": "كستنائي"
      },
      "dappleGrey": {
        "en": "Dapple Grey",
        "ar": "رمادي مرقط"
      },
      "silverDapple": {
        "en": "Silver Dapple",
        "ar": "فضي مرقط"
      }
    };

    if (!isRTL) {
      return `${colorMap[colorValue]?.en || colorValue}`;
    } else {
      return `${colorMap[colorValue]?.ar || colorValue}`;
    }
  };

  const getPurposeDetails = (purpose) => {
    switch (purpose) {
      case "sale":
        return {
          bgColor: "bg-green-500",
          icon: <DollarSign className="w-3 h-3" />,
        };
      case "rent":
        return {
          bgColor: "bg-blue-500",
          icon: <Home className="w-3 h-3" />,
        };
      case "training":
        return {
          bgColor: "bg-purple-500",
          icon: <Dumbbell className="w-3 h-3" />,
        };
      case "personalUse":
        return {
          bgColor: "bg-orange-500",
          icon: <User className="w-3 h-3" />,
        };
      default:
        return {
          bgColor: "bg-gray-500",
          icon: null, // No icon for unspecified
        };
    }
  };

  return (
    <Layout>
      <div className={`min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 ${isRTL ? "rtl" : "ltr"}`}>
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
                {t("horsePage:title")}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-600">
                  {t("horsePage:subtitle")}
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 leading-relaxed opacity-90">
                {t("horsePage:subtitle")}
              </p>
            </div>
          </div>

          {/* Floating scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white opacity-70" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
            <div className="bg-card rounded-2xl shadow-2xl p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className={`absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5`} />
                  <input
                    type="text"
                    placeholder={t('horsePage:searchPlaceholder')}
                    className={`w-full ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-xl border-2 border-input bg-background focus:border-primary focus:ring-2 focus:ring-ring/50 outline-none transition-all duration-300 text-lg`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setFiltersVisible(!filtersVisible)}
                    className={`px-4 py-4 rounded-xl border-2 ${filtersVisible ? 'border-primary text-primary' : 'border-input text-foreground'} bg-background hover:border-primary outline-none transition-all duration-300 flex items-center gap-2 relative ${activeFilterCount > 0 ? "pr-10" : ""}`}
                  >
                    <Filter className="w-5 h-5" />
                    <span>{t("horsePage:filters")}</span>
                    {activeFilterCount > 0 && (
                      <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

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
                {t('horsePage:showingResults', { count: filteredHorses.length, total: horses.length })}
              </div>
            </div>

          {filtersVisible && (
            <div className="bg-card rounded-xl shadow-xl p-6 mb-8 border border-border/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-foreground flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-primary" />
                  {t("horsePage:advancedFilters")}
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary flex items-center hover:text-primary/80 transition-colors p-2 rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t("horsePage:clearFilters")}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Breed Filter with SearchableBreedDropdown */}
                <div className="mb-4">
                  <SearchableBreedDropdown
                    formData={filters}
                    handleChange={handleFilterChange}
                    t={t}
                    isRTL={isRTL}
                    formGroupClass=""
                  />
                </div>

                {/* Gender Filter */}
                <div className="mb-4">
                  <label className="block text-lg font-medium text-gray-700 mb-1">{t("horsePage:gender")}</label>
                  <div className="relative">
                    <select
                      name="gender"
                      value={filters.gender}
                      onChange={handleFilterChange}
                      className={`w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none ${isRTL ? "" : "pr-10"}`}
                    >
                      <option value="">{t("horsePage:allGenders")}</option>
                      {GENDER_OPTIONS.map((gender) => (
                        <option key={gender.value} value={gender.value}>
                          {isRTL ? gender.title.split(" || ")[1] : gender.title.split(" || ")[0]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4`} />
                  </div>
                </div>

                {/* Color Filter */}
                <div className="mb-4">
                  <label className="block text-lg font-medium text-gray-700 mb-1">{t("horsePage:mainColor")}</label>
                  <div className="relative">
                    <select
                      name="mainColor"
                      value={filters.mainColor}
                      onChange={handleFilterChange}
                      className={`w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none ${isRTL ? "" : "pr-10"}`}
                    >
                      <option value="">{t("horsePage:allColors")}</option>
                      {COLOR_OPTIONS.map((color) => (
                        <option key={color.value} value={color.value}>
                          {isRTL ? color.title.split(" || ")[1] : color.title.split(" || ")[0]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4`} />
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-4">
                  <label className="block text-lg font-medium text-gray-700 mb-1">{t("horsePage:priceRange")}</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder={t("horsePage:min")}
                      className="w-1/2 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={filters.priceRange.min}
                      onChange={(e) => handlePriceRangeChange("min", e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder={t("horsePage:max")}
                      className="w-1/2 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={filters.priceRange.max}
                      onChange={(e) => handlePriceRangeChange("max", e.target.value)}
                    />
                  </div>
                </div>

                {/* Listing Purpose */}
                <div className="mb-4">
                  <label className="block text-lg font-medium text-foreground mb-1">{t("horsePage:listingPurpose")}</label>
                  <div className="relative">
                    <select
                      name="listingPurpose"
                      value={filters.listingPurpose}
                      onChange={handleFilterChange}
                      className={`w-full p-3 border-2 border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-primary bg-background outline-none transition-all duration-300 appearance-none ${isRTL ? "" : "pr-10"}`}
                    >
                      <option value="">{t("horsePage:allPurposes")}</option>
                      {PURPOSE_OPTIONS.map((purpose) => (
                        <option key={purpose.value} value={purpose.value}>
                          {isRTL ? purpose.title.split(" || ")[1] : purpose.title.split(" || ")[0]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none h-4 w-4`} />
                  </div>
                </div>

                {/* Profile Level Filter */}
                <div className="mb-4">
                  <label className="block text-lg font-medium text-foreground mb-1">{t("horsePage:profileLevel") || "Profile Level"}</label>
                  <div className="relative">
                    <select
                      name="profileLevel"
                      value={filters.profileLevel}
                      onChange={handleFilterChange}
                      className={`w-full p-3 border-2 border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-primary bg-background outline-none transition-all duration-300 appearance-none ${isRTL ? "" : "pr-10"}`}
                    >
                      <option value="">{t("horsePage:allLevels") || "All Levels"}</option>
                      {PROFILE_LEVEL_OPTIONS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {isRTL ? level.title.split(" || ")[1] : level.title.split(" || ")[0]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none h-4 w-4`} />
                  </div>
                </div>

                {/* Average Rating Slider */}
                <div className="mb-4 col-span-1 md:col-span-2 lg:col-span-1">
                  <label className="block text-lg font-medium text-foreground mb-1">
                    {t("horsePage:averageRating") || "Average Rating"}: {filters.ratingRange.min} - {filters.ratingRange.max}
                  </label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t("horsePage:min") || "Min"}</span>
                      <div className="flex">
                        {renderStars(filters.ratingRange.min)}
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={filters.ratingRange.min}
                      onChange={(e) => handleRatingRangeChange("min", e.target.value)}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t("horsePage:max") || "Max"}</span>
                      <div className="flex">
                        {renderStars(filters.ratingRange.max)}
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={filters.ratingRange.max}
                      onChange={(e) => handleRatingRangeChange("max", e.target.value)}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-md flex items-center justify-between">
                <span>
                  {t("horsePage:showingResults", { count: filteredHorses.length, total: horses.length })}
                </span>
                <button
                  onClick={() => setFiltersVisible(false)}
                  className="text-blue-500 hover:text-blue-700 transition-colors font-medium"
                >
                  {t("horsePage:applyFilters") || "Apply Filters"}
                </button>
              </div>
            </div>
          )}

          <div className="py-8">
            {loading ? (
              <Preloader />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
              </div>
            ) : filteredHorses.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg shadow-sm p-8">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">{t("horsePage:noMatchingHorses")}</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  {t("horsePage:clearAllFilters") || "Clear All Filters"}
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm text-muted-foreground">
                    {t("horsePage:showingResults", { count: filteredHorses.length, total: horses.length })}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-foreground">{t("horsePage:sortBy")}</label>
                    <div className="relative">
                      <select className={`p-2 border border-input rounded-md text-sm appearance-none ${isRTL ? "" : "pr-10"}`}>
                        <option value="newest">{t("horsePage:newest")}</option>
                        <option value="priceAsc">{t("horsePage:priceLowToHigh")}</option>
                        <option value="priceDesc">{t("horsePage:priceHighToLow")}</option>
                        <option value="ratingDesc">{t("horsePage:highestRated") || "Highest Rated"}</option>
                        <option value="popularity">{t("horsePage:popularity")}</option>
                      </select>
                      <ChevronDown className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none h-4 w-4`} />
                    </div>
                  </div>
                </div>

                <div className={`grid gap-8 ${viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
                  }`}>
                  {filteredHorses.map((horse, index) => {
                    const profileTier = getProfileTier(horse.profileLevel);
                    const isWishlisted = wishlistedHorses.has(horse._id);
                    return (
                      <div
                        key={horse._id}
                        className={`group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${viewMode === 'list' ? 'flex' : ''} animate-in fade-in slide-in-from-bottom-5`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Image */}
                        <div 
                          className={`relative overflow-hidden ${viewMode === 'list' ? 'w-80 flex-shrink-0' : 'aspect-video'}`}
                        >
                          <Image
                            src={horse.images && horse.images[0] ? urlFor(horse.images[0]).url() : "/api/placeholder/800/600"}
                            alt={horse.fullName || "horse"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            width={800}
                            height={600}
                          />
                          
                          {/* Overlay Actions */}
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle wishlist toggle logic
                                console.log('Toggle wishlist for:', horse._id);
                              }}
                              className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 ${isWishlisted
                                ? 'bg-destructive text-destructive-foreground'
                                : 'bg-background/80 text-foreground hover:bg-background'
                                }`}
                            >
                              {isWishlisted ? (
                                <Heart className="h-5 w-5 fill-current" />
                              ) : (
                                <Heart className="h-5 w-5" />
                              )}
                            </button>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle share logic
                                console.log('Share horse:', horse._id);
                              }}
                              className="p-2 rounded-full bg-background/80 text-foreground hover:bg-background backdrop-blur-md transition-all duration-300"
                            >
                              <Share2 className="h-5 w-5" />
                            </button>
                          </div>
                          
                          {/* Rating Badge */}
                          {horse.averageRating && (
                            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1">
                              <Star className="w-4 h-4 fill-gold text-gold" />
                              <span className="font-semibold text-sm">{horse.averageRating}</span>
                            </div>
                          )}
                          
                          {/* Purpose Badge */}
                          {horse.listingPurpose && (
                            <div
                              className={`absolute bottom-4 left-4 text-xs px-4 py-2 rounded-full text-white font-bold shadow-sm flex items-center gap-1 ${getPurposeDetails(horse.listingPurpose).bgColor}`}
                            >
                              {getPurposeDetails(horse.listingPurpose).icon}
                              {t(`horsePage:purpose.${horse.listingPurpose}`) || t("horsePage:notSpecified")}
                            </div>
                          )}
                          
                          {/* Profile Level Badge */}
                          {horse.profileLevel && (
                            <div className={`absolute bottom-4 right-4 text-xs px-3 py-1.5 rounded-full bg-gray-100/80 backdrop-blur-sm ${profileTier.color} flex items-center gap-1`}>
                              {profileTier.icon}
                              {profileTier.name}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6 flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <h3 
                              className="text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300 cursor-pointer"
                              onClick={() => router.push(`/horses/${horse._id}`)}
                            >
                              {horse.fullName}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-2 text-muted-foreground mb-4">
                            <MapPin className="w-4 h-4" />
                            <span>{horse.location || t('horsePage:locationNotSpecified')}</span>
                          </div>
                          
                          <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                            {horse.description || t('horsePage:descriptionNotAvailable')}
                          </p>
                          
                          {/* Features/Attributes */}
                          <div className="flex flex-wrap gap-2 mb-6">
                            <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-medium">
                              {getBreedName(horse.breed)}
                            </span>
                            <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-medium">
                              {t(`horsePage:gender.${horse.gender}`) || horse.gender}
                            </span>
                            <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-medium">
                              {getColorName(horse.mainColor)}
                            </span>
                          </div>
                          
                          {/* Price */}
                          <div className="mb-6">
                            <span className="text-lg font-bold text-primary">
                              {horse.marketValue
                                ? t("horsePage:marketValue", { value: horse.marketValue })
                                : t("horsePage:marketValueNotAvailable")}
                            </span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <button 
                              onClick={() => router.push(`/horses/${horse._id}`)}
                              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                            >
                              {t("horsePage:viewDetails")}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle external link logic
                                console.log('External link for:', horse._id);
                              }}
                              className="p-3 border-2 border-border hover:border-primary rounded-xl transition-all duration-300 hover:bg-accent"
                            >
                              <ExternalLink className="w-5 h-5 text-muted-foreground hover:text-primary" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HorsePage;