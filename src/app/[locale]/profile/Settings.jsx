"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Bell,
  Trash,
  Info,
  AlertTriangle,
  Camera,
  Upload,
} from "lucide-react";
import { client } from "@/lib/sanity";
import { urlFor } from "@/lib/sanity";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function SettingsPage({ userData }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const isRTL = locale === 'ar';
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    productSold: userData?.notifications?.productSold ?? true,
    productUpdate: userData?.notifications?.productUpdate ?? true,
    productComment: userData?.notifications?.productComment ?? false,
    productReview: userData?.notifications?.productReview ?? true,
    dailySummary: userData?.notifications?.dailySummary ?? false,
  });
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [userInfo, setUserInfo] = useState({
    userName: userData?.userName || "",
    fullName: userData?.fullName || "",
    phoneNumber: userData?.phoneNumber || "",
    country: "",
    gender: userData?.kind || "",
    communication: {
      email: true,
      phone: !!userData?.phoneNumber,
    },
    addressDetails: userData?.addressDetails || "",
    city: "",
    governorate: "",
  });
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [governorates, setGovernorates] = useState([]);

  // Fetch countries, cities, and governorates for dropdowns and set userInfo
  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const countryQuery = `*[_type == "country"]{_id, name_en, name_ar}`;
        const cityQuery = `*[_type == "city"]{_id, name_en, name_ar}`;
        const governorateQuery = `*[_type == "governorate"]{_id, name_en, name_ar}`;
        const [countryData, cityData, governorateData] = await Promise.all([
          client.fetch(countryQuery),
          client.fetch(cityQuery),
          client.fetch(governorateQuery),
        ]);
        setCountries(countryData);
        setCities(cityData);
        setGovernorates(governorateData);

        // Match userData with fetched data to get _id
        const countryId = countryData.find(
          (c) => c.name_en === userData?.country?.name_en
        )?._id || "";
        const cityId = cityData.find(
          (c) => c.name_en === userData?.city?.name_en
        )?._id || "";
        const governorateId = governorateData.find(
          (g) => g.name_en === userData?.governorate?.name_en
        )?._id || "";

        setUserInfo((prev) => ({
          ...prev,
          country: countryId,
          city: cityId,
          governorate: governorateId,
        }));
      } catch (error) {
        console.error("Error fetching references:", error);
        toast.error(t("profile:settings.validation.error.locationDataFailed"));
      }
    };
    fetchReferences();
  }, [userData, t]);

  const toggleAllNotifications = () => {
    const allEnabled = Object.values(notifications).every(
      (val) => val === true
    );
    setNotifications({
      productSold: !allEnabled,
      productUpdate: !allEnabled,
      productComment: !allEnabled,
      productReview: !allEnabled,
      dailySummary: false,
    });
  };

  const handleNotificationChange = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
  };

  const handleUserInfoChange = (field, value) => {
    setUserInfo({
      ...userInfo,
      [field]: value,
    });
  };

  const handleCommunicationChange = (field) => {
    setUserInfo({
      ...userInfo,
      communication: {
        ...userInfo.communication,
        [field]: !userInfo.communication[field],
      },
    });
  };

  // Validate user input before saving
  const validateUserInfo = () => {
    if (!userInfo.userName.trim()) {
      toast.error(t("profile:settings.validation.usernameRequired"));
      return false;
    }
    if (!userInfo.fullName.trim()) {
      toast.error(t("profile:settings.validation.fullNameRequired"));
      return false;
    }
    if (!userInfo.phoneNumber.trim()) {
      toast.error(t("profile:settings.validation.phoneRequired"));
      return false;
    }
    if (!userInfo.gender) {
      toast.error(t("profile:settings.validation.genderRequired"));
      return false;
    }
    if (!["male", "female"].includes(userInfo.gender)) {
      toast.error(t("profile:settings.validation.validGender"));
      return false;
    }
    if (!userInfo.addressDetails.trim()) {
      toast.error(t("profile:settings.validation.addressRequired"));
      return false;
    }
    if (!userInfo.country) {
      toast.error(t("profile:settings.validation.countryRequired"));
      return false;
    }
    if (!countries.find((c) => c._id === userInfo.country)) {
      toast.error(t("profile:settings.validation.countryRequired"));
      return false;
    }
    if (!userInfo.city) {
      toast.error(t("profile:settings.validation.cityRequired"));
      return false;
    }
    if (!cities.find((c) => c._id === userInfo.city)) {
      toast.error(t("profile:settings.validation.cityRequired"));
      return false;
    }
    if (!userInfo.governorate) {
      toast.error(t("profile:settings.validation.governorateRequired"));
      return false;
    }
    if (!governorates.find((g) => g._id === userInfo.governorate)) {
      toast.error(t("profile:settings.validation.governorateRequired"));
      return false;
    }
    return true;
  };

  // Handle saving user info changes
  const handleSaveUserInfo = async () => {
    if (!validateUserInfo()) return;

    setIsLoading(true);
    try {
      const updatedData = {
        userName: userInfo.userName.trim(),
        fullName: userInfo.fullName.trim(),
        phoneNumber: userInfo.phoneNumber,
        kind: userInfo.gender,
        addressDetails: userInfo.addressDetails,
        country: userInfo.country
          ? { _type: "reference", _ref: userInfo.country }
          : null,
        city: userInfo.city ? { _type: "reference", _ref: userInfo.city } : null,
        governorate: userInfo.governorate
          ? { _type: "reference", _ref: userInfo.governorate }
          : null,
      };

      await client.patch(userData._id).set(updatedData).commit();
      toast.success(t("profile:settings.validation.success.profileUpdated"));
      router.refresh();
    } catch (error) {
      console.error("Error updating user info:", error);
      toast.error(
        error.message || t("profile:settings.validation.error.failedUpdate")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving notification preferences
  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      await client.patch(userData._id).set({ notifications }).commit();
      toast.success(t("profile:settings.validation.success.notificationsUpdated"));
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast.error(t("profile:settings.validation.error.failedNotifications"));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("profile:settings.validation.passwordMismatch"));
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error(t("profile:settings.validation.passwordLength"));
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("profile:settings.validation.error.failedPassword"));
      }
      toast.success(t("profile:settings.validation.success.passwordChanged"));
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!deleteConfirmed) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(t("profile:settings.validation.error.failedDelete"));
      }
      toast.success("Account deletion requested. Check your email to confirm.");
      router.push("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !["image/png", "image/jpeg"].includes(file.type)) {
      toast.error(t("profile:settings.validation.imageType"));
      return;
    }
    setIsLoading(true);
    try {
      const imageAsset = await client.assets.upload("image", file);
      await client
        .patch(userData._id)
        .set({
          image: {
            _type: "image",
            asset: { _type: "reference", _ref: imageAsset._id },
          },
        })
        .commit();
      toast.success(t("profile:settings.validation.success.profilePictureUpdated"));
      router.refresh();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(t("profile:settings.validation.error.failedImage"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get localized name
  const getLocalizedName = (item) => {
    if (!item) return "";
    return locale === 'ar' ? item.name_ar : item.name_en;
  };

  return (
    <div className={`w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <h1 className={`text-3xl font-bold mb-8 pt-6 text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
        {t("profile:settings.title")}
      </h1>

      {/* Basic Info Section */}
      <section className="bg-white rounded-2xl shadow-lg mb-8 p-6 sm:p-8">
        <div className={`flex items-center mb-8 ${isRTL ? '' : 'flex-row'}`}>
          <User className={`text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} size={28} />
          <h2 className="text-2xl font-semibold text-gray-900">{t("profile:settings.basicInfo.title")}</h2>
        </div>

        {/* Profile Picture Section */}
        <div className={`flex flex-col lg:flex-row items-start lg:items-center mb-8 gap-6 ${isRTL ? 'lg:' : ''}`}>
          {/* Profile Picture Container */}
          <div className="relative group">
            <div
              className="w-32 h-32 rounded-full bg-gray-100 bg-cover bg-center shadow-xl ring-4 ring-blue-200/50 transition-all duration-300 group-hover:scale-105 group-hover:ring-blue-300/70"
              style={{
                backgroundImage: userData?.image
                  ? `url(${urlFor(userData.image).url()})`
                  : "url('/placeholder.svg')",
              }}
            >
              {/* File Input for Image Upload */}
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={handleImageUpload}
              />
              {/* Overlay for Upload Prompt */}
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-white text-center">
                  <Camera size={24} className="mx-auto mb-2" />
                  <span className="text-sm font-medium">{t("profile:settings.basicInfo.changePhoto")}</span>
                </div>
              </div>
            </div>
            {/* Upload Badge */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <Upload size={16} className="text-white" />
            </div>
          </div>

          {/* Text Description */}
          <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{t("profile:settings.basicInfo.profilePicture")}</h3>
            <p className="text-gray-600 mb-4 max-w-md leading-relaxed">
              {t("profile:settings.basicInfo.profilePictureDescription")}
            </p>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              onClick={() => document.querySelector('input[type="file"]').click()}
            >
              <Camera size={16} />
              {t("profile:settings.basicInfo.changePhoto")}
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="sm:col-span-2 lg:col-span-1">
            <label
              className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
              htmlFor="userName"
            >
              {t("profile:settings.basicInfo.username")}
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              type="text"
              id="userName"
              value={userInfo.userName}
              onChange={(e) => handleUserInfoChange("userName", e.target.value)}
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label
              className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
              htmlFor="fullName"
            >
              {t("profile:settings.basicInfo.fullName")}
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              type="text"
              id="fullName"
              value={userInfo.fullName}
              onChange={(e) => handleUserInfoChange("fullName", e.target.value)}
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label
              className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
            >
              {t("profile:settings.basicInfo.emailAddress")}
            </label>
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">
              {userData?.email || t("profile:settings.basicInfo.noEmailProvided")}
            </div>
            <p className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t("profile:settings.basicInfo.emailReadOnly")}
            </p>
          </div>



          <div className="sm:col-span-2 lg:col-span-1">
            <label
              className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
              htmlFor="phoneNumber"
            >
              {t("profile:settings.basicInfo.phone")}
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              type="tel"
              id="phoneNumber"
              placeholder={t("profile:settings.basicInfo.phonePlaceholder")}
              value={userInfo.phoneNumber}
              onChange={(e) =>
                handleUserInfoChange("phoneNumber", e.target.value)
              }
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label
              className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
              htmlFor="country"
            >
              {t("profile:settings.basicInfo.country")}
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              id="country"
              value={userInfo.country}
              onChange={(e) => handleUserInfoChange("country", e.target.value)}
            >
              <option value="" disabled>
                {t("profile:settings.basicInfo.selectCountry")}
              </option>
              {countries.map((country) => (
                <option key={country._id} value={country._id}>
                  {getLocalizedName(country)}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label
              className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
              htmlFor="city"
            >
              {t("profile:settings.basicInfo.city")}
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              id="city"
              value={userInfo.city}
              onChange={(e) => handleUserInfoChange("city", e.target.value)}
            >
              <option value="" disabled>
                {t("profile:settings.basicInfo.selectCity")}
              </option>
              {cities.map((city) => (
                <option key={city._id} value={city._id}>
                  {getLocalizedName(city)}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label
              className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
              htmlFor="governorate"
            >
              {t("profile:settings.basicInfo.governorate")}
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              id="governorate"
              value={userInfo.governorate}
              onChange={(e) =>
                handleUserInfoChange("governorate", e.target.value)
              }
            >
              <option value="" disabled>
                {t("profile:settings.basicInfo.selectGovernorate")}
              </option>
              {governorates.map((gov) => (
                <option key={gov._id} value={gov._id}>
                  {getLocalizedName(gov)}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label
              className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
              htmlFor="addressDetails"
            >
              {t("profile:settings.basicInfo.addressDetails")}
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              type="text"
              id="addressDetails"
              value={userInfo.addressDetails}
              onChange={(e) =>
                handleUserInfoChange("addressDetails", e.target.value)
              }
            />
          </div>

          {/* Gender Selection */}
          <div className="sm:col-span-2">
            <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 ${isRTL ? 'sm:' : ''}`}>
              <span className={`text-sm font-semibold text-gray-700 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                {t("profile:settings.basicInfo.gender")}:
              </span>
              <div className={`flex items-center gap-6 ${isRTL ? '' : ''}`}>
                <div className="flex items-center">
                  <input
                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    type="radio"
                    id="male"
                    name="gender"
                    value="male"
                    checked={userInfo.gender === "male"}
                    onChange={() => handleUserInfoChange("gender", "male")}
                  />
                  <label className={`ml-2 text-sm font-medium text-gray-700 ${isRTL ? 'mr-2 ml-0' : ''}`} htmlFor="male">
                    {t("profile:settings.basicInfo.male")}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    type="radio"
                    id="female"
                    name="gender"
                    value="female"
                    checked={userInfo.gender === "female"}
                    onChange={() => handleUserInfoChange("gender", "female")}
                  />
                  <label className={`ml-2 text-sm font-medium text-gray-700 ${isRTL ? 'mr-2 ml-0' : ''}`} htmlFor="female">
                    {t("profile:settings.basicInfo.female")}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Communication Preferences */}
          <div className="sm:col-span-2">
            <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 ${isRTL ? 'sm:' : ''}`}>
              <span className={`text-sm font-semibold text-gray-700 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                {t("profile:settings.basicInfo.communication")}:
              </span>
              <div className={`flex items-center gap-6 ${isRTL ? '' : ''}`}>
                <div className="flex items-center">
                  <input
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    type="checkbox"
                    id="c-email"
                    checked={userInfo.communication.email}
                    onChange={() => handleCommunicationChange("email")}
                  />
                  <label className={`ml-2 text-sm font-medium text-gray-700 ${isRTL ? 'mr-2 ml-0' : ''}`} htmlFor="c-email">
                    {t("profile:settings.basicInfo.email")}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    type="checkbox"
                    id="c-phone"
                    checked={userInfo.communication.phone}
                    onChange={() => handleCommunicationChange("phone")}
                  />
                  <label className={`ml-2 text-sm font-medium text-gray-700 ${isRTL ? 'mr-2 ml-0' : ''}`} htmlFor="c-phone">
                    {t("profile:settings.basicInfo.phoneComm")}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 mt-8 ${isRTL ? 'sm:' : ''}`}>
          <button
            className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
            onClick={() => router.push("/profile?tab=overview")}
            disabled={isLoading}
          >
            {t("profile:settings.basicInfo.cancel")}
          </button>
          <button
            className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSaveUserInfo}
            disabled={isLoading}
          >
            {isLoading ? t("profile:settings.basicInfo.saving") : t("profile:settings.basicInfo.saveChanges")}
          </button>
        </div>
      </section>

      {/* Password Change Section */}
      <section className="bg-white rounded-2xl shadow-lg mb-8 p-6 sm:p-8">
        <div className={`flex items-center mb-8 ${isRTL ? '' : 'flex-row'}`}>
          <Lock className={`text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} size={28} />
          <h2 className="text-2xl font-semibold text-gray-900">{t("profile:settings.passwordChange.title")}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`} htmlFor="current-pass">
              {t("profile:settings.passwordChange.currentPassword")}
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                type={showCurrentPassword ? "text" : "password"}
                id="current-pass"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
              />
              <button
                type="button"
                className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff size={20} className="text-gray-500" />
                ) : (
                  <Eye size={20} className="text-gray-500" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-end">
            <Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200">
              {t("profile:settings.passwordChange.forgotPassword")}
            </Link>
          </div>

          <div>
            <label className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`} htmlFor="new-pass">
              {t("profile:settings.passwordChange.newPassword")}
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                type={showNewPassword ? "text" : "password"}
                id="new-pass"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
              />
              <button
                type="button"
                className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff size={20} className="text-gray-500" />
                ) : (
                  <Eye size={20} className="text-gray-500" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`} htmlFor="confirm-pass">
              {t("profile:settings.passwordChange.confirmPassword")}
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                type={showConfirmPassword ? "text" : "password"}
                id="confirm-pass"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
              />
              <button
                type="button"
                className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} className="text-gray-500" />
                ) : (
                  <Eye size={20} className="text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-blue-50 border-l-4 border-blue-400 p-4 my-6 flex items-start">
          <Info className={`text-blue-600 ${isRTL ? 'ml-3' : 'mr-3'} flex-shrink-0`} size={24} />
          <p className="text-sm text-blue-700 leading-relaxed">
            {t("profile:settings.passwordChange.passwordInfo")}
          </p>
        </div>

        <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:' : ''}`}>
          <button
            className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
            onClick={() => router.push("/profile?tab=overview")}
            disabled={isLoading}
          >
            {t("profile:settings.passwordChange.cancel")}
          </button>
          <button
            className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePasswordChange}
            disabled={isLoading}
          >
            {isLoading ? t("profile:settings.passwordChange.saving") : t("profile:settings.passwordChange.saveChanges")}
          </button>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="bg-white rounded-2xl shadow-lg mb-8 p-6 sm:p-8">
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 ${isRTL ? 'sm:' : ''}`}>
          <div className={`flex items-center ${isRTL ? '' : 'flex-row'}`}>
            <Bell className={`text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} size={28} />
            <h2 className="text-2xl font-semibold text-gray-900">{t("profile:settings.notifications.title")}</h2>
          </div>
          <button
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
            onClick={toggleAllNotifications}
            disabled={isLoading}
          >
            {t("profile:settings.notifications.toggleAll")}
          </button>
        </div>

        <div className="space-y-6">
          {[
            {
              key: "productSold",
              title: t("profile:settings.notifications.productSold"),
              description: t("profile:settings.notifications.productSoldDescription"),
            },
            {
              key: "productUpdate",
              title: t("profile:settings.notifications.productUpdate"),
              description: t("profile:settings.notifications.productUpdateDescription"),
            },
            {
              key: "productComment",
              title: t("profile:settings.notifications.productComment"),
              description: t("profile:settings.notifications.productCommentDescription"),
            },
            {
              key: "productReview",
              title: t("profile:settings.notifications.productReview"),
              description: t("profile:settings.notifications.productReviewDescription"),
            },
            {
              key: "dailySummary",
              title: t("profile:settings.notifications.dailySummary"),
              description: t("profile:settings.notifications.dailySummaryDescription"),
              disabled: true,
            },
          ].map((item) => (
            <div key={item.key} className={`flex items-start ${isRTL ? '' : 'flex-row'}`}>
              <div className="flex items-center h-5 mt-1">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  id={item.key}
                  checked={notifications[item.key]}
                  onChange={() => handleNotificationChange(item.key)}
                  disabled={isLoading || item.disabled}
                />
              </div>
              <div className={`${isRTL ? 'mr-3 text-right' : 'ml-3 text-left'}`}>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={item.key}
                    className={`font-semibold ${item.disabled ? 'text-gray-500' : 'text-gray-700'}`}
                  >
                    {item.title}
                  </label>
                  {item.disabled && (
                    <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-xl">
                      {t("profile:settings.notifications.premiumOnly")}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${item.disabled ? 'text-gray-400' : 'text-gray-500'} mt-1 leading-relaxed`}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className={`flex flex-col sm:flex-row gap-4 mt-8 ${isRTL ? 'sm:' : ''}`}>
          <button
            className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
            onClick={() => router.push("/profile?tab=overview")}
            disabled={isLoading}
          >
            {t("profile:settings.notifications.cancel")}
          </button>
          <button
            className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSaveNotifications}
            disabled={isLoading}
          >
            {isLoading ? t("profile:settings.notifications.saving") : t("profile:settings.notifications.saveChanges")}
          </button>
        </div>
      </section>

      {/* Delete Account Section */}
      <section className="bg-white rounded-2xl shadow-lg mb-8 p-6 sm:p-8">
        <div className={`flex items-center mb-8 ${isRTL ? '' : 'flex-row'}`}>
          <Trash className={`text-red-600 ${isRTL ? 'ml-2' : 'mr-2'}`} size={28} />
          <h2 className="text-2xl font-semibold text-gray-900">{t("profile:settings.deleteAccount.title")}</h2>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 flex items-start">
          <AlertTriangle
            className={`text-yellow-500 ${isRTL ? 'ml-3' : 'mr-3'} flex-shrink-0`}
            size={24}
          />
          <p className="text-sm text-yellow-700 leading-relaxed">
            {t("profile:settings.deleteAccount.warning")}{" "}
            <Link
              href="/support"
              className="font-semibold text-yellow-700 underline hover:text-yellow-800 transition-colors duration-200"
            >
              {t("profile:settings.deleteAccount.learnMore")}
            </Link>
          </p>
        </div>

        <div className={`flex items-center mb-6 ${isRTL ? '' : 'flex-row'}`}>
          <input
            id="confirm-delete"
            type="checkbox"
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            checked={deleteConfirmed}
            onChange={() => setDeleteConfirmed(!deleteConfirmed)}
            disabled={isLoading}
          />
          <label
            htmlFor="confirm-delete"
            className={`text-sm font-medium text-gray-900 ${isRTL ? 'mr-2' : 'ml-2'}`}
          >
            {t("profile:settings.deleteAccount.confirmDelete")}
          </label>
        </div>

        <div className={`flex justify-end ${isRTL ? 'justify-start' : ''}`}>
          <button
            className={`flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 font-medium ${
              !deleteConfirmed
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-red-700"
            }`}
            disabled={!deleteConfirmed || isLoading}
            onClick={handleDeleteAccount}
          >
            <Trash size={18} />
            {isLoading ? t("profile:settings.deleteAccount.deleting") : t("profile:settings.deleteAccount.deleteAccount")}
          </button>
        </div>
      </section>
    </div>
  );
}