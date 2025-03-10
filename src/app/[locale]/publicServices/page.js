"use client";

import React, { useEffect } from 'react';
import Layout from 'components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const PublicServices = () => {
    const { t, i18n } = useTranslation();

    useEffect(() => {
        // Change direction based on language
        document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    }, [i18n.language]);

    return (
        <Layout>
            <div className={`bg-gray-50 min-h-screen ${i18n.language === 'ar' ? 'ar-design' : ''}`}>
                <Head>
                    <title>{t('publicServices:publicServicesTitle')}</title>
                    <meta name="description" content={t('publicServices:publicServicesDescription')} />
                    <link rel="icon" href="/favicon.ico" />
                </Head>

                {/* Hero Section */}
                <div className="bg-brown-600 py-20 text-black text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">{t('publicServices:heroTitle')}</h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto">
                        {t('publicServices:heroSubtitle')}
                    </p>
                </div>

                {/* Services Grid */}
                <section className="bg-[#eff3fa] py-12 px-4">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">{t('publicServices:servicesTitle')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Veterinarian */}
                            <Link href="/veterinarian">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <Image width={100} height={20} src="/assets/imgs/placeholders/veterinarian.png" alt="Veterinarian" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('publicServices:veterinarianTitle')}</h3>
                                        <p className="text-gray-600 mb-4 min-h-80px">{t('publicServices:veterinarianDescription')}</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Housing */}
                            <Link href="/housing">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <Image width={100} height={20} src="/assets/imgs/placeholders/housing.png" alt="Housing" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('publicServices:housingTitle')}</h3>
                                        <p className="text-gray-600 mb-4 min-h-80px">{t('publicServices:housingDescription')}</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Horse Trainer - Beginners */}
                            <Link href="/horseTrainer">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <Image width={100} height={20} src="/assets/imgs/placeholders/trainer.png" alt="Horse Trainer" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('publicServices:trainerTitle')}</h3>
                                        <p className="text-gray-600 mb-4 min-h-80px">{t('publicServices:trainerDescription')}</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Horse Hoof Trimmer - Farrier */}
                            <Link href="/horseTrimmer">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <Image width={100} height={20} src="/assets/imgs/placeholders/horseTrimmer.png" alt="Farrier" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('publicServices:farrierTitle')}</h3>
                                        <p className="text-gray-600 mb-4 min-h-80px">{t('publicServices:farrierDescription')}</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Horse Transport Services */}
                            <Link href="/horseTransport">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <Image width={100} height={20}   src="/assets/imgs/placeholders/horseTransport.png" alt="Horse Transport" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('publicServices:transportTitle')}</h3>
                                        <p className="text-gray-600 mb-4 min-h-80px">{t('publicServices:transportDescription')}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Market Importance Section */}
                <section className="py-12 px-4 bg-white">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">{t('publicServices:importanceTitle')}</h2>
                        <div className="max-w-4xl mx-auto text-gray-600">
                            <p className="mb-4" dangerouslySetInnerHTML={{ __html: t('publicServices:importanceParagraph1') }}></p>
                            <p className="mb-4" dangerouslySetInnerHTML={{ __html: t('publicServices:importanceParagraph2') }}></p>
                            <p className="mb-4" dangerouslySetInnerHTML={{ __html: t('publicServices:importanceParagraph3') }}></p>
                            <p className="mb-4" dangerouslySetInnerHTML={{ __html: t('publicServices:importanceParagraph4') }}></p>
                            <p className="mb-4" dangerouslySetInnerHTML={{ __html: t('publicServices:importanceParagraph5') }}></p>
                            <p className="mb-4" dangerouslySetInnerHTML={{ __html: t('publicServices:importanceParagraph6') }}></p>
                            <p className="mb-4" dangerouslySetInnerHTML={{ __html: t('publicServices:importanceParagraph7') }}></p>
                            <p className="mb-4">{t('publicServices:importanceParagraph8')}</p>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}

export default PublicServices;
