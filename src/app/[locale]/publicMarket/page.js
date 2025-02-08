"use client";

import React from 'react';
import Layout from 'components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';

const PublicMarket = () => {
    return (
        <Layout>
            <div className="bg-gray-50 min-h-screen">
                <Head>
                    <title>Public Market - Equestrian World</title>
                    <meta name="description" content="Explore our public market for the equestrian community." />
                    <link rel="icon" href="/favicon.ico" />
                </Head>

                {/* Hero Section */}
                <div className="bg-brown-600 py-20 text-black text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">Public Market</h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto">
                        The existence of a reliable electronic market is a key factor in revitalizing and increasing the volume of trade in all fields, including the equestrian world.
                    </p>
                </div>

                {/* Services Grid */}
                <section className="py-12 bg-[#eff3fa] px-4">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">Our Market Services</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Contractors */}
                            <Link href="/contractors">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <img src="/contractors.jpg" alt="Contractors" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Contractors</h3>
                                        <p className="text-gray-600 mb-4">Find reliable contractors for your equestrian projects, from stable construction to facility maintenance.</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Suppliers */}
                            <Link href="/suppliers">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <img src="/suppliers.jpg" alt="Suppliers" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Suppliers</h3>
                                        <p className="text-gray-600 mb-4">Source high-quality equestrian products and supplies from trusted suppliers worldwide.</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Horse Catering Services */}
                            <Link href="/catering">
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                                    <img src="/catering.jpg" alt="Horse Catering Services" className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Horse Catering Services</h3>
                                        <p className="text-gray-600 mb-4">Professional catering services tailored to meet the dietary needs of your horses.</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Market Importance Section */}
                <section className="py-12 px-4 bg-white">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">Why Choose Our Electronic Market?</h2>
                        <div className="max-w-4xl mx-auto text-gray-600">
                            <p className="mb-4">
                                The electronic market allows shoppers from all over the world to access equestrian products and services easily, significantly expanding the customer base. Instant communication enhances commercial interaction.
                            </p>
                            <p className="mb-4">
                                Buyers can compare prices and choose the right products without the need to move between traditional stores. Comprehensive information about products helps shoppers make informed decisions.
                            </p>
                            <p className="mb-4">
                                Reliable electronic markets ensure consumer protection from fraud and provide clear return policies and customer support services. User reviews and ratings increase transaction transparency.
                            </p>
                            <p className="mb-4">
                                Electronic markets provide a platform for small and local business owners to market their products on a wider scale at lower costs. Sellers can directly reach equestrians and the equestrian community through targeted advertising campaigns.
                            </p>
                            <p className="mb-4">
                                The electronic market enhances competition among sellers, pushing them to offer new products and continuous improvements. Over time, the services available on electronic platforms evolve to better meet consumer needs.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}

export default PublicMarket;