
"use client";

import { useEffect, useState } from 'react';
import { client, urlFor } from '../../lib/sanity';
import { useRouter } from 'next/navigation';
import {
    Camera,
    Mail,
    Phone,
    User,
    MapPin,
    Briefcase,
    Calendar,
    Edit3,
    Save,
    X,
    ChevronRight,
    Plus
} from 'lucide-react';
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Layout from 'components/layout/Layout';
import ServiceForm from 'components/elements/ServiceForm';

const ProfilePage = () => {
    const router = useRouter();
    
    // User-related state
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // UI state
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showAddService, setShowAddService] = useState(false);
    
    // Data state
    const [formData, setFormData] = useState({});
    const [services, setServices] = useState([]);
    
    // Loading and error states
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingServices, setIsLoadingServices] = useState(false);
    const [error, setError] = useState(null);


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
    useEffect(() => {
        const fetchServices = async () => {
            if (!userId || !user?.userType === 'provider') return;
            
            setIsLoadingServices(true);
            try {
                const query = `*[_type == "services" && providerRef._ref == $providerId]{
                    _id,
                    name_en,
                    name_ar,
                    serviceType,
                    price,
                    image,
                    statusAdminApproved,
                    statusProviderApproved
                }`;
                
                const result = await client.fetch(query, { providerId: userId });
                console.log(result);
                setServices(result);
            } catch (error) {
                console.error('Error fetching services:', error);
                setError('Failed to load services.');
            } finally {
                setIsLoadingServices(false);
            }
        };

        if (activeTab === 'services') {
            fetchServices();
        }
    }, [userId, user?.userType, activeTab]);

    const handleServiceSubmit = async (formData) => {
        try {
            setIsLoading(true);
            
            const service = await client.create({
                _type: 'services',
                ...formData,
                providerRef: {
                    _type: 'reference',
                    _ref: userId
                }
            });

            setServices(prev => [...prev, service]);
            setShowAddService(false);
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 3000);
        } catch (err) {
            setError('Failed to create service.');
            console.error('Error creating service:', err);
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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsLoading(true);
            const asset = await client.assets.upload('image', file);
            setFormData(prev => ({
                ...prev,
                image: { asset: { _ref: asset._id, url: asset.url } }
            }));
        } catch (err) {
            setError('Failed to upload image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    const renderProfileContent = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <User className="text-gray-400" size={20} />
                        <div>
                            <p className="text-sm text-gray-500">Username</p>
                            <p className="font-medium">{user.userName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Mail className="text-gray-400" size={20} />
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="text-gray-400" size={20} />
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{user.phoneNumber || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <MapPin className="text-gray-400" size={20} />
                        <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">{user.location || 'Not provided'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar className="text-gray-400" size={20} />
                        <div>
                            <p className="text-sm text-gray-500">Joined</p>
                            <p className="font-medium">{new Date(user.joinDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-3">About</h3>
                <p className="text-gray-600 leading-relaxed">
                    {user.bio || 'No bio provided yet.'}
                </p>
            </div>
            <div className="flex justify-end">
                <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                    <Edit3 size={16} />
                    Edit Profile
                </button>
            </div>
        </div>
    );

    const renderProfileForm = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        name="userName"
                        value={formData.userName || ''}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber || ''}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location || ''}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                </label>
                <textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleChange}
                    rows="4"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
            </div>
            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                    <X size={16} />
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
                >
                    <Save size={16} />
                    Save Changes
                </button>
            </div>
        </div>
    );

    const tabContent = {
        profile: (
            <Card className="bg-white shadow-none border-0">
                <CardContent className="p-6">
                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {renderProfileForm()}
                        </form>
                    ) : (
                        renderProfileContent()
                    )}
                </CardContent>
            </Card>
        ),
        services: showAddService ? (
            <ServiceForm 
                onSubmit={handleServiceSubmit}
                onCancel={() => setShowAddService(false)}
                currentUser={{
                    providerId: userId,
                    userType: user?.userType
                }}
            />
        ) : (
            <Card className="bg-white shadow-none border-0">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900">My Services</h3>
                        <button
                            onClick={() => setShowAddService(true)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add New Service
                        </button>
                    </div>

                    {isLoadingServices ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No services added yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map(service => (
                                <Card key={service._id} className="hover:shadow-lg transition-shadow">
                                    <div className="aspect-w-16 aspect-h-9 relative">
                                        <img
                                            src={'/assets/imgs/placeholders'}
                                            alt={service.name_en}
                                            className="w-full h-48 object-cover rounded-t-lg"
                                        />
                                    </div>
                                    <CardContent className="p-4">
                                        <h4 className="font-semibold text-lg mb-2">{service.name_en}</h4>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm text-gray-500">{service.serviceType}</span>
                                            <span className="font-medium text-green-600">${service.price}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                service.statusAdminApproved 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {service.statusAdminApproved ? 'Approved' : 'Pending Approval'}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    };

    const renderServices = () => (
        <Card className="bg-white shadow-none border-0">
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">My Services</h3>
                    <button
                        onClick={() => setShowAddService(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add New Service
                    </button>
                </div>

                {isLoadingServices ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No services added yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map(service => (
                            <Card key={service._id} className="hover:shadow-lg transition-shadow">
                                <div className="aspect-w-16 aspect-h-9 relative">
                                    <img
                                        src={service.image ? urlFor(service.image).url() : '/placeholder-service.png'}
                                        alt={service.name_en}
                                        className="w-full h-48 object-cover rounded-t-lg"
                                    />
                                </div>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold text-lg mb-2">{service.name_en}</h4>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-500">{service.serviceType}</span>
                                        <span className="font-medium text-green-600">${service.price}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${service.statusAdminApproved
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {service.statusAdminApproved ? 'Approved' : 'Pending Approval'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {showSuccessAlert && (
                    <Alert className="fixed top-4 right-4 w-96 bg-green-50 border-green-200">
                        <AlertDescription className="text-green-800">
                            Profile updated successfully!
                        </AlertDescription>
                    </Alert>
                )}

                <div className="relative bg-gradient-to-r from-black to-black h-80">
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative -mt-48">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-8">
                                <div className="relative flex items-center gap-8">
                                    <div className="relative">
                                        <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100 ring-4 ring-white">
                                            <img
                                                src={user.image ? urlFor(user.image).url() : '/default-avatar.png'}
                                                alt={user.userName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {isEditing && (
                                            <label className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                                                <Camera size={16} className="text-white" />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold text-gray-900">
                                            {user.userName}
                                        </h1>
                                        <div className="flex items-center gap-4 mt-4">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-black">
                                                <User size={14} />
                                                {user.userType}
                                            </span>
                                            {user.location && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                                                    <MapPin size={14} />
                                                    {user.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t">
                                <div className="px-8">
                                    <nav className="flex space-x-8">
                                        {['Profile', user?.userType === "provider" ? 'Services' : null, 'Settings']
                                            .filter(Boolean)
                                            .map((tab) => {
                                                const tabKey = tab?.toLowerCase();
                                                const isActive = activeTab === tabKey;
                                                return (
                                                    <button
                                                        key={tab}
                                                        onClick={() => setActiveTab(tabKey)}
                                                        className={`
                                                            px-4 py-4 inline-flex items-center gap-2
                                                            border-b-2 font-medium text-sm
                                                            ${isActive
                                                                ? 'border-[#b28a2f] text-blue-500'
                                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                            }
                                                        `}
                                                    >
                                                        {tab}
                                                        <ChevronRight
                                                            size={16}
                                                            className={`transition-transform ${isActive ? 'rotate-90' : ''}`}
                                                        />
                                                    </button>
                                                );
                                            })}
                                    </nav>
                                </div>

                                <div className="p-8">
                                    {tabContent[activeTab]}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProfilePage;