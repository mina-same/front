"use client";

import { DollarSign, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function ProductPricingStep({ formData, setFormData, setErrors }) {
  const { t, i18n } = useTranslation();
  const [localErrors, setLocalErrors] = useState({ price: "", rentalDurationUnit: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? (value === "" ? "" : Number(value)) : value,
    }));
    setLocalErrors((prev) => ({ ...prev, [name]: "" }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = { price: "", rentalDurationUnit: "" };

    if (!formData.price || isNaN(parseFloat(formData.price))) {
      newErrors.price = t("addProduct:errors.priceRequired");
      isValid = false;
    }
    if (formData.listingType === "rent" && !formData.rentalDurationUnit) {
      newErrors.rentalDurationUnit = t("addProduct:errors.rentalDurationUnitRequired");
      isValid = false;
    }

    setLocalErrors(newErrors);
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  return (
    <div className={i18n.language === "ar" ? "rtl" : "ltr"}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
        <DollarSign
          className={`text-gold ${i18n.language === "ar" ? "ml-2" : "mr-2"}`}
          size={28}
        />
        {t("addProduct:pricingStock")}
      </h2>
      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20 mb-6">
        <p className="text-gold font-medium">
          {t("addProduct:pricingDescription")}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addProduct:listingType")} <span className="text-red-500">*</span>
        </label>
        <select
          name="listingType"
          value={formData.listingType}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-xl border-gray-300"
          required
        >
          <option value="sell">{t("addProduct:forSale")}</option>
          <option value="rent">{t("addProduct:forRent")}</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addProduct:price")} (SAR) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div
            className={`absolute inset-y-0 ${
              i18n.language === "ar" ? "left-5" : "right-5"
            } pl-3 flex items-center pointer-events-none`}
          >
            <span className="text-gray-500">SAR</span>
          </div>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className={`w-full p-3 ${
              i18n.language === "ar" ? "pl-12" : "pr-12"
            } border rounded-xl ${
              localErrors.price ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>
        {localErrors.price && (
          <p className="text-red-500 text-sm mt-1">{localErrors.price}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          {formData.listingType === "rent"
            ? t("addProduct:pricePerRental")
            : t("addProduct:priceForSale")}
        </p>
      </div>

      {formData.listingType === "rent" && (
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            {t("addProduct:rentalDurationUnit")} <span className="text-red-500">*</span>
          </label>
          <select
            name="rentalDurationUnit"
            value={formData.rentalDurationUnit}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-xl ${
              localErrors.rentalDurationUnit ? "border-red-500" : "border-gray-300"
            }`}
            required
          >
            <option value="">{t("addProduct:selectRentalDuration")}</option>
            <option value="hour">{t("addProduct:perHour")}</option>
            <option value="day">{t("addProduct:perDay")}</option>
            <option value="week">{t("addProduct:perWeek")}</option>
            <option value="month">{t("addProduct:perMonth")}</option>
            <option value="year">{t("addProduct:perYear")}</option>
          </select>
          {localErrors.rentalDurationUnit && (
            <p className="text-red-500 text-sm mt-1">{localErrors.rentalDurationUnit}</p>
          )}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addProduct:stock")}
        </label>
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-xl border-gray-300"
          placeholder={t("addProduct:stockPlaceholder")}
          min="0"
          step="1"
        />
        <p className="text-sm text-gray-500 mt-1">
          {t("addProduct:stockNote")}
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20 mt-8">
        <div className="flex items-start">
          <Tag className="text-gold mr-2 mt-1" size={20} />
          <div>
            <h3 className="font-medium text-gold">{t("addProduct:pricingTips")}</h3>
            <ul className="mt-2 text-sm text-gold space-y-1">
              <li>{t("addProduct:pricingTip1")}</li>
              <li>{t("addProduct:pricingTip2")}</li>
              <li>{t("addProduct:pricingTip3")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export const validateStep = (formData, t, setErrors) => {
  let isValid = true;
  const newErrors = { price: "", rentalDurationUnit: "" };

  if (!formData.price || isNaN(parseFloat(formData.price))) {
    newErrors.price = t("addProduct:errors.priceRequired");
    isValid = false;
  }
  if (formData.listingType === "rent" && !formData.rentalDurationUnit) {
    newErrors.rentalDurationUnit = t("addProduct:errors.rentalDurationUnitRequired");
    isValid = false;
  }

  setErrors((prev) => ({ ...prev, ...newErrors }));
  return isValid;
};