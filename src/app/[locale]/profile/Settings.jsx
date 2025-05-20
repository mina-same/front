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
} from "lucide-react";
import { client } from "@/lib/sanity";
import { urlFor } from "@/lib/sanity";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function SettingsPage({ userData }) {
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
    email: userData?.email || "",
    phoneNumber: userData?.phoneNumber || "",
    country: "", // Will be set after fetching countries
    gender: userData?.kind || "",
    communication: {
      email: true,
      phone: !!userData?.phoneNumber,
    },
    addressDetails: userData?.addressDetails || "",
    city: "", // Will be set after fetching cities
    governorate: "", // Will be set after fetching governorates
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

        // Update userInfo with matched _id values
        setUserInfo((prev) => ({
          ...prev,
          country: countryId,
          city: cityId,
          governorate: governorateId,
        }));

        // Debugging: Log fetched data and matched IDs
        console.log("Fetched countries:", countryData);
        console.log("Fetched cities:", cityData);
        console.log("Fetched governorates:", governorateData);
        console.log("Matched country ID:", countryId);
        console.log("Matched city ID:", cityId);
        console.log("Matched governorate ID:", governorateId);
      } catch (error) {
        console.error("Error fetching references:", error);
        toast.error("Failed to load location data. Please try again.");
      }
    };
    fetchReferences();
  }, [userData]);

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
      toast.error("Username is required.");
      return false;
    }
    if (!userInfo.fullName.trim()) {
      toast.error("Full Name is required.");
      return false;
    }
    if (!userInfo.email.trim()) {
      toast.error("Email is required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (!userInfo.phoneNumber.trim()) {
      toast.error("Phone Number is required.");
      return false;
    }
    if (!userInfo.gender) {
      toast.error("Please select a gender.");
      return false;
    }
    if (!["male", "female"].includes(userInfo.gender)) {
      toast.error("Please select a valid gender (Male or Female).");
      return false;
    }
    if (!userInfo.addressDetails.trim()) {
      toast.error("Address Details are required.");
      return false;
    }
    if (!userInfo.country) {
      toast.error("Please select a country.");
      return false;
    }
    if (!countries.find((c) => c._id === userInfo.country)) {
      toast.error("Selected country is invalid.");
      return false;
    }
    if (!userInfo.city) {
      toast.error("Please select a city.");
      return false;
    }
    if (!cities.find((c) => c._id === userInfo.city)) {
      toast.error("Selected city is invalid.");
      return false;
    }
    if (!userInfo.governorate) {
      toast.error("Please select a governorate.");
      return false;
    }
    if (!governorates.find((g) => g._id === userInfo.governorate)) {
      toast.error("Selected governorate is invalid.");
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
        email: userInfo.email,
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
      toast.success("Profile updated successfully!");
      router.refresh(); // Refresh to update userData in Profile.jsx
    } catch (error) {
      console.error("Error updating user info:", error);
      toast.error(
        error.message || "Failed to update profile. Please try again."
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
      toast.success("Notification preferences updated!");
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast.error("Failed to update notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
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
        throw new Error(data.error || "Failed to change password.");
      }
      toast.success("Password changed successfully!");
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
        throw new Error("Failed to delete account.");
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
      toast.error("Please upload a PNG or JPG image.");
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
      toast.success("Profile picture updated!");
      router.refresh();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to update profile picture.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-6 pt-6">Settings</h1>

      {/* Basic Info Section */}
      <section className="bg-white rounded-xl shadow mb-6 p-6">
        <div className="flex items-center mb-6">
          <User className="text-blue-600 mr-2" size={24} />
          <h2 className="text-xl font-medium">Basic info</h2>
        </div>

        <div className="flex items-center mb-8">
          {/* Profile Picture Container */}
          <div className="relative group">
            <div
              className="w-24 h-24 rounded-full bg-gray-100 bg-cover bg-center shadow-lg ring-4 ring-[#8c6b23]/40 transition-transform duration-300 group-hover:scale-105"
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
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-xs font-medium flex items-center gap-1">
                  <Eye size={16} className="inline" />
                  Upload
                </span>
              </div>
            </div>
            {/* Animated Badge for Visual Flair */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs">✨</span>
            </div>
          </div>

          {/* Text Description */}
          <div className="ml-6">
            <h3 className="text-lg font-bold text-gray-800">Profile Picture</h3>
            <p className="text-sm text-gray-600 mt-1 max-w-xs">
              Upload a PNG or JPG image (max 1000px x 1000px) to personalize
              your profile.
            </p>
            <button
              className="mt-2 text-blue-600 text-sm font-medium hover:underline focus:outline-none"
              onClick={() =>
                document.querySelector('input[type="file"]').click()
              }
            >
              Change Photo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="userName"
            >
              Username
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              id="userName"
              value={userInfo.userName}
              onChange={(e) => handleUserInfoChange("userName", e.target.value)}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="fullName"
            >
              Full Name
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              id="fullName"
              value={userInfo.fullName}
              onChange={(e) => handleUserInfoChange("fullName", e.target.value)}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="email"
            >
              Email address
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              id="email"
              value={userInfo.email}
              onChange={(e) => handleUserInfoChange("email", e.target.value)}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="phoneNumber"
            >
              Phone
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="tel"
              id="phoneNumber"
              placeholder="+1 ___ ___ __"
              value={userInfo.phoneNumber}
              onChange={(e) =>
                handleUserInfoChange("phoneNumber", e.target.value)
              }
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="country"
            >
              Country
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="country"
              value={userInfo.country}
              onChange={(e) => handleUserInfoChange("country", e.target.value)}
            >
              <option value="" disabled>
                Select country
              </option>
              {countries.map((country) => (
                <option key={country._id} value={country._id}>
                  {country.name_en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="city"
            >
              City
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="city"
              value={userInfo.city}
              onChange={(e) => handleUserInfoChange("city", e.target.value)}
            >
              <option value="" disabled>
                Select city
              </option>
              {cities.map((city) => (
                <option key={city._id} value={city._id}>
                  {city.name_en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="governorate"
            >
              Governorate
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="governorate"
              value={userInfo.governorate}
              onChange={(e) =>
                handleUserInfoChange("governorate", e.target.value)
              }
            >
              <option value="" disabled>
                Select governorate
              </option>
              {governorates.map((gov) => (
                <option key={gov._id} value={gov._id}>
                  {gov.name_en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="addressDetails"
            >
              Address Details
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              id="addressDetails"
              value={userInfo.addressDetails}
              onChange={(e) =>
                handleUserInfoChange("addressDetails", e.target.value)
              }
            />
          </div>

          <div className="col-span-1 sm:col-span-2 flex items-center mt-2">
            <div className="text-gray-700 mr-4">Gender:</div>
            <div className="flex items-center mr-4">
              <input
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                type="radio"
                id="male"
                name="gender"
                value="male"
                checked={userInfo.gender === "male"}
                onChange={() => handleUserInfoChange("gender", "male")}
              />
              <label className="ml-2 text-sm text-gray-700" htmlFor="male">
                Male
              </label>
            </div>
            <div className="flex items-center mr-4">
              <input
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                type="radio"
                id="female"
                name="gender"
                value="female"
                checked={userInfo.gender === "female"}
                onChange={() => handleUserInfoChange("gender", "female")}
              />
              <label className="ml-2 text-sm text-gray-700" htmlFor="female">
                Female
              </label>
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2 flex items-center">
            <div className="text-gray-700 mr-4">Communication:</div>
            <div className="flex items-center mr-4">
              <input
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                type="checkbox"
                id="c-email"
                checked={userInfo.communication.email}
                onChange={() => handleCommunicationChange("email")}
              />
              <label className="ml-2 text-sm text-gray-700" htmlFor="c-email">
                Email
              </label>
            </div>
            <div className="flex items-center">
              <input
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                type="checkbox"
                id="c-phone"
                checked={userInfo.communication.phone}
                onChange={() => handleCommunicationChange("phone")}
              />
              <label className="ml-2 text-sm text-gray-700" htmlFor="c-phone">
                Phone
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-3"
            onClick={() => router.push("/profile?tab=overview")}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleSaveUserInfo}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </section>

      {/* Password Change Section */}
      {/* <section className="bg-white rounded-xl shadow mb-6 p-6">
        <div className="flex items-center mb-6">
          <Lock className="text-blue-600 mr-2" size={24} />
          <h2 className="text-xl font-medium">Password change</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="current-pass">
              Current password
            </label>
            <div className="relative">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                type={showCurrentPassword ? "text" : "password"}
                id="current-pass"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
          <div className="flex items-center">
            <a href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
              Forgot password?
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="new-pass">
              New password
            </label>
            <div className="relative">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                type={showNewPassword ? "text" : "password"}
                id="new-pass"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirm-pass">
              Confirm new password
            </label>
            <div className="relative">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                type={showConfirmPassword ? "text" : "password"}
                id="confirm-pass"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
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

        <div className="rounded-xl bg-[#ecf2fa] border-l-4 border-[#9fbfe5] p-4 my-6 flex items-start">
          <Info className="text-[#3972b6] mr-3 flex-shrink-0" size={24} />
          <p className="text-sm text-[#3972b6]">
            Password must be minimum 8 characters long - the more, the better.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-3"
            onClick={() => router.push("/profile?tab=overview")}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handlePasswordChange}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </section> */}

      {/* Notifications Section */}
      {/* <section className="bg-white rounded-xl shadow mb-6 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bell className="text-blue-600 mr-2" size={24} />
            <h2 className="text-xl font-medium">Notifications</h2>
          </div>
          <button
            className="px-3 py-1 text-sm border border-gray-300 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            onClick={toggleAllNotifications}
            disabled={isLoading}
          >
            Toggle all
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                id="product-sold"
                checked={notifications.productSold}
                onChange={() => handleNotificationChange("productSold")}
                disabled={isLoading}
              />
            </div>
            <div className="ml-3">
              <label
                htmlFor="product-sold"
                className="font-medium text-gray-700"
              >
                Product sold notifications
              </label>
              <p className="text-sm text-gray-500">
                Send an email when someone purchased one of my products
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                id="product-update"
                checked={notifications.productUpdate}
                onChange={() => handleNotificationChange("productUpdate")}
                disabled={isLoading}
              />
            </div>
            <div className="ml-3">
              <label
                htmlFor="product-update"
                className="font-medium text-gray-700"
              >
                Product update notifications
              </label>
              <p className="text-sm text-gray-500">
                Send an email when a product I've purchased is updated
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                id="product-comment"
                checked={notifications.productComment}
                onChange={() => handleNotificationChange("productComment")}
                disabled={isLoading}
              />
            </div>
            <div className="ml-3">
              <label
                htmlFor="product-comment"
                className="font-medium text-gray-700"
              >
                Product comment notifications
              </label>
              <p className="text-sm text-gray-500">
                Send an email when someone comments on one of my products
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                id="product-review"
                checked={notifications.productReview}
                onChange={() => handleNotificationChange("productReview")}
                disabled={isLoading}
              />
            </div>
            <div className="ml-3">
              <label
                htmlFor="product-review"
                className="font-medium text-gray-700"
              >
                Product review notifications
              </label>
              <p className="text-sm text-gray-500">
                Send an email when someone leaves a review with his/her rating
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                id="daily-summary"
                checked={notifications.dailySummary}
                disabled
              />
            </div>
            <div className="ml-3">
              <div className="flex items-center">
                <label
                  htmlFor="daily-summary"
                  className="font-medium text-gray-500"
                >
                  Daily summary emails
                </label>
                <span className="ml-2 px-2 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded-xl">
                  Only for premium
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Send a daily summary of all activities on your account
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-3"
            onClick={() => router.push("/profile?tab=overview")}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleSaveNotifications}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </section> */}

      {/* Delete Account Section */}
      <section className="bg-white rounded-xl shadow mb-6 p-6">
        <div className="flex items-center mb-6">
          <Trash className="text-blue-600 mr-2" size={24} />
          <h2 className="text-xl font-medium">Delete account</h2>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 flex items-start">
          <AlertTriangle
            className="text-yellow-500 mr-3 flex-shrink-0"
            size={24}
          />
          <p className="text-sm text-yellow-700">
            When you delete your account, your public profile will be
            deactivated immediately. If you change your mind before the 14 days
            are up, sign in with your email and password, and we&apos;ll send a link
            to reactivate account.{" "}
            <Link
              href="/support"
              className="font-semibold text-yellow-700 underline"
            >
wwwwwwww              Learn more
            </Link>
          </p>
        </div>

        <div className="flex items-center mb-6">
          <input
            id="confirm-delete"
            type="checkbox"
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            checked={deleteConfirmed}
            onChange={() => setDeleteConfirmed(!deleteConfirmed)}
            disabled={isLoading}
          />
          <label
            htmlFor="confirm-delete"
            className="ml-2 text-sm font-medium text-gray-900"
          >
            Yes, I want to delete my account
          </label>
        </div>

        <div className="flex justify-end">
          <button
            className={`flex items-center px-4 py-2 bg-red-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
              !deleteConfirmed
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-red-700"
            }`}
            disabled={!deleteConfirmed || isLoading}
            onClick={handleDeleteAccount}
          >
            <Trash size={16} className="mr-2" />
            {isLoading ? "Deleting..." : "Delete account"}
          </button>
        </div>
      </section>
    </div>
  );
}