"use client";

import { DollarSign, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const categories = [
  {
    value: "equine_anatomy_physiology",
    label: {
      en: "Equine Anatomy and Physiology",
      ar: "تشريح وفسيولوجيا الخيول",
    },
  },
  {
    value: "equine_nutrition",
    label: { en: "Equine Nutrition", ar: "تغذية الخيول" },
  },
  {
    value: "stable_management",
    label: { en: "Stable Management", ar: "إدارة الإسطبلات" },
  },
  {
    value: "horse_care_grooming",
    label: { en: "Horse Care and Grooming", ar: "العناية بالخيول وتزيينها" },
  },
  {
    value: "riding_instruction",
    label: {
      en: "Riding Instruction (English and Western)",
      ar: "تعليم الركوب (إنجليزي وغربي)",
    },
  },
  {
    value: "equine_health_first_aid",
    label: {
      en: "Equine Health and First Aid",
      ar: "الرعاية الصحية والإسعافات الأولية",
    },
  },
  {
    value: "equine_reproduction_breeding",
    label: {
      en: "Equine Reproduction and Breeding",
      ar: "التكاثر والتربية",
    },
  },
  {
    value: "horse_training_behavior",
    label: {
      en: "Horse Training and Behavior",
      ar: "تدريب الخيول وسلوكها",
    },
  },
  {
    value: "equine_business_management",
    label: {
      en: "Equine Business Management",
      ar: "إدارة الأعمال التجارية للخيول",
    },
  },
  {
    value: "equine_law_ethics",
    label: { en: "Equine Law and Ethics", ar: "القانون والأخلاقيات المتعلقة بالخيول" },
  },
  {
    value: "horse_show_management_judging",
    label: {
      en: "Horse Show Management and Judging",
      ar: "إدارة عروض الخيول والتحكيم",
    },
  },
  {
    value: "equine_assisted_services",
    label: {
      en: "Equine-Assisted Services",
      ar: "الخدمات بمساعدة الخيول",
    },
  },
  {
    value: "equine_competition_disciplines",
    label: {
      en: "Equine Competition Disciplines",
      ar: "تخصصات المنافسة",
    },
  },
  {
    value: "equine_recreation_tourism",
    label: {
      en: "Equine Recreation and Tourism",
      ar: "الترفيه والسياحة بالخيول",
    },
  },
  {
    value: "equine_rescue_rehabilitation",
    label: {
      en: "Equine Rescue and Rehabilitation",
      ar: "إنقاذ وإعادة تأهيل الخيول",
    },
  },
  {
    value: "equine_sports_medicine",
    label: { en: "Equine Sports Medicine", ar: "طب الرياضة للخيول" },
  },
  {
    value: "equine_facility_design_management",
    label: {
      en: "Equine Facility Design and Management",
      ar: "تصميم وإدارة مرافق الخيول",
    },
  },
  {
    value: "equine_marketing_promotion",
    label: {
      en: "Equine Marketing and Promotion",
      ar: "التسويق والترويج للخيول",
    },
  },
  {
    value: "equine_photography_videography",
    label: {
      en: "Equine Photography and Videography",
      ar: "تصوير وتسجيل فيديو للخيول",
    },
  },
  {
    value: "equine_journalism_writing",
    label: {
      en: "Equine Journalism and Writing",
      ar: "الصحافة والكتابة عن الخيول",
    },
  },
  {
    value: "equine_history_culture",
    label: { en: "Equine History and Culture", ar: "تاريخ وثقافة الخيول" },
  },
  {
    value: "equine_environmental_stewardship",
    label: {
      en: "Equine Environmental Stewardship",
      ar: "الإشراف البيئي للخيول",
    },
  },
  {
    value: "equine_technology_innovation",
    label: {
      en: "Equine Technology and Innovation",
      ar: "تكنولوجيا وابتكار الخيول",
    },
  },
  {
    value: "equine_entrepreneurship",
    label: { en: "Equine Entrepreneurship", ar: "ريادة الأعمال في مجال الخيول" },
  },
  {
    value: "equine_dentistry",
    label: { en: "Equine Dentistry", ar: "طب الأسنان للخيول" },
  },
  {
    value: "equine_podiatry",
    label: { en: "Equine Podiatry", ar: "العناية بالحوافر" },
  },
  {
    value: "english_riding",
    label: { en: "English Riding", ar: "الركوب الإنجليزي" },
  },
  {
    value: "western_riding",
    label: { en: "Western Riding", ar: "الركوب الغربي" },
  },
  {
    value: "jumping_hunter",
    label: { en: "Jumping and Hunter", ar: "القفز والصيد" },
  },
  {
    value: "other",
    label: { en: "Other", ar: "أخرى" },
  },
];

export default function BookPricingStep({ formData, setFormData, setErrors }) {
  const { t, i18n } = useTranslation();
  const [localErrors, setLocalErrors] = useState({ category: "", price: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalErrors((prev) => ({ ...prev, [name]: "" }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = { category: "", price: "" };

    if (!formData.category) {
      newErrors.category = t("addBook:errors.categoryRequired");
      isValid = false;
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      newErrors.price = t("addBook:errors.priceRequired");
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
        {t("addBook:pricingCategory")}
      </h2>
      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20 mb-6">
        <p className="text-gold font-medium">
          {t("addBook:pricingDescription")}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addBook:bookCategory")} <span className="text-red-500">*</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-xl ${localErrors.category ? "border-red-500" : "border-gray-300"
            }`}
          required
        >
          <option value="">{t("addBook:selectCategory")}</option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label[i18n.language] || category.label.en}
            </option>
          ))}
        </select>
        {localErrors.category && (
          <p className="text-red-500 text-sm mt-1">{localErrors.category}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addBook:price")} (SAR) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div
            className={`absolute inset-y-0 ${i18n.language === "ar" ? "left-5" : "right-5"
              } pl-3 flex items-center pointer-events-none`}
          >
            <span className="text-gray-500">SAR</span>
          </div>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className={`w-full p-3 ${i18n.language === "ar" ? "pl-12" : "pr-12"
              } border rounded-xl ${localErrors.price ? "border-red-500" : "border-gray-300"
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
          {t("addBook:freeBookNote")}
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20 mb-6">
        <div className="flex items-start">
          <Tag className={`text-yellow-600  mt-1 ${i18n.language === "ar" ? "ml-2" : "mr-2"} `} size={20} />
          <div>
            <h3 className="font-medium text-yellow-800">
              {t("addBook:pricingRecommendations")}
            </h3>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              <li>{t("addBook:educationalBooks")}</li>
              <li>{t("addBook:referenceGuides")}</li>
              <li>{t("addBook:shortPublications")}</li>
              <li>{t("addBook:comprehensiveTextbooks")}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <h3 className="font-medium text-gray-700 mb-2">
          {t("addBook:termsOfPublication")}
        </h3>
        <p className="text-sm text-gray-600">{t("addBook:termsDescription")}</p>
      </div>
    </div>
  );
}

// Export validateStep as a named export
export const validateStep = (formData, t, setErrors) => {
  let isValid = true;
  const newErrors = { category: "", price: "" };

  if (!formData.category) {
    newErrors.category = t("addBook:errors.categoryRequired");
    isValid = false;
  }
  if (!formData.price || isNaN(parseFloat(formData.price))) {
    newErrors.price = t("addBook:errors.priceRequired");
    isValid = false;
  }

  setErrors((prev) => ({ ...prev, ...newErrors }));
  return isValid;
};