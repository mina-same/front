"use client";

import React, { useState, useEffect } from 'react';
import Layout from "components/layout/Layout";
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, CalendarDays, BriefcaseBusiness, CheckCircle, Plus, Users, Briefcase, UserPlus, Sparkles, ShieldCheck, Zap, Calendar, Settings, Edit3, Save, Trash, Shield, User, Clock, Star, Phone, MapPin, Check, X, AlertCircle, Eye, Edit, Horse } from 'lucide-react';
import { client, urlFor } from '../../../lib/sanity';
import { useRouter } from 'next/navigation';
import NewProviderServiceForm from 'components/elements/NewProviderServiceForm';
import userFallbackImage from "../../../../public/assets/imgs/elements/user.png";
import Image from 'next/image';
import AddServiceForm from "components/elements/AddServiceForm"
import JoinServiceForm from "components/elements/JoinServiceForm"
import ServiceRequestsDashboard from "components/elements/ServiceRequestsDashboard"
import ProviderReservations from "components/elements/ProviderReservations"
import UserReservations from "components/elements/UserReservations"
import { useTranslation } from 'react-i18next';
import { FaHorse } from 'react-icons/fa';
import HorseRegistrationForm from 'components/elements/HorseRegistrationForm';

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
                    image,
                    phoneNumber,
                    userType,
                    location,
                    bio,
                    joinDate,
                    socialLinks,
                    isProfileCompleted
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
                                name="userName"
                                value={formData.userName || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:email")}</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:location")}</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("profile:bio")}</label>
                        <textarea
                            name="bio"
                            value={formData.bio || ''}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                        ></textarea>
                    </div>
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
                            <p className="text-lg font-semibold text-gray-900">{user?.userName || 'N/A'}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:email")}</h4>
                            <p className="text-lg font-semibold text-gray-900">{user?.email || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:phone")}</h4>
                            <p className="text-lg font-semibold text-gray-900">{user?.phoneNumber || 'N/A'}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">{t("profile:location")}</h4>
                            <p className="text-lg font-semibold text-gray-900">{user?.location || 'N/A'}</p>
                        </div>
                    </div>
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
                <div className="flex items-center justify-center py-12">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-gray-200 mb-4"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    </div>
                </div>
            );
        }

        if (!horses.length) {
            return (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
                    <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        {/* <Horse className="w-12 h-12 text-blue-500" /> */}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{t("profile:noHorsesYet")}</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">{t("profile:addYourFirstHorse")}</p>
                    <button
                        onClick={() => setShowHorseForm(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        {t("profile:addFirstHorse")}
                    </button>
                </div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{t("profile:yourHorses")}</h2>
                        <p className="text-gray-500 text-sm">{t("profile:managingCount", { count: horses.length })}</p>
                    </div>
                    <button
                        onClick={() => setShowHorseForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        {t("profile:addHorse")}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {horses.map((horse, index) => {
                        const horseReservationsForThisHorse = horseReservations.filter(
                            reservation => reservation.horse._id === horse._id && horse.listingPurpose === 'rent'
                        );

                        return (
                            <motion.div
                                key={horse._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl shadow-lg p-6 flex flex-col relative overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
                            >
                                {/* Status ribbon */}
                                {horse.listingPurpose === 'rent' && (
                                    <div className="absolute -right-8 top-4 bg-blue-600 text-white px-8 py-1 transform rotate-45 shadow-md">
                                        {t("profile:forRent")}
                                    </div>
                                )}

                                {/* Horse Image and Info */}
                                <div
                                    onClick={() => router.push(`horses/${horse._id}`)}
                                    className="cursor-pointer w-full group"
                                >
                                    <div className="relative mb-4">
                                        <div className="relative mx-auto w-36 h-36">
                                            <Image
                                                src={horse?.images?.[0] ? urlFor(horse.images[0]).url() : userFallbackImage}
                                                alt={horse.fullName}
                                                className="w-full h-full rounded-full object-cover mx-auto border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                                                width={144}
                                                height={144}
                                            />
                                            <span className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs rounded-full w-8 h-8 flex items-center justify-center">
                                                {horse?.images?.length || 0}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-center mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{horse.fullName}</h3>
                                        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                                            <MapPin className="w-3 h-3" />
                                            <span>{getBreedName(horse.breed)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-xs text-gray-500">{t("profile:listingPurpose")}</p>
                                            <p className="text-sm font-medium text-gray-800">{horse.listingPurpose}</p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-xs text-gray-500">{t("profile:age")}</p>
                                            <p className="text-sm font-medium text-gray-800">
                                                {new Date().getFullYear() - new Date(horse.birthDate).getFullYear()} {t("profile:years")}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-xs text-gray-500">{t("profile:gender")}</p>
                                            <p className="text-sm font-medium text-gray-800">{horse.gender || "-"}</p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-xs text-gray-500">{t("profile:color")}</p>
                                            <p className="text-sm font-medium text-gray-800">{horse.mainColor || "-"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-100 my-2"></div>

                                {/* Reservations for Rentable Horses */}
                                {horse.listingPurpose === 'rent' && (
                                    <div className="mt-2 w-full">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4 text-blue-500" />
                                            {t("profile:upcomingReservations")}
                                        </h4>
                                        {horseReservationsForThisHorse.length > 0 ? (
                                            <div className="space-y-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                                {horseReservationsForThisHorse.map(reservation => (
                                                    <motion.div
                                                        key={reservation._id}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className={`p-3 rounded-lg border ${getStatusStyles(reservation.status)}`}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                {getStatusIcon(reservation.status)}
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium">
                                                                        {new Date(reservation.datetime).toLocaleDateString()}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {new Date(reservation.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeColor(reservation.status)}`}>
                                                                    {reservation.status}
                                                                </span>
                                                                {reservation.renter && (
                                                                    <span className="text-xs text-gray-500 mt-1">
                                                                        {reservation.renter.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 bg-gray-50 rounded-lg">
                                                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-500 text-sm">{t("profile:noReservations")}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => router.push(`horses/${horse._id}`)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        {t("profile:view")}
                                    </button>
                                    <button
                                        onClick={() => router.push(`horses/${horse._id}/edit`)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        {t("profile:edit")}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        );
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
