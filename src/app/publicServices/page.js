"use client";

import React from 'react';
import Layout from 'components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';

const PublicServices = () => {
    return (
        <Layout>
            <div className="bg-gray-50 min-h-screen">
                <Head>
                    <title>Public Services - Equestrian World</title>
                    <meta name="description" content="Explore our public services for the equestrian community." />
                    <link rel="icon" href="/favicon.ico" />
                </Head>

                {/* Hero Section */}
                <div className="bg-brown-600 py-20 text-black text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">Public Services</h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto">
                        We are a site that offers a variety of services covering all aspects of the equestrian world and riders. We aim to provide a comprehensive platform that meets the needs of equestrian enthusiasts from various aspects.
                    </p>
                </div>

                {/* Services Grid */}
                <section className="bg-[#eff3fa] py-12 px-4">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">Our Services</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Veterinarian */}
                            <Link href="/veterinarian">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <img src="/veterinarian.jpg" alt="Veterinarian" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Veterinarian</h3>
                                        <p className="text-gray-600 mb-4">Professional veterinary care for your horses, including consultations, physical therapy, and rehabilitation.</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Housing */}
                            <Link href="/housing">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <img src="/housing.jpg" alt="Housing" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Housing</h3>
                                        <p className="text-gray-600 mb-4">Find the perfect housing solutions for your horses, from stables to pastures.</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Horse Trainer - Beginners */}
                            <Link href="/trainer">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <img src="/trainer.jpg" alt="Horse Trainer" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Horse Trainer - Beginners</h3>
                                        <p className="text-gray-600 mb-4">Comprehensive training programs for riders of all levels, from beginners to professionals.</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Horse Hoof Trimmer - Farrier */}
                            <Link href="/farrier">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <img src="/farrier.jpg" alt="Farrier" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Horse Hoof Trimmer - Farrier</h3>
                                        <p className="text-gray-600 mb-4">Professional hoof trimming and farrier services to keep your horse healthy and comfortable.</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Horse Transport Services */}
                            <Link href="/transport">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <img src="/transport.jpg" alt="Horse Transport" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Horse Transport Services</h3>
                                        <p className="text-gray-600 mb-4">Reliable and safe horse transport services for local and long-distance needs.</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Market Importance Section */}
                <section className="py-12 px-4 bg-white">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">Our Services</h2>
                        <div className="max-w-4xl mx-auto text-gray-600">
                            <p className="mb-4">
                                <strong>Equestrian Training:</strong> We provide comprehensive training programs for riders of all levels, from beginners to professional riders. Our training courses include riding skills, jumping, and theoretical lessons.
                            </p>
                            <p className="mb-4">
                                <strong>Veterinary Consultations:</strong> We offer veterinary consultations from specialized veterinarians to ensure the health and safety of horses. Services include physical therapy and rehabilitation for injured horses.
                            </p>
                            <p className="mb-4">
                                <strong>Organizing Competitions and Events:</strong> Organizing local and international equestrian competitions and championships at a professional level. Organizing social events and equestrian festivals to attract the community and promote equestrian sports.
                            </p>
                            <p className="mb-4">
                                <strong>Equestrian Equipment and Supplies:</strong> Providing a wide range of equestrian equipment, including saddles, bridles, and rider clothing. Supplying safety equipment and gear for horses to ensure the comfort and safety of riders and horses.
                            </p>
                            <p className="mb-4">
                                <strong>Training and Development Consultations:</strong> Offering consultations for the development of equestrian clubs and schools. Providing tips and guidance to improve performance and professionalism in the field of equestrianism.
                            </p>
                            <p className="mb-4">
                                <strong>Educational Articles and Resources:</strong> Offering comprehensive educational articles and resources covering all aspects of equestrianism. Sharing the latest research and studies related to equestrianism and horses.
                            </p>
                            <p className="mb-4">
                                <strong>Photography and Videography Services:</strong> High-quality event and competition photography. Providing photography and videography services for riders and horses.
                            </p>
                            <p className="mb-4">
                                We always strive to offer the best services and meet the needs of the equestrian community with passion and dedication. If you are looking for support or additional information in any field of equestrianism, we are here to help you.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}

export default PublicServices;