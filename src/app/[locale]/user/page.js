"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BsPersonWorkspace, BsPersonVcard, BsCalendarDate, BsGenderAmbiguous, BsCheckCircleFill } from 'react-icons/bs';
import { MdCloudUpload, MdDelete, MdAttachFile, MdDescription, MdVerified, MdKeyboardArrowDown, MdAccessTime, MdDirectionsBike, MdTerrain, MdFitnessCenter, MdOutlineError, MdLocationOn, MdPerson, MdSportsMartialArts, MdNavigateNext, MdNavigateBefore, MdAdd, MdLocalHospital, MdMedicalServices, MdSave } from 'react-icons/md';
import { FaHorse, FaIdCard, FaMapMarkedAlt, FaChevronLeft, FaCheckCircle, FaStethoscope, FaCamera, FaShoppingCart, FaUsers, FaBook, FaRunning, FaBriefcase, FaClipboardCheck } from 'react-icons/fa';
import { RiShieldCheckLine } from 'react-icons/ri';
import { Eye, EyeOff } from 'lucide-react';
import Layout from 'components/layout/Layout';
import client from '@/lib/sanity';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Form state management
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [userId, setUserId] = useState(null);
  const totalSteps = 6;

  // Form data
  const [formData, setFormData] = useState({
    signUp: { userName: '', email: '', password: '', confirmPassword: '', verificationCode: '' },
    personalInfo: { userType: '', phone: '', imageFile: null, imagePreview: null, gender: '', birthDate: '' },
    locationInfo: { governorate: '', country: '', city: '', addressDetails: '', addressLink: '' },
    identityInfo: { nationalNumber: '', fullName: '' },
    riderDetails: { eventTypes: [], riderLevel: '', experienceText: '', yearsOfExperience: 0, certifications: [{ description: '', file: null }], healthCondition: '', medicalCertificates: [] },
    providerDetails: { services: [] },
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Dropdown data from Sanity
  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Services list for providers with icons and translation keys
  const providerServices = [
    { key: 'user:stable', icon: FaHorse },
    { key: 'user:horse trainer', icon: MdSportsMartialArts },
    { key: 'user:horse haircut', icon: MdFitnessCenter },
    { key: 'user:horse trimmer', icon: MdFitnessCenter },
    { key: 'user:horse housing', icon: FaBriefcase },
    { key: 'user:housing (caravan)', icon: FaBriefcase },
    { key: 'user:horse catering', icon: FaShoppingCart },
    { key: 'user:horse courses maker or provider', icon: FaBook },
    { key: 'user:e-library provider', icon: FaBook },
    { key: 'user:horse doctor', icon: FaStethoscope },
    { key: 'user:judge', icon: FaClipboardCheck },
    { key: 'user:marketer and promoter', icon: FaUsers },
    { key: 'user:commentator', icon: FaUsers },
    { key: 'user:consultant', icon: FaUsers },
    { key: 'user:supplier', icon: FaShoppingCart },
    { key: 'user:contractor', icon: FaBriefcase },
    { key: 'user:trip organizer', icon: FaRunning },
    { key: 'user:competition organizer', icon: FaRunning },
    { key: 'user:photographer', icon: FaCamera },
  ];

  // Fetch Sanity data and check authentication on mount
  useEffect(() => {
    const fetchSanityData = async () => {
      try {
        // Fetch countries with name_en and name_ar
        const countryQuery = '*[_type == "country"]{ _id, name_en, name_ar }';
        const fetchedCountries = await client.fetch(countryQuery);
        console.log('Fetched countries:', fetchedCountries); // Debug
        setCountries(fetchedCountries);

        // Fetch governorates
        const governorateQuery = '*[_type == "governorate"]{ _id, name_en, name_ar, country->{_id} }';
        const fetchedGovernorates = await client.fetch(governorateQuery);
        setGovernorates(fetchedGovernorates.map(g => ({
          id: g._id,
          name_en: g.name_en,
          name_ar: g.name_ar,
          countryId: g.country?._id,
        })));

        // Fetch cities
        const cityQuery = '*[_type == "city"]{ _id, name_en, name_ar, governorate->{_id} }';
        const fetchedCities = await client.fetch(cityQuery);
        setCities(fetchedCities.map(c => ({
          id: c._id,
          name_en: c.name_en,
          name_ar: c.name_ar,
          governorateId: c.governorate?._id,
        })));
      } catch (err) {
        console.error('Error fetching Sanity data:', err);
        setError(t('user:error.fetchDataFailed'));
      }
    };

    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        console.log('Auth response:', data);

        if (data.authenticated) {
          setAuthenticated(true);
          setUserId(data.user.id);
          console.log('User authenticated, ID:', data.user.id);

          // Fetch user from Sanity to check verification and profile completion
          const userQuery = `*[_type == "user" && _id == $userId][0]{isEmailVerified, isProfileCompleted, email}`;
          let userData;
          try {
            userData = await client.fetch(userQuery, { userId: data.user.id });
            console.log('Sanity user data:', userData);
          } catch (sanityError) {
            console.error('Sanity fetch failed:', sanityError);
            setStep(2);
            return;
          }

          if (userData) {
            if (userData.isProfileCompleted) {
              router.push('/'); // Redirect to home if profile is completed
              return;
            }
            if (userData.isEmailVerified) {
              setIsEmailVerified(true);
              setStep(3);
              console.log('Email verified, set to Step 3');
            } else {
              setStep(2);
              console.log('Email not verified, set to Step 2');
            }
            // Store the email from Sanity for verification
            setFormData(prev => ({
              ...prev,
              signUp: { ...prev.signUp, email: userData.email },
            }));
          } else {
            console.warn('No user found in Sanity for ID:', data.user.id);
            setStep(2);
          }
        } else {
          console.log('Not authenticated, set to Step 1');
          setStep(1);
        }
      } catch (err) {
        console.error('Error in checkAuthStatus:', err);
        setStep(1);
      }
    };

    document.body.dir = isRTL ? 'rtl' : 'ltr';
    fetchSanityData();
    checkAuthStatus();
  }, [t, isRTL, router]);


  // Handlers
  const handleChange = (stepName, field, value) => {
    setFormData(prev => ({
      ...prev,
      [stepName]: { ...prev[stepName], [field]: value }
    }));
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const handleNestedChange = (stepName, field, index, subField, value) => {
    const updatedArray = [...formData[stepName][field]];
    updatedArray[index][subField] = value;
    setFormData(prev => ({
      ...prev,
      [stepName]: { ...prev[stepName], [field]: updatedArray }
    }));
  };

  const handleImageChange = (file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, imageFile: t('user:error.imageSize') }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, imageFile: t('user:error.imageType') }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            imageFile: file,
            imagePreview: reader.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        imageFile: null,
        imagePreview: null
      }
    }));
  };

  const handleEventTypeToggle = (type) => {
    const currentTypes = formData.riderDetails.eventTypes;
    handleChange('riderDetails', 'eventTypes',
      currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type]
    );
  };

  const handleServiceToggle = (service) => {
    const currentServices = formData.providerDetails.services;
    handleChange('providerDetails', 'services',
      currentServices.includes(service)
        ? currentServices.filter(s => s !== service)
        : [...currentServices, service]
    );
  };

  const addCertification = () => {
    handleChange('riderDetails', 'certifications', [
      ...formData.riderDetails.certifications,
      { description: '', file: null }
    ]);
  };

  const removeCertification = (index) => {
    const updatedCerts = formData.riderDetails.certifications.filter((_, i) => i !== index);
    handleChange('riderDetails', 'certifications', updatedCerts);
  };

  const handleMedicalCertChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      handleChange('riderDetails', 'medicalCertificates', [
        ...formData.riderDetails.medicalCertificates,
        ...newFiles
      ]);
    }
  };

  const removeMedicalCert = (index) => {
    const updatedCerts = formData.riderDetails.medicalCertificates.filter((_, i) => i !== index);
    handleChange('riderDetails', 'medicalCertificates', updatedCerts);
  };

  // Enhanced Validation
  const validateStep = (currentStep) => {
    let stepValid = true;
    let newErrors = {};

    switch (currentStep) {
      case 1:
        const su = formData.signUp;
        if (!su.userName) newErrors.userName = t('user:usernameRequired');
        else if (su.userName.length < 3) newErrors.userName = t('user:usernameMinLength');
        if (!su.email) newErrors.email = t('user:emailRequired');
        else if (!/\S+@\S+\.\S+/.test(su.email)) newErrors.email = t('user:validEmail');
        if (!su.password) newErrors.password = t('user:passwordRequired');
        else if (su.password.length < 6) newErrors.password = t('user:passwordMinLength');
        if (su.password !== su.confirmPassword) newErrors.confirmPassword = t('user:passwordsDoNotMatch');
        if (!isChecked) newErrors.terms = t('user:acceptTerms');
        stepValid = Object.keys(newErrors).length === 0;
        break;
      case 2:
        const su2 = formData.signUp;
        if (!su2.verificationCode || su2.verificationCode.length !== 6) newErrors.verificationCode = t('user:validCodeRequired');
        stepValid = Object.keys(newErrors).length === 0;
        break;
      case 3:
        const pi = formData.personalInfo;
        if (!pi.userType) newErrors.userType = t('user:error.userTypeRequired');
        if (!pi.phone || pi.phone.length < 10) newErrors.phone = t('user:error.phoneRequired');
        if (!pi.imageFile) newErrors.imageFile = t('user:error.imageRequired');
        if (!pi.gender) newErrors.gender = t('user:error.genderRequired');
        if (!pi.birthDate) newErrors.birthDate = t('user:error.birthDateRequired');
        else {
          const birthDate = new Date(pi.birthDate);
          const today = new Date();
          if (birthDate > today) newErrors.birthDate = t('user:error.birthDateFuture');
        }
        stepValid = Object.keys(newErrors).length === 0;
        break;
      case 4:
        const li = formData.locationInfo;
        if (!li.country) newErrors.country = t('user:error.countryRequired');
        if (!li.governorate) newErrors.governorate = t('user:error.governorateRequired');
        if (!li.city) newErrors.city = t('user:error.cityRequired');
        if (!li.addressDetails || li.addressDetails.length < 10) newErrors.addressDetails = t('user:error.addressDetailsRequired');
        if (!li.addressLink) newErrors.addressLink = t('user:error.addressLinkRequired');
        else if (!/^(https?:\/\/)/i.test(li.addressLink)) newErrors.addressLink = t('user:error.invalidLink');
        stepValid = Object.keys(newErrors).length === 0;
        break;
      case 5:
        const ii = formData.identityInfo;
        if (!ii.fullName) newErrors.fullName = t('user:error.fullNameRequired');
        else if (ii.fullName.split(' ').filter(Boolean).length < 3) newErrors.fullName = t('user:error.fullNameMinParts');
        if (!ii.nationalNumber) newErrors.nationalNumber = t('user:error.nationalNumberRequired');
        else if (!/^\d{10,14}$/.test(ii.nationalNumber)) newErrors.nationalNumber = t('user:error.invalidNationalNumber');
        stepValid = Object.keys(newErrors).length === 0;
        break;
      case 6:
        if (formData.personalInfo.userType === 'rider') {
          const rd = formData.riderDetails;
          if (!rd.riderLevel) newErrors.riderLevel = t('user:error.riderLevelRequired');
          if (rd.eventTypes.length === 0) newErrors.eventTypes = t('user:error.eventTypesRequired');
          if (rd.yearsOfExperience < 0) newErrors.yearsOfExperience = t('user:error.yearsOfExperienceInvalid');
          stepValid = Object.keys(newErrors).length === 0;
        } else if (formData.personalInfo.userType === 'provider') {
          const pd = formData.providerDetails;
          if (pd.services.length === 0) newErrors.services = t('user:error.servicesRequired');
          stepValid = Object.keys(newErrors).length === 0;
        }
        break;
    }

    setErrors(newErrors);
    setIsFormValid(stepValid);
    return stepValid;
  };

  // Sign-Up Handler with Auto-Login
  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      const signupResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.signUp.email,
          password: formData.signUp.password,
          userName: formData.signUp.userName,
        }),
      });

      const signupData = await signupResponse.json();
      if (!signupResponse.ok) throw new Error(signupData.message || t('user:registrationFailed'));

      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.signUp.email,
          password: formData.signUp.password,
        }),
      });

      const loginData = await loginResponse.json();
      if (!loginResponse.ok) throw new Error(loginData.message || t('user:loginFailed'));

      setUserId(loginData.userId);
      setAuthenticated(true);
      localStorage.setItem('userId', loginData.userId);
      await sendVerificationCode(formData.signUp.email);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Verification Code Handlers
  const sendVerificationCode = async (emailFromForm = null) => {
    try {
      // Fetch email from Sanity if authenticated, otherwise use form email
      let email = emailFromForm;
      if (!email && authenticated && userId) {
        const userQuery = `*[_type == "user" && _id == $userId][0]{email}`;
        const userData = await client.fetch(userQuery, { userId });
        email = userData?.email;
      }
      if (!email) throw new Error(t('user:noEmailFound'));

      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error(t('user:sendCodeFailed'));
    } catch (err) {
      setError(err.message);
    }
  };

  const resendVerificationCode = async () => {
    setIsLoading(true);
    await sendVerificationCode();
    setIsLoading(false);
  };

  const verifyCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.signUp.email,
          code: formData.signUp.verificationCode,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || t('user:invalidCode'));

      await client.patch(userId).set({ isEmailVerified: true }).commit();
      setIsEmailVerified(true);
      setStep(3);
    } catch (err) {
      setErrors({ verificationCode: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    const isValid = validateStep(step);
    if (!isValid) return;

    if (step === 1) {
      await handleSignUp();
    } else if (step === 2) {
      await verifyCode();
    } else if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1 && !isEmailVerified) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    } else if (isEmailVerified && step > 3) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    } else if (isEmailVerified) {
      setMessage(t('user:emailAlreadyVerified'));
    }
  };

  // Handle final form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setIsLoading(true);

    try {
      // Prepare user data
      const userData = {
        _type: 'user',
        isProfileCompleted: true,
      };

      // Personal Info
      if (formData.personalInfo.phone) userData.phoneNumber = formData.personalInfo.phone;
      if (formData.personalInfo.gender) userData.kind = formData.personalInfo.gender;
      if (formData.personalInfo.birthDate) userData.birthDate = formData.personalInfo.birthDate;
      if (formData.personalInfo.userType) userData.userType = formData.personalInfo.userType;

      // Location Info (References)
      if (formData.locationInfo.country) userData.country = { _type: 'reference', _ref: formData.locationInfo.country };
      if (formData.locationInfo.governorate) userData.governorate = { _type: 'reference', _ref: formData.locationInfo.governorate };
      if (formData.locationInfo.city) userData.city = { _type: 'reference', _ref: formData.locationInfo.city };
      if (formData.locationInfo.addressDetails) userData.addressDetails = formData.locationInfo.addressDetails;
      if (formData.locationInfo.addressLink) userData.addressLink = formData.locationInfo.addressLink;

      // Identity Info
      if (formData.identityInfo.nationalNumber) userData.nationalNumber = formData.identityInfo.nationalNumber;
      if (formData.identityInfo.fullName) userData.fullName = formData.identityInfo.fullName;

      // Rider Details
      if (formData.personalInfo.userType === 'rider') {
        const rd = formData.riderDetails;
        userData.riderDetails = {
          eventTypes: rd.eventTypes,
          riderLevel: rd.riderLevel || '',
          experienceText: rd.experienceText || '',
          yearsOfExperience: rd.yearsOfExperience || 0,
          certifications: rd.certifications.map(cert => ({
            description: cert.description || '',
          })),
          healthCondition: rd.healthCondition || '',
          medicalCertificates: [],
        };
        // Upload certification and medical certificate files (unchanged)
        if (rd.certifications.length > 0) {
          const certUploads = await Promise.all(
            rd.certifications.map(async (cert, index) => {
              if (cert.file) {
                const fileAsset = await client.assets.upload('file', cert.file, { filename: `${userId}-cert-${index}` });
                return {
                  _type: 'object',
                  description: cert.description || '',
                  file: { _type: 'file', asset: { _type: 'reference', _ref: fileAsset._id } },
                };
              }
              return { _type: 'object', description: cert.description || '' };
            })
          );
          userData.riderDetails.certifications = certUploads;
        }
        if (rd.medicalCertificates.length > 0) {
          const medCertUploads = await Promise.all(
            rd.medicalCertificates.map(async (file, index) => {
              const fileAsset = await client.assets.upload('file', file, { filename: `${userId}-med-cert-${index}` });
              return { _type: 'file', asset: { _type: 'reference', _ref: fileAsset._id } };
            })
          );
          userData.riderDetails.medicalCertificates = medCertUploads;
        }
      }

      // Provider Details
      if (formData.personalInfo.userType === 'provider') {
        userData.providerDetails = {
          offeredServices: formData.providerDetails.offeredServices,
        };

        // Create basic services documents
        const serviceDocs = await Promise.all(
          formData.providerDetails.offeredServices.map(async (serviceType) => {
            const serviceData = {
              _type: 'services',
              providerRef: { _type: 'reference', _ref: userId },
              serviceType,
              name_en: serviceType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), // e.g., "horse_trainer" -> "Horse Trainer"
              name_ar: providerServices.find(s => s.key === `user:${serviceType}`).title.split(' || ')[1], // Extract Arabic name
              country: formData.locationInfo.country ? { _type: 'reference', _ref: formData.locationInfo.country } : undefined,
              government: formData.locationInfo.governorate ? { _type: 'reference', _ref: formData.locationInfo.governorate } : undefined,
              city: formData.locationInfo.city ? { _type: 'reference', _ref: formData.locationInfo.city } : undefined,
              statusAdminApproved: false, // Default, requires admin approval
              isMainService: false, // Default
            };
            return client.create(serviceData);
          })
        );
        console.log('Created service documents:', serviceDocs);
      }

      // Upload profile image
      if (formData.personalInfo.imageFile) {
        const imageAsset = await client.assets.upload('image', formData.personalInfo.imageFile, { filename: `${userId}-profile-image` });
        userData.image = { _type: 'image', asset: { _type: 'reference', _ref: imageAsset._id } };
      }

      // Patch user document
      await client.patch(userId).set(userData).commit();

      // Success handling
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setStep(1);
        setFormData({
          signUp: { userName: '', email: '', password: '', confirmPassword: '', verificationCode: '' },
          personalInfo: { userType: '', phone: '', imageFile: null, imagePreview: null, gender: '', birthDate: '' },
          locationInfo: { governorate: '', country: '', city: '', addressDetails: '', addressLink: '' },
          identityInfo: { nationalNumber: '', fullName: '' },
          riderDetails: { eventTypes: [], riderLevel: '', experienceText: '', yearsOfExperience: 0, certifications: [{ description: '', file: null }], healthCondition: '', medicalCertificates: [] },
          providerDetails: { offeredServices: [] },
        });
        router.push(formData.personalInfo.userType === 'provider' ? '/profile' : '/');
      }, 3000);
    } catch (err) {
      console.error('Submission error:', err);
      setError(t('user:error.profileCompletionError'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        const su = formData.signUp;
        return (
          <div className="space-y-6">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-2'}`}>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                <MdPerson className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold ${isRTL ? 'font-arabic mr-3' : ''}`}>{t('user:authTitle')}</h2>
            </div>
            {error && (
              <div className={`p-3 bg-red-100 text-red-700 rounded ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 gap-6">
              <div className="flex px-4 bg-blueGray-50 rounded border border-gray-200">
                <input
                  type="text"
                  name="userName"
                  value={su.userName}
                  onChange={(e) => handleChange('signUp', 'userName', e.target.value)}
                  placeholder={t('user:username')}
                  className={`w-full py-4 text-sm placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none ${isRTL ? 'text-right font-arabic pr-2' : 'text-left pl-2'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              {errors.userName && <p className={`text-red-500 text-xs ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.userName}</p>}

              <div className="flex px-4 bg-blueGray-50 rounded border border-gray-200">
                <input
                  type="email"
                  name="email"
                  value={su.email}
                  onChange={(e) => handleChange('signUp', 'email', e.target.value)}
                  placeholder={t('user:email')}
                  className={`w-full py-4 text-sm placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none ${isRTL ? 'text-right font-arabic pr-2' : 'text-left pl-2'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              {errors.email && <p className={`text-red-500 text-xs ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.email}</p>}

              <div className="flex px-4 bg-blueGray-50 rounded border border-gray-200">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={su.password}
                  onChange={(e) => handleChange('signUp', 'password', e.target.value)}
                  placeholder={t('user:password')}
                  className={`w-full py-4 text-sm placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none ${isRTL ? 'text-right font-arabic pr-2' : 'text-left pl-2'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <button type="button" onClick={() => togglePasswordVisibility('password')} className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
                  {showPassword ? <EyeOff className="h-6 w-6 text-blueGray-300" /> : <Eye className="h-6 w-6 text-blueGray-300" />}
                </button>
              </div>
              {errors.password && <p className={`text-red-500 text-xs ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.password}</p>}

              <div className="flex px-4 bg-blueGray-50 rounded border border-gray-200">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={su.confirmPassword}
                  onChange={(e) => handleChange('signUp', 'confirmPassword', e.target.value)}
                  placeholder={t('user:confirmPassword')}
                  className={`w-full py-4 text-sm placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none ${isRTL ? 'text-right font-arabic pr-2' : 'text-left pl-2'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <button type="button" onClick={() => togglePasswordVisibility('confirm')} className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
                  {showConfirmPassword ? <EyeOff className="h-6 w-6 text-blueGray-300" /> : <Eye className="h-6 w-6 text-blueGray-300" />}
                </button>
              </div>
              {errors.confirmPassword && <p className={`text-red-500 text-xs ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.confirmPassword}</p>}

              <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <label className={`inline-flex text-sm ${isRTL ? 'font-arabic' : ''}`}>
                  <input
                    type="checkbox"
                    className="form-checkbox custom-checkbox"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                  />
                  <span className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
                    {t('user:agreeTo')}
                    <Link href="/privacy-policy" className="underline hover:text-blueGray-500">
                      {t('user:privacyPolicy')}
                    </Link>
                    {" "}
                    {t('user:and')}
                    {" "}
                    <Link href="/terms" className="underline hover:text-blueGray-500">
                      {t('user:termsOfUse')}
                    </Link>
                  </span>
                </label>
              </div>
              {errors.terms && <p className={`text-red-500 text-xs ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.terms}</p>}
            </div>
          </div>
        );

      case 2:
        const su2 = formData.signUp;
        return (
          <div className="space-y-6">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-2'}`}>
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-2 rounded-lg">
                <RiShieldCheckLine className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold ${isRTL ? 'font-arabic mr-3' : ''}`}>{t('user:verifyEmail')}</h2>
            </div>
            <p className={`text-gray-600 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:enterVerificationCode', { email: su2.email })}</p>
            <div>
              <input
                type="text"
                value={su2.verificationCode}
                onChange={(e) => handleChange('signUp', 'verificationCode', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border border-gray-300 text-center text-black ${isRTL ? 'font-arabic' : ''}`}
                placeholder="XXXXXX"
                maxLength={6}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              {errors.verificationCode && <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.verificationCode}</p>}
            </div>
            <button
              type="button"
              onClick={resendVerificationCode}
              className={`text-blue-500 hover:underline ${isRTL ? 'font-arabic' : ''}`}
            >
              {t('user:resendCode')}
            </button>
          </div>
        );

      case 3:
        const pi = formData.personalInfo;
        return (
          <div className="space-y-5">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-2'}`}>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                <BsPersonVcard className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold ${isRTL ? 'font-arabic mr-3' : ''}`}>{t('user:basicInfo')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex flex-col justify-center items-center">
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:imageUpload')}</label>
                <div className={`relative flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <div className="relative group">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ${pi.imagePreview
                        ? 'border-2 border-blue-500 shadow-md'
                        : 'border-2 border-dashed border-gray-300 bg-gray-100 group-hover:border-[#886501] group-hover:bg-gray-50'
                        }`}
                    >
                      {pi.imagePreview ? (
                        <Image
                          src={pi.imagePreview}
                          alt="Profile Preview"
                          layout="fill"
                          objectFit="cover"
                          className="rounded-full"
                        />
                      ) : (
                        <MdCloudUpload className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {!pi.imagePreview && (
                      <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isRTL ? 'font-arabic' : ''}`}>
                        {t('user:uploadImage')}
                      </span>
                    )}
                  </div>
                  {pi.imagePreview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 hover:shadow-md transition-all duration-200 z-10"
                      title={t('user:removeImage')}
                    >
                      <MdDelete className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {errors.imageFile && <p className={`text-red-500 text-xs mt-2 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.imageFile}</p>}
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:phoneNumber')}</label>
                <PhoneInput
                  country={'eg'}
                  value={pi.phone}
                  onChange={(phone) => handleChange('personalInfo', 'phone', phone)}
                  inputClass={`w-full py-3 px-4 rounded-lg border text-black ${isRTL ? 'font-arabic text-right phone-ar' : 'text-left phone-en'}`}
                  containerClass="w-full"
                  specialLabel=""
                />
                {errors.phone && <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.phone}</p>}
              </div>
              <div className="md:col-span-1">
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:gender')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {['male', 'female'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleChange('personalInfo', 'gender', g)}
                      className={`p-3 rounded-lg border ${pi.gender === g ? 'bg-blue-50 border-blue-500' : 'border-gray-300'} w-full flex items-center ${isRTL ? 'space-x-reverse space-x-2 font-arabic' : 'justify-start space-x-2'}`}
                    >
                      <BsGenderAmbiguous className="w-5 h-5" />
                      <span>{t(`user:${g}`)}</span>
                    </button>
                  ))}
                </div>
                {errors.gender && <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.gender}</p>}
              </div>
              <div className="md:col-span-1">
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:birthDate')}</label>
                <input
                  type="date"
                  value={pi.birthDate}
                  onChange={(e) => handleChange('personalInfo', 'birthDate', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border border-gray-300 text-black ${isRTL ? 'font-arabic text-right' : 'text-left'}`}
                />
                {errors.birthDate && <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.birthDate}</p>}
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:userType')}</label>
                <div className="grid grid-cols-2 gap-4">
                  {['rider', 'provider'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleChange('personalInfo', 'userType', type)}
                      className={`p-4 rounded-lg border ${pi.userType === type ? 'bg-blue-50 border-blue-500' : 'border-gray-300'} flex items-center ${isRTL ? 'space-x-reverse space-x-3 font-arabic' : 'justify-start space-x-3'} w-full`}
                    >
                      {type === 'rider' ? (
                        <BsPersonVcard className="w-6 h-6 text-blue-500" />
                      ) : (
                        <BsPersonWorkspace className="w-6 h-6 text-blue-500" />
                      )}
                      <span>{t(`user:${type}`)}</span>
                    </button>
                  ))}
                </div>
                {errors.userType && <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.userType}</p>}
              </div>
            </div>
          </div>
        );

      case 4:
  const li = formData.locationInfo;
  return (
    <div className="space-y-6">
      <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-2'}`}>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
          <MdLocationOn className="w-6 h-6 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${isRTL ? 'font-arabic mr-2' : ''}`}>{t('user:location')}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:country')}</label>
          <select
            value={li.country}
            onChange={(e) => {
              const countryId = e.target.value;
              setSelectedCountry(countryId);
              setFormData(prev => ({ ...prev, locationInfo: { ...prev.locationInfo, country: countryId, governorate: '', city: '' } }));
              setSelectedGovernorate('');
              setSelectedCity('');
            }}
            className={`w-full px-4 py-3 rounded-lg border border-gray-300 text-black bg-white ${isRTL ? 'font-arabic text-right' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <option value="">{t('user:selectCountry')}</option>
            {countries.map(c => (
              <option key={c._id} value={c._id}>
                {i18n.language === 'ar' ? (c.name_ar || c.name_en || 'Unnamed') : (c.name_en || c.name_ar || 'Unnamed')}
              </option>
            ))}
          </select>
          {errors.country && <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.country}</p>}
        </div>
        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:governorate')}</label>
          <select
            value={li.governorate}
            onChange={(e) => {
              const governorateId = e.target.value;
              setSelectedGovernorate(governorateId);
              setFormData(prev => ({ ...prev, locationInfo: { ...prev.locationInfo, governorate: governorateId, city: '' } }));
              setSelectedCity('');
            }}
            className={`w-full px-4 py-3 rounded-lg border border-gray-300 text-black bg-white ${isRTL ? 'font-arabic text-right' : 'text-left'}`}
            disabled={!li.country}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <option value="">{t('user:selectGovernorate')}</option>
            {governorates.filter(g => g.countryId === li.country).map(g => (
              <option key={g.id} value={g.id}>
                {i18n.language === 'ar' ? (g.name_ar || g.name_en || 'Unnamed') : (g.name_en || g.name_ar || 'Unnamed')}
              </option>
            ))}
          </select>
          {errors.governorate && <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.governorate}</p>}
        </div>
        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:city')}</label>
          <select
            value={li.city}
            onChange={(e) => {
              const cityId = e.target.value;
              setSelectedCity(cityId);
              setFormData(prev => ({ ...prev, locationInfo: { ...prev.locationInfo, city: cityId } }));
            }}
            className={`w-full px-4 py-3 rounded-lg border border-gray-300 text-black bg-white ${isRTL ? 'font-arabic text-right' : 'text-left'}`}
            disabled={!li.governorate}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <option value="">{t('user:selectCity')}</option>
            {cities.filter(c => c.governorateId === li.governorate).map(c => (
              <option key={c.id} value={c.id}>
                {i18n.language === 'ar' ? (c.name_ar || c.name_en || 'Unnamed') : (c.name_en || c.name_ar || 'Unnamed')}
              </option>
            ))}
          </select>
          {errors.city && <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.city}</p>}
        </div>
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:addressDetails')}</label>
          <textarea
            value={li.addressDetails}
            onChange={(e) => handleChange('locationInfo', 'addressDetails', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border border-gray-300 text-black ${isRTL ? 'font-arabic text-right' : 'text-left'}`}
            rows={3}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          {errors.addressDetails && <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.addressDetails}</p>}
        </div>
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:addressLink')}</label>
          <input
            type="url"
            value={li.addressLink}
            onChange={(e) => handleChange('locationInfo', 'addressLink', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border border-gray-300 text-black ${isRTL ? 'font-arabic text-right' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          {errors.addressLink && <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.addressLink}</p>}
        </div>
      </div>
    </div>
  );
      case 5:
        const ii = formData.identityInfo;
        return (
          <div className="space-y-6">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-2'}`}>
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-2 rounded-lg">
                <FaIdCard className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold ${isRTL ? 'font-arabic mr-3' : ''}`}>{t('user:identity')}</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:fullName')}</label>
                <input
                  type="text"
                  value={ii.fullName}
                  onChange={(e) => handleChange('identityInfo', 'fullName', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border border-gray-300 text-black ${isRTL ? 'font-arabic text-right' : 'text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.fullName && <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.fullName}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:nationalNumber')}</label>
                <input
                  type="text"
                  value={ii.nationalNumber}
                  onChange={(e) => handleChange('identityInfo', 'nationalNumber', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border border-gray-300 text-black ${isRTL ? 'font-arabic text-right' : 'text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.nationalNumber && <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.nationalNumber}</p>}
              </div>
            </div>
          </div>
        );

      case 6:
        if (formData.personalInfo.userType === 'rider') {
          const rd = formData.riderDetails;
          return (
            <div className="space-y-6 mx-auto bg-white p-6 rounded-xl shadow-sm">
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-3'} border-b pb-4`}>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-full shadow-md">
                  <FaHorse className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-2xl font-bold text-gray-800 ${isRTL ? 'font-arabic mr-3' : ''}`}>{t('user:riderDetails')}</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:eventTypes')}</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { type: 'racing', icon: MdDirectionsBike },
                      { type: 'touring', icon: MdTerrain },
                      { type: 'training', icon: MdFitnessCenter }
                    ].map(({ type, icon: Icon }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleEventTypeToggle(type)}
                        className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-center ${rd.eventTypes.includes(type)
                          ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm transform scale-105'
                          : 'border-gray-300 hover:bg-gray-50'
                          } ${isRTL ? 'font-arabic' : ''}`}
                      >
                        <Icon className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t(`user:${type}`)}
                      </button>
                    ))}
                  </div>
                  {errors.eventTypes && <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.eventTypes}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:riderLevel')}</label>
                  <div className="relative">
                    <select
                      value={rd.riderLevel}
                      onChange={(e) => handleChange('riderDetails', 'riderLevel', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border border-gray-300 appearance-none bg-white text-black ${isRTL ? 'font-arabic text-right pr-10' : 'text-left pl-10'}`}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    >
                      <option value="">{t('user:selectRiderLevel')}</option>
                      {[
                        { level: 'beginner', icon: '🔰' },
                        { level: 'intermediate', icon: '⭐' },
                        { level: 'advanced', icon: '🏆' }
                      ].map(({ level, icon }) => (
                        <option key={level} value={level}>{icon} {t(`user:${level}`)}</option>
                      ))}
                    </select>
                    <div className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
                      <MdKeyboardArrowDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.riderLevel && <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.riderLevel}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:yearsOfExperience')}</label>
                  <div className="relative">
                    <MdAccessTime className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <input
                      type="number"
                      value={rd.yearsOfExperience}
                      onChange={(e) => handleChange('riderDetails', 'yearsOfExperience', Number(e.target.value))}
                      className={`w-full py-3 rounded-lg border border-gray-300 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${isRTL ? 'font-arabic text-right pr-10 pl-4' : 'text-left pl-10 pr-4'}`}
                      min="0"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>
                  {errors.yearsOfExperience && <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.yearsOfExperience}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'font-arabic text-right' : 'text-left'} flex items-center ${isRTL ? 'justify-end space-x-reverse space-x-1' : 'justify-start space-x-1'}`}>
                    <MdDescription className="w-5 h-5" />
                    <span>{t('user:experienceText')}</span>
                  </label>
                  <textarea
                    value={rd.experienceText}
                    onChange={(e) => handleChange('riderDetails', 'experienceText', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border border-gray-300 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${isRTL ? 'font-arabic text-right' : 'text-left'}`}
                    rows={3}
                    placeholder={t('user:describeYourExperience')}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className={`flex items-center mb-3 ${isRTL ? 'justify-end space-x-reverse space-x-2' : 'justify-start space-x-2'}`}>
                    <MdVerified className="text-blue-500 w-5 h-5" />
                    <label className={`text-sm font-medium text-gray-700 ${isRTL ? 'font-arabic' : ''}`}>{t('user:certifications')}</label>
                  </div>
                  {rd.certifications.map((cert, index) => (
                    <div key={index} className={`flex flex-col md:flex-row ${isRTL ? 'md:space-x-reverse md:space-x-2' : 'md:space-x-2'} space-y-2 md:space-y-0 mb-3 p-3 bg-white rounded-lg border border-gray-200`}>
                      <input
                        type="text"
                        value={cert.description}
                        onChange={(e) => handleNestedChange('riderDetails', 'certifications', index, 'description', e.target.value)}
                        className={`flex-1 px-4 py-2 rounded-lg border border-gray-300 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}
                        placeholder={t('user:certificationName')}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                      <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                        <label className={`px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors flex items-center ${isRTL ? 'font-arabic space-x-reverse space-x-1' : 'space-x-1'}`}>
                          <MdAttachFile className="w-5 h-5" />
                          <span>{cert.file ? cert.file.name.substring(0, 15) + '...' : t('user:uploadFile')}</span>
                          <input
                            type="file"
                            onChange={(e) => handleNestedChange('riderDetails', 'certifications', index, 'file', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeCertification(index)}
                          className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                          aria-label="Remove certification"
                        >
                          <MdDelete className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCertification}
                    className={`mt-2 px-4 py-2 bg-white border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center w-full md:w-auto ${isRTL ? 'font-arabic space-x-reverse space-x-1' : 'space-x-1'}`}
                  >
                    <MdAdd className="w-5 h-5" />
                    <span>{t('user:addCertification')}</span>
                  </button>
                </div>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'font-arabic text-right' : 'text-left'} flex items-center ${isRTL ? 'justify-end space-x-reverse space-x-1' : 'justify-start space-x-1'}`}>
                    <MdLocalHospital className="text-red-500 w-5 h-5" />
                    <span>{t('user:healthCondition')}</span>
                  </label>
                  <textarea
                    value={rd.healthCondition}
                    onChange={(e) => handleChange('riderDetails', 'healthCondition', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border border-gray-300 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}
                    rows={3}
                    placeholder={t('user:describeHealthConditions')}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className={`flex items-center mb-3 ${isRTL ? 'justify-end space-x-reverse space-x-2' : 'justify-start space-x-2'}`}>
                    <MdMedicalServices className="text-red-500 w-5 h-5" />
                    <label className={`text-sm font-medium text-gray-700 ${isRTL ? 'font-arabic' : ''}`}>{t('user:medicalCertificates')}</label>
                  </div>
                  {rd.medicalCertificates.length > 0 ? (
                    <div className="mb-3 bg-white p-3 rounded-lg border border-gray-200">
                      {rd.medicalCertificates.map((file, index) => (
                        <div key={index} className={`flex items-center ${isRTL ? 'justify-between flex-row-reverse' : 'justify-between'} py-2 border-b last:border-b-0`}>
                          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                            <MdDescription className="text-gray-500 w-5 h-5" />
                            <span className={`text-sm truncate max-w-xs ${isRTL ? 'font-arabic' : ''}`}>{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMedicalCert(index)}
                            className="p-1 text-red-500 rounded-full hover:bg-red-50"
                            aria-label="Remove file"
                          >
                            <MdDelete className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm text-gray-500 mb-3 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:noMedicalCertificates')}</p>
                  )}
                  <label className={`px-4 py-3 bg-white border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center cursor-pointer w-full md:w-auto ${isRTL ? 'font-arabic space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <MdCloudUpload className="w-5 h-5" />
                    <span>{t('user:uploadMedicalCertificates')}</span>
                    <input
                      type="file"
                      multiple
                      onChange={handleMedicalCertChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          );
        } else if (formData.personalInfo.userType === 'provider') {
          const pd = formData.providerDetails;
          return (
            <div className="space-y-6 mx-auto bg-white p-6 rounded-xl shadow-sm">
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-3'} border-b pb-4`}>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full shadow-md">
                  <BsPersonWorkspace className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-2xl font-bold text-gray-800 ${isRTL ? 'font-arabic mr-3' : ''}`}>{t('user:providerDetails')}</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{t('user:servicesProvided')}</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {providerServices.map(({ key, icon: Icon }) => {
                      // Extract the service name from the key (remove 'user:' prefix)
                      const serviceName = key.replace('user:', '');
                      return (
                        <button
                          key={serviceName}
                          type="button"
                          onClick={() => handleServiceToggle(serviceName)}
                          className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-center ${pd.services.includes(serviceName)
                            ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm transform scale-100'
                            : 'border-gray-300 hover:bg-gray-50'
                            } ${isRTL ? 'font-arabic' : ''}`}
                        >
                          <Icon className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {t(key)}
                        </button>
                      );
                    })}
                  </div>
                  {errors.services && <p className={`text-red-500 text-xs mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{errors.services}</p>}
                </div>
              </div>
            </div>
          );
        }
        return null;
    }
  };

  return (
    <Layout>
      <Head>
        <title>{t('user:completeProfile')}</title>
        <meta name="description" content="A modern multi-step registration form" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className={`flex ${isRTL ? '' : 'flex-row'} justify-between mb-2`}>
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex-1 flex items-center justify-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step > i + 1
                      ? 'bg-blue-500 text-white'
                      : step === i + 1
                        ? 'bg-gray-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                      }`}
                  >
                    {step > i + 1 ? <FaCheckCircle /> : i + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-500 transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 md:p-8"
          >
            <form onSubmit={handleSubmit}>
              {renderStepContent()}
              {error && (
                <div className={`mt-4 text-red-500 bg-red-50 p-4 rounded-lg ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{error}</div>
              )}
              {message && (
                <div className={`mt-4 text-green-500 bg-green-50 p-4 rounded-lg ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>{message}</div>
              )}
              <div className={`mt-8 flex ${isRTL ? 'justify-between flex-row-reverse' : 'justify-between'}`}>
                {step > 1 && (step > 2 || !isEmailVerified) && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className={`px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center ${isRTL ? 'font-arabic space-x-reverse space-x-2' : 'space-x-2'}`}
                  >
                    {
                      isRTL ? <MdNavigateNext className="w-5 h-5" /> : <MdNavigateBefore className="w-5 h-5" />
                    }
                    <span>{t('user:previous')}</span>
                  </button>
                )}
                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-lg ${!isLoading ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} flex items-center ${isRTL ? 'font-arabic space-x-reverse space-x-2' : 'space-x-2'}`}
                  >
                    <span>{step === 1 ? (isLoading ? t('user:signingUp') : t('user:signUpNow')) : t('user:next')}</span>
                    {
                      isRTL ? <MdNavigateBefore className="w-5 h-5" /> : <MdNavigateNext className="w-5 h-5" />
                    }
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className={`px-6 py-3 rounded-lg ${isFormValid && !isLoading ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} ${isRTL ? 'font-arabic' : ''}`}
                  >
                    {isLoading ? 'Submitting...' : t('user:submit')}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>

        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none"
            >
              <div className="absolute w-full h-full overflow-hidden">
                {Array.from({ length: 50 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                      left: `${Math.random() * 100}%`,
                      top: '-10%',
                    }}
                    animate={{ y: '110vh', rotate: Math.random() * 360 }}
                    transition={{ duration: 2 + Math.random() * 2, ease: 'linear' }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}