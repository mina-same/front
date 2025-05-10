"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useParams } from "next/navigation";
import {
  Package2,
  ArrowLeft,
  Star,
  ChevronRight,
  Box,
  Heart,
  Share2,
  Check,
  Info,
} from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../components/ui/tabs";
import { Badge } from "../../../../../components/ui/badge";
import { Separator } from "../../../../../components/ui/separator.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { toast } from "sonner";
import DetailPageHeader from "../../../../../../components/details/DetailPageHeader";
import DetailSidebar from "../../../../../../components/details/DetailSidebar";
import { client } from "../../../../../lib/sanity";
import Layout from "components/layout/Layout";

// Map category values to display names
const categoryNames = {
  feed_nutrition: "Feed and Nutrition",
  tack_equipment: "Tack and Equipment",
  apparel_accessories: "Apparel and Accessories",
  health_wellness: "Health and Wellness",
  barn_stable: "Barn and Stable Supplies",
  riding_competition: "Riding and Competition",
  other: "Other",
};

// Map rental duration units to display names
const rentalUnitNames = {
  hour: "Hour",
  day: "Day",
  week: "Week",
  month: "Month",
  year: "Year",
};

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

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
            name,
            email,
            phone
          },
          ratings[] {
            user-> {
              name
            },
            value,
            message,
            date
          }
        }`;
        const data = await client.fetch(query, { id: productId }); // Fixed: Changed from { productId } to { id: productId }

        if (!data) {
          throw new Error("Product not found");
        }

        // Map Sanity data to match expected format
        const formattedProduct = {
          id: data._id,
          name_en: data.name_en,
          name_ar: data.name_ar,
          description_en: data.description_en || "",
          description_ar: data.description_ar || "",
          price: data.price,
          listingType: data.listingType,
          category: data.category,
          images: data.images
            ? data.images.map((img) => img.asset.url).filter(Boolean)
            : ["/placeholder.svg"],
          stock: data.stock || 0,
          averageRating: data.averageRating || 0,
          ratingCount: data.ratingCount || 0,
          rentalDurationUnit: data.rentalDurationUnit || null,
          supplier: data.supplier || { name: "Unknown", email: "", phone: "" },
          specifications: data.specifications || {},
          ratings: data.ratings || [],
        };

        setProduct(formattedProduct);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product. Please try again later.");
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f1e9] flex items-center justify-center">
        <div className="text-center">
          <Package2 size={48} className="mx-auto mb-4 text-[#2e4a2e]" />
          <p className="text-[#1a1a1a] text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f8f1e9] flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg border border-[#e0d7c8] shadow-sm">
          <Package2 size={48} className="mx-auto mb-4 text-[#2e4a2e]" />
          <h3 className="text-2xl font-semibold text-[#1a1a1a] mb-2">
            {error || "Product Not Found"}
          </h3>
          <p className="text-[#4a4a4a] mb-6">
            We couldn't find the product you're looking for.
          </p>
          <Button
            asChild
            className="bg-[#2e4a2e] text-white hover:bg-[#a68b00]"
          >
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Handle add to cart
  const handleAddToCart = () => {
    toast.success(`${quantity} ${product.name_en} added to cart.`, {
      description:
        product.listingType === "rent"
          ? "Item has been added to your rental cart"
          : "Item has been added to your shopping cart",
    });
  };

  // Handle buy now
  const handleBuyNow = () => {
    toast.success("Proceeding to checkout...", {
      description: "You are being redirected to complete your purchase.",
    });
  };

  // Toggle wishlist
  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success("Added to wishlist", {
        description: "Item has been added to your wishlist",
      });
    } else {
      toast("Removed from wishlist", {
        description: "Item has been removed from your wishlist",
      });
    }
  };

  return (
    <Layout className="py-15">
      <Head>
        <title>{product.name_en} | Equestrian Products</title>
        <meta name="description" content={product.description_en} />
      </Head>

      <DetailPageHeader
        title={product.name_en}
        subtitle={product.name_ar}
        rating={product.averageRating}
        ratingCount={product.ratingCount}
        imageUrl={product.images[0]}
      />

      {/* Breadcrumb navigation */}
      <div className="container bg-[#f8f1e9] border-b border-[#e0d7c8]">
        <div className="container mx-auto py-3 px-4">
          <nav className="flex items-center text-sm">
            <Link href="/" className="text-[#4a4a4a] hover:text-[#a68b00]">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 mx-2 text-[#4a4a4a]" />
            <Link
              href="/products"
              className="text-[#4a4a4a] hover:text-[#a68b00]"
            >
              Products
            </Link>
            <ChevronRight className="w-3 h-3 mx-2 text-[#4a4a4a]" />
            <Link
              href={`/products?category=${product.category}`}
              className="text-[#4a4a4a] hover:text-[#a68b00]"
            >
              {categoryNames[product.category]}
            </Link>
            <ChevronRight className="w-3 h-3 mx-2 text-[#4a4a4a]" />
            <span className="text-[#d4af37] font-medium truncate">
              {product.name_en}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4 bg-[#f8f1e9]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Product Images - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="aspect-square overflow-hidden rounded-xl border border-[#e0d7c8] bg-white shadow-sm transition-all hover:shadow-md">
                  <div className="relative h-full">
                    <img
                      src={product.images[activeImageIndex]}
                      alt={product.name_en}
                      className="w-full h-full object-contain p-4"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-white shadow-sm hover:bg-[#e0d7c8] border-[#e0d7c8]"
                        onClick={toggleWishlist}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isWishlisted ? "fill-[#d4af37] text-[#d4af37]" : ""
                          }`}
                        />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-white shadow-sm hover:bg-[#e0d7c8] border-[#e0d7c8]"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-[#e0d7c8] shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="font-normal text-xs border-[#e0d7c8] text-[#2e4a2e]"
                      >
                        {product.listingType === "rent"
                          ? "For Rent"
                          : "For Sale"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="font-normal text-xs border-[#e0d7c8] text-[#2e4a2e]"
                      >
                        {categoryNames[product.category]}
                      </Badge>
                    </div>
                    <h1 className="font-semibold text-xl text-[#1a1a1a]">
                      {product.name_en}
                    </h1>
                    <h2 className="text-[#4a4a4a] text-sm">
                      {product.name_ar}
                    </h2>
                    <div className="flex items-center text-lg font-bold text-[#1a1a1a]">
                      <span>{product.price}</span>
                      <span className="text-[#4a4a4a] ml-1 text-sm">SAR</span>
                      {product.listingType === "rent" &&
                        product.rentalDurationUnit && (
                          <span className="text-sm text-[#4a4a4a] ml-1">
                            / {rentalUnitNames[product.rentalDurationUnit]}
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                {product.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        className={`border-2 rounded-lg overflow-hidden w-full h-20 flex-shrink-0 ${
                          activeImageIndex === index
                            ? "border-[#d4af37]"
                            : "border-[#e0d7c8]"
                        }`}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <img
                          src={image}
                          alt={`${product.name_en} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="bg-white p-4 rounded-xl border border-[#e0d7c8] shadow-sm">
                  <h3 className="text-sm font-medium mb-2 text-[#1a1a1a]">
                    Supplier
                  </h3>
                  <p className="text-base font-medium text-[#1a1a1a]">
                    {product.supplier.name}
                  </p>
                  <div className="flex items-center mt-1 text-sm text-[#4a4a4a]">
                    <a
                      href={`tel:${product.supplier.phone}`}
                      className="text-[#d4af37] hover:text-[#a68b00]"
                    >
                      {product.supplier.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Product tabs */}
            <div className="mt-10">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full rounded-lg bg-[#f8f1e9] p-1">
                  <TabsTrigger
                    value="description"
                    className="rounded-md flex-1 data-[state=active]:bg-[#2e4a2e] data-[state=active]:text-white"
                  >
                    Description
                  </TabsTrigger>
                  <TabsTrigger
                    value="specifications"
                    className="rounded-md flex-1 data-[state=active]:bg-[#2e4a2e] data-[state=active]:text-white"
                  >
                    Specifications
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="rounded-md flex-1 data-[state=active]:bg-[#2e4a2e] data-[state=active]:text-white"
                  >
                    Reviews ({product.ratings?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-6">
                  <Card className="border-[#e0d7c8]">
                    <CardHeader className="border-b border-[#e0d7c8]">
                      <CardTitle className="text-[#1a1a1a]">
                        Product Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div>
                        <h4 className="font-medium mb-2 text-lg text-[#1a1a1a]">
                          English
                        </h4>
                        <p className="text-[#4a4a4a] leading-relaxed">
                          {product.description_en}
                        </p>
                      </div>
                      <Separator className="bg-[#e0d7c8]" />
                      <div dir="rtl" lang="ar">
                        <h4 className="font-medium mb-2 text-lg text-[#1a1a1a]">
                          العربية
                        </h4>
                        <p className="text-[#4a4a4a] leading-relaxed">
                          {product.description_ar}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="specifications" className="mt-6">
                  <Card className="border-[#e0d7c8]">
                    <CardHeader className="border-b border-[#e0d7c8]">
                      <CardTitle className="text-[#1a1a1a]">
                        Specifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.specifications &&
                          Object.entries(product.specifications).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex border-b border-[#e0d7c8] pb-3"
                              >
                                <div className="w-1/3 font-medium capitalize text-[#4a4a4a]">
                                  {key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                  :
                                </div>
                                <div className="w-2/3 font-medium text-[#1a1a1a]">
                                  {value}
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  <Card className="border-[#e0d7c8]">
                    <CardHeader className="border-b border-[#e0d7c8]">
                      <CardTitle className="text-[#1a1a1a]">
                        Customer Reviews
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="flex items-center mb-6 bg-[#f8f1e9] p-4 rounded-lg border border-[#e0d7c8]">
                        <div className="flex items-center mr-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= Math.floor(product.averageRating)
                                  ? "text-[#d4af37] fill-[#d4af37]"
                                  : star <= product.averageRating
                                  ? "text-[#d4af37] fill-[#d4af37]"
                                  : "text-[#e0d7c8]"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xl font-bold text-[#1a1a1a]">
                          {product.averageRating}
                        </span>
                        <span className="text-[#4a4a4a] ml-2">
                          out of 5 ({product.ratingCount} reviews)
                        </span>
                      </div>

                      <div className="space-y-4">
                        {product.ratings?.map((rating, index) => (
                          <div
                            key={index}
                            className="bg-[#f8f1e9] p-5 rounded-xl border border-[#e0d7c8]"
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-[#1a1a1a]">
                                {rating.user.name}
                              </div>
                              <div className="text-sm text-[#4a4a4a]">
                                {rating.date}
                              </div>
                            </div>
                            <div className="flex items-center mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= rating.value
                                      ? "text-[#d4af37] fill-[#d4af37]"
                                      : "text-[#e0d7c8]"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="mt-2 text-[#4a4a4a]">
                              {rating.message}
                            </p>
                          </div>
                        ))}

                        {(!product.ratings || product.ratings.length === 0) && (
                          <div className="text-center p-6 bg-white rounded-lg border border-[#e0d7c8]">
                            <p className="text-[#4a4a4a]">
                              No reviews yet. Be the first to review this
                              product!
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Sidebar */}
          <div>
            <div className="sticky top-6 space-y-6">
              <Card className="overflow-hidden border-2 border-[#e0d7c8]">
                <CardHeader className="bg-[#f8f1e9]">
                  <CardTitle className="text-xl text-[#1a1a1a]">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#4a4a4a]">Price</span>
                      <span className="font-medium text-[#1a1a1a]">
                        {product.price} SAR
                      </span>
                    </div>

                    {product.listingType === "rent" &&
                      product.rentalDurationUnit && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#4a4a4a]">Duration</span>
                          <span className="font-medium text-[#1a1a1a]">
                            Per {rentalUnitNames[product.rentalDurationUnit]}
                          </span>
                        </div>
                      )}

                    <div className="flex items-center justify-between">
                      <span className="text-[#4a4a4a]">Availability</span>
                      <div>
                        {product.stock > 0 ? (
                          <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                            <Check className="w-3 h-3 mr-1" /> In Stock
                          </Badge>
                        ) : (
                          <Badge className="bg-red-50 text-red-700 border-red-200">
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-[#e0d7c8]" />

                    <div>
                      <label className="text-sm font-medium text-[#1a1a1a] mb-2 block">
                        Quantity:
                      </label>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            quantity > 1 && setQuantity(quantity - 1)
                          }
                          disabled={quantity <= 1}
                          className="h-10 w-10 border-[#e0d7c8] hover:border-[#a68b00] hover:bg-[#e0d7c8]"
                        >
                          -
                        </Button>
                        <span className="mx-4 font-medium w-8 text-center text-[#1a1a1a]">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            quantity < product.stock &&
                            setQuantity(quantity + 1)
                          }
                          disabled={quantity >= product.stock}
                          className="h-10 w-10 border-[#e0d7c8] hover:border-[#a68b00] hover:bg-[#e0d7c8]"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Button
                      className="w-full bg-[#2e4a2e] hover:bg-[#a68b00] text-white"
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0}
                    >
                      {product.listingType === "rent"
                        ? "Add to Rental Cart"
                        : "Add to Cart"}
                    </Button>
                    <Button
                      className="w-full border-[#e0d7c8] hover:bg-[#e0d7c8] text-[#2e4a2e] hover:text-[#1a1a1a]"
                      size="lg"
                      variant="outline"
                      disabled={product.stock <= 0}
                      onClick={handleBuyNow}
                    >
                      {product.listingType === "rent"
                        ? "Request to Rent"
                        : "Buy Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <DetailSidebar
                contactInfo={{
                  name: product.supplier.name,
                  email: product.supplier.email,
                  phone: product.supplier.phone,
                }}
                actionLabel="Contact Supplier"
              />

              <Card className="border-[#e0d7c8]">
                <CardContent className="p-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#d4af37] mt-0.5" />
                    <p className="text-[#4a4a4a]">
                      This product includes a{" "}
                      {product.specifications.warranty || "standard"} warranty
                      period. For any inquiries, please contact the supplier
                      directly.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailsPage;
