import React, { useState, useCallback, useEffect } from 'react';
import { createClient } from '@sanity/client';
import {
  Upload,
  X,
  Home,
  Stethoscope,
  Trophy,
  Building,
  Map,
  Utensils,
  Truck,
  HardHat,
  Package,
  Dumbbell,
  Scissors,
  Plus,
  Trash
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../../src/components/ui/card";
import { Alert, AlertDescription } from "../../src/components/ui/alert";
import toast from 'react-hot-toast';
import { client, urlFor } from '../../src/lib/sanity';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const NewProviderServiceForm = ({ currentUser }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [confirmDataAccuracy, setConfirmDataAccuracy] = useState(false);

  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Helper function to generate unique keys
  const generateKey = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Initialize all form fields with empty values
  const initialFormState = {
    name_ar: '',
    name_en: '',
    price: '',
    image: null,
    servicePhone: '',
    serviceEmail: '',
    links: [
      { _key: generateKey(), url: '' },
      { _key: generateKey(), url: '' },
      { _key: generateKey(), url: '' }
    ],
    about_ar: '',
    about_en: '',
    serviceType: '',
    providerRef: null,
    country: null,
    government: null,
    city: null,
    location: '',
    graduationDetails: {
      graduationCertificate: null,
      previousExperience: ''
    },
    competitions: {
      level: '',
      heightDistance: '',
      organiserName: '',
      mainReferee: '',
      coReferee1: '',
      coReferee2: '',
      raceType: '',
      prize: '',
      sponsor: '',
      sponsorLogo: null,
      sponsorshipValue: 0
    },
    housingDetails: {
      housingDetails: ''
    },
    horseTrainerDetails: {
      trainerLevel: '',
      accreditationCertificate: ''
    },
    hoofTrimmerDetails: {
      hoofTrimmerDetails: ''
    },
    transportDetails: {
      numberOfHorses: 0,
      vehicleType: ''
    },
    contractorDetails: '',
    supplierDetails: '',
    cateringOptions: [],
    tripCoordinator: {
      locationOfHorses: '',
      locationOfTent: '',
      startDate: null,
      endDate: null,
      breakTimes: '',
      meals: [],
      containsAidBag: false,
      activities: '',
      priceForFamilyOf2: 0,
      priceForFamilyOf3: 0,
      priceForFamilyOf4: 0,
      tripProgram: '',
      levelOfHardship: '',
      conditionsAndRequirements: '',
      safetyAndEquipment: '',
      cancellationAndRefundPolicy: '',
      moreDetails: ''
    },
    statusAdminApproved: false,
    isMainService: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    client.fetch('*[_type == "country"]{_id, name_en, name_ar}')
      .then(data => setCountries(data))
      .catch(error => console.error(error));
  }, []);

  // Fetch governorates based on selected country
  useEffect(() => {
    if (selectedCountry) {
      client.fetch(`*[_type == "governorate" && country._ref == $countryId]{_id, name_en, name_ar}`, { countryId: selectedCountry })
        .then(data => setGovernorates(data))
        .catch(error => console.error(error));
    } else {
      setGovernorates([]);
    }
  }, [selectedCountry]);

  // Fetch cities based on selected governorate
  useEffect(() => {
    if (selectedGovernorate) {
      client.fetch(`*[_type == "city" && governorate._ref == $governorateId]{_id, name_en, name_ar}`, { governorateId: selectedGovernorate })
        .then(data => setCities(data))
        .catch(error => console.error(error));
    } else {
      setCities([]);
    }
  }, [selectedGovernorate]);


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: null }));
  };

  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  }, []);

  const handleNestedChange = useCallback((category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  }, []);

  const handleLinkChange = (index, value) => {
    const newLinks = [...formData.links];
    newLinks[index] = { ...newLinks[index], url: value };
    setFormData(prev => ({ ...prev, links: newLinks }));
  };

  const addLink = () => {
    if (formData.links.length < 6) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, { _key: generateKey(), url: '' }]
      }));
    }
  };

  const removeLink = (index) => {
    if (index >= 3) {
      const newLinks = formData.links.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, links: newLinks }));
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleCountryChange = (e) => {
    const countryId = e.target.value;
    setSelectedCountry(countryId);
    setFormData(prev => ({ ...prev, country: countryId }));
    setSelectedGovernorate('');
    setSelectedCity('');
  };

  const handleGovernorateChange = (e) => {
    const governorateId = e.target.value;
    setSelectedGovernorate(governorateId);
    setFormData(prev => ({ ...prev, government: governorateId }));
    setSelectedCity('');
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setSelectedCity(cityId);
    setFormData(prev => ({ ...prev, city: cityId }));
  };

  const serviceTypeIcons = {
    horse_stable: <Home className="w-5 h-5" />,
    veterinary: <Stethoscope className="w-5 h-5" />,
    competitions: <Trophy className="w-5 h-5" />,
    housing: <Building className="w-5 h-5" />,
    trip_coordinator: <Map className="w-5 h-5" />,
    horse_catering: <Utensils className="w-5 h-5" />,
    horse_transport: <Truck className="w-5 h-5" />,
    contractors: <HardHat className="w-5 h-5" />,
    suppliers: <Package className="w-5 h-5" />,
    horse_trainer: <Dumbbell className="w-5 h-5" />,
    hoof_trimmer: <Scissors className="w-5 h-5" />
  };

  const renderServiceTypeFields = () => {
    switch (formData.serviceType) {
      case 'horse_stable':
        return (
          <div className="wow animate__animated animate__fadeIn space-y-6" data-wow-delay=".3s">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:stableLocationDetails')}</label>
              <textarea
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:stableLocationDetails')}
                required
              />
            </div>
          </div>
        );

      case 'veterinary':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 wow animate__animated animate__fadeIn" data-wow-delay=".3s">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:graduationCertificate')}</label>
              <div className="flex items-center justify-between px-2 bg-blueGray-50 rounded" htmlFor="graduation-certificate-input">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleNestedChange('graduationDetails', 'graduationCertificate', e.target.files[0])}
                  name="Choose file"
                  id="graduation-certificate-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                />
                {formData.graduationDetails.graduationCertificate ? (
                  <span className="ml-2 text-blueGray-600">
                    {formData.graduationDetails.graduationCertificate.name}
                  </span>
                ) : (
                  <span className="ml-2 text-blueGray-600">{t('profile:noFileSelected')}</span>
                )}
                <div className='py-2'>
                  {formData.graduationDetails.graduationCertificate && (
                    <button
                      type="button"
                      className="mr-4 justify-center items-center text-red-500"
                      onClick={() => handleNestedChange('graduationDetails', 'graduationCertificate', null)}
                    >
                      <Trash size={16} style={{ color: "red" }} />
                    </button>
                  )}
                  <span
                    className="px-4 py-3 text-xs text-white font-semibold leading-none bg-blueGray-500 hover:bg-blueGray-600 rounded cursor-pointer"
                    onClick={() => document.getElementById('graduation-certificate-input').click()}
                  >
                    {t('profile:browse')}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:previousExperience')}</label>
              <input
                type="text"
                value={formData.graduationDetails.previousExperience}
                onChange={(e) => handleNestedChange('graduationDetails', 'previousExperience', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:previousExperience')}
                required
              />
            </div>
          </div>
        );

      case 'trip_coordinator':
        return (
          <div className="space-y-6 wow animate__animated animate__fadeIn" data-wow-delay=".3s">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">{t('profile:locationOfHorses')}</label>
                <input
                  type="text"
                  value={formData.tripCoordinator.locationOfHorses}
                  onChange={(e) => handleNestedChange('tripCoordinator', 'locationOfHorses', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder={t('profile:locationOfHorses')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">{t('profile:locationOfTent')}</label>
                <input
                  type="text"
                  value={formData.tripCoordinator.locationOfTent}
                  onChange={(e) => handleNestedChange('tripCoordinator', 'locationOfTent', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder={t('profile:locationOfTent')}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">{t('profile:startDate')}</label>
                <input
                  type="datetime-local"
                  value={formData.tripCoordinator.startDate}
                  onChange={(e) => handleNestedChange('tripCoordinator', 'startDate', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">{t('profile:endDate')}</label>
                <input
                  type="datetime-local"
                  value={formData.tripCoordinator.endDate}
                  onChange={(e) => handleNestedChange('tripCoordinator', 'endDate', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:breakTimes')}</label>
              <input
                type="text"
                value={formData.tripCoordinator.breakTimes}
                onChange={(e) => handleNestedChange('tripCoordinator', 'breakTimes', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:breakTimes')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:meals')}</label>
              {formData.tripCoordinator.meals.map((meal, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={meal.mealType}
                    onChange={(e) => handleNestedMealChange(index, 'mealType', e.target.value)}
                    placeholder={t('profile:mealType')}
                    className="w-1/2 p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none mr-2"
                  />
                  <input
                    type="text"
                    value={meal.mealDescription}
                    onChange={(e) => handleNestedMealChange(index, 'mealDescription', e.target.value)}
                    placeholder={t('profile:mealDescription')}
                    className="w-1/2 p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  />
                </div>
              ))}
              <div className='flex justify-center items-center' style={{ backgroundColor: "#64748B" }}>
                <Plus size={16} />
                <button
                  onClick={() => addMeal()}
                  className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded"
                >
                  {t('profile:addMeal')}
                </button>
              </div>
            </div>
            <div>
              <label className="flex items-center">
                <span className="text-sm font-semibold mr-2">{t('profile:containsAidBag')}</span>
                <input
                  type="checkbox"
                  checked={formData.tripCoordinator.containsAidBag}
                  onChange={(e) => handleNestedChange('tripCoordinator', 'containsAidBag', e.target.checked)}
                  className="mr-2"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:activities')}</label>
              <input
                type="text"
                value={formData.tripCoordinator.activities}
                onChange={(e) => handleNestedChange('tripCoordinator', 'activities', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:activities')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:priceForFamilyOf2')}</label>
              <input
                type="number"
                value={formData.tripCoordinator.priceForFamilyOf2}
                onChange={(e) => handleNestedChange('tripCoordinator', 'priceForFamilyOf2', parseFloat(e.target.value))}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:priceForFamilyOf2')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:priceForFamilyOf3')}</label>
              <input
                type="number"
                value={formData.tripCoordinator.priceForFamilyOf3}
                onChange={(e) => handleNestedChange('tripCoordinator', 'priceForFamilyOf3', parseFloat(e.target.value))}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:priceForFamilyOf3')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:priceForFamilyOf4')}</label>
              <input
                type="number"
                value={formData.tripCoordinator.priceForFamilyOf4}
                onChange={(e) => handleNestedChange('tripCoordinator', 'priceForFamilyOf4', parseFloat(e.target.value))}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:priceForFamilyOf4')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:tripProgram')}</label>
              <textarea
                value={formData.tripCoordinator.tripProgram}
                onChange={(e) => handleNestedChange('tripCoordinator', 'tripProgram', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:tripProgram')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:levelOfHardship')}</label>
              <select
                value={formData.tripCoordinator.levelOfHardship}
                onChange={(e) => handleNestedChange('tripCoordinator', 'levelOfHardship', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
              >
                <option value="">{t('profile:selectLevel')}</option>
                <option value="beginner">{t('profile:beginner')}</option>
                <option value="intermediate">{t('profile:intermediate')}</option>
                <option value="advanced">{t('profile:advanced')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:conditionsAndRequirements')}</label>
              <textarea
                value={formData.tripCoordinator.conditionsAndRequirements}
                onChange={(e) => handleNestedChange('tripCoordinator', 'conditionsAndRequirements', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:conditionsAndRequirements')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:safetyAndEquipment')}</label>
              <textarea
                value={formData.tripCoordinator.safetyAndEquipment}
                onChange={(e) => handleNestedChange('tripCoordinator', 'safetyAndEquipment', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:safetyAndEquipment')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:cancellationAndRefundPolicy')}</label>
              <textarea
                value={formData.tripCoordinator.cancellationAndRefundPolicy}
                onChange={(e) => handleNestedChange('tripCoordinator', 'cancellationAndRefundPolicy', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:cancellationAndRefundPolicy')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:moreDetails')}</label>
              <textarea
                value={formData.tripCoordinator.moreDetails}
                onChange={(e) => handleNestedChange('tripCoordinator', 'moreDetails', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:moreDetails')}
              />
            </div>
          </div>
        );

      case 'competitions':
        return (
          <div className="space-y-6 wow animate__animated animate__fadeIn" data-wow-delay=".3s">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">{t('profile:competitionLevel')}</label>
                <select
                  value={formData.competitions.level}
                  onChange={(e) => handleNestedChange('competitions', 'level', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  required
                >
                  <option value="">{t('profile:selectLevel')}</option>
                  <option value="beginner">{t('profile:beginner')}</option>
                  <option value="intermediate">{t('profile:intermediate')}</option>
                  <option value="advanced">{t('profile:advanced')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">{t('profile:raceType')}</label>
                <select
                  value={formData.competitions.raceType}
                  onChange={(e) => handleNestedChange('competitions', 'raceType', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  required
                >
                  <option value="">{t('profile:selectRaceType')}</option>
                  <option value="endurance_race">{t('profile:enduranceRace')}</option>
                  <option value="shooting_arrows">{t('profile:shootingArrows')}</option>
                  <option value="pickup_pegs">{t('profile:pickupPegs')}</option>
                  <option value="dressage">{t('profile:dressage')}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">{t('profile:organiserName')}</label>
                <input
                  type="text"
                  value={formData.competitions.organiserName}
                  onChange={(e) => handleNestedChange('competitions', 'organiserName', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder={t('profile:organiserName')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">{t('profile:prize')}</label>
                <input
                  type="text"
                  value={formData.competitions.prize}
                  onChange={(e) => handleNestedChange('competitions', 'prize', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder={t('profile:prize')}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:sponsor')}</label>
              <input
                type="text"
                value={formData.competitions.sponsor}
                onChange={(e) => handleNestedChange('competitions', 'sponsor', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:sponsor')}
              />
            </div>
            <div className="mb-4 wow animate__animated animate__fadeIn" data-wow-delay=".3s">
              <label className="flex items-center justify-between px-2 bg-blueGray-50 rounded" htmlFor="sponsor-logo-input">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleNestedChange('competitions', 'sponsorLogo', e.target.files[0])}
                  name="Choose file"
                  id="sponsor-logo-input"
                />
                {formData.competitions.sponsorLogo ? (
                  <span className="ml-2 text-blueGray-600">
                    {formData.competitions.sponsorLogo.name}
                  </span>
                ) : (
                  <span className="ml-2 text-blueGray-600">{t('profile:noFileSelected')}</span>
                )}
                <div className='py-2'>
                  {formData.competitions.sponsorLogo && (
                    <button
                      type="button"
                      className="mr-4 justify-center items-center text-red-500"
                      onClick={() => handleNestedChange('competitions', 'sponsorLogo', null)}
                    >
                      <Trash size={16} style={{ color: "red" }} />
                    </button>
                  )}
                  <span className="px-4 py-3 text-xs text-white font-semibold leading-none bg-blueGray-500 hover:bg-blueGray-600 rounded cursor-pointer">{t('profile:browse')}</span>
                </div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:sponsorshipValue')}</label>
              <input
                type="number"
                value={formData.competitions.sponsorshipValue}
                onChange={(e) => handleNestedChange('competitions', 'sponsorshipValue', parseFloat(e.target.value))}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:sponsorshipValue')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:heightDistance')}</label>
              <input
                type="text"
                value={formData.competitions.heightDistance}
                onChange={(e) => handleNestedChange('competitions', 'heightDistance', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:heightDistance')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:mainReferee')}</label>
              <input
                type="text"
                value={formData.competitions.mainReferee}
                onChange={(e) => handleNestedChange('competitions', 'mainReferee', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:mainReferee')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:coReferee1')}</label>
              <input
                type="text"
                value={formData.competitions.coReferee1}
                onChange={(e) => handleNestedChange('competitions', 'coReferee1', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:coReferee1')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:coReferee2')}</label>
              <input
                type="text"
                value={formData.competitions.coReferee2}
                onChange={(e) => handleNestedChange('competitions', 'coReferee2', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:coReferee2')}
              />
            </div>
          </div>
        );

      case 'horse_transport':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 wow animate__animated animate__fadeIn" data-wow-delay=".3s">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:numberOfHorses')}</label>
              <input
                type="number"
                value={formData.transportDetails.numberOfHorses}
                onChange={(e) => handleNestedChange('transportDetails', 'numberOfHorses', parseInt(e.target.value))}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:numberOfHorses')}
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:vehicleType')}</label>
              <input
                type="text"
                value={formData.transportDetails.vehicleType}
                onChange={(e) => handleNestedChange('transportDetails', 'vehicleType', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:vehicleType')}
                required
              />
            </div>
          </div>
        );

      case 'housing':
        return (
          <div className="wow animate__animated animate__fadeIn space-y-6" data-wow-delay=".3s">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:housingDetails')}</label>
              <textarea
                name="housingDetails"
                value={formData.housingDetails.housingDetails}
                onChange={(e) => handleNestedChange('housingDetails', 'housingDetails', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:housingDetails')}
                required
              />
            </div>
          </div>
        );

      case 'horse_catering':
        return (
          <div className="wow animate__animated animate__fadeIn space-y-6" data-wow-delay=".3s">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:cateringOptions')}</label>
              <input
                type="text"
                value={formData.cateringOptions.join(', ')}
                onChange={(e) => handleChange({ target: { name: 'cateringOptions', value: e.target.value.split('profile:, ') } })}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:cateringOptions')}
                required
              />
            </div>
          </div>
        );

      case 'contractors':
        return (
          <div className="wow animate__animated animate__fadeIn space-y-6" data-wow-delay=".3s">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:contractorDetails')}</label>
              <textarea
                name="contractorDetails"
                value={formData.contractorDetails}
                onChange={handleChange}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:contractorDetails')}
                required
              />
            </div>
          </div>
        );

      case 'suppliers':
        return (
          <div className="wow animate__animated animate__fadeIn space-y-6" data-wow-delay=".3s">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:supplierDetails')}</label>
              <textarea
                name="supplierDetails"
                value={formData.supplierDetails}
                onChange={handleChange}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:supplierDetails')}
                required
              />
            </div>
          </div>
        );

      case 'horse_trainer':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 wow animate__animated animate__fadeIn" data-wow-delay=".3s">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:trainerLevel')}</label>
              <select
                value={formData.horseTrainerDetails.trainerLevel}
                onChange={(e) => handleNestedChange('horseTrainerDetails', 'trainerLevel', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                required
              >
                <option value="">{t('profile:selectLevel')}</option>
                <option value="beginner">{t('profile:beginner')}</option>
                <option value="intermediate">{t('profile:intermediate')}</option>
                <option value="advanced">{t('profile:advanced')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:accreditationCertificate')}</label>
              <input
                type="text"
                value={formData.horseTrainerDetails.accreditationCertificate}
                onChange={(e) => handleNestedChange('horseTrainerDetails', 'accreditationCertificate', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:accreditationCertificate')}
                required
              />
            </div>
          </div>
        );

      case 'hoof_trimmer':
        return (
          <div className="wow animate__animated animate__fadeIn space-y-6" data-wow-delay=".3s">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('profile:hoofTrimmerDetails')}</label>
              <textarea
                name="hoofTrimmerDetails"
                value={formData.hoofTrimmerDetails.hoofTrimmerDetails}
                onChange={(e) => handleNestedChange('hoofTrimmerDetails', 'hoofTrimmerDetails', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:hoofTrimmerDetails')}
                required
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Add a function to prepare the form data before submission
  const prepareFormData = (data) => {
    const preparedData = { ...data };

    // Only include tripCoordinator fields if the service type is 'trip_coordinator'
    if (data.serviceType !== 'trip_coordinator') {
      delete preparedData.tripCoordinator;
    } else {
      // Ensure dates are in ISO format for trip coordinator
      if (preparedData.tripCoordinator) {
        // Format start date
        if (preparedData.tripCoordinator.startDate) {
          preparedData.tripCoordinator.startDate = new Date(preparedData.tripCoordinator.startDate).toISOString();
        }

        // Format end date
        if (preparedData.tripCoordinator.endDate) {
          preparedData.tripCoordinator.endDate = new Date(preparedData.tripCoordinator.endDate).toISOString();
        }
      }
    }

    // Remove any undefined or null fields
    Object.keys(preparedData).forEach(key => {
      if (preparedData[key] === undefined || preparedData[key] === null) {
        delete preparedData[key];
      }
    });

    return preparedData;
  };

  const handleSubmit = async (e) => {
    console.log("Submit event triggered");
    e.preventDefault();

    if (!currentUser?.userId) {
      toast.error("Please log in to create a service");
      return;
    }

    if (!agreedToTerms || !confirmDataAccuracy) {
      toast.error("Please agree to the terms and confirm data accuracy.");
      return;
    }

    setIsSubmitting(true);

    let providerId = null;
    let createdService = null;

    try {
      // Always create a new provider
      const providerDoc = {
        _type: "provider",
        name_ar: formData.name_ar,
        name_en: formData.name_en,
        userRef: {
          _type: "reference",
          _ref: currentUser.userId,
        },
        servicesRef: [],
        mainServiceRef: null,
      };

      const createdProvider = await client.create(providerDoc);
      providerId = createdProvider._id;

      // Handle image upload
      let imageAsset = null;
      if (formData.image && formData.image instanceof File) {
        imageAsset = await client.assets.upload("image", formData.image);
      }

      // Handle graduation certificate upload
      let graduationCertificateAsset = null;
      if (formData.graduationDetails?.graduationCertificate instanceof File) {
        graduationCertificateAsset = await client.assets.upload(
          "file",
          formData.graduationDetails.graduationCertificate
        );
      }

      // Prepare service document
      const serviceDoc = {
        _type: "services",
        ...formData,
        providerRef: {
          _type: "reference",
          _ref: providerId,
        },
        image: imageAsset
          ? {
            _type: "image",
            asset: {
              _type: "reference",
              _ref: imageAsset._id,
            },
          }
          : null,
        country: selectedCountry
          ? { _type: "reference", _ref: selectedCountry }
          : null,
        government: selectedGovernorate
          ? { _type: "reference", _ref: selectedGovernorate }
          : null,
        city: selectedCity
          ? { _type: "reference", _ref: selectedCity }
          : null,
        statusAdminApproved: false,
        isMainService: true,
        graduationDetails: {
          ...formData.graduationDetails,
          graduationCertificate: graduationCertificateAsset
            ? {
              _type: "file",
              asset: {
                _type: "reference",
                _ref: graduationCertificateAsset._id,
              },
            }
            : null,
        },
      };

      // Create service
      createdService = await client.create(serviceDoc);

      // Update provider with main service reference
      await client
        .patch(providerId)
        .set({
          mainServiceRef: {
            _type: "reference",
            _ref: createdService._id,
          },
        })
        .commit();

      toast.success("Service created successfully!");

      // Reset form
      setFormData(initialFormState);
      setImagePreview(null);
      setAgreedToTerms(false);
      setConfirmDataAccuracy(false);

      // Optional: Refresh or navigate
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error("Error in service creation:", err);
      toast.error(err.message || "Failed to create service");

      // Cleanup: Delete provider if service creation failed
      if (providerId) {
        try {
          await client.delete(providerId);
          console.log("Cleanup: Provider deleted due to service creation failure");
        } catch (deleteErr) {
          console.error("Error during provider cleanup:", deleteErr);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinksChange = (e) => {
    const linksValue = e.target.value;
    const linksArray = linksValue ? linksValue.split('profile:,').map(link => link.trim()) : [];
    setFormData(prev => ({
      ...prev,
      links: linksArray
    }));
  };

  const handleNestedMealChange = (index, fieldName, value) => {
    const newMeals = [...formData.tripCoordinator.meals];
    newMeals[index][fieldName] = value;
    setFormData({
      ...formData,
      tripCoordinator: {
        ...formData.tripCoordinator,
        meals: newMeals
      }
    });
  };

  const addMeal = () => {
    setFormData(prev => ({
      ...prev,
      tripCoordinator: {
        ...prev.tripCoordinator,
        meals: [
          ...(prev.tripCoordinator?.meals || []),
          {
            _key: generateKey(),
            mealType: '',
            mealDescription: ''
          }
        ]
      }
    }));
  };

  return (
    <div className={`max-w-full mx-auto ${isRTL ? 'rtl' : ''}`}>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {error && (
          <Alert variant="destructive" className="m-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          {/* Image Upload Section */}
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-48">
              {imagePreview ? (
                <div className="relative w-full h-full rounded-xl overflow-hidden group">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    width={100}
                    height={30}
                  />
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    aria-label="Delete image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  style={{ padding: "0px 50px" }}
                  className="flex flex-col items-center justify-center w-full h-full border-4 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-all duration-300"
                >
                  <Upload className="w-10 h-10 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">{t('profile:uploadImage')}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                  />
                </label>
              )}
            </div>
          </div>

          {/* Block 1: Basic Information, Contact Information, and Description */}
          <div className="space-y-8">
            {/* Block Title */}
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">{t('profile:serviceDetails')}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".2s">
                <label className="block text-sm font-semibold mb-2">{t('profile:serviceNameArabic')}</label>
                <input
                  type="text"
                  name="name_ar"
                  value={formData.name_ar}
                  onChange={handleChange}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder={t('profile:serviceNameArabic')}
                  required
                  dir="rtl"
                />
              </div>
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".2s">
                <label className="block text-sm font-semibold mb-2">{t('profile:serviceNameEnglish')}</label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleChange}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder={t('profile:serviceNameEnglish')}
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".3s">
                <label className="block text-sm font-semibold mb-2">{t('profile:serviceNumber')}</label>
                <input
                  type="tel"
                  name="servicePhone"
                  value={formData.servicePhone}
                  onChange={handleChange}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder={t('profile:serviceNumber')}
                  required
                />
              </div>
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".3s">
                <label className="block text-sm font-semibold mb-2">{t('profile:serviceEmail')}</label>
                <input
                  type="email"
                  name="serviceEmail"
                  value={formData.serviceEmail}
                  onChange={handleChange}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder={t('profile:serviceEmail')}
                  required
                />
              </div>
            </div>

            {/* Description Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".5s">
                <label className="block text-sm font-semibold mb-2">{t('profile:serviceDescriptionArabic')}</label>
                <textarea
                  name="about_ar"
                  value={formData.about_ar}
                  onChange={handleChange}
                  className="w-full h-32 p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none resize-none"
                  placeholder={t('profile:serviceDescriptionArabic')}
                  required
                  dir="rtl"
                />
              </div>
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".5s">
                <label className="block text-sm font-semibold mb-2">{t('profile:serviceDescriptionEnglish')}</label>
                <textarea
                  name="about_en"
                  value={formData.about_en}
                  onChange={handleChange}
                  className="w-full h-32 p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none resize-none"
                  placeholder={t('profile:serviceDescriptionEnglish')}
                  required
                />
              </div>
            </div>
          </div>

          {/* Block 3: Service Type and Price */}
          <div className="space-y-8" style={{ borderTop: "1px solid #64748B" }}>
            {/* Block Title */}
            <div className="flex items-center gap-4 mt-6">
              <h2 className="text-xl font-semibold">{t('profile:serviceTypeAndPricing')}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            </div>

            {/* Service Type Selection */}
            <div className="wow animate__animated animate__fadeIn" data-wow-delay=".1s">
              <label className="block text-sm font-semibold mb-2">{t('profile:serviceType')}</label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                required
              >
                <option value="">{t('profile:selectServiceTypes')}</option>
                {Object.entries(serviceTypeIcons).map(([value, icon]) => (
                  <option key={value} value={value} className="flex items-center gap-2">
                    {t(`profile:${value}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Service Type Fields */}
            {formData.serviceType && (
              <div className="pt-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {serviceTypeIcons[formData.serviceType]}
                  {t('profile:serviceDetailsTitle')}
                </h3>
                {renderServiceTypeFields()}
              </div>
            )}

            {/* Price Field */}
            <div className="wow animate__animated animate__fadeIn" data-wow-delay=".6s">
              <label className="block text-sm font-semibold mb-2">{t('profile:servicePrice')}</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder={t('profile:servicePrice')}
                required
                min="0"
              />
            </div>
          </div>

          {/* Block 2: Address and Links */}
          <div className="space-y-8" style={{ borderTop: "1px solid #64748B" }}>
            {/* Block Title */}
            <div className="flex items-center gap-4 mt-6">
              <h2 className="text-xl font-semibold">{t('profile:locationAndLinks')}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            </div>

            {/* Country, Governorate, and City Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".6s">
                <label className="block text-sm font-semibold mb-2">{t('profile:country')}</label>
                <select
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  required
                >
                  <option value="">{t('profile:selectCountry')}</option>
                  {countries.map(country => (
                    <option key={country._id} value={country._id}>
                      {i18n.language === 'ar' ? country.name_ar : country.name_en}
                    </option>
                  ))}
                </select>
              </div>
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".6s">
                <label className="block text-sm font-semibold mb-2">{t('profile:governorate')}</label>
                <select
                  value={selectedGovernorate}
                  onChange={handleGovernorateChange}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  disabled={!selectedCountry}
                  required
                >
                  <option value="">{t('profile:selectGovernorate')}</option>
                  {governorates.map(governorate => (
                    <option key={governorate._id} value={governorate._id}>
                      {i18n.language === 'ar' ? governorate.name_ar : governorate.name_en}
                    </option>
                  ))}
                </select>
              </div>
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".6s">
                <label className="block text-sm font-semibold mb-2">{t('profile:city')}</label>
                <select
                  value={selectedCity}
                  onChange={handleCityChange}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  disabled={!selectedGovernorate}
                  required
                >
                  <option value="">{t('profile:selectCity')}</option>
                  {cities.map(city => (
                    <option key={city._id} value={city._id}>
                      {i18n.language === 'ar' ? city.name_ar : city.name_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>


            {/* Links */}
            <div className="wow animate__animated animate__fadeIn" data-wow-delay=".4s">
              <label className="block text-sm font-semibold mb-2">{t('profile:links')}</label>
              {formData.links.map((link, index) => (
                <div key={link._key} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    className={`w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none
          ${(link.url && !isValidUrl(link.url))
                        ? 'border-2 border-[#f00]'
                        : ''
                      }`}
                    placeholder={t('profile:enterValidURL')}
                    required={index < 3}
                  />
                  {index >= 3 && (
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="p-2 text-red-500 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              {formData.links.length < 6 && (
                <button
                  type="button"
                  onClick={addLink}
                  className="mt-2 px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                >
                  <Plus size={16} /> {t('profile:addAnotherLink')}
                </button>
              )}
            </div>

          </div>

          {/* Block 4: Terms and Conditions */}
          <div className="space-y-8" style={{ borderTop: "1px solid #64748B" }}>
            {/* Block Title */}
            <div className="flex items-center gap-4 mt-6">
              <h2 className="text-xl font-semibold">{t('profile:termsAndConditions')}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            </div>

            {/* Terms and Submit */}
            <div className="flex flex-col gap-4">
              {/* First Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="form-checkbox custom-checkbox h-5 w-5 text-blue-500 rounded"
                />
                <span className="text-sm font-semibold">{t('profile:agreeToTerms')}</span>
              </label>

              {/* Second Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.confirmDataAccuracy}
                  onChange={(e) =>
                    setConfirmDataAccuracy(e.target.checked)
                  }
                  className="form-checkbox custom-checkbox h-5 w-5 text-blue-500 rounded"
                />
                <span className="text-sm font-semibold">
                  {t('profile:confirmDataAccuracy')}
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !agreedToTerms || !confirmDataAccuracy}
                className={`py-2 px-6 text-sm font-semibold rounded transition-all duration-200
                        ${isSubmitting || !agreedToTerms || !confirmDataAccuracy
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-100 active:bg-blue-200'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t('profile:processing')}
                  </>
                ) : (
                  t('profile:submit')
                )}
              </button>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProviderServiceForm;
