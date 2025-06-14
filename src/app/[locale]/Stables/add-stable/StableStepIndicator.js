// src/app/[locale]/Stables/add-stable/StableStepIndicator.js
"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function StableStepIndicator({ currentStep, steps }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Fallback steps if not provided
  const fallbackSteps = [
    t("addStable:basicInformation"),
    t("addStable:locationContact"),
    t("addStable:stableDetails"),
    t("addStable:mediaUpload"),
  ];

  const effectiveSteps = Array.isArray(steps) && steps.length > 0 ? steps : fallbackSteps;

  return (
    <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Mobile view */}
      <div className="md:hidden mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-md border border-[#d4af37]/20">
              {currentStep}
            </div>
            <span className="text-sm font-medium">
              {effectiveSteps[currentStep - 1] || t("addStable:stepLabel", { step: currentStep })}
            </span>
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            {t('step')} {currentStep} {t('of')} {effectiveSteps.length}
          </span>
        </div>

        <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className={`h-full ${isRTL ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-black to-black/80`}
            style={{
              width: `${(currentStep / effectiveSteps.length) * 100}%`,
              marginLeft: isRTL ? `${100 - (currentStep / effectiveSteps.length) * 100}%` : 0
            }}
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / effectiveSteps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className="absolute h-4 w-1 bg-[#d4af37] rounded-full shadow-md"
              style={{
                [isRTL ? 'right' : 'left']: `${(currentStep / effectiveSteps.length) * 100}%`,
                top: '-0.25rem',
                transform: 'translateX(-50%)'
              }}></div>
          </motion.div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="md:block hidden">
        <div className="flex flex-col items-center">
          <div className="relative w-full mb-12">
            {/* Background track */}
            <div className="absolute top-7 left-0 w-full h-0.5 bg-gray-200"></div>

            {/* Progress bar */}
            <div className={`absolute top-7 ${isRTL ? 'right-0' : 'left-0'} h-0.5 transition-all duration-500 ease-in-out`}
              style={{
                width: `${(Math.max(0, currentStep - 1) / (effectiveSteps.length - 1)) * 100}%`,
                background: isRTL
                  ? 'linear-gradient(to left, black, #d4af37)'
                  : 'linear-gradient(to right, black, #d4af37)'
              }}></div>

            <div className="flex justify-between relative">
              {effectiveSteps.map((step, index) => {
                const stepNum = index + 1;
                const isActive = currentStep >= stepNum;
                const isCompleted = currentStep > stepNum;

                return (
                  <div key={stepNum} className="flex flex-col items-center relative">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{
                        scale: isActive ? 1 : 0.8,
                        opacity: isActive ? 1 : 0.6
                      }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center justify-center w-14 h-14 rounded-full border-2 shadow-md z-10 
                      ${isCompleted
                          ? 'bg-black border-[#d4af37] text-white'
                          : isActive
                            ? 'bg-white border-black text-black'
                            : 'bg-white border-gray-300 text-gray-400'}`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-[#d4af37]" />
                      ) : (
                        <span className="text-base font-medium">{stepNum}</span>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0.5, y: 10 }}
                      animate={{
                        opacity: isActive ? 1 : 0.6,
                        y: isActive ? 0 : 5
                      }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className={`absolute -bottom-8 whitespace-nowrap text-xs font-medium px-2 py-1 rounded
                      ${isActive
                          ? 'text-black bg-white shadow-sm border border-gray-100'
                          : 'text-gray-500'}`}
                    >
                      {step}
                    </motion.div>

                    {currentStep === stepNum && (
                      <motion.div
                        className="absolute -bottom-2 w-full flex justify-center"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-sm"></div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}