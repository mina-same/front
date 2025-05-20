"use client";
import React, { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ServiceFieldsFactory from "../../add-service/service-fields/ServiceFieldsFactory";
import { Button } from "@/components/ui/button";

const EditServiceForm = ({
  initialFormData,
  serviceType,
  onSubmit,
  isRTL = false,
}) => {
  const [formData, setFormData] = useState(
    initialFormData || {
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
      service_details: {},
    }
  );
  const [errors, setErrors] = useState({});
  const initializedServiceTypes = useRef(new Set());

  useEffect(() => {
    if (serviceType && !initializedServiceTypes.current.has(serviceType)) {
      if (!formData.service_details[serviceType]) {
        handleNestedChange(serviceType, "", {});
        initializedServiceTypes.current.add(serviceType);
      }
    }
  }, [serviceType, handleNestedChange]); // Include handleNestedChange as a dependency

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? Array.from(files) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      service_details: {
        ...prev.service_details,
        [section]: {
          ...(prev.service_details[section] || {}),
          [field]: value,
        },
      },
    }));
    setErrors((prev) => ({ ...prev, [`${section}.${field}`]: "" }));
  };

  const handleNestedArrayChange = (path, index, field, value) => {
    const [section, arrayField] = path.split(".");
    setFormData((prev) => {
      const newArray = [...(prev.service_details[section]?.[arrayField] || [])];
      newArray[index] = { ...newArray[index], [field]: value };
      return {
        ...prev,
        service_details: {
          ...prev.service_details,
          [section]: {
            ...(prev.service_details[section] || {}),
            [arrayField]: newArray,
          },
        },
      };
    });
  };

  const addNestedArrayItem = (path) => {
    const [section, arrayField] = path.split(".");
    setFormData((prev) => ({
      ...prev,
      service_details: {
        ...prev.service_details,
        [section]: {
          ...(prev.service_details[section] || {}),
          [arrayField]: [
            ...(prev.service_details[section]?.[arrayField] || []),
            {},
          ],
        },
      },
    }));
  };

  const removeNestedArrayItem = (path, index) => {
    const [section, arrayField] = path.split(".");
    setFormData((prev) => {
      const newArray = [...(prev.service_details[section]?.[arrayField] || [])];
      newArray.splice(index, 1);
      return {
        ...prev,
        service_details: {
          ...prev.service_details,
          [section]: {
            ...(prev.service_details[section] || {}),
            [arrayField]: newArray,
          },
        },
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name_ar) newErrors.name_ar = "Arabic name is required";
    if (!formData.name_en) newErrors.name_en = "English name is required";
    if (!formData.description_ar)
      newErrors.description_ar = "Arabic description is required";
    if (!formData.description_en)
      newErrors.description_en = "English description is required";

    if (serviceType === "suppliers") {
      const products = formData.service_details.suppliers?.products || [];
      products.forEach((product, index) => {
        if (!product.name_ar)
          newErrors[`suppliers.products[${index}].name_ar`] =
            "Arabic product name is required";
        if (!product.name_en)
          newErrors[`suppliers.products[${index}].name_en`] =
            "English product name is required";
        if (!product.price)
          newErrors[`suppliers.products[${index}].price`] =
            "Product price is required";
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const inputClass = (field) => `
    w-full p-4 pt-3 pb-3 rounded-xl transition-all duration-200
    shadow-sm focus:shadow-md
    ${
      errors[field]
        ? "border-red-400 border-2 focus:ring-2 focus:ring-red-200 focus:border-red-400"
        : "border border-gray-200 hover:border-gray-300 focus:border-gold focus:ring-1 focus:ring-gold/30"
    }
    focus:outline-none
  `;

  const labelClass =
    "absolute -top-2.5 left-4 bg-white px-2 text-xs font-medium text-black rounded-md";

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Edit Service</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Service Type</h3>
          <div className="relative">
            <Label className={labelClass}>Service Type</Label>
            <Input
              disabled
              className={`${inputClass(
                "serviceType"
              )} bg-gray-100 cursor-not-allowed`}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium mb-4">General Information</h3>
          <div className="space-y-4">
            <div className="relative">
              <Label className={labelClass}>Name (Arabic)</Label>
              <Input
                name="name_ar"
                value={formData.name_ar}
                onChange={handleChange}
                className={inputClass("name_ar")}
                dir="rtl"
              />
              {errors.name_ar && (
                <p className="text-red-500 text-sm mt-1">{errors.name_ar}</p>
              )}
            </div>
            <div className="relative">
              <Label className={labelClass}>Name (English)</Label>
              <Input
                name="name_en"
                value={formData.name_en}
                onChange={handleChange}
                className={inputClass("name_en")}
              />
              {errors.name_en && (
                <p className="text-red-500 text-sm mt-1">{errors.name_en}</p>
              )}
            </div>
            <div className="relative">
              <Label className={labelClass}>Description (Arabic)</Label>
              <Textarea
                name="description_ar"
                value={formData.description_ar}
                onChange={handleChange}
                className={inputClass("description_ar")}
                dir="rtl"
                rows={4}
              />
              {errors.description_ar && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description_ar}
                </p>
              )}
            </div>
            <div className="relative">
              <Label className={labelClass}>Description (English)</Label>
              <Textarea
                name="description_en"
                value={formData.description_en}
                onChange={handleChange}
                className={inputClass("description_en")}
                rows={4}
              />
              {errors.description_en && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description_en}
                </p>
              )}
            </div>
          </div>
        </div>

        <ServiceFieldsFactory
          serviceType={serviceType}
          formData={formData}
          handleChange={handleChange}
          handleNestedChange={handleNestedChange}
          handleNestedArrayChange={handleNestedArrayChange}
          addNestedArrayItem={addNestedArrayItem}
          removeNestedArrayItem={removeNestedArrayItem}
          errors={errors}
          isRTL={isRTL}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-gold text-white hover:bg-gold/90 px-6 py-2 rounded-lg"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditServiceForm;