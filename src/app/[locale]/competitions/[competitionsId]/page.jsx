"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Share2,
  MapPin,
  Video,
  Calendar,
  Users,
  Trophy,
  Flame,
  Zap,
  Crown,
  Star,
  Sparkles,
  Shield,
  Swords,
  Target,
  Award,
  Timer,
  Eye,
  Volume2,
  Play,
  Gift,
  Medal,
  Diamond,
  Coins,
  Heart,
  X,
  Send,
  ArrowRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Layout from "components/layout/Layout";
import Preloader from "components/elements/Preloader";

const EnhancedCompetitionPage = () => {
  const { competitionsId: id, locale } = useParams();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [viewerCount, setViewerCount] = useState(1847);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedGift, setSelectedGift] = useState(null);
  const [battleIntensity, setBattleIntensity] = useState(75);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [competition, setCompetition] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [sendingGift, setSendingGift] = useState(false);
  const [editHorseModal, setEditHorseModal] = useState({ open: false, competitorId: null, surpriseHorseName: '', activeHorse: 'main' });

  // Fetch competition data
  useEffect(() => {
    fetchCompetitionData();
  }, [id]);

  const fetchCompetitionData = async () => {
    try {
      setLoading(true);
      
      // First, get the authenticated user
      const authResponse = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!authResponse.ok) {
        toast({
          title: "Authentication Required! 🔐",
          description: "Please log in to view competitions.",
          variant: "destructive",
        });
        router.push('/login');
        return;
      }

      const authData = await authResponse.json();
      if (!authData.authenticated) {
        toast({
          title: "Authentication Required! 🔐",
          description: "Please log in to view competitions.",
          variant: "destructive",
        });
        router.push('/login');
        return;
      }

      setCurrentUserId(authData.user.id);
      
      // Fetch competition details
      const competitionResponse = await fetch(`/api/competitions/${id}`);
      if (!competitionResponse.ok) {
        throw new Error('Competition not found');
      }
      const competitionData = await competitionResponse.json();
      setCompetition(competitionData.competition);

      // Fetch competitors for this competition
      const competitorsResponse = await fetch(`/api/competitors?competitionId=${id}`);
      if (competitorsResponse.ok) {
        const competitorsData = await competitorsResponse.json();

        // Fetch gift givers for each competitor
        const competitorsWithGiftGivers = await Promise.all(
          (competitorsData.competitors || []).map(async (competitor) => {
            try {
              // Fetch gift givers for this competitor
              const giftGiversResponse = await fetch(`/api/competitors/${competitor.id}/gift-givers`);
              if (giftGiversResponse.ok) {
                const giftGiversData = await giftGiversResponse.json();
                return {
                  ...competitor,
                  giftGivers: giftGiversData.giftGivers || [],
                  topGiftGiver: giftGiversData.topGiftGiver || null
                };
              }
              return competitor;
            } catch (error) {
              console.error(`Error fetching gift givers for competitor ${competitor.id}:`, error);
              return competitor;
            }
          })
        );
        
        setCompetitors(competitorsWithGiftGivers);
      }

      // Fetch user balance using the authenticated user ID
      const balanceResponse = await fetch(`/api/user/balance?userId=${authData.user.id}`);
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setUserPoints(balanceData.balance || 0);
      }

      // Calculate countdown
      if (competitionData.competition?.date) {
        calculateCountdown(competitionData.competition.date);
      }
    } catch (error) {
      console.error('Error fetching competition data:', error);
      toast({
        title: "Error! ❌",
        description: "Failed to load competition data.",
        variant: "destructive",
      });
      router.push('/competitions');
    } finally {
      setLoading(false);
    }
  };
  const canEditParticipants = () => {
    if (!competition?.date || !currentUserId) return false;
    const startsAt = new Date(competition.date);
    return new Date() < startsAt;
  };

  const openEditHorse = (competitor) => {
    setEditHorseModal({ 
      open: true, 
      competitorId: competitor.id, 
      surpriseHorseName: competitor.surpriseHorseName || '', 
      activeHorse: competitor.activeHorse || 'main' 
    });
  };

  const submitEditHorse = async () => {
    try {
      const { competitorId, surpriseHorseName, activeHorse } = editHorseModal;
      const resp = await fetch('/api/competitors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitorId, surpriseHorseName, activeHorse })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to update');
      toast({ title: 'Updated ✅', description: 'Horse selection saved.' });
      setEditHorseModal({ open: false, competitorId: null, surpriseHorseName: '', activeHorse: 'main' });
      // Refresh competitors
      const refreshed = await fetch(`/api/competitors?competitionId=${id}`);
      if (refreshed.ok) {
        const cdata = await refreshed.json();
        setCompetitors(cdata.competitors || []);
      }
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const calculateCountdown = (competitionDate) => {
    const now = new Date();
    const targetDate = new Date(competitionDate);
    const timeDifference = targetDate.getTime() - now.getTime();

    if (timeDifference > 0) {
      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  };

  const giftTypes = [
    {
      type: "flower",
      icon: "🌸",
      cost: 5,
      rarity: "common",
      name: "Rose Petals",
    },
    {
      type: "heart",
      icon: "💝",
      cost: 10,
      rarity: "common",
      name: "Love Heart",
    },
    {
      type: "bronze",
      icon: "🥉",
      cost: 25,
      rarity: "uncommon",
      name: "Bronze Medal",
    },
    {
      type: "silver",
      icon: "🥈",
      cost: 50,
      rarity: "rare",
      name: "Silver Crown",
    },
    {
      type: "gold",
      icon: "🥇",
      cost: 100,
      rarity: "epic",
      name: "Golden Trophy",
    },
    {
      type: "unicorn",
      icon: "🦄",
      cost: 500,
      rarity: "legendary",
      name: "Mystical Unicorn",
    },
    {
      type: "diamond",
      icon: "💎",
      cost: 1000,
      rarity: "mythic",
      name: "Royal Diamond",
    },
  ];

  // Enhanced animations and effects
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return {
            ...prev,
            days: prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const viewerTimer = setInterval(() => {
      setViewerCount((prev) =>
        Math.max(1000, prev + Math.floor(Math.random() * 20) - 10)
      );
    }, 3000);

    return () => clearInterval(viewerTimer);
  }, []);

  useEffect(() => {
    const intensityTimer = setInterval(() => {
      setBattleIntensity((prev) =>
        Math.max(50, Math.min(100, prev + Math.floor(Math.random() * 10) - 5))
      );
    }, 2000);

    return () => clearInterval(intensityTimer);
  }, []);

  const getRarityColor = (rarity) => {
    const colors = {
      common: "from-slate-100 via-gray-100 to-slate-200",
      uncommon: "from-emerald-100 via-green-100 to-emerald-200",
      rare: "from-blue-100 via-cyan-100 to-blue-200",
      epic: "from-purple-100 via-violet-100 to-purple-200",
      legendary: "from-amber-100 via-orange-100 to-yellow-200",
      mythic: "from-pink-100 via-rose-100 to-pink-200",
    };
    return colors[rarity] || colors.common;
  };

  const getRarityBorder = (rarity) => {
    const borders = {
      common: "border-gray-300",
      uncommon: "border-emerald-400",
      rare: "border-blue-400",
      epic: "border-purple-400",
      legendary: "border-amber-400",
      mythic: "border-pink-400",
    };
    return borders[rarity] || borders.common;
  };

  const shareCompetition = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied! 🔗",
      description: "Share this epic battle with your friends!",
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCompetitionStatus = () => {
    if (!competition?.date) return "upcoming";
    
    const now = new Date();
    const competitionDate = new Date(competition.date);
    const isLive = competitionDate <= now && competitionDate.getTime() + (2 * 60 * 60 * 1000) >= now;
    const isUpcoming = competitionDate > now;
    
    if (isLive) return "live";
    if (isUpcoming) return "upcoming";
    return "ended";
  };

  const refreshUserBalance = async () => {
    if (!currentUserId) return;
    
    try {
      const balanceResponse = await fetch(`/api/user/balance?userId=${currentUserId}`);
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setUserPoints(balanceData.balance || 0);
      }
    } catch (error) {
      console.error('Error refreshing user balance:', error);
    }
  };

  const handleSendGift = async (competitorId, giftType) => {
    console.log('🎁 Starting gift sending process...');
    console.log('Competitor ID:', competitorId);
    console.log('Gift Type:', giftType);
    console.log('Current User ID:', currentUserId);
    console.log('Current Balance:', userPoints);
    
    try {
      setSendingGift(true);
      
      // Check if competition has ended
      const competitionStatus = getCompetitionStatus();
      if (competitionStatus === "ended") {
        console.log('❌ Competition has ended, cannot send gifts');
        toast({
          title: "Competition Ended! ⏱️",
          description: "You cannot send gifts after the competition has ended.",
          variant: "destructive",
        });
        return;
      }
      
      const gift = giftTypes.find((g) => g.type === giftType);
      if (!gift) {
        console.error('❌ Gift not found:', giftType);
        return;
      }

      console.log('🎁 Found gift:', gift);

      if (userPoints < gift.cost) {
        console.log('❌ Insufficient balance');
        toast({
          title: "Not enough balance! 💔",
          description: `You need ${gift.cost} coins to send this gift. You have ${userPoints} coins.`,
          variant: "destructive",
          action: (
            <Button 
              onClick={() => router.push('/balance')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              Charge Balance
            </Button>
          ),
        });
        return;
      }

      console.log('💰 Balance check passed, sending gift...');

      // IMMEDIATE OPTIMISTIC UPDATE - Update UI immediately
      const newBalance = userPoints - gift.cost;
      setUserPoints(newBalance);
      
      // Show immediate success message
      const competitorName = competitors.find((c) => c.id === competitorId)?.horseName || 'Competitor';
      toast({
        title: `${gift.icon} Gift Sent Successfully! 🎉`,
        description: `Your ${gift.name} has been sent to ${competitorName}! Your balance has been updated.`,
      });

      // Get current user profile info
      const userProfileResponse = await fetch(`/api/user/profile?userId=${currentUserId}`);
      let userProfile = {};
      
      if (userProfileResponse.ok) {
        const profileData = await userProfileResponse.json();
        userProfile = profileData.profile || {};
      }

      // Send gift to API in background
      const requestBody = {
        competitorId,
        giftType: gift.type,
        giftIcon: gift.icon,
        giftCost: gift.cost,
        giftedByUserId: currentUserId,
        giftedByName: userProfile.name || 'Anonymous',
        giftedByProfileImage: userProfile.profileImage || ''
      };

      console.log('📤 Sending request to API:', requestBody);

      const response = await fetch('/api/competitors/send-gift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      const result = await response.json();
      console.log('📥 Response data:', result);

      if (!response.ok) {
        console.error('❌ API request failed:', result);
        
        // Revert optimistic update on failure
        setUserPoints(userPoints);
        
        if (result.error === "Insufficient balance") {
          toast({
            title: "Transaction Failed! 💔",
            description: `You need ${result.requiredAmount} coins but only have ${result.currentBalance}. Your balance has been restored.`,
            variant: "destructive",
            action: (
              <Button 
                onClick={() => router.push('/balance')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                Charge Balance
              </Button>
            ),
          });
        } else {
          toast({
            title: "Transaction Failed! ❌",
            description: "Failed to send gift. Your balance has been restored. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      if (result.success) {
        console.log('✅ Gift sent successfully!');
        console.log('New balance:', result.newBalance);
        
        // Show success message about gift appearing
        toast({
          title: `${gift.icon} Gift Processing! ⏳`,
          description: `Your gift is being processed by the system. It will appear on ${competitorName}'s profile in a few seconds.`,
        });

        // Wait 3 seconds then refresh to show the gift
        setTimeout(() => {
          console.log('🔄 Refreshing page to show updated gifts...');
          toast({
            title: "🔄 Refreshing...",
            description: "Updating the page to show your gift!",
          });
          window.location.reload();
        }, 3000);
        
        console.log('🎉 Gift sending process completed successfully!');
      } else {
        console.error('❌ Gift sending failed:', result);
        // Revert optimistic update on failure
        setUserPoints(userPoints);
        throw new Error(result.error || 'Failed to send gift');
      }

    } catch (error) {
      console.error('❌ Error sending gift:', error);
      // Revert optimistic update on error
      setUserPoints(userPoints);
      toast({
        title: "Error! ❌",
        description: "Failed to send gift. Your balance has been restored. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingGift(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Preloader />
      </Layout>
    );
  }

  if (!competition) {
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏇</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Competition Not Found</h3>
            <p className="text-gray-600 mb-6">The competition you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/competitions')}>
              Back to Competitions
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const leader = competitors.find((c) => c.rank === 1);
  const challenger = competitors.find((c) => c.rank === 2);
  const competitionStatus = getCompetitionStatus();

  return (
    <Layout>
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Gaming-style animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.3)_0%,transparent_50%)]"></div>
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.3)_0%,transparent_50%)]"></div>
            <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.3)_0%,transparent_50%)]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(251,146,60,0.3)_0%,transparent_50%)]"></div>
          </div>
          {showParticles && (
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30 animate-float`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${3 + Math.random() * 4}s`,
                  }}
                />
              ))}
            </div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-12">
          {/* EPIC Competition Header */}
          <div className="mb-20">
            <div className="relative z-10 text-center space-y-12">
              {/* Simple Title Section */}
              <div className="space-y-6">
                <div className="relative inline-block">
                  {/* Main Title */}
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {competition.nameEn}
                  </h1>
                  
                  {/* Simple Underline */}
                  <div className="mt-3 w-24 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto"></div>
                </div>
                
                {/* Arabic Title */}
                <div>
                  <p className="text-gray-600 font-medium text-lg md:text-xl" dir="rtl">
                    {competition.nameAr}
                  </p>
                </div>
              </div>

              {/* EPIC Stats and Actions */}
              <div className="relative">
                {/* Floating Background Card */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-gray-50/10 to-white/10 backdrop-blur-3xl rounded-3xl border border-white/20 shadow-2xl -z-10"></div>
                
                <div className="flex flex-col lg:flex-row items-center justify-center gap-6 p-8">
                  {/* EPIC Coin Balance */}
                  <div className="group relative w-full lg:w-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500 scale-110"></div>
                    <div className="relative bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 backdrop-blur-xl rounded-2xl px-8 py-6 border-2 border-amber-300/50 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 min-w-[280px] h-[180px] flex flex-col justify-between">
                      <div className="flex items-center justify-center gap-4">
                        <div className="relative">
                          <Coins className="w-8 h-8 text-amber-600 animate-spin" style={{animationDuration: '3s'}} />
                          <div className="absolute inset-0 bg-amber-400 rounded-full blur-lg opacity-40 animate-pulse"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-amber-700 text-sm font-medium mb-1">Your Balance</p>
                          <p className="text-amber-800 text-2xl font-black drop-shadow-lg">
                            {userPoints.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {/* Charge Balance Button */}
                      <div>
                        <Button
                          onClick={() => router.push('/balance')}
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <Coins className="w-4 h-4 mr-2" />
                          Charge Balance
                        </Button>
                      </div>
                      {/* Sparkle Effect */}
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                    </div>
                  </div>

                  {/* EPIC Live Status */}
                  <div className="group relative w-full lg:w-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-pink-500 to-red-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500 scale-110"></div>
                    <div className="relative bg-gradient-to-r from-red-50 via-pink-50 to-red-50 backdrop-blur-xl rounded-2xl px-8 py-6 border-2 border-red-300/50 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 min-w-[280px] h-[180px] flex flex-col justify-center">
                      <div className="flex items-center justify-center gap-4">
                        <div className="relative">
                          <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50 flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-full"></div>
                          </div>
                          <div className="absolute inset-0 w-8 h-8 bg-red-400 rounded-full animate-ping"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-red-700 text-sm font-medium mb-1">Live Status</p>
                          <p className="text-red-800 text-2xl font-black drop-shadow-lg">
                            {viewerCount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {/* Sparkle Effect */}
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                    </div>
                  </div>

                  {/* EPIC Share Button */}
                  <div className="group relative w-full lg:w-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500 scale-110"></div>
                    <div className="relative bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 backdrop-blur-xl rounded-2xl px-8 py-6 border-2 border-blue-300/50 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 min-w-[280px] h-[180px] flex flex-col justify-center cursor-pointer">
                      <div className="flex items-center justify-center gap-4" onClick={shareCompetition}>
                        <div className="relative">
                          <Share2 className="w-8 h-8 text-blue-600 animate-pulse" />
                          <div className="absolute inset-0 bg-blue-400 rounded-full blur-lg opacity-40 animate-pulse"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-blue-700 text-sm font-medium mb-1">Share Battle</p>
                          <p className="text-blue-800 text-2xl font-black drop-shadow-lg">
                            Share
                          </p>
                        </div>
                      </div>
                      {/* Sparkle Effect */}
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-white/70 backdrop-blur-xl border border-gray-200/50 mb-12 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/30 to-pink-50/30"></div>
            <CardContent className="p-10 relative z-10">
              <div className="text-center space-y-10">
                <div className="flex justify-center">
                  <div className="relative">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-8 py-3 text-lg font-black shadow-xl">
                      <Swords className="w-6 h-6 mr-2 animate-pulse" />
                      {competitionStatus === "upcoming"
                        ? "BATTLE PREPARATIONS"
                        : competitionStatus === "live"
                        ? "BATTLE IN PROGRESS"
                        : "BATTLE ENDED"}
                      <Flame className="w-6 h-6 ml-2 text-orange-300" />
                    </Badge>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  </div>
                </div>
                {competitionStatus === "upcoming" && (
                  <div className="space-y-8">
                    <div className="relative">
                      <h2 className="text-6xl font-black text-gray-900 drop-shadow-lg">
                        BATTLE COUNTDOWN
                      </h2>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 blur-3xl opacity-20 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-4 gap-8 max-w-4xl mx-auto">
                      {[
                        {
                          label: "DAYS",
                          value: timeLeft.days,
                          color: "from-red-500 to-pink-600",
                          icon: Calendar,
                        },
                        {
                          label: "HOURS",
                          value: timeLeft.hours,
                          color: "from-orange-500 to-red-500",
                          icon: Timer,
                        },
                        {
                          label: "MINUTES",
                          value: timeLeft.minutes,
                          color: "from-amber-500 to-orange-500",
                          icon: Target,
                        },
                        {
                          label: "SECONDS",
                          value: timeLeft.seconds,
                          color: "from-yellow-500 to-amber-500",
                          icon: Zap,
                        },
                      ].map(({ label, value, color, icon: Icon }) => (
                        <div key={label} className="relative group">
                          <div
                            className={`bg-gradient-to-br ${color} p-8 rounded-3xl shadow-2xl transform group-hover:scale-110 transition-all duration-300 border-2 border-white/30 relative overflow-hidden`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <div className="text-center space-y-2 relative z-10">
                              <Icon className="w-8 h-8 text-white mx-auto mb-2 drop-shadow-lg" />
                              <div className="text-5xl font-black text-white drop-shadow-2xl">
                                {value.toString().padStart(2, "0")}
                              </div>
                              <div className="text-white/90 text-sm font-black uppercase tracking-widest">
                                {label}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${color} rounded-3xl blur-2xl opacity-30 -z-10 group-hover:opacity-50 transition-opacity duration-300`}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <MapPin className="w-6 h-6 text-blue-500" />
                    <div className="text-left">
                      <div className="text-sm text-gray-500 font-medium">
                        Location
                      </div>
                      <div className="text-gray-900 font-bold">
                        <Link href={`/${locale}/location`} className="hover:text-blue-600 hover:underline transition-colors duration-200">
                          Go to the location
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <Calendar className="w-6 h-6 text-purple-500" />
                    <div className="text-left">
                      <div className="text-sm text-gray-500 font-medium">
                        Date & Time
                      </div>
                      <div className="text-gray-900 font-bold">
                        {competition.date ? formatDate(competition.date) : "TBD"}
                      </div>
                    </div>
                  </div>
                  {competition.liveLink && (
                    <div className="flex items-center justify-center">
                      <Button 
                        onClick={() => window.open(competition.liveLink, '_blank')}
                        className="relative bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold px-8 py-3 rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 group overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <span className="relative flex items-center justify-center">
                          <Play className="w-5 h-5 mr-2" />
                          Watch Live Stream
                        </span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-12">
            <div className="text-center mb-16 space-y-8">
              <div className="relative">
                <h2 className="text-8xl font-black text-gray-900 drop-shadow-2xl">
                  <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                    BATTLE ARENA
                  </span>
                </h2>
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 blur-3xl opacity-20 animate-pulse"></div>
              </div>
              <p className="text-2xl text-gray-700 font-bold">
                Choose your champion and fuel their victory with epic gifts!
              </p>
            </div>

            {competitors.length > 0 ? (
              <div className="relative">
                {competitionStatus === "ended" && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-center">
                    <div className="flex items-center justify-center gap-2 font-medium">
                      <Timer className="w-5 h-5" />
                      <span>Competition has ended. Gift sending is disabled.</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-center gap-16 md:gap-32">
                  <CompetitorProfile
                    competitor={challenger}
                    giftTypes={giftTypes}
                    onSendGift={setSelectedGift}
                    getRarityColor={getRarityColor}
                    competitionStatus={competitionStatus}
                    onEditHorse={canEditParticipants() ? openEditHorse : undefined}
                    isAnimated={true}
                    showGiftGrid={true}
                    compact={false}
                  />
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 rounded-full blur-3xl opacity-40 animate-pulse scale-150"></div>
                      <div className="relative bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full w-32 h-32 flex items-center justify-center shadow-2xl border-4 border-white/20 animate-pulse">
                        <span className="text-white font-black text-4xl drop-shadow-2xl">
                          VS
                        </span>
                      </div>
                      <div
                        className="absolute inset-0 border-4 border-amber-300/30 rounded-full animate-spin"
                        style={{ animationDuration: "8s" }}
                      ></div>
                    </div>
                  </div>
                  <CompetitorProfile
                    competitor={leader}
                    giftTypes={giftTypes}
                    onSendGift={setSelectedGift}
                    getRarityColor={getRarityColor}
                    competitionStatus={competitionStatus}
                    onEditHorse={canEditParticipants() ? openEditHorse : undefined}
                    isAnimated={true}
                    showGiftGrid={true}
                    compact={false}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏇</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Competitors Yet</h3>
                <p className="text-gray-600 mb-6">Be the first to join this epic battle!</p>
                <Button 
                  onClick={() => router.push(`/join/${id}`)}
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold px-8 py-3 rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-300"
                >
                  Join Battle
                </Button>
              </div>
            )}
          </div>

          {selectedGift && (
            <GiftSelectionModal
              selectedCompetitor={competitors.find((c) => c.id === selectedGift)}
              giftTypes={giftTypes}
              userPoints={userPoints}
              onSendGift={handleSendGift}
              onClose={() => setSelectedGift(null)}
              getRarityColor={getRarityColor}
              sendingGift={sendingGift}
            />
          )}

          {/* Edit Horse Modal */}
          {editHorseModal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40" onClick={() => setEditHorseModal({ open: false, competitorId: null, surpriseHorseName: '', activeHorse: 'main' })}></div>
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold mb-4">Edit Horse Selection</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Surprise Horse Name</label>
                    <input
                      className="w-full border rounded-xl px-3 py-2"
                      value={editHorseModal.surpriseHorseName}
                      onChange={(e) => setEditHorseModal((s) => ({ ...s, surpriseHorseName: e.target.value }))}
                      placeholder="Optional backup horse"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Active Horse</label>
                    <select
                      className="w-full border rounded-xl px-3 py-2 bg-white"
                      value={editHorseModal.activeHorse}
                      onChange={(e) => setEditHorseModal((s) => ({ ...s, activeHorse: e.target.value }))}
                    >
                      <option value="main">Main Horse</option>
                      <option value="surprise">Surprise Horse</option>
                    </select>
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <Button variant="outline" onClick={() => setEditHorseModal({ open: false, competitorId: null, surpriseHorseName: '', activeHorse: 'main' })}>Cancel</Button>
                    <Button onClick={submitEditHorse} className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">Save</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {editHorseModal.open && (
            <EditHorseModal
              state={editHorseModal}
              onChange={setEditHorseModal}
              onClose={() => setEditHorseModal({ open: false, competitorId: null, surpriseHorseName: '', activeHorse: 'main' })}
              onSubmit={submitEditHorse}
            />
          )}
        </div>

        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-30px) rotate(180deg);
            }
          }
          @keyframes scale-in {
            0% {
              transform: scale(0.8) rotate(-5deg);
              opacity: 0;
            }
            100% {
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
          }
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          @keyframes epic-glow {
            0%, 100% {
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
            }
            50% {
              box-shadow: 0 0 40px rgba(147, 51, 234, 0.8);
            }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
          .animate-epic-glow {
            animation: epic-glow 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    </Layout>
  );
};

const GiftSelectionModal = ({
  selectedCompetitor,
  giftTypes,
  userPoints,
  onSendGift,
  onClose,
  getRarityColor,
  sendingGift,
}) => {
  const [selectedGift, setSelectedGift] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  if (!selectedCompetitor) return null;

  const getRarityIcon = (rarity) => {
    const iconMap = {
      mythic: Crown,
      legendary: Sparkles,
      epic: Star,
      rare: Diamond,
      uncommon: Trophy,
      common: Heart,
    };
    const IconComponent = iconMap[rarity] || Zap;
    return <IconComponent className="w-4 h-4" />;
  };

  const getRarityGradient = (rarity) => {
    const gradients = {
      mythic: "from-pink-500 via-purple-600 to-indigo-600",
      legendary: "from-orange-400 via-red-500 to-pink-500",
      epic: "from-violet-500 via-purple-600 to-blue-600",
      rare: "from-blue-400 via-cyan-500 to-teal-500",
      uncommon: "from-green-400 via-emerald-500 to-cyan-500",
      common: "from-gray-400 via-slate-500 to-gray-600",
    };
    return gradients[rarity] || gradients.common;
  };

  const getRarityText = (rarity) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const handleGiftSelect = (gift) => {
    if (userPoints < gift.cost) return;

    setSelectedGift(gift);
    setShowConfirm(true);
    setIsAnimating(true);

    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleConfirmSend = () => {
    if (selectedGift) {
      onSendGift(selectedCompetitor.id, selectedGift.type);
      setShowConfirm(false);
      setSelectedGift(null);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setSelectedGift(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-60"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
      <Card className="bg-gradient-to-br from-white/95 via-gray-50/90 to-white/95 backdrop-blur-3xl border-2 border-purple-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-purple-500/25 transform animate-scale-in relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse"></div>
          <div
            className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-blue-400/15 to-cyan-400/15 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
        <CardContent className="p-6 md:p-8 relative z-10">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded-full border border-gray-300/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 z-20"
          >
            <X className="w-5 h-5" />
          </Button>
          {!showConfirm ? (
            <>
              <div className="text-center mb-8 space-y-6">
                <div className="relative">
                  <h3 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-2xl">
                    Choose Your Gift
                  </h3>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 blur-3xl opacity-30 -z-10 animate-pulse"></div>
                  <div className="mt-2 w-24 h-1 bg-gradient-to-r from-amber-500 to-red-500 mx-auto rounded-full shadow-lg"></div>
                </div>
                
                {/* Competitor Info */}
                <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-white/60 via-gray-50/60 to-white/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-500/30 shadow-xl">
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-amber-400/70 shadow-2xl shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                      <img
                        src={selectedCompetitor.image}
                        alt={selectedCompetitor.horseName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCompetitor.horseName)}&size=200&background=f59e0b&color=ffffff`;
                        }}
                      />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full p-1 shadow-lg animate-bounce">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="text-left space-y-1">
                    <p className="text-gray-600 text-sm font-medium">Sending gift to</p>
                    <p className="text-amber-600 text-xl font-black drop-shadow-lg">
                      {selectedCompetitor.horseName}
                    </p>
                    <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-400/50 font-semibold text-xs">
                      #{selectedCompetitor.rank} Champion
                    </Badge>
                  </div>
                </div>
                
                {/* User Balance */}
                <div className="bg-gradient-to-r from-emerald-50/80 via-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-xl p-4 border-2 border-emerald-400/40 shadow-xl">
                  <div className="flex items-center justify-center gap-3">
                    <div className="relative">
                      <Coins className="w-8 h-8 text-emerald-500 animate-spin" style={{ animationDuration: "3s" }} />
                      <div className="absolute inset-0 bg-emerald-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-emerald-600 text-sm font-medium">Your Balance</p>
                      <p className="text-emerald-700 text-2xl font-black drop-shadow-lg">
                        {userPoints.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Gift Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {giftTypes.map((gift, index) => {
                  const canAfford = userPoints >= gift.cost;
                  const rarityGradient = getRarityGradient(gift.rarity);
                  return (
                    <Button
                      key={gift.type}
                      onClick={() => handleGiftSelect(gift)}
                      className={`p-4 h-auto flex-col gap-3 border-2 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 relative overflow-hidden group rounded-2xl ${
                        canAfford
                          ? `bg-gradient-to-br ${getRarityColor(gift.rarity)} border-white/50 hover:border-white/80 shadow-2xl hover:shadow-3xl backdrop-blur-sm`
                          : "bg-gray-200/60 border-red-400/50 opacity-50 cursor-not-allowed hover:scale-100 hover:translate-y-0"
                      }`}
                      disabled={!canAfford}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      {canAfford && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${rarityGradient} rounded-2xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10 scale-110`}
                          ></div>
                        </>
                      )}
                      <div className="relative z-10 space-y-3 text-center">
                        <div className="relative">
                          <div className="text-4xl drop-shadow-2xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 filter brightness-110">
                            {gift.icon}
                          </div>
                          {canAfford && gift.rarity === "mythic" && (
                            <div className="absolute inset-0 animate-ping">
                              <div className="text-4xl opacity-75">
                                {gift.icon}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-1">
                            <Coins className="w-4 h-4 text-amber-600" />
                            <span className="text-gray-900 font-black text-lg drop-shadow-lg">
                              {gift.cost.toLocaleString()}
                            </span>
                          </div>
                          <Badge
                            className={`bg-gradient-to-r ${rarityGradient} text-white text-xs font-bold px-3 py-1 backdrop-blur-sm border border-white/30 hover:scale-105 transition-transform duration-200 shadow-lg`}
                          >
                            <div className="flex items-center gap-1">
                              {getRarityIcon(gift.rarity)}
                              {getRarityText(gift.rarity)}
                            </div>
                          </Badge>
                          {!canAfford && (
                            <Badge className="bg-red-500/20 text-red-800 border-red-400/50 text-xs font-medium">
                              Need {(gift.cost - userPoints).toLocaleString()} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
              
              <div className="flex gap-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="lg"
                  className="flex-1 font-bold text-gray-700 border-gray-300 hover:bg-gray-100/80 backdrop-blur-sm transition-all duration-300 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6 py-6">
              <div className="relative">
                <h3 className="text-4xl font-black bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
                  Confirm Your Gift
                </h3>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 blur-3xl opacity-20 -z-10 animate-pulse"></div>
              </div>
              <div
                className={`bg-gradient-to-br ${getRarityColor(selectedGift?.rarity)} rounded-2xl p-6 border-4 border-white/50 shadow-2xl transform ${isAnimating ? "animate-bounce scale-110" : ""} transition-all duration-300`}
              >
                <div className="text-6xl mb-3 drop-shadow-2xl animate-pulse">
                  {selectedGift?.icon}
                </div>
                <div className="space-y-2">
                  <Badge
                    className={`bg-gradient-to-r ${getRarityGradient(selectedGift?.rarity)} text-white text-base font-bold px-4 py-1`}
                  >
                    {getRarityText(selectedGift?.rarity)} Gift
                  </Badge>
                  <p className="text-xl font-black text-gray-900">
                    {selectedGift?.cost.toLocaleString()} Points
                  </p>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-amber-400/50 shadow-xl">
                <p className="text-sm text-gray-600 mb-1">Sending to</p>
                <p className="text-xl font-black text-amber-600 drop-shadow-lg">
                  {selectedCompetitor.horseName}
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="lg"
                  className="flex-1 font-bold rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmSend}
                  disabled={sendingGift}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 text-white font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    {sendingGift ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing Gift...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Gift
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0.8) rotate(-5deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

const CompetitorProfile = ({
  competitor,
  giftTypes,
  onSendGift,
  getRarityColor,
  isAnimated = true,
  showGiftGrid = true,
  compact = false,
  competitionStatus,
}) => {
  if (!competitor) {
    return (
      <div className="text-center p-8">
        <div className="w-48 h-48 bg-gray-200 rounded-full animate-pulse mb-4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
      </div>
    );
  }

  const isChampion = competitor.rank === 1;
  const championColors = {
    gradient: "from-amber-400 via-yellow-500 to-amber-600",
    shadow: "shadow-amber-500/50",
    border: "border-amber-400",
    text: "text-amber-600",
    bg: "bg-amber-500",
  };

  const challengerColors = {
    gradient: "from-purple-500 via-indigo-500 to-blue-500",
    shadow: "shadow-purple-500/50",
    border: "border-purple-400",
    text: "text-purple-600",
    bg: "bg-purple-500",
  };

  const colors = isChampion ? championColors : challengerColors;
  const profileSize = compact
    ? "w-32 h-32 md:w-40 md:h-40"
    : "w-48 h-48 md:w-64 md:h-64";

  const displayGifts =
    competitor.gifts
      ?.filter((gift) => gift.count > 0)
      .sort((a, b) => {
        const aType = giftTypes?.find((gt) => gt.type === a.type);
        const bType = giftTypes?.find((gt) => gt.type === b.type);
        return (bType?.cost || 0) - (aType?.cost || 0);
      })
      .slice(0, compact ? 4 : 8) || [];

  const totalGiftsDisplay = competitor.totalGifts?.toLocaleString() || "0";

  return (
    <div
      className={`text-center relative group ${compact ? "space-y-4" : "space-y-6"}`}
    >
      <div
        className={`absolute ${compact ? "-top-2" : "-top-4"} left-[45%] transform -translate-x-1/2 z-20`}
      >
        <div
          className={`bg-gradient-to-r ${colors.gradient} ${colors.shadow} rounded-full ${compact ? "p-2" : "p-3"} shadow-2xl border-2 border-white/50 backdrop-blur-sm ${isAnimated ? "animate-pulse" : ""}`}
        >
          {isChampion ? (
            <Crown
              className={`${compact ? "w-5 h-5" : "w-8 h-8"} text-white drop-shadow-lg`}
            />
          ) : (
            <Medal
              className={`${compact ? "w-5 h-5" : "w-8 h-8"} text-white drop-shadow-lg`}
            />
          )}
        </div>
      </div>
      <div className={`relative ${compact ? "mb-4" : "mb-8"} group/image`}>
        {isAnimated && (
          <>
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors.gradient} blur-3xl opacity-20 group-hover/image:opacity-40 transition-all duration-700 animate-pulse scale-110`}
            ></div>
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors.gradient} blur-xl opacity-30 group-hover/image:opacity-50 transition-all duration-500 scale-105`}
            ></div>
          </>
        )}
        <div
          className={`relative ${profileSize} rounded-full overflow-hidden border-4 ${colors.border} ${colors.shadow} shadow-2xl group-hover/image:scale-105 transition-all duration-300`}
        >
          {/* Show surprise horse if active, otherwise show surprise box */}
          {competitor.activeHorse === 'surprise' && competitor.surpriseHorseName ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 relative">
              <div className="text-center">
                <div className="text-4xl mb-2">🎁</div>
                <div className="text-sm font-bold text-purple-700 px-2">
                  {competitor.surpriseHorseName}
                </div>
                <div className="text-xs text-purple-600">Surprise Horse</div>
              </div>
              {/* Sparkle effect */}
              <div className="absolute inset-0">
                <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute top-4 right-3 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-3 left-3 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          ) : (
            <>
              <img
                src={competitor.image}
                alt={`${competitor.horseName || competitor.name} profile`}
                className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-700"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(competitor.horseName || competitor.name)}&size=300&background=e5e7eb&color=374151`;
                }}
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${isChampion ? "from-amber-500/10 to-transparent" : "from-purple-500/10 to-transparent"}`}
              ></div>
            </>
          )}
          {isAnimated && (
            <div
              className={`absolute inset-0 rounded-full border-2 border-white/30 animate-spin`}
              style={{ animationDuration: "8s" }}
            ></div>
          )}
        </div>
        {competitor.streak && competitor.streak > 0 && (
          <div
            className={`absolute ${compact ? "-bottom-2" : "-bottom-4"} left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full ${compact ? "px-3 py-1" : "px-4 py-2"} shadow-lg border border-yellow-400/50 ${isAnimated ? "animate-bounce" : ""}`}
          >
            <div className="flex items-center gap-1">
              <Flame
                className={`${compact ? "w-3 h-3" : "w-4 h-4"} text-yellow-300`}
              />
              <span
                className={`text-white font-bold ${compact ? "text-xs" : "text-sm"}`}>
                {competitor.streak} streak
              </span>
            </div>
          </div>
        )}

        {/* Surprise Horse Available Indicator */}
        {competitor.surpriseHorseName && competitor.activeHorse !== 'surprise' && (
          <div className={`absolute ${compact ? "-bottom-2" : "-bottom-4"} ${compact ? "right-2" : "right-4"} bg-gradient-to-r from-purple-500 to-pink-500 rounded-full ${compact ? "p-1" : "p-2"} shadow-lg border border-purple-400/50 ${isAnimated ? "animate-pulse" : ""}`}>
            <div className="text-white text-xs">🎁</div>
          </div>
        )}
      </div>
      <div className={`${compact ? "mb-3 space-y-1" : "mb-6 space-y-2"}`}>
        <h3
          className={`${compact ? "text-xl" : "text-3xl"} font-bold ${colors.text} drop-shadow-lg transform hover:scale-105 transition-all duration-300`}
        >
          {competitor.horseName || competitor.name}
        </h3>
        {competitor.horseName && competitor.name && (
          <p
            className={`text-gray-600 ${compact ? "text-sm" : "text-lg"} font-medium`}
          >
            {competitor.name}
          </p>
        )}
        
        {/* Surprise Horse Information */}
        {competitor.surpriseHorseName && (
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
              🎁 Surprise: {competitor.surpriseHorseName}
            </Badge>
            {competitor.activeHorse === 'surprise' && (
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                Active
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex justify-center">
          <Badge
            className={`bg-gradient-to-r ${colors.gradient} text-white ${compact ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm"} font-semibold shadow-lg border border-white/30`}
          >
            <Trophy className={`${compact ? "w-3 h-3" : "w-4 h-4"} mr-1`} />#
            {competitor.rank} {isChampion ? "Champion" : "Challenger"}
          </Badge>
        </div>
      </div>
      {showGiftGrid && displayGifts.length > 0 && (
        <div className="space-y-4">
          {/* Gift Grid */}
          <div
            className={`grid ${compact ? "grid-cols-2 gap-2" : "grid-cols-4 gap-3"} ${compact ? "mb-3 px-2" : "mb-6 px-4"}`}
          >
            {displayGifts.map((gift) => {
              const giftType = giftTypes?.find((gt) => gt.type === gift.type);
              const rarityColor = getRarityColor
                ? getRarityColor(giftType?.rarity || "common")
                : "from-gray-200 to-gray-300";
              return (
                <div
                  key={gift.type}
                  className={`relative bg-gradient-to-br ${rarityColor} ${compact ? "p-2" : "p-3"} rounded-xl shadow-md border border-white/50 transform hover:scale-110 transition-all duration-300 group/gift backdrop-blur-sm`}
                  title={`${gift.type} (${gift.count})`}
                >
                  <div
                    className={`${compact ? "text-lg" : "text-2xl"} drop-shadow-lg transform group-hover/gift:scale-110 transition-transform duration-300`}
                  >
                    {gift.icon}
                  </div>
                  <div
                    className={`text-gray-800 font-bold ${compact ? "text-sm" : "text-base"} drop-shadow-sm`}
                  >
                    {gift.count}
                  </div>
                  {gift.count > 10 && (
                    <div
                      className={`absolute -top-1 -right-1 ${compact ? "w-4 h-4" : "w-5 h-5"} bg-yellow-400 rounded-full flex items-center justify-center ${isAnimated ? "animate-bounce" : ""}`}
                    >
                      <span
                        className={`text-black ${compact ? "text-xs" : "text-sm"} font-bold`}
                      >
                        !
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Gift Givers Section */}
          {competitor.giftGivers && competitor.giftGivers.length > 0 && (
            <div className="px-4">
              <div className="mb-2">
                <h4 className={`text-gray-700 font-bold ${compact ? "text-sm" : "text-base"}`}>Gift Givers</h4>
              </div>
              
              {/* Top Gift Giver - Special Design */}
              {competitor.topGiftGiver && (
                <div className="mb-3">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} blur-xl opacity-30 rounded-xl animate-pulse`}></div>
                    <div className={`relative flex items-center gap-3 bg-white/80 backdrop-blur-sm p-3 rounded-xl border-2 ${colors.border} shadow-lg`}>
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg">
                          <img 
                            src={competitor.topGiftGiver.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(competitor.topGiftGiver.name)}&size=100&background=f59e0b&color=ffffff`}
                            alt={competitor.topGiftGiver.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full p-1 shadow-lg">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-amber-700 font-bold text-sm">{competitor.topGiftGiver.name}</p>
                        <p className="text-gray-600 text-xs">Top Supporter</p>
                      </div>
                      <div className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-yellow-100 px-2 py-1 rounded-lg border border-amber-300">
                        <Coins className="w-3 h-3 text-amber-600" />
                        <span className="text-amber-800 font-bold text-xs">{competitor.topGiftGiver.totalSpent}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Other Gift Givers */}
              <div className="flex flex-wrap gap-2 justify-center">
                {competitor.giftGivers
                  .filter(giver => !competitor.topGiftGiver || giver.id !== competitor.topGiftGiver.id)
                  .slice(0, 8)
                  .map((giver) => (
                    <div key={giver.id} className="relative group/giver" title={giver.name}>
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 shadow-md group-hover/giver:scale-110 transition-transform duration-300">
                        <img 
                          src={giver.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(giver.name)}&size=100&background=e5e7eb&color=374151`}
                          alt={giver.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full p-0.5 shadow-sm hidden group-hover/giver:block transition-all duration-300">
                        <Gift className="w-2 h-2 text-white" />
                      </div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/giver:opacity-100 transition-opacity duration-300 pointer-events-none">
                        {giver.name}
                      </div>
                    </div>
                  ))
                }
                
                {competitor.giftGivers.length > 8 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold border border-gray-300">
                    +{competitor.giftGivers.length - 8}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="flex gap-2 justify-center mt-2">
        <Button
          onClick={() => onSendGift?.(competitor.id)}
          disabled={!onSendGift || competitionStatus === "ended"}
          className={`bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white font-bold ${compact ? "px-6 py-3 text-sm" : "px-8 py-4 text-lg"} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-white/30 backdrop-blur-sm group/button relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
          title={competitionStatus === "ended" ? "Cannot send gifts after competition has ended" : ""}
        >
          {isAnimated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover/button:translate-x-full transition-transform duration-1000"></div>
          )}
          <div className="flex items-center gap-2 relative z-10">
            <Gift
              className={`${compact ? "w-4 h-4" : "w-5 h-5"} ${isAnimated ? "animate-pulse" : ""}`}
            />
            <span className="drop-shadow-sm">
              {compact ? "Send Gift" : "Send Epic Gift"}
            </span>
            <Zap
              className={`${compact ? "w-4 h-4" : "w-5 h-5"} ${isAnimated ? "animate-pulse" : ""}`}
            />
          </div>
        </Button>
        {typeof onEditHorse === 'function' && (
          <Button
            onClick={(e) => { e.stopPropagation?.(); onEditHorse(competitor); }}
            variant="outline"
            className={`${compact ? "px-4 py-3 text-sm" : "px-6 py-4"}`}
          >
            Edit Horse
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnhancedCompetitionPage;
