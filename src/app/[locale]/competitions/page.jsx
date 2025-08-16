"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Heart,
  Diamond,
  Flower,
  Users,
  Eye,
  Calendar,
  Trophy,
  Zap,
  Crown,
  Star,
  ArrowRight,
  Play,
  MapPin,
  Clock,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Layout from "components/layout/Layout";
import Preloader from "components/elements/Preloader";
import { fetchCountries, fetchGovernorates, fetchCities, urlFor } from "@/lib/sanity";
import { useRouter } from "next/navigation";

const Index = () => {
  const { locale } = useParams();
  const isAr = locale === 'ar';
  const { t } = useTranslation('competitionsPage');
  const [userPoints] = useState(1500);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | live | upcoming | ended
  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    fetchCompetitions();
  }, []);

  // Verify auth to know current user
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/api/auth/verify', { credentials: 'include' });
        const data = await resp.json();
        if (resp.ok && data.authenticated) setCurrentUserId(data.user.id);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Load countries for filters
  useEffect(() => {
    fetchCountries().then((data) => setCountries(data || [])).catch(() => setCountries([]));
  }, []);

  // Load governorates and cities cascaded + refetch
  useEffect(() => {
    if (!selectedCountry) {
      setGovernorates([]);
      setSelectedGovernorate("");
      setCities([]);
      setSelectedCity("");
      fetchCompetitions();
      return;
    }
    fetchGovernorates(selectedCountry)
      .then((data) => setGovernorates(data || []))
      .catch(() => setGovernorates([]));
    setSelectedGovernorate("");
    setCities([]);
    setSelectedCity("");
    // server-side filter
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/competitions?countryId=${encodeURIComponent(selectedCountry)}`);
        const data = await res.json();
        setCompetitions(data.competitions || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedCountry, fetchCompetitions]);

  useEffect(() => {
    if (!selectedGovernorate) {
      setCities([]);
      setSelectedCity("");
      if (selectedCountry) {
        (async () => {
          try {
            setLoading(true);
            const res = await fetch(`/api/competitions?countryId=${encodeURIComponent(selectedCountry)}`);
            const data = await res.json();
            setCompetitions(data.competitions || []);
          } finally {
            setLoading(false);
          }
        })();
      }
      return;
    }
    fetchCities(selectedGovernorate)
      .then((data) => setCities(data || []))
      .catch(() => setCities([]));
    setSelectedCity("");
    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ countryId: selectedCountry, governorateId: selectedGovernorate });
        const res = await fetch(`/api/competitions?${params.toString()}`);
        const data = await res.json();
        setCompetitions(data.competitions || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedGovernorate, selectedCountry]);

  useEffect(() => {
    if (!selectedCity) return;
    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ countryId: selectedCountry, governorateId: selectedGovernorate, cityId: selectedCity });
        const res = await fetch(`/api/competitions?${params.toString()}`);
        const data = await res.json();
        setCompetitions(data.competitions || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedCity]);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/competitions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch competitions');
      }

      const data = await response.json();
      setCompetitions(data.competitions || []);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (competition) => {
    const now = new Date();
    const competitionDate = new Date(competition.date);
    const isLive = competitionDate <= now && competitionDate.getTime() + (2 * 60 * 60 * 1000) >= now; // 2 hours window
    const isUpcoming = competitionDate > now;

    if (isLive) {
      return {
        text: t('status.live'),
        className: "bg-gradient-to-r from-red-50 to-orange-50 text-red-600 border-red-300 shadow-lg animate-pulse"
      };
    } else if (isUpcoming) {
      return {
        text: t('status.soon'),
        className: "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border-blue-300"
      };
    } else {
      return {
        text: t('status.ended'),
        className: "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border-gray-300"
      };
    }
  };

  // Derived status for filtering
  const getStatus = (competition) => {
    const now = new Date();
    const competitionDate = new Date(competition.date);
    const isLive = competitionDate <= now && competitionDate.getTime() + (2 * 60 * 60 * 1000) >= now;
    const isUpcoming = competitionDate > now;
    if (isLive) return "live";
    if (isUpcoming) return "upcoming";
    return "ended";
  };

  // Apply filters client-side
  const filteredCompetitions = competitions.filter((c) => {

    const status = getStatus(c);
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    const matchesCountry = !selectedCountry || c.country?._id === selectedCountry;
    const matchesGovernorate = !selectedGovernorate || c.government?._id === selectedGovernorate;
    const matchesCity = !selectedCity || c.city?._id === selectedCity;

    return matchesStatus && matchesCountry && matchesGovernorate && matchesCity;
  });

  // Split into mine vs others using existing user id used in UI
  const myUserId = 'T0eOwKMYMus7b7gAYV3Hzw';
  const filteredMine = filteredCompetitions.filter((c) => c.createdBy?._id === myUserId);
  const filteredOthers = filteredCompetitions.filter((c) => c.createdBy?._id !== myUserId);

  const renderCompetitionCard = (competition, index) => {
    const statusBadge = getStatusBadge(competition);
    const isLive = getStatus(competition) === "live";
    const imageSrc = competition.image ? urlFor(competition.image).width(800).height(450).url() : null;
    const locationText = isAr
      ? (competition.city?.name_ar || competition.government?.name_ar || competition.country?.name_ar || competition.location || '—')
      : (competition.city?.name_en || competition.government?.name_en || competition.country?.name_en || competition.location || '—');
    const locationHref = (competition.location && /^https?:\/\//i.test(competition.location)) ? competition.location : null;
    const isOwner = currentUserId && competition.createdBy?._id === currentUserId;
    const notStarted = new Date(competition.date) > new Date();

    return (
      <div
        key={competition._id}
        className="group relative overflow-hidden rounded-3xl bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-100 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
        style={{ animationDelay: `${index * 0.1}s` }}
        onClick={() => router.push(`/${locale}/competitions/${competition._id}`)}
      >
        {/* Image header */}
        <div className="relative h-40 w-full overflow-hidden">
          {imageSrc ? (
            <img src={imageSrc} alt={competition.nameEn || competition.nameAr} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 text-5xl">🐎</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {/* Status badge */}
          <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} z-10`}>
            <div className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 ${statusBadge.className}`}>
              {statusBadge.text}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Competition name */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors" dir={isAr ? 'rtl' : 'ltr'}>
              {isAr ? (competition.nameAr || competition.nameEn) : (competition.nameEn || competition.nameAr)}
            </h3>
          </div>

          {/* Prize section */}
          <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700 text-sm font-bold">
                    {t('card.competition')}
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-800">{t('card.ready')}</div>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          {/* Competition details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-xl">
                <MapPin className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-gray-700 font-medium">
                {locationHref && (
                  <>
                    <a
                      href={locationHref}
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-blue-600 hover:underline ${isAr ? 'mr-1' : 'ml-1'}`}
                    >
                      {t('card.goToLocation')}
                    </a>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2 bg-cyan-100 rounded-xl">
                <Clock className="w-4 h-4 text-cyan-600" />
              </div>
              <span className="text-gray-700 font-medium">
                {formatDate(competition.date)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-gray-700 font-medium">
                {t('card.organizedBy', { name: competition.createdBy?.fullName || competition.createdBy?.userName || '' })}
              </span>
            </div>
          </div>

          {/* Live viewers for active battles */}
          {isLive && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl border-2 border-emerald-200 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold text-sm">
                    {t('card.liveNow')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
                  <Star className="w-4 h-4 text-amber-500 animate-pulse" />
                  <Diamond className="w-4 h-4 text-cyan-500 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Action + Edit buttons */}
          <div className="flex gap-3">
          <button
            className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              isLive
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 shadow-lg hover:shadow-xl"
                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl"
            }`}
          >
            {isLive ? (
              <>
                <Play className="w-5 h-5" />
                {t('card.watch')}
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                {t('card.view')}
              </>
            )}
          </button>
          {isOwner && notStarted && (
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/${locale}/competitions/${competition._id}/edit`); }}
              className="px-4 py-3 rounded-2xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              title={t('card.edit')}
            >
              {t('card.edit')}
            </button>
          )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <Preloader />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full opacity-30 animate-pulse"></div>
          <div
            className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rotate-45 opacity-20 animate-bounce"
            style={{ animationDuration: "3s" }}
          ></div>
          <div
            className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-full opacity-25 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rotate-12 opacity-20 animate-bounce"
            style={{ animationDelay: "2s", animationDuration: "4s" }}
          ></div>

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[length:40px_40px] opacity-30"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-6 py-16">
          {/* Hero Section */}
          <div className="text-center mb-20">
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 mb-8 bg-gradient-to-r from-purple-50 to-cyan-50 border-2 border-purple-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-pulse"></div>
              <Sparkles
                className="w-4 h-4 text-purple-600 animate-spin"
                style={{ animationDuration: "3s" }}
              />
              <span className="text-sm font-bold text-gray-700 group-hover:text-purple-700 transition-colors">
                {t('hero.badge')}
              </span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>

            {/* Main title with creative styling */}
            <div className="relative mb-8">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-purple-600 to-cyan-600 mb-4 leading-tight tracking-tight">
                {t('hero.title')}
              </h1>
              <div className="absolute -top-4 -right-4 text-4xl animate-bounce">
                ⚡
              </div>
              <div className="absolute -bottom-2 -left-6 text-3xl animate-pulse">
                🏆
              </div>
            </div>

            <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              {t('hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button 
                onClick={() => router.push(`/${locale}/competitions/add-competition`)}
                className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-purple-200 transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-3">
                  <Crown className="w-6 h-6" />
                  <span className="text-lg">{t('hero.ctaCreate')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button className="group px-10 py-5 border-3 border-gray-300 text-gray-700 font-bold rounded-2xl hover:border-purple-400 hover:text-purple-600 transition-all duration-300 flex items-center gap-3">
                <Play className="w-5 h-5" />
                <span className="text-lg">{t('hero.ctaWatch')}</span>
              </button>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="group relative p-8 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-500 hover:scale-105 cursor-pointer">
                <div className="absolute top-4 right-4 text-2xl">🔥</div>
                <div className="text-5xl font-black text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
                  {competitions.length}
                </div>
                <div className="text-gray-700 font-bold text-lg mb-2">
                  {t('stats.activeBattles')}
                </div>
                <div className="text-sm text-gray-500">{t('stats.joinNow')}</div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-600 font-semibold">
                    LIVE NOW
                  </span>
                </div>
              </div>

              <div className="group relative p-8 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-3xl border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-100 transition-all duration-500 hover:scale-105 cursor-pointer">
                <div className="absolute top-4 right-4 text-2xl">⚡</div>
                <div className="text-5xl font-black text-cyan-600 mb-3 group-hover:scale-110 transition-transform">
                  {userPoints.toLocaleString()}
                </div>
                <div className="text-gray-700 font-bold text-lg mb-2">
                  {t('stats.yourPoints')}
                </div>
                <div className="text-sm text-gray-500">{t('stats.ready')}</div>
                <div className="mt-4 flex items-center gap-1">
                  <Users className="w-4 h-4 text-cyan-600" />
                  <TrendingUp className="w-4 h-4 text-cyan-600" />
                </div>
              </div>

              <div className="group relative p-8 bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl border-2 border-amber-200 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-100 transition-all duration-500 hover:scale-105 cursor-pointer">
                <div className="absolute top-4 right-4 text-2xl">💎</div>
                <div className="text-5xl font-black text-amber-600 mb-3 group-hover:scale-110 transition-transform">
                  ∞
                </div>
                <div className="text-gray-700 font-bold text-lg mb-2">
                  {t('stats.totalRewards')}
                </div>
                <div className="text-sm text-gray-500">{t('stats.available')}</div>
                <div className="mt-4 flex items-center gap-1">
                  <Diamond className="w-4 h-4 text-amber-600 animate-pulse" />
                  <Trophy className="w-4 h-4 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Trending Battles Section */}
          <div className="mb-20">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12">
              <div className="flex items-center gap-6 mb-6 md:mb-0">
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 shadow-2xl">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                    {t('sections.allCompetitions')}
                  </h2>
                  <p className="text-gray-600 text-base md:text-lg">
                    {t('sections.sub')}
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-10 p-5 rounded-2xl border-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">{t('filters.title')}</h3>
                <button
                  onClick={() => { setStatusFilter("all"); setSelectedCountry(""); setSelectedGovernorate(""); setSelectedCity(""); fetchCompetitions(); }}
                  className="px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold"
                >
                  {t('filters.clear')}
                </button>
              </div>

              {/* Status pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { key: 'all', label: t('filters.status.all') },
                  { key: 'live', label: t('filters.status.live') },
                  { key: 'upcoming', label: t('filters.status.upcoming') },
                  { key: 'ended', label: t('filters.status.ended') },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setStatusFilter(opt.key)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition ${
                      statusFilter === opt.key
                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Location selects */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('filters.country')}</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none bg-white"
                  >
                    <option value="">{t('filters.allCountries')}</option>
                    {countries.map((c) => (
                      <option key={c._id} value={c._id}>
                        {isAr ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('filters.governorate')}</label>
                  <select
                    value={selectedGovernorate}
                    onChange={(e) => setSelectedGovernorate(e.target.value)}
                    disabled={!selectedCountry}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none bg-white disabled:opacity-50"
                  >
                    <option value="">{t('filters.allGovernorates')}</option>
                    {governorates.map((g) => (
                      <option key={g._id} value={g._id}>
                        {isAr ? (g.name_ar || g.name_en) : (g.name_en || g.name_ar)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('filters.city')}</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedGovernorate}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none bg-white disabled:opacity-50"
                  >
                    <option value="">{t('filters.allCities')}</option>
                    {cities.map((c) => (
                      <option key={c._id} value={c._id}>
                        {isAr ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                {statusFilter !== 'all' && (
                  <button onClick={() => setStatusFilter('all')} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100">
                    {t(`filters.status.${statusFilter}`)}
                    <span className={isAr ? 'mr-2' : 'ml-2'}>✕</span>
                  </button>
                )}
                {selectedCountry && (
                  <button onClick={() => setSelectedCountry('')} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100">
                    {t('filters.country')}
                    <span className={isAr ? 'mr-2' : 'ml-2'}>✕</span>
                  </button>
                )}
                {selectedGovernorate && (
                  <button onClick={() => setSelectedGovernorate('')} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100">
                    {t('filters.governorate')}
                    <span className={isAr ? 'mr-2' : 'ml-2'}>✕</span>
                  </button>
                )}
                {selectedCity && (
                  <button onClick={() => setSelectedCity('')} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100">
                    {t('filters.city')}
                    <span className={isAr ? 'mr-2' : 'ml-2'}>✕</span>
                  </button>
                )}
              </div>
            </div>

            {/* User's Created Competitions */}
            {filteredMine.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Crown className="w-6 h-6 text-purple-600" />
                  {t('sections.mine')}
                </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredMine.map((competition, index) => renderCompetitionCard(competition, index))}
                        </div>
                      </div>
                    )}

            {/* Active/Other Competitions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredCompetitions.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="text-6xl mb-4">🏇</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('empty.title')}</h3>
                  <p className="text-gray-600 mb-6">{t('empty.desc')}</p>
                    <button
                    onClick={() => router.push(`/${locale}/competitions/add-competition`)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-8 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  >
                    {t('empty.cta')}
                    </button>
                </div>
              ) : (
                filteredOthers.map((competition, index) => renderCompetitionCard(competition, index))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
