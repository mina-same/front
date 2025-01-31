"use client";

import React, { useState, useEffect } from 'react';
import Layout from "components/layout/Layout";
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Briefcase, UserPlus, Calendar, Settings, Edit3, Save, Trash, Shield, User, Clock, Star, Phone, MapPin, Check, X, AlertCircle } from 'lucide-react';
import { client, urlFor } from '../../lib/sanity';
import { useRouter } from 'next/navigation';
import NewProviderServiceForm from 'components/elements/NewProviderServiceForm'; // Import your ServiceForm component
import userFallbackImage from "../../../public/assets/imgs/elements/user.png";
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AddServiceForm from "components/elements/AddServiceForm"
import JoinServiceForm from "components/elements/JoinServiceForm"

const ProfessionalProfileDashboard = () => {
    const router = useRouter();

    // User-related state
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // UI state
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // Data state
    const [services, setServices] = useState([]);
    const [reservations, setReservations] = useState([]);

    // Loading and error states
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

    // State to manage the visibility of the ServiceForm modal
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [existingProviderId, setExistingProviderId] = useState(null);
    const [selectedProviderName, setSelectedProviderName] = useState(null);

    // Modal component
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
                        <div className="p-6 border-b border-gray-100" style={{ padding: "50px 0px" }}>
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
            title="Create New Service"
        >
            <NewProviderServiceForm
                currentUser={{ user }}
            />
        </Modal>
    );

    // No Providers View
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
                <h3 className="text-2xl font-bold text-gray-900">Start Your Provider Journey</h3>
                <p className="text-gray-500">Create your first provider profile to start offering services to customers</p>
                <button
                    onClick={() => setShowServiceForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#333] to-[#000] text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="w-5 h-5" />
                    Create Your First Service
                </button>
            </div>
        </motion.div>
    );


    // Define tabs array
    const tabs = [
        { key: 'profile', icon: Users, label: 'Profile' },
        ...(user?.userType === 'provider' ? [{ key: 'services', icon: Briefcase, label: 'Services' }] : []), // Conditionally add "Services" tab
        { key: 'reservations', icon: Calendar, label: 'Reservations' },
        { key: 'settings', icon: Settings, label: 'Settings' }
    ];

    // Fetch reservations effect
    useEffect(() => {
        const fetchReservations = async () => {
            setIsLoadingReservations(true);
            try {
                const query = `*[_type == "reservation" && user._ref == $userId]{
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
                    userResponse
                }`;

                const params = { userId };
                const result = await client.fetch(query, params);

                console.log("Fetched reservations:", result);
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

    // Authentication effect
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

    // Fetch user data effect
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
                // Fetch all providers associated with the current user
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
                console.log("Fetched providers:", result);
                setProviders(result);

                // Enhanced reservation query with more details
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
                console.log("Provider IDs for reservation query:", providerIds);

                const reservations = await client.fetch(reservationsQuery, { providerIds });
                console.log("Fetched pending reservations:", reservations);
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


    // Handle profile form submission
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

    const ProviderCard = ({ provider }) => {
        // Filter reservations for this specific provider
        const providerReservations = pendingReservations.filter(
            res => res.provider?._id === provider._id
        );

        console.log(`Reservations for provider ${provider._id}:`, providerReservations);

        const mainService = provider.mainServiceRef; // Now using mainServiceRef
        const additionalServices = provider.servicesRef || []; // Now using servicesRef

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Hero Section */}
                <div className="relative h-72 overflow-hidden">
                    {mainService && (
                        <>
                            <motion.div
                                className="absolute inset-0"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.6 }}
                            >
                                <img
                                    src={mainService.image ? urlFor(mainService.image).url() : '/placeholder-service.png'}
                                    alt={mainService.name_en}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            </motion.div>

                            {/* Premium Badge */}
                            <div className="absolute top-4 right-4 px-4 py-1 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-full text-white text-sm font-semibold shadow-lg">
                                Premium Provider
                            </div>

                            {/* Provider Info Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                <div className="flex items-center gap-4 mb-4">
                                    <Image
                                        src={user?.image ? urlFor(user.image).url() : userFallbackImage}
                                        alt={"providerIamge"}
                                        className="w-16 h-16 rounded-full ring-4 ring-white/30"
                                        onError={(e) => {
                                            e.target.src = userFallbackImage;
                                        }}
                                    />
                                    <div>
                                        <h2 className="text-3xl font-bold">{provider.name_en}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="text-sm">4.9 (128 reviews)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Main Content */}
                <div className="p-8">
                    {/* Featured Service */}
                    {mainService && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-gray-900">Featured Service</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-black">${mainService.price}</span>
                                    <span className="text-sm text-gray-500">/ session</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3 mb-4">
                                <span className="px-3 py-1 bg-blue-50 text-blue-500 rounded-full text-sm font-medium">
                                    {mainService.serviceType}
                                </span>
                                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                                    <Users className="w-4 h-4 inline-block mr-1" />
                                    Available Now
                                </span>
                                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">
                                    <Briefcase className="w-4 h-4 inline-block mr-1" />
                                    Professional
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Additional Services Carousel */}
                    {additionalServices.length > 0 && (
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-gray-700 mb-4">Additional Services</h4>
                            <div className="flex h-full gap-4 overflow-x-auto pb-10 scrollbar-hide">
                                {additionalServices.map((service) => (
                                    <motion.div
                                        key={service._id}
                                        whileHover={{ scale: 1.05 }}
                                        className="relative flex-shrink-0 group cursor-pointer"
                                        onClick={() => setSelectedService(service)}
                                    >
                                        <div className="w-20 h-20 rounded-xl overflow-hidden ring-2 ring-white shadow-lg">
                                            <img
                                                src={service.image ? urlFor(service.image).url() : '/placeholder-service.png'}
                                                alt={service.name_en}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200">
                                            {service.name_en}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pending Reservations Section */}
                    {providerReservations.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                Pending Reservations ({providerReservations.length})
                            </h4>

                            <div className="space-y-3">
                                {providerReservations.map(reservation => (
                                    <motion.div
                                        key={reservation._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img
                                                        src={reservation.user?.image ? urlFor(reservation.user.image).url() : '/placeholder-user.png'}
                                                        alt={reservation.user?.userName}
                                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{reservation.user?.userName}</h5>
                                                    <p className="text-sm text-gray-500">
                                                        {reservation.service?.name_en}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {new Date(reservation.datetime).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {new Date(reservation.datetime).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleReservationResponse(reservation._id, 'approved')}
                                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                                                >
                                                    Accept
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleReservationResponse(reservation._id, 'rejected')}
                                                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                                                >
                                                    Decline
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setSelectedProvider(provider._id);
                                setExistingProviderId(provider._id); // Set the provider ID
                                setSelectedProviderName(provider.name_en); // Set the provider name
                                setShowAddService(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-blue-500 text-blue-500 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Plus className="w-5 h-5" />
                            Add New Service
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setShowJoinService(true)
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#b28a2f] to-[#b28a2f] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <UserPlus className="w-5 h-5" />
                            Join Service
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        );
    };

    // Render profile content (edit or view mode)
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="userName"
                                value={formData.userName || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
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
                            <X size={20} /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-[#333] transition-all"
                        >
                            <Save size={20} /> Save Changes
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
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Full Name</h4>
                            <p className="text-lg font-semibold text-gray-900">{user?.userName || 'N/A'}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Email</h4>
                            <p className="text-lg font-semibold text-gray-900">{user?.email || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Phone</h4>
                            <p className="text-lg font-semibold text-gray-900">{user?.phoneNumber || 'N/A'}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Location</h4>
                            <p className="text-lg font-semibold text-gray-900">{user?.location || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="border-t pt-6 mt-6">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-[#333] transition-all"
                        >
                            <Edit3 size={20} /> Edit Profile
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
            await client
                .patch(reservationId)
                .set({ status })
                .commit();

            // Update the pending reservations list
            setPendingReservations(prev =>
                prev.filter(res => res._id !== reservationId)
            );
        } catch (error) {
            console.error('Error updating reservation:', error);
            setError('Failed to update reservation status.');
        }
    };

    // Render reservations content
    const renderReservationsContent = () => (
        <div className="max-w-7xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
                    <div className="flex gap-2">
                        {/* Filter by Status */}
                        <select className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#b28a2f] focus-visible:border-[#b28a2f] focus-visible:outline-none">
                            <option>All Statuses</option>
                            <option>Approved</option>
                            <option>Pending</option>
                            <option>Rejected</option>
                        </select>
                        {/* Filter by Date Range */}
                        <select className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#b28a2f] focus-visible:border-[#b28a2f] focus-visible:outline-none">
                            <option>This Month</option>
                            <option>Last Month</option>
                            <option>Last 3 Months</option>
                        </select>
                    </div>
                </div>

                {/* No Reservations Found */}
                {reservations.length === 0 ? (
                    <div className="text-center py-32 bg-gray-50 rounded-xl">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="space-y-4"
                        >
                            <Calendar className="w-16 h-16 text-gray-400 mx-auto" />
                            <h3 className="text-xl font-semibold text-gray-700">No Reservations Found</h3>
                            <p className="text-gray-500">You haven't made any reservations yet.</p>
                        </motion.div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {reservations.map((reservation) => (
                            <motion.div
                                key={reservation._id} // Use reservation._id as the key
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="overflow-hidden border-0 shadow-lg">
                                    <CardContent className="p-0">
                                        <div className="flex">
                                            {/* Service Image Section (Fixed Width) */}
                                            <div className="w-1/3 relative">
                                                <img
                                                    src={reservation.provider?.mainServiceRef?.image ? urlFor(reservation.provider.mainServiceRef.image).url() : '/placeholder-service.png'}
                                                    alt={reservation.provider?.mainServiceRef?.name_en || 'Service Image'}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                                                <div className="absolute bottom-4 left-4 text-white">
                                                    <h3 className="text-lg font-bold">{reservation.provider?.name_en || 'N/A'}</h3>
                                                    <p className="text-sm opacity-90">{reservation.provider?.servicesRef?.[0]?.name_en || 'N/A'}</p>
                                                </div>
                                            </div>

                                            {/* Details Section (Remaining Width) */}
                                            <div className="w-2/3 p-6 bg-white">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={reservation.provider?.userRef?.image ? urlFor(reservation.provider.userRef.image).url() : '/placeholder-avatar.png'}
                                                            alt={reservation.provider?.userRef?.userName || 'Provider Image'}
                                                            className="w-10 h-10 rounded-full ring-2 ring-white shadow-md"
                                                        />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {reservation.provider?.userRef?.userName || 'N/A'}
                                                            </p>
                                                            <p className="text-sm text-gray-500">{reservation.provider?.servicesRef?.[0]?.name_en || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border ${getStatusStyles(reservation.status)}`}>
                                                        {getStatusIcon(reservation.status)}
                                                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                                    </span>
                                                </div>

                                                {/* Reservation Details */}
                                                <div className="grid grid-cols-2 gap-4 mt-6">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="text-sm">
                                                            {new Date(reservation.datetime).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="text-sm">
                                                            {new Date(reservation.datetime).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Phone className="w-4 h-4" />
                                                        <span className="text-sm">{reservation.provider?.phoneNumber || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <MapPin className="w-4 h-4" />
                                                        <span className="text-sm">{reservation.provider?.location || 'N/A'}</span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="mt-6 flex justify-end gap-3">
                                                    <button className="px-4 py-2 bg-blue-50 text-blue-500 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                                                        Reschedule
                                                    </button>
                                                    <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
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

            // Update the providers state with the new service
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

    // Render settings content
    const renderSettingsContent = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 bg-white rounded-xl p-6 shadow-sm"
        >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
            <div className="text-center py-12 text-gray-500">
                Settings coming soon
            </div>
        </motion.div>
    );

    const PremiumProviderServices = () => {
        if (!providers.length && user?.userType === 'provider') {
            return <NoProvidersView />;
        }

        return (
            <div className="space-y-8">
                {/* Provider Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowCreateProvider(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-black to-[#333] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Plus className="w-5 h-5" />
                        New Provider
                    </button>
                </div>

                {/* Existing Providers */}
                <div className="space-y-12">
                    {providers.map(provider => (
                        <ProviderCard key={provider._id} provider={provider} />
                    ))}
                </div>

                {/* Modals */}
                <Modal
                    isOpen={showCreateProvider}
                    onClose={() => setShowCreateProvider(false)}
                    title="Create New Provider"
                >
                    {/* Your provider creation form will go here */}
                    <NewProviderServiceForm currentUser={{ userId, userType: user?.userType }} />
                </Modal>

                <Modal
                    isOpen={showAddService}
                    onClose={() => setShowAddService(false)}
                    title={`Add New Service to ${selectedProviderName || "Main Service"}`} // Dynamic title
                >
                    <AddServiceForm providerId={existingProviderId} />
                </Modal>

                <Modal
                    isOpen={showJoinService}
                    onClose={() => setShowJoinService(false)}
                    title=""
                >
                    <JoinServiceForm
                        currentUserId={userId}
                        onClose={() => setShowJoinService(false)}
                    />
                </Modal>

                {/* Service Form Modal */}
                <Modal
                    isOpen={showServiceForm}
                    onClose={() => setShowServiceForm(false)}
                    title="Create New Service"
                >
                    <NewProviderServiceForm currentUser={{ userId, userType: user?.userType }} />
                </Modal>
            </div>
        );
    };

    // Tab content mapping
    const contentMap = {
        profile: renderProfileContent,
        services: PremiumProviderServices,
        reservations: renderReservationsContent,
        settings: renderSettingsContent
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="flex">
                            <div className="w-64 bg-gray-100 border-r">
                                <div className="p-6">
                                    <div className="flex flex-col items-center mb-8">
                                        {/* User Avatar */}
                                        <Image
                                            src={user?.image ? urlFor(user.image).url() : userFallbackImage}
                                            alt="userProfile"
                                            width={96} // Set appropriate width
                                            height={96} // Set appropriate height
                                            className="rounded-full object-cover mb-4 shadow-lg border-2 border-white"
                                            onError={(e) => {
                                                e.target.src = userFallbackImage;
                                            }}
                                        />

                                        {/* User Name */}
                                        <h2 className="text-xl font-bold text-gray-800">{user?.userName}</h2>

                                        {/* User Email */}
                                        <p className="text-sm text-gray-600 mb-4">{user?.email}</p>

                                        {/* Conditional Rendering for User Type */}
                                        {user?.userType === "provider" ? (
                                            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
                                                <Shield className="w-5 h-5 text-black" /> {/* Provider Icon */}
                                                <span className="text-sm font-medium text-black">Provider</span>
                                            </div>
                                        ) : user?.userType === "normal" ? (
                                            <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
                                                <User className="w-5 h-5 text-black" /> {/* User Icon */}
                                                <span className="text-sm font-medium text-black">Customer</span>
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className="space-y-2">
                                        {tabs.map(tab => (
                                            <button
                                                key={tab.key}
                                                onClick={() => setActiveTab(tab.key)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.key
                                                    ? 'bg-black text-white'
                                                    : 'text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <tab.icon size={20} />
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 p-8">
                                {contentMap[activeTab]()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Render the ServiceForm modal at the root level */}
            {renderServiceFormModal()}
        </Layout>
    );
};

export default ProfessionalProfileDashboard;
