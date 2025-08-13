'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  MapPin, Phone, Mail, Calendar, Clock, Award, Users, Heart, Share2, Star, Shield, ChevronLeft, ChevronRight,
  CheckCircle, AlertTriangle, X, Link2, Instagram, Facebook, Youtube, Twitter, Linkedin, TikTok
} from 'lucide-react';
import { FaPinterest, FaInstagram, FaFacebook, FaYoutube, FaLinkedin, FaTwitter, FaTiktok } from "react-icons/fa";
import { client, urlFor } from '../../../../lib/sanity';
import Layout from 'components/layout/Layout';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import ReservationPopup from 'components/elements/ReservationPopup';
import Preloader from 'components/elements/Preloader';
import { motion, AnimatePresence } from 'framer-motion';

// Alert Component
const Alert = ({ message, isVisible, onClose, type }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-auto"
      >
        <div className={`bg-white shadow-xl rounded-lg p-4 flex items-start ${type === "success" ? "border-l-4 border-green-500" : "border-l-4 border-red-500"}`}>
          {type === "success" ? (
            <CheckCircle className="text-green-500 mr-3" size={24} />
          ) : (
            <AlertTriangle className="text-red-500 mr-3" size={24} />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close alert"
          >
            <X size={20} />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Image Gallery Modal Component
const ImageGalleryModal = ({ selectedIndex, images, onClose, onNext, onPrev }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div className="relative max-w-6xl w-full px-6" onClick={e => e.stopPropagation()}>
      <motion.img
        key={selectedIndex}
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0.5, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        src={images[selectedIndex]}
        alt="Gallery image"
        className="w-full h-auto max-h-[80vh] object-contain"
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
        aria-label="Close gallery"
      >
        <X size={24} />
      </button>
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
        aria-label="Previous image"
        disabled={selectedIndex === 0}
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
        aria-label="Next image"
        disabled={selectedIndex === images.length - 1}
      >
        <ChevronRight size={28} />
      </button>
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2.5 h-2.5 rounded-full ${selectedIndex === index ? 'bg-white' : 'bg-white bg-opacity-40'}`}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

// Social Media Icon Component
const SocialMediaIcon = ({ linkType, url }) => {
  const icons = {
    website: <Link2 size={20} />,
    instagram: <FaInstagram size={20} />,
    facebook: <FaFacebook size={20} />,
    youtube: <FaYoutube size={20} />,
    x: <FaTwitter size={20} />,
    linkedin: <FaLinkedin size={20} />,
    pinterest: <FaPinterest size={20} />,
    tiktok: <FaTiktok size={20} />,
  };
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">
      {icons[linkType] || <Link2 size={20} />}
    </a>
  );
};

export default function ServiceDetailsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const params = useParams();
  const { serviceId } = params;

  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [alert, setAlert] = useState({ isVisible: false, message: '', type: 'error' });

  useEffect(() => {
    if (!serviceId) return;

    const fetchServiceAndProvider = async () => {
      try {
        const serviceQuery = `*[_type == "services" && _id == $serviceId][0]{
          ...,
          city->{name_ar, name_en},
          country->{name_ar, name_en},
          government->{name_ar, name_en},
          providerRef->{
            _id,
            name_ar,
            name_en,
            image,
            servicesRef[]->{
              _id,
              name_ar,
              name_en,
              image,
              serviceType,
              price,
              statusAdminApproved
            }
          },
          horseStabelDetails { horses[]->, additionalBenefits, dateOfEstablishment, licensesAndCertificates, kindOfStable, stableDescription, listingPurpose },
          VeterinaryDetails { specialties, professionalLicense, additionalServices, graduationOrAccreditationCertificate },
          competitions { level, heightDistance, organiserName, mainReferee, coReferee1, coReferee2, raceType, prize, sponsor, sponsorLogo, sponsorshipValue },
          housingDetails { accommodationType },
          horseTrainerDetails { trainerLevel, specialization, yearsOfExperience, qualifications, additionalBenefits },
          hoofTrimmerDetails { specialization, methodsAndTools, certifications, additionalServices },
          horseGroomingDetails { methodsAndTools, certifications, additionalServices },
          eventJudgingDetails { eventTypes, certifications, judgingLevel },
          marketingPromotionDetails { portfolioLinks, certifications },
          eventCommentaryDetails { portfolioLink, certifications },
          consultingServicesDetails { certifications },
          photographyServicesDetails { photographyTypes, portfolioLink, certifications },
          transportDetails { maxLoad, suspensionSystem, ventilationAndLighting, internalBarriers, advancedVentilation, wallUpholstery, horseInsurance, waterAndFood, emergencyVetServices, experienceYears, certifications, relevantLicenses, termsAndPolicies },
          horseCateringDetails { additionalServices },
          tripCoordinator {
            locationOfHorses, locationOfTent, startDate, endDate, breakTimes, meals[] { mealType, mealDescription },
            containsAidBag, activities, additionalBenefits, priceForFamilyOf2, priceForFamilyOf3, priceForFamilyOf4,
            levelOfHardship, conditionsAndRequirements, safetyAndEquipment, cancellationAndRefundPolicy, moreDetails
          }
        }`;

        const serviceData = await client.fetch(serviceQuery, { serviceId });
        setService(serviceData);
        setProvider(serviceData.providerRef);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    const verifyAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Verify API failed with status: ${response.status}`);
        const data = await response.json();
        if (data.authenticated) {
          const userId = data.userId || data.user?.id || data.user?.userId;
          setCurrentUserId(userId);
          const userQuery = `*[_type == "user" && _id == $userId][0]{wishlistServices[]->{_id}}`;
          const userData = await client.fetch(userQuery, { userId });
          const isServiceInWishlist = userData?.wishlistServices?.some(service => service._id === serviceId) || false;
          setIsInWishlist(isServiceInWishlist);
        }
      } catch (error) {
        console.error('Auth verification failed:', error.message);
      }
    };

    fetchServiceAndProvider();
    verifyAuth();
  }, [serviceId]);

  const showAlert = useCallback((message, type = 'error') => {
    setAlert({ isVisible: true, message, type });
    setTimeout(() => setAlert({ isVisible: false, message: '', type: 'error' }), 3000);
  }, []);

  const toggleWishlist = async () => {
    if (!currentUserId) {
      showAlert(t('serviceDetails:loginToWishlist'));
      return;
    }
    try {
      setWishlistLoading(true);
      const userQuery = `*[_type == "user" && _id == $userId][0]{wishlistServices[]->{_id}}`;
      const userData = await client.fetch(userQuery, { userId: currentUserId });
      const isServiceInWishlist = userData?.wishlistServices?.some(service => service._id === serviceId);

      if (isServiceInWishlist) {
        await client
          .patch(currentUserId)
          .unset([`wishlistServices[_ref == "${serviceId}"]`])
          .commit();
        setIsInWishlist(false);
        showAlert(t('serviceDetails:removedFromWishlist'), 'success');
      } else {
        const newWishlistEntry = {
          _type: 'reference',
          _ref: serviceId,
          _key: `service-${serviceId}-${Date.now()}`
        };
        await client
          .patch(currentUserId)
          .setIfMissing({ wishlistServices: [] })
          .append('wishlistServices', [newWishlistEntry])
          .commit();
        setIsInWishlist(true);
        showAlert(t('serviceDetails:addedToWishlist'), 'success');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showAlert(t('serviceDetails:wishlistUpdateFailed'));
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: isRTL ? service.name_ar : service.name_en,
          url
        });
        showAlert(t('serviceDetails:shared_successfully'), 'success');
      } else {
        await navigator.clipboard.writeText(url);
        showAlert(t('serviceDetails:link_copied'), 'success');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        showAlert(t('serviceDetails:share_failed'), 'error');
      }
    }
  };

  const handleNextImage = () => {
    if (images.length > 0) {
      setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
    }
  };

  const handlePrevImage = () => {
    if (images.length > 0) {
      setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
  };

  const images = service?.images ? service.images.map(image => {
    if (image._upload) {
      return image._upload.previewImage;
    }
    return urlFor(image).url();
  }) : [];

  if (loading) return <Layout><Preloader /></Layout>;
  if (error) return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('serviceDetails:error_occurred')}</h1>
        <p className="text-gray-600">{error.message}</p>
        <Link href="/services" className="mt-6 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors">
          {t('serviceDetails:back_to_services')}
        </Link>
      </div>
    </Layout>
  );

  if (!service) return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('serviceDetails:service_not_found')}</h1>
        <p className="text-gray-600">{t('serviceDetails:service_not_found_message')}</p>
        <Link href="/services" className="mt-6 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors">
          {t('serviceDetails:browse_services')}
        </Link>
      </div>
    </Layout>
  );

  const ServiceTypeContent = () => {
    switch (service.serviceType) {
      case 'horse_stable':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{t('serviceDetails:horseStableDetails')}</h3>
            <div className="space-y-4">
              {service.horseStabelDetails?.kindOfStable && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:stableType')}</p>
                    <p className="text-gray-600">{t(`serviceDetails:stableTypes.${service.horseStabelDetails.kindOfStable}`)}</p>
                  </div>
                </div>
              )}
              {service.horseStabelDetails?.dateOfEstablishment && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:dateOfEstablishment')}</p>
                    <p className="text-gray-600">{new Date(service.horseStabelDetails.dateOfEstablishment).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {service.horseStabelDetails?.stableDescription && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:stableDescription')}</p>
                    <p className="text-gray-600">{service.horseStabelDetails.stableDescription}</p>
                  </div>
                </div>
              )}
              {service.horseStabelDetails?.additionalBenefits?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-primary mb-2">{t('serviceDetails:additionalBenefits')}</h4>
                  <ul className="list-disc pl-5">
                    {service.horseStabelDetails.additionalBenefits.map((benefit, index) => (
                      <li key={index} className="text-gray-600">
                        {isRTL ? benefit.name_ar : benefit.name_en} - {benefit.additional_price} {t('serviceDetails:currency')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'veterinary':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{t('serviceDetails:veterinaryDetails')}</h3>
            <div className="space-y-4">
              {service.VeterinaryDetails?.specialties?.length > 0 && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:specialties')}</p>
                    <p className="text-gray-600">{service.VeterinaryDetails.specialties.map(s => t(`serviceDetails:specialtiesList.${s}`)).join(', ')}</p>
                  </div>
                </div>
              )}
              {service.VeterinaryDetails?.professionalLicense?.licenseNumber && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:licenseNumber')}</p>
                    <p className="text-gray-600">{service.VeterinaryDetails.professionalLicense.licenseNumber}</p>
                  </div>
                </div>
              )}
              {service.VeterinaryDetails?.additionalServices?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-primary mb-2">{t('serviceDetails:additionalServices')}</h4>
                  <ul className="list-disc pl-5">
                    {service.VeterinaryDetails.additionalServices.map((service, index) => (
                      <li key={index} className="text-gray-600">
                        {isRTL ? service.name_ar : service.name_en} - {service.additional_price} {t('serviceDetails:currency')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'competitions':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{t('serviceDetails:competitionDetails')}</h3>
            <div className="space-y-4">
              {service.competitions?.level && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:level')}</p>
                    <p className="text-gray-600">{service.competitions.level}</p>
                  </div>
                </div>
              )}
              {service.competitions?.raceType && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:raceType')}</p>
                    <p className="text-gray-600">{t(`serviceDetails:raceTypes.${service.competitions.raceType}`)}</p>
                  </div>
                </div>
              )}
              {service.competitions?.prize && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Star size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:prize')}</p>
                    <p className="text-gray-600">{service.competitions.prize}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'housing':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{t('serviceDetails:housingDetails')}</h3>
            <div className="space-y-4">
              {service.housingDetails?.accommodationType?.length > 0 && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:accommodationType')}</p>
                    <p className="text-gray-600">{service.housingDetails.accommodationType.map(t => t(`serviceDetails:accommodationTypes.${t}`)).join(', ')}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'horse_trainer':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{t('serviceDetails:horseTrainerDetails')}</h3>
            <div className="space-y-4">
              {service.horseTrainerDetails?.trainerLevel && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:trainerLevel')}</p>
                    <p className="text-gray-600">{t(`serviceDetails:trainerLevels.${service.horseTrainerDetails.trainerLevel}`)}</p>
                  </div>
                </div>
              )}
              {service.horseTrainerDetails?.specialization && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Star size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:specialization')}</p>
                    <p className="text-gray-600">{t(`serviceDetails:specializations.${service.horseTrainerDetails.specialization}`)}</p>
                  </div>
                </div>
              )}
              {service.horseTrainerDetails?.additionalBenefits?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-primary mb-2">{t('serviceDetails:additionalBenefits')}</h4>
                  <ul className="list-disc pl-5">
                    {service.horseTrainerDetails.additionalBenefits.map((benefit, index) => (
                      <li key={index} className="text-gray-600">
                        {isRTL ? benefit.name_ar : benefit.name_en} - {benefit.price} {t('serviceDetails:currency')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'hoof_trimmer':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{t('serviceDetails:hoofTrimmerDetails')}</h3>
            <div className="space-y-4">
              {service.hoofTrimmerDetails?.specialization && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:specialization')}</p>
                    <p className="text-gray-600">{t(`serviceDetails:hoofTrimmerSpecializations.${service.hoofTrimmerDetails.specialization}`)}</p>
                  </div>
                </div>
              )}
              {service.hoofTrimmerDetails?.methodsAndTools && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:methodsAndTools')}</p>
                    <p className="text-gray-600">{service.hoofTrimmerDetails.methodsAndTools}</p>
                  </div>
                </div>
              )}
              {service.hoofTrimmerDetails?.additionalServices?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-primary mb-2">{t('serviceDetails:additionalServices')}</h4>
                  <ul className="list-disc pl-5">
                    {service.hoofTrimmerDetails.additionalServices.map((service, index) => (
                      <li key={index} className="text-gray-600">
                        {isRTL ? service.name_ar : service.name_en} - {service.price} {t('serviceDetails:currency')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'horse_grooming':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{t('serviceDetails:horseGroomingDetails')}</h3>
            <div className="space-y-4">
              {service.horseGroomingDetails?.methodsAndTools && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:methodsAndTools')}</p>
                    <p className="text-gray-600">{service.horseGroomingDetails.methodsAndTools}</p>
                  </div>
                </div>
              )}
              {service.horseGroomingDetails?.additionalServices?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-primary mb-2">{t('serviceDetails:additionalServices')}</h4>
                  <ul className="list-disc pl-5">
                    {service.horseGroomingDetails.additionalServices.map((service, index) => (
                      <li key={index} className="text-gray-600">
                        {isRTL ? service.name_ar : service.name_en} - {service.price} {t('serviceDetails:currency')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'event_judging':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{t('serviceDetails:eventJudgingDetails')}</h3>
            <div className="space-y-4">
              {service.eventJudgingDetails?.eventTypes?.length > 0 && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:eventTypes')}</p>
                    <p className="text-gray-600">{service.eventJudgingDetails.eventTypes.map(t => t(`serviceDetails:eventTypes.${t}`)).join(', ')}</p>
                  </div>
                </div>
              )}
              {service.eventJudgingDetails?.judgingLevel && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:judgingLevel')}</p>
                    <p className="text-gray-600">{t(`serviceDetails:judgingLevels.${service.eventJudgingDetails.judgingLevel}`)}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'marketing_promotion':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{t('serviceDetails:marketingPromotionDetails')}</h3>
            <div className="space-y-4">
              {service.marketingPromotionDetails?.portfolioLinks?.length > 0 && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Link2 size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:portfolioLinks')}</p>
                    <ul className="list-disc pl-5">
                      {service.marketingPromotionDetails.portfolioLinks.map((link, index) => (
                        <li key={index} className="text-gray-600">
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {isRTL ? link.description_ar : link.description_en}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'event_commentary':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{t('serviceDetails:eventCommentaryDetails')}</h3>
            <div className="space-y-4">
              {service.eventCommentaryDetails?.portfolioLink?.url && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Link2 size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:portfolioLink')}</p>
                    <a href={service.eventCommentaryDetails.portfolioLink.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {isRTL ? service.eventCommentaryDetails.portfolioLink.description_ar : service.eventCommentaryDetails.portfolioLink.description_en}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'consulting_services':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{t('serviceDetails:consultingServicesDetails')}</h3>
            <div className="space-y-4">
              <p className="text-gray-600">{t('serviceDetails:consultingDescription')}</p>
            </div>
          </motion.div>
        );
      case 'photography_services':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{t('serviceDetails:photographyServicesDetails')}</h3>
            <div className="space-y-4">
              {service.photographyServicesDetails?.photographyTypes?.length > 0 && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:photographyTypes')}</p>
                    <p className="text-gray-600">{service.photographyServicesDetails.photographyTypes.map(t => t(`serviceDetails:photographyTypes.${t}`)).join(', ')}</p>
                  </div>
                </div>
              )}
              {service.photographyServicesDetails?.portfolioLink?.url && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Link2 size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:portfolioLink')}</p>
                    <a href={service.photographyServicesDetails.portfolioLink.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {isRTL ? service.photographyServicesDetails.portfolioLink.description_ar : service.photographyServicesDetails.portfolioLink.description_en}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'horse_transport':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{t('serviceDetails:horseTransportDetails')}</h3>
            <div className="space-y-4">
              {service.transportDetails?.maxLoad && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:maxLoad')}</p>
                    <p className="text-gray-600">{service.transportDetails.maxLoad} {t('serviceDetails:horses')}</p>
                  </div>
                </div>
              )}
              {service.transportDetails?.suspensionSystem && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:suspensionSystem')}</p>
                    <p className="text-gray-600">{t('serviceDetails:available')}</p>
                  </div>
                </div>
              )}
              {service.transportDetails?.termsAndPolicies && (
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('serviceDetails:termsAndPolicies')}</p>
                    <p className="text-gray-600">{service.transportDetails.termsAndPolicies}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'horse_catering':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{t('serviceDetails:horseCateringDetails')}</h3>
            <div className="space-y-4">
              {service.horseCateringDetails?.additionalServices?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-primary mb-2">{t('serviceDetails:additionalServices')}</h4>
                  <ul className="list-disc pl-5">
                    {service.horseCateringDetails.additionalServices.map((service, index) => (
                      <li key={index} className="text-gray-600">
                        {isRTL ? service.name_ar : service.name_en} - {service.price} {t('serviceDetails:currency')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'trip_coordinator':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{t('serviceDetails:tripDetails')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-primary mb-2">{t('serviceDetails:datesAndLocation')}</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar size={18} className="mr-2 text-gray-600" />
                    <span>
                      {service.tripCoordinator?.startDate && service.tripCoordinator?.endDate
                        ? `${new Date(service.tripCoordinator.startDate).toLocaleDateString()} - ${new Date(service.tripCoordinator.endDate).toLocaleDateString()}`
                        : t('serviceDetails:not_specified')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={18} className="mr-2 text-gray-600" />
                    <span>{service.tripCoordinator?.locationOfTent || t('serviceDetails:not_specified')}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-primary mb-2">{t('serviceDetails:pricing')}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>{t('serviceDetails:family_of_2')}</span>
                    <span className="font-bold">{service.tripCoordinator?.priceForFamilyOf2 || '-'} {t('serviceDetails:currency')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('serviceDetails:family_of_3')}</span>
                    <span className="font-bold">{service.tripCoordinator?.priceForFamilyOf3 || '-'} {t('serviceDetails:currency')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('serviceDetails:family_of_4')}</span>
                    <span className="font-bold">{service.tripCoordinator?.priceForFamilyOf4 || '-'} {t('serviceDetails:currency')}</span>
                  </div>
                </div>
              </div>
              {service.tripCoordinator?.additionalBenefits?.length > 0 && (
                <div className="mt-4 col-span-2">
                  <h4 className="font-medium text-primary mb-2">{t('serviceDetails:additionalBenefits')}</h4>
                  <ul className="list-disc pl-5">
                    {service.tripCoordinator.additionalBenefits.map((benefit, index) => (
                      <li key={index} className="text-gray-600">
                        {isRTL ? benefit.name_ar : benefit.name_en} - {benefit.additional_price} {t('serviceDetails:currency')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {service.tripCoordinator?.activities && (
              <div className="mt-4">
                <h4 className="font-medium text-primary mb-2">{t('serviceDetails:activities')}</h4>
                <p className="text-gray-600">{service.tripCoordinator.activities}</p>
              </div>
            )}
          </motion.div>
        );
      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{t('serviceDetails:serviceDetails')}</h3>
            <p className="text-gray-600 leading-relaxed">{isRTL ? service.description_ar : service.description_en}</p>
          </motion.div>
        );
    }
  };

  const AdditionalServices = () => {
    if (!provider?.servicesRef?.length) return null;
    const additionalServices = provider.servicesRef.filter(s => s._id !== serviceId && s.statusAdminApproved === true);
    if (!additionalServices.length) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <span className="mr-2">{t('serviceDetails:additionalServices')}</span>
          <div className="h-1 flex-grow bg-gray-200 rounded ml-4"></div>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {additionalServices.map((service) => (
            <Link href={`/services/${service._id}`} key={service._id} className="group">
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-48 w-full">
                  <Image
                    src={service.image ? urlFor(service.image).url() : "/placeholder.jpg"}
                    alt={isRTL ? service.name_ar : service.name_en}
                    layout="fill"
                    width={0}
                    height={0}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{isRTL ? service.name_ar : service.name_en}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-primary font-medium">
                      {service.price} {t('serviceDetails:currency')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {t(`serviceTypes.${service.serviceType}`)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
        <Alert
          message={alert.message}
          isVisible={alert.isVisible}
          onClose={() => setAlert({ isVisible: false, message: '', type: 'error' })}
          type={alert.type}
        />

        {/* Hero Section */}
        <div className="relative h-96 md:h-[500px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70"></div>
          <Image
            src={images[0] || '/placeholder.jpg'}
            alt={isRTL ? service.name_ar : service.name_en}
            className="w-full h-full object-cover"
            width={0}
            height={0}
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-end">
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 shadow-text"
                  >
                    {isRTL ? service.name_ar : service.name_en}
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap items-center gap-4 text-white/90"
                  >
                    <span className="flex items-center">
                      <MapPin size={18} className="mr-1" />
                      {isRTL ? service.city?.name_ar : service.city?.name_en}
                    </span>
                    <span className="flex items-center">
                      <Star size={18} className="mr-1 text-yellow-400" />
                      {service.serviceAverageRating || 4.8} <span className="text-sm ml-1">({t('serviceDetails:reviews', { count: service.serviceRatingCount || 256 })})</span>
                    </span>
                    <span className="py-1 px-3 bg-primary/80 rounded-full text-sm font-medium">
                      {t(`serviceTypes.${service.serviceType}`)}
                    </span>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3"
                >
                  <button
                    onClick={toggleWishlist}
                    className="bg-[#ffffff6e] bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={wishlistLoading}
                    aria-label={isInWishlist ? t('serviceDetails:remove_from_wishlist') : t('serviceDetails:add_to_wishlist')}
                  >
                    {wishlistLoading ? (
                      <div className="w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin" />
                    ) : (
                      <Heart size={24} className={isInWishlist ? "text-red-500 fill-red-500" : "text-white"} />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="bg-[#ffffff6e] bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all duration-300 transform hover:scale-110"
                    aria-label={t('serviceDetails:share')}
                  >
                    <Share2 size={24} className="text-white" />
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 flex justify-center gap-4 shadow-md overflow-x-auto"
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="w-20 h-20 rounded-md overflow-hidden cursor-pointer flex-shrink-0 hover:opacity-80 transition-opacity"
              onClick={() => setSelectedImageIndex(index)}
            >
              <Image width={0} height={0} src={image} alt={`${service.name_en || 'Service'} - ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </motion.div>

        {/* Image Gallery Modal */}
        <AnimatePresence>
          {selectedImageIndex !== null && (
            <ImageGalleryModal
              selectedIndex={selectedImageIndex}
              images={images}
              onClose={() => setSelectedImageIndex(null)}
              onNext={handleNextImage}
              onPrev={handlePrevImage}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden mb-6"
              >
                <div className="border-b border-gray-200">
                  <div className="flex">
                    {['overview', 'details', 'pricing'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-4 font-medium transition-colors duration-300 ${activeTab === tab
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-gray-500 hover:text-gray-800'
                          }`}
                      >
                        {t(tab)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold mb-4">{t('serviceDetails:aboutService')}</h2>
                      <p className="text-gray-600 mb-6 leading-relaxed">{isRTL ? service.about_ar : service.about_en}</p>
                      {service.past_experience_en && (
                        <div className="mb-6">
                          <h3 className="text-xl font-semibold mb-2">{t('serviceDetails:pastExperience')}</h3>
                          <p className="text-gray-600">{isRTL ? service.past_experience_ar : service.past_experience_en}</p>
                        </div>
                      )}
                      <ServiceTypeContent />
                    </motion.div>
                  )}

                  {activeTab === 'details' && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold mb-4">{t('serviceDetails:serviceDetails')}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-5 rounded-lg hover:shadow-md transition-shadow">
                          <h3 className="font-semibold mb-3 flex items-center">
                            <Clock className="mr-2 text-primary" size={20} />
                            {t('serviceDetails:availability')}
                          </h3>
                          <div className="ml-7 text-gray-700">
                            <div className="mb-2">
                              <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                                {t('serviceDetails:openNow')}
                              </span>
                              {service.workingHours}
                            </div>
                            {service.availabilityNotes && (
                              <p className="text-sm text-gray-600">{service.availabilityNotes}</p>
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-5 rounded-lg hover:shadow-md transition-shadow">
                          <h3 className="font-semibold mb-3 flex items-center">
                            <Phone className="mr-2 text-primary" size={20} />
                            {t('serviceTypes:contactInfo')}
                          </h3>
                          <div className="ml-7 space-y-3">
                            {service.servicePhone && (
                              <div className="flex items-center">
                                <Phone className="mr-2 text-gray-500" size={16} />
                                <a href={`tel:${service.servicePhone}`} className="hover:underline text-primary">
                                  {service.servicePhone}
                                </a>
                              </div>
                            )}
                            {service.serviceEmail && (
                              <div className="flex items-center">
                                <Mail className="mr-2 text-gray-500" size={16} />
                                <a href={`mailto:${service.serviceEmail}`} className="hover:underline text-primary">
                                  {service.serviceEmail}
                                </a>
                              </div>
                            )}
                            {service.links?.length > 0 && (
                              <div className="flex items-center gap-4">
                                <Link2 className="mr-2 text-gray-500" size={16} />
                                {service.links.map((link, index) => (
                                  <SocialMediaIcon key={index} linkType={link.linkType} url={link.url} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {service.address_details && (
                          <div className="bg-gray-50 p-5 rounded-lg hover:shadow-md transition-shadow">
                            <h3 className="font-semibold mb-3 flex items-center">
                              <MapPin className="mr-2 text-primary" size={20} />
                              {t('serviceDetails:addressDetails')}
                            </h3>
                            <div className="ml-7 text-gray-700">
                              <p className="text-gray-600">{service.address_details}</p>
                              {service.address_link && (
                                <a href={service.address_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  {t('serviceDetails:viewOnMap')}
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                        {service.tripCoordinator && (
                          <div className="bg-gray-50 p-5 rounded-lg md:col-span-2 hover:shadow-md transition-shadow">
                            <h3 className="font-semibold mb-3">{t('serviceDetails:additionalTripDetails')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {service.tripCoordinator.levelOfHardship && (
                                <div className="text-gray-700">
                                  <span className="font-medium">{t('serviceDetails:difficultyLevel')}: </span>
                                  {service.tripCoordinator.levelOfHardship}
                                </div>
                              )}
                              {service.tripCoordinator.containsAidBag && (
                                <div className="text-gray-700">
                                  <span className="font-medium">{t('serviceDetails:firstAid')}: </span>
                                  {t('yes')}
                                </div>
                              )}
                              {service.tripCoordinator.safetyAndEquipment && (
                                <div className="text-gray-700">
                                  <span className="font-medium">{t('serviceDetails:safetyAndEquipment')}: </span>
                                  {service.tripCoordinator.safetyAndEquipment}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'pricing' && (
                    <motion.div
                      key="pricing"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold mb-4">{t('serviceDetails:pricingPackages')}</h2>
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-5 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">{t('serviceDetails:standardPackage')}</h3>
                            <span className="text-xl font-bold text-primary">
                              {service.price || '-'} {t('serviceDetails:currency')} {service.priceUnit ? `(${t(`serviceDetails:priceUnits.${service.priceUnit}`)})` : ''}
                            </span>
                          </div>
                          {service.serviceType === 'trip_coordinator' && (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span>{t('serviceDetails:family_of_2')}</span>
                                <span className="font-medium">
                                  {service.tripCoordinator?.priceForFamilyOf2 || '-'} {t('serviceDetails:currency')}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>{t('serviceDetails:family_of_3')}</span>
                                <span className="font-medium">
                                  {service.tripCoordinator?.priceForFamilyOf3 || '-'} {t('serviceDetails:currency')}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>{t('serviceDetails:family_of_4')}</span>
                                <span className="font-medium">
                                  {service.tripCoordinator?.priceForFamilyOf4 || '-'} {t('serviceDetails:currency')}
                                </span>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => setIsReservationModalOpen(true)}
                            className="w-full mt-4 bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                          >
                            {t('bookNow')}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <AdditionalServices />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-md p-6 sticky top-6"
              >
                <h3 className="font-bold text-lg mb-4">{t('serviceDetails:quickFacts')}</h3>
                <div className="space-y-4">
                  {service.years_of_experience && (
                    <div className="flex items-center">
                      <Award className="mr-3 text-primary" size={20} />
                      <span className="text-gray-700">{t('serviceDetails:experience')}: {service.years_of_experience} {t('serviceDetails:years')}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Users className="mr-3 text-primary" size={20} />
                    <span className="text-gray-700">{t('serviceDetails:clientsServed')}: 500+</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="mr-3 text-primary" size={20} />
                    <span className="text-gray-700">{t('serviceDetails:certified')}: {t('serviceDetails:yes')}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-md p-6 sticky top-56"
              >
                <h3 className="font-bold text-lg mb-4">{t('serviceDetails:contactProvider')}</h3>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 mr-3 overflow-hidden">
                    <Image
                      width={0}
                      height={0}
                      src={provider?.image ? urlFor(provider.image).url() : "/placeholder.jpg"}
                      alt={isRTL ? provider?.name_ar : provider?.name_en}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{isRTL ? provider?.name_ar : provider?.name_en}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Star size={14} className="mr-1 text-yellow-400" /> {service.serviceAverageRating || 5.0} ({t('serviceDetails:ratedBy')} {service.serviceRatingCount || 128} {t('serviceDetails:users')})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReservationModalOpen(true)}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg mb-3 transition-all duration-300 transform hover:scale-105"
                >
                  {t('bookNow')}
                </button>
                <button
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  {t('contactProvider')}
                </button>
              </motion.div>
            </div>
          </div>

          {/* Reservation Modal */}
          <ReservationPopup
            isOpen={isReservationModalOpen}
            onClose={() => setIsReservationModalOpen(false)}
            serviceId={serviceId}
            serviceName={isRTL ? service.name_ar : service.name_en}
            providerRef={service.providerRef?._id}
          />
        </div>
      </div>
    </Layout>
  );
}