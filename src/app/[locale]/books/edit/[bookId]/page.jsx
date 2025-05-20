'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../../../../../components/layout/Layout';
import { useTranslation } from 'react-i18next';
import { useRouter, useParams } from 'next/navigation';
import { client } from '@/lib/sanity';
import { Book, DollarSign, FileText, Upload, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';

const VALID_USER_TYPE = 'educational_services';

const categories = [
  { value: 'equine_anatomy_physiology', label: { en: 'Equine Anatomy and Physiology', ar: 'تشريح وفسيولوجيا الخيول' } },
  { value: 'equine_nutrition', label: { en: 'Equine Nutrition', ar: 'تغذية الخيول' } },
  { value: 'stable_management', label: { en: 'Stable Management', ar: 'إدارة الإسطبلات' } },
  { value: 'horse_care_grooming', label: { en: 'Horse Care and Grooming', ar: 'العناية بالخيول وتزيينها' } },
  { value: 'riding_instruction', label: { en: 'Riding Instruction (English and Western)', ar: 'تعليم الركوب (إنجليزي وغربي)' } },
  { value: 'equine_health_first_aid', label: { en: 'Equine Health and First Aid', ar: 'الرعاية الصحية والإسعافات الأولية' } },
  { value: 'equine_reproduction_breeding', label: { en: 'Equine Reproduction and Breeding', ar: 'التكاثر والتربية' } },
  { value: 'horse_training_behavior', label: { en: 'Horse Training and Behavior', ar: 'تدريب الخيول وسلوكها' } },
  { value: 'equine_business_management', label: { en: 'Equine Business Management', ar: 'إدارة الأعمال التجارية للخيول' } },
  { value: 'equine_law_ethics', label: { en: 'Equine Law and Ethics', ar: 'القانون والأخلاقيات المتعلقة بالخيول' } },
  { value: 'horse_show_management_judging', label: { en: 'Horse Show Management and Judging', ar: 'إدارة عروض الخيول والتحكيم' } },
  { value: 'equine_assisted_services', label: { en: 'Equine-Assisted Services', ar: 'الخدمات بمساعدة الخيول' } },
  { value: 'equine_competition_disciplines', label: { en: 'Equine Competition Disciplines', ar: 'تخصصات المنافسة' } },
  { value: 'equine_recreation_tourism', label: { en: 'Equine Recreation and Tourism', ar: 'الترفيه والسياحة بالخيول' } },
  { value: 'equine_rescue_rehabilitation', label: { en: 'Equine Rescue and Rehabilitation', ar: 'إنقاذ وإعادة تأهيل الخيول' } },
  { value: 'equine_sports_medicine', label: { en: 'Equine Sports Medicine', ar: 'طب الرياضة للخيول' } },
  { value: 'equine_facility_design_management', label: { en: 'Equine Facility Design and Management', ar: 'تصميم وإدارة مرافق الخيول' } },
  { value: 'equine_marketing_promotion', label: { en: 'Equine Marketing and Promotion', ar: 'التسويق والترويج للخيول' } },
  { value: 'equine_photography_videography', label: { en: 'Equine Photography and Videography', ar: 'تصوير وتسجيل فيديو للخيول' } },
  { value: 'equine_journalism_writing', label: { en: 'Equine Journalism and Writing', ar: 'الصحافة والكتابة عن الخيول' } },
  { value: 'equine_history_culture', label: { en: 'Equine History and Culture', ar: 'تاريخ وثقافة الخيول' } },
  { value: 'equine_environmental_stewardship', label: { en: 'Equine Environmental Stewardship', ar: 'الإشراف البيئي للخيول' } },
  { value: 'equine_technology_innovation', label: { en: 'Equine Technology and Innovation', ar: 'تكنولوجيا وابتكار الخيول' } },
  { value: 'equine_entrepreneurship', label: { en: 'Equine Entrepreneurship', ar: 'ريادة الأعمال في مجال الخيول' } },
  { value: 'equine_dentistry', label: { en: 'Equine Podiatry', ar: 'العناية بالحوافر' } },
  { value: 'equine_podiatry', label: { en: 'Equine Podiatry', ar: 'العناية بالحوافر' } },
  { value: 'english_riding', label: { en: 'English Riding', ar: 'الركوب الإنجليزي' } },
  { value: 'western_riding', label: { en: 'Western Riding', ar: 'الركوب الغربي' } },
  { value: 'jumping_hunter', label: { en: 'Jumping and Hunter', ar: 'القفز والصيد' } },
  { value: 'other', label: { en: 'Other', ar: 'أخرى' } },
];

const EditBook = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { bookId } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: '',
    file: null,
    accessLink: '',
    images: [],
    category: '',
    price: '',
  });
  const [localErrors, setLocalErrors] = useState({
    title: '',
    description: '',
    language: '',
    file: '',
    accessLink: '',
    images: '',
    category: '',
    price: '',
  });
  const [dragActive, setDragActive] = useState(false);
  const [userId, setUserId] = useState(null);

  // Authentication and authorization check
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Verify authentication
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        if (data.authenticated) {
          // Fetch userType and verify user
          const userQuery = `*[_type == "user" && _id == $userId]{ userType }[0]`;
          const userParams = { userId: data.user.id };
          const userData = await client.fetch(userQuery, userParams);

          if (!userData) {
            throw new Error('User not found in database.');
          }

          if (userData.userType !== VALID_USER_TYPE) {
            throw new Error('Invalid user type. Only Educational Services users can access this page.');
          }

          setUserId(data.user.id);

          // Fetch book data and verify ownership
          const bookQuery = `*[_type == "book" && _id == $bookId]{ 
            title, 
            description, 
            language, 
            accessLink, 
            price, 
            category, 
            images[] { asset->{ url } }, 
            file { asset->{ url } }, 
            author->{ _id } 
          }[0]`;
          const bookParams = { bookId };
          const bookData = await client.fetch(bookQuery, bookParams);

          if (!bookData) {
            throw new Error('Book not found.');
          }

          if (bookData.author._id !== data.user.id) {
            throw new Error('You are not authorized to edit this book.');
          }

          // Populate form data
          setFormData({
            title: bookData.title || '',
            description: bookData.description || '',
            language: bookData.language || '',
            file: null, // File will be re-uploaded if changed
            accessLink: bookData.accessLink || '',
            images: bookData.images?.map(img => ({
              url: img.asset.url,
              file: null,
            })) || [],
            category: bookData.category || '',
            price: bookData.price?.toString() || '',
          });

          setIsAuthenticated(true);
        } else {
          throw new Error('User not authenticated.');
        }
      } catch (error) {
        console.error('Auth verification failed:', error.message);
        setError(error.message);
        router.push(`/login?error=${encodeURIComponent(error.message)}`);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router, bookId]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxFileSize) {
        setLocalErrors((prev) => ({
          ...prev,
          file: t('addBook:fileTooLarge'),
        }));
        return;
      }
      if (!['application/pdf', 'application/epub+zip'].includes(file.type)) {
        setLocalErrors((prev) => ({
          ...prev,
          file: t('addBook:onlyPDFAndEPUBAllowed'),
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        file,
        accessLink: '', // Clear accessLink if file is selected
      }));
      setLocalErrors((prev) => ({ ...prev, file: '', accessLink: '' }));
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxFileSize) {
        setLocalErrors((prev) => ({
          ...prev,
          file: t('addBook:fileTooLarge'),
        }));
        return;
      }
      if (!['application/pdf', 'application/epub+zip'].includes(file.type)) {
        setLocalErrors((prev) => ({
          ...prev,
          file: t('addBook:onlyPDFAndEPUBAllowed'),
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        file,
        accessLink: '',
      }));
      setLocalErrors((prev) => ({ ...prev, file: '', accessLink: '' }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (newImages.length < e.target.files.length) {
        setLocalErrors((prev) => ({
          ...prev,
          images: t('addBook:onlyImagesAllowed'),
        }));
        return;
      }
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      for (const image of newImages) {
        if (image.size > maxFileSize) {
          setLocalErrors((prev) => ({
            ...prev,
            images: t('addBook:imageTooLarge'),
          }));
          return;
        }
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages.map(file => ({ url: null, file }))],
      }));
      setLocalErrors((prev) => ({ ...prev, images: '' }));
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // Remove image
  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
    setLocalErrors((prev) => ({ ...prev, images: '' }));
  };

  // Validate URL
  const validateURL = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: '',
      description: '',
      file: '',
      accessLink: '',
      images: '',
      category: '',
      price: '',
    };

    if (!formData.title.trim()) {
      newErrors.title = t('addBook:errors.titleRequired');
      isValid = false;
    }
    if (!formData.description.trim()) {
      newErrors.description = t('addBook:errors.descriptionRequired');
      isValid = false;
    }
    if (!formData.category) {
      newErrors.category = t('addBook:errors.categoryRequired');
      isValid = false;
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      newErrors.price = t('addBook:errors.priceRequired');
      isValid = false;
    }
    if (formData.images.length === 0) {
      newErrors.images = t('addBook:errors.imagesRequired');
      isValid = false;
    }
    if (!formData.file && !formData.accessLink) {
      newErrors.file = t('addBook:errors.fileOrLinkRequired');
      newErrors.accessLink = t('addBook:errors.fileOrLinkRequired');
      isValid = false;
    }
    if (formData.accessLink && !validateURL(formData.accessLink)) {
      newErrors.accessLink = t('addBook:errors.invalidLink');
      isValid = false;
    }

    setLocalErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t('addBook:errors.formInvalid'));
      return;
    }

    if (!userId) {
      toast.error(t('addBook:errors.userNotAuthenticated'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload file to Sanity if changed
      let fileAsset = null;
      if (formData.file) {
        fileAsset = await client.assets.upload('file', formData.file, {
          filename: formData.file.name,
        });
      }

      // Upload new images to Sanity
      const imageAssets = [];
      for (const image of formData.images) {
        if (image.file) {
          const imageAsset = await client.assets.upload('image', image.file, {
            filename: image.file.name,
          });
          imageAssets.push({
            _type: 'image',
            _key: Math.random().toString(36).substr(2, 9),
            asset: {
              _type: 'reference',
              _ref: imageAsset._id,
            },
          });
        } else {
          // Retain existing images
          const existingImage = await client.fetch(
            `*[_type == "book" && _id == $bookId]{ images[] { asset->{ _id } } }[0].images[${formData.images.indexOf(image)}].asset._id`,
            { bookId }
          );
          imageAssets.push({
            _type: 'image',
            _key: Math.random().toString(36).substr(2, 9),
            asset: {
              _type: 'reference',
              _ref: existingImage,
            },
          });
        }
      }

      // Update book document
      const bookData = {
        title: formData.title,
        description: formData.description,
        language: formData.language || '',
        accessLink: formData.accessLink || '',
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        file: fileAsset
          ? {
              _type: 'file',
              asset: {
                _type: 'reference',
                _ref: fileAsset._id,
              },
            }
          : formData.file
          ? undefined
          : null,
        images: imageAssets,
      };

      // Patch book in Sanity
      await client
        .patch(bookId)
        .set(bookData)
        .commit();

      toast.success(t('addBook:bookUpdatedSuccess'));
      router.push('/books');
    } catch (error) {
      console.error('Error updating book in Sanity:', error);
      toast.error(t('addBook:errors.submissionFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-medium text-gray-600">{t('addBook:loading')}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isRTL = i18n.language === 'ar';

  return (
    <Layout>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {t('addBook:authError')}: {error}
        </div>
      )}
      <div className={`container max-w-4xl py-8 px-4 sm:px-6 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="mb-10 flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            {t('addBook:editBook')}
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-12" encType="multipart/form-data">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gold/20">
            {/* Basic Info */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                <Book className={`text-gold ${isRTL ? 'ml-2' : 'mr-2'}`} size={28} />
                {t('addBook:basicBookInformation')}
              </h2>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  {t('addBook:bookTitle')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-xl ${localErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {localErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{localErrors.title}</p>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  {t('addBook:description')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className={`w-full p-3 border rounded-xl ${localErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {localErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{localErrors.description}</p>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  {t('addBook:language')}
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-xl"
                />
              </div>
            </div>

            {/* Media Upload */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                <Image 
                  className={`text-gold ${isRTL ? 'ml-2' : 'mr-2'}`} 
                  size={28}
                  alt={t('addBook:mediaIcon')}
                  width={28}
                  height={28}
                />
                {t('addBook:mediaFileUpload')}
              </h2>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  {t('addBook:bookFile')}
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-50'
                      : localErrors.file
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-3 bg-gold/10 rounded-full">
                      <FileText className="h-8 w-8 text-gold" />
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-xl mt-2 border-gold/20 bg-white hover:text-gold text-black hover:bg-gold/30"
                      onClick={() => document.getElementById('bookFile')?.click()}
                    >
                      {t('addBook:selectFile')}
                    </Button>
                    <input
                      id="bookFile"
                      type="file"
                      accept=".pdf,.epub"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {formData.file && (
                      <p className="text-sm text-green-600 mt-2">
                        {t('addBook:selectedFile')}: {formData.file.name}
                      </p>
                    )}
                    {localErrors.file && (
                      <p className="text-red-500 text-sm mt-2">{localErrors.file}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  {t('addBook:bookCoverImages')} <span className="text-red-500">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center ${
                    localErrors.images ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <Upload className="mx-auto text-gray-400 mb-2" size={36} />
                  <input
                    type="file"
                    id="bookImages"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <Button
                    variant="outline"
                    className="rounded-xl mt-2 border-gold/20 bg-white hover:text-gold text-black hover:bg-gold/30"
                    onClick={() => document.getElementById('bookImages')?.click()}
                  >
                    {t('addBook:selectImages')}
                  </Button>
                  {localErrors.images && (
                    <p className="text-red-500 text-sm mt-2">{localErrors.images}</p>
                  )}
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative border rounded-xl overflow-hidden group">
                        <Image
                          src={image.url || URL.createObjectURL(image.file)}
                          alt={`${t('addBook:cover')} ${index + 1}`}
                          className="w-full h-32 object-cover"
													width={200}
													height={128}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className={`absolute top-1 ${isRTL ? 'left-1' : 'right-1'} bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
                        >
                          ×
                        </button>
                        <p className="text-xs truncate p-1 bg-white">
                          {image.file ? image.file.name : 'Existing Image'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  {t('addBook:accessLink')}
                </label>
                <input
                  type="url"
                  name="accessLink"
                  value={formData.accessLink}
                  onChange={handleInputChange}
                  className={`rounded-xl w-full p-3 border ${
                    localErrors.accessLink ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!!formData.file}
                />
                {localErrors.accessLink && (
                  <p className="text-red-500 text-sm mt-2">{localErrors.accessLink}</p>
                )}
              </div>
            </div>

            {/* Pricing and Category */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                <DollarSign className={`text-gold ${isRTL ? 'ml-2' : 'mr-2'}`} size={28} />
                {t('addBook:pricingCategory')}
              </h2>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  {t('addBook:bookCategory')} <span className="text-red-500">*</span>
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
                  <option value="">{t('addBook:selectCategory')}</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label[i18n.language] || category.label.en}
                    </option>
                  ))}
                </select>
                {localErrors.category && (
                  <p className="text-red-500 text-sm mt-2">{localErrors.category}</p>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  {t('addBook:price')} (SAR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 ${isRTL ? 'left-5' : 'right-5'} pl-3 flex items-center pointer-events-none`}
                  >
                    <span className="text-gray-500">SAR</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`w-full p-3 ${isRTL ? 'pl-12' : 'pr-12'} border rounded-xl ${
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
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl flex items-center gap-2 bg-black hover:bg-black/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-xl border-2 border-white border-t-transparent"></div>
                  <span>{t('addBook:submitting')}</span>
                </>
              ) : (
                <>
                  <Tag size={16} />
                  <span>{t('addBook:updateBook')}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditBook;
