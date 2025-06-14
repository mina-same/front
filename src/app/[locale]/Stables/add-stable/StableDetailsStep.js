"use client";

import { Calendar, Tag, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "../../../../components/ui/button";

const stableTypes = [
  { value: "educational", label: { en: "Educational", ar: "تعليمي" } },
  { value: "entertainment", label: { en: "Entertainment", ar: "ترفيهي" } },
  { value: "competitions", label: { en: "Competitions", ar: "تنافسي" } },
  { value: "events", label: { en: "Events", ar: "فعاليات" } },
];

const priceUnits = [
  { value: "per_day", label: { en: "Per Day", ar: "لكل يوم" } },
  { value: "per_month", label: { en: "Per Month", ar: "لكل شهر" } },
];

export default function StableDetailsStep({ formData, setFormData, setErrors }) {
  const { t, i18n } = useTranslation();
  const [localErrors, setLocalErrors] = useState({
    dateOfEstablishment: "",
    kindOfStable: "",
    stableDescription: "",
    boardingCapacity: "",
    boardingPrice: "",
    boardingPriceUnit: "",
    additionalServices: "",
  });
  const isRTL = i18n.language === "ar";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalErrors((prev) => ({ ...prev, [name]: "" }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBoardingDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      boardingDetails: { ...prev.boardingDetails, [name]: value },
    }));
    setLocalErrors((prev) => ({ ...prev, [name]: "" }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleStableTypeChange = (value) => {
    setFormData((prev) => {
      const kindOfStable = prev.kindOfStable.includes(value)
        ? prev.kindOfStable.filter((type) => type !== value)
        : [...prev.kindOfStable, value];
      return { ...prev, kindOfStable };
    });
    setLocalErrors((prev) => ({ ...prev, kindOfStable: "" }));
    setErrors((prev) => ({ ...prev, kindOfStable: "" }));
  };

  const addAdditionalService = () => {
    setFormData((prev) => ({
      ...prev,
      boardingDetails: {
        ...prev.boardingDetails,
        additionalServices: [...prev.boardingDetails.additionalServices, { name_ar: "", name_en: "", price: "" }],
      },
    }));
  };

  const updateAdditionalService = (index, field, value) => {
    setFormData((prev) => {
      const newServices = [...prev.boardingDetails.additionalServices];
      newServices[index] = { ...newServices[index], [field]: value };
      return { ...prev, boardingDetails: { ...prev.boardingDetails, additionalServices: newServices } };
    });
    setLocalErrors((prev) => ({ ...prev, additionalServices: "" }));
    setErrors((prev) => ({ ...prev, additionalServices: "" }));
  };

  const removeAdditionalService = (index) => {
    setFormData((prev) => ({
      ...prev,
      boardingDetails: {
        ...prev.boardingDetails,
        additionalServices: prev.boardingDetails.additionalServices.filter((_, i) => i !== index),
      },
    }));
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = {
      dateOfEstablishment: "",
      kindOfStable: "",
      stableDescription: "",
      boardingCapacity: "",
      boardingPrice: "",
      boardingPriceUnit: "",
      additionalServices: "",
    };

    if (!formData.dateOfEstablishment) {
      newErrors.dateOfEstablishment = t("addStable:errors.dateOfEstablishmentRequired");
      isValid = false;
    }
    if (formData.kindOfStable.length === 0) {
      newErrors.kindOfStable = t("addStable:errors.kindOfStableRequired");
      isValid = false;
    }
    if (!formData.stableDescription.trim()) {
      newErrors.stableDescription = t("addStable:errors.stableDescriptionRequired");
      isValid = false;
    }
    if (!formData.boardingCapacity || isNaN(parseInt(formData.boardingCapacity))) {
      newErrors.boardingCapacity = t("addStable:errors.boardingCapacityRequired");
      isValid = false;
    }
    if (!formData.boardingDetails.boardingPrice || isNaN(parseFloat(formData.boardingDetails.boardingPrice))) {
      newErrors.boardingPrice = t("addStable:errors.boardingPriceRequired");
      isValid = false;
    }
    if (!formData.boardingDetails.boardingPriceUnit) {
      newErrors.boardingPriceUnit = t("addStable:errors.boardingPriceUnitRequired");
      isValid = false;
    }
    formData.boardingDetails.additionalServices.forEach((service, index) => {
      if (!service.name_ar.trim() || !service.name_en.trim() || !service.price || isNaN(parseFloat(service.price))) {
        newErrors.additionalServices = t("addStable:errors.additionalServicesRequired");
        isValid = false;
      }
    });

    setLocalErrors(newErrors);
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  return (
    <div className={isRTL ? "rtl" : "ltr"}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
        <Calendar className={`text-gold ${isRTL ? "ml-2" : "mr-2"}`} size={28} />
        {t("addStable:stableDetails")}
      </h2>
      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20 mb-6">
        <p className="text-gold font-medium">
          {t("addStable:stableDetailsDescription")}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addStable:dateOfEstablishment")} <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="dateOfEstablishment"
          value={formData.dateOfEstablishment}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-xl ${localErrors.dateOfEstablishment ? "border-red-500" : "border-gray-300"}`}
          required
        />
        {localErrors.dateOfEstablishment && (
          <p className="text-red-500 text-sm mt-1">{localErrors.dateOfEstablishment}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addStable:kindOfStable")} <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-4">
          {stableTypes.map((type) => (
            <label key={type.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.kindOfStable.includes(type.value)}
                onChange={() => handleStableTypeChange(type.value)}
                className="h-5 w-5"
              />
              <span>{isRTL ? type.label.ar : type.label.en}</span>
            </label>
          ))}
        </div>
        {localErrors.kindOfStable && (
          <p className="text-red-500 text-sm mt-1">{localErrors.kindOfStable}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addStable:stableDescription")} <span className="text-red-500">*</span>
        </label>
        <textarea
          name="stableDescription"
          value={formData.stableDescription}
          onChange={handleInputChange}
          rows={5}
          className={`w-full p-3 border rounded-xl ${localErrors.stableDescription ? "border-red-500" : "border-gray-300"}`}
          placeholder={t("addStable:stableDescriptionPlaceholder")}
          required
        />
        {localErrors.stableDescription && (
          <p className="text-red-500 text-sm mt-1">{localErrors.stableDescription}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addStable:boardingCapacity")} <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="boardingCapacity"
          value={formData.boardingCapacity}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-xl ${localErrors.boardingCapacity ? "border-red-500" : "border-gray-300"}`}
          placeholder={t("addStable:boardingCapacityPlaceholder")}
          min="1"
          required
        />
        {localErrors.boardingCapacity && (
          <p className="text-red-500 text-sm mt-1">{localErrors.boardingCapacity}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addStable:boardingPrice")} (SAR) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <DollarSign className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} text-gray-400`} size={20} />
          <input
            type="number"
            name="boardingPrice"
            value={formData.boardingDetails.boardingPrice}
            onChange={handleBoardingDetailsChange}
            className={`w-full p-3 ${isRTL ? "pl-10" : "pr-10"} border rounded-xl ${localErrors.boardingPrice ? "border-red-500" : "border-gray-300"}`}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>
        {localErrors.boardingPrice && (
          <p className="text-red-500 text-sm mt-1">{localErrors.boardingPrice}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addStable:boardingPriceUnit")} <span className="text-red-500">*</span>
        </label>
        <select
          name="boardingPriceUnit"
          value={formData.boardingDetails.boardingPriceUnit}
          onChange={handleBoardingDetailsChange}
          className={`w-full p-3 border rounded-xl ${localErrors.boardingPriceUnit ? "border-red-500" : "border-gray-300"}`}
          required
        >
          <option value="">{t("addStable:selectPriceUnit")}</option>
          {priceUnits.map((unit) => (
            <option key={unit.value} value={unit.value}>
              {isRTL ? unit.label.ar : unit.label.en}
            </option>
          ))}
        </select>
        {localErrors.boardingPriceUnit && (
          <p className="text-red-500 text-sm mt-1">{localErrors.boardingPriceUnit}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addStable:additionalServices")}
        </label>
        {formData.boardingDetails.additionalServices.map((service, index) => (
          <div key={index} className="flex items-center gap-4 mb-4">
            <input
              type="text"
              value={service.name_ar}
              onChange={(e) => updateAdditionalService(index, "name_ar", e.target.value)}
              className={`w-1/3 p-3 border rounded-xl ${localErrors.additionalServices ? "border-red-500" : "border-gray-300"}`}
              placeholder={t("addStable:serviceNameAr")}
            />
            <input
              type="text"
              value={service.name_en}
              onChange={(e) => updateAdditionalService(index, "name_en", e.target.value)}
              className={`w-1/3 p-3 border rounded-xl ${localErrors.additionalServices ? "border-red-500" : "border-gray-300"}`}
              placeholder={t("addStable:serviceNameEn")}
            />
            <input
              type="number"
              value={service.price}
              onChange={(e) => updateAdditionalService(index, "price", e.target.value)}
              className={`w-1/3 p-3 border rounded-xl ${localErrors.additionalServices ? "border-red-500" : "border-gray-300"}`}
              placeholder={t("addStable:servicePrice")}
              min="0"
              step="0.01"
            />
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeAdditionalService(index)}
              className="rounded-xl"
            >
              {t("addStable:removeService")}
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addAdditionalService}
          className="rounded-xl border-gold/20 bg-white hover:text-gold text-black hover:bg-gold/30"
        >
          <Tag className="mr-2" size={16} />
          {t("addStable:addService")}
        </Button>
        {localErrors.additionalServices && (
          <p className="text-red-500 text-sm mt-1">{localErrors.additionalServices}</p>
        )}
      </div>
    </div>
  );
}

export const validateStep = (formData, t, setErrors) => {
  let isValid = true;
  const newErrors = {
    dateOfEstablishment: "",
    kindOfStable: "",
    stableDescription: "",
    boardingCapacity: "",
    boardingPrice: "",
    boardingPriceUnit: "",
    additionalServices: "",
  };

  if (!formData.dateOfEstablishment) {
    newErrors.dateOfEstablishment = t("addStable:errors.dateOfEstablishmentRequired");
    isValid = false;
  }
  if (formData.kindOfStable.length === 0) {
    newErrors.kindOfStable = t("addStable:errors.kindOfStableRequired");
    isValid = false;
  }
  if (!formData.stableDescription.trim()) {
    newErrors.stableDescription = t("addStable:errors.stableDescriptionRequired");
    isValid = false;
  }
  if (!formData.boardingCapacity || isNaN(parseInt(formData.boardingCapacity))) {
    newErrors.boardingCapacity = t("addStable:errors.boardingCapacityRequired");
    isValid = false;
  }
  if (!formData.boardingDetails.boardingPrice || isNaN(parseFloat(formData.boardingDetails.boardingPrice))) {
    newErrors.boardingPrice = t("addStable:errors.boardingPriceRequired");
    isValid = false;
  }
  if (!formData.boardingDetails.boardingPriceUnit) {
    newErrors.boardingPriceUnit = t("addStable:errors.boardingPriceUnitRequired");
    isValid = false;
  }
  formData.boardingDetails.additionalServices.forEach((service, index) => {
    if (!service.name_ar.trim() || !service.name_en.trim() || !service.price || isNaN(parseFloat(service.price))) {
      newErrors.additionalServices = t("addStable:errors.additionalServicesRequired");
      isValid = false;
    }
  });

  setErrors((prev) => ({ ...prev, ...newErrors }));
  return isValid;
};