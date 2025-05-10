"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import ProductFilter from "../../../../components/product/ProductFilter";
import ProductsList from "../../../../components/product/ProductsList";
import { Package2, Filter, LayoutGrid, LayoutList } from "lucide-react";
import Layout from "components/layout/Layout";
import { client } from "../../../lib/sanity"; // Adjust path to your Sanity client

const ProductsPage = () => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products for filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = `*[_type == "product"] {
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
          images[] {
            asset-> {
              url
            }
          }
        }`;
        const products = await client.fetch(query);

        // Map Sanity data to match the expected format
        const formattedProducts = products.map((product) => ({
          id: product._id,
          name_en: product.name_en,
          name_ar: product.name_ar,
          description_en: product.description_en || "",
          description_ar: product.description_ar || "",
          price: product.price,
          listingType: product.listingType,
          category: product.category,
          images: product.images
            ? product.images.map((img) => img.asset.url).filter(Boolean)
            : ["/placeholder.svg"], // Fallback if no images
          stock: product.stock || 0,
          averageRating: product.averageRating || 0,
          ratingCount: product.ratingCount || 0,
          rentalDurationUnit: product.rentalDurationUnit || null,
        }));

        setAllProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Layout className="min-h-screen bg-[#f8f1e9]">
        <div className="container mx-auto py-12 px-4 text-center">
          <p className="text-[#1a1a1a] text-lg">Loading products...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout className="min-h-screen bg-[#f8f1e9]">
        <div className="container mx-auto py-12 px-4 text-center">
          <p className="text-[#1a1a1a] text-lg">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-[#f8f1e9]">
      {/* Hero section with enhanced gold gradient */}
      <div className="relative bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://i.pinimg.com/736x/ac/30/74/ac30748aaf0aa7338cbeb623ef73736f.jpg')",
          }}
        ></div>
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f8f1e9] to-transparent"></div>
        <div className="container mx-auto relative z-10 py-20 px-4">
          <div className="flex flex-col items-center text-center mb-6">
            <Package2 size={42} className="mb-4 animate-fade-in text-white" />
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight text-white">
              Equestrian Products
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto text-white">
              Discover premium quality equestrian products, from tack and
              equipment to feed and medications.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#f8f1e9] py-12">
        <div className="container mx-auto px-4">
          {/* Filter controls */}
          <div className="flex flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-semibold text-[#1a1a1a]">
                Browse Products
              </h2>
              <span className="ml-3 px-3 py-1 bg-[#e0d7c8] text-[#4a4a4a] rounded-full text-sm">
                {filteredProducts.length} items
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className="flex items-center gap-1 border-[#e0d7c8] text-[#2e4a2e] hover:bg-[#a68b00] hover:text-white transition-colors"
              >
                <Filter size={16} />
                {isFilterVisible ? "Hide Filters" : "Show Filters"}
              </Button>
              <div className="border-l h-6 mx-2 border-[#e0d7c8]"></div>
              <div className="flex bg-white border rounded-md overflow-hidden border-[#e0d7c8]">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-none border-none ${
                    viewMode === "grid"
                      ? "bg-[#2e4a2e] text-white"
                      : "text-[#2e4a2e] hover:bg-[#e0d7c8]"
                  }`}
                >
                  <LayoutGrid size={18} />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`rounded-none border-none ${
                    viewMode === "list"
                      ? "bg-[#2e4a2e] text-white"
                      : "text-[#2e4a2e] hover:bg-[#e0d7c8]"
                  }`}
                >
                  <LayoutList size={18} />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters sidebar with animation */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                isFilterVisible
                  ? "max-h-[2000px] opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden lg:hidden"
              }`}
            >
              <ProductFilter
                onFilterChange={setFilteredProducts}
                initialProducts={allProducts}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                className="bg-white border border-[#e0d7c8] rounded-lg shadow-sm"
              />
            </div>

            {/* Products grid */}
            <div
              className={`${
                isFilterVisible ? "lg:col-span-3" : "col-span-full"
              }`}
            >
              <ProductsList
                products={filteredProducts}
                searchTerm={searchTerm}
                viewMode={viewMode}
                className="bg-white border border-[#e0d7c8] rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Featured collections banner */}
      <div className="pt-12 pb-20 bg-[#f8f1e9]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 text-center">
            Featured Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Premium Tack",
                image:
                  "https://images.unsplash.com/photo-1584663414959-488897a1f842?auto=format&fit=crop&q=80",
                color: "from-[#d4af37]/80",
              },
              {
                title: "Horse Care",
                image:
                  "https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&q=80",
                color: "from-[#2e4a2e]/80",
              },
              {
                title: "Rider Apparel",
                image:
                  "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80",
                color: "from-[#8b4513]/80",
              },
            ].map((collection, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden group h-48 shadow-md cursor-pointer"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `url('${collection.image}')`,
                  }}
                ></div>
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${collection.color} to-transparent opacity-90`}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold text-center drop-shadow-lg">
                    {collection.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
