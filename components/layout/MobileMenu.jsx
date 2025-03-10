"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { client, urlFor } from "../../src/lib/sanity";
import userFallbackImage from "../../public/assets/imgs/elements/user.png";
import i18nConfig from "../../i18nConfig";
import { Globe } from "lucide-react";

const MobileMenu = ({ hiddenClass, handleRemove }) => {
  const router = useRouter();
  const currentPathname = usePathname();
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language;
  const isRTL = currentLocale === "ar";

  const [isActive, setIsActive] = useState({
    status: false,
    key: "",
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleToggle = (key) => {
    if (isActive.key === key) {
      setIsActive({
        status: false,
      });
    } else {
      setIsActive({
        status: true,
        key,
      });
    }
  };

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

          const fetchUserData = async () => {
            try {
              const query = `*[_type == "user" && _id == $userId]{
                image
              }[0]`;
              const params = { userId: data.user.id };
              const userData = await client.fetch(query, params);

              if (!userData) {
                throw new Error("User not found.");
              }

              setUserImage(userData.image);
            } catch (err) {
              console.error("Error fetching user data:", err);
              setError("Failed to load profile data.");
            }
          };

          await fetchUserData();
        }
      } catch (error) {
        console.error("Error verifying user:", error);
        setError("Authentication failed.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, []);

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
        router.push("/");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleLanguageChange = (locale) => {
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();
    document.cookie = `NEXT_LOCALE=${locale};expires=${expires};path=/`;

    if (
      currentLocale === i18nConfig.defaultLocale &&
      !i18nConfig.prefixDefault
    ) {
      router.push("/" + locale + currentPathname);
    } else {
      router.push(currentPathname.replace(`/${currentLocale}`, `/${locale}`));
    }
    router.refresh();
  };

  const getFlagEmoji = (countryCode) => {
    return countryCode === "ar" ? "🇸🇦" : "🇺🇸";
  };

  const getLanguageName = (code) => {
    return code === "ar" ? "العربية" : "English";
  };

  return (
    <div
      className={`${hiddenClass} navbar-menu relative z-50 transition duration-300`}
    >
      <div className="navbar-backdrop fixed inset-0 bg-blueGray-800 opacity-25"></div>
      <nav
        className={`fixed top-0 ${isRTL ? "right-0" : "left-0"} bottom-0 flex flex-col w-5/6 max-w-sm py-6 px-6 bg-white border-r overflow-y-auto transition duration-300`}
      >
        <div className="flex items-center mb-8">
          <Link
            href="/"
            className={`${isRTL ? "ml-auto" : "mr-auto"} text-3xl font-semibold leading-none`}
          >
            <Image
              className="h-10"
              src="/assets/imgs/logos/logohorse.svg"
              alt="Monst"
              width={125}
              height={40}
            />
          </Link>
          <button className="navbar-close" onClick={handleRemove}>
            <svg
              className="h-6 w-6 text-blueGray-400 cursor-pointer hover:text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* Language Switcher */}
        <div className="mb-4">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center w-full p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl"
          >
            <Globe className="w-4 h-4 mr-2" />
            <span>
              {getFlagEmoji(currentLocale)} {getLanguageName(currentLocale)}
            </span>
          </button>
          {isLangOpen && (
            <div className="pl-4">
              {["en", "ar"].map((locale) => (
                <button
                  key={locale}
                  onClick={() => {
                    handleLanguageChange(locale);
                    setIsLangOpen(false);
                  }}
                  className="w-full p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 flex items-center"
                >
                  <span className="mr-2">{getFlagEmoji(locale)}</span>
                  <span>{getLanguageName(locale)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <ul className="mobile-menu">
            <li className="mb-1 rounded-xl">
              <Link
                href="/"
                className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl"
              >
                {t("header:home")}
              </Link>
            </li>

            <li className="mb-1 rounded-xl">
              <Link
                href="/Stables"
                className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl"
              >
                {t("header:stables")}
              </Link>
            </li>

            <li className="mb-1 rounded-xl">
              <Link
                href="/competitions"
                className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl"
              >
                {t("header:competitions")}
              </Link>
            </li>

            <li className="mb-1 rounded-xl">
              <Link
                href="/tripCoordinator"
                className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl"
              >
                {t("header:trips")}
              </Link>
            </li>

            <li
              className={
                isActive.key == 1
                  ? "mb-1 menu-item-has-children rounded-xl active"
                  : "mb-1 menu-item-has-children rounded-xl"
              }
              onClick={() => handleToggle(1)}
            >
              <span
                className={`menu-expand ${isRTL ? "rtl-plus" : "ltr-plus"}`}
              >
                +
              </span>
              <Link
                href="/publicServices"
                className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl"
              >
                {t("header:publicServices")}
              </Link>
              <ul className={isActive.key == 1 ? "dropdown pl-5" : "hidden"}>
                <li>
                  <Link
                    href="/veterinarian"
                    className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500"
                  >
                    {t("header:veterinarian")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/housing"
                    className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500"
                  >
                    {t("header:housing")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/horseTrainer"
                    className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500"
                  >
                    {t("header:horseTrainer")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/horseTrimmer"
                    className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500"
                  >
                    {t("header:horseTrimmer")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/horseTransport"
                    className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500"
                  >
                    {t("header:horseTransport")}
                  </Link>
                </li>
              </ul>
            </li>

            <li
              className={
                isActive.key == 2
                  ? "mb-1 menu-item-has-children rounded-xl active"
                  : "mb-1 menu-item-has-children rounded-xl"
              }
              onClick={() => handleToggle(2)}
            >
              <span
                className={`menu-expand ${isRTL ? "rtl-plus" : "ltr-plus"}`}
              >
                +
              </span>
              <Link
                href="/publicMarket"
                className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl"
              >
                {t("header:publicMarket")}
              </Link>
              <ul className={isActive.key == 2 ? "dropdown pl-5" : "hidden"}>
                <li>
                  <Link
                    href="/contractors"
                    className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500"
                  >
                    {t("header:contractors")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/suppliers"
                    className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500"
                  >
                    {t("header:suppliers")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/horseCatering"
                    className="block p-3 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500"
                  >
                    {t("header:horseCatering")}
                  </Link>
                </li>
              </ul>
            </li>

            <li className="mb-1 rounded-xl">
              <Link
                href="/contact"
                className="block p-4 text-sm text-blueGray-500 hover:bg-blue-50 hover:text-blue-500 rounded-xl"
              >
                {t("header:contact")}
              </Link>
            </li>
          </ul>

          {/* Authentication Section */}
          <div className="mt-4 pt-6 border-t border-blueGray-100">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 px-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
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
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {t("header:logOut")}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="block px-4 py-3 mb-3 text-sm text-center font-semibold leading-none bg-blue-400 hover:bg-blue-500 text-white rounded"
                >
                  {t("header:signUp")}
                </Link>
                <Link
                  href="/login"
                  className="block px-4 py-3 mb-2 text-sm text-center text-blue-500 hover:text-blue-700 font-semibold leading-none border border-blue-200 hover:border-blue-300 rounded"
                >
                  {t("header:logIn")}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default MobileMenu;
