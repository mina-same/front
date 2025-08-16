"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Settings,
  Wallet,
  ShoppingCart,
  Calendar,
  Heart,
  Package,
  BookOpen,
  LogOut,
  Briefcase,
  Home,
  Menu,
  X,
} from "lucide-react";
import { urlFor } from "@/lib/sanity";
import Overview from "./overview";
import SettingsPage from "./Settings";
import Billing from "./Billing";
import Horses from "./Horses";
import Orders from "./Orders";
import Favorites from "./Favorites";
import Services from "./Services";
import SupplierProducts from "./SupplierProducts.jsx";
import EducationalService from "./EducationalService.jsx";
import Reservations from "./Reservations";
import StableOwner from "./StableOwner";
import { client } from "@/lib/sanity";
import { LiaHorseHeadSolid } from "react-icons/lia";
import Layout from "components/layout/Layout";
import Preloader from "components/elements/Preloader";
import Image from "next/image";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const validTabs = useMemo(() => [
    "overview",
    "settings",
    "billing",
    "orders",
    "reservations",
    "favorites",
    "horses",
    "services",
    "educational_service",
    "supplier_products",
    "stable_owner",
    "signout",
  ], []);

  useEffect(() => {
    const tabFromQuery = searchParams.get("tab");
    if (tabFromQuery && validTabs.includes(tabFromQuery)) {
      setActiveTab(tabFromQuery);
    } else {
      setActiveTab("overview");
    }
  }, [searchParams, validTabs]);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || t("profile:httpError", { status: response.status }));
        }

        if (data.authenticated) {
          setUserId(data.user.id);
          const query = `*[_type == "user" && _id == $userId]{
            _id,
            userName,
            fullName,
            email,
            image,
            userType,
            phoneNumber,
            addressDetails,
            governorate-> { name_en, name_ar },
            city-> { name_en, name_ar },
            country-> { name_en, name_ar },
            kind,
            isProfileCompleted
          }[0]`;
          const params = { userId: data.user.id };
          const fetchedUserData = await client.fetch(query, params);

          if (!fetchedUserData) {
            throw new Error(t("profile:userNotFound"));
          }

          if (!fetchedUserData.isProfileCompleted) {
            router.push("/signup");
            return;
          }

          setUserData(fetchedUserData);
          setUserImage(
            fetchedUserData.image ? urlFor(fetchedUserData.image).url() : null
          );
        } else {
          throw new Error(t("profile:userNotAuthenticated"));
        }
      } catch (error) {
        console.error("Auth verification failed:", error.message);
        setError(error.message);
        router.push(`/login?error=${encodeURIComponent(error.message)}`);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router, t]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setIsAuthenticated(false);
        setUserId(null);
        setUserImage(null);
        setUserData(null);
        router.push("/");
        window.location.reload();
      } else {
        throw new Error(t("profile:logoutFailed"));
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview userData={userData} />;
      case "settings":
        return <SettingsPage userData={userData} />;
      case "billing":
        return <Billing />;
      case "orders":
        return <Orders userId={userId} />;
      case "reservations":
        return <Reservations />;
      case "favorites":
        return <Favorites userId={userId} />;
      case "horses":
        return <Horses userId={userId} />;
      case "services":
        return <Services userId={userId} />;
      case "educational_service":
        return <EducationalService userId={userId} />;
      case "supplier_products":
        return <SupplierProducts userId={userId} />;
      case "stable_owner":
        return <StableOwner userId={userId} />;
      default:
        return <Overview userData={userData} />;
    }
  };

  const handleSetActiveTab = (tab) => {
    if (tab === "signout") {
      handleLogout();
    } else {
      setActiveTab(tab);
      setIsMobileMenuOpen(false);
      router.push(`/profile?tab=${tab}`, { scroll: false });
    }
  };

  const accountLinks = [
    {
      id: "overview",
      label: t("profile:navigation.overview"),
      icon: <User className="w-5 h-5 opacity-60" />,
    },
    {
      id: "settings",
      label: t("profile:navigation.settings"),
      icon: <Settings className="w-5 h-5 opacity-60" />,
    },
    {
      id: "billing",
      label: t("profile:navigation.billing"),
      icon: <Wallet className="w-5 h-5 opacity-60" />,
    },
  ];

  const dashboardLinks = [
    {
      id: "orders",
      label: t("profile:navigation.orders"),
      icon: <ShoppingCart className="w-5 h-5 opacity-60" />,
    },
    {
      id: "reservations",
      label: t("profile:navigation.reservations"),
      icon: <Calendar className="w-5 h-5 opacity-60" />,
    },
    {
      id: "favorites",
      label: t("profile:navigation.favorites"),
      icon: <Heart className="w-5 h-5 opacity-60" />,
    },
    {
      id: "horses",
      label: t("profile:navigation.horses"),
      icon: <LiaHorseHeadSolid className="w-5 h-5 opacity-60" />,
    },
    ...(userData?.userType === "provider"
      ? [
          {
            id: "services",
            label: t("profile:navigation.services"),
            icon: <Briefcase className="w-5 h-5 opacity-60" />,
          },
        ]
      : []),
    ...(userData?.userType === "educational_services"
      ? [
          {
            id: "educational_service",
            label: t("profile:navigation.educational_service"),
            icon: <BookOpen className="w-5 h-5 opacity-60" />,
          },
        ]
      : []),
    ...(userData?.userType === "suppliers"
      ? [
          {
            id: "supplier_products",
            label: t("profile:navigation.supplier_products"),
            icon: <Package className="w-5 h-5 opacity-60" />,
          },
        ]
      : []),
    ...(userData?.userType === "stable_owner"
      ? [
          {
            id: "stable_owner",
            label: t("profile:navigation.stable_owner"),
            icon: <Home className="w-5 h-5 opacity-60" />,
          },
        ]
      : []),
  ];

  const logoutLink = [
    {
      id: "signout",
      label: t("profile:navigation.signout"),
      icon: <LogOut className="w-5 h-5 opacity-60" />,
    },
  ];

  const getUserTypeLabel = (userType) => {
    const userTypeMap = {
      rider: t("profile:userTypes.rider"),
      provider: t("profile:userTypes.provider"),
      suppliers: t("profile:userTypes.suppliers"),
      stable_owner: t("profile:userTypes.stable_owner"),
      educational_services: t("profile:userTypes.educational_services"),
    };
    return userTypeMap[userType] || userType;
  };

  if (isLoading) {
    return (
      <Layout>
        <Preloader />
      </Layout>
    );
  }

  if (error || !userData) {
    return null;
  }

  return (
    <Layout>
      <div className="bg-blueGray-50 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                <Image
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  src={userImage || "/placeholder.svg"}
                  alt={userData.fullName || t("profile:userName")}
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {userData.userName || t("profile:userName")}
                </h3>
                <p className="text-xs text-gray-500">{userData.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div className="flex flex-col lg:flex-row container py-5 mt-4 mt-lg-5 mb-lg-4 my-xl-5">
          {/* Sidebar */}
          <aside className={`lg:m-w-[300px] lg:col-lg-3 lg:pe-lg-4 lg:pe-xl-5 lg:mt-n3 transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen 
              ? `block fixed inset-y-0 w-80 bg-white shadow-xl z-50 overflow-y-auto transform translate-x-0 ${
                  locale === "ar" ? "right-0" : "left-0"
                }` 
              : 'hidden lg:block lg:transform-none'
          } ${locale === "ar" ? "lg:right-0 lg:left-auto" : ""}`}>
            <div className="lg:sticky lg:top-0">
              <div className="p-4 lg:pl-4 lg:pb-4 lg:pr-4 lg:pt-20">
                {/* Mobile Close Button */}
                <div className="lg:hidden flex justify-end mb-4">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Profile Section */}
                <div className="pb-10 lg:pb-lg-8 mb-4 lg:mb-5">
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="w-24 h-24 rounded-full bg-gray-100 bg-cover bg-center shadow-lg ring-4 ring-[#8c6b23]/10 mb-4 transition-transform duration-300 hover:scale-105">
                      <Image
                        width={96}
                        height={96}
                        className="w-24 h-24 block rounded-full border-2 border-gray-100 shadow-sm"
                        src={userImage || "/placeholder.svg"}
                        alt={userData.fullName || t("profile:userName")}
                      />
                    </div>
                    <div className={`text-center lg:text-left ${locale === "ar" ? "lg:text-right" : ""}`}>
                      <div className={`flex items-center gap-3 mb-1 ${
                        locale === "ar" ? "justify-center lg:justify-end" : "justify-center lg:justify-start"
                      }`}>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {userData.userName || t("profile:userName")}
                        </h3>
                        {userData.userType && (
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium transition-all duration-200 ${
                              userData.userType === "rider"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                : userData.userType === "provider"
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : userData.userType === "suppliers"
                                    ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                    : userData.userType === "stable_owner"
                                      ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                      : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            }`}
                          >
                            {getUserTypeLabel(userData.userType)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        {userData.email}
                      </p>
                      {userData.addressDetails && (
                        <p className="text-sm text-gray-500 mb-0">
                          {userData.city?.[locale === "en" ? "name_en" : "name_ar"]}, 
                          {userData.governorate?.[locale === "en" ? "name_en" : "name_ar"]}, 
                          {userData.country?.[locale === "en" ? "name_en" : "name_ar"]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="pb-10">
                  {/* Account Section */}
                  <div className="pb-6">
                    <h4 className={`text-xs font-medium text-gray-500 uppercase pb-1 mb-2 ${
                      locale === "ar" ? "text-right" : "text-left"
                    }`}>
                      {t("profile:account")}
                    </h4>
                    {accountLinks.map((link) => (
                      <div
                        key={link.id}
                        onClick={() => handleSetActiveTab(link.id)}
                        className={`flex items-center py-2 px-3 rounded-lg font-light cursor-pointer transition-all duration-200 touch-manipulation ${
                          activeTab === link.id
                            ? "text-blue-500 font-medium bg-blue-50"
                            : "text-gray-700 hover:bg-gray-50"
                        } ${locale === "ar" ? "" : ""}`}
                      >
                        <span className={locale === "ar" ? "ml-3" : "mr-3"}>
                          {link.icon}
                        </span>
                        <span className={locale === "ar" ? "text-right" : "text-left"}>
                          {link.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Dashboard Section */}
                  <div className="pb-6">
                    <h4 className={`text-xs font-medium text-gray-500 uppercase pb-1 mb-2 ${
                      locale === "ar" ? "text-right" : "text-left"
                    }`}>
                      {t("profile:dashboard")}
                    </h4>
                    {dashboardLinks.map((link) => (
                      <div
                        key={link.id}
                        onClick={() => handleSetActiveTab(link.id)}
                        className={`flex items-center py-2 px-3 rounded-lg font-light cursor-pointer transition-all duration-200 touch-manipulation ${
                          activeTab === link.id
                            ? "text-blue-500 font-medium bg-blue-50"
                            : "text-gray-700 hover:bg-gray-50"
                        } ${locale === "ar" ? "" : ""}`}
                      >
                        <span className={locale === "ar" ? "ml-3" : "mr-3"}>
                          {link.icon}
                        </span>
                        <span className={locale === "ar" ? "text-right" : "text-left"}>
                          {link.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Sign Out Section */}
                  <div>
                    <h4 className={`text-xs font-medium text-gray-500 uppercase pb-1 mb-2 ${
                      locale === "ar" ? "text-right" : "text-left"
                    }`}>
                      {t("profile:logout")}
                    </h4>
                    <div className="px-4 bg-red-400 rounded-xl text-white">
                      {logoutLink.map((link) => (
                        <div
                          key={link.id}
                          onClick={() => handleSetActiveTab(link.id)}
                          className={`rounded-xl cursor-pointer flex items-center py-2 px-0 font-light transition-colors hover:bg-red-500 touch-manipulation ${
                            locale === "ar" ? "" : ""
                          }`}
                        >
                          <span className={locale === "ar" ? "ml-3" : "mr-3"}>
                            {link.icon}
                          </span>
                          <span className={locale === "ar" ? "text-right" : "text-left"}>
                            {link.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              {/* Mobile Tab Indicator */}
              <div className="lg:hidden mb-4">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {t(`profile:navigation.${activeTab}`)}
                    </h2>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {activeTab === "overview" && t("profile:overviewTitle")}
                    {activeTab === "settings" && t("profile:navigation.settings")}
                    {activeTab === "billing" && t("profile:billingTitle")}
                    {activeTab === "orders" && t("profile:ordersTitle")}
                    {activeTab === "reservations" && t("profile:navigation.reservations")}
                    {activeTab === "favorites" && t("profile:favoritesTitle")}
                    {activeTab === "horses" && t("profile:horsesTitle")}
                    {activeTab === "services" && t("profile:navigation.services")}
                    {activeTab === "educational_service" && t("profile:educationalServices")}
                    {activeTab === "supplier_products" && t("profile:navigation.supplier_products")}
                    {activeTab === "stable_owner" && t("profile:navigation.stable_owner")}
                  </p>
                </div>
              </div>
              
              {/* Content Container */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;