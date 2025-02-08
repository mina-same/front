// app/[serviceId]/page.jsx
'use client'; // Mark this as a Client Component

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Import useParams
import { MapPin, Phone, Mail, Link as LinkIcon, Calendar, Clock, Award, Users, Heart, Share2 } from 'lucide-react';
import { client, urlFor } from '../../../lib/sanity'; // Import urlFor
import Layout from 'components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Preloader from 'components/elements/Preloader';
import ReservationPopup from 'components/elements/ReservationPopup';  // Adjust import path as needed

export default function ServiceDetailsPage() {
    const params = useParams(); // Get dynamic route parameters
    const { serviceId } = params; // Extract serviceId from params

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

    // Fetch service data from Sanity
    useEffect(() => {
        if (!serviceId) return; // Wait until serviceId is available

        const fetchService = async () => {
            try {
                const query = `*[_type == "services" && _id == $serviceId][0]{
          ...,
          city->{name_en},
          country->{name_en},
          government->{name_en},
          providerRef->{name_en},
          graduationDetails {
            graduationCertificate,
            previousExperience
          },
          competitions {
            level,
            heightDistance,
            organiserName,
            mainReferee,
            coReferee1,
            coReferee2,
            raceType,
            prize,
            sponsor,
            sponsorLogo,
            sponsorshipValue
          },
          housingDetails {
            housingDetails
          },
          horseTrainerDetails {
            trainerLevel,
            accreditationCertificate
          },
          hoofTrimmerDetails {
            hoofTrimmerDetails
          },
          transportDetails {
            numberOfHorses,
            vehicleType
          },
          contractorDetails,
          supplierDetails,
          cateringOptions,
          tripCoordinator {
            locationOfHorses,
            locationOfTent,
            startDate,
            endDate,
            breakTimes,
            meals[] {
              mealType,
              mealDescription
            },
            containsAidBag,
            activities,
            priceForFamilyOf2,
            priceForFamilyOf3,
            priceForFamilyOf4,
            tripProgram,
            levelOfHardship,
            conditionsAndRequirements,
            safetyAndEquipment,
            cancellationAndRefundPolicy,
            moreDetails
          },
          statusAdminApproved,
          statusProviderApproved
        }`;
                const params = { serviceId };
                const fetchedService = await client.fetch(query, params);
                setService(fetchedService);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [serviceId]); // Re-fetch when serviceId changes

    // Loading and error states
    if (loading) return <Preloader/>;
    if (error) return <div>Error: {error.message}</div>;
    if (!service) return <div>Service not found</div>;

    // Common section for all service types
    const CommonInfo = () => (
        <div className="mb-8">
            <div className="relative h-[600px] w-full mb-12 rounded-2xl overflow-hidden group">
                <img
                    src={service.image ? urlFor(service.image).url() : "/api/placeholder/1600/900"}
                    alt={service.name_en}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 p-8 text-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                            <div className="space-y-4">
                                <Badge className="bg-blue-500/80 text-white hover:bg-blue-600/80 backdrop-blur-sm">
                                    Featured Service
                                </Badge>

                                <h1 className="text-5xl font-bold text-white tracking-tight">
                                    {service.name_en}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 text-white/90">
                                    <span className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        <span className="text-lg">
                                            {service.city?.name_en}, {service.country?.name_en}
                                        </span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        <span>Available 24/7</span>
                                    </span>

                                </div>

                                <span className="flex text-3xl font-bold gap-6">
                                    {service.price} SAR
                                </span>
                            </div>

                            <div className="flex justify-start gap-4">
                                <Button
                                    onClick={() => setIsReservationModalOpen(true)}
                                    size="lg"
                                    className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
                                >
                                    <Calendar className="w-5 h-5" />
                                    Book Now
                                </Button>
                                <Button
                                    onClick={() => setIsLiked(!isLiked)}
                                    variant="outline"
                                    size="lg"
                                    className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20"
                                >
                                    <Heart
                                        className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`}
                                    />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20"
                                >
                                    <Share2 className="w-5 h-5 text-white" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {service.servicePhone && (
                    <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-primary" />
                        <a href={`tel:${service.servicePhone}`} className="hover:underline">
                            {service.servicePhone}
                        </a>
                    </div>
                )}
                {service.serviceEmail && (
                    <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-primary" />
                        <a href={`mailto:${service.serviceEmail}`} className="hover:underline">
                            {service.serviceEmail}
                        </a>
                    </div>
                )}
                {service.links?.length > 0 && (
                    <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                        <LinkIcon className="w-5 h-5 text-primary" />
                        <a href={service.links[0]} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {service.links.length} Links
                        </a>
                    </div>
                )}
            </div>

            <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="h-32 text-gray-700 flex items-center gap-2 p-4 bg-gray-50 rounded-lg">{service.about_en}</p>
            </div>

            <ReservationPopup
                isOpen={isReservationModalOpen}
                onClose={() => setIsReservationModalOpen(false)}
                serviceId={serviceId}
                serviceName={service.name_en}
                providerRef={service.providerRef?._id}
            />
        </div>
    );

    // Specific sections for each service type
    const ServiceTypeContent = () => {
        switch (service.serviceType) {
            case 'horse_stable':
                return (
                    <div className="bg-white rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">Stable Location</h3>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-primary mt-1" />
                            <p className="text-gray-700">{service.location}</p>
                        </div>
                    </div>
                );

            case 'veterinary':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">Veterinary Qualifications</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-2">
                                <Award className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-medium">Graduation Certificate</p>
                                    <p className="text-gray-700">{service.graduationDetails?.graduationCertificate}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Users className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-medium">Previous Experience</p>
                                    <p className="text-gray-700">{service.graduationDetails?.previousExperience}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'competitions':
                return (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-4">Competition Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="font-medium">Level</p>
                                            <p className="text-gray-700">{service.competitions?.level}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium">Height-Distance</p>
                                        <p className="text-gray-700">{service.competitions?.heightDistance}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Race Type</p>
                                        <p className="text-gray-700">{service.competitions?.raceType}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="font-medium">Prize</p>
                                        <p className="text-gray-700">{service.competitions?.prize}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Sponsor</p>
                                        <p className="text-gray-700">{service.competitions?.sponsor}</p>
                                    </div>
                                    {service.competitions?.sponsorLogo && (
                                        <img
                                            src={service.competitions.sponsorLogo}
                                            alt="Sponsor Logo"
                                            className="h-16 object-contain"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-4">Referees</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="font-medium">Main Referee</p>
                                    <p className="text-gray-700">{service.competitions?.mainReferee}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Co-Referee 1</p>
                                    <p className="text-gray-700">{service.competitions?.coReferee1}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Co-Referee 2</p>
                                    <p className="text-gray-700">{service.competitions?.coReferee2}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'trip_coordinator':
                return (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-4">Trip Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="font-medium">Duration</p>
                                            <p className="text-gray-700">
                                                {new Date(service.tripCoordinator?.startDate).toLocaleDateString()} -
                                                {new Date(service.tripCoordinator?.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="font-medium">Break Times</p>
                                            <p className="text-gray-700">{service.tripCoordinator?.breakTimes}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="font-medium">Level of Hardship</p>
                                        <p className="text-gray-700">{service.tripCoordinator?.levelOfHardship}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Aid Bag</p>
                                        <p className="text-gray-700">
                                            {service.tripCoordinator?.containsAidBag ? "Available" : "Not Available"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-4">Pricing</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg text-center">
                                    <p className="font-medium">Family of 2</p>
                                    <p className="text-xl font-bold text-primary">
                                        {service.tripCoordinator?.priceForFamilyOf2} SAR
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg text-center">
                                    <p className="font-medium">Family of 3</p>
                                    <p className="text-xl font-bold text-primary">
                                        {service.tripCoordinator?.priceForFamilyOf3} SAR
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg text-center">
                                    <p className="font-medium">Family of 4</p>
                                    <p className="text-xl font-bold text-primary">
                                        {service.tripCoordinator?.priceForFamilyOf4} SAR
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-4">Additional Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium">Trip Program</p>
                                    <p className="text-gray-700">{service.tripCoordinator?.tripProgram}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Safety & Equipment</p>
                                    <p className="text-gray-700">{service.tripCoordinator?.safetyAndEquipment}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Cancellation & Refund Policy</p>
                                    <p className="text-gray-700">{service.tripCoordinator?.cancellationAndRefundPolicy}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'housing':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">Housing Details</h3>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-primary mt-1" />
                            <p className="text-gray-700">{service.housingDetails?.housingDetails}</p>
                        </div>
                    </div>
                );

            case 'horse_trainer':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">Horse Trainer Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-2">
                                <Award className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-medium">Trainer Level</p>
                                    <p className="text-gray-700">{service.horseTrainerDetails?.trainerLevel}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Users className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-medium">Accreditation Certificate</p>
                                    <p className="text-gray-700">{service.horseTrainerDetails?.accreditationCertificate}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'hoof_trimmer':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">Hoof Trimmer Details</h3>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-primary mt-1" />
                            <p className="text-gray-700">{service.hoofTrimmerDetails?.hoofTrimmerDetails}</p>
                        </div>
                    </div>
                );

            case 'horse_transport':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">Horse Transport Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-2">
                                <Users className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-medium">Number of Horses Transportable</p>
                                    <p className="text-gray-700">{service.transportDetails?.numberOfHorses}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-medium">Vehicle Type</p>
                                    <p className="text-gray-700">{service.transportDetails?.vehicleType}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'contractors':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">Contractor Details</h3>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-primary mt-1" />
                            <p className="text-gray-700">{service.contractorDetails}</p>
                        </div>
                    </div>
                );

            case 'suppliers':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">Supplier Details</h3>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-primary mt-1" />
                            <p className="text-gray-700">{service.supplierDetails}</p>
                        </div>
                    </div>
                );

            case 'horse_catering':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">Horse Catering Options</h3>
                        <div className="space-y-4">
                            {service.cateringOptions?.map((option, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <MapPin className="w-5 h-5 text-primary mt-1" />
                                    <p className="text-gray-700">{option}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Layout>
            <div className={`max-w-7xl mx-auto px-4 py-8`}>
                <CommonInfo />
                <ServiceTypeContent />
            </div>
        </Layout>
    );
}