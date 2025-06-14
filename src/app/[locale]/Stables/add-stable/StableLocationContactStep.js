"use client";

import { MapPin, Phone, Mail, Link } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { client } from "../../../../lib/sanity";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { motion } from "framer-motion";

export default function StableLocationContactStep({ formData, setFormData, setErrors }) {
  const { t, i18n } = useTranslation('addStable');
  const [localErrors, setLocalErrors] = useState({
    country: "",
    governorate: "",
    city: "",
    servicePhone: "",
    serviceEmail: "",
    address_details: "",
    address_link: "",
    links: "",
  });
  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(formData.country?._id || "");
  const [selectedGovernorate, setSelectedGovernorate] = useState(formData.governorate?._id || "");
  const [selectedCity, setSelectedCity] = useState(formData.city?._id || "");
  const isRTL = i18n.language === "ar";

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
    const fetchReferences = async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching references:", error);
      }
    };
    fetchReferences();
  }, []);

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
    setErrors((prev) => ({ ...prev, country: "", governorate: "", city: "" }));
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
    setErrors((prev) => ({ ...prev, governorate: "", city: "" }));
  };

  const handleCityChange = (value) => {
    const selectedCityData = cities.find((c) => c._id === value);
    setSelectedCity(value);
    setFormData((prev) => ({
      ...prev,
      city: selectedCityData || null,
    }));
    setLocalErrors((prev) => ({ ...prev, city: "" }));
    setErrors((prev) => ({ ...prev, city: "" }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalErrors((prev) => ({ ...prev, [name]: "" }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleLinkChange = (index, field, value) => {
    setFormData((prev) => {
      const newLinks = [...prev.links];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, links: newLinks };
    });
    setLocalErrors((prev) => ({ ...prev, links: "" }));
    setErrors((prev) => ({ ...prev, links: "" }));
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

  const validateURL = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = {
      country: "",
      governorate: "",
      city: "",
      servicePhone: "",
      serviceEmail: "",
      address_details: "",
      address_link: "",
      links: "",
    };

    if (!formData.country) {
      newErrors.country = t("errors.countryRequired");
      isValid = false;
    }
    if (!formData.governorate) {
      newErrors.governorate = t("errors.governorateRequired");
      isValid = false;
    }
    if (!formData.city) {
      newErrors.city = t("errors.cityRequired");
      isValid = false;
    }
    if (!formData.servicePhone.trim()) {
      newErrors.servicePhone = t("errors.servicePhoneRequired");
      isValid = false;
    }
    if (!formData.serviceEmail.trim()) {
      newErrors.serviceEmail = t("errors.serviceEmailRequired");
      isValid = false;
    }
    if (formData.address_link && !validateURL(formData.address_link)) {
      newErrors.address_link = t("errors.invalidLink");
      isValid = false;
    }
    formData.links.forEach((link, index) => {
      if (!link.url || !validateURL(link.url)) {
        newErrors.links = t("errors.invalidLink");
        isValid = false;
      }
      if (!link.linkType) {
        newErrors.links = t("errors.linkTypeRequired");
        isValid = false;
      }
    });

    setLocalErrors(newErrors);
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const filteredGovernorates = governorates.filter(
    (gov) => gov.country?._id === selectedCountry
  );

  const filteredCities = cities.filter(
    (city) => city.governorate?._id === selectedGovernorate
  );

  const variants = {
    enter: { x: isRTL ? -1000 : 1000, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: isRTL ? 1000 : -1000, opacity: 0 },
  };

  return (
    <motion.div
      initial="enter"
      animate="center"
      exit="exit"
      variants={variants}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`}
    >
      <div className="flex items-center gap-2">
        <MapPin className="text-gold" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">
          {t("locationContact")}
        </h2>
      </div>
      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20">
        <p className="text-gold font-medium">
          {t("locationContactDescription")}
        </p>
      </div>

      <div className="grid gap-4">
        <Label htmlFor="country">
          {t("country")} <span className="text-red-500">*</span>
        </Label>
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
        {localErrors.country && (
          <p className="text-red-500 text-sm">{localErrors.country}</p>
        )}
      </div>

      <div className="grid gap-4">
        <Label htmlFor="governorate">
          {t("governorate")} <span className="text-red-500">*</span>
        </Label>
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
        {localErrors.governorate && (
          <p className="text-red-500 text-sm">{localErrors.governorate}</p>
        )}
      </div>

      <div className="grid gap-4">
        <Label htmlFor="city">
          {t("city")} <span className="text-red-500">*</span>
        </Label>
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
        {localErrors.city && (
          <p className="text-red-500 text-sm">{localErrors.city}</p>
        )}
      </div>

      <div className="grid gap-4">
        <Label htmlFor="address_details">{t("addressDetails")}</Label>
        <Input
          type="text"
          id="address_details"
          name="address_details"
          value={formData.address_details}
          onChange={handleInputChange}
          placeholder={t("addressDetailsPlaceholder")}
          className={localErrors.address_details ? "border-red-500" : ""}
        />
        {localErrors.address_details && (
          <p className="text-red-500 text-sm">{localErrors.address_details}</p>
        )}
      </div>

      <div className="grid gap-4">
        <Label htmlFor="address_link">{t("addressLink")}</Label>
        <Input
          type="url"
          id="address_link"
          name="address_link"
          value={formData.address_link}
          onChange={handleInputChange}
          placeholder={t("addressLinkPlaceholder")}
          className={localErrors.address_link ? "border-red-500" : ""}
        />
        {localErrors.address_link && (
          <p className="text-red-500 text-sm">{localErrors.address_link}</p>
        )}
      </div>

      <div className="grid gap-4">
        <Label htmlFor="servicePhone">
          {t("servicePhone")} <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Phone className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} text-gray-400`} size={20} />
          <Input
            type="tel"
            id="servicePhone"
            name="servicePhone"
            value={formData.servicePhone}
            onChange={handleInputChange}
            placeholder={t("servicePhonePlaceholder")}
            className={`pl-10 ${localErrors.servicePhone ? "border-red-500" : ""}`}
            required
          />
        </div>
        {localErrors.servicePhone && (
          <p className="text-red-500 text-sm">{localErrors.servicePhone}</p>
        )}
      </div>

      <div className="grid gap-4">
        <Label htmlFor="serviceEmail">
          {t("serviceEmail")} <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Mail className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} text-gray-400`} size={20} />
          <Input
            type="email"
            id="serviceEmail"
            name="serviceEmail"
            value={formData.serviceEmail}
            onChange={handleInputChange}
            placeholder={t("serviceEmailPlaceholder")}
            className={`pl-10 ${localErrors.serviceEmail ? "border-red-500" : ""}`}
            required
          />
        </div>
        {localErrors.serviceEmail && (
          <p className="text-red-500 text-sm">{localErrors.serviceEmail}</p>
        )}
      </div>

      <div className="grid gap-4">
        <Label>{t("links")}</Label>
        {formData.links.map((link, index) => (
          <div key={index} className="flex items-center gap-4">
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
              placeholder={t("linkPlaceholder")}
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
        {localErrors.links && (
          <p className="text-red-500 text-sm">{localErrors.links}</p>
        )}
      </div>
    </motion.div>
  );
}

export const validateStep = (formData, t, setErrors) => {
  let isValid = true;
  const newErrors = {
    country: "",
    governorate: "",
    city: "",
    servicePhone: "",
    serviceEmail: "",
    address_details: "",
    address_link: "",
    links: "",
  };

  if (!formData.country) {
    newErrors.country = t("errors.countryRequired");
    isValid = false;
  }
  if (!formData.governorate) {
    newErrors.governorate = t("errors.governorateRequired");
    isValid = false;
  }
  if (!formData.city) {
    newErrors.city = t("errors.cityRequired");
    isValid = false;
  }
  if (!formData.servicePhone.trim()) {
    newErrors.servicePhone = t("errors.servicePhoneRequired");
    isValid = false;
  }
  if (!formData.serviceEmail.trim()) {
    newErrors.serviceEmail = t("errors.serviceEmailRequired");
    isValid = false;
  }
  if (formData.address_link) {
    try {
      new URL(formData.address_link);
    } catch {
      newErrors.address_link = t("errors.invalidLink");
      isValid = false;
    }
  }
  formData.links.forEach((link) => {
    if (!link.url) {
      newErrors.links = t("errors.invalidLink");
      isValid = false;
    } else {
      try {
        new URL(link.url);
      } catch {
        newErrors.links = t("errors.invalidLink");
        isValid = false;
      }
    }
    if (!link.linkType) {
      newErrors.links = t("errors.linkTypeRequired");
      isValid = false;
    }
  });

  setErrors((prev) => ({ ...prev, ...newErrors }));
  return isValid;
};