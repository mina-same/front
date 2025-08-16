"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Edit,
  Mail,
  MapPin,
  CircleAlert,
  CircleCheck,
  Wallet,
  Trophy,
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Gift,
  Coins,
  Target,
  Award,
  Medal,
  Heart,
  Zap,
  Flame,
  Crown,
  Users,
  Eye,
  Plus,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { urlFor } from "@/lib/sanity";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

const Overview = ({ userData }) => {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const locale = i18n.language;
  const isRTL = locale === "ar";

  const fetchUserInvitations = useCallback(async () => {
    try {
      setLoadingInvitations(true);
      
      // First, get the authenticated user
      const authResponse = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!authResponse.ok) {
        console.error('Authentication failed');
        return;
      }

      const authData = await authResponse.json();
      if (!authData.authenticated) {
        console.error('User not authenticated');
        return;
      }

      setCurrentUserId(authData.user.id);

      // Try multiple user ID formats
      const userIds = [
        authData.user.id,
        userData?._id,
        userData?.id
      ].filter(Boolean);

      // Try fetching invitations with different user IDs
      let invitationsFound = [];
      
      for (const userId of userIds) {
        // First try with status filter
        const invitationsResponse = await fetch(`/api/invitations?invitedUser=${userId}&status=pending`);
        
        if (invitationsResponse.ok) {
          const invitationsData = await invitationsResponse.json();
          
          if (invitationsData.invitations && invitationsData.invitations.length > 0) {
            invitationsFound = invitationsData.invitations;
            break;
          }
        }
        
        // If no pending invitations, try without status filter
        const allInvitationsResponse = await fetch(`/api/invitations?invitedUser=${userId}`);
        if (allInvitationsResponse.ok) {
          const allInvitationsData = await allInvitationsResponse.json();
          
          if (allInvitationsData.invitations && allInvitationsData.invitations.length > 0) {
            invitationsFound = allInvitationsData.invitations;
            break;
          }
        }
      }
      
      setInvitations(invitationsFound);
      
      // If no invitations found, try fetching all invitations to debug
      if (invitationsFound.length === 0) {
        const allInvitationsResponse = await fetch('/api/invitations');
        if (allInvitationsResponse.ok) {
          const allInvitationsData = await allInvitationsResponse.json();
          
          // Filter invitations that match any of our user IDs
          const matchingInvitations = allInvitationsData.invitations?.filter(invitation => {
            const invitedUserId = invitation.invitedUser?._id || invitation.invitedUser?._ref;
            const matches = userIds.includes(invitedUserId);
            return matches;
          }) || [];
          
          setInvitations(matchingInvitations);
        }
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoadingInvitations(false);
    }
  }, []);

  // Fetch invitations when component mounts
  useEffect(() => {
    fetchUserInvitations();
  }, [fetchUserInvitations]);

  const handleJoinCompetition = (inviteLink) => {
    const inviteCode = inviteLink.split('/').pop();
    router.push(`/join/${inviteCode}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale) + ' ' + date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'declined':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getDirectionClass = (defaultClasses = "") => {
    return `${defaultClasses} ${isRTL ? "rtl" : "ltr"}`;
  };

  const getRTLSpacing = (leftClass, rightClass) => {
    return isRTL ? rightClass : leftClass;
  };

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      userData?.fullName,
      userData?.email,
      userData?.phoneNumber,
      userData?.kind,
      userData?.addressDetails,
      userData?.city?.name,
      userData?.governorate?.name,
      userData?.country?.name,
      userData?.image,
      userData?.isEmailVerified,
    ];
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  // Mock billing data (replace with actual Sanity data if available)
  const billingInfo = {
    cardType: "visa",
    cardLastFour: "9016",
    cardExpires: "03/24",
    cardExpired: false, // Set to true if expiration date is past current date
  };

  return (
    <div 
      className={`pt-4 pb-2 sm:pb-4 font-sans ${isRTL ? 'text-right' : 'text-left'}`} 
      style={isRTL ? { fontFamily: "'Noto Sans Arabic', sans-serif" } : {}}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <h1 className={`text-2xl font-semibold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        {t("profile:overviewTitle")}
      </h1>

      {/* Basic Info Section */}
      <section className="bg-white rounded-xl shadow-sm p-1 md:p-2 xl:p-3 2xl:p-4 mb-4">
        <div className="p-4">
          <div className={`flex justify-between items-center mt-sm-n1 pb-4 mb-0 lg:mb-1 xl:mb-3 ${
            isRTL ? '' : ''
          }`}>
            <div className={`flex items-center ${isRTL ? '' : ''}`}>
              <User className={`text-primary text-xl ${getRTLSpacing('mr-2', 'ml-2')}`} />
              <h2 className="text-lg font-medium mb-0">{t("profile:basicInfo")}</h2>
            </div>
            <Link href="/test?tab=settings">
              <Button className={`rounded-xl bg-gray-200 text-gray-700 text-sm hover:bg-gray-300 ${
                isRTL ? '' : ''
              }`}>
                <Edit className={`w-4 h-4 ${getRTLSpacing('mr-2', 'ml-2')}`} />
                {t("profile:editInfo")}
              </Button>
            </Link>
          </div>

          <div className={`md:flex items-center ${isRTL ? '' : ''}`}>
            <div className={`sm:flex items-center ${isRTL ? '' : ''}`}>
              <div
                className="rounded-full bg-cover bg-center flex-shrink-0 w-20 h-20 bg-gray-200"
                style={{
                  backgroundImage: userData?.image
                    ? `url(${urlFor(userData.image).url()})`
                    : `url(/placeholder.svg)`,
                }}
              ></div>
              <div className={`pt-3 sm:pt-0 ${getRTLSpacing('sm:pl-3', 'sm:pr-3')}`}>
                <h3 className={`text-base font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {userData?.fullName || t("profile:userName")}
                  {userData?.isEmailVerified && (
                    <CircleCheck className={`inline-block text-green-500 w-4 h-4 ${getRTLSpacing('ml-2', 'mr-2')}`} />
                  )}
                </h3>
                <div className={`text-gray-500 font-medium flex flex-wrap sm:flex-nowrap items-center ${
                  isRTL ? '' : ''
                }`}>
                  <div className={`flex items-center ${getRTLSpacing('mr-3', 'ml-3')}`}>
                    <Mail className={`w-4 h-4 ${getRTLSpacing('mr-1', 'ml-1')}`} />
                    {userData?.email || t("profile:noEmailProvided")}
                  </div>
                  <div className="flex items-center text-nowrap">
                    <MapPin className={`w-4 h-4 ${getRTLSpacing('mr-1', 'ml-1')}`} />
                    {userData?.country?.[locale === "en" ? "name_en" : "name_ar"] ? (
                      `${userData.country[locale === "en" ? "name_en" : "name_ar"]}, ${
                        userData.userType === "rider" ? t("profile:currency.usd") : t("profile:currency.local")
                      }`
                    ) : (
                      <Link
                        href="/test?tab=settings"
                        className="text-blue-600 hover:underline"
                      >
                        {t("profile:addCountry")}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`w-full pt-3 md:pt-0 ${getRTLSpacing('md:ml-auto', 'md:mr-auto')}`}
              style={{ maxWidth: "212px" }}
            >
              <div className={`flex justify-between text-sm pb-1 mb-2 ${isRTL ? '' : ''}`}>
                {t("profile:profileCompletion")}
                <strong className={getRTLSpacing('ml-2', 'mr-2')}>
                  {calculateProfileCompletion()}%
                </strong>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${calculateProfileCompletion()}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className={`flex flex-row py-4 mb-2 sm:mb-3 ${isRTL ? '' : ''}`}>
            <div className="md:w-1/2 mb-4 md:mb-0">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className={`text-gray-500 py-1 px-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t("profile:phone")}
                    </td>
                    <td className={`text-gray-800 font-medium py-1 ${getRTLSpacing('pl-3', 'pr-3')} ${isRTL ? 'text-right' : 'text-left'}`}>
                      {userData?.phoneNumber || t("profile:notProvided")}
                    </td>
                  </tr>
                  <tr>
                    <td className={`text-gray-500 py-1 px-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t("profile:language")}
                    </td>
                    <td className={`text-gray-800 font-medium py-1 ${getRTLSpacing('pl-3', 'pr-3')} ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t("profile:languageOptions.english")}
                    </td>
                  </tr>
                  <tr>
                    <td className={`text-gray-500 py-1 px-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t("profile:genderLabel")}
                    </td>
                    <td className={`text-gray-800 font-medium py-1 ${getRTLSpacing('pl-3', 'pr-3')} ${isRTL ? 'text-right' : 'text-left'}`}>
                      {userData?.kind ? (
                        t(`profile:gender.${userData.kind}`)
                      ) : (
                        <Link
                          href="/test?tab=settings"
                          className="text-blue-600 hover:underline"
                        >
                          {t("profile:addGender")}
                        </Link>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className={`text-gray-500 py-1 px-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t("profile:communication")}
                    </td>
                    <td className={`text-gray-800 font-medium py-1 ${getRTLSpacing('pl-3', 'pr-3')} ${isRTL ? 'text-right' : 'text-left'}`}>
                      {userData?.phoneNumber && userData?.email
                        ? t("profile:communicationOptions.mobileEmail")
                        : userData?.email
                        ? t("profile:communicationOptions.email")
                        : userData?.phoneNumber
                        ? t("profile:communicationOptions.mobile")
                        : t("profile:communicationOptions.none")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={`md:w-1/2 ${isRTL ? 'md:flex md:justify-start' : 'md:flex md:justify-end'}`}>
              <div
                className="w-full border border-gray-200 rounded-lg p-4"
                style={{ maxWidth: "212px" }}
              >
                <CircleCheck className={`w-6 h-6 mb-2 text-green-500 ${isRTL ? 'ml-auto' : 'mr-auto'}`} />
                <h4 className={`text-lg font-medium mb-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t("profile:noBonuses")}
                </h4>
                <p className={`text-sm text-gray-500 mb-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t("profile:earnBonuses")}
                </p>
              </div>
            </div>
          </div>

          {!userData?.isProfileCompleted && (
            <div
              className={`rounded-xl bg-[#ecf2fa] border-l-4 border-[#9fbfe5] p-4 flex mb-0 ${
                isRTL ? ' border-l-0 border-r-4' : ''
              }`}
              role="alert"
            >
              <CircleAlert className={`text-[#3972b6] w-6 h-6 ${getRTLSpacing('mr-2', 'ml-2')}`} />
              <div className={getRTLSpacing('pl-2', 'pr-2')}>
                {t("profile:completeProfileAlert")}
                <Link
                  href="/test?tab=settings"
                  className="text-blue-600 font-medium ml-1"
                >
                  {t("profile:goToSettings")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Address Section */}
        <section className="bg-white rounded-xl shadow-sm h-full p-1 md:p-2 xl:p-3 2xl:p-4">
          <div className="p-4">
            <div className={`flex justify-between items-center mt-sm-n1 pb-4 mb-1 lg:mb-2 ${
              isRTL ? '' : ''
            }`}>
              <div className={`flex items-center ${isRTL ? '' : ''}`}>
                <MapPin className={`text-primary text-xl ${getRTLSpacing('mr-2', 'ml-2')}`} />
                <h2 className="text-lg font-medium mb-0">{t("profile:address")}</h2>
              </div>
              <Link href="/test?tab=settings">
                <Button className={`rounded-xl bg-gray-200 text-gray-700 text-sm hover:bg-gray-300 ${
                  isRTL ? '' : ''
                }`}>
                  <Edit className={`w-4 h-4 ${getRTLSpacing('mr-2', 'ml-2')}`} />
                  {t("profile:editInfo")}
                </Button>
              </Link>
            </div>

            <div className={`flex items-center pb-1 mb-2 ${isRTL ? '' : ''}`}>
              <h3 className={`text-sm font-semibold mb-0 ${getRTLSpacing('mr-3', 'ml-3')} ${isRTL ? 'text-right' : 'text-left'}`}>
                {t("profile:shippingAddress")}
              </h3>
              <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded">
                {t("profile:primary")}
              </span>
            </div>
            <p className={`mb-0 ${isRTL ? 'text-right' : 'text-left'}`}>
              {userData?.addressDetails || t("profile:noAddressProvided")}
              <br />
              {userData?.city?.[locale === "en" ? "name_en" : "name_ar"] ? `${userData.city[locale === "en" ? "name_en" : "name_ar"]},` : ""}
              {userData?.governorate?.[locale === "en" ? "name_en" : "name_ar"]
                ? ` ${userData.governorate[locale === "en" ? "name_en" : "name_ar"]}`
                : ""}
              <br />
              {userData?.country?.[locale === "en" ? "name_en" : "name_ar"] || (
                <Link
                  href="/test?tab=settings"
                  className="text-blue-600 hover:underline"
                >
                  {t("profile:addCountry")}
                </Link>
              )}
            </p>
          </div>
        </section>

        {/* Billing Section */}
        <section className="bg-white rounded-xl shadow-sm h-full p-1 md:p-2 xl:p-3 2xl:p-4">
          <div className="p-4">
            <div className={`flex justify-between items-center mt-sm-n1 pb-4 mb-1 lg:mb-2 ${
              isRTL ? '' : ''
            }`}>
              <div className={`flex items-center ${isRTL ? '' : ''}`}>
                <Wallet className={`text-primary text-xl ${getRTLSpacing('mr-2', 'ml-2')}`} />
                <h2 className="text-lg font-medium mb-0">{t("profile:billingTitle")}</h2>
              </div>
              <Link href="/test?tab=settings">
                <Button className={`flex items-center rounded-xl bg-gray-200 text-gray-700 text-sm hover:bg-gray-300 ${
                  isRTL ? '' : ''
                }`}>
                  <Edit className={`w-4 h-4 ${getRTLSpacing('mr-2', 'ml-2')}`} />
                  {t("profile:editInfo")}
                </Button>
              </Link>
            </div>

            <div className={`flex items-center pb-1 mb-2 ${isRTL ? '' : ''}`}>
              <h3 className={`text-sm font-semibold mb-0 ${getRTLSpacing('mr-3', 'ml-3')} ${isRTL ? 'text-right' : 'text-left'}`}>
                {userData?.fullName || t("profile:userName")}
              </h3>
              <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded">
                {t("profile:primary")}
              </span>
            </div>

            <div className={`flex items-center pb-4 mb-2 sm:mb-3 ${isRTL ? '' : ''}`}>
              {/* Visa logo SVG */}
              <svg
                width="52"
                height="42"
                viewBox="0 0 52 42"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <path
                  d="M22.6402 28.2865H18.5199L21.095 12.7244H25.2157L22.6402 28.2865ZM15.0536 12.7244L11.1255 23.4281L10.6607 21.1232L10.6611 21.124L9.27467 14.1256C9.27467 14.1256 9.10703 12.7244 7.32014 12.7244H0.8262L0.75 12.9879C0.75 12.9879 2.73586 13.3942 5.05996 14.7666L8.63967 28.2869H12.9327L19.488 12.7244H15.0536ZM47.4619 28.2865H51.2453L47.9466 12.7239H44.6345C43.105 12.7239 42.7324 13.8837 42.7324 13.8837L36.5873 28.2865H40.8825L41.7414 25.9749H46.9793L47.4619 28.2865ZM42.928 22.7817L45.093 16.9579L46.3109 22.7817H42.928ZM36.9095 16.4667L37.4975 13.1248C37.4975 13.1248 35.6831 12.4463 33.7916 12.4463C31.7469 12.4463 26.8913 13.3251 26.8913 17.5982C26.8913 21.6186 32.5902 21.6685 32.5902 23.7803C32.5902 25.8921 27.4785 25.5137 25.7915 24.182L25.1789 27.6763C25.1789 27.6763 27.0187 28.555 29.8296 28.555C32.6414 28.555 36.8832 27.1234 36.8832 23.2271C36.8832 19.1808 31.1331 18.8041 31.1331 17.0449C31.1335 15.2853 35.1463 15.5113 36.9095 16.4667Z"
                  fill="#2566AF"
                ></path>
                <path
                  d="M10.6611 22.1235L9.2747 15.1251C9.2747 15.1251 9.10705 13.7239 7.32016 13.7239H0.8262L0.75 13.9874C0.75 13.9874 3.87125 14.6235 6.86507 17.0066C9.72766 19.2845 10.6611 22.1235 10.6611 22.1235Z"
                  fill="#E6A540"
                ></path>
              </svg>

              <div className={`text-sm ${getRTLSpacing('pl-3', 'pr-3')}`}>
                <div className={`text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t(`profile:billingDetails.cardType.${billingInfo.cardType}`)} •••• {billingInfo.cardLastFour}
                </div>
                <div className={`text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t("profile:billingDetails.debit")} - {t("profile:billingDetails.expires")} {billingInfo.cardExpires}
                </div>
              </div>
            </div>

            {billingInfo.cardExpired && (
              <div className={`bg-red-50 border-l-4 border-red-500 p-4 flex mb-0 ${
                isRTL ? ' border-l-0 border-r-4' : ''
              }`}>
                <CircleAlert className={`text-red-500 w-6 h-6 ${getRTLSpacing('mr-2', 'ml-2')}`} />
                <p className="mb-0">
                  {t("profile:billingDetails.cardExpired", { expires: billingInfo.cardExpires })}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Competition Invitations Section */}
      {invitations.length > 0 && (
        <section className="bg-white rounded-xl shadow-sm p-1 md:p-2 xl:p-3 2xl:p-4 mb-4">
          <div className="p-4">
            <div className={`flex justify-between items-center mt-sm-n1 pb-4 mb-1 lg:mb-2 ${
              isRTL ? '' : ''
            }`}>
              <div className={`flex items-center ${isRTL ? '' : ''}`}>
                <Trophy className={`text-blue-500 text-xl ${getRTLSpacing('mr-2', 'ml-2')}`} />
                <h2 className="text-lg font-medium mb-0">{t("profile:competitionInvitations")}</h2>
                <Badge className={`bg-blue-500 text-white px-2 py-1 text-xs font-bold ${getRTLSpacing('ml-3', 'mr-3')}`}>
                  {invitations.length} {t("profile:newInvitations")}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 group hover:border-blue-300">
                  <div className={`flex items-center justify-between ${isRTL ? '' : ''}`}>
                    {/* Left side - Competition info */}
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center gap-3 mb-2 ${isRTL ? '' : ''}`}>
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-bold text-gray-900 truncate ${isRTL ? 'text-right' : 'text-left'}`}>
                            {invitation.competition?.[locale === "en" ? "nameEn" : "nameAr"] || invitation.competition?.nameEn || invitation.competition?.nameAr || t("profile:competition")}
                          </h3>
                          {invitation.competition?.nameAr && (
                            <p className={`text-xs text-gray-600 truncate ${isRTL ? 'text-right' : 'text-left'}`} dir="rtl">
                              {invitation.competition.nameAr}
                            </p>
                          )}
                        </div>
                        <Badge className={`${getStatusColor(invitation.status)} border flex items-center gap-1 text-xs flex-shrink-0 ${
                          isRTL ? '' : ''
                        }`}>
                          {getStatusIcon(invitation.status)}
                          {invitation.status}
                        </Badge>
                      </div>
                      
                      {/* Competition details */}
                      <div className={`flex items-center gap-4 text-xs text-gray-600 mb-3 ${isRTL ? '' : ''}`}>
                        {invitation.competition?.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-blue-500" />
                            <span>{formatDate(invitation.competition.date)}</span>
                          </div>
                        )}
                        {invitation.competition?.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-500" />
                            <span className="truncate max-w-32">{invitation.competition.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Invited by */}
                      <div className={`flex items-center gap-2 ${isRTL ? '' : ''}`}>
                        <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {invitation.invitedBy?.fullName?.charAt(0) || invitation.invitedBy?.userName?.charAt(0) || "U"}
                        </div>
                        <span className={`text-xs text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {t("profile:invitedBy")} <span className="font-medium text-gray-900">{invitation.invitedBy?.fullName || invitation.invitedBy?.userName || t("profile:unknownUser")}</span>
                        </span>
                      </div>
                    </div>

                    {/* Right side - Action button */}
                    <div className={`flex-shrink-0 ${getRTLSpacing('ml-4', 'mr-4')}`}>
                      <Button 
                        onClick={() => handleJoinCompetition(invitation.inviteLink)}
                        className={`bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 ${
                          isRTL ? '' : ''
                        }`}
                      >
                        <Trophy className="w-3 h-3" />
                        <span className={getRTLSpacing('mr-1', 'ml-1')}>{t("profile:joinCompetition")}</span>
                        <ArrowRight className={`w-3 h-3 ${getRTLSpacing('ml-1', 'mr-1')} ${isRTL ? 'rotate-180' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Invitations State */}
      {!loadingInvitations && invitations.length === 0 && (
        <section className="bg-white rounded-xl shadow-sm p-1 md:p-2 xl:p-3 2xl:p-4 mb-4">
          <div className="p-4">
            <div className={`flex justify-between items-center mt-sm-n1 pb-4 mb-1 lg:mb-2 ${
              isRTL ? '' : ''
            }`}>
              <div className={`flex items-center ${isRTL ? '' : ''}`}>
                <Trophy className={`text-blue-500 text-xl ${getRTLSpacing('mr-2', 'ml-2')}`} />
                <h2 className="text-lg font-medium mb-0">{t("profile:competitionInvitations")}</h2>
              </div>
            </div>

            <Card className="bg-white border-2 border-dashed border-gray-300">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className={`text-lg font-bold text-gray-900 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t("profile:noInvitationsYet")}
                </h3>
                <p className={`text-gray-600 mb-4 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t("profile:noInvitationsDescription")}
                </p>
                <Button 
                  onClick={() => router.push('/competitions')}
                  className={`bg-blue-500 hover:bg-blue-600 text-white text-sm ${
                    isRTL ? '' : ''
                  }`}
                >
                  <Eye className={`w-4 h-4 ${getRTLSpacing('mr-2', 'ml-2')}`} />
                  {t("profile:browseCompetitions")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Loading State for Invitations */}
      {loadingInvitations && (
        <section className="bg-white rounded-xl shadow-sm p-1 md:p-2 xl:p-3 2xl:p-4 mb-4">
          <div className="p-4">
            <div className={`flex justify-between items-center mt-sm-n1 pb-4 mb-1 lg:mb-2 ${
              isRTL ? '' : ''
            }`}>
              <div className={`flex items-center ${isRTL ? '' : ''}`}>
                <Trophy className={`text-blue-500 text-xl ${getRTLSpacing('mr-2', 'ml-2')}`} />
                <h2 className="text-lg font-medium mb-0">{t("profile:competitionInvitations")}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Overview;