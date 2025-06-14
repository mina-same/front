import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import StepIndicator from "./StepIndicator";
import FormStepContent from "./FormStepContent";
import FormNavigation from "./FormNavigation";
import { toast } from "@/components/ui/sonner";
import ServiceFieldsFactory from "./service-fields/ServiceFieldsFactory";
import {
  addService,
  fetchCountries,
  fetchGovernorates,
  fetchCities,
} from "@/lib/sanity";
import { ServiceTypeSelector } from "./ServiceTypeSelector";
import { ReviewStep } from "./ReviewStep";
import { SuccessCelebration } from "./SuccessCelebration";

const FORM_STEPS = [
  "Service Management",
  "Basic Info",
  "Description",
  "Contact & Location",
  "Media & Files",
  "Service Type",
  "Pricing",
  "Review & Submit",
];

const serviceDetailKeyMap = {
  horse_stable: "horseStabelDetails",
  veterinary: "VeterinaryDetails",
  competitions: "competitions",
  housing: "housingDetails",
  trip_coordinator: "tripCoordinator",
  horse_catering: "horseCateringDetails",
  horse_transport: "transportDetails",
  contractors: "contractorsDetails",
  horse_trainer: "horseTrainerDetails",
  hoof_trimmer: "hoofTrimmerDetails",
  horse_grooming: "horseGroomingDetails",
  event_judging: "eventJudgingDetails",
  marketing_promotion: "marketingPromotionDetails",
  event_commentary: "eventCommentaryDetails",
  consulting_services: "consultingServicesDetails",
  photography_services: "photographyServicesDetails",
  suppliers: "supplierDetails",
};

const ServiceFormWizard = ({userId, userType, userStable}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [animateDirection, setAnimateDirection] = useState("next");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTips, setShowTips] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    serviceManagementType: "",
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
    // Ensure we're only using the ID string, not a DOM element
    const countryId = typeof value === 'object' ? value.target?.value : value;
    setSelectedCountry(countryId);
    setFormData((prev) => ({
      ...prev,
      country: countryId,
      governorate: "",
      city: "",
    }));
  };

  const handleGovernorateChange = (value) => {
    // Ensure we're only using the ID string, not a DOM element
    const governorateId = typeof value === 'object' ? value.target?.value : value;
    setSelectedGovernorate(governorateId);
    setFormData((prev) => ({
      ...prev,
      governorate: governorateId,
      city: "",
    }));
  };

  const handleCityChange = (value) => {
    // Ensure we're only using the ID string, not a DOM element
    const cityId = typeof value === 'object' ? value.target?.value : value;
    setSelectedCity(cityId);
    setFormData((prev) => ({
      ...prev,
      city: cityId,
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
            console.log(
              "No governorates received for country:",
              selectedCountry
            );
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
            console.log(
              "No cities received for governorate:",
              selectedGovernorate
            );
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
        if (parsedData.governorate)
          setSelectedGovernorate(parsedData.governorate);
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

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      if (type === "profile") {
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
      } else if (type === "additional") {
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
    const items = (categoryData[arrayField] || []).filter(
      (_, i) => i !== index
    );

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
      suppliers: "Suppliers",
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
        // Service Management Type validation
        // If userType is provided, we'll skip this validation as it's auto-set
        if (!userType && !formData.serviceManagementType) {
          newErrors.serviceManagementType = "Service management type is required";
        }
        break;
      case 2:
        // Basic Info validation
        if (!formData.name_en) {
          newErrors.name_en = "English name is required";
        } else if (formData.name_en.length < 3) {
          newErrors.name_en = "Name must be at least 3 characters";
        }

        if (!formData.name_ar) {
          newErrors.name_ar = "Arabic name is required";
        } else if (formData.name_ar.length < 3) {
          newErrors.name_ar = "Name must be at least 3 characters";
        }

        if (!formData.years_of_experience) {
          newErrors.years_of_experience = "Years of experience is required";
        } else if (isNaN(formData.years_of_experience)) {
          newErrors.years_of_experience = "Years of experience must be a number";
        }
        break;

      case 3:
        // Description validation
        if (!formData.about_ar || formData.about_ar.length < 50) {
          newErrors.about_ar = "Description in Arabic must be at least 50 characters";
        }
        if (!formData.about_en || formData.about_en.length < 50) {
          newErrors.about_en = "Description in English must be at least 50 characters";
        }
        if (!formData.past_experience_ar) {
          newErrors.past_experience_ar = "Past experience in Arabic is required";
        }
        if (!formData.past_experience_en) {
          newErrors.past_experience_en = "Past experience in English is required";
        }
        break;

      case 4:
        // Contact & Location validation
        if (!formData.servicePhone) {
          newErrors.servicePhone = "Phone number is required";
        }
        if (!formData.serviceEmail) {
          newErrors.serviceEmail = "Email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(formData.serviceEmail)) {
          newErrors.serviceEmail = "Invalid email format";
        }
        if (!formData.country) {
          newErrors.country = "Country is required";
        }
        if (!formData.governorate) {
          newErrors.governorate = "Governorate is required";
        }
        if (!formData.city) {
          newErrors.city = "City is required";
        }
        if (!formData.address_details) {
          newErrors.address_details = "Address details are required";
        }
        if (
          formData.address_link &&
          !/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(
            formData.address_link
          )
        ) {
          newErrors.address_link = "Invalid URL format";
        }
        break;

      case 5:
        // Media & Files validation
        if (!formData.images || formData.images.length === 0) {
          newErrors.profileImage = "Profile image is required";
        }
        formData.social_links.forEach((link, index) => {
          if (link.url && !/^https?:\/\//.test(link.url)) {
            newErrors[`social_links_${index}`] = "Invalid URL format";
          }
        });
        break;

      case 6:
        // Service Type validation
        if (!formData.service_type) {
          newErrors.service_type = "Service type is required";
        }
        break;

      case 7:
        // Pricing validation
        if (!formData.price) {
          newErrors.price = "Price is required";
        } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
          newErrors.price = "Price must be a positive number";
        }
        if (!formData.priceUnit) {
          newErrors.priceUnit = "Price unit is required";
        }
        break;

      case 8:
        // Review step - no validation needed
        break;

      default:
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

  // Set serviceManagementType based on userType
  useEffect(() => {
    if (userType) {
      const serviceManagementType = userType === 'stable_owner' ? 'fulltime' : 'freelancer';
      setFormData(prev => ({
        ...prev,
        serviceManagementType
      }));
      
      // Skip the first step if we're auto-setting the service management type
      if (currentStep === 1) {
        setCurrentStep(2);
      }
    }
  }, [userType, currentStep]);

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
      userId: userId, // Include userId
      serviceManagementType: formData.serviceManagementType,
    };
    
    // Add stableRef if user is stable_owner and serviceManagementType is fulltime
    if (userType === 'stable_owner' && formData.serviceManagementType === 'fulltime' && userStable) {
      submitData.stableRef = userStable;
    }
    
    // For provider type, ensure no stableRef and empty associatedStables
    if (userType === 'provider') {
      submitData.associatedStables = [];
    }

    return submitData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error("You must be logged in to submit a service");
      router.push("/login");
      return;
    }

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
          router.push("profile?tab=services");
        }, 3000);
      } else {
        toast.error("Failed to add service", {
          description:
            result.error ||
            "There was a problem submitting your service. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred", {
        description:
          error.message ||
          "Something went wrong while submitting your service.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderServiceManagementTypeStep = () => {
    // If userType is set, we should skip this step, but in case it's shown
    // we'll disable the options and show a message
    if (userType) {
      const managementType = userType === 'stable_owner' ? 'fulltime' : 'freelancer';
      const typeLabel = userType === 'stable_owner' ? 'Full-time (Stable-Managed)' : 'Freelancer';
      
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Service Management Type</h3>
          <div className="p-4 rounded-lg border border-primary bg-primary/5">
            <p className="text-center">Based on your account type, your service will be managed as: <strong>{typeLabel}</strong></p>
          </div>
        </div>
      );
    }
    
    // Original implementation for users without a specific type
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Select Service Management Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div
            onClick={() => handleChange({ target: { name: "serviceManagementType", value: "fulltime" } })}
            className={`cursor-pointer p-6 rounded-lg border transition-all ${formData.serviceManagementType === "fulltime" ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary"} hover:shadow-lg`}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="text-3xl">🏢</div>
              <div>
                <h3 className="font-semibold">Full-time (Stable-Managed)</h3>
                <p className="text-sm text-muted-foreground">Services managed by a stable with full-time staff</p>
              </div>
            </div>
          </div>
          <div
            onClick={() => handleChange({ target: { name: "serviceManagementType", value: "freelancer" } })}
            className={`cursor-pointer p-6 rounded-lg border transition-all ${formData.serviceManagementType === "freelancer" ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary"} hover:shadow-lg`}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="text-3xl">👤</div>
              <div>
                <h3 className="font-semibold">Freelancer</h3>
                <p className="text-sm text-muted-foreground">Independent service providers working on their own</p>
              </div>
            </div>
          </div>
        </div>
        {errors.serviceManagementType && (
          <p className="text-red-500 text-sm mt-1">{errors.serviceManagementType}</p>
        )}
      </div>
    );
  };

  const renderServiceTypeStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Select Service Type</h3>
      <ServiceTypeSelector
        selectedType={formData.service_type}
        onSelect={(type) =>
          handleChange({ target: { name: "service_type", value: type } })
        }
      />
      {formData.service_type && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-6 pb-2 border-b">
            Additional Information for{" "}
            {getServiceTypeLabel(formData.service_type)}
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
    <div className="space-y-6">
      <ReviewStep
        formData={formData}
        getServiceTypeLabel={getServiceTypeLabel}
        getPriceUnitLabel={getPriceUnitLabel}
        additionalImagePreviews={additionalImagePreviews}
        imagePreview={imagePreview}
      />
    </div>
  );

  const renderContent = () => {
    if (currentStep === 1) {
      return renderServiceManagementTypeStep();
    }
    if (currentStep === 6) {
      return renderServiceTypeStep();
    }
    if (currentStep === 8) {
      return renderReviewStep();
    }
    return (
      <FormStepContent
        key={`step-${currentStep}`}
        step={currentStep - 1} // Adjust step number for FormStepContent
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
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Add Your Service
          </h1>
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
