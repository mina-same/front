import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import StepIndicator from "./StepIndicator";
import FormStepContent from "./FormStepContent";
import FormNavigation from "./FormNavigation";
import { toast } from "@/components/ui/sonner";
import ServiceFieldsFactory from "./service-fields/ServiceFieldsFactory";
import { addService, fetchCountries, fetchGovernorates, fetchCities } from "@/lib/sanity";
import { ServiceTypeSelector } from "./ServiceTypeSelector";
import { ReviewStep } from "./ReviewStep";
import { SuccessCelebration } from "./SuccessCelebration";

const FORM_STEPS = [
  "Basic Info",
  "Description",
  "Contact & Location",
  "Media & Files",
  "Service Type",
  "Pricing",
  "Review & Submit",
];

const ServiceFormWizard = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [animateDirection, setAnimateDirection] = useState("next");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTips, setShowTips] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    years_of_experience: "",
    about_ar: "",
    about_en: "",
    past_experience_ar: "",
    past_experience_en: "",
    servicePhone: "",
    serviceEmail: "",
    country: "",
    governorate: "",
    city: "",
    address_details: "",
    address_link: "",
    social_links: Array(3)
      .fill(null)
      .map(() => ({ url: "", linkType: "website" })),
    images: [],
    service_type: "",
    service_details: {},
    price: "",
    priceUnit: "per_hour",
  });

  const fileInputRef = useRef(null);
  const additionalImagesRef = useRef(null);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const [autoSaved, setAutoSaved] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleCountryChange = (value) => {
    setSelectedCountry(value);
    setFormData((prev) => ({
      ...prev,
      country: value,
      governorate: "",
      city: "",
    }));
  };

  const handleGovernorateChange = (value) => {
    setSelectedGovernorate(value);
    setFormData((prev) => ({
      ...prev,
      governorate: value,
      city: "",
    }));
  };

  const handleCityChange = (value) => {
    setSelectedCity(value);
    setFormData((prev) => ({
      ...prev,
      city: value,
    }));
  };

  useEffect(() => {
    console.log("Fetching countries");
    fetchCountries()
      .then((data) => {
        if (data && data.length > 0) {
          console.log("Countries data received:", data);
          setCountries(data);
        }
      })
      .catch((error) => console.error("Error fetching countries:", error));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      console.log("Fetching governorates for country:", selectedCountry);
      setGovernorates([]);
      setCities([]);

      fetchGovernorates(selectedCountry)
        .then((data) => {
          if (data && data.length > 0) {
            console.log("Governorates data received:", data);
            setGovernorates(data);
          } else {
            console.log("No governorates received for country:", selectedCountry);
            setGovernorates([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching governorates:", error);
          setGovernorates([]);
        });

      setSelectedGovernorate("");
      setFormData((prev) => ({
        ...prev,
        governorate: "",
        city: "",
      }));
      setSelectedCity("");
    } else {
      setGovernorates([]);
      setCities([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedGovernorate) {
      console.log("Fetching cities for governorate:", selectedGovernorate);
      setCities([]);
      fetchCities(selectedGovernorate)
        .then((data) => {
          if (data && data.length > 0) {
            console.log("Cities data received:", data);
            setCities(data);
          } else {
            console.log("No cities received for governorate:", selectedGovernorate);
            setCities([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching cities:", error);
          setCities([]);
        });

      setSelectedCity("");
      setFormData((prev) => ({
        ...prev,
        city: "",
      }));
    } else {
      setCities([]);
    }
  }, [selectedGovernorate]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (Object.keys(formData).some((key) => formData[key])) {
        localStorage.setItem("serviceFormDraft", JSON.stringify(formData));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 3000);
      }
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  useEffect(() => {
    const savedDraft = localStorage.getItem("serviceFormDraft");
    if (savedDraft) {
      try {
        const parsedData = JSON.parse(savedDraft);
        setFormData((prev) => ({
          ...prev,
          ...parsedData,
          social_links:
            parsedData.social_links && parsedData.social_links.length >= 3
              ? parsedData.social_links
              : Array(3)
                  .fill(null)
                  .map((_, i) =>
                    parsedData.social_links && parsedData.social_links[i]
                      ? parsedData.social_links[i]
                      : { url: "", linkType: "website" }
                  ),
        }));
        if (parsedData.country) setSelectedCountry(parsedData.country);
        if (parsedData.governorate) setSelectedGovernorate(parsedData.governorate);
        if (parsedData.city) setSelectedCity(parsedData.city);

        if (parsedData.imageUrl) setImagePreview(parsedData.imageUrl);
        if (
          parsedData.additionalImageUrls &&
          Array.isArray(parsedData.additionalImageUrls)
        ) {
          setAdditionalImagePreviews(parsedData.additionalImageUrls);
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, []);

  const toggleTip = (field) => {
    setShowTips((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      if (e.target.name === "profile_image") {
        const file = files[0];
        const imageUrl = URL.createObjectURL(file);

        setFormData((prev) => {
          const newImages = [...prev.images];
          newImages[0] = file;

          return {
            ...prev,
            images: newImages,
          };
        });

        setImagePreview(imageUrl);
      } else if (e.target.name === "images") {
        const newPreviews = files.map((file) => URL.createObjectURL(file));

        setFormData((prev) => {
          const profileImage = prev.images.length > 0 ? [prev.images[0]] : [];
          return {
            ...prev,
            images: [...profileImage, ...files],
          };
        });

        setAdditionalImagePreviews((prev) => [...prev, ...newPreviews]);
      }
    }
  };

  const removeProfileImage = () => {
    setImagePreview(null);

    setFormData((prev) => {
      const newImages = [...prev.images];
      if (newImages.length > 0) {
        newImages.shift();
      }
      return {
        ...prev,
        images: newImages,
      };
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImagePreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    setFormData((prev) => {
      const newImages = [...prev.images];
      newImages.splice(index + 1, 1);
      return {
        ...prev,
        images: newImages,
      };
    });
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...formData.social_links];
    newLinks[index] = {
      ...newLinks[index],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, social_links: newLinks }));
  };

  const addLink = () => {
    setFormData((prev) => ({
      ...prev,
      social_links: [...prev.social_links, { url: "", linkType: "website" }],
    }));
  };

  const removeLink = (index) => {
    if (formData.social_links.length > 3) {
      const newLinks = formData.social_links.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, social_links: newLinks }));
    } else {
      toast.error("You must have at least 3 social links");
    }
  };

  const handleNestedChange = (category, field, value) => {
    setFormData((prev) => {
      const updatedServiceDetails = { ...prev.service_details };

      if (!updatedServiceDetails[category]) {
        updatedServiceDetails[category] = {};
      }

      if (field === "") {
        updatedServiceDetails[category] = value;
      } else {
        updatedServiceDetails[category] = {
          ...updatedServiceDetails[category],
          [field]: value,
        };
      }

      return {
        ...prev,
        service_details: updatedServiceDetails,
      };
    });
  };

  const handleNestedArrayChange = (category, index, field, value) => {
    const categoryParts = category.split(".");
    const mainCategory = categoryParts[0];
    const arrayField = categoryParts[1] || "items";

    const categoryData = formData.service_details[mainCategory] || {};
    const items = [...(categoryData[arrayField] || [])];

    if (!items[index]) {
      items[index] = {};
    }

    items[index][field] = value;

    handleNestedChange(mainCategory, arrayField, items);
  };

  const addNestedArrayItem = (category) => {
    const categoryParts = category.split(".");
    const mainCategory = categoryParts[0];
    const arrayField = categoryParts[1] || "items";

    const categoryData = formData.service_details[mainCategory] || {};
    const items = [...(categoryData[arrayField] || []), {}];

    handleNestedChange(mainCategory, arrayField, items);
  };

  const removeNestedArrayItem = (category, index) => {
    const categoryParts = category.split(".");
    const mainCategory = categoryParts[0];
    const arrayField = categoryParts[1] || "items";

    const categoryData = formData.service_details[mainCategory] || {};
    const items = (categoryData[arrayField] || []).filter((_, i) => i !== index);

    handleNestedChange(mainCategory, arrayField, items);
  };

  const getServiceTypeLabel = (type) => {
    const serviceTypesMap = {
      horse_stable: "Horse Stable",
      veterinary: "Veterinary Services",
      competitions: "Horse Competitions",
      housing: "Horse Housing",
      horse_trainer: "Horse Trainer",
      hoof_trimmer: "Hoof Trimmer",
      horse_grooming: "Horse Grooming",
      event_judging: "Event Judging",
      marketing_promotion: "Marketing & Promotion",
      event_commentary: "Event Commentary",
      consulting_services: "Consulting Services",
      photography_services: "Photography Services",
      horse_transport: "Horse Transport",
      contractors: "Contractors",
      horse_catering: "Horse Catering",
      trip_coordinator: "Trip Coordinator",
    };

    return serviceTypesMap[type] || type;
  };

  const getPriceUnitLabel = (unit) => {
    const priceUnitMap = {
      per_half_hour: "Per Half-Hour",
      per_hour: "Per Hour",
      per_day: "Per Day",
      per_project: "Per Project",
      USD: "USD",
      EUR: "EUR",
      AED: "AED",
      SAR: "SAR",
    };

    return priceUnitMap[unit] || unit;
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.name_ar) newErrors.name_ar = "Service name in Arabic is required";
        if (!formData.name_en) newErrors.name_en = "Service name in English is required";
        if (!formData.years_of_experience)
          newErrors.years_of_experience = "Years of experience is required";
        break;

      case 2:
        if (!formData.about_ar || formData.about_ar.length < 50)
          newErrors.about_ar = "Description in Arabic must be at least 50 characters";
        if (!formData.about_en || formData.about_en.length < 50)
          newErrors.about_en = "Description in English must be at least 50 characters";
        if (!formData.past_experience_ar)
          newErrors.past_experience_ar = "Past experience in Arabic is required";
        if (!formData.past_experience_en)
          newErrors.past_experience_en = "Past experience in English is required";
        break;

      case 3:
        if (!formData.servicePhone)
          newErrors.servicePhone = "Service phone number is required";
        if (!formData.serviceEmail) newErrors.serviceEmail = "Service email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.serviceEmail))
          newErrors.serviceEmail = "Invalid email format";

        if (!selectedCountry) newErrors.country = "Country is required";
        if (selectedCountry && !selectedGovernorate)
          newErrors.governorate = "Governorate is required";
        if (selectedGovernorate && !selectedCity) newErrors.city = "City is required";
        if (!formData.address_details)
          newErrors.address_details = "Address details are required";
        break;

      case 4:
        if (!formData.images || formData.images.length === 0)
          newErrors.images = "At least one image is required";

        const validLinks = formData.social_links.filter(
          (link) => link.url.trim() !== ""
        );
        if (validLinks.length < 3) {
          newErrors.social_links = "At least 3 social links are required";
        }

        formData.social_links.forEach((link, index) => {
          if (link.url.trim() !== "" && !isValidUrl(link.url)) {
            newErrors[`social_link_${index}`] = "Invalid URL format";
          }
        });
        break;

      case 5:
        if (!formData.service_type) newErrors.service_type = "Service type is required";
        break;

      case 6:
        if (!formData.price || isNaN(Number(formData.price)))
          newErrors.price = "Valid price is required";
        if (!formData.priceUnit) newErrors.priceUnit = "Price unit is required";
        break;

      case 7:
        if (!formData.name_ar) newErrors.name_ar = "Service name in Arabic is required";
        if (!formData.name_en) newErrors.name_en = "Service name in English is required";
        if (!formData.years_of_experience)
          newErrors.years_of_experience = "Years of experience is required";
        if (!formData.about_ar || formData.about_ar.length < 50)
          newErrors.about_ar = "Description in Arabic must be at least 50 characters";
        if (!formData.about_en || formData.about_en.length < 50)
          newErrors.about_en = "Description in English must be at least 50 characters";
        if (!formData.past_experience_ar)
          newErrors.past_experience_ar = "Past experience in Arabic is required";
        if (!formData.past_experience_en)
          newErrors.past_experience_en = "Past experience in English is required";
        if (!formData.servicePhone)
          newErrors.servicePhone = "Service phone number is required";
        if (!formData.serviceEmail) newErrors.serviceEmail = "Service email is required";
        if (!formData.country) newErrors.country = "Country is required";
        if (!formData.governorate) newErrors.governorate = "Governorate is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.images || formData.images.length === 0)
          newErrors.images = "At least one image is required";
        if (!formData.service_type) newErrors.service_type = "Service type is required";
        if (!formData.price || isNaN(Number(formData.price)))
          newErrors.price = "Valid price is required";
        if (!formData.priceUnit) newErrors.priceUnit = "Price unit is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setAnimateDirection("next");
      setCurrentStep((prev) => Math.min(prev + 1, FORM_STEPS.length));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please correct the errors before proceeding");
    }
  };

  const prevStep = () => {
    setAnimateDirection("prev");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prepareSubmitData = () => {
    const imagesWithKeys = formData.images.map((file, index) => {
      return {
        file,
        _key: `image-${Date.now()}-${index}`,
      };
    });

    const submitData = {
      name_ar: formData.name_ar,
      name_en: formData.name_en,
      years_of_experience: parseInt(formData.years_of_experience),
      about_ar: formData.about_ar,
      about_en: formData.about_en,
      past_experience_ar: formData.past_experience_ar,
      past_experience_en: formData.past_experience_en,
      servicePhone: formData.servicePhone,
      serviceEmail: formData.serviceEmail,
      country: formData.country,
      governorate: formData.governorate,
      city: formData.city,
      address_details: formData.address_details,
      address_link: formData.address_link,
      links: formData.social_links
        .filter((link) => link.url.trim() !== "")
        .map((link) => ({
          url: link.url,
          linkType: link.linkType,
        })),
      price: formData.price ? parseFloat(formData.price) : undefined,
      priceUnit: formData.priceUnit,
      service_type: formData.service_type,
      images: imagesWithKeys.map((item) => item.file),
      service_details: formData.service_details,
    };

    return submitData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      toast.error("Please correct the errors before submitting");
      return;
    }

    setSubmitting(true);

    try {
      const submitData = prepareSubmitData();
      toast.info("Submitting service...", {
        description: "Please wait while we process your submission.",
      });

      console.log("Prepared submit data:", submitData);

      const result = await addService(submitData);

      if (result.success) {
        localStorage.removeItem("serviceFormDraft");
        setShowCelebration(true);

        setTimeout(() => {
          setShowCelebration(false);
          router.push("/");
        }, 3000);
      } else {
        toast.error("Failed to add service", {
          description:
            result.error || "There was a problem submitting your service. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred", {
        description:
          error.message || "Something went wrong while submitting your service.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderServiceTypeStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Select Service Type</h3>
      <ServiceTypeSelector
        selectedType={formData.service_type}
        onSelect={(type) => handleChange({ target: { name: "service_type", value: type } })}
      />
      {formData.service_type && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-6 pb-2 border-b">
            Additional Information for {getServiceTypeLabel(formData.service_type)}
          </h3>
          <ServiceFieldsFactory
            serviceType={formData.service_type}
            formData={formData}
            handleNestedChange={handleNestedChange}
            handleNestedArrayChange={handleNestedArrayChange}
            addNestedArrayItem={addNestedArrayItem}
            removeNestedArrayItem={removeNestedArrayItem}
            handleChange={handleChange}
            errors={errors}
            isRTL={false}
          />
        </div>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <ReviewStep
      formData={formData}
      getServiceTypeLabel={getServiceTypeLabel}
      getPriceUnitLabel={getPriceUnitLabel}
      additionalImagePreviews={additionalImagePreviews}
      imagePreview={imagePreview}
    />
  );

  const renderContent = () => {
    if (currentStep === 5) {
      return renderServiceTypeStep();
    }
    if (currentStep === 7) {
      return renderReviewStep();
    }
    return (
      <FormStepContent
        key={`step-${currentStep}`}
        step={currentStep}
        animateDirection={animateDirection}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        showTips={showTips}
        toggleTip={toggleTip}
        handleChange={handleChange}
        handleFileChange={handleFileChange}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        fileInputRef={fileInputRef}
        handleLinkChange={handleLinkChange}
        addLink={addLink}
        removeLink={removeLink}
        selectedCountry={selectedCountry}
        selectedGovernorate={selectedGovernorate}
        selectedCity={selectedCity}
        countries={countries}
        governorates={governorates}
        cities={cities}
        handleCountryChange={handleCountryChange}
        handleGovernorateChange={handleGovernorateChange}
        handleCityChange={handleCityChange}
        isRTL={false}
        handleNestedChange={handleNestedChange}
        handleNestedArrayChange={handleNestedArrayChange}
        addNestedArrayItem={addNestedArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        getServiceTypeLabel={getServiceTypeLabel}
        getPriceUnitLabel={getPriceUnitLabel}
        additionalImagePreviews={additionalImagePreviews}
        removeProfileImage={removeProfileImage}
        removeAdditionalImage={removeAdditionalImage}
      />
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container max-w-4xl py-8 px-4 sm:px-6">
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Add Your Service</h1>
          <p className="text-muted-foreground text-lg">
            Complete all steps to create your professional service listing
          </p>
          {autoSaved && (
            <div className="mt-2 text-sm text-green-600">Draft auto-saved</div>
          )}
        </div>

        <StepIndicator currentStep={currentStep} steps={FORM_STEPS} />

        <div className="mt-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-xl border border-border/40 p-6 shadow-sm">
              <AnimatePresence mode="wait" initial={false}>
                {renderContent()}
              </AnimatePresence>
            </div>

            <FormNavigation
              currentStep={currentStep}
              totalSteps={FORM_STEPS.length}
              nextStep={nextStep}
              prevStep={prevStep}
              isLastStep={currentStep === FORM_STEPS.length}
              isSubmitting={submitting}
            />
          </form>
        </div>

        {showCelebration && <SuccessCelebration />}
      </div>
    </div>
  );
};

export default ServiceFormWizard;