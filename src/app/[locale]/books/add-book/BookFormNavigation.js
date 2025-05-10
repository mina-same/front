"use client";

import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useTranslation } from "react-i18next";
import { validateStep as validateBasicInfo } from "./BookBasicInfoStep";
import { validateStep as validateMedia } from "./BookMediaStep";
import { validateStep as validatePricing } from "./BookPricingStep";

export default function BookFormNavigation({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  isLastStep,
  isSubmitting,
  formData,
  setErrors,
}) {
  const { t, i18n } = useTranslation();

  const handleNext = () => {
    let isValid = false;
    switch (currentStep) {
      case 1:
        isValid = validateBasicInfo(formData, t, setErrors);
        break;
      case 2:
        isValid = validateMedia(formData, t, setErrors);
        break;
      case 3:
        isValid = validatePricing(formData, t, setErrors);
        break;
      default:
        isValid = true;
    }
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className={`container flex justify-between items-center pt-4 dissolves-200`}>
      <Button
        type="button"
        variant="outline"
        onClick={onPrev}
        disabled={currentStep === 1 || isSubmitting}
        className="rounded-xl flex items-center gap-2"
      >
        {i18n.language === "ar" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        {t("addBook:previous")}
      </Button>

      {isLastStep ? (
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl flex items-center gap-2 bg-black hover:bg-black/90 text-white"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-xl border-2 border-white border-t-transparent"></div>
              <span>{t("addBook:submitting")}</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>{t("addBook:createBook")}</span>
            </>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="rounded-xl flex items-center gap-2 bg-black hover:bg-black/90 text-white"
        >
          <span>{t("addBook:nextStep")}</span>
          {i18n.language === "ar" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </Button>
      )}
    </div>
  );
}
