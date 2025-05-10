'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../../../../components/layout/Layout';
import { useTranslation } from 'react-i18next';
import ServiceFormWizard from './ServiceFormWizard';
import { useRouter } from 'next/navigation';
import { client } from '../../../../lib/sanity';

const VALID_USER_TYPE = 'provider';

const ContactClient = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
          // Fetch userType from Sanity
          const query = `*[_type == "user" && _id == $userId]{ userType }[0]`;
          const params = { userId: data.user.id };
          const userData = await client.fetch(query, params);

          if (!userData) {
            throw new Error('User not found in database.');
          }

          if (userData.userType !== VALID_USER_TYPE) {
            throw new Error('Invalid user type. Only Educational Services users can access this page.');
          }

          setIsAuthenticated(true);
        } else {
          throw new Error('User not authenticated.');
        }
      } catch (error) {
        console.error('Auth verification failed:', error.message);
        setError(error.message);
        router.push(`/login?error=${encodeURIComponent(error.message)}`);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router, client]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-medium text-gray-600">{t('addBook:loading')}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Prevents rendering before redirection
  }

  return (
    <Layout>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {t('addBook:authError')}: {error}
        </div>
      )}
      <ServiceFormWizard />
    </Layout>
  );
};

export default ContactClient;