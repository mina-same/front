'use client';

import React, { useState, useEffect } from 'react';
import Layout from "../../../../../components/layout/Layout";
import { useTranslation } from 'react-i18next';
import ServiceFormWizard from './ServiceFormWizard';
import { useRouter } from 'next/navigation';
import { client } from '../../../../lib/sanity';

const VALID_USER_TYPES = ['provider', 'stable_owner'];

// No longer hardcoding a single valid user type
// const VALID_USER_TYPE = 'stable_owner';

const ContactClient = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userType, setUserType] = useState(null); // Add state for userType
  const [userStable, setUserStable] = useState(null); // Add state for user's stable

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
          const query = `*[_type == "user" && _id == $userId]{ userType, stable }[0]`;
          const params = { userId: data.user.id };
          const userData = await client.fetch(query, params);

          if (!userData) {
            throw new Error('User not found in database.');
          }

          if (!VALID_USER_TYPES.includes(userData.userType)) {
            throw new Error(`Invalid user type. Only ${VALID_USER_TYPES.join(' or ')} users can access this page.`);
          }

          setUserId(data.user.id);
          setUserType(userData.userType); // Store userType
          
          // If user is stable_owner, fetch their stable reference
          if (userData.userType === 'stable_owner' && userData.stable && userData.stable._ref) {
            setUserStable(userData.stable._ref);
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
  }, [router]);

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
      <ServiceFormWizard userId={userId} userType={userType} userStable={userStable} /> {/* Pass userType and userStable as props */}
    </Layout>
  );
};

export default ContactClient;