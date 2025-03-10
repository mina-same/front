'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Phone, Mail, Link as LinkIcon, Calendar, Clock, Award, Users, Heart, Share2 } from 'lucide-react';
import { client, urlFor } from '../../../../lib/sanity';
import Layout from 'components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Preloader from 'components/elements/Preloader';
import ReservationPopup from 'components/elements/ReservationPopup';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

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

    useEffect(() => {
        if (!serviceId) return;

        const fetchServiceAndProvider = async () => {
            try {
                // First, fetch the service details
                const serviceQuery = `*[_type == "services" && _id == $serviceId][0]{
                    ...,
                    city->{name_ar, name_en},
                    country->{name_ar, name_en},
                    government->{name_ar, name_en},
                    providerRef->{
                        _id,
                        name_ar,
                        name_en,
                        servicesRef[]->{ // Fetch additional services
                            _id,
                            name_ar,
                            name_en,
                            image,
                            serviceType,
                            price,
                            statusAdminApproved
                        }
                    },
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

        fetchServiceAndProvider();
    }, [serviceId]);

    if (loading) return <Preloader />;
    if (error) return <div>Error: {error.message}</div>;
    if (!service) return <div>{t('serviceDetails:service_not_found')}</div>;

    const CommonInfo = () => (
        <div className="mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="relative h-[600px] w-full mb-12 rounded-2xl overflow-hidden group">
                <Image
                    src={service.image ? urlFor(service.image).url() : "/api/placeholder/1600/900"}
                    alt={isRTL ? service.name_ar : service.name_en}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    width={100}
                    height={30}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                <div className="absolute bottom-0 p-8 text-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                            <div className="space-y-4">
                                <h1 className="text-5xl font-bold text-white tracking-tight">
                                    {isRTL ? service.name_ar : service.name_en}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 text-white/90">
                                    <span className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        <span className="text-lg">
                                            {isRTL ? service.city?.name_ar : service.city?.name_en},
                                            {isRTL ? service.country?.name_ar : service.country?.name_en}
                                        </span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        <span>{t('serviceDetails:available')}</span>
                                    </span>
                                </div>

                                <span className="flex text-3xl font-bold gap-6">
                                    {service.price} {t('serviceDetails:currency')}
                                </span>
                            </div>

                            <div className="flex justify-start gap-4">
                                <Button
                                    onClick={() => setIsReservationModalOpen(true)}
                                    size="lg"
                                    className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
                                >
                                    <Calendar className="w-5 h-5" />
                                    {t('serviceDetails:book_now')}
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
                            {service.links.length} {t('serviceDetails:links')}
                        </a>
                    </div>
                )}
            </div>

            <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">{t('serviceDetails:about')}</h2>
                <p className="h-32 text-gray-700 flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                    {isRTL ? service.about_ar : service.about_en}
                </p>
            </div>

            <ReservationPopup
                isOpen={isReservationModalOpen}
                onClose={() => setIsReservationModalOpen(false)}
                serviceId={serviceId}
                serviceName={isRTL ? service.name_ar : service.name_en}
                providerRef={service.providerRef?._id}
            />
        </div>
    );

    const ServiceTypeContent = () => {
        switch (service.serviceType) {
            case 'horse_stable':
                return (
                    <div className="bg-white rounded-lg shadow-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                        <h3 className="text-xl font-semibold mb-4">{t('serviceDetails:stable_location')}</h3>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-primary mt-1" />
                            <p className="text-gray-700">{service.location}</p>
                        </div>
                    </div>
                );

            case 'veterinary':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                        <h3 className="text-xl font-semibold mb-4">{t('serviceDetails:veterinary_qualifications')}</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-2">
                                <Award className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-medium">{t('serviceDetails:graduation_certificate')}</p>
                                    <p className="text-gray-700">{service.graduationDetails?.graduationCertificate}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Users className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-medium">{t('serviceDetails:previous_experience')}</p>
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
                            <h3 className="text-xl font-semibold mb-4">{t('serviceDetails:competition_details')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="font-medium">{t('serviceDetails:level')}</p>
                                            <p className="text-gray-700">{service.competitions?.level}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium">{t('serviceDetails:height_distance')}</p>
                                        <p className="text-gray-700">{service.competitions?.heightDistance}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">{t('serviceDetails:race_type')}</p>
                                        <p className="text-gray-700">{service.competitions?.raceType}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="font-medium">{t('serviceDetails:prize')}</p>
                                        <p className="text-gray-700">{service.competitions?.prize}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">{t('serviceDetails:sponsor')}</p>
                                        <p className="text-gray-700">{service.competitions?.sponsor}</p>
                                    </div>
                                    {service.competitions?.sponsorLogo && (
                                        <Image
                                            src={service.competitions.sponsorLogo}
                                            alt="Sponsor Logo"
                                            className="h-16 object-contain"
                                            width={16}
                                            height={16}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-4">{t('serviceDetails:referees')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="font-medium">{t('serviceDetails:main_referee')}</p>
                                    <p className="text-gray-700">{service.competitions?.mainReferee}</p>
                                </div>
                                <div>
                                    <p className="font-medium">{t('serviceDetails:co_referee_1')}</p>
                                    <p className="text-gray-700">{service.competitions?.coReferee1}</p>
                                </div>
                                <div>
                                    <p className="font-medium">{t('serviceDetails:co_referee_2')}</p>
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
                            <h3 className="text-xl font-semibold mb-4">{t('serviceDetails:trip_details')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="font-medium">{t('serviceDetails:duration')}</p>
                                            <p className="text-gray-700">
                                                {new Date(service.tripCoordinator?.startDate).toLocaleDateString()} -
                                                {new Date(service.tripCoordinator?.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="font-medium">{t('serviceDetails:break_times')}</p>
                                            <p className="text-gray-700">{service.tripCoordinator?.breakTimes}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="font-medium">{t('serviceDetails:level_of_hardship')}</p>
                                        <p className="text-gray-700">{service.tripCoordinator?.levelOfHardship}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">{t('serviceDetails:aid_bag')}</p>
                                        <p className="text-gray-700">
                                            {service.tripCoordinator?.containsAidBag ? t('serviceDetails:available') : t('serviceDetails:not_available')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-4">{t('serviceDetails:pricing')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg text-center">
                                    <p className="font-medium">{t('serviceDetails:family_of_2')}</p>
                                    <p className="text-xl font-bold text-primary">
                                        {service.tripCoordinator?.priceForFamilyOf2} {t('serviceDetails:currency')}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg text-center">
                                    <p className="font-medium">{t('serviceDetails:family_of_3')}</p>
                                    <p className="text-xl font-bold text-primary">
                                        {service.tripCoordinator?.priceForFamilyOf3} {t('serviceDetails:currency')}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg text-center">
                                    <p className="font-medium">{t('serviceDetails:family_of_4')}</p>
                                    <p className="text-xl font-bold text-primary">
                                        {service.tripCoordinator?.priceForFamilyOf4} {t('serviceDetails:currency')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-4">{t('serviceDetails:additional_information')}</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium">{t('serviceDetails:trip_program')}</p>
                                    <p className="text-gray-700">{service.tripCoordinator?.tripProgram}</p>
                                </div>
                                <div>
                                    <p className="font-medium">{t('serviceDetails:safety_equipment')}</p>
                                    <p className="text-gray-700">{service.tripCoordinator?.safetyAndEquipment}</p>
                                </div>
                                <div>
                                    <p className="font-medium">{t('serviceDetails:cancellation_refund_policy')}</p>
                                    <p className="text-gray-700">{service.tripCoordinator?.cancellationAndRefundPolicy}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'housing':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">{t('serviceDetails:housing_details')}</h3>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-primary mt-1" />
                            <p className="text-gray-700">{service.housingDetails?.housingDetails}</p>
                        </div>
                    </div>
                );

            case 'horse_trainer':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">{t('serviceDetails:horse_trainer_details')}</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-2">
                                <Award className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-medium">{t('serviceDetails:trainer_level')}</p>
                                    <p className="text-gray-700">{service.horseTrainerDetails?.trainerLevel}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Users className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-medium">{t('serviceDetails:accreditation_certificate')}</p>
                                    <p className="text-gray-700">{service.horseTrainerDetails?.accreditationCertificate}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'hoof_trimmer':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">{t('serviceDetails:hoof_trimmer_details')}</h3>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-primary mt-1" />
                            <p className="text-gray-700">{service.hoofTrimmerDetails?.hoofTrimmerDetails}</p>
                        </div>
                    </div>
                );

            case 'horse_transport':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">{t('serviceDetails:horse_transport_details')}</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-2">
                                <Users className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-medium">{t('serviceDetails:number_of_horses')}</p>
                                    <p className="text-gray-700">{service.transportDetails?.numberOfHorses}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="font-medium">{t('serviceDetails:vehicle_type')}</p>
                                    <p className="text-gray-700">{service.transportDetails?.vehicleType}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'contractors':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">{t('serviceDetails:contractor_details')}</h3>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-primary mt-1" />
                            <p className="text-gray-700">{service.contractorDetails}</p>
                        </div>
                    </div>
                );

            case 'suppliers':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">{t('serviceDetails:supplier_details')}</h3>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-primary mt-1" />
                            <p className="text-gray-700">{service.supplierDetails}</p>
                        </div>
                    </div>
                );

            case 'horse_catering':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">{t('serviceDetails:horse_catering_options')}</h3>
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

    const AdditionalServices = () => {
        if (!provider?.servicesRef?.length) return null;

        // Filter out the current service and non-approved services
        const additionalServices = provider.servicesRef.filter(s =>
            s._id !== serviceId &&
            s.statusAdminApproved === true
        );

        if (!additionalServices.length) return null;

        return (
            <div className="mt-12" dir={isRTL ? 'rtl' : 'ltr'}>
                <h2 className="text-2xl font-semibold mb-6">
                    {t('serviceDetails:additional_services')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {additionalServices.map((service) => (
                        <Link href={`/services/${service._id}`} key={service._id}>
                            <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-300">
                                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                                    <Image
                                        src={service.image ? urlFor(service.image).url() : "/api/placeholder/400/300"}
                                        alt={isRTL ? service.name_ar : service.name_en}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        width={400}
                                        height={300}
                                    />
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold mb-2">
                                        {isRTL ? service.name_ar : service.name_en}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary">
                                            {t(`serviceTypes:${service.serviceType}`)}
                                        </Badge>
                                        <span className="font-medium text-primary">
                                            {service.price} {t('serviceDetails:currency')}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <div className={`max-w-7xl mx-auto px-4 py-8`}>
                <CommonInfo />
                <ServiceTypeContent />
                <AdditionalServices />
            </div>
        </Layout>
    );
}
