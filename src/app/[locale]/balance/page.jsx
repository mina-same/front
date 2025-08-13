"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Crown, Diamond, Zap, ArrowRight, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Layout from "components/layout/Layout";
import { useTranslation } from 'react-i18next';

const BalancePage = () => {
  const { t, i18n } = useTranslation('balance');
  const isArabic = i18n.language === 'ar';
  
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    fetchUserBalance();
  }, []);

  const fetchUserBalance = async () => {
    try {
      setLoadingBalance(true);
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

      const balanceResponse = await fetch(`/api/user/balance?userId=${authData.user.id}`);
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setUserBalance(balanceData.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching user balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const packages = [
    {
      id: "basic",
      coins: 200,
      price: 100,
      currency: "SAR",
      popular: false,
      icon: Coins,
      color: "from-blue-500 to-cyan-500",
      features: t('packages.basic.features', { returnObjects: true }),
    },
    {
      id: "premium",
      coins: 500,
      price: 200,
      currency: "SAR",
      popular: true,
      icon: Crown,
      color: "from-purple-500 to-pink-500",
      features: t('packages.premium.features', { returnObjects: true }),
    },
    {
      id: "ultimate",
      coins: 900,
      price: 300,
      currency: "SAR",
      popular: false,
      icon: Diamond,
      color: "from-amber-500 to-orange-500",
      features: t('packages.ultimate.features', { returnObjects: true }),
    },
  ];

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast({
        title: t('errors.no_package'),
        description: t('errors.no_package_description'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: t('errors.purchase_success'),
        description: t('errors.purchase_success_description', { coins: selectedPackage.coins }),
      });
      
      await fetchUserBalance();
      setSelectedPackage(null);
    } catch (error) {
      toast({
        title: t('errors.purchase_failed'),
        description: t('errors.purchase_failed_description'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={`min-h-screen py-12 ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative bg-blue-500 rounded-full p-6 shadow-2xl">
                <Coins className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6">
              <span className="bg-blue-400 bg-clip-text text-transparent">
                {t('title')}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>

          {/* Current Balance */}
          <div className="max-w-md mx-auto mb-8 md:mb-12">
            <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="relative">
                    <Coins className="w-8 h-8 text-emerald-600 animate-spin" style={{ animationDuration: '3s' }} />
                    <div className="absolute inset-0 bg-emerald-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-emerald-600 text-sm font-medium">{t('current_balance')}</p>
                    {loadingBalance ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                      </div>
                    ) : (
                      <p className="text-emerald-700 text-2xl font-black">
                        {userBalance.toLocaleString()} {t('coins')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8 md:mb-12">
            {packages.map((pkg) => {
              const IconComponent = pkg.icon;
              const isSelected = selectedPackage?.id === pkg.id;
              
              return (
                <Card 
                  key={pkg.id}
                  className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    isSelected 
                      ? 'ring-4 ring-purple-500 shadow-2xl' 
                      : 'hover:shadow-xl'
                  } ${pkg.popular ? 'border-purple-300' : 'border-gray-200'}`}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                        <Crown className="w-4 h-4 mr-1" />
                        {isArabic ? "الأكثر شعبية" : "Most Popular"}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="relative mx-auto mb-4">
                      <div className={`absolute inset-0 bg-gradient-to-r ${pkg.color} rounded-full blur-xl opacity-30 ${isSelected ? 'animate-pulse' : ''}`}></div>
                      <div className={`relative bg-gradient-to-r ${pkg.color} rounded-full p-4 shadow-lg`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-black text-gray-900">
                      {pkg.coins} {t('coins')}
                    </CardTitle>
                    <div className="text-center">
                      <span className="text-3xl font-black text-gray-900">
                        {pkg.price}
                      </span>
                      <span className="text-lg text-gray-600 ml-1">
                        {pkg.currency}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-gray-700 font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full font-bold py-3 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      } transition-all duration-300`}
                    >
                      {isSelected ? (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          {t('selected')}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {t('select_package')}
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Purchase Button */}
          <div className="text-center">
            <Button
              onClick={handlePurchase}
              disabled={!selectedPackage || loading}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-bold px-6 sm:px-12 py-4 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isArabic ? "جاري المعالجة..." : "Processing..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {t('purchase_button', {
                    coins: selectedPackage?.coins,
                    price: selectedPackage?.price,
                    currency: selectedPackage?.currency
                  })}
                </div>
              )}
            </Button>
            
            {selectedPackage && (
              <p className="text-sm text-gray-500 mt-4">
                {t('secure_payment_note')}
              </p>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-12 md:mt-16 max-w-4xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">
                  {t('how_it_works')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  <div className="text-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-blue-600 font-bold text-lg">1</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{t('step1.title')}</h4>
                    <p className="text-gray-600 text-sm md:text-base">{t('step1.description')}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-purple-600 font-bold text-lg">2</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{t('step2.title')}</h4>
                    <p className="text-gray-600 text-sm md:text-base">{t('step2.description')}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-green-600 font-bold text-lg">3</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{t('step3.title')}</h4>
                    <p className="text-gray-600 text-sm md:text-base">{t('step3.description')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BalancePage;