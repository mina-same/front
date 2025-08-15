"use client";

import React, { useEffect } from 'react';
import Layout from 'components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const PublicMarket = () => {
    const { t, i18n } = useTranslation();

    useEffect(() => {
        // Change direction based on language
        document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    }, [i18n.language]);

    return (
        <Layout>
            <div className={`bg-gray-50 min-h-screen ${i18n.language === 'ar' ? 'ar-design' : ''}`}>
                <Head>
                    <title>{t('publicMarket:title')}</title>
                    <meta name="description" content={t('publicMarket:description')} />
                    <link rel="icon" href="/favicon.ico" />
                </Head>

                {/* Hero Section */}
                <div className="bg-brown-600 py-20 text-black text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">{t('publicMarket:heroTitle')}</h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto">
                        {t('publicMarket:heroSubtitle')}
                    </p>
                </div>

                {/* Services Grid */}
                <section className="py-12 bg-[#eff3fa] px-4">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">{t('publicMarket:servicesTitle')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Contractors */}
                            <Link href="/contractors">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <Image width={100} height={20} src="/assets/imgs/placeholders/contractors.png" alt="Contractors" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('publicMarket:contractorsTitle')}</h3>
                                        <p className="text-gray-600 mb-4">{t('publicMarket:contractorsDescription')}</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Suppliers */}
                            <Link href="/suppliers">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <Image width={100} height={20} src="/assets/imgs/placeholders/suppliers.png" alt="Suppliers" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('publicMarket:suppliersTitle')}</h3>
                                        <p className="text-gray-600 mb-4">{t('publicMarket:suppliersDescription')}</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Horse Catering Services */}
                            <Link href="/catering">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <Image width={100} height={20} src="/assets/imgs/placeholders/catering.png" alt="Horse Catering Services" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('publicMarket:cateringTitle')}</h3>
                                        <p className="text-gray-600 mb-4">{t('publicMarket:cateringDescription')}</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Consulting Services */}
                            <Link href="/consultingServices">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <Image width={100} height={20} src="/assets/imgs/placeholders/slider-18.png" alt="Consulting Services" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('publicMarket:consultingTitle')}</h3>
                                        <p className="text-gray-600 mb-4">{t('publicMarket:consultingDescription')}</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Photography Services */}
                            <Link href="/photographyServices">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <Image width={100} height={20} src="/assets/imgs/placeholders/slider-19.png" alt="Photography Services" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('publicMarket:photographyTitle')}</h3>
                                        <p className="text-gray-600 mb-4">{t('publicMarket:photographyDescription')}</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Event Judging */}
                            <Link href="/eventJudging">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <Image width={100} height={20} src="/assets/imgs/placeholders/slider-15.png" alt="Event Judging" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('publicMarket:judgingTitle')}</h3>
                                        <p className="text-gray-600 mb-4">{t('publicMarket:judgingDescription')}</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Event Commentary */}
                            <Link href="/eventCommentary">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <Image width={100} height={20} src="/assets/imgs/placeholders/slider-17.png" alt="Event Commentary" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('publicMarket:commentaryTitle')}</h3>
                                        <p className="text-gray-600 mb-4">{t('publicMarket:commentaryDescription')}</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Marketing & Promotion */}
                            <Link href="/marketingPromotion">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <Image width={100} height={20} src="/assets/imgs/placeholders/slider-16.png" alt="Marketing & Promotion" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('publicMarket:marketingTitle')}</h3>
                                        <p className="text-gray-600 mb-4">{t('publicMarket:marketingDescription')}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Market Importance Section */}
                <section className="py-12 px-4 bg-white">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">{t('publicMarket:importanceTitle')}</h2>
                        <div className="max-w-4xl mx-auto text-gray-600">
                            <p className="mb-4">{t('publicMarket:importanceParagraph1')}</p>
                            <p className="mb-4">{t('publicMarket:importanceParagraph2')}</p>
                            <p className="mb-4">{t('publicMarket:importanceParagraph3')}</p>
                            <p className="mb-4">{t('publicMarket:importanceParagraph4')}</p>
                            <p className="mb-4">{t('publicMarket:importanceParagraph5')}</p>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}

export default PublicMarket;
