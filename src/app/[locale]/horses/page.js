"use client";

import React, { useEffect, useState } from "react";
import { Search, Heart, Filter, X, Star, ChevronDown, Trophy, Award, Medal, Shield, DollarSign, Home, Dumbbell, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "components/layout/Layout";
import { client, urlFor } from "../../../lib/sanity";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import SearchableBreedDropdown from "../../../../components/elements/SearchableBreedDropdown";

const HorsePage = () => {
  const [horses, setHorses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

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
        <div className="relative h-64 bg-slate-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] bg-cover bg-center opacity-40" />
          </div>
          <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("horsePage:title")}</h1>
            <p className="text-lg md:text-xl text-center max-w-2xl">{t("horsePage:subtitle")}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-8">
          <div className="relative mb-6">
            <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 text-gray-400`} />
            <input
              type="text"
              placeholder={t("horsePage:searchPlaceholder")}
              className={`w-full ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"} py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={() => setFiltersVisible(!filtersVisible)}
              className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-blue-500 flex items-center gap-1 hover:text-blue-600 transition-colors`}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">{t("horsePage:filters")}</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {filtersVisible && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 transition-all border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-800 flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-blue-500" />
                  {t("horsePage:advancedFilters")}
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-500 flex items-center hover:text-blue-600 transition-colors"
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
                  <label className="block text-lg font-medium text-gray-700 mb-1">{t("horsePage:listingPurpose")}</label>
                  <div className="relative">
                    <select
                      name="listingPurpose"
                      value={filters.listingPurpose}
                      onChange={handleFilterChange}
                      className={`w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none ${isRTL ? "" : "pr-10"}`}
                    >
                      <option value="">{t("horsePage:allPurposes")}</option>
                      {PURPOSE_OPTIONS.map((purpose) => (
                        <option key={purpose.value} value={purpose.value}>
                          {isRTL ? purpose.title.split(" || ")[1] : purpose.title.split(" || ")[0]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4`} />
                  </div>
                </div>

                {/* Profile Level Filter */}
                <div className="mb-4">
                  <label className="block text-lg font-medium text-gray-700 mb-1">{t("horsePage:profileLevel") || "Profile Level"}</label>
                  <div className="relative">
                    <select
                      name="profileLevel"
                      value={filters.profileLevel}
                      onChange={handleFilterChange}
                      className={`w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none ${isRTL ? "" : "pr-10"}`}
                    >
                      <option value="">{t("horsePage:allLevels") || "All Levels"}</option>
                      {PROFILE_LEVEL_OPTIONS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {isRTL ? level.title.split(" || ")[1] : level.title.split(" || ")[0]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4`} />
                  </div>
                </div>

                {/* Average Rating Slider */}
                <div className="mb-4 col-span-1 md:col-span-2 lg:col-span-1">
                  <label className="block text-lg font-medium text-gray-700 mb-1">
                    {t("horsePage:averageRating") || "Average Rating"}: {filters.ratingRange.min} - {filters.ratingRange.max}
                  </label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{t("horsePage:min") || "Min"}</span>
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{t("horsePage:max") || "Max"}</span>
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">{t("horsePage:loading") || "Loading horses..."}</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredHorses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm p-8">
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">{t("horsePage:noMatchingHorses")}</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  {t("horsePage:clearAllFilters") || "Clear All Filters"}
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm text-gray-600">
                    {t("horsePage:showingResults", { count: filteredHorses.length, total: horses.length })}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">{t("horsePage:sortBy")}</label>
                    <div className="relative">
                      <select className={`p-2 border border-gray-300 rounded-md text-sm appearance-none ${isRTL ? "" : "pr-10"}`}>
                        <option value="newest">{t("horsePage:newest")}</option>
                        <option value="priceAsc">{t("horsePage:priceLowToHigh")}</option>
                        <option value="priceDesc">{t("horsePage:priceHighToLow")}</option>
                        <option value="ratingDesc">{t("horsePage:highestRated") || "Highest Rated"}</option>
                        <option value="popularity">{t("horsePage:popularity")}</option>
                      </select>
                      <ChevronDown className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4`} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHorses.map((horse) => {
                    const profileTier = getProfileTier(horse.profileLevel);
                    return (
                      <Card
                        key={horse._id}
                        className="hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                        onClick={() => router.push(`/horses/${horse._id}`)}
                      >
                        <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-t-lg relative">
                          <Image
                            src={horse.images && horse.images[0] ? urlFor(horse.images[0]).url() : "/api/placeholder/400/300"}
                            alt={horse.fullName || "horse"}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            width={400}
                            height={300}
                          />
                          {/* Enhanced badges container */}
                          <div className="absolute top-2 right-2 flex flex-col gap-2">
                            {horse.listingPurpose && (
                              <div
                                className={`text-xs px-3 py-1.5 rounded-full text-white font-medium shadow-sm flex items-center gap-1 ${getPurposeDetails(horse.listingPurpose).bgColor
                                  }`}
                              >
                                {getPurposeDetails(horse.listingPurpose).icon}
                                {t(`horsePage:purpose.${horse.listingPurpose}`) || t("horsePage:notSpecified")}
                              </div>
                            )}
                            {horse.profileLevel && (
                              <div className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${profileTier.color} flex items-center gap-1`}>
                                {profileTier.icon}
                                {profileTier.name}
                              </div>
                            )}
                          </div>
                        </div>
                        <CardHeader>
                          <CardTitle className="flex justify-between items-start">
                            <h3 className="text-xl font-semibold">{horse.fullName}</h3>
                            <span className="text-lg font-bold text-blue-500">
                              {horse.marketValue
                                ? t("horsePage:marketValue", { value: horse.marketValue })
                                : t("horsePage:marketValueNotAvailable")}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                            <p className="text-gray-600">
                              {t("horsePage:breed")}: <span className="font-medium">{getBreedName(horse.breed)}</span>
                            </p>
                            <p className="text-gray-600">
                              {t("horsePage:gender")}: <span className="font-medium">{t(`horsePage:gender.${horse.gender}`) || horse.gender}</span>
                            </p>
                            <p className="text-gray-600">
                              {t("horsePage:mainColor")}: <span className="font-medium">{getColorName(horse.mainColor)}</span>
                            </p>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Heart className="w-4 h-4 text-red-500" />
                              <span>
                                {horse.loveCounter || 0} {t("horsePage:likes")}
                              </span>
                            </div>
                          </div>

                          {/* Rating display */}
                          {horse.averageRating !== undefined && (
                            <div className="flex items-center mb-3 text-sm">
                              <div className="flex mr-1">
                                {renderStars(horse.averageRating)}
                              </div>
                              {/* <span className="text-gray-600">
                                ({horse.averageRating.toFixed(1)})
                              </span> */}
                            </div>
                          )}

                          <button className="w-full mt-2 py-2 text-blue-500 border border-blue-500 rounded-md hover:bg-blue-50 transition-colors">
                            {t("horsePage:viewDetails")}
                          </button>
                        </CardContent>
                      </Card>
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