'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../../../../../components/layout/Layout';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/sanity';
import Preloader from '../../../../../../components/elements/Preloader';
import imageUrlBuilder from '@sanity/image-url'; // Added for image URLs
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { MapPin, Phone, Mail, Link, Info, Calendar, Tag, DollarSign, Upload, FileText, Save } from 'lucide-react'; // Added Save

const builder = imageUrlBuilder(client); // Sanity image URL builder
const VALID_USER_TYPE = 'stable_owner';

const StableEdit = () => {
  const { t, i18n } = useTranslation('addStable');
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [stable, setStable] = useState(null);
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
  const [localErrors, setLocalErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const isRTL = i18n.language === "ar";

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

  const linkTypes = [
    { value: "website", label: t("linkTypes.website") },
    { value: "facebook", label: t("linkTypes.facebook") },
    { value: "youtube", label: t("linkTypes.youtube") },
    { value: "linkedin", label: t("linkTypes.linkedin") },
    { value: "x", label: t("linkTypes.x") },
    { value: "instagram", label: t("linkTypes.instagram") },
    { value: "pinterest", label: t("linkTypes.pinterest") },
    { value: "tiktok", label: t("linkTypes.tiktok") },
  ];

  useEffect(() => {
    const verifyAuthAndFetchStable = async () => {
      try {
        // Verify authentication
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (!response.ok || !data.authenticated) {
          throw new Error(t('addStable:unauthenticated'));
        }

        setUserId(data.user.id);
        // Fetch user type
        const userQuery = `*[_type == "user" && _id == $userId]{ userType }[0]`;
        const userParams = { userId: data.user.id };
        const userData = await client.fetch(userQuery, userParams);
        if (!userData || userData.userType !== VALID_USER_TYPE) {
          throw new Error(t('addStable:unauthorized'));
        }

        // Fetch stable data
        const stableQuery = `*[_type == "stables" && userRef._ref == $userId][0]`;
        const stableParams = { userId: data.user.id };
        const stableData = await client.fetch(stableQuery, stableParams);
        if (!stableData) {
          throw new Error(t('addStable:noStableFound'));
        }

        setStable(stableData);
        setFormData({
          name_ar: stableData.name_ar || "",
          name_en: stableData.name_en || "",
          about_ar: stableData.about_ar || "",
          about_en: stableData.about_en || "",
          yearsOfExperience: stableData.years_of_experience || "",
          pastExperience_ar: stableData.past_experience_ar || "",
          pastExperience_en: stableData.past_experience_en || "",
          country: stableData.country || null,
          governorate: stableData.government || null,
          city: stableData.city || null,
          address_details: stableData.address_details || "",
          address_link: stableData.address_link || "",
          servicePhone: stableData.servicePhone || "",
          serviceEmail: stableData.serviceEmail || "",
          links: stableData.links || [],
          dateOfEstablishment: stableData.dateOfEstablishment || "",
          kindOfStable: stableData.kindOfStable || [],
          stableDescription: stableData.stableDescription || "",
          boardingCapacity: stableData.boardingCapacity || "",
          boardingDetails: {
            boardingPrice: stableData.boardingDetails?.boardingPrice || "",
            boardingPriceUnit: stableData.boardingDetails?.boardingPriceUnit || "",
            additionalServices: stableData.boardingDetails?.additionalServices || [],
          },
          images: stableData.images || [],
          licensesAndCertificates: stableData.licensesAndCertificates || [],
        });
        setSelectedCountry(stableData.country?._id || "");
        setSelectedGovernorate(stableData.government?._id || "");
        setSelectedCity(stableData.city?._id || "");

        // Fetch references
        const countryQuery = '*[_type == "country"]{_id, name_en, name_ar}';
        const governorateQuery = '*[_type == "governorate"]{_id, name_en, name_ar, country->{_id}}';
        const cityQuery = '*[_type == "city"]{_id, name_en, name_ar, governorate->{_id}}';
        const [countriesData, governoratesData, citiesData] = await Promise.all([
          client.fetch(countryQuery),
          client.fetch(governorateQuery),
          client.fetch(cityQuery),
        ]);
        setCountries(countriesData);
        setGovernorates(governoratesData);
        setCities(citiesData);

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error:', error.message);
        setError(error.message);
        router.push(`/login?error=${encodeURIComponent(error.message)}`);
      } finally {
        setIsLoading(false);
      }
    };
    verifyAuthAndFetchStable();
  }, [router, t]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBoardingDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      boardingDetails: { ...prev.boardingDetails, [name]: value },
    }));
    setLocalErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCountryChange = (value) => {
    const selectedCountryData = countries.find((c) => c._id === value);
    setSelectedCountry(value);
    setSelectedGovernorate("");
    setSelectedCity("");
    setFormData((prev) => ({
      ...prev,
      country: selectedCountryData || null,
      governorate: null,
      city: null,
    }));
    setLocalErrors((prev) => ({ ...prev, country: "", governorate: "", city: "" }));
  };

  const handleGovernorateChange = (value) => {
    const selectedGovernorateData = governorates.find((g) => g._id === value);
    setSelectedGovernorate(value);
    setSelectedCity("");
    setFormData((prev) => ({
      ...prev,
      governorate: selectedGovernorateData || null,
      city: null,
    }));
    setLocalErrors((prev) => ({ ...prev, governorate: "", city: "" }));
  };

  const handleCityChange = (value) => {
    const selectedCityData = cities.find((c) => c._id === value);
    setSelectedCity(value);
    setFormData((prev) => ({
      ...prev,
      city: selectedCityData || null,
    }));
    setLocalErrors((prev) => ({ ...prev, city: "" }));
  };

  const handleLinkChange = (index, field, value) => {
    setFormData((prev) => {
      const newLinks = [...prev.links];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, links: newLinks };
    });
    setLocalErrors((prev) => ({ ...prev, links: "" }));
  };

  const addLink = () => {
    setFormData((prev) => ({
      ...prev,
      links: [...prev.links, { url: "", linkType: "" }],
    }));
  };

  const removeLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const handleStableTypeChange = (value) => {
    setFormData((prev) => {
      const kindOfStable = prev.kindOfStable.includes(value)
        ? prev.kindOfStable.filter((type) => type !== value)
        : [...prev.kindOfStable, value];
      return { ...prev, kindOfStable };
    });
    setLocalErrors((prev) => ({ ...prev, kindOfStable: "" }));
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

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).filter((file) => file.type.startsWith("image/"));
      if (newImages.length < e.target.files.length) {
        setLocalErrors((prev) => ({
          ...prev,
          images: t("addStable:errors.onlyImagesAllowed"),
        }));
        return;
      }
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      for (const image of newImages) {
        if (image.size > maxFileSize) {
          setLocalErrors((prev) => ({
            ...prev,
            images: t("addStable:errors.imageTooLarge"),
          }));
          return;
        }
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
      setLocalErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter((file) =>
        [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".gif"].some((ext) => file.name.toLowerCase().endsWith(ext))
      );
      if (newFiles.length < e.target.files.length) {
        setLocalErrors((prev) => ({
          ...prev,
          licensesAndCertificates: t("addStable:errors.onlyFilesAllowed"),
        }));
        return;
      }
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      for (const file of newFiles) {
        if (file.size > maxFileSize) {
          setLocalErrors((prev) => ({
            ...prev,
            licensesAndCertificates: t("addStable:errors.fileTooLarge"),
          }));
          return;
        }
      }
      setFormData((prev) => ({
        ...prev,
        licensesAndCertificates: [...prev.licensesAndCertificates, ...newFiles],
      }));
      setLocalErrors((prev) => ({ ...prev, licensesAndCertificates: "" }));
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setLocalErrors((prev) => ({ ...prev, images: "" }));
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      licensesAndCertificates: prev.licensesAndCertificates.filter((_, i) => i !== index),
    }));
    setLocalErrors((prev) => ({ ...prev, licensesAndCertificates: "" }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Basic Info
    if (!formData.name_ar.trim()) newErrors.name_ar = t("addStable:errors.nameArRequired");
    if (!formData.name_en.trim()) newErrors.name_en = t("addStable:errors.nameEnRequired");
    if (!formData.about_ar.trim()) newErrors.about_ar = t("addStable:errors.aboutArRequired");
    if (!formData.about_en.trim()) newErrors.about_en = t("addStable:errors.aboutEnRequired");
    if (!formData.yearsOfExperience || formData.yearsOfExperience <= 0) {
      newErrors.yearsOfExperience = t("addStable:errors.yearsOfExperienceRequired");
    }

    // Location & Contact
    if (!formData.country) newErrors.country = t("errors.countryRequired");
    if (!formData.governorate) newErrors.governorate = t("errors.governorateRequired");
    if (!formData.city) newErrors.city = t("errors.cityRequired");
    if (!formData.servicePhone.trim()) newErrors.servicePhone = t("errors.servicePhoneRequired");
    if (!formData.serviceEmail.trim()) newErrors.serviceEmail = t("errors.serviceEmailRequired");
    if (formData.address_link) {
      try {
        new URL(formData.address_link);
      } catch {
        newErrors.address_link = t("errors.invalidLink");
      }
    }
    formData.links.forEach((link) => {
      if (!link.url) {
        newErrors.links = t("errors.invalidLink");
      } else {
        try {
          new URL(link.url);
        } catch {
          newErrors.links = t("errors.invalidLink");
        }
      }
      if (!link.linkType) newErrors.links = t("errors.linkTypeRequired");
    });

    // Stable Details
    if (!formData.dateOfEstablishment) {
      newErrors.dateOfEstablishment = t("addStable:errors.dateOfEstablishmentRequired");
    }
    if (formData.kindOfStable.length === 0) {
      newErrors.kindOfStable = t("addStable:errors.kindOfStableRequired");
    }
    if (!formData.stableDescription.trim()) {
      newErrors.stableDescription = t("addStable:errors.stableDescriptionRequired");
    }
    if (!formData.boardingCapacity || isNaN(parseInt(formData.boardingCapacity)) || parseInt(formData.boardingCapacity) < 1) {
      newErrors.boardingCapacity = t("addStable:errors.boardingCapacityRequired");
    }
    if (!formData.boardingDetails.boardingPrice || isNaN(parseFloat(formData.boardingDetails.boardingPrice))) {
      newErrors.boardingPrice = t("addStable:errors.boardingPriceRequired");
    }
    if (!formData.boardingDetails.boardingPriceUnit) {
      newErrors.boardingPriceUnit = t("addStable:errors.boardingPriceUnitRequired");
    }
    formData.boardingDetails.additionalServices.forEach((service) => {
      if (!service.name_ar.trim() || !service.name_en.trim() || !service.price || isNaN(parseFloat(service.price))) {
        newErrors.additionalServices = t("addStable:errors.additionalServicesRequired");
      }
    });

    // Media
    if (formData.images.length === 0) {
      newErrors.images = t("addStable:errors.imagesRequired");
    }

    if (Object.keys(newErrors).length > 0) isValid = false;
    setLocalErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      toast.error(t("errors.formInvalid"));
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload new images
      const uploadedImages = [];
      for (let index = 0; index < formData.images.length; index++) {
        const image = formData.images[index];
        if (image instanceof File) {
          try {
            const asset = await client.assets.upload("image", image, { filename: image.name });
            uploadedImages.push({
              _type: "image",
              _key: `image-${index}-${Date.now()}`,
              asset: { _type: "reference", _ref: asset._id },
            });
          } catch (error) {
            throw new Error(`Image upload failed for ${image.name}: ${error.message}`);
          }
        } else {
          uploadedImages.push(image);
        }
      }

      // Upload new files
      const uploadedCertificates = [];
      for (let index = 0; index < formData.licensesAndCertificates.length; index++) {
        const file = formData.licensesAndCertificates[index];
        if (file instanceof File) {
          try {
            const asset = await client.assets.upload("file", file, { filename: file.name });
            uploadedCertificates.push({
              _type: "file",
              _key: `file-${index}-${Date.now()}`,
              asset: { _type: "reference", _ref: asset._id },
            });
          } catch (error) {
            throw new Error(`File upload failed for ${file.name}: ${error.message}`);
          }
        } else {
          uploadedCertificates.push(file);
        }
      }

      // Prepare updated stable document
      const updatedStableDoc = {
        name_ar: formData.name_ar.trim(),
        name_en: formData.name_en.trim(),
        about_ar: formData.about_ar.trim(),
        about_en: formData.about_en.trim(),
        years_of_experience: parseInt(formData.yearsOfExperience, 10),
        past_experience_ar: formData.pastExperience_ar.trim() || "",
        past_experience_en: formData.pastExperience_en.trim() || "",
        country: formData.country ? { _type: "reference", _ref: formData.country._id } : null,
        government: formData.governorate ? { _type: "reference", _ref: formData.governorate._id } : null,
        city: formData.city ? { _type: "reference", _ref: formData.city._id } : null,
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
        boardingCapacity: parseInt(formData.boardingCapacity, 10),
        boardingDetails: {
          boardingPrice: parseFloat(formData.boardingDetails.boardingPrice),
          boardingPriceUnit: formData.boardingDetails.boardingPriceUnit,
          additionalServices: formData.boardingDetails.additionalServices.map((service, index) => ({
            _key: `service-${index}-${Date.now()}`,
            name_ar: service.name_ar.trim(),
            name_en: service.name_en.trim(),
            price: parseFloat(service.price) || 0,
          })),
        },
        images: uploadedImages,
        licensesAndCertificates: uploadedCertificates,
      };

      // Update stable document in Sanity
      await client
        .patch(stable._id)
        .set(updatedStableDoc)
        .commit();
      toast.success(t("addStable:stableUpdatedSuccess"));
      router.push("/profile?tab=stable-owner");
    } catch (error) {
      console.error("Update error:", error);
      let errorMessage = t("addStable:submissionFailed");
      if (error.message.includes("Image upload failed")) {
        errorMessage = t("addStable:errors.imageUploadFailed");
      } else if (error.message.includes("File upload failed")) {
        errorMessage = t("addStable:errors.fileUploadFailed");
      }
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Preloader />
      </Layout>
    );
  }

  if (!isAuthenticated || !stable) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg font-medium text-red-600">{error}</div>
        </div>
      </Layout>
    );
  }

  const filteredGovernorates = governorates.filter((gov) => gov.country?._id === selectedCountry);
  const filteredCities = cities.filter((city) => city.governorate?._id === selectedGovernorate);

  return (
    <Layout>
      <div className="container max-w-4xl py-8 px-4 sm:px-6 ltr">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {t("addStable:editStable")}
        </h1>
        <form onSubmit={handleSubmit} className={`space-y-12 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
          {/* Basic Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
              <Info className={`text-gold ${isRTL ? "ml-2" : "mr-2"}`} size={28} />
              {t("addStable:basicInformation")}
            </h2>
            <div className="grid gap-6">
              <div>
                <Label htmlFor="name_ar">{t("addStable:nameAr")} <span className="text-red-500">*</span></Label>
                <Input
                  id="name_ar"
                  name="name_ar"
                  value={formData.name_ar}
                  onChange={handleInputChange}
                  className={localErrors.name_ar ? "border-red-500" : ""}
                  required
                />
                {localErrors.name_ar && <p className="text-red-500 text-sm">{localErrors.name_ar}</p>}
              </div>
              <div>
                <Label htmlFor="name_en">{t("addStable:nameEn")} <span className="text-red-500">*</span></Label>
                <Input
                  id="name_en"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleInputChange}
                  className={localErrors.name_en ? "border-red-500" : ""}
                  required
                />
                {localErrors.name_en && <p className="text-red-500 text-sm">{localErrors.name_en}</p>}
              </div>
              <div>
                <Label htmlFor="about_ar">{t("addStable:aboutAr")} <span className="text-red-500">*</span></Label>
                <textarea
                  id="about_ar"
                  name="about_ar"
                  value={formData.about_ar}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-xl ${localErrors.about_ar ? "border-red-500" : "border-gray-300"}`}
                  rows={4}
                  required
                />
                {localErrors.about_ar && <p className="text-red-500 text-sm">{localErrors.about_ar}</p>}
              </div>
              <div>
                <Label htmlFor="about_en">{t("addStable:aboutEn")} <span className="text-red-500">*</span></Label>
                <textarea
                  id="about_en"
                  name="about_en"
                  value={formData.about_en}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-xl ${localErrors.about_en ? "border-red-500" : "border-gray-300"}`}
                  rows={4}
                  required
                />
                {localErrors.about_en && <p className="text-red-500 text-sm">{localErrors.about_en}</p>}
              </div>
              <div>
                <Label htmlFor="yearsOfExperience">{t("addStable:yearsOfExperience")} <span className="text-red-500">*</span></Label>
                <Input
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  className={localErrors.yearsOfExperience ? "border-red-500" : ""}
                  min="0"
                  required
                />
                {localErrors.yearsOfExperience && <p className="text-red-500 text-sm">{localErrors.yearsOfExperience}</p>}
              </div>
              <div>
                <Label htmlFor="pastExperience_ar">{t("addStable:pastExperienceAr")}</Label>
                <textarea
                  id="pastExperience_ar"
                  name="pastExperience_ar"
                  value={formData.pastExperience_ar}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-xl ${localErrors.pastExperience_ar ? "border-red-500" : "border-gray-300"}`}
                  rows={4}
                />
                {localErrors.pastExperience_ar && <p className="text-red-500 text-sm">{localErrors.pastExperience_ar}</p>}
              </div>
              <div>
                <Label htmlFor="pastExperience_en">{t("addStable:pastExperienceEn")}</Label>
                <textarea
                  id="pastExperience_en"
                  name="pastExperience_en"
                  value={formData.pastExperience_en}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-xl ${localErrors.pastExperience_en ? "border-red-500" : "border-gray-300"}`}
                  rows={4}
                />
                {localErrors.pastExperience_en && <p className="text-red-500 text-sm">{localErrors.pastExperience_en}</p>}
              </div>
            </div>
          </section>

          {/* Location & Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
              <MapPin className={`text-gold ${isRTL ? "ml-2" : "mr-2"}`} size={28} />
              {t("locationContact")}
            </h2>
            <div className="grid gap-6">
              <div>
                <Label htmlFor="country">{t("country")} <span className="text-red-500">*</span></Label>
                <Select value={selectedCountry} onValueChange={handleCountryChange}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder={t("selectCountry")} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country._id} value={country._id}>
                        {isRTL ? country.name_ar : country.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {localErrors.country && <p className="text-red-500 text-sm">{localErrors.country}</p>}
              </div>
              <div>
                <Label htmlFor="governorate">{t("governorate")} <span className="text-red-500">*</span></Label>
                <Select
                  value={selectedGovernorate}
                  onValueChange={handleGovernorateChange}
                  disabled={!selectedCountry || !filteredGovernorates.length}
                >
                  <SelectTrigger id="governorate">
                    <SelectValue placeholder={t("selectGovernorate")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredGovernorates.map((governorate) => (
                      <SelectItem key={governorate._id} value={governorate._id}>
                        {isRTL ? governorate.name_ar : governorate.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {localErrors.governorate && <p className="text-red-500 text-sm">{localErrors.governorate}</p>}
              </div>
              <div>
                <Label htmlFor="city">{t("city")} <span className="text-red-500">*</span></Label>
                <Select
                  value={selectedCity}
                  onValueChange={handleCityChange}
                  disabled={!selectedGovernorate || !filteredCities.length}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder={t("selectCity")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCities.map((city) => (
                      <SelectItem key={city._id} value={city._id}>
                        {isRTL ? city.name_ar : city.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {localErrors.city && <p className="text-red-500 text-sm">{localErrors.city}</p>}
              </div>
              <div>
                <Label htmlFor="address_details">{t("addressDetails")}</Label>
                <Input
                  id="address_details"
                  name="address_details"
                  value={formData.address_details}
                  onChange={handleInputChange}
                  className={localErrors.address_details ? "border-red-500" : ""}
                />
                {localErrors.address_details && <p className="text-red-500 text-sm">{localErrors.address_details}</p>}
              </div>
              <div>
                <Label htmlFor="address_link">{t("addressLink")}</Label>
                <Input
                  id="address_link"
                  name="address_link"
                  type="url"
                  value={formData.address_link}
                  onChange={handleInputChange}
                  className={localErrors.address_link ? "border-red-500" : ""}
                />
                {localErrors.address_link && <p className="text-red-500 text-sm">{localErrors.address_link}</p>}
              </div>
              <div>
                <Label htmlFor="servicePhone">{t("servicePhone")} <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Phone className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} text-gray-400`} size={20} />
                  <Input
                    id="servicePhone"
                    name="servicePhone"
                    type="tel"
                    value={formData.servicePhone}
                    onChange={handleInputChange}
                    className={`pl-10 ${localErrors.servicePhone ? "border-red-500" : ""}`}
                    required
                  />
                </div>
                {localErrors.servicePhone && <p className="text-red-500 text-sm">{localErrors.servicePhone}</p>}
              </div>
              <div>
                <Label htmlFor="serviceEmail">{t("serviceEmail")} <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Mail className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} text-gray-400`} size={20} />
                  <Input
                    id="serviceEmail"
                    name="serviceEmail"
                    type="email"
                    value={formData.serviceEmail}
                    onChange={handleInputChange}
                    className={`pl-10 ${localErrors.serviceEmail ? "border-red-500" : ""}`}
                    required
                  />
                </div>
                {localErrors.serviceEmail && <p className="text-red-500 text-sm">{localErrors.serviceEmail}</p>}
              </div>
              <div>
                <Label>{t("links")}</Label>
                {formData.links.map((link, index) => (
                  <div key={index} className="flex items-center gap-4 mb-4">
                    <Select
                      value={link.linkType}
                      onValueChange={(value) => handleLinkChange(index, "linkType", value)}
                      className="w-1/3"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectLinkType")} />
                      </SelectTrigger>
                      <SelectContent>
                        {linkTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                      className={`w-2/3 ${localErrors.links ? "border-red-500" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeLink(index)}
                      className="rounded-xl"
                    >
                      {t("removeLink")}
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLink}
                  className="rounded-xl border-gold/20 bg-white hover:text-gold text-black hover:bg-gold/30"
                >
                  <Link className="mr-2" size={16} />
                  {t("addLink")}
                </Button>
                {localErrors.links && <p className="text-red-500 text-sm">{localErrors.links}</p>}
              </div>
            </div>
          </section>

          {/* Stable Details */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
              <Calendar className={`text-gold ${isRTL ? "ml-2" : "mr-2"}`} size={28} />
              {t("addStable:stableDetails")}
            </h2>
            <div className="grid gap-6">
              <div>
                <Label htmlFor="dateOfEstablishment">{t("addStable:dateOfEstablishment")} <span className="text-red-500">*</span></Label>
                <Input
                  id="dateOfEstablishment"
                  name="dateOfEstablishment"
                  type="date"
                  value={formData.dateOfEstablishment}
                  onChange={handleInputChange}
                  className={localErrors.dateOfEstablishment ? "border-red-500" : ""}
                  required
                />
                {localErrors.dateOfEstablishment && <p className="text-red-500 text-sm">{localErrors.dateOfEstablishment}</p>}
              </div>
              <div>
                <Label>{t("addStable:kindOfStable")} <span className="text-red-500">*</span></Label>
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
                {localErrors.kindOfStable && <p className="text-red-500 text-sm">{localErrors.kindOfStable}</p>}
              </div>
              <div>
                <Label htmlFor="stableDescription">{t("addStable:stableDescription")} <span className="text-red-500">*</span></Label>
                <textarea
                  id="stableDescription"
                  name="stableDescription"
                  value={formData.stableDescription}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-xl ${localErrors.stableDescription ? "border-red-500" : "border-gray-300"}`}
                  rows={5}
                  required
                />
                {localErrors.stableDescription && <p className="text-red-500 text-sm">{localErrors.stableDescription}</p>}
              </div>
              <div>
                <Label htmlFor="boardingCapacity">{t("addStable:boardingCapacity")} <span className="text-red-500">*</span></Label>
                <Input
                  id="boardingCapacity"
                  name="boardingCapacity"
                  type="number"
                  value={formData.boardingCapacity}
                  onChange={handleInputChange}
                  className={localErrors.boardingCapacity ? "border-red-500" : ""}
                  min="1"
                  required
                />
                {localErrors.boardingCapacity && <p className="text-red-500 text-sm">{localErrors.boardingCapacity}</p>}
              </div>
              <div>
                <Label htmlFor="boardingPrice">{t("addStable:boardingPrice")} (SAR) <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <DollarSign className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} text-gray-400`} size={20} />
                  <Input
                    id="boardingPrice"
                    name="boardingPrice"
                    type="number"
                    value={formData.boardingDetails.boardingPrice}
                    onChange={handleBoardingDetailsChange}
                    className={`pl-10 ${localErrors.boardingPrice ? "border-red-500" : ""}`}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                {localErrors.boardingPrice && <p className="text-red-500 text-sm">{localErrors.boardingPrice}</p>}
              </div>
              <div>
                <Label htmlFor="boardingPriceUnit">{t("addStable:boardingPriceUnit")} <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.boardingDetails.boardingPriceUnit}
                  onValueChange={(value) => handleBoardingDetailsChange({ target: { name: "boardingPriceUnit", value } })}
                >
                  <SelectTrigger id="boardingPriceUnit">
                    <SelectValue placeholder={t("addStable:selectPriceUnit")} />
                  </SelectTrigger>
                  <SelectContent>
                    {priceUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {isRTL ? unit.label.ar : unit.label.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {localErrors.boardingPriceUnit && <p className="text-red-500 text-sm">{localErrors.boardingPriceUnit}</p>}
              </div>
              <div>
                <Label>{t("addStable:additionalServices")}</Label>
                {formData.boardingDetails.additionalServices.map((service, index) => (
                  <div key={index} className="flex items-center gap-4 mb-4">
                    <Input
                      value={service.name_ar}
                      onChange={(e) => updateAdditionalService(index, "name_ar", e.target.value)}
                      className={`w-1/3 ${localErrors.additionalServices ? "border-red-500" : ""}`}
                      placeholder={t("addStable:serviceNameAr")}
                    />
                    <Input
                      value={service.name_en}
                      onChange={(e) => updateAdditionalService(index, "name_en", e.target.value)}
                      className={`w-1/3 ${localErrors.additionalServices ? "border-red-500" : ""}`}
                      placeholder={t("addStable:serviceNameEn")}
                    />
                    <Input
                      type="number"
                      value={service.price}
                      onChange={(e) => updateAdditionalService(index, "price", e.target.value)}
                      className={`w-1/3 ${localErrors.additionalServices ? "border-red-500" : ""}`}
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
                {localErrors.additionalServices && <p className="text-red-500 text-sm">{localErrors.additionalServices}</p>}
              </div>
            </div>
          </section>

          {/* Media Upload */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
              <Upload className={`text-gold ${isRTL ? "ml-2" : "mr-2"}`} size={28} />
              {t("addStable:mediaUpload")}
            </h2>
            <div className="grid gap-6">
              <div>
                <Label>{t("addStable:images")} <span className="text-red-500">*</span></Label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center ${localErrors.images ? "border-red-500" : "border-gray-300"}`}>
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Upload className="mx-auto text-gray-400 mb-2" size={36} />
                    <p className="text-gray-700 font-medium">{t("addStable:dragDropImages")}</p>
                    <p className="text-sm text-gray-500">{t("addStable:orBrowseImages")}</p>
                    <Button
                      variant="outline"
                      className="rounded-xl mt-2 border-gold/20 bg-white hover:text-gold text-black hover:bg-gold/30"
                      onClick={() => document.getElementById("stableImages")?.click()}
                    >
                      {t("addStable:selectImages")}
                    </Button>
                    <input
                      id="stableImages"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  {localErrors.images && <p className="text-red-500 text-sm mt-2">{localErrors.images}</p>}
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative border rounded-xl overflow-hidden group">
                        <Image
                          src={image instanceof File ? URL.createObjectURL(image) : builder.image(image.asset).url() || ""}
                          alt={`${t("addStable:image")} ${index + 1}`}
                          className="w-full h-32 object-cover"
                          width={200}
                          height={128}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className={`absolute top-1 ${isRTL ? "left-1" : "right-1"} bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
                        >
                          ×
                        </button>
                        <p className="text-xs truncate p-1 bg-white">{image.name || `Image ${index + 1}`}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label>{t("addStable:licensesAndCertificates")}</Label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center ${localErrors.licensesAndCertificates ? "border-red-500" : "border-gray-300"}`}>
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <FileText className="mx-auto text-gray-400 mb-2" size={36} />
                    <p className="text-gray-700 font-medium">{t("addStable:dragDropFiles")}</p>
                    <p className="text-sm text-gray-500">{t("addStable:orBrowseFiles")}</p>
                    <Button
                      variant="outline"
                      className="rounded-xl mt-2 border-gold/20 bg-white hover:text-gold text-black hover:bg-gold/30"
                      onClick={() => document.getElementById("stableFiles")?.click()}
                    >
                      {t("addStable:selectFiles")}
                    </Button>
                    <input
                      id="stableFiles"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                  {localErrors.licensesAndCertificates && <p className="text-red-500 text-sm mt-2">{localErrors.licensesAndCertificates}</p>}
                </div>
                {formData.licensesAndCertificates.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.licensesAndCertificates.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-xl">
                        <span className="text-sm truncate">{file.name || `File ${index + 1}`}</span>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeFile(index)}
                          className="rounded-xl"
                        >
                          {t("addStable:removeFile")}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="flex justify-end">
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
                  <span>{t("addStable:updateStable")}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default StableEdit;