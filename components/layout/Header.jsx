"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { client, urlFor } from "../../src/lib/sanity";
import userFallbackImage from "../../public/assets/imgs/elements/user.png";
import i18nConfig from "../../i18nConfig";
import { Globe } from "lucide-react";
import ServiceSearchPopup from "../elements/ServiceSearchPopup";
import { Search } from "lucide-react";

const Header = ({ handleHidden }) => {
  const router = useRouter();
  const currentPathname = usePathname();
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language;
  const isRTL = currentLocale === "ar";

  const [scroll, setScroll] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    document.addEventListener("scroll", () => {
      const scrollCheck = window.scrollY > 100;
      if (scrollCheck !== scroll) {
        setScroll(scrollCheck);
      }
    });
  }, []);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (data.authenticated) {
          setIsAuthenticated(true);
          setUserId(data.user.id);

          // Fetch user data after setting userId
          const fetchUserData = async () => {
            try {
              const query = `*[_type == "user" && _id == $userId]{
                image
              }[0]`;
              const params = { userId: data.user.id }; // Use data.user.id directly
              const userData = await client.fetch(query, params);

              if (!userData) {
                throw new Error("User not found.");
              }

              setUserImage(userData.image);

              // Update state with user data (e.g., setUserImage(userData.image))
            } catch (err) {
              console.error("Error fetching user data:", err);
              setError("Failed to load profile data.");
            }
          };

          await fetchUserData(); // Call fetchUserData after setting userId
        }
      } catch (error) {
        console.error("Error verifying user:", error);
        setError("Authentication failed.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, [client]); // Add dependencies if needed (e.g., client)

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Clear local state
        setIsAuthenticated(false);
        setUserId(null);
        setUserImage(null);

        // Redirect to home page
        router.push("/");

        // Force a full page refresh
        window.location.reload();
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleLanguageChange = (e) => {
    const newLocale = e.target.value;
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

    if (
      currentLocale === i18nConfig.defaultLocale &&
      !i18nConfig.prefixDefault
    ) {
      router.push("/" + newLocale + currentPathname);
    } else {
      router.push(
        currentPathname.replace(`/${currentLocale}`, `/${newLocale}`)
      );
    }
    router.refresh();
  };

  const getFlagEmoji = (countryCode) => {
    switch (countryCode) {
      case "en":
        return "🇺🇸";
      case "ar":
        return "🇸🇦";
      default:
        return "";
    }
  };

  const getLanguageName = (code) => {
    const names = {
      en: "English",
      ar: "العربية",
    };
    return names[code] || code;
  };

  const getDirectionBasedStyles = () => {
    return {
      container: `container bg-transparent ${isRTL ? "rtl" : "ltr"}`,
      navFlex: `bg-transparent flex justify-between items-center py-3 ${isRTL ? "flex-row-reverse" : "flex-row"}`,
      menuSpace: `hidden lg:flex lg:items-center lg:w-auto lg:flex-wrap lg:justify-between gap-11`,
      dropdownMenu: `drop-down-menu min-w-200 ${isRTL ? "right-0" : "left-0"}`,
      languageDropdown: `absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50`,
      flexContainer: `flex items-center ${isRTL ? "space-x-4-reverse mr-4" : "space-x-4 ml-4"}`,
      languageButton: `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
        bg-white/10 backdrop-blur-sm border border-gray-200 hover:border-gray-300
        shadow-sm hover:shadow-md ${isRTL ? "flex-row-reverse" : "flex-row"}`,
      logoContainer: `order-${isRTL ? "1" : "0"}`,
      buttonsContainer: `flex order-${isRTL ? "0" : "1"}`,
      mobileMenuButton: `lg:hidden ${isRTL ? "ml-2" : "mr-2"}`,
    };
  };

  const styles = getDirectionBasedStyles();

  return (
    <header
      className={
        scroll
          ? "bg-transparent sticky-bar mt-4 stick"
          : "bg-transparent sticky-bar mt-4"
      }
    >
      <div className={styles.container}>
        <nav className={styles.navFlex}>
          <div className={styles.buttonsContainer}>
            <button onClick={() => setIsSearchOpen(true)}>
              <Search className="" />
            </button>

            {/* Language Switcher */}
            <div
              className={`relative lg:block hidden ${isRTL ? "mr-2" : "ml-2"}`}
            >
              <div className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className={styles.languageButton}
                >
                  <span className="text-sm font-medium text-gray-700">
                    {getFlagEmoji(currentLocale)}{" "}
                    {getLanguageName(currentLocale)}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isLangOpen ? "transform rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isLangOpen && (
                  <div className={styles.languageDropdown}>
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      {["en", "ar"].map((locale) => (
                        <button
                          key={locale}
                          onClick={(e) => {
                            handleLanguageChange({ target: { value: locale } });
                            setIsLangOpen(false);
                          }}
                          className={`${
                            currentLocale === locale
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700"
                          } group flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150`}
                          role="menuitem"
                        >
                          <span className="mr-2">{getFlagEmoji(locale)}</span>
                          <span>{getLanguageName(locale)}</span>
                          {currentLocale === locale && (
                            <svg
                              className="w-4 h-4 ml-auto text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* login */}
            <div className="hidden lg:block">
              {isAuthenticated ? (
                <div className={styles.flexContainer}>
                  <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer">
                    <Image
                      src={
                        userImage ? urlFor(userImage).url() : userFallbackImage
                      }
                      alt="User profile"
                      width={40}
                      height={40}
                      className="object-cover w-full h-full rounded-full cursor-pointer"
                      onClick={() => router.push("/profile")}
                    />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-primary hover-up-2"
                  >
                    {t("header:logOut")}
                  </button>
                </div>
              ) : (
                <div
                  className={`hidden lg:block ${isRTL ? "space-x-4-reverse mr-4" : "space-x-2 ml-4"}`}
                >
                  <Link href="/login" className="btn-accent hover-up-2">
                    {t("header:logIn")}
                  </Link>
                  <Link href="/signup" className="btn-primary hover-up-2">
                    {t("header:signUp")}
                  </Link>
                </div>
              )}
            </div>
          </div>

          <Link
            href="/"
            className={`text-3xl font-semibold leading-none ${styles.logoContainer}`}
          >
            <Image
              className="h-10"
              src="/assets/imgs/logos/logo.png"
              alt="Monst"
              width={125}
              height={40}
            />
          </Link>

          <ul className={styles.menuSpace} style={{"gap": "40px"}}>
            {/* Menu items */}
            <li className="group relative pt-4 pb-4">
              <Link
                href="/"
                className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
              >
                {t("header:home")}
              </Link>
            </li>
            <li className="group relative pt-4 pb-4">
              <Link
                href="/horses"
                className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
              >
                {t("header:horses")}
              </Link>
            </li>
            <li className="group relative pt-4 pb-4">
              <Link
                href="/Stables"
                className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
              >
                {t("header:stables")}
              </Link>
            </li>
            <li className="group relative pt-4 pb-4">
              <Link
                href="/competitions"
                className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
              >
                {t("header:competitions")}
              </Link>
            </li>
            <li className="group relative pt-4 pb-4">
              <Link
                href="/tripCoordinator"
                className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
              >
                {t("header:trips")}
              </Link>
            </li>
            <li className="group relative pt-4 pb-4 has-child">
              <Link
                href="/publicServices"
                className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
              >
                {t("header:publicServices")}
              </Link>
              <ul className={styles.dropdownMenu}>
                <li>
                  <Link
                    href="/veterinarian"
                    className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                  >
                    {t("header:veterinarian")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/housing"
                    className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                  >
                    {t("header:housing")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/horseTrainer"
                    className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                  >
                    {t("header:horseTrainer")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/horseTrimmer"
                    className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                  >
                    {t("header:horseTrimmer")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/horseTransport"
                    className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                  >
                    {t("header:horseTransport")}
                  </Link>
                </li>
              </ul>
            </li>
            <li className="group relative pt-4 pb-4 has-child">
              <Link
                href="/publicMarket"
                className="text-sm font-semibold text-blueGray-600 hover:text-blueGray-500"
              >
                {t("header:publicMarket")}
              </Link>
              <ul className={styles.dropdownMenu}>
                <li>
                  <Link
                    href="/contractors"
                    className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                  >
                    {t("header:contractors")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/suppliers"
                    className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                  >
                    {t("header:suppliers")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/horseCatering"
                    className="menu-sub-item text-sm text-blueGray-600 hover:text-blueGray-500"
                  >
                    {t("header:horseCatering")}
                  </Link>
                </li>
              </ul>
            </li>
          </ul>

          {/* Mobile menu button */}
          <div className={styles.mobileMenuButton}>
            <button
              className="navbar-burger flex items-center py-2 px-3 text-[#b28a2f] hover:text-[#b28a2f] rounded border border-blue-200 hover:border-blue-300"
              onClick={handleHidden}
            >
              <svg
                className="fill-current h-4 w-4"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Mobile menu</title>
                <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Click outside handler */}
      {isLangOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsLangOpen(false)}
        ></div>
      )}

      {isSearchOpen && (
        <ServiceSearchPopup onClose={() => setIsSearchOpen(false)} />
      )}
    </header>
  );
};

export default Header;
