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
  SelectValue
} from "../../src/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../src/components/ui/accordion";
import {
  Filter,
  Search,
  Tag,
  DollarSign,
  LayoutGrid,
  Star,
  Package,
  ChevronDown
} from "lucide-react";
import { Slider } from "../../src/components/ui/slider";
import { Checkbox } from "../../src/components/ui/checkbox";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "feed_nutrition", label: "Feed and Nutrition" },
  { value: "tack_equipment", label: "Tack and Equipment" },
  { value: "apparel_accessories", label: "Apparel and Accessories" },
  { value: "health_wellness", label: "Health and Wellness" },
  { value: "barn_stable", label: "Barn and Stable Supplies" },
  { value: "riding_competition", label: "Riding and Competition" },
  { value: "other", label: "Other" },
];

const LISTING_TYPE_OPTIONS = [
  { value: "all", label: "All Listings" },
  { value: "sell", label: "For Sale" },
  { value: "rent", label: "For Rent" },
];

const RATING_OPTIONS = [
  { value: "any", label: "Any Rating" },
  { value: "4", label: "4+ Stars" },
  { value: "3", label: "3+ Stars" },
  { value: "2", label: "2+ Stars" },
  { value: "1", label: "1+ Star" },
];

const AVAILABILITY_OPTIONS = [
  { id: "in-stock", label: "In Stock" },
  { id: "out-of-stock", label: "Out of Stock" },
];

function ProductFilter({ onFilterChange, initialProducts, searchTerm, setSearchTerm }) {
  const [category, setCategory] = useState("all");
  const [listingType, setListingType] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [rating, setRating] = useState("any");
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  
  // Get min and max prices from the products
  const maxPrice = Math.max(...initialProducts.map(p => p.price), 1500);
  
  // Apply filters whenever they change
  useEffect(() => {
    let result = [...initialProducts];
    const newActiveFilters = [];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        p => p.name_en.toLowerCase().includes(term) || 
             p.name_ar?.toLowerCase().includes(term) || 
             p.description_en?.toLowerCase().includes(term) || 
             p.description_ar?.toLowerCase().includes(term)
      );
      newActiveFilters.push(`Search: "${searchTerm}"`);
    }
    
    // Filter by category
    if (category && category !== "all") {
      result = result.filter(p => p.category === category);
      const categoryOption = CATEGORY_OPTIONS.find(c => c.value === category);
      if (categoryOption) newActiveFilters.push(`Category: ${categoryOption.label}`);
    }
    
    // Filter by listing type
    if (listingType && listingType !== "all") {
      result = result.filter(p => p.listingType === listingType);
      const listingOption = LISTING_TYPE_OPTIONS.find(l => l.value === listingType);
      if (listingOption) newActiveFilters.push(`Type: ${listingOption.label}`);
    }
    
    // Filter by price range
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) {
      result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
      newActiveFilters.push(`Price: SAR ${priceRange[0]} - ${priceRange[1]}`);
    }
    
    // Filter by rating
    if (rating !== "any") {
      const ratingValue = parseInt(rating);
      result = result.filter(p => p.averageRating >= ratingValue);
      newActiveFilters.push(`Rating: ${rating}+ stars`);
    }
    
    // Filter by availability
    if (selectedAvailability.length > 0) {
      if (selectedAvailability.includes("in-stock") && !selectedAvailability.includes("out-of-stock")) {
        result = result.filter(p => p.stock > 0);
        newActiveFilters.push("Availability: In Stock");
      } else if (!selectedAvailability.includes("in-stock") && selectedAvailability.includes("out-of-stock")) {
        result = result.filter(p => p.stock === 0);
        newActiveFilters.push("Availability: Out of Stock");
      }
    }
    
    setActiveFilters(newActiveFilters);
    onFilterChange(result);
  }, [searchTerm, category, listingType, priceRange, rating, selectedAvailability, initialProducts, onFilterChange, maxPrice]);
  
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
    setSelectedAvailability(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
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
          <Filter className="mr-2 text-[#d4af37]" size={20} />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-[#d4af37] hover:text-[#b8972e]">
          Clear All
        </Button>
      </div>
      
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {activeFilters.map(filter => (
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
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <Search className="absolute text-gray-400" size={16} style={{top: "50%", left: "10px", transform: "translateY(-50%)"}} />
          <Input
            type="text"
            placeholder="      Search products..."
            className="pl-10"
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
              Category
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(option => (
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
              Listing Type
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select value={listingType} onValueChange={setListingType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Listings" />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_TYPE_OPTIONS.map(option => (
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
              <DollarSign size={16} className="mr-2 text-[#d4af37]" />
              Price Range
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
                  <Label className="text-xs">Min</Label>
                  <div className="font-medium">SAR {priceRange[0]}</div>
                </div>
                <div className="text-center">-</div>
                <div>
                  <Label className="text-xs">Max</Label>
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
              Rating
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map(option => (
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
              Availability
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