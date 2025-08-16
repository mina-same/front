"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Trophy,
  Check,
  X,
  AlertCircle,
  Clock,
  Users, 
  ArrowRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Layout from "components/layout/Layout";
import Preloader from "components/elements/Preloader";
import { useTranslation } from "react-i18next";

const InvitationPage = () => {
  const { inviteCode, locale } = useParams();
  const router = useRouter();
  const { t, i18n } = useTranslation("invitations");
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [horseName, setHorseName] = useState("");
  const [surpriseHorseName, setSurpriseHorseName] = useState("");
  const [selectedHorse, setSelectedHorse] = useState('normal');
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isRTL = (locale || i18n.language) === 'ar';

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInvitation();
    }
  }, [isAuthenticated, inviteCode, fetchInvitation]);

  const verifyAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        setCurrentUserId(data.user.id);
        setIsAuthenticated(true);
      } else {
        // User is not authenticated, but we can still show the invitation
        // They'll need to log in to accept it
        fetchInvitation();
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      // Still try to fetch invitation even if auth fails
      fetchInvitation();
    }
  }, [fetchInvitation]);

  const fetchInvitation = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invitations/${inviteCode}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch invitation');
      }

      const data = await response.json();
      
      if (data.invitation) {
        setInvitation(data.invitation);
      } else {
        setError('Invitation not found or has expired');
      }
    } catch (error) {
      console.error('Error fetching invitation:', error);
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  }, [inviteCode]);

  const handleAccept = async () => {
    if (!horseName.trim() || !surpriseHorseName.trim()) {
      toast({
        title: t('toasts.bothHorsesRequiredTitle'),
        description: t('toasts.bothHorsesRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    if (selectedHorse === 'normal' && !horseName.trim()) {
      toast({
        title: t('toasts.normalHorseRequiredTitle'),
        description: t('toasts.normalHorseRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    if (selectedHorse === 'surprise' && !surpriseHorseName.trim()) {
      toast({
        title: t('toasts.surpriseHorseRequiredTitle'),
        description: t('toasts.surpriseHorseRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: t('toasts.loginRequiredTitle'),
        description: t('toasts.loginRequiredDescAccept'),
        variant: "destructive",
      });
      router.push(`/${locale || i18n.language}/login`);
      return;
    }

    try {
      setAccepting(true);

      const response = await fetch(`/api/invitations/${inviteCode}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'accepted',
          horseName: selectedHorse === 'normal' ? horseName.trim() : surpriseHorseName.trim(),
          surpriseHorseName: selectedHorse === 'normal' ? surpriseHorseName.trim() : horseName.trim(),
          selectedHorse: selectedHorse,
          userId: currentUserId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept invitation');
      }

      const data = await response.json();
      
      toast({
        title: t('toasts.acceptedTitle'),
        description: t('toasts.acceptedDesc'),
      });

      // Redirect to the competition page
      router.push(`/${locale || i18n.language}/competitions/${invitation.competition._id}`);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: t('toasts.acceptErrorTitle'),
        description: t('toasts.acceptErrorDesc'),
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!isAuthenticated) {
      toast({
        title: t('toasts.loginRequiredTitle'),
        description: t('toasts.loginRequiredDescDecline'),
        variant: "destructive",
      });
      router.push(`/${locale || i18n.language}/login`);
      return;
    }

    try {
      setAccepting(true);
      
      const response = await fetch(`/api/invitations/${inviteCode}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'declined',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to decline invitation');
      }

      toast({
        title: t('toasts.declinedTitle'),
        description: t('toasts.declinedDesc'),
      });

      router.push(`/${locale || i18n.language}/competitions`);
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast({
        title: t('toasts.declineErrorTitle'),
        description: t('toasts.declineErrorDesc'),
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Preloader />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto">
              <Card className="bg-white border-red-200 shadow-xl">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <CardTitle className="text-red-900">{t('notFoundTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Button
                    onClick={() => router.push(`/${locale || i18n.language}/competitions`)}
                    className="w-full bg-gray-900 hover:bg-black text-white"
                  >
                    {isRTL ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
                    {t('backToCompetitions')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!invitation) {
    return null;
  }

  const competition = invitation.competition;
  const isExpired = new Date(competition.date) < new Date();
  const isAlreadyResponded = invitation.status !== 'pending';
  const canAccept = !isExpired && !isAlreadyResponded && isAuthenticated && 
                   horseName.trim() && surpriseHorseName.trim() && selectedHorse;

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white border-gray-200 shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full">
                  <Trophy className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-gray-900 text-2xl">
                  {t('title')}
                </CardTitle>
                <p className="text-gray-600">
                  {t('subtitle')}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Competition Details */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  {(() => {
                    const mainName = isRTL ? (competition.nameAr || competition.nameEn) : (competition.nameEn || competition.nameAr);
                    const subName = isRTL ? (competition.nameEn || '') : (competition.nameAr || '');
                    return (
                      <>
                        <h3 className={`text-gray-900 font-bold text-xl mb-2 ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                          {mainName}
                        </h3>
                        {subName ? (
                          <p className={`text-gray-600 text-sm mb-4 ${isRTL ? '' : ''}`} dir={isRTL ? 'ltr' : 'rtl'}>
                            {subName}
                          </p>
                        ) : null}
                      </>
                    );
                  })()}
                  
                  <div className="space-y-3">
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">
                        {new Date(competition.date).toLocaleDateString(locale || i18n.language)} {t('dateAt')} {new Date(competition.date).toLocaleTimeString(locale || i18n.language)}
                      </span>
                    </div>
                    
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">{competition.location}</span>
                    </div>
                    
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">
                        {t('organizedBy', { name: invitation.invitedBy?.fullName || invitation.invitedBy?.userName })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Badge 
                      className={`${
                        competition.status === 'active' 
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                      }`}
                    >
                      {competition.status === 'active' ? t('status.active') : t('status.draft')}
                    </Badge>
                  </div>
                </div>

                {/* Status Messages */}
                {isExpired && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-700">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">{t('ended')}</span>
                    </div>
                  </div>
                )}

                {isAlreadyResponded && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">
                        {t('alreadyResponded', { status: t(`responded.${invitation.status}`) })}
                      </span>
                    </div>
                  </div>
                )}

                {!isAuthenticated && !isAlreadyResponded && !isExpired && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">{t('loginToRespond')}</span>
                    </div>
                  </div>
                )}

                {/* Action Section */}
                {!isExpired && !isAlreadyResponded && isAuthenticated && (
                  <div className="space-y-4">
                    {/* Horse Selection Section */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className={`font-semibold text-gray-900 mb-3 ${isRTL ? 'text-right' : ''}`}>
                        🐴 {t('horseSelection.title')}
                      </h4>
                      <p className={`text-gray-700 text-sm mb-4 ${isRTL ? 'text-right' : ''}`}>
                        {t('horseSelection.description')}
                      </p>
                      
                      {/* Normal Horse */}
                      <div className="mb-3">
                        <Label className={`text-gray-900 mb-2 block ${isRTL ? 'text-right' : ''}`}>
                          {t('horseSelection.normalHorse')} *
                        </Label>
                        <Input
                          value={horseName}
                          onChange={(e) => setHorseName(e.target.value)}
                          placeholder={t('horseSelection.normalHorsePlaceholder')}
                          className={`bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 ${isRTL ? 'text-right' : ''}`}
                          dir={isRTL ? 'rtl' : 'ltr'}
                        />
                      </div>

                      {/* Surprise Horse */}
                      <div className="mb-3">
                        <Label className={`text-gray-900 mb-2 block ${isRTL ? 'text-right' : ''}`}>
                          {t('horseSelection.surpriseHorse')} *
                        </Label>
                        <Input
                          value={surpriseHorseName}
                          onChange={(e) => setSurpriseHorseName(e.target.value)}
                          placeholder={t('horseSelection.surpriseHorsePlaceholder')}
                          className={`bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 ${isRTL ? 'text-right' : ''}`}
                          dir={isRTL ? 'rtl' : 'ltr'}
                        />
                      </div>

                      {/* Horse Choice Selection */}
                      <div className="mb-3">
                        <Label className={`text-gray-900 mb-2 block ${isRTL ? 'text-right' : ''}`}>
                          {t('horseSelection.chooseHorse')} *
                        </Label>
                        <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Button
                            type="button"
                            variant={selectedHorse === 'normal' ? 'default' : 'outline'}
                            onClick={() => setSelectedHorse('normal')}
                            className={`flex-1 ${selectedHorse === 'normal' ? 'bg-black text-white hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                          >
                            {selectedHorse === 'normal' && <Check className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />}
                            {t('horseSelection.normalHorse')}
                          </Button>
                          <Button
                            type="button"
                            variant={selectedHorse === 'surprise' ? 'default' : 'outline'}
                            onClick={() => setSelectedHorse('surprise')}
                            className={`flex-1 ${selectedHorse === 'surprise' ? 'bg-black text-white hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                          >
                            {selectedHorse === 'surprise' && <Check className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />}
                            {t('horseSelection.surpriseHorse')}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleAccept}
                        disabled={accepting || !canAccept}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {accepting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Check className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        )}
                        {t('accept')}
                      </Button>
                      
                      <Button
                        onClick={handleDecline}
                        disabled={accepting}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <X className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('decline')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Login Button for unauthenticated users */}
                {!isAuthenticated && !isAlreadyResponded && !isExpired && (
                  <div className="space-y-4">
                    <Button
                      onClick={() => router.push(`/${locale || i18n.language}/login`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {t('loginCta')}
                    </Button>
                  </div>
                )}

                {/* Navigation */}
                <div className="text-center pt-4">
                  <Button
                    onClick={() => router.push(`/${locale || i18n.language}/competitions`)}
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {isRTL ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
                    {t('backToCompetitions')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvitationPage; 