"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Heart,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { client, urlFor } from "@/lib/sanity";
import PropTypes from "prop-types";
import Preloader from "components/elements/Preloader";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const FavoritesPage = ({ userId }) => {
  const router = useRouter();
  const { t, i18n } = useTranslation("profile");
  const isRTL = i18n.dir() === "rtl";
  const [favorites, setFavorites] = useState([]);
  const [filter, setFilter] = useState("all"); // Default to "all"
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [cartLoading, setCartLoading] = useState({});
  const [selectedColors, setSelectedColors] = useState({});
  const [currentImages, setCurrentImages] = useState({}); // Track current image index per item

  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      console.error(t("noUserId"));
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const query = `*[_type == "user" && _id == $userId]{
        wishlistProducts[]->{
          _id, name_en, name_ar, price, originalPrice, images, colors, "isSale": defined(originalPrice), "type": "product"
        },
        wishlistBooks[]->{
          _id, title, price, images, averageRating, "type": "book"
        },
        wishlistCourses[]->{
          _id, title, price, images, averageRating, "type": "course"
        },
        wishlistHorses[]->{
          _id, fullName, marketValue, images, averageRating, "type": "horse"
        },
        wishlistServices[]->{
          _id, name_en, name_ar, price, images, serviceAverageRating, "type": "service"
        }
      }`;
      const result = await client.fetch(query, { userId });
      console.log("Sanity query result:", result);

      const user =
        result.length > 0
          ? result[0]
          : {
              wishlistProducts: [],
              wishlistBooks: [],
              wishlistCourses: [],
              wishlistHorses: [],
              wishlistServices: [],
            };
      const favoriteItems = {
        products: user.wishlistProducts || [],
        books: user.wishlistBooks || [],
        courses: user.wishlistCourses || [],
        horses: user.wishlistHorses || [],
        services: user.wishlistServices || [],
        all: [
          ...(user.wishlistProducts || []),
          ...(user.wishlistBooks || []),
          ...(user.wishlistCourses || []),
          ...(user.wishlistHorses || []),
          ...(user.wishlistServices || []),
        ],
      };

      // Initialize selected colors for products
      if (favoriteItems.products.length > 0) {
        const initialColors = favoriteItems.products.reduce((acc, product) => {
          if (product.colors?.length > 0) {
            acc[product._id] = product.colors[0].id || product.colors[0];
          }
          return acc;
        }, {});
        setSelectedColors(initialColors);
      }

      // Initialize current image index
      const initialImages = favoriteItems.all.reduce((acc, item) => {
        acc[item._id] = 0; // Start at first image
        return acc;
      }, {});
      setCurrentImages(initialImages);

      setFavorites(favoriteItems[filter]);
      console.log(
        "Favorites array:",
        favoriteItems[filter].map((item) => ({
          _id: item._id,
          type: item.type,
          name_en: item.name_en,
          name_ar: item.name_ar,
          title: item.title,
          fullName: item.fullName,
        }))
      );
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [filter, userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleWishlistToggle = async (itemId, itemType) => {
    if (!itemId || !userId) return;

    setWishlistLoading((prev) => ({ ...prev, [itemId]: true }));
    try {
      const wishlistField = `wishlist${itemType.charAt(0).toUpperCase() + itemType.slice(1)}s`; // Plural for Sanity field
      const currentWishlist = favorites.map((item) => item._id);
      const isWishlisted = currentWishlist.includes(itemId);

      if (isWishlisted) {
        await client
          .patch(userId)
          .unset([`${wishlistField}[_ref == "${itemId}"]`])
          .commit();
      } else {
        await client
          .patch(userId)
          .append(wishlistField, [
            { _type: "reference", _ref: itemId, _key: uuidv4() },
          ])
          .commit();
      }

      await fetchFavorites();
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleAddToCart = async (item) => {
    if (!item?._id) return;

    setCartLoading((prev) => ({ ...prev, [item._id]: true }));
    try {
      console.log(
        `Adding ${item.name_en || item.name_ar || item.title || item.fullName} to cart`
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setCartLoading((prev) => ({ ...prev, [item._id]: false }));
    }
  };

  const handleColorChange = (productId, colorId) => {
    setSelectedColors((prev) => ({
      ...prev,
      [productId]: colorId,
    }));
  };

  const handleImageChange = (itemId, direction) => {
    setCurrentImages((prev) => {
      const item = favorites.find((i) => i._id === itemId);
      const imageCount = item?.images?.length || 1;
      const currentIndex = prev[itemId] || 0;
      let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
      if (newIndex >= imageCount) newIndex = 0;
      if (newIndex < 0) newIndex = imageCount - 1;
      return { ...prev, [itemId]: newIndex };
    });
  };

  const renderItemCard = (item) => {
    const itemType = item.type; // From Sanity query
    const isArabic = i18n.language === "ar";
    const title =
      itemType === "product"
        ? (isArabic ? item.name_ar || item.name_en : item.name_en || item.name_ar)
        : item.title || item.fullName || (isArabic ? item.name_ar || item.name_en : item.name_en || item.name_ar);
    const price = item.price || item.marketValue || t("priceNotAvailable");
    const isSale = item.isSale || false;
    const originalPrice = item.originalPrice;
    const currentImageIndex = currentImages[item._id] || 0;
    const image = item.images?.[currentImageIndex]
      ? urlFor(item.images[currentImageIndex]).url()
      : "/placeholder.svg";

    const badgeStyles = {
      product: { backgroundColor: "#EFF6FF", color: "#2563EB" },
      book: { backgroundColor: "#F0FDF4", color: "#16A34A" },
      course: { backgroundColor: "#FAF5FF", color: "#9333EA" },
      horse: { backgroundColor: "#FEFCE8", color: "#CA8A04" },
      service: { backgroundColor: "#FEF2F2", color: "#EF4444" },
    };

    return (
      <div
        key={`${item._id}-${item.type}`}
        className="h-full flex flex-col"
        style={{ minHeight: "400px" }}
      >
        {/* Card container with fixed height */}
        <div className="group relative bg-gray-100 rounded-xl overflow-hidden flex-1 flex flex-col">
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
            <span
              className="badge text-xs px-2 py-1 rounded"
              style={badgeStyles[itemType]}
            >
              {t(itemType + "s")}
            </span>
            {isSale && (
              <span
                className="badge text-xs px-2 py-1 rounded"
                style={{ backgroundColor: "#FEF2F2", color: "#EF4444" }}
              >
                {t("sale")}
              </span>
            )}
          </div>

          {/* Heart button */}
          <button
            className="btn absolute top-3 right-3 p-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-gray-100"
            onClick={() => handleWishlistToggle(item._id, itemType)}
            disabled={wishlistLoading[item._id]}
            aria-label={t("toggleWishlist")}
          >
            <Heart
              className={`h-4 w-4 ${wishlistLoading[item._id] ? "text-gray-400" : "text-red-500"}`}
              fill={wishlistLoading[item._id] ? "none" : "currentColor"}
            />
          </button>

          {/* Image container with fixed dimensions */}
          <div
            className="relative cursor-pointer flex-1 flex items-center justify-center p-3"
            onClick={() => router.push(`/[locale]/${itemType}s/${item._id}`)}
            style={{ minHeight: "250px", maxHeight: "250px" }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                className="object-contain rounded-xl max-w-full max-h-full"
                src={image}
                width={200}
                height={200}
                alt={title || t("imageAlt")}
                style={{ objectFit: "contain" }}
              />
            </div>

            {/* Navigation arrows */}
            {item.images?.length > 1 && (
              <>
                <button
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-2" : "left-2"} p-1 bg-white hover:bg-gray-100 rounded-full transition-opacity opacity-0 group-hover:opacity-100`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageChange(item._id, "prev");
                  }}
                  aria-label={t("previousImage")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "left-2" : "right-2"} p-1 bg-white hover:bg-gray-100 rounded-full transition-opacity opacity-0 group-hover:opacity-100`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageChange(item._id, "next");
                  }}
                  aria-label={t("nextImage")}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content section with fixed structure */}
        <div
          className="p-3 bg-white rounded-b-xl flex flex-col"
          style={{ minHeight: "120px" }}
        >
          <div className="flex mb-2 flex-1">
            <h3 className="text-sm font-medium mb-0 flex-1 pr-2">
              <a
                href={`/[locale]/${itemType}s/${item._id}`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/[locale]/${itemType}s/${item._id}`);
                }}
                className="hover:text-blue-600 line-clamp-2"
                title={title}
              >
                {title}
              </a>
            </h3>
            {itemType === "product" && item.colors?.length > 0 && (
              <div className="flex items-start">
                {item.colors.map((color, index) => (
                  <div
                    key={`${item._id}-${color.id || index}`}
                    className="ml-1"
                  >
                    <input
                      className="btn-check hidden"
                      type="radio"
                      name={`color-${item._id}`}
                      id={`${item._id}-${color.id || index}`}
                      checked={selectedColors[item._id] === (color.id || index)}
                      onChange={() =>
                        handleColorChange(item._id, color.id || index)
                      }
                    />
                    <label
                      className="flex items-center justify-center w-5 h-5 border border-gray-300 rounded-full cursor-pointer hover:border-gray-400"
                      htmlFor={`${item._id}-${color.id || index}`}
                    >
                      <span
                        className="block w-2.5 h-2.5 rounded-full bg-cover bg-center"
                        style={{
                          backgroundColor: color.color,
                          backgroundImage: color.pattern
                            ? `linear-gradient(45deg, ${color.color}, #e0e0e0)`
                            : "none",
                        }}
                      ></span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2 font-medium">{price}SAR</span>
              {isSale && originalPrice && (
                <del className="text-sm text-gray-400">{originalPrice}SAR</del>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-5 mt-4 lg:mt-5 mb-lg-4 my-xl-5">
      <div className="flex flex-wrap pt-2 lg:pt-0">
        <div className="w-full lg:w-9/12 pt-4 pb-2 sm:pb-4">
          <div className="flex items-center mb-4 justify-between">
            <h1 className="text-2xl font-medium mb-0">
              {t("favoritesTitle")} {" "}
              <span className="text-sm font-normal text-gray-500">
                ({favorites.length} {t("items")})
              </span>
            </h1>
            <div className="flex gap-2">
              <select
                className="ml-4 px-2 py-1 border rounded-xl"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">{t("all")}</option>
                <option value="products">{t("products")}</option>
                <option value="books">{t("books")}</option>
                <option value="courses">{t("courses")}</option>
                <option value="horses">{t("horses")}</option>
                <option value="services">{t("services")}</option>
              </select>
              <button
                className="ml-auto flex items-center text-red-500 border border-red-500 hover:bg-red-50 px-3 py-1 rounded-xl text-sm"
                type="button"
                onClick={async () => {
                  try {
                    if (!userId) throw new Error(t("noUserId"));
                    const wishlistFields = [
                      "wishlistProducts",
                      "wishlistBooks",
                      "wishlistCourses",
                      "wishlistHorses",
                      "wishlistServices",
                    ];
                    for (const field of wishlistFields) {
                      await client
                        .patch(userId)
                        .unset([`${field}[]`])
                        .commit();
                    }
                    await fetchFavorites();
                  } catch (error) {
                    console.error("Error clearing wishlist:", error);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("clearAll")}
              </button>
            </div>
          </div>

          {loading ? (
            <Preloader />
          ) : favorites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-4 bg-gray-100 rounded-xl shadow-sm"
            >
              <h3 className="text-2xl font-bold text-gray-900">
                {t("noFavoritesFound", { filter: t(filter) })}
              </h3>
              <p className="text-gray-500">
                {t("addToWishlist", { filter: t(filter) })}
              </p>
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border-0 py-1 p-2 md:p-3">
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {favorites.map((item) => renderItemCard(item))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

FavoritesPage.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default FavoritesPage;
