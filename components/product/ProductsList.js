import React from "react";
import { Button } from "../../src/components/ui/button";
import { Package2 } from "lucide-react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";

const ProductsList = ({ products, searchTerm, viewMode }) => {
  const { t } = useTranslation('product');
  const params = useParams();
  const isRTL = params.locale === 'ar';
  
  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center p-12 bg-[#f8f1e9] rounded-lg border border-[#e0d7c8] shadow-sm animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center max-w-lg">
          <Package2 size={64} className="mx-auto mb-6 text-[#2e4a2e] opacity-80" />
          <h3 className="text-2xl font-semibold text-[#1a1a1a] mb-3">{t('productsList.noProductsFound')}</h3>
          <p className="text-[#4a4a4a] mb-6">
            {searchTerm
              ? `${t('productsList.noProductsMatchSearch')} "${searchTerm}".`
              : t('productsList.noProductsMatchFilter')}
            <br />
            {t('productsList.tryExploring')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="border-[#e0d7c8] text-[#2e4a2e] hover:bg-[#a68b00] hover:text-white transition-colors"
              onClick={() => window.location.reload()}
            >
              {t('productsList.clearFilters')}
            </Button>
            <Button
              variant="ghost"
              className="text-[#2e4a2e] hover:bg-[#e0d7c8] transition-colors"
              asChild
            >
              <Link href="/products">{t('productsList.browseAll')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          : "flex flex-col gap-6"
      }
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          viewMode={viewMode}
          index={index}
        />
      ))}
    </div>
  );
};

export { ProductCard }; // Export ProductCard for use in CombinedProductPage
export default ProductsList;