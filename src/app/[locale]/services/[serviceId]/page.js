'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    MapPin, Phone, Mail, Calendar, Clock, Award, Users,
    Heart, Share2, Star, Shield, ChevronLeft, ChevronRight,
    CheckCircle, AlertTriangle, X
} from 'lucide-react';
import { client, urlFor } from '../../../../lib/sanity';
import Layout from 'components/layout/Layout';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import ReservationPopup from 'components/elements/ReservationPopup';
import Preloader from 'components/elements/Preloader';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Alert component
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

export default function ServiceDetailsPage() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const params = useParams();
    const { serviceId } = params;

    const [service, setService] = useState(null);
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
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
          graduationDetails { graduationCertificate, previousExperience },
          competitions { level, heightDistance, organiserName, mainReferee, coReferee1, coReferee2, raceType, prize, sponsor, sponsorLogo, sponsorshipValue },
          housingDetails { housingDetails },
          horseTrainerDetails { trainerLevel, accreditationCertificate },
          hoofTrimmerDetails { hoofTrimmerDetails },
          transportDetails { numberOfHorses, vehicleType },
          contractorDetails,
          supplierDetails,
          cateringOptions,
          tripCoordinator {
            locationOfHorses, locationOfTent, startDate, endDate, breakTimes, meals[] { mealType, mealDescription },
            containsAidBag, activities, priceForFamilyOf2, priceForFamilyOf3, priceForFamilyOf4, tripProgram,
            levelOfHardship, conditionsAndRequirements, safetyAndEquipment, cancellationAndRefundPolicy, moreDetails
          }
        }`;

                const serviceData = await client.fetch(serviceQuery, { serviceId });
                setService(serviceData);
                setProvider(serviceData.providerRef);

                const likedServices = JSON.parse(localStorage.getItem('likedServices') || '[]');
                if (likedServices.includes(serviceId)) {
                    setIsLiked(true);
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchServiceAndProvider();
    }, [serviceId]);

    const showAlert = useCallback((message, type = 'error') => {
        setAlert({ isVisible: true, message, type });
        setTimeout(() => setAlert({ isVisible: false, message: '', type: 'error' }), 3000);
    }, []);

    const handleLikeToggle = useCallback(() => {
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);

        const likedServices = JSON.parse(localStorage.getItem('likedServices') || '[]');
        if (newIsLiked) {
            if (!likedServices.includes(serviceId)) {
                likedServices.push(serviceId);
            }
            showAlert(t('serviceDetails:service_added_to_favorites'), 'success');
        } else {
            const updatedLikedServices = likedServices.filter(id => id !== serviceId);
            localStorage.setItem('likedServices', JSON.stringify(updatedLikedServices));
            showAlert(t('serviceDetails:service_removed_from_favorites'), 'success');
        }
        localStorage.setItem('likedServices', JSON.stringify(likedServices));
    }, [isLiked, serviceId, showAlert, t]);

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

    const images = service?.images ? service.images.map(image => urlFor(image).url()) : [];

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
            case 'veterinary':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-xl shadow-md"
                    >
                        <h3 className="text-xl font-bold mb-4">{t('serviceDetails:veterinary_qualifications')}</h3>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="mt-1 mr-3 text-primary">
                                    <Award size={20} />
                                </div>
                                <div>
                                    <p className="font-medium">{t('serviceDetails:graduation_certificate')}</p>
                                    <p className="text-gray-600">{service.graduationDetails?.graduationCertificate || t('serviceDetails:not_specified')}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="mt-1 mr-3 text-primary">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="font-medium">{t('serviceDetails:previous_experience')}</p>
                                    <p className="text-gray-600">{service.graduationDetails?.previousExperience || t('serviceDetails:not_specified')}</p>
                                </div>
                            </div>
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
                        <h3 className="text-xl font-bold mb-4">{t('serviceDetails:trip_details')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-primary mb-2">{t('serviceDetails:dates_and_location')}</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <Calendar size={18} className="mr-2 text-gray-600" />
                                        <span>
                                            {service.tripCoordinator?.startDate && service.tripCoordinator?.endDate
                                                ? `${new Date(service.tripCoordinator.startDate).toLocaleDateString()} - ${new Date(service.tripCoordinator.endDate).toLocaleDateString()}`
                                                : t('serviceDetails:not_specified')
                                            }
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
                                            4.8 <span className="text-sm ml-1">({t('serviceDetails:reviews', { count: 256 })})</span>
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
                                        onClick={handleLikeToggle}
                                        className="bg-[#ffffff6e] bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all duration-300 transform hover:scale-110"
                                        aria-label={isLiked ? t('serviceDetails:remove_from_favorites') : t('serviceDetails:add_to_favorites')}
                                    >
                                        <Heart size={24} className={isLiked ? "text-red-500 fill-red-500" : "text-white"} />
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
                            <Image fill src={image} alt={`${service.name_en || 'Service'} - ${index + 1}`} className="w-full h-full object-cover" />
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
                                                    </div>
                                                </div>

                                                {service.serviceType === 'trip_coordinator' && service.tripCoordinator && (
                                                    <div className="bg-gray-50 p-5 rounded-lg md:col-span-2 hover:shadow-md transition-shadow">
                                                        <h3 className="font-semibold mb-3">{t('serviceDetails:additional_trip_details')}</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {service.tripCoordinator.levelOfHardship && (
                                                                <div className="text-gray-700">
                                                                    <span className="font-medium">{t('serviceDetails:difficulty_level')}: </span>
                                                                    {service.tripCoordinator.levelOfHardship}
                                                                </div>
                                                            )}
                                                            {service.tripCoordinator.containsAidBag && (
                                                                <div className="text-gray-700">
                                                                    <span className="font-medium">{t('serviceDetails:first_aid')}: </span>
                                                                    {t('yes')}
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
                                                            {service.price || '-'} {t('serviceDetails:currency')}
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
                                    <div className="flex items-center">
                                        <Award className="mr-3 text-primary" size={20} />
                                        <span className="text-gray-700">{t('serviceDetails:experience')}: 5+ {t('serviceDetails:years')}</span>
                                    </div>
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
                                            fill
                                            src={provider?.image ? urlFor(provider.image).url() : "/placeholder.jpg"}
                                            alt={isRTL ? provider?.name_ar : provider?.name_en}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium">{isRTL ? provider?.name_ar : provider?.name_en}</p>
                                        <p className="text-sm text-gray-500 flex items-center">
                                            <Star size={14} className="mr-1 text-yellow-400" /> 5.0 ({t('serviceDetails:ratedBy')} 128 {t('serviceDetails:users')})
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