// src/app/[locale]/Stables/add-stable/StableFormNavigation.js
"use client";

import { ChevronLeft, ChevronRight, Save, CheckCircle } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useTranslation } from "react-i18next";
import { validateStep as validateBasicInfo } from "./StableBasicInfoStep";
import { validateStep as validateLocationContact } from "./StableLocationContactStep";
import { validateStep as validateDetails } from "./StableDetailsStep";
import { validateStep as validateMedia } from "./StableMediaStep";

export default function StableFormNavigation({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  isLastStep,
  isSubmitting,
  isSubmitted,
  formData,
  setErrors,
  onSubmit,
}) {
  const { t, i18n } = useTranslation();

  const handleNext = () => {
    let isValid = false;
    switch (currentStep) {
      case 1:
        isValid = validateBasicInfo(formData, t, setErrors);
        break;
      case 2:
        isValid = validateLocationContact(formData, t, setErrors);
        break;
      case 3:
        isValid = validateDetails(formData, t, setErrors);
        break;
      case 4:
        isValid = validateMedia(formData, t, setErrors);
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
        disabled={currentStep === 1 || isSubmitting || isSubmitted}
        className="rounded-xl flex items-center gap-2"
      >
        {i18n.language === "ar" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        {t("addStable:previous")}
      </Button>

      {isLastStep ? (
        isSubmitted ? (
          <Button
            type="button"
            disabled
            className="rounded-xl flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle size={16} />
            <span>{t("addStable:stableCreated")}</span>
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl flex items-center gap-2 bg-black hover:bg-black/90 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-xl border-2 border-white border-t-transparent"></div>
                <span>{t("addStable:submitting")}</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{t("addStable:createStable")}</span>
              </>
            )}
          </Button>
        )
      ) : (
        <Button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting || isSubmitted}
          className="rounded-xl flex items-center gap-2 bg-black hover:bg-black/90 text-white"
        >
          <span>{t("addStable:nextStep")}</span>
          {i18n.language === "ar" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </Button>
      )}
    </div>
  );
}