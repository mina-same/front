import React, { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import { Star, ShoppingCart, Heart, Eye, Tag, PiggyBank } from "lucide-react";
import { toast } from "sonner";


const ProductCard = ({ product, viewMode }) => {
    const isGridView = viewMode === "grid";
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    console.log(product)

    const handleWishlistToggle = useCallback(() => {
        setIsWishlisted((prev) => !prev);
        toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist", {
            description: `Item has been ${isWishlisted ? "removed from" : "added to"} your wishlist`,
        });
    }, [isWishlisted]);

    // Calculate savings percentage if originalPrice exists and is greater than price
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const savingsPercentage = hasDiscount
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : null;

    return (
        <Card
            className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${isGridView ? "" : "flex"
                }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link
                href={`/products/view/${product.id}`}
                className={`${isGridView ? "block" : "flex-shrink-0 w-1/3"}`}
            >
                <div
                    className={`${isGridView ? "aspect-square" : "h-full"
                        } overflow-hidden relative`}
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
                        className={`absolute top-3 right-3 ${product.listingType === "rent"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-emerald-500 hover:bg-emerald-600"
                            }`}
                    >
                        {product.listingType === "rent" ? "For Rent" : "For Sale"}
                    </Badge>
                    <div
                        className={`absolute top-10 right-3 flex flex-col gap-3 opacity-0 transition-all duration-300 transform translate-x-2 ${isHovered ? "opacity-100 translate-x-0" : ""
                            }`}
                    >
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                                e.preventDefault();
                                handleWishlistToggle();
                            }}
                            className={`p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 ${isWishlisted
                                ? "bg-[#d4af37] text-white"
                                : "bg-white/90 text-gray-700 hover:bg-white hover:text-[#d4af37]"
                                }`}
                            title="Add to Wishlist"
                        >
                            <Heart
                                className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
                            />
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
                                <span className="text-sm text-gold line-through ml-2">
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
                    <Button variant="default" size="sm" className="flex-1">
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add to Cart
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleWishlistToggle}
                        className={`${isWishlisted
                            ? "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]"
                            : "border-gray-300 text-gray-600 hover:border-[#d4af37] hover:bg-[#d4af37]/10 hover:text-[#d4af37]"
                            }`}
                    >
                        <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductCard;