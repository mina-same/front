import React from "react";
import Link from "next/link";
import { Card, CardContent } from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import { Star, ShoppingCart, Heart, Package2 } from "lucide-react";

const ProductCard = ({ product, viewMode }) => {
  const isGridView = viewMode === "grid";
  
  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${isGridView ? '' : 'flex'}`}>
      <Link href={`/products/view/${product.id}`} className={`${isGridView ? 'block' : 'flex-shrink-0 w-1/3'}`}>
        <div className={`${isGridView ? 'aspect-square' : 'h-full'} overflow-hidden relative`}>
          <img 
            src={product.images[0]} 
            alt={product.name_en} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          
          <Badge 
            className={`absolute top-3 right-3 ${
              product.listingType === 'rent' 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {product.listingType === 'rent' ? 'For Rent' : 'For Sale'}
          </Badge>
        </div>
      </Link>
      
      <CardContent className={`p-4 ${isGridView ? '' : 'flex-grow'}`}>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="font-normal">
            {product.category.replace('_', ' ')}
          </Badge>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span className="text-sm">{product.averageRating}</span>
            <span className="text-xs text-gray-500 ml-1">({product.ratingCount})</span>
          </div>
        </div>
        
        <Link href={`/products/${product.id}`} className="block group">
          <h3 className="font-medium text-lg mb-1 group-hover:text-indigo-600 line-clamp-2">
            {product.name_en}
          </h3>
          <p className="text-gray-600 text-sm mb-4 opacity-75 line-clamp-2">
            {product.description_en}
          </p>
        </Link>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <span className="font-semibold text-lg">{product.price} SAR</span>
            {product.listingType === 'rent' && product.rentalDurationUnit && (
              <div className="flex items-center ml-1">
                <span className="text-xs text-gray-500">
                  /{product.rentalDurationUnit}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                In Stock
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
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
          <Button variant="outline" size="icon">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ProductsList = ({ products, searchTerm, viewMode }) => {
  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center p-12 bg-[#f8f1e9] rounded-lg border border-[#e0d7c8] shadow-sm animate-fade-in">
        <div className="text-center max-w-lg">
          <Package2 size={64} className="mx-auto mb-6 text-[#2e4a2e] opacity-80" />
          <h3 className="text-2xl font-semibold text-[#1a1a1a] mb-3">No Products Found</h3>
          <p className="text-[#4a4a4a] mb-6">
            {searchTerm
              ? `We couldn't find any products matching "${searchTerm}".`
              : "No products match your current filter criteria."}
            <br />
            Try exploring other categories or adding a new product!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="border-[#e0d7c8] text-[#2e4a2e] hover:bg-[#a68b00] hover:text-white transition-colors"
              onClick={() => window.location.reload()} // Reset filters by reloading (assuming filters are managed in ProductFilter)
            >
              Clear Filters
            </Button>
            <Button
              variant="ghost"
              className="text-[#2e4a2e] hover:bg-[#e0d7c8] transition-colors"
              asChild
            >
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={viewMode === "grid" 
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
      : "flex flex-col gap-6"
    }>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} viewMode={viewMode} />
      ))}
    </div>
  );
};

export default ProductsList;