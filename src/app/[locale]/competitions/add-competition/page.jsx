"use client";
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Upload,
  Calendar,
  MapPin,
  Video,
  User,
  ImageIcon,
  Crown,
  Star,
  Gift,
  Zap,
  Flame,
  Search,
  X,
  Check,
  FileText,
  Link,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Layout from "components/layout/Layout";
import Preloader from "components/elements/Preloader";
import { fetchCountries, fetchGovernorates, fetchCities } from "@/lib/sanity";
import Image from "next/image";

// Layout: Clean white background, minimal color, matches site base layout.
// For all Card, div, and Button backgrounds, use bg-white or no background color (remove gradients and colored backgrounds). Keep borders and text as neutral (gray) as possible.

// --- Main CreateCompetition Component ---
const CreateCompetition = () => {
  const { t, i18n } = useTranslation("addCompetition");
  const router = useRouter();
  const isArabic = i18n.language === 'ar';
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    locationLink: "",
    address: "",
    streamLink: "",
    about: "",
    horseName: "",
    surpriseHorseName: "",
    competitionImage: null,
    date: "",
    time: "",
    country: "",
    governorate: "",
    city: "",
  });
  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [competitionId, setCompetitionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState("");
  const [invitationCreated, setInvitationCreated] = useState(false);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth, router]);

  // Fetch countries once
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await fetchCountries();
        setCountries(data || []);
      } catch (e) {
        console.error("Failed to fetch countries", e);
      }
    };
    loadCountries();
  }, []);

  // Fetch governorates when country changes
  useEffect(() => {
    const loadGovernorates = async () => {
      if (!selectedCountry) {
        setGovernorates([]);
        setSelectedGovernorate("");
        setCities([]);
        setSelectedCity("");
        return;
      }
      try {
        const data = await fetchGovernorates(selectedCountry);
        setGovernorates(data || []);
        setSelectedGovernorate("");
        setCities([]);
        setSelectedCity("");
        setFormData((prev) => ({ ...prev, governorate: "", city: "" }));
      } catch (e) {
        console.error("Failed to fetch governorates", e);
      }
    };
    loadGovernorates();
  }, [selectedCountry]);

  // Fetch cities when governorate changes
  useEffect(() => {
    const loadCities = async () => {
      if (!selectedGovernorate) {
        setCities([]);
        setSelectedCity("");
        return;
      }
      try {
        const data = await fetchCities(selectedGovernorate);
        setCities(data || []);
        setSelectedCity("");
        setFormData((prev) => ({ ...prev, city: "" }));
      } catch (e) {
        console.error("Failed to fetch cities", e);
      }
    };
    loadCities();
  }, [selectedGovernorate]);

  const verifyAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        setCurrentUserId(data.user.id);
        setIsAuthenticated(true);
      } else {
        toast({
          title: t("validation.authRequired"),
          description: t("validation.authRequiredDesc"),
          variant: "destructive",
        });
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      toast({
        title: t("validation.authError"),
        description: t("validation.authErrorDesc"),
        variant: "destructive",
      });
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result.split(',')[1]; // Remove data:image/...;base64, prefix
        setFormData((prev) => ({ 
          ...prev, 
          competitionImage: {
            file: file,
            name: file.name,
            type: file.type,
            base64: base64
          }
        }));
      toast({
        title: t("success.imageUploaded"),
          description: t("success.imageUploadedDesc"),
      });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = [
      "nameAr",
      "nameEn",
      "address",
      "horseName",
      "date",
      "time",
      "country",
      "governorate",
      "city",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      toast({
        title: t("validation.missingFields"),
        description: t("validation.missingFieldsDesc"),
        variant: "destructive",
      });
      return;
    }

    if (!currentUserId) {
      toast({
        title: t("validation.loginRequired"),
        description: t("validation.loginRequiredDesc"),
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      
      const response = await fetch('/api/competitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdBy: currentUserId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to create competition: ${response.status} ${response.statusText}`);
      }

      if (!data.competition || !data.competition._id) {
        throw new Error('Invalid response from server: Competition ID not found');
      }

      setCompetitionId(data.competition._id);
      
      toast({
        title: t("success.competitionCreated"),
        description: t("success.competitionCreatedDesc"),
      });
      setCurrentStep(2);
    } catch (error) {
      console.error('Error creating competition:', error);
      toast({
        title: t("errors.general"),
        description: error.message || t("errors.createFailed"),
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: t("errors.searchFailed"),
        description: t("errors.searchFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const addUserToInvite = (user) => {
    if (!selectedUsers.find(u => u._id === user._id)) {
      setSelectedUsers(prev => [...prev, user]);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const removeUserFromInvite = (userId) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userId));
  };

  const generateInviteLink = async () => {
    if (!competitionId) {
      toast({
        title: t("errors.general"),
        description: "Please create the competition first",
        variant: "destructive",
      });
      return;
    }

    try {
      setInviting(true);
      
      // Generate unique invite link
      const inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const inviteLink = `${window.location.origin}/join/${inviteCode}`;

      // Create open invitation
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competitionId,
          invitedUserId: null, // Open invitation
          invitedBy: currentUserId,
          inviteLink
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create invitation');
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(inviteLink);
      
      toast({
        title: t("success.inviteLinkCreated"),
        description: t("success.inviteLinkCreatedDesc"),
      });

      setInviteLink(inviteLink);
      setInvitationCreated(true);

    } catch (error) {
      console.error('Error creating open invitation:', error);
      toast({
        title: t("errors.general"),
        description: t("errors.openInvitationFailed", { error: error.message }),
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const sendInvitations = async () => {
    if (!competitionId) {
      toast({
        title: t("errors.general"),
        description: "Competition not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setInviting(true);
      
      // Send invitations to selected users
      const invitationPromises = selectedUsers.map(async (user) => {
        const inviteCode = Math.random().toString(36).substr(2, 9).toUpperCase();
        const inviteLink = `${window.location.origin}/join/${inviteCode}`;
        
        const response = await fetch('/api/invitations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            competitionId,
            invitedUserId: user._id,
            invitedBy: currentUserId,
            inviteLink,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to create invitation: ${errorData.error || response.statusText}`);
        }

        return response.json();
      });

      const results = await Promise.all(invitationPromises);
      console.log('Invitation results:', results);
      
      toast({
        title: t("success.invitationsSent"),
        description: t("success.invitationsSentDesc", { count: selectedUsers.length }),
      });

      setSelectedUsers([]);
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast({
        title: t("errors.general"),
        description: t("errors.invitationFailed", { error: error.message }),
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Preloader />
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // --- THEME: match competitions/page.jsx ---
  if (currentStep === 2) {
    return (
      <Layout>
        <div className="min-h-screen bg-white">
                  <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(1)}
                className="text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("navigation.back")}
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {t("invitations.title")}
              </h1>
            </div>
            <div className="max-w-2xl mx-auto">
              <Card className="bg-white border-gray-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-gray-900 text-center text-xl md:text-2xl">
                    {t("invitations.title")}
                  </CardTitle>
                  <p className="text-gray-600 text-center">
                    {t("invitations.subtitle")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Competition Summary */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-gray-900 font-semibold mb-2">
                      {formData.nameEn}
                    </h3>
                    <p className="text-gray-500 text-sm" dir="rtl">
                      {formData.nameAr}
                    </p>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                      <Calendar className="w-4 h-4" />
                      {formData.date} at {formData.time}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                      <MapPin className="w-4 h-4" />
                      {formData.address}
                    </div>
                  </div>

                  {/* User Search */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-900 mb-2 block">
                        {t("invitations.userSearch.title")}
                      </Label>
                      <div className="relative">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                          <Input
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder={t("invitations.userSearch.placeholder")}
                            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 pl-12 pr-10"
                          />
                          {searching && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                            </div>
                          )}
                        </div>
                        
                        {/* Search Results */}
                        {searchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                            {searchResults.map((user) => (
                              <div
                                key={user._id}
                                onClick={() => addUserToInvite(user)}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  {user.image ? (
                                    <Image
                                      src={user.image}
                                      alt={user.userName}
                                      width={8}
                                      height={8}
                                      className="w-8 h-8 rounded-full object-cover"
                                      onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userName || user.fullName)}&size=200&background=e5e7eb&color=374151`;
                                      }}
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                      <User className="w-4 h-4 text-gray-500" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                                    {user.fullName || user.userName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    @{user.userName}
                                  </div>
                                </div>
                                <Check className="w-4 h-4 text-green-500" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                      <div>
                        <Label className="text-gray-900 mb-2 block">
                          {t("invitations.selectedUsers")} ({selectedUsers.length}):
                        </Label>
                        <div className="space-y-2">
                          {selectedUsers.map((user) => (
                            <div
                              key={user._id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  {user.image ? (
                                    <Image
                                      src={user.image}
                                      alt={user.userName}
                                      width={8}
                                      height={8}
                                      className="w-8 h-8 rounded-full object-cover"
                                      onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userName || user.fullName)}&size=200&background=e5e7eb&color=374151`;
                                      }}
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                      <User className="w-4 h-4 text-gray-500" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {user.fullName || user.userName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    @{user.userName}
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={() => removeUserFromInvite(user._id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={sendInvitations}
                          disabled={inviting}
                          className="w-full mt-3 bg-[#333] hover:bg-black text-white"
                        >
                          {inviting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                          <User className="w-4 h-4 mr-2" />
                          )}
                          {t("invitations.sendInvitations")} ({selectedUsers.length})
                        </Button>
                      </div>
                    )}

                    <div className="text-center">
                      <div className="text-gray-400 mb-2">{t("invitations.or")}</div>
                    </div>

                    {/* Generate Invite Link */}
                    <div>
                      <Label className="text-gray-900 mb-2 block">
                        {t("invitations.inviteLink.title")}
                      </Label>
                      <div className="space-y-3">
                        <Button
                          onClick={generateInviteLink}
                          disabled={inviting}
                          className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300"
                        >
                          {inviting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Link className="w-4 h-4 mr-2" />
                          )}
                          {t("invitations.inviteLink.generate")}
                        </Button>
                      </div>
                      <p className="text-gray-400 text-sm mt-2 text-center">
                        {t("invitations.inviteLink.description")}
                      </p>
                    </div>
                  </div>

                  <div className="text-center pt-4">
                    <Button
                      onClick={() => router.push("/")}
                      variant="outline"
                      className="border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      {t("invitations.returnToDashboard")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // --- Step 1: Create Competition Form ---
  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Header */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white border-gray-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-gray-900 text-xl md:text-2xl text-center">
                  {t("hero.title")}
                </CardTitle>
                <p className="text-gray-600 text-center">
                  {t("hero.subtitle")}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Competition Names */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className={isArabic ? "lg:order-2" : ""}>
                      <Label className="text-gray-900 mb-2 block">
                        {t("form.competitionNames.arabic")}
                      </Label>
                      <Input
                        required
                        value={formData.nameAr}
                        onChange={(e) =>
                          handleInputChange("nameAr", e.target.value)
                        }
                        placeholder={t("form.competitionNames.arabicPlaceholder")}
                        className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                        dir="rtl"
                      />
                    </div>
                    <div className={isArabic ? "lg:order-1" : ""}>
                      <Label className="text-gray-900 mb-2 block">
                        {t("form.competitionNames.english")}
                      </Label>
                      <Input
                        required
                        value={formData.nameEn}
                        onChange={(e) =>
                          handleInputChange("nameEn", e.target.value)
                        }
                        placeholder={t("form.competitionNames.englishPlaceholder")}
                        className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Location & Address */}
                  <div>
                    <Label className="text-gray-900 mb-2 block flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {t("form.location.mapsLink")}
                    </Label>
                    <Input
                      value={formData.locationLink}
                      onChange={(e) =>
                        handleInputChange("locationLink", e.target.value)
                      }
                      placeholder={t("form.location.mapsPlaceholder")}
                      className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  {/* Country / Governorate / City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <Label className="text-gray-900 mb-2 block">{t("form.location.country")}</Label>
                      <select
                        value={selectedCountry}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedCountry(value);
                          setFormData((prev) => ({ ...prev, country: value }));
                        }}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white"
                      >
                        <option value="">{t("form.location.selectCountry")}</option>
                        {countries.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name_en || c.name_ar}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-gray-900 mb-2 block">{t("form.location.governorate")}</Label>
                      <select
                        value={selectedGovernorate}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedGovernorate(value);
                          setFormData((prev) => ({ ...prev, governorate: value }));
                        }}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white"
                        disabled={!selectedCountry}
                      >
                        <option value="">{t("form.location.selectGovernorate")}</option>
                        {governorates.map((g) => (
                          <option key={g._id} value={g._id}>
                            {g.name_en || g.name_ar}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-gray-900 mb-2 block">{t("form.location.city")}</Label>
                      <select
                        value={selectedCity}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedCity(value);
                          setFormData((prev) => ({ ...prev, city: value }));
                        }}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white"
                        disabled={!selectedGovernorate}
                      >
                        <option value="">{t("form.location.selectCity")}</option>
                        {cities.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name_en || c.name_ar}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-900 mb-2 block">
                      {t("form.location.address")}
                    </Label>
                    <Textarea
                      required
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder={t("form.location.addressPlaceholder")}
                      className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 min-h-[80px]"
                    />
                  </div>

                  {/* Streaming Link */}
                  <div>
                    <Label className="text-gray-900 mb-2 block flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      {t("form.streaming.link")}
                    </Label>
                    <Input
                      value={formData.streamLink}
                      onChange={(e) =>
                        handleInputChange("streamLink", e.target.value)
                      }
                      placeholder={t("form.streaming.placeholder")}
                      className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  {/* About Competition */}
                  <div>
                    <Label className="text-gray-900 mb-2 block flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {t("form.about.title")}
                    </Label>
                    <Textarea
                      value={formData.about}
                      onChange={(e) =>
                        handleInputChange("about", e.target.value)
                      }
                      placeholder={t("form.about.placeholder")}
                      className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 min-h-[100px]"
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className={isArabic ? "sm:order-2" : ""}>
                      <Label className="text-gray-900 mb-2 block flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {t("form.dateTime.date")}
                      </Label>
                      <Input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) =>
                          handleInputChange("date", e.target.value)
                        }
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                    <div className={isArabic ? "sm:order-1" : ""}>
                      <Label className="text-gray-900 mb-2 block">
                        {t("form.dateTime.time")}
                      </Label>
                      <Input
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) =>
                          handleInputChange("time", e.target.value)
                        }
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Horse Information */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                      {t("form.horseInfo.title")}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-900 mb-2 block">
                          {t("form.horseInfo.name")}
                        </Label>
                        <Input
                          required
                          value={formData.horseName}
                          onChange={(e) =>
                            handleInputChange("horseName", e.target.value)
                          }
                          placeholder={t("form.horseInfo.namePlaceholder")}
                          className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-900 mb-2 block">
                          {t("form.horseInfo.surpriseName")}
                        </Label>
                        <Input
                          value={formData.surpriseHorseName}
                          onChange={(e) =>
                            handleInputChange("surpriseHorseName", e.target.value)
                          }
                          placeholder={t("form.horseInfo.surpriseNamePlaceholder")}
                          className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {t("form.horseInfo.surpriseNameDesc")}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-900 mb-2 block flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          {t("form.horseInfo.image")}
                        </Label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="competition-image"
                          />
                          <Label
                            htmlFor="competition-image"
                            className="flex items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-300 transition-colors"
                          >
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-400">
                              {formData.competitionImage
                                ? formData.competitionImage.name
                                : t("form.horseInfo.uploadText")}
                            </span>
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={creating}
                    className="w-full bg-[#333] hover:bg-black text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300"
                  >
                    {creating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      "🚀"
                    )}
                    {creating ? t("loading.creating") : t("form.submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCompetition;
