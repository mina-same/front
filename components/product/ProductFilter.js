import React, { useState, useEffect } from "react";
import { Input } from "../../src/components/ui/input";
import { Label } from "../../src/components/ui/label";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../src/components/ui/accordion";
import {
  Filter,
  Search,
  Tag,
  DollarSign,
  LayoutGrid,
  Star,
  Package,
} from "lucide-react";
import { Slider } from "../../src/components/ui/slider";
import { Checkbox } from "../../src/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";

// Category options will be populated with translations
const getCategoryOptions = (t) => [
  { value: "all", label: t('productFilter.categories.all') },
  { value: "feed_nutrition", label: t('productFilter.categories.feed_nutrition') },
  { value: "tack_equipment", label: t('productFilter.categories.tack_equipment') },
  { value: "apparel_accessories", label: t('productFilter.categories.apparel_accessories') },
  { value: "health_wellness", label: t('productFilter.categories.health_wellness') },
  { value: "barn_stable", label: t('productFilter.categories.barn_stable') },
  { value: "riding_competition", label: t('productFilter.categories.riding_competition') },
  { value: "other", label: t('productFilter.categories.other') },
];

// Listing type options with translations
const getListingTypeOptions = (t) => [
  { value: "all", label: t('productFilter.listingType.all') },
  { value: "sell", label: t('productFilter.listingType.sell') },
  { value: "rent", label: t('productFilter.listingType.rent') },
];

// Rating options with translations
const getRatingOptions = (t) => [
  { value: "any", label: t('productFilter.rating.any') },
  { value: "4", label: t('productFilter.rating.4plus') },
  { value: "3", label: t('productFilter.rating.3plus') },
  { value: "2", label: t('productFilter.rating.2plus') },
  { value: "1", label: t('productFilter.rating.1plus') },
];

// Availability options with translations
const getAvailabilityOptions = (t) => [
  { id: "in-stock", label: t('productFilter.availability.inStock') },
  { id: "out-of-stock", label: t('productFilter.availability.outOfStock') },
];

function ProductFilter({
  onFilterChange,
  initialProducts,
  searchTerm,
  setSearchTerm,
  initialCategory = "all", // Default to "all"
}) {
  const { t } = useTranslation('product');
  const params = useParams();
  const isRTL = params.locale === 'ar';
  
  // Get translated options
  const CATEGORY_OPTIONS = getCategoryOptions(t);
  const LISTING_TYPE_OPTIONS = getListingTypeOptions(t);
  const RATING_OPTIONS = getRatingOptions(t);
  const AVAILABILITY_OPTIONS = getAvailabilityOptions(t);
  
  const [category, setCategory] = useState(initialCategory);
  const [listingType, setListingType] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [rating, setRating] = useState("any");
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);

  // Get min and max prices from the products
  const maxPrice = Math.max(...initialProducts.map((p) => p.price), 10000);

  // Apply filters whenever they change
  useEffect(() => {
    let result = [...initialProducts];
    const newActiveFilters = [];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name_en.toLowerCase().includes(term) ||
          p.name_ar?.toLowerCase().includes(term) ||
          p.description_en?.toLowerCase().includes(term) ||
          p.description_ar?.toLowerCase().includes(term)
      );
      newActiveFilters.push(`Search: "${searchTerm}"`);
    }

    // Filter by category
    if (category && category !== "all") {
      result = result.filter((p) => p.category === category);
      const categoryOption = CATEGORY_OPTIONS.find((c) => c.value === category);
      if (categoryOption) newActiveFilters.push(`Category: ${categoryOption.label}`);
    }

    // Filter by listing type
    if (listingType && listingType !== "all") {
      result = result.filter((p) => p.listingType === listingType);
      const listingOption = LISTING_TYPE_OPTIONS.find((l) => l.value === listingType);
      if (listingOption) newActiveFilters.push(`Type: ${listingOption.label}`);
    }

    // Filter by price range
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) {
      result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
      newActiveFilters.push(`Price: SAR ${priceRange[0]} - ${priceRange[1]}`);
    }

    // Filter by rating
    if (rating !== "any") {
      const ratingValue = parseInt(rating);
      result = result.filter((p) => p.averageRating >= ratingValue);
      newActiveFilters.push(`Rating: ${rating}+ stars`);
    }

    // Filter by availability
    if (selectedAvailability.length > 0) {
      if (
        selectedAvailability.includes("in-stock") &&
        !selectedAvailability.includes("out-of-stock")
      ) {
        result = result.filter((p) => p.stock > 0);
        newActiveFilters.push("Availability: In Stock");
      } else if (
        !selectedAvailability.includes("in-stock") &&
        selectedAvailability.includes("out-of-stock")
      ) {
        result = result.filter((p) => p.stock === 0);
        newActiveFilters.push("Availability: Out of Stock");
      }
    }

    setActiveFilters(newActiveFilters);
    onFilterChange(result);
  }, [
    searchTerm,
    category,
    listingType,
    priceRange,
    rating,
    selectedAvailability,
    initialProducts,
    onFilterChange,
    maxPrice,
  ]);

  const resetFilters = () => {
    setCategory("all");
    setListingType("all");
    setPriceRange([0, maxPrice]);
    setRating("any");
    setSelectedAvailability([]);
    setSearchTerm("");
    onFilterChange(initialProducts);
  };

  const toggleAvailability = (value) => {
    setSelectedAvailability((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const removeFilter = (filter) => {
    if (filter.startsWith("Search:")) {
      setSearchTerm("");
    } else if (filter.startsWith("Category:")) {
      setCategory("all");
    } else if (filter.startsWith("Type:")) {
      setListingType("all");
    } else if (filter.startsWith("Price:")) {
      setPriceRange([0, maxPrice]);
    } else if (filter.startsWith("Rating:")) {
      setRating("any");
    } else if (filter.startsWith("Availability:")) {
      setSelectedAvailability([]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 sticky top-24">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
          <Filter className={`${isRTL ? 'ml-2' : 'mr-2'} text-[#d4af37]`} size={20} />
          <h3 className="text-lg font-semibold">{t('productFilter.filters')}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-[#d4af37] hover:text-[#b8972e]"
        >
          {t('productFilter.clearAll')}
        </Button>
      </div>

      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="px-3 py-1 flex items-center gap-1 bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20"
            >
              {filter}
              <button
                onClick={() => removeFilter(filter)}
                className="ml-1 rounded-full hover:bg-[#d4af37]/30 p-0.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute text-gray-400"
            size={16}
            style={{ top: "50%", [isRTL ? 'right' : 'left']: "10px", transform: "translateY(-50%)" }}
          />
          <Input
            type="text"
            placeholder={t('productFilter.search')}
            className={isRTL ? 'pr-10' : 'pl-10'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["category", "price"]} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center">
              <LayoutGrid size={16} className="mr-2 text-[#d4af37]" />
              {t('productFilter.category')}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="listingType">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center">
              <Tag size={16} className="mr-2 text-[#d4af37]" />
              {t('productFilter.listingTypeTitle')}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select value={listingType} onValueChange={setListingType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Listings" />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center">
              <DollarSign size={16} className={`${isRTL ? 'ml-2' : 'mr-2'} text-[#d4af37]`} />
              {t('productFilter.price')}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              <Slider
                min={0}
                max={maxPrice}
                step={10}
                value={[priceRange[0], priceRange[1]]}
                onValueChange={(value) => setPriceRange(value)}
                className="my-6"
              />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">{t('productFilter.min')}</Label>
                  <div className="font-medium">SAR {priceRange[0]}</div>
                </div>
                <div className="text-center">-</div>
                <div>
                  <Label className="text-xs">{t('productFilter.max')}</Label>
                  <div className="font-medium">SAR {priceRange[1]}</div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center">
              <Star size={16} className="mr-2 text-[#d4af37]" />
              {t('productFilter.ratingTitle')}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center">
              <Package size={16} className="mr-2 text-[#d4af37]" />
              {t('productFilter.availabilityTitle')}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {AVAILABILITY_OPTIONS.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={selectedAvailability.includes(option.id)}
                    onCheckedChange={() => toggleAvailability(option.id)}
                  />
                  <label
                    htmlFor={option.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default ProductFilter;