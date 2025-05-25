"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import PropTypes from "prop-types";
import {
  Heart,
  Share2,
  ShoppingCart,
  Star,
  StarHalf,
  Truck,
  Shield,
  RotateCcw,
  Award,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Eye,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { client } from "../../../../../lib/sanity";
import { toast } from "sonner";
import Layout from "components/layout/Layout";
import ProductsList from "../../../../../../components/product/ProductsList";
import RentalDatePopup from "../../../../../../components/product/RentalDatePopup";
import { v4 as uuidv4 } from "uuid"; // Import uuid for generating unique keys

// Category and rental unit mappings
const categoryNames = {
  feed_nutrition: "Feed and Nutrition",
  tack_equipment: "Tack and Equipment",
  apparel_accessories: "Apparel and Accessories",
  health_wellness: "Health and Wellness",
  barn_stable: "Barn and Stable Supplies",
  riding_competition: "Riding and Competition",
  other: "Other",
};

const rentalUnitNames = {
  hour: "Hour",
  day: "Day",
  week: "Week",
  month: "Month",
  year: "Year",
};

// Default supplier ID (replace with a valid ID from your Sanity dataset)
const DEFAULT_SUPPLIER_ID = "your-default-supplier-id"; // TODO: Replace with actual supplier ID

// ProductCard Component
const ProductCard = React.memo(({ product, index }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false); // Added for wishlist loading
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const router = useRouter();

  // Verify user authentication and check wishlist status
  useEffect(() => {
    const verifyAuthAndWishlist = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          if (response.status === 401) {
            setCurrentUserId(null);
            return;
          }
          throw new Error(`Verify API failed with status: ${response.status}`);
        }
        const data = await response.json();
        if (data.authenticated) {
          const userId = data.userId || data.user?.id || data.user?.userId;
          setCurrentUserId(userId);

          // Fetch user's wishlist to check if the product is already wishlisted
          if (userId && product?.id) {
            const query = `*[_type == "user" && _id == $userId][0]{wishlistProducts}`;
            const params = { userId };
            const userData = await client.fetch(query, params);
            const isProductWishlisted = userData?.wishlistProducts?.some(
              (item) => item._ref === product.id
            );
            setIsWishlisted(isProductWishlisted || false);
          }
        } else {
          setCurrentUserId(null);
        }
      } catch (error) {
        console.error("Auth or wishlist verification failed:", error.message);
        setCurrentUserId(null);
      }
    };

    verifyAuthAndWishlist();
  }, [product?.id]);

  const getProductImage = useCallback(() => {
    return product.images?.length > 0
      ? product.images[0]
      : "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center";
  }, [product.images]);

  const renderStars = useCallback((rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-[#d4af37] text-[#d4af37]" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="w-4 h-4 fill-[#d4af37] text-[#d4af37]"
        />
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    return stars;
  }, []);

  const handleWishlistToggle = useCallback(async () => {
    if (!currentUserId) {
      toast.error(
        <div>
          You must be logged in to manage your wishlist.{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in here
          </a>
        </div>
      );
      router.push("/login");
      return;
    }

    if (!product) return;

    setIsWishlistLoading(true);

    try {
      if (isWishlisted) {
        // Remove from wishlist
        const query = `*[_type == "user" && _id == $userId][0]{wishlistProducts}`;
        const userData = await client.fetch(query, { userId: currentUserId });
        const updatedWishlist = userData.wishlistProducts.filter(
          (item) => item._ref !== product.id
        );

        await client
          .patch(currentUserId)
          .set({ wishlistProducts: updatedWishlist })
          .commit();

        setIsWishlisted(false);
        toast.success("Removed from wishlist", {
          description: "Item has been removed from your wishlist",
        });
      } else {
        // Add to wishlist
        const wishlistItem = {
          _key: uuidv4(),
          _type: "reference",
          _ref: product.id,
        };

        await client
          .patch(currentUserId)
          .setIfMissing({ wishlistProducts: [] })
          .append("wishlistProducts", [wishlistItem])
          .commit();

        setIsWishlisted(true);
        toast.success("Added to wishlist", {
          description: "Item has been added to your wishlist",
        });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist. Please try again.");
    } finally {
      setIsWishlistLoading(false);
    }
  }, [currentUserId, isWishlisted, product, router]);

  return (
    <div
      className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-[#d4af37] transform hover:-translate-y-2 ${
        isHovered ? "scale-[1.02]" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${index * 100}ms`,
        animation: "slideInUp 0.6s ease-out forwards",
      }}
    >
      <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="aspect-square relative">
          <img
            src={getProductImage()}
            alt={product.name_en}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.listingType === "rent" && (
            <span className="bg-gradient-to-r from-[#d4af37] to-yellow-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
              For Rent
            </span>
          )}
          <span className="bg-gradient-to-r from-[#d4af37] to-yellow-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
            {categoryNames[product.category]}
          </span>
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <button
            onClick={handleWishlistToggle}
            className={`p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
              isWishlisted
                ? "bg-red-50 text-red-500 border-red-500 hover:bg-red-100 hover:text-red-600"
                : "bg-white/90 text-gray-700 border-gray-300 hover:bg-red-50 hover:text-red-500 hover:border-red-500"
            } ${isWishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            title="Add to Wishlist"
            disabled={isWishlistLoading}
          >
            {isWishlistLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart
                className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
              />
            )}
          </button>
          <button
            className="p-2.5 bg-white/90 text-gray-700 rounded-full shadow-lg backdrop-blur-sm hover:bg-white hover:text-[#d4af37] transition-all duration-300 hover:scale-110"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full bg-gradient-to-r from-[#d4af37] to-yellow-600 text-white py-3 font-semibold hover:from-yellow-600 hover:to-[#d4af37] transition-all duration-300 flex items-center justify-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            {product.listingType === "rent"
              ? "Add to Rental Cart"
              : "Add to Cart"}
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-[#d4af37] transition-colors duration-300">
            {product.name_en}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {renderStars(product.averageRating)}
            </div>
            <span className="text-sm text-gray-500">
              ({product.ratings?.length || 0} reviews)
            </span>
          </div>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3 bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
          {product.description_en ||
            "Premium quality product crafted with attention to detail."}
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl font-bold text-red-600">
              {product.price} SAR
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  {product.originalPrice} SAR
                </span>
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-semibold">
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  )}
                  % OFF
                </span>
              </>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {product.originalPrice && product.originalPrice > product.price
              ? `Save ${product.originalPrice - product.price} SAR • `
              : ""}
            Free shipping on orders over 50 SAR
            {product.listingType === "rent" && product.rentalDurationUnit && (
              <> • Price per {rentalUnitNames[product.rentalDurationUnit]}</>
            )}
          </p>
          {product.supplier?.name && (
            <p className="text-sm text-gray-600 mt-2">
              Contact supplier:{" "}
              <a
                href={`tel:${product.supplier.phone}`}
                className="text-[#d4af37] hover:underline"
              >
                {product.supplier.userName}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name_en: PropTypes.string.isRequired,
    description_en: PropTypes.string,
    price: PropTypes.number.isRequired,
    originalPrice: PropTypes.number,
    listingType: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    averageRating: PropTypes.number,
    ratings: PropTypes.array,
    images: PropTypes.arrayOf(PropTypes.string),
    supplier: PropTypes.shape({
      name: PropTypes.string,
      phone: PropTypes.string,
    }),
  }).isRequired,
  index: PropTypes.number.isRequired,
};

ProductCard.displayName = "ProductCard";

// CombinedProductPage Component
const CombinedProductPage = () => {
  const { productId } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false); // For wishlist actions
  const [isLoading, setIsLoading] = useState(false); // For cart actions
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const productsPerSlide = 4;
  const totalSlides = Math.ceil(relatedProducts.length / productsPerSlide);

  // Verify user authentication and check wishlist status
  useEffect(() => {
    const verifyAuthAndWishlist = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          if (response.status === 401) {
            setCurrentUserId(null);
            return;
          }
          throw new Error(`Verify API failed with status: ${response.status}`);
        }
        const data = await response.json();
        if (data.authenticated) {
          const userId = data.userId || data.user?.id || data.user?.userId;
          setCurrentUserId(userId);

          // Fetch user's wishlist to check if the product is already wishlisted
          if (userId && productId) {
            const query = `*[_type == "user" && _id == $userId][0]{wishlistProducts}`;
            const params = { userId };
            const userData = await client.fetch(query, params);
            const isProductWishlisted = userData?.wishlistProducts?.some(
              (item) => item._ref === productId
            );
            setIsWishlisted(isProductWishlisted || false);
          }
        } else {
          setCurrentUserId(null);
        }
      } catch (error) {
        console.error("Auth or wishlist verification failed:", error.message);
        setCurrentUserId(null);
      }
    };

    verifyAuthAndWishlist();
  }, [productId]);

  // Check if the product is already in the user's orders
  useEffect(() => {
    const checkOrderStatus = async () => {
      if (!currentUserId || !productId) return;

      try {
        const query = `*[_type == "orderProduct" && user._ref == $userId && product._ref == $productId && status == "pending"]`;
        const params = { userId: currentUserId, productId };
        const orders = await client.fetch(query, params);

        if (orders.length > 0) {
          setIsAdded(true);
        }
      } catch (error) {
        console.error("Error checking order status:", error);
        toast.error("Failed to check order status. Please try again.");
      }
    };

    checkOrderStatus();
  }, [currentUserId, productId]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const query = `*[_type == "product" && _id == $id][0] {
          _id,
          name_en,
          name_ar,
          description_en,
          description_ar,
          price,
          originalPrice,
          listingType,
          category,
          stock,
          averageRating,
          ratingCount,
          rentalDurationUnit,
          specifications,
          images[] {
            asset-> {
              url
            }
          },
          supplier-> {
            _id,
            userName,
            email,
            phone
          },
          ratings[] {
            user-> {
              _id,
              userName,
              image {
                asset-> {
                  url
                }
              }
            },
            value,
            message,
            date
          }
        }`;
        const data = await client.fetch(query, { id: productId });

        if (!data) {
          throw new Error("Product not found");
        }

        const formattedProduct = {
          id: data._id,
          name_en: data.name_en,
          name_ar: data.name_ar,
          description_en: data.description_en || "",
          description_ar: data.description_ar || "",
          price: data.price,
          originalPrice: data.originalPrice || null,
          listingType: data.listingType,
          category: data.category,
          images: data.images
            ? data.images.map((img) => img.asset.url).filter(Boolean)
            : [
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
              ],
          stock: data.stock || 0,
          averageRating: data.averageRating || 0,
          ratingCount: data.ratingCount || 0,
          rentalDurationUnit: data.rentalDurationUnit || null,
          supplier: data.supplier || { name: "Unknown", email: "", phone: "" },
          specifications: data.specifications || {},
          ratings: data.ratings || [],
        };

        setProduct(formattedProduct);

        // Fetch related products
        const relatedQuery = `*[_type == "product" && category == $category && _id != $id][0...4] {
          _id,
          name_en,
          description_en,
          price,
          originalPrice,
          listingType,
          category,
          averageRating,
          ratingCount,
          images[] {
            asset-> {
              url
            }
          },
          supplier-> {
            userName,
            phone
          }
        }`;
        const relatedData = await client.fetch(relatedQuery, {
          category: data.category,
          id: productId,
        });
        const formattedRelated = relatedData.map((item) => ({
          id: item._id,
          name_en: item.name_en,
          description_en: item.description_en || "",
          price: item.price,
          originalPrice: item.originalPrice || null,
          listingType: item.listingType,
          category: item.category,
          averageRating: item.averageRating || 0,
          ratingCount: item.ratingCount || 0,
          images: item.images
            ? item.images.map((img) => img.asset.url).filter(Boolean)
            : [
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
              ],
          supplier: item.supplier || { name: "Unknown", phone: "" },
        }));
        setRelatedProducts(formattedRelated);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(
          err.message === "Product not found"
            ? "Product not found"
            : "Failed to load product. Please try again later."
        );
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Auto-play for related products slider
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides, isAutoPlay]);

  // Handlers
  const handlePrevImage = useCallback(() => {
    setActiveImage((prev) =>
      prev === 0 ? (product?.images.length || 1) - 1 : prev - 1
    );
  }, [product?.images.length]);

  const handleNextImage = useCallback(() => {
    setActiveImage((prev) =>
      prev === (product?.images.length || 1) - 1 ? 0 : prev + 1
    );
  }, [product?.images.length]);

  const handleQuantityChange = useCallback(
    (delta) =>
      setQuantity((prev) =>
        Math.max(1, Math.min(product?.stock || 10, prev + delta))
      ),
    [product?.stock]
  );

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setIsAutoPlay(false);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsAutoPlay(false);
  }, [totalSlides]);

  const handleWishlistToggle = useCallback(async () => {
    if (!currentUserId) {
      toast.error(
        <div>
          You must be logged in to manage your wishlist.{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in here
          </a>
        </div>
      );
      router.push("/login");
      return;
    }

    if (!product) return;

    setIsWishlistLoading(true);

    try {
      if (isWishlisted) {
        // Remove from wishlist
        const query = `*[_type == "user" && _id == $userId][0]{wishlistProducts}`;
        const userData = await client.fetch(query, { userId: currentUserId });
        const updatedWishlist = userData.wishlistProducts.filter(
          (item) => item._ref !== product.id
        );

        await client
          .patch(currentUserId)
          .set({ wishlistProducts: updatedWishlist })
          .commit();

        setIsWishlisted(false);
        toast.success("Removed from wishlist", {
          description: "Item has been removed from your wishlist",
        });
      } else {
        // Add to wishlist
        const wishlistItem = {
          _key: uuidv4(),
          _type: "reference",
          _ref: product.id,
        };

        await client
          .patch(currentUserId)
          .setIfMissing({ wishlistProducts: [] })
          .append("wishlistProducts", [wishlistItem])
          .commit();

        setIsWishlisted(true);
        toast.success("Added to wishlist", {
          description: "Item has been added to your wishlist",
        });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist. Please try again.");
    } finally {
      setIsWishlistLoading(false);
    }
  }, [currentUserId, isWishlisted, product, router]);

  const handleCartAction = useCallback(
    async (rentalDates = null) => {
      if (!currentUserId) {
        toast.error(
          <div>
            You must be logged in to add items to your cart.{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in here
            </a>
          </div>
        );
        router.push("/login");
        return;
      }

      if (!product || product.stock <= 0) {
        toast.error("This product is out of stock.");
        return;
      }

      setIsLoading(true);

      try {
        const orderData = {
          _type: "orderProduct",
          user: { _type: "reference", _ref: currentUserId },
          product: { _type: "reference", _ref: product.id },
          supplier: {
            _type: "reference",
            _ref: product.supplier && product.supplier._id ? product.supplier._id : DEFAULT_SUPPLIER_ID,
          },
          orderDate: new Date().toISOString(),
          price: product.price,
          quantity, // Include quantity in order
          status: "pending",
          paymentStatus: "pending",
        };

        if (product.listingType === "rent" && rentalDates) {
          orderData.startDate = rentalDates.startDate;
          orderData.endDate = rentalDates.endDate;
        }

        await client.create(orderData);
        setIsAdded(true);
        toast.success(`${quantity} ${product.name_en} added to cart`, {
          description:
            product.listingType === "rent"
              ? "Item has been added to your rental cart"
              : "Item has been added to your shopping cart",
        });
      } catch (error) {
        console.error("Error creating order:", error);
        toast.error("Failed to add product to cart. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId, product, quantity, router]
  );

  const handleButtonClick = useCallback(() => {
    if (isAdded) {
      router.push("/profile?tab=orders");
    } else if (product?.listingType === "rent") {
      setIsPopupOpen(true);
    } else {
      handleCartAction();
    }
  }, [isAdded, product?.listingType, handleCartAction, router]);

  const handleRentalSubmit = useCallback(
    (rentalDates) => {
      handleCartAction(rentalDates);
    },
    [handleCartAction]
  );

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: `Product: ${product.name_en}`,
          text: `Check out this product: ${product.name_en}`,
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => toast.success("Link copied to clipboard!"))
        .catch((err) => {
          console.error("Could not copy text: ", err);
          toast.error("Failed to copy link");
        });
    }
  }, [product]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    if (!currentUserId) {
      toast.error(
        <div>
          You must be logged in to rate this product.{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in here
          </a>
        </div>
      );
      setIsSubmitting(false);
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      toast.error("Please select a rating between 1 and 5");
      setIsSubmitting(false);
      return;
    }

    const existingRating = product.ratings?.some(
      (r) => r.user?._id === currentUserId
    );
    if (existingRating) {
      toast.error("You have already rated this product");
      setIsSubmitting(false);
      return;
    }

    const ratingData = {
      _type: "rating",
      user: { _type: "reference", _ref: currentUserId },
      value: reviewRating,
      message: reviewComment || undefined,
      date: new Date().toISOString(),
    };

    try {
      await client.create(ratingData);

      await client
        .patch(productId)
        .setIfMissing({ ratings: [] })
        .append("ratings", [ratingData])
        .commit();

      const updatedProduct = await client.fetch(
        `*[_type == "product" && _id == $id][0]{
          ratings
        }`,
        { id: productId }
      );

      const totalRatings = updatedProduct.ratings?.length || 0;
      const sumRatings =
        updatedProduct.ratings?.reduce((sum, r) => sum + r.value, 0) || 0;
      const newAverageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

      await client
        .patch(productId)
        .set({
          averageRating: newAverageRating,
          ratingCount: totalRatings,
        })
        .commit();

      setProduct({
        ...product,
        ratings: updatedProduct.ratings,
        averageRating: newAverageRating,
        ratingCount: totalRatings,
      });
      setReviewRating(0);
      setReviewComment("");
      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error(`Failed to submit review: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = useCallback(
    (rating, size = "w-4 h-4", interactive = false) => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
          stars.push(
            <Star
              key={i}
              className={`${size} fill-[#d4af37] text-[#d4af37] ${
                interactive ? "cursor-pointer" : ""
              }`}
              onClick={interactive ? () => setReviewRating(i) : null}
            />
          );
        } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
          stars.push(
            <StarHalf
              key={i}
              className={`${size} fill-[#d4af37] text-[#d4af37] ${
                interactive ? "cursor-pointer" : ""
              }`}
              onClick={interactive ? () => setReviewRating(i) : null}
            />
          );
        } else {
          stars.push(
            <Star
              key={i}
              className={`${size} text-gray-300 ${
                interactive ? "cursor-pointer hover:text-[#d4af37]" : ""
              }`}
              onClick={interactive ? () => setReviewRating(i) : null}
            />
          );
        }
      }
      return <div className="flex items-center gap-1">{stars}</div>;
    },
    []
  );

  const currentProducts = useMemo(
    () =>
      relatedProducts.slice(
        currentSlide * productsPerSlide,
        (currentSlide + 1) * productsPerSlide
      ),
    [relatedProducts, currentSlide]
  );

  // Summarize product name and description
  const summarizedName =
    product?.name_en.length > 30
      ? product.name_en.slice(0, 30) + "..."
      : product?.name_en;
  const summarizedDescription =
    product?.description_en.length > 100
      ? product.description_en.slice(0, 100) + "..."
      : product?.description_en;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            {error || "Product Not Found"}
          </h3>
          <p className="text-gray-600 mb-6">
            We couldn't find the product you're looking for.
          </p>
          <a
            href="/products"
            className="bg-[#d4af37] text-white px-6 py-3 rounded-xl hover:bg-yellow-600"
          >
            Browse All Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-[#d4af37] cursor-pointer">
              Home
            </a>
            <ChevronRight className="w-4 h-4" />
            <a href="/products" className="hover:text-[#d4af37] cursor-pointer">
              Products
            </a>
            <ChevronRight className="w-4 h-4" />
            <a
              href={`/products?category=${product.category}`}
              className="hover:text-[#d4af37] cursor-pointer"
            >
              {categoryNames[product.category]}
            </a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#d4af37] font-medium">{summarizedName}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Product Images - Sticky */}
            <div className="lg:col-span-2 sticky top-[80px] self-start">
              <div className="space-y-4">
                <div className="relative group bg-gray-50 rounded-xl overflow-hidden">
                  <img
                    src={
                      product.images[activeImage] ||
                      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop"
                    }
                    alt={product.name_en}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        activeImage === index
                          ? "border-[#d4af37] ring-2 ring-yellow-200"
                          : "border-gray-200 hover:border-[#d4af37]"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name_en} view ${index + 1}`}
                        className="w-full h-full object-fill"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#d4af37]/20 text-[#d4af37] px-2 py-1 rounded-full text-xs font-semibold">
                    {product.listingType === "rent" ? "For Rent" : "For Sale"}
                  </span>
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name_en}
                </h1>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {summarizedDescription}
                </p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    {renderStars(product.averageRating, "w-5 h-5")}
                    <span className="text-gray-600 text-sm">
                      ({product.ratings.length} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#d4af37]/10 to-yellow-50 p-4 rounded-xl border border-[#d4af37]/20">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {product.price} SAR
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <>
                        <span className="text-xl text-gray-500 line-through">
                          {product.originalPrice} SAR
                        </span>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-semibold">
                          {Math.round(
                            ((product.originalPrice - product.price) /
                              product.originalPrice) *
                              100
                          )}
                          % OFF
                        </span>
                      </>
                    )}
                </div>
                <p className="text-sm text-gray-600">
                  {product.originalPrice &&
                  product.originalPrice > product.price
                    ? `Save ${product.originalPrice - product.price} SAR • `
                    : ""}
                  Free shipping on orders over 50 SAR
                  {product.listingType === "rent" &&
                    product.rentalDurationUnit && (
                      <>
                        {" "}
                        • Price per{" "}
                        {rentalUnitNames[product.rentalDurationUnit]}
                      </>
                    )}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Contact supplier:{" "}
                  <a
                    href={`tel:${product.supplier.phone}`}
                    className="text-[#d4af37] hover:underline"
                  >
                    {product.supplier.userName}
                  </a>
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-3 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-3 font-semibold min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-3 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= (product.stock || 10)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    Max {product.stock || 10} per order
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleButtonClick}
                    className="flex-1 bg-gradient-to-r from-[#d4af37] to-yellow-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-yellow-600 hover:to-[#d4af37] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    disabled={product.stock <= 0 || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-5 h-5" />
                    )}
                    {isAdded
                      ? "Product Added"
                      : product.listingType === "rent"
                      ? "Add to Rental Cart"
                      : "Add to Cart"}
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      isWishlisted
                        ? "border-red-500 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                        : "border-gray-300 text-gray-600 hover:border-red-500 hover:bg-red-50 hover:text-red-500"
                    } ${isWishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isWishlistLoading}
                  >
                    {isWishlistLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Heart
                        className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
                      />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-4 rounded-xl border-2 border-gray-300 text-gray-600 hover:border-[#d4af37] hover:bg-[#d4af37]/10 hover:text-[#d4af37] transition-all duration-200"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: <Truck className="w-5 h-5" />,
                    title: "Free Shipping",
                    desc: "On orders over 50 SAR",
                  },
                  {
                    icon: <Shield className="w-5 h-5" />,
                    title: "Warranty",
                    desc:
                      product.specifications.warranty || "Standard warranty",
                  },
                  {
                    icon: <RotateCcw className="w-5 h-5" />,
                    title: "30-Day Returns",
                    desc: "Hassle-free returns",
                  },
                  {
                    icon: <Award className="w-5 h-5" />,
                    title: "Premium Quality",
                    desc: "Certified materials",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="text-[#d4af37]">{feature.icon}</div>
                    <div>
                      <div className="font-semibold text-sm">
                        {feature.title}
                      </div>
                      <div className="text-xs text-gray-600">
                        {feature.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-3">
                  Share this product:
                </p>
                <div className="flex gap-2">
                  {[Facebook, Twitter, Instagram, MessageCircle].map(
                    (Icon, index) => (
                      <button
                        key={index}
                        className="p-2 bg-gray-100 hover:bg-[#d4af37]/20 rounded-xl transition-colors duration-200"
                      >
                        <Icon className="w-4 h-4 text-gray-600" />
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Tabs and Category Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
            {/* Shop by Category */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 lg:w-full lg:col-span-2">
              <h3 className="text-lg sm:text-xl font-semibold mb-5 sm:mb-6 text-gray-900">
                Shop by Category
              </h3>
              <div className="space-y-1">
                {Object.keys(categoryNames).map((key, index) => (
                  <div key={index} className="group">
                    <a
                      href={`/products?category=${key}`}
                      className="flex items-center justify-between rounded-lg hover:bg-[#d4af37]/10 cursor-pointer transition-colors p-2"
                    >
                      <span className="font-medium text-gray-900 text-sm sm:text-base">
                        {categoryNames[key]}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-[#d4af37]" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Tabs */}
            <div className="bg-gray-50 rounded-xl lg:col-span-3">
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  {[
                    { key: "details", label: "Product Details" },
                    { key: "specs", label: "Specifications" },
                    {
                      key: "reviews",
                      label: `Reviews (${product.ratings.length})`,
                    },
                    { key: "shipping", label: "Shipping & Returns" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base whitespace-nowrap transition-all duration-200 ${
                        activeTab === tab.key
                          ? "border-b-2 border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10"
                          : "text-gray-600 hover:text-[#d4af37] hover:bg-[#d4af37]/10"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8">
                {activeTab === "details" && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
                      {product.description_en}
                    </p>
                  </div>
                )}

                {activeTab === "specs" && (
                  <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">
                        Product Specifications
                      </h3>
                      <div className="space-y-4">
                        {product.specifications &&
                          Object.entries(product.specifications).map(
                            ([key, value], index) => (
                              <div
                                key={index}
                                className="flex justify-between py-3 border-b border-gray-100"
                              >
                                <span className="font-medium text-gray-600">
                                  {key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                </span>
                                <span className="text-gray-900">{value}</span>
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6 lg:space-y-8">
                    <div className="flex flex-row md:flex-row gap-6 lg:gap-8">
                      <div className="md:w-1/3">
                        <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                          <div className="text-center">
                            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                              {product.averageRating.toFixed(1)}
                            </div>
                            <div className="flex justify-center mb-2">
                              {renderStars(
                                product.averageRating,
                                "w-5 h-5 sm:w-6 sm:h-6"
                              )}
                            </div>
                            <div className="text-gray-600 text-sm sm:text-base">
                              Based on {product.ratings.length} reviews
                            </div>
                          </div>
                          <div className="mt-4 sm:mt-6 space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const count = product.ratings.filter(
                                (r) => r.value === star
                              ).length;
                              const percentage =
                                product.ratings.length > 0
                                  ? (count / product.ratings.length) * 100
                                  : 0;
                              return (
                                <div
                                  key={star}
                                  className="flex items-center gap-2"
                                >
                                  <span className="text-sm w-2">{star}</span>
                                  <Star className="w-4 h-4 text-yellow-400" />
                                  <div className="flex-1 bg-gray-200 h-2 rounded-full">
                                    <div
                                      className="bg-yellow-400 h-2 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {count}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="md:w-2/3">
                        <div className="space-y-4 sm:space-y-6">
                          {product.ratings.length > 0 ? (
                            product.ratings.map((review, index) => (
                              <div
                                key={index}
                                className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6"
                              >
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
                                    {review.user.image?.asset?.url ? (
                                      <img
                                        src={review.user.image.asset.url}
                                        alt={review.user.userName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-[#d4af37] to-yellow-600 flex items-center justify-center text-white font-semibold text-sm">
                                        {review.user.userName
                                          ? review.user.userName
                                              .split(" ")
                                              .filter((n) => n)
                                              .map((n) => n[0])
                                              .join("")
                                          : "N/A"}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-semibold text-gray-900 text-base sm:text-lg">
                                        {review.user.userName || "Anonymous"}
                                      </h4>
                                      <span className="text-xs sm:text-sm text-gray-500">
                                        {review.date
                                          ? new Date(
                                              review.date
                                            ).toLocaleDateString()
                                          : "No date"}
                                      </span>
                                    </div>
                                    <div className="flex items-center mb-2 sm:mb-3">
                                      {renderStars(review.value)}
                                      <span className="ml-2 text-xs sm:text-sm text-gray-600">
                                        Verified Purchase
                                      </span>
                                    </div>
                                    <p className="text-gray-700 text-sm sm:text-base">
                                      {review.message}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                              <p className="text-gray-600">
                                No reviews yet. Be the first to review this
                                product!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Write a Review Form */}
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">
                        Write a Review
                      </h3>
                      <form onSubmit={handleRatingSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating
                          </label>
                          <div className="flex gap-1">
                            {renderStars(
                              reviewRating,
                              "w-5 h-5 sm:w-6 sm:h-6",
                              true
                            )}
                          </div>
                        </div>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience with this product..."
                          rows="4"
                          maxLength={200}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                          required
                        ></textarea>
                        <div className="text-xs text-gray-600 text-right">
                          {reviewComment.length}/200
                        </div>
                        <button
                          type="submit"
                          disabled={!reviewRating || isSubmitting}
                          className="w-full bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Review"}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">
                        Shipping Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Truck className="w-5 h-5 text-blue-600 mt-1" />
                          <div>
                            <h4 className="font-semibold">
                              Free Standard Shipping
                            </h4>
                            <p className="text-gray-600 text-sm">
                              On orders over 50 SAR • 5-7 business days
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Truck className="w-5 h-5 text-purple-600 mt-1" />
                          <div>
                            <h4 className="font-semibold">Express Shipping</h4>
                            <p className="text-gray-600 text-sm">
                              $9.99 • 2-3 business days
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Truck className="w-5 h-5 text-green-600 mt-1" />
                          <div>
                            <h4 className="font-semibold">Next Day Delivery</h4>
                            <p className="text-gray-600 text-sm">
                              $19.99 • Order by 2 PM
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">
                        Returns & Exchanges
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <RotateCcw className="w-5 h-5 text-blue-600 mt-1" />
                          <div>
                            <h4 className="font-semibold">30-Day Returns</h4>
                            <p className="text-gray-600 text-sm">
                              Easy returns within 30 days of purchase
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-green-600 mt-1" />
                          <div>
                            <h4 className="font-semibold">Free Exchanges</h4>
                            <p className="text-gray-600 text-sm">
                              Wrong size? Exchange for free
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Award className="w-5 h-5 text-purple-600 mt-1" />
                          <div>
                            <h4 className="font-semibold">Quality Guarantee</h4>
                            <p className="text-gray-600 text-sm">
                              100% satisfaction guaranteed
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <section className="mt-10 mb-20 relative overflow-hidden rounded-xl p-6">
              <div className="absolute inset-0 opacity-[0.02]">
                <div className="absolute top-10 left-10 w-72 h-72 bg-[#d4af37] rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-600 rounded-full blur-3xl"></div>
              </div>

              <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-5">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Related Products
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Discover more products in {categoryNames[product.category]}
                  </p>
                  <div className="w-24 h-1 bg-gradient-to-r from-[#d4af37] to-yellow-600 mx-auto mt-6 rounded-full"></div>
                </div>

                <ProductsList products={currentProducts} viewMode="grid" />
              </div>
            </section>
          )}

          {product.listingType === "rent" && (
            <RentalDatePopup
              isOpen={isPopupOpen}
              onClose={() => setIsPopupOpen(false)}
              onSubmit={handleRentalSubmit}
              rentalDurationUnit={product.rentalDurationUnit}
            />
          )}
        </div>

        <style jsx>{`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default CombinedProductPage;