import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { client } from "@/lib/sanity";
import StableStepIndicator from "./StableStepIndicator";
import StableFormNavigation from "./StableFormNavigation";
import StableBasicInfoStep from "./StableBasicInfoStep";
import StableLocationContactStep from "./StableLocationContactStep";
import StableDetailsStep from "./StableDetailsStep";
import StableMediaStep from "./StableMediaStep";

export default function StableFormWizard() {
  const { t } = useTranslation("addStable");
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userId, setUserId] = useState(null); // Add state for userId
  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    about_ar: "",
    about_en: "",
    yearsOfExperience: "",
    pastExperience_ar: "",
    pastExperience_en: "",
    country: null,
    governorate: null,
    city: null,
    address_details: "",
    address_link: "",
    servicePhone: "",
    serviceEmail: "",
    links: [],
    dateOfEstablishment: "",
    kindOfStable: [],
    stableDescription: "",
    boardingCapacity: "",
    boardingDetails: {
      boardingPrice: "",
      boardingPriceUnit: "",
      additionalServices: [],
    },
    images: [],
    licensesAndCertificates: [],
  });
  const [errors, setErrors] = useState({});

  // Fetch userId on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (response.ok && data.authenticated) {
          setUserId(data.user.id);
        } else {
          throw new Error(t('addStable:unauthenticated'));
        }
      } catch (error) {
        console.error('Failed to fetch userId:', error);
        toast.error(t('addStable:unauthenticated'));
        router.push('/login');
      }
    };
    fetchUserId();
  }, [router, t]);

  const totalSteps = 4;
  const steps = [
    t("basicInformation"),
    t("locationContact"),
    t("stableDetails"),
    t("mediaUpload"),
  ];

  const validateBasicInfo = (data, t, setErrors) => {
    const stepErrors = {};
    if (!data.name_ar.trim()) stepErrors.name_ar = t("errors.nameArRequired");
    if (!data.name_en.trim()) stepErrors.name_en = t("errors.nameEnRequired");
    if (!data.about_ar.trim()) stepErrors.about_ar = t("errors.aboutArRequired");
    if (!data.about_en.trim()) stepErrors.about_en = t("errors.aboutEnRequired");
    if (!data.yearsOfExperience || isNaN(parseInt(data.yearsOfExperience)) || parseInt(data.yearsOfExperience) <= 0) {
      stepErrors.yearsOfExperience = t("errors.yearsOfExperienceRequired");
    }
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const validateLocationContact = (data, t, setErrors) => {
    const stepErrors = {};
    if (!data.country) stepErrors.country = t("errors.countryRequired");
    if (!data.governorate) stepErrors.governorate = t("errors.governorateRequired");
    if (!data.city) stepErrors.city = t("errors.cityRequired");
    if (!data.servicePhone.trim()) stepErrors.servicePhone = t("errors.servicePhoneRequired");
    if (!data.serviceEmail.trim()) stepErrors.serviceEmail = t("errors.serviceEmailRequired");
    if (data.address_link && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(data.address_link)) {
      stepErrors.address_link = t("errors.invalidLink");
    }
    data.links.forEach((link, index) => {
      if (!link.url) stepErrors[`link_url_${index}`] = t("errors.invalidLink");
      else if (!/^https?:\/\/[^\s$.?#].[^\s]*$/.test(link.url)) {
        stepErrors[`link_url_${index}`] = t("errors.invalidLink");
      }
      if (!link.linkType) stepErrors[`link_type_${index}`] = t("errors.linkTypeRequired");
    });
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const validateDetails = (data, t, setErrors) => {
    const stepErrors = {};
    if (!data.dateOfEstablishment) {
      stepErrors.dateOfEstablishment = t("errors.dateOfEstablishmentRequired");
    }
    if (data.kindOfStable.length === 0) {
      stepErrors.kindOfStable = t("errors.kindOfStableRequired");
    }
    if (!data.stableDescription.trim()) {
      stepErrors.stableDescription = t("errors.stableDescriptionRequired");
    }
    if (!data.boardingCapacity || isNaN(parseInt(data.boardingCapacity))) {
      stepErrors.boardingCapacity = t("errors.boardingCapacityRequired");
    }
    if (!data.boardingDetails.boardingPrice || isNaN(parseFloat(data.boardingDetails.boardingPrice))) {
      stepErrors.boardingPrice = t("errors.boardingPriceRequired");
    }
    if (!data.boardingDetails.boardingPriceUnit) {
      stepErrors.boardingPriceUnit = t("errors.boardingPriceUnitRequired");
    }
    data.boardingDetails.additionalServices.forEach((service, index) => {
      if (!service.name_ar.trim()) {
        stepErrors[`service_name_ar_${index}`] = t("errors.serviceNameArRequired");
      }
      if (!service.name_en.trim()) {
        stepErrors[`service_name_en_${index}`] = t("errors.serviceNameEnRequired");
      }
      if (!service.price || isNaN(parseFloat(service.price))) {
        stepErrors[`service_price_${index}`] = t("errors.servicePriceRequired");
      }
    });
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const validateMedia = (data, t, setErrors) => {
    const stepErrors = {};
    if (data.images.length === 0) stepErrors.images = t("errors.imagesRequired");
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = validateBasicInfo(formData, t, setErrors);
    } else if (currentStep === 2) {
      isValid = validateLocationContact(formData, t, setErrors);
    } else if (currentStep === 3) {
      isValid = validateDetails(formData, t, setErrors);
    } else if (currentStep === 4) {
      isValid = validateMedia(formData, t, setErrors);
    }

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    } else if (!isValid) {
      toast.error(t("errors.formInvalid"));
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error(t("addStable:unauthenticated"));
      return;
    }
    setIsSubmitting(true);

    try {
      // Validate all steps
      const isBasicInfoValid = validateBasicInfo(formData, t, setErrors);
      const isLocationContactValid = validateLocationContact(formData, t, setErrors);
      const isDetailsValid = validateDetails(formData, t, setErrors);
      const isMediaValid = validateMedia(formData, t, setErrors);

      if (!isBasicInfoValid || !isLocationContactValid || !isDetailsValid || !isMediaValid) {
        toast.error(t("errors.formInvalid"));
        setIsSubmitting(false);
        return;
      }

      // Validate numeric fields
      const yearsOfExperience = parseInt(formData.yearsOfExperience, 10);
      const boardingCapacity = parseInt(formData.boardingCapacity, 10);
      const boardingPrice = parseFloat(formData.boardingDetails.boardingPrice);

      if (isNaN(yearsOfExperience) || yearsOfExperience <= 0) {
        toast.error(t("errors.yearsOfExperienceRequired"));
        setIsSubmitting(false);
        return;
      }
      if (isNaN(boardingCapacity) || boardingCapacity < 1) {
        toast.error(t("errors.boardingCapacityRequired"));
        setIsSubmitting(false);
        return;
      }
      if (isNaN(boardingPrice) || boardingPrice < 0) {
        toast.error(t("errors.boardingPriceRequired"));
        setIsSubmitting(false);
        return;
      }

      // Upload images to Sanity
      const uploadedImages = [];
      for (let index = 0; index < formData.images.length; index++) {
        const image = formData.images[index];
        if (image instanceof File) {
          try {
            const asset = await client.assets.upload("image", image, {
              filename: image.name,
            });
            uploadedImages.push({
              _type: "image",
              _key: `image-${index}-${Date.now()}`,
              asset: { _type: "reference", _ref: asset._id },
            });
          } catch (error) {
            throw new Error(`Image upload failed for ${image.name}: ${error.message}`);
          }
        }
      }

      // Upload licenses and certificates to Sanity
      const uploadedCertificates = [];
      for (let index = 0; index < formData.licensesAndCertificates.length; index++) {
        const file = formData.licensesAndCertificates[index];
        if (file instanceof File) {
          try {
            const asset = await client.assets.upload("file", file, {
              filename: file.name,
            });
            uploadedCertificates.push({
              _type: "file",
              _key: `file-${index}-${Date.now()}`,
              asset: { _type: "reference", _ref: asset._id },
            });
          } catch (error) {
            throw new Error(`File upload failed for ${file.name}: ${error.message}`);
          }
        }
      }

      // Prepare stable document matching the 'stables' schema
      const stableDoc = {
        _type: "stables",
        statusAdminApproved: false,
        userRef: { _type: "reference", _ref: userId }, // Add userRef
        name_ar: formData.name_ar.trim(),
        name_en: formData.name_en.trim(),
        about_ar: formData.about_ar.trim(),
        about_en: formData.about_en.trim(),
        years_of_experience: yearsOfExperience,
        past_experience_ar: formData.pastExperience_ar.trim() || "",
        past_experience_en: formData.pastExperience_en.trim() || "",
        country: formData.country
          ? { _type: "reference", _ref: formData.country._id }
          : null,
        government: formData.governorate
          ? { _type: "reference", _ref: formData.governorate._id }
          : null,
        city: formData.city
          ? { _type: "reference", _ref: formData.city._id }
          : null,
        address_details: formData.address_details.trim() || "",
        address_link: formData.address_link.trim() || "",
        servicePhone: formData.servicePhone.trim(),
        serviceEmail: formData.serviceEmail.trim(),
        links: formData.links.map((link, index) => ({
          _key: `link-${index}-${Date.now()}`,
          url: link.url.trim(),
          linkType: link.linkType,
        })),
        dateOfEstablishment: formData.dateOfEstablishment || null,
        kindOfStable: formData.kindOfStable,
        stableDescription: formData.stableDescription.trim(),
        boardingCapacity: boardingCapacity,
        boardingDetails: {
          boardingPrice: boardingPrice,
          boardingPriceUnit: formData.boardingDetails.boardingPriceUnit,
          additionalServices: formData.boardingDetails.additionalServices.map(
            (service, index) => ({
              _key: `service-${index}-${Date.now()}`,
              name_ar: service.name_ar.trim(),
              name_en: service.name_en.trim(),
              price: parseFloat(service.price) || 0,
            })
          ),
        },
        images: uploadedImages,
        licensesAndCertificates: uploadedCertificates,
        serviceAverageRating: 0,
        serviceRatingCount: 0,
        horses: [],
        fullTimeServices: [],
        freelancerServices: [],
      };

      // Create stable document in Sanity
      await client.create(stableDoc);
      toast.success(t("errors.stableCreatedSuccess"));
      setIsSubmitted(true);

      // Redirect to profile page
      router.push("/profile?tab=stable-owner");
    } catch (error) {
      console.error("Submission error:", error);
      let errorMessage = t("errors.submissionFailed");
      if (error.message.includes("Image upload failed")) {
        errorMessage = t("errors.imageUploadFailed");
      } else if (error.message.includes("File upload failed")) {
        errorMessage = t("errors.fileUploadFailed");
      } else if (error.message.includes("Insufficient permissions")) {
        errorMessage = t("errors.insufficientPermissions");
      }
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StableBasicInfoStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 2:
        return (
          <StableLocationContactStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 3:
        return (
          <StableDetailsStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 4:
        return (
          <StableMediaStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        {t("addStable")}
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        {t("shareStableDescription")}
      </p>

      <StableStepIndicator currentStep={currentStep} steps={steps} />

      <form onSubmit={handleSubmit}>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="step-content"
        >
          {renderStep()}
        </motion.div>

        <StableFormNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onPrev={handlePrevious}
          onNext={handleNext}
          isLastStep={currentStep === totalSteps}
          isSubmitting={isSubmitting}
          isSubmitted={isSubmitted}
          formData={formData}
          setErrors={setErrors}
          onSubmit={handleSubmit}
        />
      </form>
    </div>
  );
}