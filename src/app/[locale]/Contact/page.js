'use client';

import React from "react";
import Layout from "components/layout/Layout";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const ContactClient = () => {
    const { t } = useTranslation();

    return (
        <Layout>
            <section className="relative -mt-24 pt-24">
                <div 
                    className="hidden lg:block absolute inset-0 w-1/2 ml-auto bg-blueGray-100" 
                    style={{ zIndex: -1 }}
                ></div>
                <div className="container">
                    <div className="flex flex-wrap items-center -mx-3">
                        <div className="w-full lg:w-1/2 px-3">
                            <div className="py-12">
                                <div className="max-w-lg lg:max-w-md mx-auto lg:mx-0 mb-8 text-center lg:text-left">
                                    <h2 className="text-3xl lg:text-5xl mb-4 font-bold font-heading animate__animated animate__fadeIn">
                                        {t("contact:heroTitle")}
                                    </h2>
                                    <div className="text-blueGray-400 leading-relaxed animate__animated animate__fadeIn">
                                        {t("contact:heroDescription")}
                                    </div>
                                    <p className="text-blueGray-400 leading-relaxed animate__animated animate__fadeIn mt-3 text-sm">
                                        {t("contact:heroSubtext")}
                                    </p>
                                </div>
                                <div className="text-center lg:text-left">
                                    <Link
                                        href="/about"
                                        className="tracking-wide hover-up-2 block sm:inline-block py-4 px-8 mb-4 sm:mb-0 sm:mr-3 text-xs text-white text-center font-semibold leading-none bg-blue-400 hover:bg-blue-500 rounded animate__animated animate__fadeIn"
                                    >
                                        {t("contact:aboutButton")}
                                    </Link>
                                    <Link
                                        href="/services"
                                        className="block hover-up-2 sm:inline-block py-4 px-8 text-xs text-blueGray-500 hover:text-blueGray-600 text-center font-semibold leading-none bg-white border border-blueGray-200 hover:border-blueGray-300 rounded animate__animated animate__fadeIn"
                                    >
                                        {t("contact:servicesButton")}
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 px-3 lg:bg-blueGray-10 mb-12 lg:mb-0 pb-10">
                            <div className="flex items-center justify-center">
                                <Image
                                    src="/assets/imgs/illustrations/team.svg"
                                    alt="Team Illustration"
                                    width={500}
                                    height={300}
                                    style={{ width: "auto", height: "auto" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="container">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="max-w-md mb-8 mx-auto">
                            <span className="inline-block py-1 px-3 text-xs font-semibold bg-blue-200 text-black rounded-xl animate__animated animate__fadeIn">
                                {t("contact:contactTitle")}
                            </span>
                            <h2 className="mt-2 text-4xl font-bold font-heading animate__animated animate__fadeIn">
                                {t("contact:contactSubtitle")}
                            </h2>
                        </div>
                        <div>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="mb-4 animate__animated animate__fadeIn">
                                    <input
                                        className="w-full p-4 text-xs font-semibold leading-none bg-blueGray-50 rounded outline-none"
                                        type="text"
                                        placeholder={t("contact:form.subject")}
                                    />
                                </div>
                                <div className="mb-4 animate__animated animate__fadeIn">
                                    <input
                                        className="w-full p-4 text-xs font-semibold leading-none bg-blueGray-50 rounded outline-none"
                                        type="text"
                                        placeholder={t("contact:form.name")}
                                    />
                                </div>
                                <div className="mb-4 animate__animated animate__fadeIn">
                                    <input
                                        className="w-full p-4 text-xs font-semibold leading-none bg-blueGray-50 rounded outline-none"
                                        type="email"
                                        placeholder={t("contact:form.email")}
                                    />
                                </div>
                                <div className="mb-4 animate__animated animate__fadeIn">
                                    <textarea
                                        className="w-full h-24 p-4 text-xs font-semibold leading-none resize-none bg-blueGray-50 rounded outline-none"
                                        placeholder={t("contact:form.message")}
                                    ></textarea>
                                </div>
                                <div className="mb-4 animate__animated animate__fadeIn">
                                    <label className="flex px-2 bg-blueGray-50 rounded">
                                        <input className="hidden" type="file" name="Choose file" />
                                        <span className="my-1 ml-auto px-4 py-3 text-xs text-white font-semibold leading-none bg-blueGray-500 hover:bg-blueGray-600 rounded cursor-pointer">
                                            {t("contact:form.browse")}
                                        </span>
                                    </label>
                                </div>
                                <div className="flex justify-between items-center animate__animated animate__fadeIn">
                                    <button
                                        className="w-full py-4 px-8 text-sm text-white font-semibold leading-none bg-blue-500 hover:bg-blue-500 rounded"
                                        type="submit"
                                    >
                                        {t("contact:form.submit")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-[#f1f5f9]">
                <div className="container">
                    <div className="text-center max-w-xl mx-auto">
                        <h2 className="mb-4 text-3xl lg:text-3xl text-black font-bold font-heading">
                            {t("contact:newsletter.title")}
                        </h2>
                        <p className="mb-8 text-blueGray-500">
                            {t("contact:newsletter.description")}
                        </p>
                        <div className="flex flex-wrap max-w-lg mx-auto">
                            <div className="flex w-full md:w-2/3 px-3 mb-3 md:mb-0 md:mr-6 bg-white border border-white rounded">
                                <svg className="h-6 w-6 my-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                                </svg>
                                <input
                                    className="w-full pl-3 py-4 text-xs placeholder-black font-semibold leading-none bg-white outline-none"
                                    type="text"
                                    placeholder={t("contact:newsletter.placeholder")}
                                />
                            </div>
                            <button
                                className="w-full md:w-auto py-4 px-8 text-xs text-black hover:text-white font-semibold leading-none border border-white hover:border-blue-300 bg-white hover:bg-blue-500 rounded transition duration-300 ease-in-out"
                                type="submit"
                            >
                                {t("contact:newsletter.signUp")}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default ContactClient;