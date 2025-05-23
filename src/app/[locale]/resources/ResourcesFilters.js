"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

const CATEGORY_OPTIONS = [
  { value: "equine_anatomy_physiology", label: "Equine Anatomy & Physiology" },
  { value: "equine_nutrition", label: "Equine Nutrition" },
  { value: "stable_management", label: "Stable Management" },
  { value: "horse_care_grooming", label: "Horse Care & Grooming" },
  { value: "riding_instruction", label: "Riding Instruction" },
  { value: "equine_health_first_aid", label: "Equine Health & First Aid" },
  { value: "equine_reproduction_breeding", label: "Reproduction & Breeding" },
  { value: "horse_training_behavior", label: "Training & Behavior" },
  { value: "equine_business_management", label: "Business Management" },
  { value: "equine_law_ethics", label: "Law & Ethics" },
  { value: "other", label: "Other Categories" },
];

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const LANGUAGE_OPTIONS = [
  { value: "english", label: "English" },
  { value: "arabic", label: "Arabic" },
  { value: "french", label: "French" },
  { value: "spanish", label: "Spanish" },
];

export default function ResourcesFilters({ resourceType }) {
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Filter {resourceType}</h2>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
          <X className="h-4 w-4 mr-1" />
          Clear all
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Category filter */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Language filter */}
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <select
            id="language"
            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          >
            <option value="">All Languages</option>
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Level filter - only for courses */}
        {resourceType === "courses" && (
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <select
              id="level"
              className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            >
              <option value="">All Levels</option>
              {LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button className="bg-[#d4af37] hover:bg-[#b8972e] text-white">Apply Filters</Button>
      </div>
    </div>
  );
}