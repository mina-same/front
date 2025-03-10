"use client";

import React, { useState, useEffect } from 'react';
import Layout from '../../../../components/layout/Layout';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { CgSpinner } from 'react-icons/cg';
import { BsPersonWorkspace, BsPersonVcard } from 'react-icons/bs';
import { MdCloudUpload, MdOutlineError, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import Preloader from "../../../../components/elements/Preloader";

const User = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('');
  const [phone, setPhone] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();

        if (data.authenticated) {
          setAuthenticated(true);
          setUserId(data.user.id);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error verifying user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [router]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImageChange(files[0]);
    }
  };

  const handleImageChange = (file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('user:error.imageSize'));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError(t('user:error.imageType'));
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userType || !phone || !imageFile) {
      setError(t('user:error.completeFields'));
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('userId', userId);
      formData.append('userType', userType);
      formData.append('phone', phone);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(t('user:error.uploadFailed'));
      }

      router.push(userType === 'provider' ? '/profile' : '/');
      router.refresh();

    } catch (err) {
      console.error('Profile completion error:', err);
      setError(t('user:error.profileCompletionError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <Preloader />;
  }

  return (
    <Layout>
      <section className={`min-h-screen bg-gradient-to-b from-white to-gray-50 pt-20 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left Column - Form */}
              <div className={`w-full lg:w-1/2 space-y-8 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className={`text-center lg:text-${isRTL ? 'right' : 'left'}`}>
                  <h2 className={`text-4xl font-bold bg-gradient-to-r from-[#a78638] to-[#C19733] bg-clip-text text-transparent ${isRTL ? 'font-arabic' : ''}`}>
                    {t('user:completeProfile')}
                  </h2>
                  <p className="mt-2 text-gray-600">{t('user:joinCommunity')}</p>
                </div>

                {/* Image Upload Area */}
                <div className="relative">
                  <div
                    className={`w-40 h-40 mx-auto rounded-full border-4 ${isDragging ? 'border-[#C19733]' : 'border-[#a78638]'} relative overflow-hidden transition-all duration-300 ${isDragging ? 'scale-105' : 'scale-100'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {imagePreview ? (
                      <>
                        <Image
                          src={imagePreview}
                          alt="Profile Preview"
                          layout="fill"
                          objectFit="cover"
                          className="rounded-full"
                        />
                        <button
                          onClick={handleDeleteImage}
                          className="absolute top-0 right-0 p-2 bg-blue-500 text-white rounded-full transform translate-x-1/3 -translate-y-1/3 hover:bg-red-600 transition-colors duration-300"
                          type="button"
                        >
                          <MdDelete className="text-lg" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                        <MdCloudUpload className="text-4xl text-[#a78638]" />
                        <span className="text-sm text-gray-500 mt-2">{t('user:imageUpload')}</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Phone Input */}
                <div className="relative">
                  <PhoneInput
                    country={'eg'}
                    value={phone}
                    onChange={setPhone}
                    inputClass="ml-4 w-full py-4 px-6 text-gray-700 rounded-xl border-2 border-gray-200 focus:border-[#a78638] transition-colors duration-300"
                    containerClass="w-full"
                    style={{ marginLeft: "40px" }}
                    buttonClass={`rounded-l-xl ${isRTL ? "pr-10" : "pl-0"}`}
                    dropdownClass="bg-white"
                  />
                </div>

                {/* User Type Selection */}
                <div className="grid grid-cols-2 gap-6">
                  <button
                    type="button"
                    onClick={() => setUserType('normal')}
                    className={`group relative overflow-hidden rounded-2xl p-6 ${userType === 'normal' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-50'} border-2 border-gray-200 transition-all duration-300 transform hover:scale-105 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <BsPersonVcard className={`text-4xl ${userType === 'normal' ? 'text-white' : 'text-blue-500'}`} />
                      <span className="font-semibold">{t('user:normalUser')}</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#a78638] to-[#C19733] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserType('provider')}
                    className={`group relative overflow-hidden rounded-2xl p-6 ${userType === 'provider' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-50'} border-2 border-gray-200 transition-all duration-300 transform hover:scale-105 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <BsPersonWorkspace className={`text-4xl ${userType === 'provider' ? 'text-white' : 'text-blue-500'}`} />
                      <span className="font-semibold">{t('user:serviceProvider')}</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#a78638] to-[#C19733] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-lg">
                    <MdOutlineError className="text-xl" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#a78638] to-[#C19733] text-white py-4 px-8 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <CgSpinner className="animate-spin text-2xl" />
                      <span>{t('user:processing')}</span>
                    </>
                  ) : (
                    t('user:completeProfileButton')
                  )}
                </button>
              </div>

              {/* Right Column - Illustration */}
              <div className="w-full lg:w-1/2">
                <div className="relative w-full h-[500px]">
                  <Image
                    src="/assets/imgs/illustrations/horseProfile.svg"
                    alt="Profile Completion"
                    layout="fill"
                    objectFit="contain"
                    className="animate-float"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </Layout>
  );
};

export default User;
