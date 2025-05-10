"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "../../../../components/ui new/sonner";
import CourseStepIndicator from "./CourseStepIndicator";
import CourseFormNavigation from "./CourseFormNavigation";
import CourseBasicInfoStep from "./CourseBasicInfoStep";
import CourseContentStep from "./CourseContentStep";
import CourseMediaStep from "./CourseMediaStep";
import { useTranslation } from "react-i18next";
import { client } from "../../../../lib/sanity";

const FORM_STEPS = [
  "addCourse:basicCourseInformation",
  "addCourse:courseContent",
  "addCourse:mediaMaterials",
];

const defaultFormData = {
  title: "",
  description: "",
  duration: "",
  level: "",
  language: "",
  images: [],
  price: "",
  materials: [],
  category: "",
};

const generateKey = () => {
  return Math.random().toString(36).substr(2, 9);
};

export default function CourseFormWizard() {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== "undefined") {
      const savedStep = localStorage.getItem("courseFormCurrentStep");
      return savedStep ? parseInt(savedStep, 10) : 1;
    }
    return 1;
  });
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [errors, setErrors] = useState({});

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
          console.log("User authenticated:", data.user.id);
          setUserId(data.user.id);
        } else {
          console.error("Authentication failed:", data.error);
          toast.error(t("addCourse:errors.userNotAuthenticated"));
        }
      } catch (error) {
        console.error("Failed to fetch user:", error.message);
        toast.error(t("addCourse:errors.userNotAuthenticated"));
      }
    };
    fetchUser();
  }, [t]);

  useEffect(() => {
    localStorage.setItem("courseFormCurrentStep", currentStep.toString());
  }, [currentStep]);

  const validateFormData = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t("addCourse:errors.titleRequired");
    }
    if (!formData.description.trim()) {
      newErrors.description = t("addCourse:errors.descriptionRequired");
    }
    if (!formData.category) {
      newErrors.category = t("addCourse:errors.categoryRequired");
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      newErrors.price = t("addCourse:errors.priceRequired");
    }
    if (formData.images.length === 0) {
      newErrors.images = t("addCourse:errors.imagesRequired");
    }
    if (formData.materials.length === 0) {
      newErrors.materials = t("addCourse:errors.materialsRequired");
    } else {
      formData.materials.forEach((material, index) => {
        if (material.type === "link" && material.value) {
          try {
            new URL(material.value);
          } catch {
            newErrors[`material_${index}`] = t("addCourse:errors.invalidLink");
          }
        }
      });
    }

    setErrors(newErrors);
    console.log("Validation errors:", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit triggered", { currentStep, totalSteps: FORM_STEPS.length });

    if (currentStep !== FORM_STEPS.length) {
      console.warn("Not on the last step, submission blocked");
      toast.error(t("addCourse:errors.notLastStep"));
      return;
    }

    if (!validateFormData()) {
      console.warn("Validation failed");
      toast.error(t("addCourse:errors.formInvalid"));
      return;
    }

    if (!userId) {
      console.error("No user ID available");
      toast.error(t("addCourse:errors.userNotAuthenticated"));
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting form with data:", formData);

    try {
      // Upload images
      const imageAssets = [];
      for (const image of formData.images) {
        console.log("Uploading image:", image.name);
        const imageAsset = await client.assets.upload("image", image, {
          filename: image.name,
        });
        console.log("Image uploaded:", imageAsset._id);
        imageAssets.push({
          _type: "image",
          _key: generateKey(),
          asset: {
            _type: "reference",
            _ref: imageAsset._id,
          },
        });
      }

      // Upload material files and convert to URLs
      const materialUrls = [];
      for (const material of formData.materials) {
        if (material.type === "file") {
          console.log("Uploading material file:", material.value.name);
          const fileAsset = await client.assets.upload("file", material.value, {
            filename: material.value.name,
          });
          console.log("Material file uploaded:", fileAsset._id);
          // Get the URL of the uploaded file
          if (fileAsset.url) {
            materialUrls.push(fileAsset.url);
          } else {
            console.warn("No URL provided for file asset:", fileAsset._id);
            throw new Error("Failed to get URL for uploaded file");
          }
        } else if (material.type === "link" && material.value.trim()) {
          materialUrls.push(material.value);
        }
      }

      // Prepare course data
      const courseData = {
        _type: "course",
        title: formData.title,
        description: formData.description,
        duration: formData.duration || "",
        level: formData.level || "",
        language: formData.language || "",
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        materials: materialUrls,
        instructor: {
          _type: "reference",
          _ref: userId,
        },
        images: imageAssets,
      };

      console.log("Creating course with data:", courseData);
      const courseResult = await client.create(courseData);
      console.log("Course created:", courseResult._id);

      // Update user's educationalDetails.courses
      try {
        console.log("Updating user's educationalDetails.courses for user:", userId);
        await client
          .patch(userId)
          .setIfMissing({ educationalDetails: { courses: [] } })
          .append("educationalDetails.courses", [
            { _type: "reference", _ref: courseResult._id, _key: generateKey() },
          ])
          .commit();
        console.log("User's educationalDetails.courses updated with course:", courseResult._id);
      } catch (error) {
        console.error("Failed to update user's educationalDetails.courses:", error.message);
        // Log the error but don't fail the submission
        toast.warning(
          `${t("addCourse:errors.userUpdateFailed")}: ${error.message}`
        );
      }

      toast.success(t("addCourse:courseCreatedSuccess"));
      setFormData(defaultFormData);
      localStorage.removeItem("courseFormCurrentStep");
      setCurrentStep(1);
      setErrors({});
    } catch (error) {
      console.error("Error submitting course to Sanity:", error.message);
      toast.error(`${t("addCourse:errors.submissionFailed")}: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CourseBasicInfoStep
            formData={formData}
            setFormData={setFormData}
            setErrors={setErrors}
          />
        );
      case 2:
        return (
          <CourseContentStep
            formData={formData}
            setFormData={setFormData}
            setErrors={setErrors}
          />
        );
      case 3:
        return (
          <CourseMediaStep
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
          {t("addCourse:addNewCourse")}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("addCourse:shareCourseDescription")}
        </p>
      </div>
      <CourseStepIndicator
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
        <CourseFormNavigation
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