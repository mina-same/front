"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "../../../../components/ui new/sonner";
import BookStepIndicator from "./BookStepIndicator";
import BookFormNavigation from "./BookFormNavigation";
import BookBasicInfoStep from "./BookBasicInfoStep";
import BookMediaStep from "./BookMediaStep";
import BookPricingStep from "./BookPricingStep";
import { useTranslation } from "react-i18next";
import { client } from "../../../../lib/sanity";

// Utility function to generate a unique key
const generateKey = () => {
  return Math.random().toString(36).substr(2, 9);
};

const FORM_STEPS = [
  "addBook:basicBookInformation",
  "addBook:mediaFileUpload",
  "addBook:pricingCategory",
];

const defaultFormData = {
  title: "",
  description: "",
  file: null,
  accessLink: "",
  price: "",
  language: "",
  images: [],
  category: "",
};

export default function BookFormWizard() {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== "undefined") {
      const savedStep = localStorage.getItem("bookFormCurrentStep");
      return savedStep ? parseInt(savedStep, 10) : 1;
    }
    return 1;
  });
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch authenticated user ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (response.ok && data.authenticated) {
          setUserId(data.user.id);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    localStorage.setItem("bookFormCurrentStep", currentStep.toString());
  }, [currentStep]);

  const validateFormData = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t("addBook:errors.titleRequired");
    }
    if (!formData.description.trim()) {
      newErrors.description = t("addBook:errors.descriptionRequired");
    }
    if (!formData.category) {
      newErrors.category = t("addBook:errors.categoryRequired");
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      newErrors.price = t("addBook:errors.priceRequired");
    }
    if (formData.images.length === 0) {
      newErrors.images = t("addBook:errors.imagesRequired");
    }
    if (!formData.file && !formData.accessLink) {
      newErrors.file = t("addBook:errors.fileOrLinkRequired");
      newErrors.accessLink = t("addBook:errors.fileOrLinkRequired");
    }
    if (formData.file && formData.accessLink) {
      newErrors.file = t("addBook:errors.fileOrLinkExclusive");
      newErrors.accessLink = t("addBook:errors.fileOrLinkExclusive");
    }
    if (formData.accessLink) {
      try {
        new URL(formData.accessLink);
      } catch {
        newErrors.accessLink = t("addBook:errors.invalidLink");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep !== FORM_STEPS.length) {
      return;
    }

    // Validate form data
    if (!validateFormData()) {
      toast.error(t("addBook:errors.formInvalid"));
      return;
    }

    // Ensure user ID is available
    if (!userId) {
      toast.error(t("addBook:errors.userNotAuthenticated"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload file to Sanity (PDF or EPUB)
      let fileAsset = null;
      if (formData.file) {
        fileAsset = await client.assets.upload("file", formData.file, {
          filename: formData.file.name,
        });
      }

      // Upload images to Sanity
      const imageAssets = [];
      for (const image of formData.images) {
        const imageAsset = await client.assets.upload("image", image, {
          filename: image.name,
        });
        imageAssets.push({
          _type: "image",
          _key: generateKey(),
          asset: {
            _type: "reference",
            _ref: imageAsset._id,
          },
        });
      }

      // Create book document
      const bookData = {
        _type: "book",
        title: formData.title,
        description: formData.description,
        language: formData.language || "",
        accessLink: formData.accessLink || "",
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        author: {
          _type: "reference",
          _ref: userId,
        },
        file: fileAsset
          ? {
              _type: "file",
              asset: {
                _type: "reference",
                _ref: fileAsset._id,
              },
            }
          : null,
        images: imageAssets,
      };

      // Save book to Sanity
      await client.create(bookData);

      // Success
      toast.success(t("addBook:bookCreatedSuccess"));
      setFormData(defaultFormData);
      localStorage.removeItem("bookFormCurrentStep");
      setCurrentStep(1);
      setErrors({});
    } catch (error) {
      console.error("Error submitting book to Sanity:", error);
      toast.error(t("addBook:errors.submissionFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BookBasicInfoStep
            formData={formData}
            setFormData={setFormData}
            setErrors={setErrors}
          />
        );
      case 2:
        return (
          <BookMediaStep
            formData={formData}
            setFormData={setFormData}
            setErrors={setErrors}
          />
        );
      case 3:
        return (
          <BookPricingStep
            formData={formData}
            setFormData={setFormData}
            setErrors={setErrors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`container max-w-4xl py-8 px-4 sm:px-6 ${
        i18n.language === "ar" ? "rtl" : "ltr"
      }`}
    >
      <div className="container mb-10 flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">
          {t("addBook:addNewBook")}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("addBook:shareBookDescription")}
        </p>
      </div>
      <BookStepIndicator
        currentStep={currentStep}
        steps={FORM_STEPS.map((step) => t(step))}
      />
      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-12"
        encType="multipart/form-data"
      >
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: i18n.language === "ar" ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: i18n.language === "ar" ? -30 : 30 }}
              transition={{ duration: 0.35 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
        <BookFormNavigation
          currentStep={currentStep}
          totalSteps={FORM_STEPS.length}
          onPrev={() => setCurrentStep((s) => Math.max(s - 1, 1))}
          onNext={() => setCurrentStep((s) => Math.min(s + 1, FORM_STEPS.length))}
          isLastStep={currentStep === FORM_STEPS.length}
          isSubmitting={isSubmitting}
          formData={formData}
          setErrors={setErrors}
        />
      </form>
    </div>
  );
}
