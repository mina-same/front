
import React, { useState, useCallback, useEffect } from 'react';
import { createClient } from '@sanity/client';
import {
  Camera,
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
  Scissors
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const client = createClient({
  projectId: '5dt0594k', // Replace with your project ID
  dataset: 'production', // Replace with your dataset name
  apiVersion: '2023-01-01', // Use the latest API version
  useCdn: false, // Set to true if you want to use the CDN
  token: process.env.SANITY_API_TOKEN, // Add your API token if required
});

const ServiceForm = ({ currentUser, onSubmit }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [confirmDataAccuracy, setConfirmDataAccuracy] = useState(false)

  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    price: '',
    image: null,
    servicePhone: '',
    serviceEmail: '',
    links: '',
    about_ar: '',
    about_en: '',
    serviceType: '',
    location: '',
    country: '',
    government: '',
    city: '',
    graduationDetails: {
      graduationCertificate: '',
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
      sponsorshipValue: 0
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
      startDate: '',
      endDate: '',
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
    statusProviderApproved: true
  });

  useEffect(() => {
    client.fetch('*[_type == "country"]{_id, name_en}')
      .then(data => setCountries(data))
      .catch(error => console.error(error));
  }, []);

  // Fetch governorates based on selected country
  useEffect(() => {
    if (selectedCountry) {
      client.fetch(`*[_type == "governorate" && country._ref == $countryId]{_id, name_en}`, { countryId: selectedCountry })
        .then(data => setGovernorates(data))
        .catch(error => console.error(error));
    } else {
      setGovernorates([]);
    }
  }, [selectedCountry]);

  // Fetch cities based on selected governorate
  useEffect(() => {
    if (selectedGovernorate) {
      client.fetch(`*[_type == "city" && governorate._ref == $governorateId]{_id, name_en}`, { governorateId: selectedGovernorate })
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
              <label className="block text-sm font-semibold mb-2">Stable Location Details</label>
              <textarea
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder="Enter stable location details"
                required
              />
            </div>
          </div>
        );

      case 'veterinary':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 wow animate__animated animate__fadeIn" data-wow-delay=".3s">
            <div>
              <label className="block text-sm font-semibold mb-2">Graduation Certificate</label>
              <input
                type="text"
                value={formData.graduationDetails.graduationCertificate}
                onChange={(e) => handleNestedChange('graduationDetails', 'graduationCertificate', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder="Enter graduation certificate details"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Previous Experience</label>
              <input
                type="text"
                value={formData.graduationDetails.previousExperience}
                onChange={(e) => handleNestedChange('graduationDetails', 'previousExperience', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder="Enter previous experience"
                required
              />
            </div>
          </div>
        );

      case 'competitions':
        return (
          <div className="space-y-6 wow animate__animated animate__fadeIn" data-wow-delay=".3s">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Competition Level</label>
                <select
                  value={formData.competitions.level}
                  onChange={(e) => handleNestedChange('competitions', 'level', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  required
                >
                  <option value="">Select Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Race Type</label>
                <select
                  value={formData.competitions.raceType}
                  onChange={(e) => handleNestedChange('competitions', 'raceType', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  required
                >
                  <option value="">Select Race Type</option>
                  <option value="endurance_race">Endurance Race</option>
                  <option value="shooting_arrows">Shooting Arrows</option>
                  <option value="pickup_pegs">Pickup Pegs</option>
                  <option value="dressage">Dressage</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Organiser Name</label>
                <input
                  type="text"
                  value={formData.competitions.organiserName}
                  onChange={(e) => handleNestedChange('competitions', 'organiserName', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder="Enter organiser name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Prize</label>
                <input
                  type="text"
                  value={formData.competitions.prize}
                  onChange={(e) => handleNestedChange('competitions', 'prize', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder="Enter prize details"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Sponsor</label>
                <input
                  type="text"
                  value={formData.competitions.sponsor}
                  onChange={(e) => handleNestedChange('competitions', 'sponsor', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder="Enter sponsor name"
                />
              </div>
            </div>
          </div>
        );

      case 'trip_coordinator':
        return (
          <div className="space-y-6 wow animate__animated animate__fadeIn" data-wow-delay=".3s">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Location of Horses</label>
                <input
                  type="text"
                  value={formData.tripCoordinator.locationOfHorses}
                  onChange={(e) => handleNestedChange('tripCoordinator', 'locationOfHorses', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder="Enter horses location"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Location of Tent</label>
                <input
                  type="text"
                  value={formData.tripCoordinator.locationOfTent}
                  onChange={(e) => handleNestedChange('tripCoordinator', 'locationOfTent', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder="Enter tent location"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.tripCoordinator.startDate}
                  onChange={(e) => handleNestedChange('tripCoordinator', 'startDate', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.tripCoordinator.endDate}
                  onChange={(e) => handleNestedChange('tripCoordinator', 'endDate', e.target.value)}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'horse_transport':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 wow animate__animated animate__fadeIn" data-wow-delay=".3s">
            <div>
              <label className="block text-sm font-semibold mb-2">Number of Horses</label>
              <input
                type="number"
                value={formData.transportDetails.numberOfHorses}
                onChange={(e) => handleNestedChange('transportDetails', 'numberOfHorses', parseInt(e.target.value))}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder="Enter number of horses"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Vehicle Type</label>
              <input
                type="text"
                value={formData.transportDetails.vehicleType}
                onChange={(e) => handleNestedChange('transportDetails', 'vehicleType', e.target.value)}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder="Enter vehicle type"
                required
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        ...formData,
        providerRef: currentUser?.providerId
      });
      // Reset form
      setFormData({
        name_ar: '',
        name_en: '',
        price: '',
        image: null,
        servicePhone: '',
        serviceEmail: '',
        links: '',
        about_ar: '',
        about_en: '',
        serviceType: '',
        location: '',
        country: '',
        government: '',
        city: '',
        graduationDetails: {
          graduationCertificate: '',
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
          sponsorshipValue: 0
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
          startDate: '',
          endDate: '',
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
        statusProviderApproved: true
      });
      setImagePreview(null);
      setAgreedToTerms(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
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
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label style={{ padding: "0px 50px" }} className="flex flex-col items-center justify-center w-full h-full border-4 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-all duration-300">
                  <Upload className="w-10 h-10 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Upload Image</span>
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
              <h2 className="text-xl font-semibold">Service Details</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".2s">
                <label className="block text-sm font-semibold mb-2">Service Name Arabic</label>
                <input
                  type="text"
                  name="name_ar"
                  value={formData.name_ar}
                  onChange={handleChange}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder="Name (Arabic)"
                  required
                  dir="rtl"
                />
              </div>
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".2s">
                <label className="block text-sm font-semibold mb-2">Service Name English</label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleChange}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder="Name (English)"
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".3s">
                <label className="block text-sm font-semibold mb-2">Service number</label>
                <input
                  type="tel"
                  name="servicePhone"
                  value={formData.servicePhone}
                  onChange={handleChange}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder="Phone Number"
                  required
                />
              </div>
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".3s">
                <label className="block text-sm font-semibold mb-2">Service Email</label>
                <input
                  type="email"
                  name="serviceEmail"
                  value={formData.serviceEmail}
                  onChange={handleChange}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  placeholder="Email Address"
                  required
                />
              </div>
            </div>

            {/* Description Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".5s">
                <label className="block text-sm font-semibold mb-2">Service Description In Arabic</label>
                <textarea
                  name="about_ar"
                  value={formData.about_ar}
                  onChange={handleChange}
                  className="w-full h-32 p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none resize-none"
                  placeholder="About (Arabic)"
                  required
                  dir="rtl"
                />
              </div>
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".5s">
                <label className="block text-sm font-semibold mb-2">Service Description In English</label>
                <textarea
                  name="about_en"
                  value={formData.about_en}
                  onChange={handleChange}
                  className="w-full h-32 p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none resize-none"
                  placeholder="About (English)"
                  required
                />
              </div>
            </div>
          </div>

          {/* Block 3: Service Type and Price */}
          <div className="space-y-8" style={{ borderTop: "1px solid #64748B" }}>
            {/* Block Title */}
            <div className="flex items-center gap-4 mt-6">
              <h2 className="text-xl font-semibold">Service Type & Pricing</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            </div>

            {/* Service Type Selection */}
            <div className="wow animate__animated animate__fadeIn" data-wow-delay=".1s">
              <label className="block text-sm font-semibold mb-2">Service Type</label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                required
              >
                <option value="">Select Service Type</option>
                {Object.entries(serviceTypeIcons).map(([value, icon]) => (
                  <option key={value} value={value} className="flex items-center gap-2">
                    {value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Service Type Fields */}
            {formData.serviceType && (
              <div className="pt-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {serviceTypeIcons[formData.serviceType]}
                  Service Details
                </h3>
                {renderServiceTypeFields()}
              </div>
            )}

            {/* Price Field */}
            <div className="wow animate__animated animate__fadeIn" data-wow-delay=".6s">
              <label className="block text-sm font-semibold mb-2">Service Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder="Price"
                required
                min="0"
              />
            </div>
          </div>

          {/* Block 2: Address and Links */}
          <div className="space-y-8" style={{ borderTop: "1px solid #64748B" }}>
            {/* Block Title */}
            <div className="flex items-center gap-4 mt-6">
              <h2 className="text-xl font-semibold">Location & Links</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            </div>

            {/* Country, Governorate, and City Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".6s">
                <label className="block text-sm font-semibold mb-2">Country</label>
                <select
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country._id} value={country._id}>{country.name_en}</option>
                  ))}
                </select>
              </div>
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".6s">
                <label className="block text-sm font-semibold mb-2">Governorate</label>
                <select
                  value={selectedGovernorate}
                  onChange={handleGovernorateChange}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  disabled={!selectedCountry}
                  required
                >
                  <option value="">Select Governorate</option>
                  {governorates.map(governorate => (
                    <option key={governorate._id} value={governorate._id}>{governorate.name_en}</option>
                  ))}
                </select>
              </div>
              <div className="wow animate__animated animate__fadeIn" data-wow-delay=".6s">
                <label className="block text-sm font-semibold mb-2">City</label>
                <select
                  value={selectedCity}
                  onChange={handleCityChange}
                  className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                  disabled={!selectedGovernorate}
                  required
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city._id} value={city._id}>{city.name_en}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Links */}
            <div className="wow animate__animated animate__fadeIn" data-wow-delay=".4s">
              <label className="block text-sm font-semibold mb-2">Links</label>
              <input
                type="text"
                name="links"
                value={formData.links}
                onChange={handleChange}
                className="w-full p-4 text-sm font-semibold bg-blueGray-50 rounded outline-none"
                placeholder="Social Media Links (comma separated)"
              />
            </div>
          </div>

          {/* Block 4: Terms and Conditions */}
          <div className="space-y-8" style={{ borderTop: "1px solid #64748B" }}>
            {/* Block Title */}
            <div className="flex items-center gap-4 mt-6">
              <h2 className="text-xl font-semibold">Terms and Conditions</h2>
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
                <span className="text-sm font-semibold">I agree to terms and conditions</span>
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
                  I confirm all this data is right, Your service will appear after admin approval and it will take 24 hours.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !agreedToTerms || !confirmDataAccuracy}
                className={`
                    py-4 px-8 text-sm text-white font-semibold rounded
                    ${isSubmitting || !agreedToTerms || !confirmDataAccuracy
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-500 transform hover:scale-105 transition-all duration-300'
                  }
                `}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Service'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
