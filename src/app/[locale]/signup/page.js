"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Link from 'next/link';
import {
  User,
  MapPin,
  FileText,
  CheckCircle,
  Shield,
  Calendar,
  Package,
  ShoppingBag,
  Award,
  Upload,
  Trash2,
  File,
  Plus,
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
  Briefcase,
  Trophy,
  Activity,
  Clock,
  Heart,           // Added
  Settings,        // Added
  GraduationCap,   // Added
  BookOpen,        // Added
  Book,            // Added
  Library,         // Added
} from 'lucide-react';
import Layout from '../../../../components/layout/Layout';
import client from '@/lib/sanity';
import { Input } from '../../../components/ui/input';
import { Checkbox } from '../../../components/ui/checkbox';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';

// StepIndicator Component
const StepIndicator = ({ step, totalSteps, isRTL, t }) => {
  console.log({ step, totalSteps, isRTL, t }); // Debug props
  const steps = [
    t('user:authTitle'),
    t('user:verifyEmail'),
    t('user:basicInfo'),
    t('user:location'),
    t('user:identity'),
    t('user:details'),
  ];

  return (
    <div className="relative" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile view */}
      <div className="md:hidden mb-8">
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'justify-between'}`}>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'gap-2'}`}>
            <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-md border border-gold/20">
              {step}
            </div>
            <span className={`text-sm font-medium ${isRTL ? 'font-arabic' : ''}`}>
              {steps[step - 1]}
            </span>
          </div>
          <span className={`text-sm text-muted-foreground font-medium ${isRTL ? 'font-arabic' : ''}`}>
            {t('user:stepOf', { current: step, total: totalSteps })}
          </span>
        </div>

        <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-black to-black/80"
            style={{ width: `${(step / totalSteps) * 100}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div
              className="absolute right-0 -top-1 h-4 w-1 bg-gold rounded-full shadow-md"
              style={{ transform: isRTL ? 'translateX(-50%)' : 'translateX(50%)' }}
            ></div>
          </motion.div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="md:block hidden">
        <div className="flex flex-col items-center">
          <div className="relative w-full mb-12">
            <div className="absolute top-7 left-0 w-full h-0.5 bg-gray-200"></div>
            <div
              className={`absolute top-7 h-0.5 bg-gradient-to-${isRTL ? 'l' : 'r'} from-black to-gold transition-all duration-500 ease-in-out`}
              style={{ width: `${(Math.max(0, step - 1) / (totalSteps - 1)) * 100}%`, [isRTL ? 'right' : 'left']: 0 }}
            ></div>

            <div className={`flex ${isRTL ? 'flex-row-reverse' : 'justify-between'} relative`}>
              {steps.map((stepLabel, index) => {
                const stepNum = index + 1;
                const isActive = step >= stepNum;
                const isCompleted = step > stepNum;

                return (
                  <div key={stepNum} className="flex flex-col items-center relative">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{
                        scale: isActive ? 1 : 0.8,
                        opacity: isActive ? 1 : 0.6,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center justify-center w-14 h-14 rounded-full border-2 shadow-md z-10 ${isCompleted
                        ? 'bg-black border-gold text-white'
                        : isActive
                          ? 'bg-white border-black text-black'
                          : 'bg-white border-gray-300 text-gray-400'
                        }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-gold" />
                      ) : (
                        <span className="text-base font-medium">{stepNum}</span>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0.5, y: 10 }}
                      animate={{
                        opacity: isActive ? 1 : 0.6,
                        y: isActive ? 0 : 5,
                      }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className={`absolute -bottom-8 whitespace-nowrap text-xs font-medium px-2 py-1 rounded ${isActive
                        ? 'text-black bg-white shadow-sm border border-gray-100'
                        : 'text-gray-500'
                        } ${isRTL ? 'font-arabic' : ''}`}
                    >
                      {stepLabel}
                    </motion.div>

                    {step === stepNum && (
                      <motion.div
                        className="absolute -bottom-2 w-full flex justify-center"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-sm"></div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = ({ step, totalSteps, isLoading, isFormValid, isRTL, t, prevStep, nextStep, handleSubmit, isEmailVerified }) => {
  return (
    <div className={`mt-8 flex ${isRTL ? 'flex-row-reverse space-x-reverse' : 'space-x-4'} justify-between`}>
      {step > 1 && (step > 2 || !isEmailVerified) && (
        <motion.button
          type="button"
          onClick={prevStep}
          whileHover={{ scale: 1.05, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 border-2 border-black/10 text-black rounded-xl hover:border-black hover:bg-black/5 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('user:previous')}</span>
        </motion.button>
      )}
      {step < totalSteps ? (
        <motion.button
          type="button"
          onClick={nextStep}
          disabled={isLoading}
          whileHover={{ scale: 1.05, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 rounded-xl flex items-center space-x-2 ${isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('user:pleaseWait')}</span>
            </>
          ) : (
            <>
              <span>{step === 1 ? t('user:signUpNow') : t('user:next')}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      ) : (
        <motion.button
          type="submit"
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          whileHover={{ scale: 1.05, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors duration-200 ${isFormValid && !isLoading
            ? 'bg-black text-white hover:bg-gold/90'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('user:submitting')}</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>{t('user:submit')}</span>
            </>
          )}
        </motion.button>
      )}
    </div>
  );
};

export default function SignUpForm() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // State management
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [userId, setUserId] = useState(null);
  const totalSteps = 6;

  const [formData, setFormData] = useState({
    signUp: { userName: '', email: '', password: '', confirmPassword: '', verificationCode: '' },
    personalInfo: { userType: '', phone: '', imageFile: null, imagePreview: null, gender: '', birthDate: '' },
    locationInfo: { governorate: '', country: '', city: '', addressDetails: '', addressLink: '' },
    identityInfo: { nationalNumber: '', fullName: '' },
    riderDetails: {
      eventTypes: [],
      riderLevel: '',
      experienceText: '',
      yearsOfExperience: 0,
      certifications: [{ description: '', file: null }],
      healthCondition: '',
      medicalCertificates: [],
    },
    providerDetails: { services: [] },
    supplierDetails: {
      certifications: null,
    },
    educationalDetails: {
      certifications: null,
      courses: [],
      books: [],
      libraryDescription: '',
      yearsOfExperience: 0,
    },
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Provider services with Lucide icons
  const providerServices = [
    { id: 'horse_stable', key: 'user:horse_stable', descriptionKey: 'user:horse_stable_desc', icon: '🏢' },
    { id: 'veterinary', key: 'user:veterinary', descriptionKey: 'user:veterinary_desc', icon: '⚕️' },
    { id: 'competitions', key: 'user:competitions', descriptionKey: 'user:competitions_desc', icon: '🏆' },
    { id: 'housing', key: 'user:housing', descriptionKey: 'user:housing_desc', icon: '🏠' },
    { id: 'horse_trainer', key: 'user:horse_trainer', descriptionKey: 'user:horse_trainer_desc', icon: '🔄' },
    { id: 'hoof_trimmer', key: 'user:hoof_trimmer', descriptionKey: 'user:hoof_trimmer_desc', icon: '✂️' },
    { id: 'horse_grooming', key: 'user:horse_grooming', descriptionKey: 'user:horse_grooming_desc', icon: '🧼' },
    { id: 'event_judging', key: 'user:event_judging', descriptionKey: 'user:event_judging_desc', icon: '⚖️' },
    { id: 'marketing_promotion', key: 'user:marketing_promotion', descriptionKey: 'user:marketing_promotion_desc', icon: '📣' },
    { id: 'event_commentary', key: 'user:event_commentary', descriptionKey: 'user:event_commentary_desc', icon: '🎙️' },
    { id: 'consulting_services', key: 'user:consulting_services', descriptionKey: 'user:consulting_services_desc', icon: '💼' },
    { id: 'photography_services', key: 'user:photography_services', descriptionKey: 'user:photography_services_desc', icon: '📸' },
    { id: 'horse_transport', key: 'user:horse_transport', descriptionKey: 'user:horse_transport_desc', icon: '🚚' },
    { id: 'contractors', key: 'user:contractors', descriptionKey: 'user:contractors_desc', icon: '🏗️' },
    { id: 'horse_catering', key: 'user:horse_catering', descriptionKey: 'user:horse_catering_desc', icon: '🍽️' },
    { id: 'trip_coordinator', key: 'user:trip_coordinator', descriptionKey: 'user:trip_coordinator_desc', icon: '🧭' },
  ];

  // Fetch Sanity data and check authentication
  useEffect(() => {
    const fetchSanityData = async () => {
      if (!client || typeof client.fetch !== 'function') {
        console.error('Sanity client is not properly initialized');
        setError(t('user:error.sanityClientNotInitialized'));
        return;
      }

      try {
        const countryQuery = '*[_type == "country"]{ _id, name_en, name_ar }';
        const fetchedCountries = await client.fetch(countryQuery);
        setCountries(fetchedCountries);

        const governorateQuery = '*[_type == "governorate"]{ _id, name_en, name_ar, country->{_id} }';
        const fetchedGovernorates = await client.fetch(governorateQuery);
        setGovernorates(fetchedGovernorates.map(g => ({
          id: g._id,
          name_en: g.name_en,
          name_ar: g.name_ar,
          countryId: g.country?._id,
        })));

        const cityQuery = '*[_type == "city"]{ _id, name_en, name_ar, governorate->{_id} }';
        const fetchedCities = await client.fetch(cityQuery);
        setCities(fetchedCities.map(c => ({
          id: c._id,
          name_en: c.name_en,
          name_ar: c.name_ar,
          governorateId: c.governorate?._id,
        })));


        const courseQuery = '*[_type == "course"]{ _id, name_en, name_ar }';
        const fetchedCourses = await client.fetch(courseQuery);
        setCourses(fetchedCourses);

        const bookQuery = '*[_type == "book"]{ _id, name_en, name_ar }';
        const fetchedBooks = await client.fetch(bookQuery);
        setBooks(fetchedBooks);
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
        if (data.authenticated) {
          setAuthenticated(true);
          setUserId(data.user.id);

          if (!client || typeof client.fetch !== 'function') {
            console.error('Sanity client is not properly initialized');
            setStep(3); // Fallback to step 3 if Sanity client is not available
            return;
          }

          const userQuery = `*[_type == "user" && _id == $userId][0]{isEmailVerified, isProfileCompleted, email}`;
          let userData;
          try {
            userData = await client.fetch(userQuery, { userId: data.user.id });
          } catch (sanityError) {
            console.error('Sanity fetch failed:', sanityError);
            setStep(3); // Fallback to step 3 if fetching user data fails
            return;
          }

          if (userData) {
            if (userData.isProfileCompleted) {
              router.push('/');
              return;
            }
            if (userData.isEmailVerified) {
              setIsEmailVerified(true);
              setStep(3); // Skip to step 3 if email is verified
            } else {
              setStep(2); // Go to step 2 if email is not verified
            }
            setFormData(prev => ({
              ...prev,
              signUp: { ...prev.signUp, email: userData.email || '' },
            }));
          } else {
            setStep(3); // Default to step 3 if no user data is found
          }
        } else {
          setStep(1); // Not authenticated, start at step 1
        }
      } catch (err) {
        console.error('Error in checkAuthStatus:', err);
        setStep(1); // Fallback to step 1 on error
      }
    };

    document.body.dir = isRTL ? 'rtl' : 'ltr';
    fetchSanityData();
    checkAuthStatus();
  }, [t, isRTL, router]);

  // Google Sign-Up
  const handleGoogleSuccess = async (response) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleToken: response.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t('user:googleSignUpFailed'));

      setUserId(data.userId);
      setAuthenticated(true);
      setIsEmailVerified(true);
      localStorage.setItem('userId', data.userId);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setError(t('user:googleSignUpFailed'));
  };

  // Handlers
  const handleChange = (stepName, field, value) => {
    setFormData(prev => ({
      ...prev,
      [stepName]: { ...prev[stepName], [field]: value },
    }));
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleCheckboxChange = (checked) => {
    setIsChecked(checked);
  };

  const handleNestedChange = (stepName, field, index, subField, value) => {
    const updatedArray = [...formData[stepName][field]];
    updatedArray[index][subField] = value;
    setFormData(prev => ({
      ...prev,
      [stepName]: { ...prev[stepName], [field]: updatedArray },
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
            imagePreview: reader.result,
          },
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
        imagePreview: null,
      },
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

  const handleCourseToggle = (courseId) => {
    const currentCourses = formData.educationalDetails.courses;
    handleChange('educationalDetails', 'courses',
      currentCourses.includes(courseId)
        ? currentCourses.filter(c => c !== courseId)
        : [...currentCourses, courseId]
    );
  };

  const handleBookToggle = (bookId) => {
    const currentBooks = formData.educationalDetails.books;
    handleChange('educationalDetails', 'books',
      currentBooks.includes(bookId)
        ? currentBooks.filter(b => b !== bookId)
        : [...currentBooks, bookId]
    );
  };

  const handleFileChange = (stepName, field, file) => {
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [field]: t('user:error.fileSize') }));
        return;
      }
      if (!['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        setErrors(prev => ({ ...prev, [field]: t('user:error.fileType') }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        [stepName]: { ...prev[stepName], [field]: file },
      }));
    }
  };

  const addCertification = () => {
    handleChange('riderDetails', 'certifications', [
      ...formData.riderDetails.certifications,
      { description: '', file: null },
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
        ...newFiles,
      ]);
    }
  };

  const removeMedicalCert = (index) => {
    const updatedCerts = formData.riderDetails.medicalCertificates.filter((_, i) => i !== index);
    handleChange('riderDetails', 'medicalCertificates', updatedCerts);
  };

  // Validation
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
        if (!su2.verificationCode || su2.verificationCode.length !== 6)
          newErrors.verificationCode = t('user:validCodeRequired');
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
        if (!li.addressDetails || li.addressDetails.length < 10)
          newErrors.addressDetails = t('user:error.addressDetailsRequired');
        if (!li.addressLink) newErrors.addressLink = t('user:error.addressLinkRequired');
        else if (!/^(https?:\/\/)/i.test(li.addressLink))
          newErrors.addressLink = t('user:error.invalidLink');
        stepValid = Object.keys(newErrors).length === 0;
        break;
      case 5:
        const ii = formData.identityInfo;
        if (!ii.fullName) newErrors.fullName = t('user:error.fullNameRequired');
        else if (ii.fullName.split(' ').filter(Boolean).length < 3)
          newErrors.fullName = t('user:error.fullNameMinParts');
        if (!ii.nationalNumber) newErrors.nationalNumber = t('user:error.nationalNumberRequired');
        else if (!/^\d{10,14}$/.test(ii.nationalNumber))
          newErrors.nationalNumber = t('user:error.invalidNationalNumber');
        stepValid = Object.keys(newErrors).length === 0;
        break;
      case 6:
        if (formData.personalInfo.userType === 'rider') {
          const rd = formData.riderDetails;
          if (!rd.riderLevel) newErrors.riderLevel = t('user:error.riderLevelRequired');
          if (rd.eventTypes.length === 0) newErrors.eventTypes = t('user:error.eventTypesRequired');
          if (rd.yearsOfExperience < 0)
            newErrors.yearsOfExperience = t('user:error.yearsOfExperienceInvalid');
          stepValid = Object.keys(newErrors).length === 0;
        } else if (formData.personalInfo.userType === 'provider') {
          const pd = formData.providerDetails;
          if (pd.services.length === 0) newErrors.services = t('user:error.servicesRequired');
          stepValid = Object.keys(newErrors).length === 0;
        } else if (formData.personalInfo.userType === 'suppliers') {
          stepValid = Object.keys(newErrors).length === 0;
        } else if (formData.personalInfo.userType === 'educational_services') {
          const ed = formData.educationalDetails;
          if (ed.courses.length === 0 && ed.books.length === 0)
            newErrors.coursesBooks = t('user:error.coursesOrBooksRequired');
          if (ed.yearsOfExperience < 0)
            newErrors.yearsOfExperience = t('user:error.yearsOfExperienceInvalid');
          stepValid = Object.keys(newErrors).length === 0;
        }
        break;
    }

    setErrors(newErrors);
    setIsFormValid(stepValid);
    return stepValid;
  };

  // Sign-Up Handler
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

  // Handle final submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;
  
    setIsLoading(true);
  
    try {
      const userData = {
        _type: 'user',
        isProfileCompleted: true,
      };
  
      if (formData.personalInfo.phone) userData.phoneNumber = formData.personalInfo.phone;
      if (formData.personalInfo.gender) userData.kind = formData.personalInfo.gender;
      if (formData.personalInfo.birthDate) userData.birthDate = formData.personalInfo.birthDate;
      if (formData.personalInfo.userType) userData.userType = formData.personalInfo.userType;
  
      if (formData.locationInfo.country)
        userData.country = { _type: 'reference', _ref: formData.locationInfo.country };
      if (formData.locationInfo.governorate)
        userData.governorate = { _type: 'reference', _ref: formData.locationInfo.governorate };
      if (formData.locationInfo.city)
        userData.city = { _type: 'reference', _ref: formData.locationInfo.city };
      if (formData.locationInfo.addressDetails)
        userData.addressDetails = formData.locationInfo.addressDetails;
      if (formData.locationInfo.addressLink)
        userData.addressLink = formData.locationInfo.addressLink;
  
      if (formData.identityInfo.nationalNumber)
        userData.nationalNumber = formData.identityInfo.nationalNumber;
      if (formData.identityInfo.fullName)
        userData.fullName = formData.identityInfo.fullName;
  
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
        if (rd.certifications.length > 0) {
          const certUploads = await Promise.all(
            rd.certifications.map(async (cert, index) => {
              if (cert.file) {
                const fileAsset = await client.assets.upload('file', cert.file, {
                  filename: `${userId}-cert-${index}-${Date.now()}`,
                });
                return {
                  _type: 'object',
                  _key: `cert-${index}-${Date.now()}`, // Unique key
                  description: cert.description || '',
                  file: { _type: 'file', asset: { _type: 'reference', _ref: fileAsset._id } },
                };
              }
              return {
                _type: 'object',
                _key: `cert-${index}-${Date.now()}`, // Unique key for non-file entries
                description: cert.description || '',
              };
            })
          );
          userData.riderDetails.certifications = certUploads;
        }
        if (rd.medicalCertificates.length > 0) {
          const medCertUploads = await Promise.all(
            rd.medicalCertificates.map(async (file, index) => {
              const fileAsset = await client.assets.upload('file', file, {
                filename: `${userId}-med-cert-${index}-${Date.now()}`,
              });
              return {
                _type: 'file',
                _key: `med-cert-${index}-${Date.now()}`, // Unique key
                asset: { _type: 'reference', _ref: fileAsset._id },
              };
            })
          );
          userData.riderDetails.medicalCertificates = medCertUploads;
        }
      }
  
      if (formData.personalInfo.userType === 'provider') {
        userData.providerDetails = {
          offeredServices: formData.providerDetails.services,
        };
  
        const serviceDocs = await Promise.all(
          formData.providerDetails.services.map(async (serviceType) => {
            const serviceData = {
              _type: 'services',
              providerRef: { _type: 'reference', _ref: userId },
              serviceType,
              name_en: serviceType
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
              name_ar: providerServices.find(s => s.key === `user:${serviceType}`)?.title?.split(' || ')[1] || serviceType,
              country: formData.locationInfo.country
                ? { _type: 'reference', _ref: formData.locationInfo.country }
                : undefined,
              government: formData.locationInfo.governorate
                ? { _type: 'reference', _ref: formData.locationInfo.governorate }
                : undefined,
              city: formData.locationInfo.city
                ? { _type: 'reference', _ref: formData.locationInfo.city }
                : undefined,
              statusAdminApproved: false,
              isMainService: false,
            };
            return client.create(serviceData);
          })
        );
        console.log('Created service documents:', serviceDocs);
  
        userData.provider = serviceDocs.map(doc => ({
          _type: 'reference',
          _ref: doc._id,
        }));
      }
  
      if (formData.personalInfo.userType === 'suppliers') {
        const sd = formData.supplierDetails;
        userData.supplierDetails = {};
        if (sd.certifications) {
          const certAsset = await client.assets.upload('file', sd.certifications, {
            filename: `${userId}-supplier-cert-${Date.now()}`,
          });
          userData.supplierDetails.certifications = {
            _type: 'file',
            asset: { _type: 'reference', _ref: certAsset._id },
          };
        }
      }
  
      if (formData.personalInfo.userType === 'educational_services') {
        const ed = formData.educationalDetails;
        userData.educationalDetails = {
          courses: ed.courses.map(courseId => ({
            _type: 'reference',
            _ref: courseId,
          })),
          books: ed.books.map(bookId => ({
            _type: 'reference',
            _ref: bookId,
          })),
          libraryDescription: ed.libraryDescription || '',
          yearsOfExperience: ed.yearsOfExperience || 0,
        };
        if (ed.certifications) {
          const certAsset = await client.assets.upload('file', ed.certifications, {
            filename: `${userId}-educational-cert-${Date.now()}`,
          });
          userData.educationalDetails.certifications = {
            _type: 'file',
            asset: { _type: 'reference', _ref: certAsset._id },
          };
        }
      }
  
      if (formData.personalInfo.imageFile) {
        const imageAsset = await client.assets.upload('image', formData.personalInfo.imageFile, {
          filename: `${userId}-profile-image-${Date.now()}`,
        });
        userData.image = { _type: 'image', asset: { _type: 'reference', _ref: imageAsset._id } };
      }
  
      try {
        await client.patch(userId).set(userData).commit();
      } catch (sanityError) {
        console.error('Sanity patch error:', sanityError);
        throw new Error(t('user:error.sanityPatchFailed', { details: sanityError.message }));
      }
  
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setStep(1);
        setFormData({
          signUp: { userName: '', email: '', password: '', confirmPassword: '', verificationCode: '' },
          personalInfo: { userType: '', phone: '', imageFile: null, imagePreview: null, gender: '', birthDate: '' },
          locationInfo: { governorate: '', country: '', city: '', addressDetails: '', addressLink: '' },
          identityInfo: { nationalNumber: '', fullName: '' },
          riderDetails: {
            eventTypes: [],
            riderLevel: '',
            experienceText: '',
            yearsOfExperience: 0,
            certifications: [{ description: '', file: null }],
            healthCondition: '',
            medicalCertificates: [],
          },
          providerDetails: { services: [] },
          supplierDetails: {
            certifications: null,
          },
          educationalDetails: {
            certifications: null,
            courses: [],
            books: [],
            libraryDescription: '',
            yearsOfExperience: 0,
          },
        });
        router.push(formData.personalInfo.userType === 'provider' ? '/profile' : '/');
      }, 3000);
    } catch (err) {
      console.error('Submission error:', err);
      setError(t('user:error.profileCompletionError', { details: err.message }));
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
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-3'}`}>
              <div className="bg-gradient-to-r from-black to-gray-800 p-2 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">{t('user:authTitle')}</h2>
            </div>
            {error && (
              <div className={`p-4 bg-red-50 text-red-700 rounded-xl text-sm ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <Input
                  type="text"
                  value={su.userName}
                  onChange={(e) => handleChange('signUp', 'userName', e.target.value)}
                  placeholder={t('user:username')}
                  className={`p-4 rounded-xl border border-gray-100 shadow-sm focus:ring-gold focus:border-gold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.userName && (
                  <p className={`text-destructive text-sm mt-1 text-red-500 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.userName}
                  </p>
                )}
              </div>
              <div>
                <Input
                  type="email"
                  value={su.email}
                  onChange={(e) => handleChange('signUp', 'email', e.target.value)}
                  placeholder={t('user:email')}
                  className={`p-4 rounded-xl border border-gray-100 shadow-sm focus:ring-gold focus:border-gold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.email && (
                  <p className={`text-destructive text-sm mt-1 text-red-500 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={su.password}
                  onChange={(e) => handleChange('signUp', 'password', e.target.value)}
                  placeholder={t('user:password')}
                  className={`p-4 rounded-xl border border-gray-100 shadow-sm focus:ring-gold focus:border-gold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute inset-y-0 right-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {errors.password && (
                  <p className={`text-destructive text-sm mt-1 text-red-500 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.password}
                  </p>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={su.confirmPassword}
                  onChange={(e) => handleChange('signUp', 'confirmPassword', e.target.value)}
                  placeholder={t('user:confirmPassword')}
                  className={`p-4 rounded-xl border border-gray-100 shadow-sm focus:ring-gold focus:border-gold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className={`text-destructive text-sm mt-1 text-red-500 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={handleCheckboxChange}
                  className="h-5 w-5 border-gray-300 text-black focus:ring-gold"
                />
                <label className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                  {t('user:agreeTo')}{' '}
                  <Link href="/privacy-policy" className="underline hover:text-gold">
                    {t('user:privacyPolicy')}
                  </Link>{' '}
                  {t('user:and')}{' '}
                  <Link href="/terms" className="underline hover:text-gold">
                    {t('user:termsOfUse')}
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className={`text-destructive text-sm ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                  {errors.terms}
                </p>
              )}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  text="signup_with"
                  width="300"
                  theme="filled_black"
                  shape="rectangular"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        const su2 = formData.signUp;
        return (
          <div className="space-y-6">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-3'}`}>
              <div className="bg-gradient-to-r from-black to-gray-800 p-2 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">{t('user:verifyEmail')}</h2>
            </div>
            <p className={`text-muted-foreground text-sm ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
              {t('user:enterVerificationCode', { email: su2.email })}
            </p>
            <div>
              <Input
                type="text"
                value={su2.verificationCode}
                onChange={(e) => handleChange('signUp', 'verificationCode', e.target.value)}
                className={`p-4 rounded-xl border border-gray-100 shadow-sm focus:ring-gold focus:border-gold text-center ${isRTL ? 'font-arabic' : ''}`}
                placeholder="XXXXXX"
                maxLength={6}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              {errors.verificationCode && (
                <p className={`text-destructive text-sm mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                  {errors.verificationCode}
                </p>
              )}
            </div>
            <Button
              variant="link"
              onClick={resendVerificationCode}
              className={`text-gold hover:text-gold/80 ${isRTL ? 'font-arabic' : ''}`}
            >
              {t('user:resendCode')}
            </Button>
          </div>
        );

      case 3:
        const pi = formData.personalInfo;
        return (
          <div className="space-y-6">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-3'}`}>
              <div className="bg-gradient-to-r from-black to-gray-800 p-2 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">{t('user:basicInfo')}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2 flex flex-col items-center">
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                  {t('user:imageUpload')}
                </label>
                <div className={`relative flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <div className="relative group">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ${pi.imagePreview
                        ? 'border-2 border-gold shadow-md'
                        : 'border-2 border-dashed border-gray-300 bg-gray-50 group-hover:border-gold group-hover:bg-gold/5'
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
                        <Upload className="w-10 h-10 text-gray-400 group-hover:text-gold transition-colors duration-300" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {pi.imagePreview && (
                    <Button
                      variant="ghost"
                      onClick={removeImage}
                      className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>
                {errors.imageFile && (
                  <p className={`text-destructive text-sm mt-2 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.imageFile}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                  {t('user:phoneNumber')}
                </label>
                <PhoneInput
                  country={'sa'}
                  value={pi.phone}
                  onChange={(phone) => handleChange('personalInfo', 'phone', phone)}
                  inputClass={`rounded-xl border border-gray-100 shadow-sm focus:ring-gold focus:border-gold text-black ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                  containerClass="w-full"
                  specialLabel=""
                  style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                  flagStyle={{ marginRight: '0px', marginLeft: '0px' }}
                  containerStyle={isRTL ? { marginRight: '30px', marginLeft: '0px' } : { marginLeft: '30px', marginRight: '0px' }}
                />
                {errors.phone && (
                  <p className={`text-destructive text-sm mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.phone}
                  </p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                  {t('user:gender')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['male', 'female'].map(g => (
                    <Button
                      key={g}
                      variant={pi.gender === g ? 'default' : 'outline'}
                      onClick={() => handleChange('personalInfo', 'gender', g)}
                      className={`p-3 rounded-xl ${pi.gender === g ? 'bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20' : 'border-gray-300 hover:bg-gray-50'
                        } flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
                    >
                      <User className="w-5 h-5" />
                      <span>{t(`user:${g}`)}</span>
                    </Button>
                  ))}
                </div>
                {errors.gender && (
                  <p className={`text-destructive text-sm mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.gender}
                  </p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                  {t('user:birthDate')}
                </label>
                <Input
                  type="date"
                  value={pi.birthDate}
                  onChange={(e) => handleChange('personalInfo', 'birthDate', e.target.value)}
                  className={`p-4 rounded-xl border border-gray-100 shadow-sm focus:ring-gold focus:border-gold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.birthDate && (
                  <p className={`text-destructive text-sm mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.birthDate}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                  {t('user:userType')}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {['rider', 'provider', 'suppliers', 'educational_services'].map(type => (
                    <Button
                      key={type}
                      variant={pi.userType === type ? 'default' : 'outline'}
                      onClick={() => handleChange('personalInfo', 'userType', type)}
                      className={`p-4 rounded-xl ${pi.userType === type ? 'bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20' : 'border-gray-300 hover:bg-gray-50'
                        } flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}
                    >
                      <User className="w-6 h-6" />
                      <span>{t(`user:${type}`)}</span>
                    </Button>
                  ))}
                </div>
                {errors.userType && (
                  <p className={`text-destructive text-sm mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.userType}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        const li = formData.locationInfo;
        return (
          <div className="space-y-6">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-3'}`}>
              <div className="bg-gradient-to-r from-black to-gray-800 p-2 rounded-xl">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">{t('user:location')}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                  {t('user:country')}
                </label>
                <select
                  value={li.country}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedCountry(value);
                    setFormData(prev => ({
                      ...prev,
                      locationInfo: { ...prev.locationInfo, country: value, governorate: '', city: '' },
                    }));
                    setSelectedGovernorate('');
                    setSelectedCity('');
                  }}
                  className={`w-full p-4 rounded-xl border border-gray-100 shadow-sm focus:ring-gold focus:border-gold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <option value="">{t('user:selectCountry')}</option>
                  {countries.map(c => (
                    <option key={c._id} value={c._id}>
                      {i18n.language === 'ar' ? (c.name_ar || c.name_en || 'Unnamed') : (c.name_en || c.name_ar || 'Unnamed')}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className={`text-destructive text-sm mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.country}
                  </p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                  {t('user:governorate')}
                </label>
                <select
                  value={li.governorate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedGovernorate(value);
                    setFormData(prev => ({
                      ...prev,
                      locationInfo: { ...prev.locationInfo, governorate: value, city: '' },
                    }));
                    setSelectedCity('');
                  }}
                  className={`w-full p-4 rounded-xl border border-gray-100 shadow-sm focus:ring-gold focus:border-gold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
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
                {errors.governorate && (
                  <p className={`text-destructive text-sm mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.governorate}
                  </p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                  {t('user:city')}
                </label>
                <select
                  value={li.city}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedCity(value);
                    setFormData(prev => ({ ...prev, locationInfo: { ...prev.locationInfo, city: value } }));
                  }}
                  className={`w-full p-4 rounded-xl border border-gray-100 shadow-sm focus:ring-gold focus:border-gold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
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
                {errors.city && (
                  <p className={`text-destructive text-sm mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.city}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                  {t('user:addressDetails')}
                </label>
                <Textarea
                  value={li.addressDetails}
                  onChange={(e) => handleChange('locationInfo', 'addressDetails', e.target.value)}
                  className={`p-4 rounded-xl border border-gray-100 shadow-sm focus:ring-gold focus:border-gold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                  rows={3}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.addressDetails && (
                  <p className={`text-destructive text-sm mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.addressDetails}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                  {t('user:addressLink')}
                </label>
                <Input
                  type="url"
                  value={li.addressLink}
                  onChange={(e) => handleChange('locationInfo', 'addressLink', e.target.value)}
                  className={`p-4 rounded-xl border border-gray-100 shadow-sm focus:ring-gold focus:border-gold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.addressLink && (
                  <p className={`text-destructive text-sm mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.addressLink}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        const ii = formData.identityInfo;
        return (
          <div className="space-y-6">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-3'}`}>
              <div className="bg-gradient-to-r from-black to-gray-800 p-2 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">{t('user:identity')}</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                  {t('user:fullName')}
                </label>
                <Input
                  type="text"
                  value={ii.fullName}
                  onChange={(e) => handleChange('identityInfo', 'fullName', e.target.value)}
                  className={`p-4 rounded-xl border border-gray-100 shadow-sm focus:ring-gold focus:border-gold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.fullName && (
                  <p className={`text-destructive text-sm mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.fullName}
                  </p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                  {t('user:nationalNumber')}
                </label>
                <Input
                  type="text"
                  value={ii.nationalNumber}
                  onChange={(e) => handleChange('identityInfo', 'nationalNumber', e.target.value)}
                  className={`p-4 rounded-xl border border-gray-100 shadow-sm focus:ring-gold focus:border-gold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.nationalNumber && (
                  <p className={`text-destructive text-sm mt-1 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.nationalNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 6:
        if (formData.personalInfo.userType === 'rider') {
          const rd = formData.riderDetails;
          return (
            <div className="space-y-8 p-6 bg-white rounded-xl shadow-sm">
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3 rounded-xl shadow-md">
                  <User className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{t('user:riderDetails')}</h2>
              </div>

              <div className="space-y-8">
                {/* Event Types */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <label className={`block text-base font-semibold text-gray-800 mb-3 ${isRTL ? 'font-arabic text-right' : 'text-left'} flex items-center gap-2`}>
                    <Calendar className="w-5 h-5 text-blue-600" />
                    {t('user:eventTypes')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { type: 'racing', icon: Trophy },
                      { type: 'touring', icon: MapPin },
                      { type: 'training', icon: Activity },
                    ].map(({ type, icon: Icon }) => (
                      <Button
                        key={type}
                        variant={rd.eventTypes.includes(type) ? 'default' : 'outline'}
                        onClick={() => handleEventTypeToggle(type)}
                        className={`p-4 rounded-xl transition-all duration-200 hover:scale-105 ${rd.eventTypes.includes(type)
                          ? 'bg-blue-600 border-blue-700 text-white shadow-md'
                          : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                          } flex items-center justify-center ${isRTL ? 'space-x-reverse space-x-3 font-arabic' : 'space-x-3'}`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{t(`user:${type}`)}</span>
                      </Button>
                    ))}
                  </div>
                  {errors.eventTypes && (
                    <p className={`text-red-500 text-sm mt-2 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                      {errors.eventTypes}
                    </p>
                  )}
                </div>

                {/* Rider Level */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <label className={`block text-base font-semibold text-gray-800 mb-3 ${isRTL ? 'font-arabic text-right' : 'text-left'} flex items-center gap-2`}>
                    <Award className="w-5 h-5 text-blue-600" />
                    {t('user:riderLevel')}
                  </label>
                  <div className="relative">
                    <Select
                      value={rd.riderLevel || ''} // Ensure controlled value
                      onValueChange={(value) => handleChange('riderDetails', 'riderLevel', value)}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    >
                      <SelectTrigger
                        className={`w-full p-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-base ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                      >
                        <SelectValue placeholder={t('user:selectRiderLevel')} />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { level: 'beginner', icon: '🔰' },
                          { level: 'intermediate', icon: '⭐' },
                          { level: 'advanced', icon: '🏆' },
                        ].map(({ level, icon }) => (
                          <SelectItem key={level} value={level} className="py-2">
                            <div className="flex items-center gap-2">
                              <span>{icon}</span>
                              <span>{t(`user:${level}`)}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className={`absolute inset-y-0 ${isRTL ? 'left-3' : 'right-3'} flex items-center pointer-events-none`}>
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.riderLevel && (
                    <p className={`text-red-500 text-sm mt-2 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                      {errors.riderLevel}
                    </p>
                  )}
                </div>

                {/* Years of Experience */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <label className={`block text-base font-semibold text-gray-800 mb-3 ${isRTL ? 'font-arabic text-right' : 'text-left'} flex items-center gap-2`}>
                    <Clock className="w-5 h-5 text-blue-600" />
                    {t('user:yearsOfExperience')}
                  </label>
                  <Input
                    type="number"
                    value={rd.yearsOfExperience}
                    onChange={(e) => handleChange('riderDetails', 'yearsOfExperience', Number(e.target.value))}
                    className={`p-4 rounded-xl border border-gray-200 shadow-sm focus:ring-blue-600 focus:border-blue-600 ${isRTL ? 'text-right font-arabic' : 'text-left'} text-base`}
                    min="0"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  {errors.yearsOfExperience && (
                    <p className={`text-red-500 text-sm mt-2 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                      {errors.yearsOfExperience}
                    </p>
                  )}
                </div>

                {/* Experience Text */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <label className={`block text-base font-semibold text-gray-800 mb-3 ${isRTL ? 'font-arabic text-right' : 'text-left'} flex items-center gap-2`}>
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>{t('user:experienceText')}</span>
                  </label>
                  <Textarea
                    value={rd.experienceText}
                    onChange={(e) => handleChange('riderDetails', 'experienceText', e.target.value)}
                    className={`p-4 rounded-xl border border-gray-200 shadow-sm focus:ring-blue-600 focus:border-blue-600 ${isRTL ? 'text-right font-arabic' : 'text-left'} text-base`}
                    rows={4}
                    placeholder={t('user:describeYourExperience')}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>

                {/* Certifications */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className={`flex items-center mb-4 ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} ${isRTL ? 'justify-end' : 'justify-start'}`}>
                    <Award className="w-5 h-5 text-blue-600" />
                    <label className={`text-base font-semibold text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>
                      {t('user:certifications')}
                    </label>
                  </div>

                  {rd.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className={`flex flex-col sm:flex-row gap-3 mb-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200`}
                    >
                      <Input
                        type="text"
                        value={cert.description}
                        onChange={(e) =>
                          handleNestedChange('riderDetails', 'certifications', index, 'description', e.target.value)
                        }
                        className={`flex-1 p-4 rounded-xl border border-gray-200 focus:ring-blue-600 focus:border-blue-600 ${isRTL ? 'text-right font-arabic' : 'text-left'} text-base`}
                        placeholder={t('user:certificationName')}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                      <div className={`flex items-center gap-2`}>
                        <label
                          className={`px-4 py-3 bg-blue-50 text-blue-600 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors flex items-center gap-2 whitespace-nowrap`}
                        >
                          <Upload className="w-5 h-5" />
                          <span className="font-medium">{cert.file ? cert.file.name.substring(0, 15) + '...' : t('user:uploadFile')}</span>
                          <input
                            type="file"
                            onChange={(e) =>
                              handleNestedChange('riderDetails', 'certifications', index, 'file', e.target.files[0])
                            }
                            className="hidden"
                          />
                        </label>
                        <Button
                          variant="ghost"
                          onClick={() => removeCertification(index)}
                          className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addCertification}
                    className={`mt-3 px-5 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto`}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">{t('user:addCertification')}</span>
                  </Button>
                </div>

                {/* Health Condition */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <label className={`block text-base font-semibold text-gray-800 mb-3 ${isRTL ? 'font-arabic text-right' : 'text-left'} flex items-center gap-2`}>
                    <Heart className="w-5 h-5 text-blue-600" />
                    <span>{t('user:healthCondition')}</span>
                  </label>
                  <Textarea
                    value={rd.healthCondition}
                    onChange={(e) => handleChange('riderDetails', 'healthCondition', e.target.value)}
                    className={`p-4 rounded-xl border border-gray-200 shadow-sm focus:ring-blue-600 focus:border-blue-600 ${isRTL ? 'text-right font-arabic' : 'text-left'} text-base`}
                    rows={4}
                    placeholder={t('user:describeHealthConditions')}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>

                {/* Medical Certificates */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className={`flex items-center mb-4 ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} ${isRTL ? 'justify-end' : 'justify-start'}`}>
                    <FileText className="w-5 h-5 text-blue-600" />
                    <label className={`text-base font-semibold text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>
                      {t('user:medicalCertificates')}
                    </label>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <label
                      className={`px-5 py-4 bg-blue-50 text-blue-600 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto`}
                    >
                      <Upload className="w-5 h-5" />
                      <span className="font-medium">{t('user:uploadMedicalCertificates')}</span>
                      <input
                        type="file"
                        multiple
                        onChange={handleMedicalCertChange}
                        className="hidden"
                      />
                    </label>

                    {rd.medicalCertificates.length > 0 && (
                      <div className="space-y-3 mt-3">
                        {rd.medicalCertificates.map((file, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow`}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <span className={`text-sm truncate ${isRTL ? 'font-arabic' : ''}`}>
                                {file.name}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              onClick={() => removeMedicalCert(index)}
                              className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        } if (formData.personalInfo.userType === 'provider') {
          const pd = formData.providerDetails;
          return (
            <div className="space-y-8 p-8 bg-white rounded-2xl shadow-lg">
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-4 rounded-xl shadow-lg">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900">{t('user:providerDetails')}</h2>
              </div>

              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm">
                <label className={`block text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'font-arabic text-right' : 'text-left'} flex items-center gap-3`}>
                  <Settings className="w-6 h-6 text-blue-700" />
                  {t('user:services')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {providerServices.map(({ id, key, descriptionKey, icon }) => (
                    <Button
                      key={id}
                      variant={pd.services.includes(id) ? 'default' : 'outline'}
                      onClick={() => handleServiceToggle(id)}
                      className={`min-h-20 min-w-50 p-6 rounded-xl transition-all duration-300 hover:scale-105 ${pd.services.includes(id)
                        ? 'bg-blue-700 border-blue-800 text-white shadow-lg'
                        : 'border-gray-300 bg-white hover:bg-gray-100 text-gray-800'
                        } flex flex-col items-start ${isRTL ? 'space-x-reverse font-arabic text-right' : 'text-left'}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{icon}</span>
                        <span className="font-semibold text-base">{t(key)}</span>
                      </div>
                      <p className={`text-sm ${pd.services.includes(id) ? 'text-blue-100' : 'text-gray-600'}`}>
                        {t(descriptionKey)}
                      </p>
                    </Button>
                  ))}
                </div>
                {errors.services && (
                  <p className={`text-red-600 text-sm mt-4 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.services}
                  </p>
                )}
              </div>
            </div>
          );
        } else if (formData.personalInfo.userType === 'suppliers') {
          const sd = formData.supplierDetails;
          return (
            <div className="space-y-8 p-6 bg-white rounded-xl shadow-sm">
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3 rounded-xl shadow-md">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{t('user:supplierDetails')}</h2>
              </div>
        
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <label className={`block text-base font-semibold text-gray-800 mb-3 ${isRTL ? 'font-arabic text-right' : 'text-left'} flex items-center gap-2`}>
                  <Award className="w-5 h-5 text-blue-600" />
                  <span>{t('user:certifications')}</span>
                </label>
                <div className="flex items-center gap-3">
                  <label
                    className={`px-5 py-4 bg-blue-50 text-blue-600 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors flex items-center gap-2`}
                  >
                    <Upload className="w-5 h-5" />
                    <span className="font-medium">{sd.certifications ? sd.certifications.name : t('user:uploadFile')}</span>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('supplierDetails', 'certifications', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {sd.certifications && (
                    <Button
                      variant="ghost"
                      onClick={() => handleChange('supplierDetails', 'certifications', null)}
                      className="p-3 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        } else if (formData.personalInfo.userType === 'educational_services') {
          const ed = formData.educationalDetails;
          return (
            <div className="space-y-8 p-6 bg-white rounded-xl shadow-sm">
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3 rounded-xl shadow-md">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{t('user:educationalDetails')}</h2>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <label className={`block text-base font-semibold text-gray-800 mb-3 ${isRTL ? 'font-arabic text-right' : 'text-left'} flex items-center gap-2`}>
                  <Library className="w-5 h-5 text-blue-600" />
                  {t('user:libraryDescription')}
                </label>
                <Textarea
                  value={ed.libraryDescription}
                  onChange={(e) => handleChange('educationalDetails', 'libraryDescription', e.target.value)}
                  className={`p-4 rounded-xl border border-gray-200 shadow-sm focus:ring-blue-600 focus:border-blue-600 ${isRTL ? 'text-right font-arabic' : 'text-left'} text-base`}
                  rows={4}
                  placeholder={t('user:describeLibrary')}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <label className={`block text-base font-semibold text-gray-800 mb-3 ${isRTL ? 'font-arabic text-right' : 'text-left'} flex items-center gap-2`}>
                  <Clock className="w-5 h-5 text-blue-600" />
                  {t('user:yearsOfExperience')}
                </label>
                <Input
                  type="number"
                  value={ed.yearsOfExperience}
                  onChange={(e) => handleChange('educationalDetails', 'yearsOfExperience', Number(e.target.value))}
                  className={`p-4 rounded-xl border border-gray-200 shadow-sm focus:ring-blue-600 focus:border-blue-600 ${isRTL ? 'text-right font-arabic' : 'text-left'} text-base`}
                  min="0"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.yearsOfExperience && (
                  <p className={`text-red-500 text-sm mt-2 ${isRTL ? 'font-arabic text-right' : 'text-left'}`}>
                    {errors.yearsOfExperience}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <label className={`block text-base font-semibold text-gray-800 mb-3 ${isRTL ? 'font-arabic text-right' : 'text-left'} flex items-center gap-2`}>
                  <Award className="w-5 h-5 text-blue-600" />
                  <span>{t('user:certifications')}</span>
                </label>
                <div className="flex items-center gap-3">
                  <label
                    className={`px-5 py-4 bg-blue-50 text-blue-600 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors flex items-center gap-2`}
                  >
                    <Upload className="w-5 h-5" />
                    <span className="font-medium">{ed.certifications ? ed.certifications.name : t('user:uploadFile')}</span>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('educationalDetails', 'certifications', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {ed.certifications && (
                    <Button
                      variant="ghost"
                      onClick={() => handleChange('educationalDetails', 'certifications', null)}
                      className="p-3 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <Layout>
        <Head>
          <title>{t('user:completeProfile')}</title>
          <meta name="description" content="A modern multi-step registration form" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Title and Description */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900">{t('user:completeProfile')}</h1>
              <p className={`mt-2 text-lg text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                {t('user:fillDetails')}
              </p>
            </div>

            {/* Step Indicator */}
            <StepIndicator step={step} totalSteps={totalSteps} isRTL={isRTL} t={t} />



            {/* Form Content */}
            <AnimatePresence mode="wait"><motion.div
              key={step}
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 50 : -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 sm:p-8 rounded-xl shadow-lg"
            >
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {renderStepContent()}

                {/* Error Message */}
                {error && (
                  <div
                    className={`p-4 bg-red-50 text-red-700 rounded-xl text-sm ${isRTL ? 'font-arabic text-right' : 'text-left'}`}
                  >
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {message && (
                  <div
                    className={`p-4 bg-green-50 text-green-700 rounded-xl text-sm ${isRTL ? 'font-arabic text-right' : 'text-left'}`}
                  >
                    {message}
                  </div>
                )}

                {/* Navigation */}
                <Navigation
                  step={step}
                  totalSteps={totalSteps}
                  isLoading={isLoading}
                  isFormValid={isFormValid}
                  isRTL={isRTL}
                  t={t}
                  prevStep={prevStep}
                  nextStep={nextStep}
                  handleSubmit={handleSubmit}
                  isEmailVerified={isEmailVerified}
                />
              </form>
            </motion.div>
            </AnimatePresence>

            {/* Confetti Animation */}
            {showConfetti && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 pointer-events-none flex items-center justify-center bg-black/30"
              >
                <div className="text-center text-white">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">{t('user:profileCompleted')}</h2>
                  <p className="mt-2">{t('user:redirecting')}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </Layout>
    </GoogleOAuthProvider>
  );
}