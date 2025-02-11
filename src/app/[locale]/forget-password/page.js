"use client";

import React, { useState, useEffect } from 'react';
import Layout from '../../../../components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { MdEmail } from 'react-icons/md';
import { MdMarkEmailRead } from 'react-icons/md';
import { CgSpinner } from 'react-icons/cg';
import { useTranslation } from 'react-i18next';

const ForgetPassword = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        document.body.dir = isRTL ? 'rtl' : 'ltr';
    }, [isRTL]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError(t('forgetPassword:pleaseEnterEmail'));
            return;
        }

        setError('');
        setIsLoading(true);
        setSuccessMessage('');

        try {
            const response = await fetch('http://localhost:3000/api/auth/forget', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.status === 200) {
                setSuccessMessage(data.message);
                setIsEmailSent(true);
                setEmail(''); // Clear email input after successful send
            } else {
                setError(data.message);
                setIsEmailSent(false);
            }
        } catch (err) {
            setError(t('forgetPassword:errorOccurred'));
            setIsEmailSent(false);
        } finally {
            setIsLoading(false);
        }
    };

    const getButtonContent = () => {
        if (isLoading) {
            return (
                <>
                    <CgSpinner className="animate-spin text-2xl" />
                    <span>{t('forgetPassword:sending')}</span>
                </>
            );
        }
        if (isEmailSent) {
            return (
                <>
                    <MdMarkEmailRead className="text-2xl" />
                    <span>{t('forgetPassword:emailSent')}</span>
                </>
            );
        }
        return (
            <>
                <MdEmail className="text-2xl" />
                <span>{t('forgetPassword:sendEmail')}</span>
            </>
        );
    };

    return (
        <>
            <Layout>
                <section className="relative pb-20 pt-28">
                    <div className={`hidden lg:block absolute inset-0 ${isRTL ? 'w-1/2 mr-auto' : 'w-1/2 ml-auto'}`}>
                        <div className="flex items-center h-full wow animate__animated animate__fadeIn animated" data-wow-delay=".1s">
                            <Image
                                width="0"
                                height="0"
                                sizes="100vw"
                                style={{ width: 'auto', height: 'auto' }}
                                className="lg:max-w-lg mx-auto"
                                src="/assets/imgs/illustrations/forgot-password.svg"
                                alt="Monst"
                            />
                        </div>
                    </div>
                    <div className="container">
                        <div className="relative flex flex-wrap pt-12">
                            <div className={`lg:flex lg:flex-col w-full lg:w-1/2 py-6 ${isRTL ? 'lg:pl-20' : 'lg:pr-20'}`}>
                                <div className="w-full max-w-lg mx-auto lg:mx-0 my-auto wow animate__animated animate__fadeIn animated" data-wow-delay=".3s">
                                    <span className="text-sm text-blueGray-400">{t('forgetPassword:forgetPassword')}</span>
                                    <h4 className={`mb-6 text-3xl ${isRTL ? 'font-arabic' : ''}`}>{t('forgetPassword:dontWorry')}</h4>
                                    <div className="flex mb-4 px-4 bg-blueGray-50 rounded border border-gray-200">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={`w-full py-4 text-xs placeholder-blueGray-400 font-semibold leading-none bg-blueGray-50 outline-none ${isRTL ? 'text-right font-arabic' : 'text-left'}`}
                                            placeholder={t('forgetPassword:enterEmail')}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
                                    {successMessage && <p className="text-green-500 text-xs mb-4">{successMessage}</p>}
                                    <button
                                        className="flex justify-center items-center gap-2 transition duration-300 ease-in-out transform hover:-translate-y-1 w-full p-4 text-center text-lg text-white font-semibold leading-none bg-[#a78638] hover:bg-[#C19733] rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                    >
                                        {getButtonContent()}
                                    </button>
                                </div>

                                <div className="w-full mt-12 mx-auto text-center">
                                    <p className={isRTL ? 'font-arabic' : ''}>
                                        {t('forgetPassword:dontHaveAccount')}{' '}
                                        <Link href="/signup" className="inline-block text-xs text-[#a78638] hover:text-[#C19733] font-semibold leading-none wow animate__animated animate__fadeIn animated" data-wow-delay=".1s">
                                            {t('forgetPassword:signUpNow')}
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </Layout>
        </>
    );
};

export default ForgetPassword;
