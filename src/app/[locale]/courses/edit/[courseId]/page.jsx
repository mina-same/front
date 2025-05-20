'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Layout from '../../../../../../components/layout/Layout';
import { client } from '@/lib/sanity';
import { toast } from '@/components/ui/sonner';
import { Book, FileText, Image as LucideImage, Save, Upload, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Category and other options
const categoryOptions = [
  { value: "equine_anatomy_physiology", label: "addCourse:categories.equine_anatomy_physiology" },
  { value: "equine_nutrition", label: "addCourse:categories.equine_nutrition" },
  { value: "stable_management", label: "addCourse:categories.stable_management" },
  // ... (include all category options from CourseContentStep.js)
  { value: "other", label: "addCourse:categories.other" },
];

const levelOptions = [
  { value: "beginner", label: "addCourse:levels.beginner" },
  { value: "intermediate", label: "addCourse:levels.intermediate" },
  { value: "advanced", label: "addCourse:levels.advanced" },
];

const languageOptions = [
  { value: "english", label: "addCourse:languages.english" },
  { value: "arabic", label: "addCourse:languages.arabic" },
  { value: "both", label: "addCourse:languages.both" },
];

const VALID_USER_TYPE = 'educational_services';

export default function EditCourseForm() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { courseId } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    level: '',
    language: '',
    images: [],
    price: '',
    materials: [],
    category: '',
  });
  const [localErrors, setLocalErrors] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    materials: '',
    images: '',
  });
  const [dragActive, setDragActive] = useState({ images: false, materials: false });
  const [userId, setUserId] = useState(null);
  const [existingImages, setExistingImages] = useState([]); // Store existing Sanity image references

  // Authentication and course data fetching
  useEffect(() => {
    const verifyAuthAndFetchCourse = async () => {
      try {
        // Verify user authentication
        const authResponse = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const authData = await authResponse.json();

        if (!authResponse.ok || !authData.authenticated) {
          throw new Error(t('addCourse:errors.userNotAuthenticated'));
        }

        setUserId(authData.user.id);

        // Verify user type
        const userQuery = `*[_type == "user" && _id == $userId]{ userType }[0]`;
        const userData = await client.fetch(userQuery, { userId: authData.user.id });

        if (!userData || userData.userType !== VALID_USER_TYPE) {
          throw new Error(t('addCourse:errors.invalidUserType'));
        }

        // Fetch course data
        const courseQuery = `*[_type == "course" && _id == $courseId][0]{
          title,
          description,
          duration,
          level,
          language,
          price,
          category,
          materials,
          images[]{
            asset->{
              _id,
              url
            }
          },
          instructor->{_id}
        }`;
        const courseData = await client.fetch(courseQuery, { courseId });

        if (!courseData) {
          throw new Error(t('addCourse:errors.courseNotFound'));
        }

        // Verify that the current user is the instructor
        if (courseData.instructor._id !== authData.user.id) {
          throw new Error(t('addCourse:errors.unauthorizedAccess'));
        }

        // Initialize form data
        setFormData({
          title: courseData.title || '',
          description: courseData.description || '',
          duration: courseData.duration || '',
          level: courseData.level || '',
          language: courseData.language || '',
          price: courseData.price ? courseData.price.toString() : '',
          category: courseData.category || '',
          materials: courseData.materials
            ? courseData.materials.map((url) => ({ type: 'link', value: url }))
            : [],
          images: [], // New images to be uploaded
        });

        // Store existing images for display and reference
        setExistingImages(courseData.images || []);

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error:', error.message);
        setError(error.message);
        router.push(`/login?error=${encodeURIComponent(error.message)}`);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuthAndFetchCourse();
  }, [courseId, router, t]);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Image upload handler
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (newImages.length < e.target.files.length) {
        setLocalErrors((prev) => ({
          ...prev,
          images: t('addCourse:errors.onlyImagesAllowed'),
        }));
        return;
      }
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      for (const image of newImages) {
        if (image.size > maxFileSize) {
          setLocalErrors((prev) => ({
            ...prev,
            images: t('addCourse:errors.imageTooLarge'),
          }));
          return;
        }
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
      setLocalErrors((prev) => ({ ...prev, images: '' }));
    }
  };

  // Image drag and drop handlers
  const handleImageDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive((prev) => ({ ...prev, images: true }));
    } else if (e.type === 'dragleave') {
      setDragActive((prev) => ({ ...prev, images: false }));
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, images: false }));

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newImages = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (newImages.length < e.dataTransfer.files.length) {
        setLocalErrors((prev) => ({
          ...prev,
          images: t('addCourse:errors.onlyImagesAllowed'),
        }));
        return;
      }
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      for (const image of newImages) {
        if (image.size > maxFileSize) {
          setLocalErrors((prev) => ({
            ...prev,
            images: t('addCourse:errors.imageTooLarge'),
          }));
          return;
        }
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
      setLocalErrors((prev) => ({ ...prev, images: '' }));
    }
  };

  // Remove image (new or existing)
  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
    setLocalErrors((prev) => ({ ...prev, images: '' }));
  };

  // Material file upload handler
  const handleMaterialFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const maxFileSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxFileSize) {
        setLocalErrors((prev) => ({
          ...prev,
          materials: t('addCourse:errors.fileTooLarge'),
        }));
        return;
      }
      if (!['application/pdf', 'video/mp4', 'video/webm'].includes(file.type)) {
        setLocalErrors((prev) => ({
          ...prev,
          materials: t('addCourse:errors.onlyPDFAndVideoAllowed'),
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, { type: 'file', value: file }],
      }));
      setLocalErrors((prev) => ({ ...prev, materials: '' }));
    }
  };

  // Material drag and drop handlers
  const handleMaterialDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive((prev) => ({ ...prev, materials: true }));
    } else if (e.type === 'dragleave') {
      setDragActive((prev) => ({ ...prev, materials: false }));
    }
  };

  const handleMaterialDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, materials: false }));

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const maxFileSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxFileSize) {
        setLocalErrors((prev) => ({
          ...prev,
          materials: t('addCourse:errors.fileTooLarge'),
        }));
        return;
      }
      if (!['application/pdf', 'video/mp4', 'video/webm'].includes(file.type)) {
        setLocalErrors((prev) => ({
          ...prev,
          materials: t('addCourse:errors.onlyPDFAndVideoAllowed'),
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, { type: 'file', value: file }],
      }));
      setLocalErrors((prev) => ({ ...prev, materials: '' }));
    }
  };

  // Add material link
  const addMaterialLink = () => {
    setFormData((prev) => ({
      ...prev,
      materials: [...prev.materials, { type: 'link', value: '' }],
    }));
    setLocalErrors((prev) => ({ ...prev, materials: '' }));
  };

  // Update material link
  const updateMaterialLink = (index, value) => {
    setFormData((prev) => {
      const updatedMaterials = [...prev.materials];
      updatedMaterials[index] = { ...updatedMaterials[index], value };
      return { ...prev, materials: updatedMaterials };
    });
    setLocalErrors((prev) => ({ ...prev, materials: '' }));
  };

  // Remove material
  const removeMaterial = (index) => {
    setFormData((prev) => {
      const updatedMaterials = [...prev.materials];
      updatedMaterials.splice(index, 1);
      return { ...prev, materials: updatedMaterials };
    });
    setLocalErrors((prev) => ({ ...prev, materials: '' }));
  };

  // Form validation
  const validateFormData = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t('addCourse:errors.titleRequired');
    }
    if (!formData.description.trim()) {
      newErrors.description = t('addCourse:errors.descriptionRequired');
    }
    if (!formData.category) {
      newErrors.category = t('addCourse:errors.categoryRequired');
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      newErrors.price = t('addCourse:errors.priceRequired');
    }
    if (formData.images.length === 0 && existingImages.length === 0) {
      newErrors.images = t('addCourse:errors.imagesRequired');
    }
    if (formData.materials.length === 0) {
      newErrors.materials = t('addCourse:errors.materialsRequired');
    } else {
      formData.materials.forEach((material, index) => {
        if (material.type === 'link' && material.value) {
          try {
            new URL(material.value);
          } catch {
            newErrors.materials = t('addCourse:errors.invalidLink');
          }
        }
      });
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormData()) {
      toast.error(t('addCourse:errors.formInvalid'));
      return;
    }

    if (!userId) {
      toast.error(t('addCourse:errors.userNotAuthenticated'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new images
      const imageAssets = [...existingImages.map((img) => ({
        _type: 'image',
        _key: generateKey(),
        asset: {
          _type: 'reference',
          _ref: img.asset._id,
        },
      }))];

      for (const image of formData.images) {
        const imageAsset = await client.assets.upload('image', image, {
          filename: image.name,
        });
        imageAssets.push({
          _type: 'image',
          _key: generateKey(),
          asset: {
            _type: 'reference',
            _ref: imageAsset._id,
          },
        });
      }

      // Upload material files and convert to URLs
      const materialUrls = [];
      for (const material of formData.materials) {
        if (material.type === 'file') {
          const fileAsset = await client.assets.upload('file', material.value, {
            filename: material.value.name,
          });
          if (fileAsset.url) {
            materialUrls.push(fileAsset.url);
          } else {
            throw new Error('Failed to get URL for uploaded file');
          }
        } else if (material.type === 'link' && material.value.trim()) {
          materialUrls.push(material.value);
        }
      }

      // Prepare course data
      const courseData = {
        title: formData.title,
        description: formData.description,
        duration: formData.duration || '',
        level: formData.level || '',
        language: formData.language || '',
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        materials: materialUrls,
        images: imageAssets,
      };

      // Update course in Sanity
      await client
        .patch(courseId)
        .set(courseData)
        .commit();

      toast.success(t('addCourse:courseUpdatedSuccess'));
      router.push('/courses'); // Redirect to courses page or course details
    } catch (error) {
      console.error('Error updating course:', error.message);
      toast.error(`${t('addCourse:errors.submissionFailed')}: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate unique key for Sanity references
  const generateKey = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-medium text-gray-600">{t('addCourse:loading')}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div
        className={`container max-w-4xl py-8 px-4 sm:px-6 ${
          i18n.language === 'ar' ? 'rtl' : 'ltr'
        }`}
      >
        <div className="mb-10 flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            {t('addCourse:editCourse')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('addCourse:editCourseDescription')}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {t('addCourse:authError')}: {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-12"
          encType="multipart/form-data"
        >
          {/* Basic Information Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
              <Book className={`text-gold ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`} size={28} />
              {t('addCourse:basicCourseInformation')}
            </h2>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                {t('addCourse:courseTitle')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-xl ${
                  localErrors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('addCourse:enterCourseTitle')}
                required
              />
              {localErrors.title && (
                <p className="text-red-500 text-sm mt-1">{localErrors.title}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                {t('addCourse:description')} <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className={`w-full p-3 border rounded-xl ${
                  localErrors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('addCourse:descriptionPlaceholder')}
                required
              />
              {localErrors.description && (
                <p className="text-red-500 text-sm mt-1">{localErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {t('addCourse:duration')}
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-xl"
                  placeholder={t('addCourse:durationPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {t('addCourse:courseLevel')}
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-xl"
                >
                  <option value="">{t('addCourse:selectLevel')}</option>
                  {levelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.label)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-gray-700 font-medium mb-2">
                {t('addCourse:courseLanguage')}
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl"
              >
                <option value="">{t('addCourse:selectLanguage')}</option>
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.label)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Course Content Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
              <FileText className={`text-gold ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`} size={28} />
              {t('addCourse:courseContent')}
            </h2>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                {t('addCourse:courseCategory')} <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-xl ${
                  localErrors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">{t('addCourse:selectCategory')}</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.label)}
                  </option>
                ))}
              </select>
              {localErrors.category && (
                <p className="text-red-500 text-sm mt-1">{localErrors.category}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                {t('addCourse:price')} (SAR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 ${
                    i18n.language === 'ar' ? 'left-5' : 'right-5'
                  } pl-3 flex items-center pointer-events-none`}
                >
                  <span className="text-gray-500">SAR</span>
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full p-3 ${
                    i18n.language === 'ar' ? 'pl-12' : 'pr-12'
                  } border rounded-xl ${
                    localErrors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              {localErrors.price && (
                <p className="text-red-500 text-sm mt-1">{localErrors.price}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {t('addCourse:freeCourseNote')}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                {t('addCourse:courseMaterials')} <span className="text-red-500">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center ${
                  dragActive.materials
                    ? 'border-indigo-500 bg-indigo-50'
                    : localErrors.materials
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                onDragEnter={handleMaterialDrag}
                onDragLeave={handleMaterialDrag}
                onDragOver={handleMaterialDrag}
                onDrop={handleMaterialDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="p-3 bg-gold/10 rounded-full">
                    <Upload className="h-8 w-8 text-gold" />
                  </div>
                  <div className="text-gray-700">
                    <p className="font-medium">{t('addCourse:dragDrop')}</p>
                    <p className="text-sm text-gray-500">{t('addCourse:orBrowse')}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl mt-2 border-gold/20 bg-white hover:text-gold text-black hover:bg-gold/30"
                    onClick={() => document.getElementById('materialFile')?.click()}
                  >
                    {t('addCourse:selectFile')}
                  </Button>
                  <input
                    id="materialFile"
                    type="file"
                    accept=".pdf,video/mp4,video/webm"
                    className="hidden"
                    onChange={handleMaterialFileChange}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t('addCourse:supportedFormats')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 mb-2">
                <label className="block text-gray-700 font-medium">
                  {t('addCourse:materialLinks')}
                </label>
                <Button
                  type="button"
                  onClick={addMaterialLink}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-gold border-gold/20 hover:text-gold hover:bg-gold/30"
                >
                  <Plus size={16} />
                  {t('addCourse:addLink')}
                </Button>
              </div>

              {formData.materials.length === 0 ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-gray-500">
                  {t('addCourse:noMaterials')}
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.materials.map((material, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {material.type === 'link' ? (
                        <input
                          type="url"
                          value={material.value}
                          onChange={(e) => updateMaterialLink(index, e.target.value)}
                          className="flex-1 p-3 border rounded-xl border-gray-300"
                          placeholder={t('addCourse:linkPlaceholder')}
                        />
                      ) : (
                        <div className="flex-1 p-3 bg-gray-50 border rounded-xl border-gray-200 text-gray-700 truncate">
                          {material.value.name}
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMaterial(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <X size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {localErrors.materials && (
                <p className="text-red-500 text-sm mt-1">{localErrors.materials}</p>
              )}
            </div>
          </div>

          {/* Media Materials Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
              <LucideImage className={`text-gold ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`} size={28} />
              {t('addCourse:mediaMaterials')}
            </h2>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                {t('addCourse:courseImages')} <span className="text-red-500">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center ${
                  dragActive.images
                    ? 'border-indigo-500 bg-indigo-50'
                    : localErrors.images
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                onDragEnter={handleImageDrag}
                onDragLeave={handleImageDrag}
                onDragOver={handleImageDrag}
                onDrop={handleImageDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="p-3 bg-gold/10 rounded-full">
                    <Upload className="h-8 w-8 text-gold" />
                  </div>
                  <div className="text-gray-700">
                    <p className="font-medium">{t('addCourse:dragDrop')}</p>
                    <p className="text-sm text-gray-500">{t('addCourse:orBrowse')}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl mt-2 border-gold/20 bg-white hover:text-gold text-black hover:bg-gold/30"
                    onClick={() => document.getElementById('courseImages')?.click()}
                  >
                    {t('addCourse:selectImages')}
                  </Button>
                  <input
                    id="courseImages"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t('addCourse:supportedImageFormats')}
                  </p>
                </div>
              </div>
              {localErrors.images && (
                <p className="text-red-500 text-sm mt-2">{localErrors.images}</p>
              )}
            </div>

            {(formData.images.length > 0 || existingImages.length > 0) && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {existingImages.map((image, index) => (
                  <div
                    key={`existing-${index}`}
                    className="relative border rounded-xl overflow-hidden group"
                  >
                    <LucideImage
                      width={200}
                      height={200}
                      src={image.asset.url}
                      alt={`${t('addCourse:image')} ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index, true)}
                      className={`absolute top-1 ${
                        i18n.language === 'ar' ? 'left-1' : 'right-1'
                      } bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      ×
                    </button>
                    <p className="text-xs truncate p-1 bg-white">Existing Image</p>
                  </div>
                ))}
                {formData.images.map((image, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative border rounded-xl overflow-hidden group"
                  >
                    <LucideImage
                      width={200}
                      height={200}
                      src={URL.createObjectURL(image)}
                      alt={`${t('addCourse:image')} ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className={`absolute top-1 ${
                        i18n.language === 'ar' ? 'left-1' : 'right-1'
                      } bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      ×
                    </button>
                    <p className="text-xs truncate p-1 bg-white">{image.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl flex items-center gap-2 bg-black hover:bg-black/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-xl border-2 border-white border-t-transparent"></div>
                  <span>{t('addCourse:submitting')}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{t('addCourse:saveChanges')}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}