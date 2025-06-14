'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../../../../components/layout/Layout';
import { useTranslation } from 'react-i18next';
import StableFormWizard from './StableFormWizard';
import { useRouter } from 'next/navigation';
import { client } from '../../../../lib/sanity';

const VALID_USER_TYPE = 'stable_owner'; // Adjust based on your Sanity user schema

const StableClient = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasStable, setHasStable] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Check authentication
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        if (data.authenticated) {
          setUserId(data.user.id);
          // Fetch userType and check for existing stable
          const query = `*[_type == "user" && _id == $userId]{ userType }[0]`;
          const params = { userId: data.user.id };
          const userData = await client.fetch(query, params);

          if (!userData) {
            throw new Error(t('addStable:userNotFound'));
          }

          if (userData.userType !== VALID_USER_TYPE) {
            throw new Error(t('addStable:unauthorized'));
          }

          // Check if user already has a stable
          const stableQuery = `*[_type == "stables" && userRef._ref == $userId][0]`;
          const stableParams = { userId: data.user.id };
          const existingStable = await client.fetch(stableQuery, stableParams);

          if (existingStable) {
            setHasStable(true);
            setError(t('addStable:stableLimitReached'));
            // Delay redirect by 3 seconds
            const redirectTimeout = setTimeout(() => {
              router.push('/profile?tab=stable_owner');
            }, 3000);
            // Cleanup timeout on unmount
            return () => clearTimeout(redirectTimeout);
          }

          setIsAuthenticated(true);
        } else {
          throw new Error(t('addStable:unauthenticated'));
        }
      } catch (error) {
        console.error('Auth verification failed:', error.message);
        setError(error.message);
        if (!hasStable) {
          router.push(`/login?error=${encodeURIComponent(error.message)}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router, t]);

  const handleSubmit = async (formData) => {
    try {
      // Double-check stable limit before submission
      const stableQuery = `*[_type == "stables" && userRef._ref == $userId][0]`;
      const stableParams = { userId };
      const existingStable = await client.fetch(stableQuery, stableParams);

      if (existingStable) {
        return { success: false, message: t('addStable:stableLimitReached') };
      }

      const stableData = {
        _type: "stables",
        name_ar: formData.name_ar,
        name_en: formData.name_en,
        userRef: { _type: "reference", _ref: userId },
        servicePhone: formData.servicePhone,
        serviceEmail: formData.serviceEmail,
        images: formData.images.map((img) => ({
          _type: "image",
          asset: { _type: "reference", _ref: img.asset._id },
          alt: img.alt,
          _key: `image-${Math.random().toString(36).substr(2, 9)}`,
        })),
        kindOfStable: formData.kindOfStable,
        boardingCapacity: formData.boardingCapacity,
        fullTimeServices: [],
        freelancerServices: [],
      };

      const result = await client.create(stableData);
      router.push("/profile?tab=stable_owner");
      return { success: true, message: t("addStable:success") };
    } catch (error) {
      console.error("Error creating stable:", error);
      return { success: false, message: t("addStable:failed") };
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg font-medium text-gray-600">{t('addStable:loading')}</div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || hasStable) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-blue-100">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full text-center">
            {/* Loading Spinner */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            {/* Message */}
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
              {t('addStable:redirecting')}
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              {t('addStable:stableLimitReached')}
            </p>
            <p className="text-sm text-gray-500">
              {t('addStable:redirectingMessage')}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {t('addStable:error')}: {error}
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          {t("addStable:title")}
        </h1>
        <StableFormWizard onSubmit={handleSubmit} />
      </div>
    </Layout>
  );
};

export default StableClient;