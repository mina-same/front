"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  Users,
  Heart,
  Share2,
  Star,
  Shield,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  X,
  Link2,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  Pin,
  TikTok,
  Loader2,
} from "lucide-react";
import {
  FaPinterest,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaFacebook,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";
import { client, urlFor } from "../../../../lib/sanity";
import Layout from "components/layout/Layout";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import ReservationPopup from "components/elements/ReservationPopup";
import Preloader from "components/elements/Preloader";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

// Alert Component
const Alert = ({ message, isVisible, onClose, type }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-auto"
      >
        <div
          className={`bg-white shadow-xl rounded-lg p-4 flex items-start ${type === "success" ? "border-l-4 border-green-500" : "border-l-4 border-red-500"}`}
        >
          {type === "success" ? (
            <CheckCircle className="text-green-500 mr-3" size={24} />
          ) : (
            <AlertTriangle className="text-red-500 mr-3" size={24} />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close alert"
          >
            <X size={20} />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Image Gallery Modal Component
const ImageGalleryModal = ({
  selectedIndex,
  images,
  onClose,
  onNext,
  onPrev,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div
      className="relative max-w-6xl w-full px-6"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.img
        key={selectedIndex}
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0.5, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        src={images[selectedIndex]}
        alt="Image gallery"
        className="w-full h-auto max-h-[80vh] object-contain"
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-gray-900 bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
        aria-label="Close gallery"
      >
        <X size={20} />
      </button>
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-900 bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
        aria-label="Previous image"
        disabled={selectedIndex === 0}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-900 bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
        aria-label="Next image"
        disabled={selectedIndex === images.length - 1}
      >
        <ChevronRight size={24} />
      </button>
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2.5 h-2.5 rounded-full ${selectedIndex === index ? "bg-white" : "bg-white bg-opacity-50"}`}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

// Social Media Icon Component
const SocialMediaIcon = ({ linkType, url }) => {
  const icons = {
    website: <Link2 size={20} />,
    instagram: <FaInstagram size={20} />,
    facebook: <FaFacebook size={20} />,
    youtube: <FaYoutube size={20} />,
    x: <FaTwitter size={20} />,
    linkedin: <FaLinkedin size={20} />,
    pinterest: <FaPinterest size={20} />,
    tiktok: <FaTiktok size={20} />,
  };
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-500 hover:text-primary transition-colors"
    >
      {icons[linkType] || <Link2 size={20} />}
    </a>
  );
};

export default function StableDetailsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const params = useParams();
  const { stableId } = params;

  const [stable, setStable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistedServices, setWishlistedServices] = useState(new Set());
  const [wishlistServiceLoading, setWishlistServiceLoading] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [alert, setAlert] = useState({
    isVisible: false,
    message: "",
    type: "error",
  });

  useEffect(() => {
    if (!stableId) return;

    const fetchStable = async () => {
      try {
        const stableQuery = `*[_type == "stables" && _id == $stableId][0]{
            ...,
            city->{name_ar, name_en},
            country->{name_ar, name_en},
            government->{name_ar, name_en},
            userRef->{
              _id,
              userName,
              image
            },
            horses[]->{
              _id,
              name_ar,
              name_en,
              image
            },
            fullTimeServices[]->{
              _id,
              name_ar,
              name_en,
              price,
              priceUnit,
              images,
              serviceType,
              serviceAverageRating,
              serviceRatingCount,
              years_of_experience
            },
            freelancerServices[]->{
              _id,
              name_ar,
              name_en,
              price,
              priceUnit,
              images,
              serviceType,
              serviceAverageRating,
              serviceRatingCount,
              years_of_experience
            }
          }`;

        const stableData = await client.fetch(stableQuery, { stableId });
        setStable(stableData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    const verifyAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok)
          throw new Error(`Verify API failed with status: ${response.status}`);
        const data = await response.json();
        if (data.authenticated) {
          const userId = data.userId || data.user?.id || data.user?.userId;
          setCurrentUserId(userId);
          const userQuery = `*[_type == "user" && _id == $userId][0]{wishlistStables[]->{_id}, wishlistServices[]->{_id}}`;
          const userData = await client.fetch(userQuery, { userId });
          const isStableInWishlist =
            userData?.wishlistStables?.some(
              (stable) => stable._id === stableId
            ) || false;
          setIsInWishlist(isStableInWishlist);
          setWishlistedServices(
            new Set(userData?.wishlistServices?.map((s) => s._id) || [])
          );
        }
      } catch (error) {
        console.error("Auth verification failed:", error.message);
      }
    };

    fetchStable();
    verifyAuth();
  }, [stableId]);

  const showAlert = useCallback((message, type = "error") => {
    setAlert({ isVisible: true, message, type });
    setTimeout(
      () => setAlert({ isVisible: false, message: "", type: "error" }),
      3000
    );
  }, []);

  const toggleServiceWishlist = async (serviceId) => {
    if (!currentUserId) {
      showAlert(t("stableDetails:loginToWishlist"));
      return;
    }

    const cleanServiceId = serviceId.replace("drafts.", "");
    setWishlistServiceLoading((prev) => ({ ...prev, [cleanServiceId]: true }));

    try {
      const userQuery = `*[_type == "user" && _id == $userId][0]{wishlistServices[]->{_id}}`;
      const userData = await client.fetch(userQuery, { userId: currentUserId });
      const wishlistServices =
        userData?.wishlistServices?.map((s) => s._id) || [];
      const isWishlisted = wishlistServices.includes(cleanServiceId);

      if (isWishlisted) {
        const index = wishlistServices.findIndex((id) => id === cleanServiceId);
        if (index === -1) {
          showAlert(t("stableDetails:errors.serviceNotInWishlist"));
          return;
        }
        await client
          .patch(currentUserId)
          .unset([`wishlistServices[${index}]`])
          .commit();
        setWishlistedServices((prev) => {
          const newSet = new Set(prev);
          newSet.delete(cleanServiceId);
          showAlert(t("stableDetails:removedFromWishlist"), "success");
          return newSet;
        });
      } else {
        const wishlistItem = {
          _key: uuidv4(),
          _type: "reference",
          _ref: cleanServiceId,
        };
        await client
          .patch(currentUserId)
          .setIfMissing({ wishlistServices: [] })
          .append("wishlistServices", [wishlistItem])
          .commit();
        setWishlistedServices((prev) => {
          const newSet = new Set(prev);
          newSet.add(cleanServiceId);
          showAlert(t("stableDetails:addedToWishlist"), "success");
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error updating service wishlist:", error);
      showAlert(t("stableDetails:wishlistUpdateFailed"));
    } finally {
      setWishlistServiceLoading((prev) => ({
        ...prev,
        [cleanServiceId]: false,
      }));
    }
  };

  const toggleWishlist = async () => {
    if (!currentUserId) {
      showAlert(t("stableDetails:loginToWishlist"));
      return;
    }
    try {
      setWishlistLoading(true);
      const userQuery = `*[_type == "user" && _id == $userId][0]{wishlistStables[]->{_id}}`;
      const userData = await client.fetch(userQuery, { userId: currentUserId });
      const isStableInWishlist = userData?.wishlistStables?.some(
        (stable) => stable._id === stableId
      );

      if (isStableInWishlist) {
        const index = userData.wishlistStables.findIndex(
          (s) => s._id === stableId
        );
        if (index === -1) {
          showAlert(t("stableDetails:errors.stableNotInWishlist"));
          return;
        }
        await client
          .patch(currentUserId)
          .unset([`wishlistStables[${index}]`])
          .commit();
        setIsInWishlist(false);
        showAlert(t("stableDetails:removedFromWishlist"), "success");
      } else {
        const wishlistItem = {
          _key: uuidv4(),
          _type: "reference",
          _ref: stableId,
        };
        await client
          .patch(currentUserId)
          .setIfMissing({ wishlistStables: [] })
          .append("wishlistStables", [wishlistItem])
          .commit();
        setIsInWishlist(true);
        showAlert(t("stableDetails:addedToWishlist"), "success");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      showAlert(t("stableDetails:wishlistUpdateFailed"));
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = async (url, title) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url,
        });
        showAlert(t("stableDetails:shared_successfully"), "success");
      } else {
        await navigator.clipboard.writeText(url);
        showAlert(t("stableDetails:link_copied"), "success");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        showAlert(t("stableDetails:share_failed"), "error");
      }
    }
  };

  const handleNextImage = () => {
    if (images.length > 0) {
      setSelectedImageIndex((prev) =>
        prev < images.length - 1 ? prev + 1 : prev
      );
    }
  };

  const handlePrevImage = () => {
    if (images.length > 0) {
      setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
  };

  const images = stable?.images
    ? stable.images.map((image) => {
        if (image._upload) {
          return image._upload.previewImage;
        }
        return urlFor(image).url();
      })
    : [];

  if (loading)
    return (
      <Layout>
        <Preloader />
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t("stableDetails:error_occurred")}
          </h1>
          <p className="text-gray-600">{error.message}</p>
          <Link
            href="/stables"
            className="mt-6 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
          >
            {t("stableDetails:back_to_stables")}
          </Link>
        </div>
      </Layout>
    );

  if (!stable)
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t("stableDetails:stable_not_found")}
          </h1>
          <p className="text-gray-600">
            {t("stableDetails:stable_not_found_message")}
          </p>
          <Link
            href="/stables"
            className="mt-6 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
          >
            {t("stableDetails:browse_stables")}
          </Link>
        </div>
      </Layout>
    );

  const StableDetailsContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white p-6 rounded-xl shadow-md"
    >
      <h3 className="text-xl font-bold mb-4">
        {t("stableDetails:stableDetails")}
      </h3>
      <div className="space-y-4">
        {stable.kindOfStable?.length > 0 && (
          <div className="flex items-start">
            <div className="mt-1 mr-3 text-primary">
              <Award size={20} />
            </div>
            <div>
              <p className="font-medium">{t("stableDetails:stableType")}</p>
              <p className="text-gray-600">
                {stable.kindOfStable
                  .map((type) => t(`stableDetails:stableTypes.${type}`))
                  .join(", ")}
              </p>
            </div>
          </div>
        )}
        {stable.dateOfEstablishment && (
          <div className="flex items-start">
            <div className="mt-1 mr-3 text-primary">
              <Calendar size={20} />
            </div>
            <div>
              <p className="font-medium">
                {t("stableDetails:dateOfEstablishment")}
              </p>
              <p className="text-gray-600">
                {new Date(stable.dateOfEstablishment).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
        {stable.boardingCapacity && (
          <div className="flex items-start">
            <div className="mt-1 mr-3 text-primary">
              <Users size={20} />
            </div>
            <div>
              <p className="font-medium">
                {t("stableDetails:boardingCapacity")}
              </p>
              <p className="text-gray-600">
                {stable.boardingCapacity} {t("stableDetails:horses")}
              </p>
            </div>
          </div>
        )}
        {stable.stableDescription && (
          <div className="flex items-start">
            <div className="mt-1 mr-3 text-primary">
              <Shield size={20} />
            </div>
            <div>
              <p className="font-medium">
                {t("stableDetails:stableDescription")}
              </p>
              <p className="text-gray-600">{stable.stableDescription}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  const AdditionalServices = () => {
    const allServices = [
      ...(stable.fullTimeServices || []),
      ...(stable.freelancerServices || []),
    ];
    if (!allServices.length) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 mb-24"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <span className="mr-2">{t("stableDetails:additionalServices")}</span>
          <div className="h-1 flex-grow bg-gray-200 rounded ml-4"></div>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {allServices.map((service) => (
            <div
              key={service._id}
              className="group relative bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col transition-transform duration-300 hover:shadow-2xl hover:-translate-y-2 hover:bg-white"
              style={{ minHeight: 420 }}
            >
              {/* Image Section */}
              <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden">
                <Link
                  href={`/services/${service._id}`}
                  className="block w-full h-full"
                >
                  <Image
                    src={
                      service.images && service.images.length > 0
                        ? urlFor(service.images[0]).url()
                        : "/placeholder.jpg"
                    }
                    alt={isRTL ? service.name_ar : service.name_en}
                    fill
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Gradient overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                  {/* Service type badge - only on hover except mobile */}
                  {service.serviceType && (
                    <span
                      className="absolute top-4 left-4 z-10 bg-primary/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md
                        opacity-0 group-hover:opacity-100 sm:opacity-100 sm:group-hover:opacity-100 transition-opacity duration-200"
                    >
                      {t(`stableDetails:serviceTypes.${service.serviceType}`)}
                    </span>
                  )}
                  {/* Wishlist button - only on hover except mobile */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleServiceWishlist(service._id);
                    }}
                    disabled={
                      wishlistServiceLoading[
                        service._id?.replace("drafts.", "")
                      ]
                    }
                    className={`absolute top-4 right-4 z-10 p-2 rounded-full shadow bg-white/90 text-gray-700 border border-gray-200 transition-all duration-300
                        opacity-0 group-hover:opacity-100 sm:opacity-100 sm:group-hover:opacity-100
                        ${
                          wishlistedServices.has(
                            service._id?.replace("drafts.", "")
                          )
                            ? "bg-red-500 text-white hover:bg-red-600 border-red-400"
                            : "hover:text-red-500"
                        }`}
                    aria-label={
                      wishlistedServices.has(
                        service._id?.replace("drafts.", "")
                      )
                        ? t("stableDetails:remove_from_wishlist")
                        : t("stableDetails:add_to_wishlist")
                    }
                    style={{ pointerEvents: "auto" }}
                  >
                    {wishlistServiceLoading[
                      service._id?.replace("drafts.", "")
                    ] ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Heart
                        size={20}
                        className={
                          wishlistedServices.has(
                            service._id?.replace("drafts.", "")
                          )
                            ? "fill-current"
                            : ""
                        }
                      />
                    )}
                  </button>
                </Link>
              </div>

              {/* Info Section */}
              <div className="flex flex-col flex-1 p-6 gap-2 relative">
                <div className="flex items-center justify-between">
                  <Link href={`/services/${service._id}`}>
                    <h3
                      className="text-xl font-bold group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-1"
                      title={isRTL ? service.name_ar : service.name_en}
                    >
                      {isRTL ? service.name_ar : service.name_en}
                    </h3>
                  </Link>
                  {/* Share button below title */}
                  <div className="flex items-center mb-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleShare(
                          `${window.location.origin}/services/${service._id}`,
                          isRTL ? service.name_ar : service.name_en
                        );
                      }}
                      className="p-2 rounded-full shadow bg-white/90 text-gray-700 hover:text-primary transition-colors duration-300 border border-gray-200 mr-2"
                      aria-label={t("stableDetails:share")}
                    >
                      <Share2 size={18} />
                    </button>
                    <span className="text-xs text-gray-400">
                      {t("stableDetails:share")}
                    </span>
                  </div>
                </div>

                {/* Rating and experience row */}
                <div className="flex flex-col items-start gap-2 text-sm text-gray-600 mb-2">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      {service.serviceAverageRating?.toFixed(1) || "N/A"}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({service.serviceRatingCount || 0}{" "}
                      {t("stableDetails:reviews", {
                        count: service.serviceRatingCount || 0,
                      })}
                      )
                    </span>
                  </div>
                  {service.years_of_experience && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Award className="w-4 h-4 text-gray-400" />
                      {service.years_of_experience}{" "}
                      {t("stableDetails:yearsExperience")}
                    </span>
                  )}
                </div>
                {/* Divider */}
                <div className="border-t border-gray-100 my-2" />
                {/* Price row */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-primary font-bold text-lg">
                    {service.price} {t("stableDetails:currency")}
                    {service.priceUnit && (
                      <span className="text-xs text-gray-500 font-normal">
                        {" / "}
                        {t(
                          `stableDetails:priceUnits.${service.priceUnit}`,
                          service.priceUnit
                        )}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex-1" />
                <Link
                  href={`/services/${service._id}`}
                  className="mt-4 w-full px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all duration-300 text-base shadow-lg text-center"
                >
                  {t("stableDetails:bookService")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
        <Alert
          message={alert.message}
          isVisible={alert.isVisible}
          onClose={() =>
            setAlert({ isVisible: false, message: "", type: "error" })
          }
          type={alert.type}
        />

        {/* Hero Section */}
        <div className="relative h-96 md:h-[500px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70"></div>
          <Image
            src={images[0] || "/placeholder.jpg"}
            alt={
              (isRTL ? stable.name_ar : stable.name_en)
                ? `${isRTL ? stable.name_ar : stable.name_en} - Hero Image`
                : "Stable hero image"
            }
            className="w-full h-full object-cover"
            width={0}
            height={0}
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-end">
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 shadow-text"
                  >
                    {isRTL ? stable.name_ar : stable.name_en}
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap items-center gap-4 text-white/90"
                  >
                    <span className="flex items-center">
                      <MapPin size={18} className="mr-1" />
                      {isRTL ? stable.city?.name_ar : stable.city?.name_en}
                    </span>
                    <span className="flex items-center">
                      <Star size={18} className="mr-1 text-yellow-400" />
                      {stable.serviceAverageRating || 4.8}{" "}
                      <span className="text-sm ml-1">
                        (
                        {t("stableDetails:reviews", {
                          count: stable.serviceRatingCount || 256,
                        })}
                        )
                      </span>
                    </span>
                    <span className="py-1 px-3 bg-primary/80 rounded-full text-sm font-medium">
                      {t("stableDetails:horseStable")}
                    </span>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3"
                >
                  <button
                    onClick={toggleWishlist}
                    className="bg-[#ffffff6e] bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={wishlistLoading}
                    aria-label={
                      isInWishlist
                        ? t("stableDetails:remove_from_wishlist")
                        : t("stableDetails:add_to_wishlist")
                    }
                  >
                    {wishlistLoading ? (
                      <div className="w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin" />
                    ) : (
                      <Heart
                        size={24}
                        className={
                          isInWishlist
                            ? "text-red-500 fill-red-500"
                            : "text-white"
                        }
                      />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      handleShare(
                        window.location.href,
                        isRTL ? stable.name_ar : stable.name_en
                      )
                    }
                    className="bg-[#ffffff6e] bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all duration-300 transform hover:scale-110"
                    aria-label={t("stableDetails:share")}
                  >
                    <Share2 size={24} className="text-white" />
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 flex justify-center gap-4 shadow-md overflow-x-auto"
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="relative w-20 h-20 rounded-md overflow-hidden cursor-pointer flex-shrink-0 hover:opacity-80 transition-opacity"
              onClick={() => setSelectedImageIndex(index)}
            >
              <Image
                src={image}
                alt={
                  stable?.name_en
                    ? `${stable.name_en} - Image ${index + 1}`
                    : `Stable image ${index + 1}`
                }
                fill
                className="object-cover w-full h-full"
                sizes="80px"
                style={{ minWidth: 80, minHeight: 80 }}
                loading="lazy"
              />
            </div>
          ))}
        </motion.div>

        {/* Image Gallery Modal */}
        <AnimatePresence>
          {selectedImageIndex !== null && (
            <ImageGalleryModal
              selectedIndex={selectedImageIndex}
              images={images}
              onClose={() => setSelectedImageIndex(null)}
              onNext={handleNextImage}
              onPrev={handlePrevImage}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden mb-6"
              >
                <div className="border-b border-gray-200">
                  <div className="flex">
                    {["overview", "details", "pricing"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-4 font-medium transition-colors duration-300 ${
                          activeTab === tab
                            ? "text-primary border-b-2 border-primary"
                            : "text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        {t(`stableDetails:${tab}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold mb-4">
                        {t("stableDetails:aboutStable")}
                      </h2>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {isRTL ? stable.about_ar : stable.about_en}
                      </p>
                      {stable.past_experience_en && (
                        <div className="mb-6">
                          <h3 className="text-xl font-semibold mb-2">
                            {t("stableDetails:pastExperience")}
                          </h3>
                          <p className="text-gray-600">
                            {isRTL
                              ? stable.past_experience_ar
                              : stable.past_experience_en}
                          </p>
                        </div>
                      )}
                      <StableDetailsContent />
                    </motion.div>
                  )}

                  {activeTab === "details" && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold mb-4">
                        {t("stableDetails:stableDetails")}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-5 rounded-lg hover:shadow-md transition-shadow">
                          <h3 className="font-semibold mb-3 flex items-center">
                            <Phone className="mr-2 text-primary" size={20} />
                            {t("stableDetails:contactInfo")}
                          </h3>
                          <div className="ml-7 space-y-3">
                            {stable.servicePhone && (
                              <div className="flex items-center">
                                <Phone
                                  className="mr-2 text-gray-500"
                                  size={16}
                                />
                                <a
                                  href={`tel:${stable.servicePhone}`}
                                  className="hover:underline text-primary"
                                >
                                  {stable.servicePhone}
                                </a>
                              </div>
                            )}
                            {stable.serviceEmail && (
                              <div className="flex items-center">
                                <Mail
                                  className="mr-2 text-gray-500"
                                  size={16}
                                />
                                <a
                                  href={`mailto:${stable.serviceEmail}`}
                                  className="hover:underline text-primary"
                                >
                                  {stable.serviceEmail}
                                </a>
                              </div>
                            )}
                            {stable.links?.length > 0 && (
                              <div className="flex items-center gap-4">
                                <Link2
                                  className="mr-2 text-gray-500"
                                  size={16}
                                />
                                {stable.links.map((link, index) => (
                                  <SocialMediaIcon
                                    key={index}
                                    linkType={link.linkType}
                                    url={link.url}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {stable.address_details && (
                          <div className="bg-gray-50 p-5 rounded-lg hover:shadow-md transition-shadow">
                            <h3 className="font-semibold mb-3 flex items-center">
                              <MapPin className="mr-2 text-primary" size={20} />
                              {t("stableDetails:addressDetails")}
                            </h3>
                            <div className="ml-7 text-gray-700">
                              <p className="text-gray-600">
                                {stable.address_details}
                              </p>
                              {stable.address_link && (
                                <a
                                  href={stable.address_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {t("stableDetails:viewOnMap")}
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                        {stable.horses?.length > 0 && (
                          <div className="bg-gray-50 p-5 rounded-lg hover:shadow-md transition-shadow">
                            <h3 className="font-semibold mb-3 flex items-center">
                              <Users className="mr-2 text-primary" size={20} />
                              {t("stableDetails:horses")}
                            </h3>
                            <div className="ml-7 text-gray-700">
                              <ul className="list-disc pl-5">
                                {stable.horses.map((horse, index) => (
                                  <li key={index} className="text-gray-600">
                                    {isRTL ? horse.name_ar : horse.name_en}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "pricing" && (
                    <motion.div
                      key="pricing"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold mb-4">
                        {t("stableDetails:pricingPackages")}
                      </h2>
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-5 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">
                              {t("stableDetails:boardingPackage")}
                            </h3>
                            <span className="text-xl font-bold text-primary">
                              {stable.boardingDetails?.boardingPrice || "-"}{" "}
                              {t("stableDetails:currency")}{" "}
                              {stable.boardingDetails?.boardingPriceUnit
                                ? `(${t(`stableDetails:priceUnits.${stable.boardingDetails.boardingPriceUnit}`)})`
                                : ""}
                            </span>
                          </div>
                          {stable.boardingDetails?.additionalServices?.length >
                            0 && (
                            <div className="mt-4">
                              <h4 className="font-medium text-primary mb-2">
                                {t("stableDetails:additionalServices")}
                              </h4>
                              <ul className="list-disc pl-5">
                                {stable.boardingDetails.additionalServices.map(
                                  (service, index) => (
                                    <li key={index} className="text-gray-600">
                                      {isRTL
                                        ? service.name_ar
                                        : service.name_en}{" "}
                                      - {service.price}{" "}
                                      {t("stableDetails:currency")}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                          <button
                            onClick={() => setIsReservationModalOpen(true)}
                            className="w-full mt-4 bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                          >
                            {t("stableDetails:bookNow")}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <AdditionalServices />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-md p-6 sticky top-6"
              >
                <h3 className="font-bold text-lg mb-4">
                  {t("stableDetails:quickFacts")}
                </h3>
                <div className="space-y-4">
                  {stable.years_of_experience && (
                    <div className="flex items-center">
                      <Award className="mr-3 text-primary" size={20} />
                      <span className="text-gray-700">
                        {t("stableDetails:experience")}:{" "}
                        {stable.years_of_experience} {t("stableDetails:years")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Users className="mr-3 text-primary" size={20} />
                    <span className="text-gray-700">
                      {t("stableDetails:boardingCapacity")}:{" "}
                      {stable.boardingCapacity} {t("stableDetails:horses")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="mr-3 text-primary" size={20} />
                    <span className="text-gray-700">
                      {t("stableDetails:certified")}:{" "}
                      {stable.licensesAndCertificates?.length > 0
                        ? t("stableDetails:yes")
                        : t("stableDetails:no")}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-md p-6 sticky top-56"
              >
                <h3 className="font-bold text-lg mb-4">
                  {t("stableDetails:contactStable")}
                </h3>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 mr-3 overflow-hidden">
                    <Image
                      src={
                        stable.userRef?.image
                          ? urlFor(stable.userRef.image).url()
                          : "/placeholder.svg"
                      }
                      alt={
                        stable.userRef?.userName
                          ? `${stable.userRef?.userName} - User Profile`
                          : "Stable user profile image"
                      }
                      width={48}
                      height={48}
                      className="object-cover w-12 h-12"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{stable.userRef?.userName}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Star size={14} className="mr-1 text-yellow-400" />{" "}
                      {stable.serviceAverageRating || 5.0} (
                      {t("stableDetails:ratedBy")}{" "}
                      {stable.serviceRatingCount || 128}{" "}
                      {t("stableDetails:users")})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReservationModalOpen(true)}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg mb-3 transition-all duration-300 transform hover:scale-105"
                >
                  {t("stableDetails:bookNow")}
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                  {t("stableDetails:contactStable")}
                </button>
              </motion.div>
            </div>
          </div>

          {/* Reservation Modal */}
          <ReservationPopup
            isOpen={isReservationModalOpen}
            onClose={() => setIsPopupOpen(false)}
            stableId={stableId}
            stableName={isRTL ? stable?.name_ar : stable?.name_en}
            userRef={currentUserId}
          />
        </div>
      </div>
    </Layout>
  );
}
