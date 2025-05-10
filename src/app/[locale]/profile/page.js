"use client";

import React, { useState, useEffect } from 'react';
import Layout from "../../../../components/layout/Layout";
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, CalendarDays, BriefcaseBusiness, CheckCircle, Plus, Users, Briefcase, UserPlus, Sparkles, ShieldCheck, Zap, Calendar, Settings, Edit3, Save, Trash, Shield, User, Clock, Star, Phone, MapPin, Check, X, AlertCircle, Eye, Edit, DollarSign, CalendarRange } from 'lucide-react';
import { client, urlFor } from '../../../lib/sanity';
import { useRouter } from 'next/navigation';
import NewProviderServiceForm from '../../../../components/elements/NewProviderServiceForm';
import userFallbackImage from "../../../../public/assets/imgs/elements/user.png";
import Image from 'next/image';
import AddServiceForm from "../../../../components/elements/AddServiceForm"
import JoinServiceForm from "../../../../components/elements/JoinServiceForm"
import ServiceRequestsDashboard from "../../../../components/elements/ServiceRequestsDashboard"
import ProviderReservations from "../../../../components/elements/ProviderReservations"
import UserReservations from "../../../../components/elements/UserReservations"
import { useTranslation } from 'react-i18next';
import { FaHorse } from 'react-icons/fa';
import { LiaHorseHeadSolid } from "react-icons/lia";
import HorseRegistrationForm from '../../../../components/elements/HorseRegistrationForm';

// Define the delete handlers
const handleProviderDeletion = async (providerId, client) => {
    try {
        const references = await client.fetch(`
            *[references($providerId)]{
                _id,
                _type,
                "fields": *[references($providerId)]
            }
        `, { providerId });

        const activeReservations = await client.fetch(`
            *[_type == "reservation" &&
              provider._ref == $providerId &&
              (status == "pending" || status == "approved")]{
                _id
            }
        `, { providerId });

        if (activeReservations.length > 0) {
            throw new Error('Cannot delete provider with active reservations');
        }

        await client.fetch(`
            *[_type == "user" && references($providerId)]{_id}
        `, { providerId })
            .then(users => {
                return Promise.all(users.map(user =>
                    client.patch(user._id)
                        .unset(['provider'])
                        .commit()
                ));
            });

        await client.fetch(`
            *[_type == "services" && references($providerId)]{_id}
        `, { providerId })
            .then(services => {
                return Promise.all(services.map(service =>
                    client.patch(service._id)
                        .unset(['providerRef'])
                        .commit()
                ));
            });

        await client.fetch(`
            *[_type == "provider" && _id != $providerId && references($providerId)]{_id}
        `, { providerId })
            .then(providers => {
                return Promise.all(providers.map(provider =>
                    client.patch(provider._id)
                        .unset(['mainServiceRef', 'servicesRef', 'pendingRequests'])
                        .commit()
                ));
            });

        await client.fetch(`
            *[_type == "serviceRequest" &&
              (requesterProviderRef._ref == $providerId ||
               receiverProviderRef._ref == $providerId)]{_id}
        `, { providerId })
            .then(requests => {
                return Promise.all(requests.map(request =>
                    client.delete(request._id)
                ));
            });

        await client.fetch(`
            *[_type == "reservation" &&
              provider._ref == $providerId &&
              status == "rejected"]{_id}
        `, { providerId })
            .then(reservations => {
                return Promise.all(reservations.map(reservation =>
                    client.delete(reservation._id)
                ));
            });

        const providerServices = await client.fetch(`
            *[_type == "services" && providerRef._ref == $providerId]{_id}
        `, { providerId });

        await Promise.all(providerServices.map(service =>
            client.delete(service._id)
        ));

        const remainingRefs = await client.fetch(`
            *[references($providerId)]{
                _id,
                _type
            }
        `, { providerId });

        if (remainingRefs.length > 0) {
            await Promise.all(remainingRefs.map(ref =>
                client.patch(ref._id)
                    .unset([
                        'provider',
                        'providerRef',
                        'mainServiceRef',
                        'servicesRef',
                        'pendingRequests',
                        'requesterProviderRef',
                        'receiverProviderRef'
                    ])
                    .commit()
            ));
        }

        await client.delete(providerId);

        return {
            success: true,
            message: 'Provider deleted successfully'
        };

    } catch (error) {
        return {
            success: false,
            message: 'Failed to delete provider',
            error: error.message,
            referenceDoc: error.message.match(/from "(.*?)"/)?.[1] || null
        };
    }
};

const deleteProvider = async (providerId, client) => {
    const result = await handleProviderDeletion(providerId, client);
    if (!result.success && result.referenceDoc) {
        const referencingDoc = await client.fetch(`
            *[_id == $docId][0]{
                _id,
                _type,
                ...
            }
        `, { docId: result.referenceDoc });
    }
    return result;
};

const handleServiceDeletion = async (serviceId, providerId, client) => {
    try {
        await client
            .patch(providerId)
            .unset([`servicesRef[_ref == "${serviceId}"]`])
            .commit();

        const reservationIds = await client.fetch(
            `*[_type == "reservation" && service._ref == $serviceId]._id`,
            { serviceId }
        );

        if (reservationIds.length > 0) {
            await client.delete(reservationIds);
        }

        await client.delete(serviceId);

        return { success: true };
    } catch (error) {
        throw error;
    }
};

const ProfessionalProfileDashboard = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [services, setServices] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingServices, setIsLoadingServices] = useState(false);
    const [isLoadingReservations, setIsLoadingReservations] = useState(false);
    const [error, setError] = useState(null);
    const [providers, setProviders] = useState([]);
    const [showJoinRequest, setShowJoinRequest] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [pendingReservations, setPendingReservations] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [showCreateProvider, setShowCreateProvider] = useState(false);
    const [showAddService, setShowAddService] = useState(false);
    const [showJoinService, setShowJoinService] = useState(false);
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [existingProviderId, setExistingProviderId] = useState(null);
    const [selectedProviderName, setSelectedProviderName] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(0);
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [horses, setHorses] = useState([]);
    const [isLoadingHorses, setIsLoadingHorses] = useState(false);
    const [showHorseForm, setShowHorseForm] = useState(false);
    const [horseReservations, setHorseReservations] = useState([]);
    const [isLoadingHorseReservations, setIsLoadingHorseReservations] = useState(false);

    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;

    const SidebarContent = () => (
        <div className="space-y-2">
            {/* Existing sidebar content */}
        </div>
    );

    const Modal = ({ isOpen, onClose, title, children }) => (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-xl shadow-xl w-full max-w-6xl overflow-y-auto max-h-[90vh]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-semibold">{title}</h3>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const renderServiceFormModal = () => (
        <Modal
            isOpen={showServiceForm}
            onClose={() => setShowServiceForm(false)}
            title={t("profile:createNewService")}
        >
            <NewProviderServiceForm
                currentUser={{ userId, userType: user?.userType }}
            />
        </Modal>
    );

    const NoProvidersView = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4 bg-gradient-to-br bg-blue-200 rounded-2xl shadow-sm"
        >
            <div className="max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Users className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t("profile:startYourProviderJourney")}</h3>
                <p className="text-gray-500">{t("profile:createYourFirstService")}</p>
                <button
                    onClick={() => setShowServiceForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#333] to-[#000] text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="w-5 h-5" />
                    {t("profile:createYourFirstService")}
                </button>
            </div>
        </motion.div>
    );

    const tabs = [
        { key: 'profile', icon: Users, label: t('profile:profile') },
        ...(user?.userType === 'provider' ? [{ key: 'services', icon: Briefcase, label: t('profile:services') }] : []),
        { key: 'horses', icon: FaHorse, label: t('profile:horses') },
        { key: 'reservations', icon: Calendar, label: t('profile:reservations') },
        { key: 'settings', icon: Settings, label: t('profile:settings') }
    ];

    const fetchReservations = async (providerId) => {
        try {
            const query = `*[_type == "reservation" && provider._ref == $providerId]{
            _id,
            datetime,
            status,
            service->{
              _id,
              name_en,
              name_ar,
              image,
              price
            },
            user->{
              _id,
              userName,
              email,
              image,
              phoneNumber,
              location
            }
          }`;

            const result = await client.fetch(query, { providerId });
            return result;
        } catch (error) {
            console.error('Error fetching reservations:', error);
            return [];
        }
    };

    const getDirectionClass = (defaultClasses = '') => {
        return `${defaultClasses} ${isRTL ? 'rtl' : 'ltr'}`;
    };

    useEffect(() => {
        const fetchReservations = async () => {
            setIsLoadingReservations(true);
            try {
                const query = `*[_type == "reservation" && provider._ref in *[_type == "provider" && userRef._ref == $userId]._id]{
                    _id,
                    provider->{
                        _id,
                        name_en,
                        name_ar,
                        userRef->{
                            userName,
                            image
                        },
                        mainServiceRef->{
                            _id,
                            name_en,
                            name_ar,
                            image
                        },
                        servicesRef[]->{
                            _id,
                            name_en,
                            name_ar,
                            image
                        }
                    },
                    datetime,
                    status,
                    proposedDatetime,
                    userResponse,
                    user->{
                        _id,
                        userName,
                        email,
                        image
                    }
                }`;

                const params = { userId };
                const result = await client.fetch(query, params);
                setReservations(result);
            } catch (error) {
                console.error('Error fetching reservations:', error);
                setError('Failed to load reservations.');
            } finally {
                setIsLoadingReservations(false);
            }
        };

        if (activeTab === 'reservations') {
            fetchReservations();
        }
    }, [userId, activeTab]);

    useEffect(() => {
        const fetchHorseReservations = async () => {
            if (!userId || activeTab !== 'horses') return;

            setIsLoadingHorseReservations(true);
            try {
                const query = `*[_type == "horseReservation" && user._ref == $userId && horse->listingPurpose == "rent"]{
                    _id,
                    datetime,
                    status,
                    horse->{
                        _id,
                        fullName,
                        breed,
                        birthDate,
                        images,
                        listingPurpose
                    },
                    user->{
                        _id,
                        userName,
                        email,
                        image
                    }
                }`;
                const result = await client.fetch(query, { userId });
                setHorseReservations(result);
            } catch (error) {
                console.error('Error fetching horse reservations:', error);
                setError('Failed to load horse reservations.');
            } finally {
                setIsLoadingHorseReservations(false);
            }
        };

        fetchHorseReservations();
    }, [userId, activeTab]);

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const response = await fetch('/api/auth/verify', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();

                if (data.authenticated) {
                    setIsAuthenticated(true);
                    setUserId(data.user.id);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error verifying user:', error);
                setError('Authentication failed. Please log in again.');
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        verifyUser();
    }, [router]);

    useEffect(() => {
        if (!userId) return;

        const fetchUserData = async () => {
            try {
                const query = `*[_type == "user" && _id == $userId]{
                    _id,
                    email,
                    userName,
                    fullName,
                    birthDate,
                    image,
                    phoneNumber,
                    nationalNumber,
                    userType,
                    kind,
                    governorate->{
                        _id,
                        name_en,
                        name_ar
                    },
                    country->{
                        _id,
                        name_en,
                        name_ar
                    },
                    city->{
                        _id,
                        name_en,
                        name_ar
                    },
                    addressDetails,
                    addressLink,
                    isProfileCompleted,
                    isEmailVerified,
                    riderDetails{
                        eventTypes,
                        riderLevel,
                        experienceText,
                        yearsOfExperience,
                        certifications[]{
                            description,
                            file
                        },
                        healthCondition,
                        medicalCertificates[]
                    },
                    providerDetails{
                        offeredServices
                    },
                    horses[]->{
                        _id,
                        fullName
                    }
                }[0]`;
                const params = { userId };
                const userData = await client.fetch(query, params);

                if (!userData) {
                    throw new Error('User not found.');
                }

                setUser(userData);
                setFormData(userData);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to load profile data.');
            }
        };

        fetchUserData();
    }, [userId]);

    useEffect(() => {
        const fetchProviders = async () => {
            if (!userId || user?.userType !== 'provider') return;

            setIsLoadingServices(true);
            try {
                const providersQuery = `*[_type == "provider" && userRef._ref == $userId]{
                    _id,
                    name_en,
                    name_ar,
                    mainServiceRef->{
                        _id,
                        name_en,
                        name_ar,
                        price,
                        image,
                        statusAdminApproved,
                        statusProviderApproved,
                        serviceType
                    },
                    servicesRef[]->{
                        _id,
                        name_en,
                        name_ar,
                        price,
                        image,
                        statusAdminApproved,
                        statusProviderApproved,
                        serviceType
                    }
                }`;

                const result = await client.fetch(providersQuery, { userId });
                setProviders(result);

                const reservationsQuery = `*[_type == "reservation" && provider._ref in $providerIds && status == "pending"]{
                    _id,
                    datetime,
                    status,
                    user->{
                        _id,
                        userName,
                        email,
                        image
                    },
                    service->{
                        _id,
                        name_en,
                        name_ar,
                        price
                    },
                    provider->{
                        _id,
                        name_en,
                        name_ar
                    }
                }`;

                const providerIds = result.map(p => p._id);
                const reservations = await client.fetch(reservationsQuery, { providerIds });
                setPendingReservations(reservations);

            } catch (error) {
                console.error('Error fetching providers and reservations:', error);
                setError('Failed to load providers and services.');
            } finally {
                setIsLoadingServices(false);
            }
        };

        if (activeTab === 'services') {
            fetchProviders();
        }
    }, [userId, user?.userType, activeTab]);

    // Fetch horses when the "horses" tab is active
    useEffect(() => {
        const fetchHorses = async () => {
            if (!userId || activeTab !== 'horses') return;

            setIsLoadingHorses(true);
            try {
                const query = `*[_type == "horse" && owner._ref == $userId]{
                    _id,
                    fullName,
                    breed,
                    birthDate,
                    images,
                    gender,
                    mainColor,
                    listingPurpose,
                }`;
                const result = await client.fetch(query, { userId });
                setHorses(result);
            } catch (error) {
                console.error('Error fetching horses:', error);
                setError('Failed to load horses.');
            } finally {
                setIsLoadingHorses(false);
            }
        };

        fetchHorses();
    }, [userId, activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await client.patch(userId).set(formData).commit();
            setUser({ ...user, ...formData });
            setIsEditing(false);
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 3000);
        } catch (err) {
            setError('Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const ProviderCard = ({ provider, isRTL }) => {
        const [providerReservations, setProviderReservations] = useState([]);
        const [isLoadingProviderReservations, setIsLoadingProviderReservations] = useState(false);

        useEffect(() => {
            const fetchProviderReservations = async () => {
                setIsLoadingProviderReservations(true);
                try {
                    const query = `*[_type == "reservation" && provider._ref == $providerId]{
                        _id,
                        datetime,
                        status,
                        proposedDatetime,
                        userResponse,
                        service->{
                            _id,
                            name_en,
                            name_ar,
                            price,
                            image
                        },
                        user->{
                            _id,
                            userName,
                            email,
                            image,
                            phoneNumber
                        }
                    }`;

                    const result = await client.fetch(query, { providerId: provider._id });
                    setProviderReservations(result);
                } catch (error) {
                    console.error('Error fetching provider reservations:', error);
                } finally {
                    setIsLoadingProviderReservations(false);
                }
            };

            fetchProviderReservations();
        }, [provider._id]);

        const mainService = provider.mainServiceRef;
        const additionalServices = provider.servicesRef || [];

        const handleDeleteProvider = async () => {
            if (window.confirm('Are you sure you want to delete this provider? This action cannot be undone.')) {
                try {
                    await handleProviderDeletion(provider._id, client);
                    setProviders(prevProviders =>
                        prevProviders.filter(p => p._id !== provider._id)
                    );
                } catch (error) {
                    console.error('Error deleting provider:', error);
                    setError('Failed to delete provider.');
                }
            }
        };

        const handleDeleteService = async (serviceId) => {
            if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
                try {
                    await handleServiceDeletion(serviceId, provider._id, client);
                    setProviders(prevProviders =>
                        prevProviders.map(p => {
                            if (p._id === provider._id) {
                                return {
                                    ...p,
                                    servicesRef: p.servicesRef.filter(s => s._id !== serviceId)
                                };
                            }
                            return p;
                        })
                    );
                } catch (error) {
                    console.error('Error deleting service:', error);
                    setError('Failed to delete service.');
                }
            }
        };

        const getDirectionClass = (className) => {
            return isRTL ? className.replace(/left-/g, 'right-').replace(/right-/g, 'left-') : className;
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={getDirectionClass("relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100/50 backdrop-blur-sm")}
            >
                {/* Hero Section - Made responsive */}
                <div className="relative h-64 sm:h-80 overflow-hidden group">
                    {mainService && (
                        <>
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Image
                                    src={mainService.image ? urlFor(mainService.image).url() : '/placeholder-service.png'}
                                    alt={mainService.name_en}
                                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                                    width={100}
                                    height={30}
                                />
                            </motion.div>

                            {/* Status Badge - Updated for RTL */}
                            <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} px-3 sm:px-4 py-1.5 sm:py-2 inline-flex items-center rounded-full
                                text-xs sm:text-sm font-semibold backdrop-blur-sm transition-all duration-300 ${mainService.statusAdminApproved
                                    ? 'bg-emerald-600/90 hover:bg-emerald-700 text-emerald-50 ring-2 ring-emerald-200/30'
                                    : 'bg-amber-500/90 hover:bg-amber-600/90 text-amber-50 ring-2 ring-amber-200/30 animate-pulse'
                                } shadow-xl hover:shadow-lg`}>
                                {mainService.statusAdminApproved ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-current" />
                                        <span>{t("profile:approved")}</span>
                                    </>
                                ) : (
                                    <>
                                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-current animate-pulse" />
                                        <span>{t("profile:pendingReview")}</span>
                                    </>
                                )}
                            </div>

                            {/* Profile Section - Updated for RTL */}
                            <div className={getDirectionClass("absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent")}>
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                                    <div className="relative">
                                        <Image
                                            src={user?.image ? urlFor(user.image).url() : userFallbackImage}
                                            alt="Provider"
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-4 ring-white/20 backdrop-blur-sm"
                                            width={80}
                                            height={80}
                                        />
                                    </div>
                                    <div className="space-y-1 text-center sm:text-left">
                                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{provider.name_en}</h2>
                                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 text-white/90">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-white/70">(128)</span>
                                            </div>
                                            <span className="hidden sm:inline mx-1">•</span>
                                            <span>{t("profile:yearsExp")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Delete Button - Updated for RTL */}
                    <button
                        onClick={handleDeleteProvider}
                        className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600/90 text-white rounded-full flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm hover:bg-red-700/90 transition-all duration-300`}
                    >
                        <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{t("profile:deleteMainService")}</span>
                        <span className="sm:hidden">{t("profile:delete")}</span>
                    </button>
                </div>

                {/* Content Section - Updated for RTL */}
                <div className={getDirectionClass("p-4 sm:p-6 space-y-4 sm:space-y-6")}>
                    {mainService && (
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{t("profile:featuredService")}</h3>
                                <div className="flex items-baseline gap-1 sm:gap-2">
                                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">${mainService.price}</span>
                                    <span className="text-sm sm:text-base text-gray-500">{t("profile:session")}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {mainService.serviceType}
                                </div>
                                <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                                    <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {t("profile:instantBooking")}
                                </div>
                                <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                                    <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {t("profile:verifiedPro")}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Additional Services Section - Updated for RTL */}
                    {additionalServices.length > 0 && (
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center justify-between pt-4 sm:pt-6">
                                <h4 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2 sm:gap-3">
                                    <BriefcaseBusiness className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                    {t("profile:additionalServices")}
                                    <span className="bg-blue-100 text-blue-800 px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm">
                                        {additionalServices.length}
                                    </span>
                                </h4>
                            </div>
                            <div className="bg-gray-50 flex gap-3 sm:gap-4 pb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50">
                                {additionalServices.map((service) => (
                                    <motion.div
                                        key={service._id}
                                        whileHover={{ scale: 1.05 }}
                                        className="relative group flex-shrink-0"
                                    >
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                                            <Image
                                                src={service.image ? urlFor(service.image).url() : userFallbackImage}
                                                alt={service.name_en}
                                                className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                                                width={20}
                                                height={20}
                                            />
                                            <div className={`absolute top-1 ${isRTL ? 'left-1' : 'right-1'} w-2 h-2 sm:w-3 sm:h-3 rounded-full ${service.statusAdminApproved ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                                                }`} />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteService(service._id);
                                                }}
                                                className="absolute top-1 left-1 p-1 bg-red-600/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            >
                                                <Trash className="w-2 h-2 sm:w-3 sm:h-3" />
                                            </button>
                                        </div>
                                        <div className="absolute inset-x-0 -bottom-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="inline-block px-2 py-0.5 sm:py-1 bg-black/90 text-white text-xs rounded-lg">
                                                {service.name_en}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    <ProviderReservations
                        reservations={providerReservations}
                        onStatusUpdate={async (reservationId, newStatus) => {
                            try {
                                await client.patch(reservationId).set({ status: newStatus }).commit();

                                // Update local state after successful update
                                setProviderReservations(prevReservations =>
                                    prevReservations.map(reservation =>
                                        reservation._id === reservationId
                                            ? { ...reservation, status: newStatus }
                                            : reservation
                                    )
                                );
                            } catch (error) {
                                console.error('Error updating reservation status:', error);
                            }
                        }}
                    />

                    <ServiceRequestsDashboard providerId={provider._id} />

                    {/* Action Buttons - Updated for RTL */}
                    <div className={getDirectionClass("grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4")}>
                        <motion.button
                            whileHover={{ y: -2 }}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-blue-500 text-blue-500 rounded-xl text-sm sm:text-base font-medium hover:bg-emerald-50 transition-colors"
                            onClick={() => {
                                setSelectedProvider(provider._id);
                                setExistingProviderId(provider._id);
                                setSelectedProviderName(provider.name_en);
                                setShowAddService(true);
                            }}
                        >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            {t("profile:addService")}
                        </motion.button>
                        <motion.button
                            whileHover={{ y: -2 }}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#b28a2f] to-[#9b7733] text-white rounded-xl text-sm sm:text-base font-medium hover:shadow-lg transition-shadow"
                            onClick={() => { setShowJoinService(true); setExistingProviderId(provider._id) }}
                        >
                            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                            {t("profile:joinService")}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderProfileContent = () => (
        <AnimatePresence mode="wait">
            {isEditing ? (
                <motion.form
                    key="edit-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6 bg-white rounded-xl p-6 shadow-sm"
                    onSubmit={handleSubmit}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:fullName")}</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:userName")}</label>
                            <input
                                type="text"
                                name="userName"
                                value={formData.userName || ''}
                                onChange={handleChange}
                                className="w-full px-4(py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:email")}</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                disabled // Email typically shouldn't be editable
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:phone")}</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:nationalNumber")}</label>
                            <input
                                type="text"
                                name="nationalNumber"
                                value={formData.nationalNumber || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:birthDate")}</label>
                            <input
                                type="date"
                                name="birthDate"
                                value={formData.birthDate ? formData.birthDate.split('T')[0] : ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:gender")}</label>
                            <select
                                name="kind"
                                value={formData.kind || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            >
                                <option value="">{t("profile:selectGender")}</option>
                                <option value="male">{t("profile:male")}</option>
                                <option value="female">{t("profile:female")}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:addressDetails")}</label>
                            <input
                                type="text"
                                name="addressDetails"
                                value={formData.addressDetails || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:addressLink")}</label>
                        <input
                            type="url"
                            name="addressLink"
                            value={formData.addressLink || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    {/* Rider Details (Conditional) */}
                    {user?.userType === 'rider' && (
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-semibold">{t("profile:riderDetails")}</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:eventTypes")}</label>
                                <select
                                    name="riderDetails.eventTypes"
                                    multiple
                                    value={formData.riderDetails?.eventTypes || []}
                                    onChange={(e) => {
                                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                                        setFormData(prev => ({
                                            ...prev,
                                            riderDetails: { ...prev.riderDetails, eventTypes: selectedOptions }
                                        }));
                                    }}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="none">{t("profile:none")}</option>
                                    <option value="racing">{t("profile:racing")}</option>
                                    <option value="touring">{t("profile:touring")}</option>
                                    <option value="training">{t("profile:training")}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:riderLevel")}</label>
                                <select
                                    name="riderDetails.riderLevel"
                                    value={formData.riderDetails?.riderLevel || ''}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            riderDetails: { ...prev.riderDetails, riderLevel: e.target.value }
                                        }))
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="">{t("profile:selectLevel")}</option>
                                    <option value="beginner">{t("profile:beginner")}</option>
                                    <option value="intermediate">{t("profile:intermediate")}</option>
                                    <option value="advanced">{t("profile:advanced")}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:experienceText")}</label>
                                <textarea
                                    name="riderDetails.experienceText"
                                    value={formData.riderDetails?.experienceText || ''}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            riderDetails: { ...prev.riderDetails, experienceText: e.target.value }
                                        }))
                                    }
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:yearsOfExperience")}</label>
                                <input
                                    type="number"
                                    name="riderDetails.yearsOfExperience"
                                    value={formData.riderDetails?.yearsOfExperience || 0}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            riderDetails: { ...prev.riderDetails, yearsOfExperience: Number(e.target.value) }
                                        }))
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:healthCondition")}</label>
                                <input
                                    type="text"
                                    name="riderDetails.healthCondition"
                                    value={formData.riderDetails?.healthCondition || ''}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            riderDetails: { ...prev.riderDetails, healthCondition: e.target.value }
                                        }))
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            {/* Note: File uploads for certifications and medicalCertificates require a separate UI component */}
                        </div>
                    )}

                    {/* Provider Details (Conditional) */}
                    {user?.userType === 'provider' && (
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-semibold">{t("profile:providerDetails")}</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:offeredServices")}</label>
                                <select
                                    name="providerDetails.offeredServices"
                                    multiple
                                    value={formData.providerDetails?.offeredServices || []}
                                    onChange={(e) => {
                                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                                        setFormData(prev => ({
                                            ...prev,
                                            providerDetails: { ...prev.providerDetails, offeredServices: selectedOptions }
                                        }));
                                    }}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="horse_stable">{t("profile:horseStable")}</option>
                                    <option value="veterinary">{t("profile:veterinary")}</option>
                                    <option value="competitions">{t("profile:competitions")}</option>
                                    <option value="housing">{t("profile:housing")}</option>
                                    <option value="trip_coordinator">{t("profile:tripCoordinator")}</option>
                                    <option value="horse_catering">{t("profile:horseCatering")}</option>
                                    <option value="horse_transport">{t("profile:horseTransport")}</option>
                                    <option value="contractors">{t("profile:contractors")}</option>
                                    <option value="suppliers">{t("profile:suppliers")}</option>
                                    <option value="horse_trainer">{t("profile:horseTrainer")}</option>
                                    <option value="hoof_trimmer">{t("profile:hoofTrimmer")}</option>
                                    <option value="horse_grooming">{t("profile:horseGrooming")}</option>
                                    <option value="horse_course_provider">{t("profile:horseCourseProvider")}</option>
                                    <option value="digital_library_services">{t("profile:digitalLibraryServices")}</option>
                                    <option value="event_judging">{t("profile:eventJudging")}</option>
                                    <option value="marketing_promotion">{t("profile:marketingPromotion")}</option>
                                    <option value="event_commentary">{t("profile:eventCommentary")}</option>
                                    <option value="consulting_services">{t("profile:consultingServices")}</option>
                                    <option value="photography_services">{t("profile:photographyServices")}</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                        >
                            <X size={20} /> {t("profile:cancel")}
                        </button>
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-[#333] transition-all"
                        >
                            <Save size={20} /> {t("profile:saveChanges")}
                        </button>
                    </div>
                </motion.form>
            ) : (
                <motion.div
                    key="profile-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6 bg-white rounded-xl p-6 shadow-sm"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:fullName")}</h4>
                            <p className="text-lg font-semibold text-gray-900">{user?.fullName || 'N/A'}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:userName")}</h4>
                            <p className="text-lg font-semibold text-gray-900">{user?.userName || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:email")}</h4>
                            <p className="text-lg font-semibold text-gray-900">{user?.email || 'N/A'}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:phone")}</h4>
                            <p className="text-lg font-semibold text-gray-900">{user?.phoneNumber || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:nationalNumber")}</h4>
                            <p className="text-lg font-semibold text-gray-900">{user?.nationalNumber || 'N/A'}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:birthDate")}</h4>
                            <p className="text-lg font-semibold text-gray-900">
                                {user?.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:gender")}</h4>
                            <p className="text-lg font-semibold text-gray-900">
                                {user?.kind ? t(`profile:${user.kind}`) : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:location")}</h4>
                            <p className="text-lg font-semibold text-gray-900">
                                {user?.city ? `${user.city[isRTL ? 'name_ar' : 'name_en']}, ${user.governorate[isRTL ? 'name_ar' : 'name_en']}, ${user.country[isRTL ? 'name_ar' : 'name_en']}` : 'N/A'}
                            </p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:addressDetails")}</h4>
                        <p className="text-lg font-semibold text-gray-900">{user?.addressDetails || 'N/A'}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:addressLink")}</h4>
                        <a
                            href={user?.addressLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-semibold text-blue-600 hover:underline"
                        >
                            {user?.addressLink || 'N/A'}
                        </a>
                    </div>

                    {/* Rider Details (Conditional) */}
                    {user?.userType === 'rider' && (
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-semibold">{t("profile:riderDetails")}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:eventTypes")}</h4>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {user?.riderDetails?.eventTypes?.map(type => t(`profile:${type}`)).join(', ') || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:riderLevel")}</h4>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {user?.riderDetails?.riderLevel ? t(`profile:${user.riderDetails.riderLevel}`) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:experienceText")}</h4>
                                <p className="text-lg font-semibold text-gray-900">{user?.riderDetails?.experienceText || 'N/A'}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:yearsOfExperience")}</h4>
                                    <p className="text-lg font-semibold text-gray-900">{user?.riderDetails?.yearsOfExperience || '0'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:healthCondition")}</h4>
                                    <p className="text-lg font-semibold text-gray-900">{user?.riderDetails?.healthCondition || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Provider Details (Conditional) */}
                    {user?.userType === 'provider' && (
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-semibold">{t("profile:providerDetails")}</h3>
                            <div>
                                <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:offeredServices")}</h4>
                                <p className="text-lg font-semibold text-gray-900">
                                    {user?.providerDetails?.offeredServices?.map(service => t(`profile:${service}`)).join(', ') || 'N/A'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="border-t pt-6 mt-6">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-[#333] transition-all"
                        >
                            <Edit3 size={20} /> {t("profile:editProfile")}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <Check className="w-4 h-4" />;
            case 'rejected':
                return <X className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        }
    };

    const handleJoinRequest = async (providerId) => {
        try {
            const joinRequest = {
                _type: 'joinRequest',
                provider: {
                    _type: 'reference',
                    _ref: providerId,
                },
                user: {
                    _type: 'reference',
                    _ref: userId,
                },
                status: 'pending',
                requestDate: new Date().toISOString(),
            };

            await client.create(joinRequest);
            setShowJoinRequest(false);
        } catch (error) {
            console.error('Error sending join request:', error);
            setError('Failed to send join request.');
        }
    };

    const handleReservationResponse = async (reservationId, status) => {
        try {
            await client.patch(reservationId).set({ status }).commit();
            setReservations(prevReservations =>
                prevReservations.map(reservation =>
                    reservation._id === reservationId
                        ? { ...reservation, status }
                        : reservation
                )
            );
        } catch (error) {
            console.error('Error updating reservation:', error);
            setError('Failed to update reservation status.');
        }
    };

    const renderReservationsContent = () => (
        <UserReservations userId={userId} />
    );

    const handleAddService = async (providerId, serviceData) => {
        try {
            const newService = {
                _type: 'services',
                providerRef: {
                    _type: 'reference',
                    _ref: providerId,
                },
                ...serviceData,
            };

            const result = await client.create(newService);
            setProviders(prevProviders =>
                prevProviders.map(provider =>
                    provider._id === providerId
                        ? {
                            ...provider,
                            servicesRef: [...provider.servicesRef, result]
                        }
                        : provider
                )
            );

            setShowAddService(false);
        } catch (error) {
            console.error('Error adding service:', error);
            setError('Failed to add service.');
        }
    };

    const renderSettingsContent = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 bg-white rounded-xl p-6 shadow-sm"
        >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("profile:accountSettings")}</h2>
            <div className="text-center py-12 text-gray-500">
                {t("profile:settingsComingSoon")}
            </div>
        </motion.div>
    );

    // No Horses View
    const NoHorsesView = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4 bg-gradient-to-br bg-gray-100 rounded-2xl shadow-sm"
        >
            <div className="max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <FaHorse className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t("profile:noHorsesYet")}</h3>
                <p className="text-gray-500">{t("profile:addYourFirstHorse")}</p>
                <button
                    onClick={() => setShowHorseForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#333] to-[#000] text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="w-5 h-5" />
                    {t("profile:addHorse")}
                </button>
            </div>
        </motion.div>
    );

    const handleHorseDeletion = async (horseId, client) => {
        try {
            // Check for any reservations (regardless of status)
            const reservations = await client.fetch(`
                *[_type == "horseReservation" && horse._ref == $horseId]{
                    _id,
                    status
                }
            `, { horseId });

            if (reservations.length > 0) {
                throw new Error('Cannot delete horse with existing reservations');
            }

            // Delete all horse ratings associated with this horse
            await client.fetch(`
                *[_type == "horseRating" && horse._ref == $horseId]{_id}
            `, { horseId })
                .then(ratings => {
                    return Promise.all(ratings.map(rating =>
                        client.delete(rating._id)
                    ));
                });

            // Remove horse reference from user's horses array
            await client.fetch(`
                *[_type == "user" && references($horseId)]{_id}
            `, { horseId })
                .then(users => {
                    return Promise.all(users.map(user =>
                        client.patch(user._id)
                            .unset([`horses[_ref == "${horseId}"]`])
                            .commit()
                    ));
                });

            // Delete the horse document
            await client.delete(horseId);

            return {
                success: true,
                message: 'Horse deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to delete horse',
                error: error.message
            };
        }
    };

    const PremiumProviderServices = () => {
        if (!providers.length && user?.userType === 'provider') {
            return <NoProvidersView />;
        }

        return (
            <div className="space-y-8">
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowCreateProvider(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-black to-[#333] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Plus className="w-5 h-5" />
                        {t("profile:newProvider")}
                    </button>
                </div>

                <div className="space-y-12">
                    {providers.map(provider => (
                        <ProviderCard key={provider._id} provider={provider} />
                    ))}
                </div>

                <Modal
                    isOpen={showCreateProvider}
                    onClose={() => setShowCreateProvider(false)}
                    title={t("profile:createNewService")}
                >
                    <NewProviderServiceForm currentUser={{ userId, userType: user?.userType }} />
                </Modal>

                <Modal
                    isOpen={showAddService}
                    onClose={() => setShowAddService(false)}
                    title={`${t("profile:addService")} ${selectedProviderName || t("profile:featuredService")}`}
                >
                    <AddServiceForm providerId={existingProviderId} />
                </Modal>

                <Modal
                    isOpen={showJoinService}
                    onClose={() => setShowJoinService(false)}
                    title=""
                >
                    <JoinServiceForm
                        currentProviderId={existingProviderId}
                        currentUserId={userId}
                        onClose={() => setShowJoinService(false)}
                    />
                </Modal>

                <Modal
                    isOpen={showServiceForm}
                    onClose={() => setShowServiceForm(false)}
                    title={t("profile:createNewService")}
                >
                    <NewProviderServiceForm currentUser={{ userId, userType: user?.userType }} />
                </Modal>
            </div>
        );
    };

    const getBreedName = (breedValue) => {
        const breedMap = {
            "purebredArabian": "Purebred Arabian",
            "tibetanPony": "Tibetan Pony",
            "mongolianHorse": "Mongolian Horse",
            "andalusian": "Andalusian",
            "friesian": "Friesian",
            "hungarianHorse": "Hungarian Horse",
            "bulgarianHorse": "Bulgarian Horse",
            "uzbekHorse": "Uzbek Horse",
            "afghanHorse": "Afghan Horse",
            "turkishHorse": "Turkish Horse",
            "persianHorse": "Persian Horse",
            "kurdishHorse": "Kurdish Horse",
            "armenianHorse": "Armenian Horse",
            "georgianHorse": "Georgian Horse",
            "abkhazianHorse": "Abkhazian Horse",
            "altaiHorse": "Altai Horse",
            "bashkirHorse": "Bashkir Horse",
            "tatarHorse": "Tatar Horse",
            "kyrgyzHorse": "Kyrgyz Horse",
            "tajikHorse": "Tajik Horse",
            "turkmenHorse": "Turkmen Horse",
            "karakalpakUzbekHorse": "Karakalpak Uzbek Horse",
            "kazakhHorse": "Kazakh Horse",
            "donHorse": "Don Horse",
            "kubanHorse": "Kuban Horse",
            "belarusianHorse": "Belarusian Horse",
            "ukrainianHorse": "Ukrainian Horse",
            "polishHorse": "Polish Horse",
            "czechHorse": "Czech Horse",
            "slovakHorse": "Slovak Horse",
            "hungarianHorse2": "Hungarian Horse",
            "romanianHorse": "Romanian Horse",
            "shaggyBulgarianHorse": "Shaggy Bulgarian Horse",
            "greekHorse": "Greek Horse",
            "anatolianHorse": "Anatolian Horse",
            "persianBlueHorse": "Persian Blue Horse",
            "hazaragiHorse": "Hazaragi Horse",
            "pashtunHorse": "Pashtun Horse",
            "marwari": "Marwari",
            "nepalesePony": "Nepalese Pony",
            "bhutanesePony": "Bhutanese Pony",
            "thaiPony": "Thai Pony",
            "cambodianPony": "Cambodian Pony",
            "vietnamesePony": "Vietnamese Pony",
            "laotianPony": "Laotian Pony",
            "burmesePony": "Burmese Pony",
            "manchuHorse": "Manchu Horse",
            "kisoHorse": "Kiso Horse",
            "koreanHorse": "Korean Horse",
            "bayankhongorMongolianHorse": "Bayankhongor Mongolian Horse",
            "khentiiMongolianHorse": "Khentii Mongolian Horse",
            "tibetanPony2": "Tibetan Pony",
            "nepalesePony2": "Nepalese Pony",
            "bhutanesePony2": "Bhutanese Pony",
            "thaiPony2": "Thai Pony",
            "cambodianPony2": "Cambodian Pony",
            "vietnamesePony2": "Vietnamese Pony",
            "laotianPony2": "Laotian Pony",
            "burmesePony2": "Burmese Pony",
            "manchuHorse2": "Manchu Horse",
            "kisoHorse2": "Kiso Horse",
            "koreanHorse2": "Korean Horse",
            "bayankhongorMongolianHorse2": "Bayankhongor Mongolian Horse",
            "khentiiMongolianHorse2": "Khentii Mongolian Horse",
            "tibetanPony3": "Tibetan Pony",
            "nepalesePony3": "Nepalese Pony",
            "bhutanesePony3": "Bhutanese Pony",
            "thaiPony3": "Thai Pony",
            "cambodianPony3": "Cambodian Pony",
            "vietnamesePony3": "Vietnamese Pony",
            "laotianPony3": "Laotian Pony",
            "burmesePony3": "Burmese Pony",
            "manchuHorse3": "Manchu Horse",
            "kisoHorse3": "Kiso Horse",
            "koreanHorse3": "Korean Horse",
            "arabian": "Arabian",
            "spanishAndalusian": "Spanish Andalusian",
            "thoroughbred": "Thoroughbred",
            "frenchHorse": "French Horse",
            "germanHorse": "German Horse",
            "italianHorse": "Italian Horse",
            "belgianDraft": "Belgian Draft",
            "dutchHorse": "Dutch Horse",
            "danishHorse": "Danish Horse",
            "norwegianFjord": "Norwegian Fjord",
            "swedishHorse": "Swedish Horse",
            "finnhorse": "Finnhorse",
            "estonianHorse": "Estonian Horse",
            "latvianHorse": "Latvian Horse",
            "lithuanianHorse": "Lithuanian Horse",
            "konik": "Konik",
            "donHorse2": "Don Horse",
            "kubanHorse2": "Kuban Horse",
            "ukrainianHorse2": "Ukrainian Horse",
            "belarusianHorse2": "Belarusian Horse"
        };
        return breedMap[breedValue] || breedValue;
    };

    // Render Horses Content
    const renderHorsesContent = () => {
        if (isLoadingHorses || isLoadingHorseReservations) {
            return (
                <div className="flex items-center justify-center py-20 h-96">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#f5e8b2] via-[#b28a2f] to-[#8c6b23] mb-6"></div>
                        <div className="h-5 w-48 bg-gradient-to-r from-[#f5e8b2] via-[#b28a2f] to-[#8c6b23] rounded-full mb-4"></div>
                        <div className="h-4 w-36 bg-gradient-to-r from-[#f5e8b2] via-[#b28a2f] to-[#8c6b23] rounded-full"></div>
                    </div>
                </div>
            );
        }

        if (!horses.length) {
            return (
                <div className="bg-gray-50 rounded-2xl p-16 text-center shadow-lg">
                    <div className="mx-auto w-32 h-32 bg-gradient-to-br from-[#f5e8b2] via-[#b28a2f] to-[#8c6b23] rounded-full flex items-center justify-center mb-7 shadow-inner">
                        <LiaHorseHeadSolid className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">{t("profile:noHorsesYet")}</h3>
                    <p className="text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed text-lg">{t("profile:addYourFirstHorse")}</p>
                    <button
                        onClick={() => setShowHorseForm(true)}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#8c6b23] via-[#b28a2f] to-[#8c6b23] text-white rounded-xl hover:from-[#70541b] hover:via-[#8c6b23] hover:to-[#70541b] transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-medium"
                    >
                        <Plus className="w-6 h-6" />
                        {t("profile:addFirstHorse")}
                    </button>
                </div>
            );
        }

        const handleDeleteHorse = async (horseId) => {
            if (window.confirm(t("profile:confirmDeleteHorse"))) {
                try {
                    const result = await handleHorseDeletion(horseId, client);
                    if (result.success) {
                        // Update local state to remove the horse
                        setHorses(prevHorses => prevHorses.filter(horse => horse._id !== horseId));
                        setHorseReservations(prevReservations =>
                            prevReservations.filter(reservation => reservation.horse._id !== horseId)
                        );
                        toast({
                            title: t("profile:horseDeleted"),
                            description: t("profile:horseDeletedSuccess"),
                            status: "success",
                            duration: 5000,
                            isClosable: true,
                        });
                    } else {
                        setError(result.message);
                        toast({
                            title: t("profile:deleteFailed"),
                            description: result.message,
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                } catch (error) {
                    console.error('Error deleting horse:', error);
                    setError('Failed to delete horse.');
                    toast({
                        title: t("profile:deleteFailed"),
                        description: t("profile:genericError"),
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            }
        };

        // Calculate stats for summary cards
        const totalHorses = horses.length;
        const rentableHorses = horses.filter(horse => horse.listingPurpose === 'rent').length;
        const upcomingReservationsCount = horseReservations.filter(
            res => new Date(res.datetime) > new Date()
        ).length;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
            >
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#b28a2f] via-[#8c6b23] to-[#70541b] bg-clip-text text-transparent">{t("profile:yourHorses")}</h2>
                        <p className="text-gray-500 mt-1">{t("profile:managingCount", { count: horses.length })}</p>
                    </div>
                    <button
                        onClick={() => setShowHorseForm(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8c6b23] via-[#b28a2f] to-[#8c6b23] text-white rounded-xl hover:from-[#70541b] hover:via-[#8c6b23] hover:to-[#70541b] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        {t("profile:addHorse")}
                    </button>
                </div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-[#fcfc9e54] to-[#f5e8b2] rounded-2xl p-6 shadow-md border border-[#f5e8b2]">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[#8c6b23] font-semibold">{t("profile:totalHorses")}</h3>
                            <div className="bg-[#f5e8b2] p-2 rounded-lg">
                                <LiaHorseHeadSolid className="w-6 h-6 text-[#8c6b23]" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-[#4a3b12]">{totalHorses}</p>
                        <div className="mt-2 text-[#8c6b23] text-sm font-medium">
                            {t("profile:stableOverview")}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#fcfc9e54] to-[#f5e8b2] rounded-2xl p-6 shadow-md border border-[#f5e8b2]">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[#8c6b23] font-semibold">{t("profile:rentableHorses")}</h3>
                            <div className="bg-[#f5e8b2] p-2 rounded-lg">
                                <DollarSign className="w-6 h-6 text-[#8c6b23]" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-[#4a3b12]">{rentableHorses}</p>
                        <div className="mt-2 text-[#8c6b23] text-sm font-medium">
                            {(rentableHorses / totalHorses * 100).toFixed(0)}% {t("profile:ofYourCollection")}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#fcfc9e54] to-[#f5e8b2] rounded-2xl p-6 shadow-md border border-[#f5e8b2]">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[#8c6b23] font-semibold">{t("profile:upcomingBookings")}</h3>
                            <div className="bg-[#f5e8b2] p-2 rounded-lg">
                                <Calendar className="w-6 h-6 text-[#8c6b23]" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-[#4a3b12]">{upcomingReservationsCount}</p>
                        <div className="mt-2 text-[#8c6b23] text-sm font-medium">
                            {t("profile:nextSevenDays")}
                        </div>
                    </div>
                </div>

                {/* Horse Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {horses.map((horse, index) => {
                        const horseReservationsForThisHorse = horseReservations.filter(
                            reservation => reservation.horse._id === horse._id && horse.listingPurpose === 'rent'
                        );

                        // Calculate upcoming reservations
                        const now = new Date();
                        const upcomingReservations = horseReservationsForThisHorse.filter(
                            res => new Date(res.datetime) > now
                        ).sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

                        return (
                            <motion.div
                                key={horse._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl shadow-xl p-6 flex flex-col relative overflow-hidden border border-gray-100"
                                whileHover={{
                                    y: -8,
                                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
                                    borderColor: "rgba(178, 138, 47, 0.4)"
                                }}
                            >
                                {/* Status ribbon */}
                                {horse.listingPurpose === 'rent' && (
                                    <div className="absolute -right-12 top-7 bg-gradient-to-r from-[#b28a2f] via-[#8c6b23] to-[#70541b] text-white px-12 py-1.5 transform rotate-45 shadow-lg font-medium text-sm">
                                        {t("profile:forRent")}
                                    </div>
                                )}

                                {/* Horse Image and Info */}
                                <div
                                    onClick={() => router.push(`horses/${horse._id}`)}
                                    className="cursor-pointer w-full group"
                                >
                                    <div className="relative mb-7">
                                        <div className="relative mx-auto w-44 h-44">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#f5e8b2] via-[#b28a2f] to-[#8c6b23] opacity-20 rounded-full transform scale-105"></div>
                                            <Image
                                                src={horse?.images?.[0] ? urlFor(horse.images[0]).url() : userFallbackImage}
                                                alt={horse.fullName}
                                                className="w-full h-full rounded-full object-cover mx-auto border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500"
                                                width={176}
                                                height={176}
                                            />
                                            <motion.div
                                                className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow-lg"
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                <span className="bg-gradient-to-r from-[#8c6b23] via-[#b28a2f] to-[#8c6b23] text-white text-xs rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                                                    {horse?.images?.length || 0}
                                                </span>
                                            </motion.div>
                                        </div>
                                    </div>

                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-[#8c6b23] group-hover:via-[#b28a2f] group-hover:to-[#8c6b23] group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                                            {horse.fullName}
                                        </h3>
                                        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-2">
                                            <MapPin className="w-4 h-4 text-[#b28a2f]" />
                                            <span>{getBreedName(horse.breed)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gradient-to-br from-gray-50 to-[#fcfc9e54] p-4 rounded-xl shadow-sm border border-[#f5e8b2]">
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{t("profile:listingPurpose")}</p>
                                            <p className="text-sm font-semibold text-gray-800 capitalize mt-1">
                                                {horse.listingPurpose === 'rent' ? (
                                                    <span className="flex items-center text-[#8c6b23]">
                                                        <DollarSign className="w-3.5 h-3.5 mr-1" />
                                                        {horse.listingPurpose}
                                                    </span>
                                                ) : horse.listingPurpose}
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-br from-gray-50 to-[#fcfc9e54] p-4 rounded-xl shadow-sm border border-[#f5e8b2]">
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{t("profile:age")}</p>
                                            <p className="text-sm font-semibold text-gray-800 mt-1">
                                                {new Date().getFullYear() - new Date(horse.birthDate).getFullYear()} {t("profile:years")}
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-br from-gray-50 to-[#fcfc9e54] p-4 rounded-xl shadow-sm border border-[#f5e8b2]">
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{t("profile:gender")}</p>
                                            <p className="text-sm font-semibold text-gray-800 capitalize mt-1">
                                                {horse.gender === 'male' ? (
                                                    <span className="flex items-center text-[#8c6b23]">
                                                        <span className="w-3.5 h-3.5 mr-1 text-[#8c6b23]">♂</span>
                                                        {horse.gender}
                                                    </span>
                                                ) : horse.gender === 'female' ? (
                                                    <span className="flex items-center text-rose-700">
                                                        <span className="w-3.5 h-3.5 mr-1 text-rose-600">♀</span>
                                                        {horse.gender}
                                                    </span>
                                                ) : horse.gender || "-"}
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-br from-gray-50 to-[#fcfc9e54] p-4 rounded-xl shadow-sm border border-[#f5e8b2]">
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{t("profile:color")}</p>
                                            <div className="flex items-center mt-1">
                                                <div
                                                    className="w-3 h-3 rounded-full mr-2"
                                                    style={{ backgroundColor: getColorHex(horse.mainColor) }}
                                                ></div>
                                                <p className="text-sm font-semibold text-gray-800 capitalize">
                                                    {horse.mainColor || "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider with gradient */}
                                <div className="h-px bg-gradient-to-r from-transparent via-[#f5e8b2] to-transparent my-4"></div>

                                {/* Reservations for Rentable Horses */}
                                {horse.listingPurpose === 'rent' && (
                                    <div className="mt-3 w-full">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4 text-[#b28a2f]" />
                                            {t("profile:upcomingReservations")}
                                        </h4>
                                        {upcomingReservations.length > 0 ? (
                                            <div className="space-y-3 max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#b28a2f] scrollbar-track-gray-100 custom-scrollbar">
                                                {upcomingReservations.slice(0, 3).map(reservation => {
                                                    const isToday = new Date(reservation.datetime).toDateString() === new Date().toDateString();

                                                    return (
                                                        <motion.div
                                                            key={reservation._id}
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className={`p-4 rounded-xl border shadow-sm ${getStatusStyles(reservation.status)}`}
                                                            whileHover={{
                                                                scale: 1.03,
                                                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                                                            }}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-3">
                                                                    {getStatusIcon(reservation.status)}
                                                                    <div className="flex flex-col">
                                                                        <div className="flex items-center">
                                                                            <span className="text-sm font-semibold">
                                                                                {isToday ? 'Today' : new Date(reservation.datetime).toLocaleDateString(undefined,
                                                                                    { weekday: 'short', month: 'short', day: 'numeric' })}
                                                                            </span>
                                                                            {isToday && (
                                                                                <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                                                                    Today
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-xs text-gray-500 flex items-center">
                                                                            <Clock className="w-3 h-3 inline mr-1" />
                                                                            {new Date(reservation.datetime).toLocaleTimeString([],
                                                                                { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col items-end">
                                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusBadgeColor(reservation.status)}`}>
                                                                        {reservation.status}
                                                                    </span>
                                                                    {reservation.renter && (
                                                                        <div className="flex items-center text-xs text-gray-500 mt-1.5">
                                                                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#b28a2f] to-[#8c6b23] mr-1.5 flex items-center justify-center text-white uppercase font-bold text-[10px]">
                                                                                {reservation.renter.name.charAt(0)}
                                                                            </div>
                                                                            {reservation.renter.name}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                })}
                                                {upcomingReservations.length > 3 && (
                                                    <button className="w-full text-center py-2 text-sm text-[#8c6b23] hover:text-[#70541b] font-medium bg-[#fcfc9e54] rounded-xl hover:bg-[#f5e8b2] transition-colors">
                                                        +{upcomingReservations.length - 3} {t("profile:moreReservations")}
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-[#fcfc9e54] rounded-xl border border-[#f5e8b2]">
                                                <Calendar className="w-12 h-12 text-[#b28a2f] mx-auto mb-3 opacity-60" />
                                                <p className="text-gray-600 font-medium mb-2">{t("profile:noReservations")}</p>
                                                <button className="mt-1 text-sm text-[#8c6b23] font-medium hover:text-[#70541b] bg-white py-2 px-4 rounded-lg shadow-sm border border-[#f5e8b2] hover:shadow-md transition-all inline-flex items-center">
                                                    <CalendarRange className="w-4 h-4 mr-1.5" />
                                                    {t("profile:manageAvailability")}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Horse Rating */}
                                <div className="mt-5 px-3 py-2 bg-gradient-to-r from-[#fcfc9e54] to-[#f5e8b2] rounded-lg flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Star className="w-5 h-5 text-[#b28a2f] mr-1.5" fill="#b28a2f" />
                                        <div className="text-sm font-medium text-gray-700">
                                            {horse.rating || '4.8'} <span className="text-gray-500 font-normal">({horse.reviewCount || '12'} {t("profile:reviews")})</span>
                                        </div>
                                    </div>
                                    <button className="text-xs text-[#8c6b23] hover:text-[#70541b]">
                                        {t("profile:viewAll")}
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="mt-auto pt-5 flex gap-2.5">
                                    <motion.button
                                        onClick={() => router.push(`horses/${horse._id}`)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#8c6b23] to-[#b28a2f] text-white py-3 rounded-xl hover:from-[#70541b] hover:to-[#8c6b23] transition-colors font-medium shadow-md hover:shadow-lg"
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Eye className="w-4 h-4" />
                                        {t("profile:view")}
                                    </motion.button>
                                    <motion.button
                                        onClick={() => router.push(`horses/${horse._id}/edit`)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-colors font-medium shadow-md hover:shadow-lg"
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Edit className="w-4 h-4" />
                                        {t("profile:edit")}
                                    </motion.button>
                                    <div className="group relative">
                                        <motion.button
                                            onClick={() => handleDeleteHorse(horse._id)}
                                            className="w-12 flex items-center justify-center gap-2 bg-gradient-to-r from-red-50 to-red-100 text-red-600 py-3 rounded-xl hover:from-red-100 hover:to-red-200 transition-colors font-medium shadow-md hover:shadow-lg"
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Trash className="w-5 h-5" />
                                        </motion.button>
                                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1.5 px-3 whitespace-nowrap pointer-events-none z-10">
                                            {t("profile:deleteHorse")}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Pagination with animated dots */}
                {horses.length > 6 && (
                    <div className="flex justify-center mt-8">
                        <nav className="inline-flex bg-white rounded-full px-1.5 py-1.5 shadow-lg border border-gray-100">
                            <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-[#fcfc9e54] hover:text-[#8c6b23] transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#8c6b23] to-[#b28a2f] text-white shadow-md">
                                1
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:bg-[#fcfc9e54] hover:text-[#8c6b23] transition-colors">
                                2
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:bg-[#fcfc9e54] hover:text-[#8c6b23] transition-colors">
                                3
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-[#fcfc9e54] hover:text-[#8c6b23] transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </nav>
                    </div>
                )}
            </motion.div>
        );
    };

    // Helper function for horse color hex
    const getColorHex = (color) => {
        const colorMap = {
            'brown': '#8B4513',
            'black': '#222222',
            'white': '#f8f9fa',
            'gray': '#6c757d',
            'chestnut': '#954535',
            'bay': '#8B0000',
            'palomino': '#FFD700',
            'cremello': '#FFF8DC',
            'dun': '#D2B48C',
            'buckskin': '#DEB887',
            'roan': '#B0C4DE',
            'pinto': '#8FBC8F',
            'appaloosa': '#F0E68C',
        };

        return colorMap[color?.toLowerCase()] || '#8B4513';
    };

    // Helper function to get status badge color
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Add horses to contentMap
    const contentMap = {
        profile: renderProfileContent,
        services: PremiumProviderServices,
        reservations: renderReservationsContent,
        settings: renderSettingsContent,
        horses: renderHorsesContent, // Add horses tab content
    };

    // Horse Registration Form Modal
    const renderHorseFormModal = () => (
        <Modal
            isOpen={showHorseForm}
            onClose={() => setShowHorseForm(false)}
            title={t("profile:registerNewHorse")}
        >
            <HorseRegistrationForm
                userId={userId}
                onSuccess={(newHorse) => {
                    setHorses(prevHorses => [...prevHorses, newHorse]);
                    setShowHorseForm(false);
                }}
            />
        </Modal>
    );

    return (
        <Layout>
            <div className={getDirectionClass("bg-gray-50")}>
                {/* Mobile Header - Updated for RTL */}
                {isMobile && (
                    <div className={getDirectionClass("top-0 z-50 bg-white border-b border-gray-200 px-4 py-3")}>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={`p-2 rounded-lg hover:bg-gray-100 ${isRTL ? 'order-2' : 'order-1'}`}
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div className={`flex items-center space-x-3 ${isRTL ? 'order-1' : 'order-2'}`}>
                                <Image
                                    src={user?.image ? urlFor(user.image).url() : userFallbackImage}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full"
                                    width={8}
                                    height={8}
                                />
                                <span className="font-medium">{user?.userName}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content - Updated for RTL */}
                <div className={getDirectionClass("max-w-7xl mx-auto p-4 md:p-8")}>
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className={`flex ${isMobile ? 'flex-col' : ''}`}>
                            {/* Sidebar - Updated for RTL */}
                            <div className={`
                                ${isMobile
                                    ? `fixed inset-0 z-40 transform transition-transform duration-300
                                       ${isMobileMenuOpen
                                        ? 'translate-x-0'
                                        : isRTL ? 'translate-x-full' : '-translate-x-full'}`
                                    : isTablet
                                        ? 'w-20'
                                        : 'w-64'
                                }
                                ${isRTL ? 'border-l' : 'border-r'}
                                bg-gray-100
                            `}>
                                {isMobile && (
                                    <div className="p-4 bg-white border-b">
                                        <button
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="p-2 rounded-lg hover:bg-gray-100"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                )}

                                <div className={`p-6 ${isTablet ? 'px-2' : ''}`}>
                                    <div className={`flex flex-col justify-center items-center mb-8`}>
                                        <Image
                                            src={user?.image ? urlFor(user.image).url() : userFallbackImage}
                                            alt="userProfile"
                                            width={isTablet ? 48 : 96}
                                            height={isTablet ? 48 : 96}
                                            className="rounded-full object-cover mb-4 shadow-lg border-2 border-white"
                                        />

                                        {!isTablet && (
                                            <>
                                                <h2 className="text-xl font-bold text-gray-800">{user?.userName}</h2>
                                                <p className="text-sm text-gray-600 mb-4">{user?.email}</p>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {tabs.map(tab => (
                                            <button
                                                key={tab.key}
                                                onClick={() => {
                                                    setActiveTab(tab.key);
                                                    if (isMobile) setIsMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                                                    ${isTablet ? 'justify-center px-2' : ''}
                                                    ${activeTab === tab.key
                                                        ? 'bg-black text-white'
                                                        : 'text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <tab.icon size={20} />
                                                {!isTablet && tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className={getDirectionClass(`flex-1 p-4 md:p-8 ${isMobile ? 'mt-16' : ''}`)}>
                                {contentMap[activeTab]()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {renderServiceFormModal()}
            {renderHorseFormModal()} {/* Add the horse form modal */}
        </Layout>
    );
};

export default ProfessionalProfileDashboard;
