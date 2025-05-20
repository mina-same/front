"use client";

import React, { useState, useEffect } from "react";
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
import { client } from "@/lib/sanity";
import { LiaHorseHeadSolid } from "react-icons/lia";
import Layout from "components/layout/Layout";
import Image from 'next/image';


const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Valid tabs for validation
  const validTabs = [
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
    "signout",
  ];

  // Set initial active tab based on query parameter
  useEffect(() => {
    const tabFromQuery = searchParams.get("tab");
    if (tabFromQuery && validTabs.includes(tabFromQuery)) {
      setActiveTab(tabFromQuery);
    } else {
      setActiveTab("overview");
    }
  }, [searchParams]);

  // Fetch user data from Sanity and check isProfileCompleted
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
          throw new Error(
            data.error || `HTTP error! status: ${response.status}`
          );
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
            throw new Error("User not found in database.");
          }

          // Check if profile is completed
          if (!fetchedUserData.isProfileCompleted) {
            router.push("/signup");
            return;
          }

          setUserData(fetchedUserData);
          setUserImage(
            fetchedUserData.image ? urlFor(fetchedUserData.image).url() : null
          );
        } else {
          throw new Error("User not authenticated.");
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
  }, [router]);

  // Handle logout
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
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Map sidebar links to components
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview userData={userData} />;
      case "settings":
        return <SettingsPage userData={userData} />;
      case "billing":
        return <Billing />;
      case "orders":
        return <Orders userId={userId}/>;
      case "reservations":
        return <Reservations />;
      case "favorites":
        return <Favorites />;
      case "horses":
        return <Horses userId={userId} />;
      case "services":
        return <Services userId={userId}/>;
      case "educational_service":
        return <EducationalService userId={userId} />;
      case "supplier_products":
        return <SupplierProducts userId={userId} />;
      default:
        return <Overview userData={userData} />;
    }
  };

  // Handle tab change
  const handleSetActiveTab = (tab) => {
    if (tab === "signout") {
      handleLogout();
    } else {
      setActiveTab(tab);
      router.push(`/profile?tab=${tab}`, { scroll: false });
    }
  };

  // Sidebar links configuration
  const accountLinks = [
    {
      id: "overview",
      label: "Overview",
      icon: <User className="w-5 h-5 opacity-60 mr-2" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5 opacity-60 mr-2" />,
    },
    {
      id: "billing",
      label: "Billing",
      icon: <Wallet className="w-5 h-5 opacity-60 mr-2" />,
    },
  ];

  const dashboardLinks = [
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingCart className="w-5 h-5 opacity-60 mr-2" />,
    },
    {
      id: "reservations",
      label: "Reservations",
      icon: <Calendar className="w-5 h-5 opacity-60 mr-2" />,
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: <Heart className="w-5 h-5 opacity-60 mr-2" />,
    },
    {
      id: "horses",
      label: "Horses",
      icon: <LiaHorseHeadSolid className="w-5 h-5 opacity-60 mr-2" />,
    },
    ...(userData?.userType === "provider"
      ? [
          {
            id: "services",
            label: "Services",
            icon: <Briefcase className="w-5 h-5 opacity-60 mr-2" />,
          },
        ]
      : []),
    ...(userData?.userType === "educational_services"
      ? [
          {
            id: "educational_service",
            label: "Educational Service",
            icon: <BookOpen className="w-5 h-5 opacity-60 mr-2" />,
          },
        ]
      : []),
    ...(userData?.userType === "suppliers"
      ? [
          {
            id: "supplier_products",
            label: "Supplier Products",
            icon: <Package className="w-5 h-5 opacity-60 mr-2" />,
          },
        ]
      : []),
  ];

  const logoutLink = [
    {
      id: "signout",
      label: "Sign out",
      icon: <LogOut className="w-5 h-5 opacity-60 mr-2" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !userData) {
    return null;
  }

  return (
    <Layout>
      <div className="bg-blueGray-50">
        <div className="flex container py-5 mt-4 mt-lg-5 mb-lg-4 my-xl-5">
          {/* Sidebar */}
          <aside className="m-w-[300px] col-lg-3 pe-lg-4 pe-xl-5 mt-n3">
            <div className="lg:sticky lg:top-0">
              <div className="lg:block">
                <div className="pl-4 pb-4 pr-4 pt-20">
                  {/* User profile section */}
                  <div className="pb-8 lg:pb-8 mb-4 lg:mb-5">
                    <div className="w-24 h-24 rounded-full bg-gray-100 bg-cover bg-center shadow-lg ring-4 ring-[#8c6b23]/10 pb-5 transition-transform duration-300 group-hover:scale-105">
                      <Image 
                        fill
                        className="w-24 h-24 block rounded-full mb-3 border-2 border-gray-100 shadow-sm"
                        src={userImage || "/placeholder.svg"}
                        alt={userData.fullName || "User"}
                      />
                    </div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {userData.userName || "User Name"}
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
                              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                          }`}
                        >
                          {userData.userType}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-1">
                      {userData.email}
                    </p>
                    {userData.addressDetails && (
                      <p className="text-sm text-gray-500 mb-0">
                        {userData.addressDetails}, {userData.city?.name},{" "}
                        {userData.governorate?.name}, {userData.country?.name}
                      </p>
                    )}
                  </div>

                  {/* Account navigation */}
                  <nav className="pb-6 lg:pb-6 mb-3">
                    <h4 className="text-xs font-medium text-gray-500 uppercase pb-1 mb-2">
                      Account
                    </h4>
                    {accountLinks.map((link) => (
                      <div
                        key={link.id}
                        onClick={() => handleSetActiveTab(link.id)}
                        className={`flex items-center py-2 px-0 font-light cursor-pointer ${
                          activeTab === link.id
                            ? "text-blue-500 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {link.icon}
                        {link.label}
                      </div>
                    ))}
                  </nav>

                  {/* Dashboard navigation */}
                  <nav className="pb-6 lg:pb-6 mb-1">
                    <h4 className="text-xs font-medium text-gray-500 uppercase pb-1 mb-2">
                      Dashboard
                    </h4>
                    {dashboardLinks.map((link) => (
                      <div
                        key={link.id}
                        onClick={() => handleSetActiveTab(link.id)}
                        className={`flex items-center py-2 px-0 font-light cursor-pointer ${
                          activeTab === link.id
                            ? "text-blue-500 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {link.icon}
                        {link.label}
                      </div>
                    ))}
                  </nav>

                  {/* Sign out */}
                  <h4 className="text-xs font-medium text-gray-500 uppercase pb-1 mb-2">
                    Log out
                  </h4>
                  <nav className="px-4 bg-red-400 rounded-xl text-white">
                    {logoutLink.map((link) => (
                      <div
                        key={link.id}
                        onClick={() => handleSetActiveTab(link.id)}
                        className={`rounded-xl cursor-pointer flex items-center py-2 px-0 font-light`}
                      >
                        {link.icon}
                        {link.label}
                      </div>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">{renderContent()}</div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
