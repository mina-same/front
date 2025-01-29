"use client";

import React, { useState, useEffect } from 'react';
import Layout from "components/layout/Layout";
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Briefcase, Calendar, Settings, Edit3, Save, Trash, Shield, User, Clock, Phone, MapPin, Check, X, AlertCircle } from 'lucide-react';

import { client, urlFor } from '../../lib/sanity';
import { useRouter } from 'next/navigation';
import ServiceForm from 'components/elements/ServiceForm'; // Import your ServiceForm component
import userFallbackImage from "../../../public/assets/imgs/elements/user.png";
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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
    const [showAddService, setShowAddService] = useState(false);

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

    // Fetch services effect
    // useEffect(() => {
    //     const fetchServices = async () => {
    //         if (!userId || user?.userType !== 'provider') return;

    //         setIsLoadingServices(true);
    //         try {
    //             const providerQuery = `*[_type == "provider" && userRef._ref == $userId][0]{_id}`;
    //             const provider = await client.fetch(providerQuery, { userId });

    //             if (!provider?._id) {
    //                 console.log('No provider found for this user.');
    //                 setServices([]);
    //                 return;
    //             }

    //             const servicesQuery = `*[_type == "services" && providerRef._ref == $providerId]{
    //                 _id,
    //                 name_en,
    //                 name_ar,
    //                 serviceType,
    //                 price,
    //                 image,
    //                 statusAdminApproved,
    //                 statusProviderApproved
    //             }`;
    //             const result = await client.fetch(servicesQuery, { providerId: provider._id });

    //             console.log("Fetched services:", result);
    //             setServices(result);
    //         } catch (error) {
    //             console.error('Error fetching services:', error);
    //             setError('Failed to load services.');
    //         } finally {
    //             setIsLoadingServices(false);
    //         }
    //     };

    //     if (activeTab === 'services') {
    //         fetchServices();
    //     }
    // }, [userId, user?.userType, activeTab]);


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

                // Fetch pending reservations for the provider
                const reservationsQuery = `*[_type == "reservation" && provider._ref in $providerIds && status == "pending"]{
                _id,
                user->{
                    userName,
                    image
                },
                datetime,
                service->{
                    name_en,
                    name_ar
                }
            }`;
                const providerIds = result.map(p => p._id);
                const reservations = await client.fetch(reservationsQuery, { providerIds });
                setPendingReservations(reservations);

            } catch (error) {
                console.error('Error fetching providers:', error);
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
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-500 transition-all"
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
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-500 transition-all"
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
                                                    src={reservation.provider?.servicesRef?.[0]?.image ? urlFor(reservation.provider.servicesRef[0].image).url() : '/placeholder-service.png'}
                                                    alt={reservation.provider?.servicesRef?.[0]?.name_en || 'Service Image'}
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

    const renderServicesContent = () => {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 bg-white rounded-xl p-6 shadow-sm"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">My Services</h2>
                    <div className="flex gap-2">
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                            onClick={() => setShowJoinRequest(true)}
                        >
                            <Plus size={20} /> Join Provider
                        </button>
                    </div>
                </div>

                {/* Pending Reservations Section */}
                {pendingReservations.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4">Pending Reservations</h3>
                        <div className="grid gap-4">
                            {pendingReservations.map(reservation => (
                                <Card key={reservation._id} className="p-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={reservation.user?.image ? urlFor(reservation.user.image).url() : '/placeholder-user.png'}
                                                alt={reservation.user?.userName}
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div>
                                                <p className="font-medium">{reservation.user?.userName}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(reservation.datetime).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleReservationResponse(reservation._id, 'approved')}
                                                className="px-4 py-2 bg-green-500 text-white rounded-lg"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleReservationResponse(reservation._id, 'rejected')}
                                                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Providers and Services Section */}
                <div className="grid gap-6">
                    {providers.map(provider => (
                        <Card key={provider._id} className="overflow-hidden">
                            <CardHeader className="flex flex-row justify-between items-center">
                                <CardTitle>{provider.name_en}</CardTitle>
                                <button
                                    onClick={() => {
                                        setSelectedProvider(provider._id);
                                        setShowAddService(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                                >
                                    <Plus size={20} /> Add Service
                                </button>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {provider.servicesRef?.map(service => (
                                        <motion.div
                                            key={service._id}
                                            whileHover={{ scale: 1.05 }}
                                            className="bg-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                                        >
                                            <img
                                                src={service.image ? urlFor(service.image).url() : '/placeholder-service.png'}
                                                alt={service.name_en}
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="p-5">
                                                <h3 className="text-xl font-bold mb-2">{service.name_en}</h3>
                                                <p className="text-sm text-gray-600 mb-2">Type: {service.serviceType}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">${service.price}</span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${service.statusAdminApproved
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {service.statusAdminApproved ? 'Approved' : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Add Service Form Modal */}
                {showAddService && (
                    <ServiceForm
                        onSubmit={(serviceData) => handleAddService(selectedProvider, serviceData)}
                        onCancel={() => setShowAddService(false)}
                    />
                )}

                {/* Join Provider Request Modal */}
                {showJoinRequest && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-xl max-w-md w-full">
                            <h3 className="text-xl font-bold mb-4">Join as Service Provider</h3>
                            <p className="text-gray-600 mb-4">
                                Submit a request to join as a service provider. Our team will review your request.
                            </p>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowJoinRequest(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleJoinRequest(selectedProvider)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        );
    };


    // Tab content mapping
    const contentMap = {
        profile: renderProfileContent,
        services: renderServicesContent,
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
                                                    ? 'bg-blue-500 text-white'
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
        </Layout>
    );
};

export default ProfessionalProfileDashboard;
