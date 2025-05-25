import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import { Star, ShoppingCart, Heart, Eye, Tag, PiggyBank, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { client } from "@/lib/sanity";
import { v4 as uuidv4 } from "uuid";
import RentalDatePopup from "./RentalDatePopup";

const ProductCard = ({ product, viewMode }) => {
    const isGridView = viewMode === "grid";
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // For cart actions
    const [isWishlistLoading, setIsWishlistLoading] = useState(false); // For wishlist actions
    const [isPopupOpen, setIsPopupOpen] = useState(false);
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

    // Check if the product is already in the user's orders
    useEffect(() => {
        const checkOrderStatus = async () => {
            if (!currentUserId || !product?.id) return;

            try {
                const query = `*[_type == "orderProduct" && user._ref == $userId && product._ref == $productId && status == "pending"]`;
                const params = { userId: currentUserId, productId: product.id };
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
    }, [currentUserId, product?.id]);

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

        setIsWishlistLoading(true); // Set wishlist-specific loading

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
            setIsWishlistLoading(false); // Clear wishlist-specific loading
        }
    }, [currentUserId, isWishlisted, product.id, router]);

    const handleAddToCart = useCallback(
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

            if (product.stock <= 0) {
                toast.error("This product is out of stock.");
                return;
            }

            setIsLoading(true); // Set cart-specific loading

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
                    status: "pending",
                    paymentStatus: "pending",
                };

                if (product.listingType === "rent" && rentalDates) {
                    orderData.startDate = rentalDates.startDate;
                    orderData.endDate = rentalDates.endDate;
                }

                await client.create(orderData);
                setIsAdded(true);
                toast.success("Product added to cart!", {
                    description: "You can view your order in your profile.",
                });
            } catch (error) {
                console12.error("Error creating order:", error);
                toast.error("Failed to add product to cart. Please try again.");
            } finally {
                setIsLoading(false); // Clear cart-specific loading
            }
        },
        [currentUserId, product, router]
    );

    const handleButtonClick = useCallback(() => {
        if (isAdded) {
            router.push("/profile?tab=orders");
        } else if (product.listingType === "rent") {
            setIsPopupOpen(true);
        } else {
            handleAddToCart();
        }
    }, [isAdded, product.listingType, handleAddToCart, router]);

    const handleRentalSubmit = useCallback(
        (rentalDates) => {
            handleAddToCart(rentalDates);
        },
        [handleAddToCart]
    );

    // Calculate savings percentage if originalPrice exists and is greater than price
    const hasDiscount =
        product.originalPrice && product.originalPrice > product.price;
    const savingsPercentage = hasDiscount
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
        : null;

    return (
        <>
            <Card
                className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${isGridView ? "" : "flex"}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Link
                    href={`/products/view/${product.id}`}
                    className={`${isGridView ? "block" : "flex-shrink-0 w-1/3"}`}
                >
                    <div
                        className={`${isGridView ? "aspect-square" : "h-full"} overflow-hidden relative`}
                    >
                        <Image
                            src={
                                product.images?.[0] ||
                                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center"
                            }
                            alt={product.name_en}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            width={500}
                            height={500}
                            loading="lazy"
                        />
                        <Badge
                            className={`absolute top-3 right-3 ${
                                product.listingType === "rent"
                                    ? "bg-blue-500 hover:bg-blue-600"
                                    : "bg-emerald-500 hover:bg-emerald-600"
                            }`}
                        >
                            {product.listingType === "rent" ? "For Rent" : "For Sale"}
                        </Badge>
                        <div
                            className={`absolute top-10 right-3 flex flex-col gap-3 opacity-0 transition-all duration-300 transform translate-x-2 ${
                                isHovered ? "opacity-100 translate-x-0" : ""
                            }`}
                        >
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleWishlistToggle();
                                }}
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
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="p-2.5 bg-white/90 text-gray-700 rounded-full shadow-lg backdrop-blur-sm hover:bg-white hover:text-[#d4af37] transition-all duration-300 hover:scale-110"
                                title="Quick View"
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Link>

                <CardContent className={`p-4 ${isGridView ? "" : "flex-grow"}`}>
                    <div className="flex items-center justify-between mb-2">
                        <Badge
                            variant="outline"
                            className="font-medium text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-1 px-2.5 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-1"
                        >
                            <Tag className="w-4 h-4 text-gray-600" />
                            {product.category.replace("_", " ")}
                        </Badge>
                        <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                            <span className="text-sm">{Number(product.averageRating).toFixed(1)}</span>
                            <span className="text-xs text-gray-500 ml-1">
                                ({product.ratingCount})
                            </span>
                        </div>
                    </div>

                    <Link href={`/products/view/${product.id}`} className="block group">
                        <h3 className="font-medium text-lg mb-1 group-hover:text-indigo-600 line-clamp-2">
                            {product.name_en}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 opacity-75 line-clamp-2">
                            {product.description_en}
                        </p>
                    </Link>

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                            <div className="flex items-center">
                                <span className="font-semibold text-lg">{product.price} SAR</span>
                                {hasDiscount && (
                                    <span className="text-sm text-gray-500 line-through ml-2">
                                        {product.originalPrice} SAR
                                    </span>
                                )}
                                {product.listingType === "rent" && product.rentalDurationUnit && (
                                    <span className="text-xs text-gray-500 ml-1">
                                        /{product.rentalDurationUnit}
                                    </span>
                                )}
                            </div>
                            {hasDiscount && (
                                <div className="flex gap-1">
                                    <PiggyBank className="text-green-900 text-xs" />
                                    <span className="text-xs text-green-900 mt-1">
                                        Buy Now & Save {savingsPercentage}%
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {product.stock > 0 ? (
                                <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200"
                                >
                                    In Stock
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="bg-red-50 text-red-700 border-red-200"
                                >
                                    Out of Stock
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 border-t pt-4">
                        <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={handleButtonClick}
                            disabled={product.stock <= 0 || isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                                <ShoppingCart className="w-4 h-4 mr-1" />
                            )}
                            {isAdded
                                ? "Product Added"
                                : product.listingType === "rent"
                                ? "Add to Rental Cart"
                                : "Add to Cart"}
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleWishlistToggle}
                            className={`${
                                isWishlisted
                                    ? "border-red-500 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                                    : "border-gray-300 text-gray-600 hover:border-red-500 hover:bg-red-50 hover:text-red-500"
                            } ${isWishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={isWishlistLoading}
                        >
                            {isWishlistLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Heart
                                    className={`w-3 h-3 ${isWishlisted ? "fill-current" : ""}`}
                                />
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {product.listingType === "rent" && (
                <RentalDatePopup
                    isOpen={isPopupOpen}
                    onClose={() => setIsPopupOpen(false)}
                    onSubmit={handleRentalSubmit}
                    rentalDurationUnit={product.rentalDurationUnit}
                />
            )}
        </>
    );
};

export default ProductCard;