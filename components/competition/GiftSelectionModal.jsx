import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import { 
  Zap, 
  Sparkles, 
  Crown, 
  X, 
  Gift, 
  Flame, 
  Star, 
  Heart,
  Trophy,
  Diamond,
  Coins,
  ArrowRight,
  Send
} from "lucide-react";

const GiftSelectionModal = ({
  selectedCompetitor,
  giftTypes,
  userPoints,
  onSendGift,
  onClose,
  getRarityColor,
}) => {
  const [selectedGift, setSelectedGift] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      {/* Floating Particles */}
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

      <Card className="bg-gradient-to-br from-white/95 via-gray-50/90 to-white/95 backdrop-blur-3xl border-2 border-purple-500/30 max-w-5xl w-full shadow-2xl shadow-purple-500/25 transform animate-scale-in relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-blue-400/15 to-cyan-400/15 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <CardContent className="p-8 md:p-12 relative z-10">
          {/* Enhanced Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded-full border border-gray-300/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 z-20"
          >
            <X className="w-5 h-5" />
          </Button>

          {!showConfirm ? (
            <>
              {/* Enhanced Header */}
              <div className="text-center mb-12 space-y-8">
                <div className="relative">
                  <h3 className="text-6xl font-black bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-2xl">
                    Choose Your Gift
                  </h3>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 blur-3xl opacity-30 -z-10 animate-pulse"></div>
                  <div className="mt-2 w-32 h-1 bg-gradient-to-r from-amber-500 to-red-500 mx-auto rounded-full shadow-lg"></div>
                </div>

                {/* Enhanced Competitor Info */}
                <div className="flex items-center justify-center gap-6 bg-gradient-to-r from-white/60 via-gray-50/60 to-white/60 backdrop-blur-sm rounded-3xl p-6 border border-amber-500/30 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-400/70 shadow-2xl shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                      <Image
                        src={selectedCompetitor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCompetitor.horseName)}&size=200&background=f59e0b&color=ffffff`}
                        alt={selectedCompetitor.horseName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        width={200}
                        height={200}
                        onError={(e) => {
                          // Handle error by setting fallback image
                          const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCompetitor.horseName)}&size=200&background=f59e0b&color=ffffff`;
                          if (e.target.src !== fallbackSrc) {
                            e.target.src = fallbackSrc;
                          }
                        }}
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full p-2 shadow-lg animate-bounce">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-left space-y-1">
                    <p className="text-gray-600 text-lg font-medium">
                      Sending gift to
                    </p>
                    <p className="text-amber-600 text-3xl font-black drop-shadow-lg">
                      {selectedCompetitor.horseName}
                    </p>
                    <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-400/50 font-semibold">
                      #{selectedCompetitor.rank} Champion
                    </Badge>
                  </div>
                </div>

                {/* Enhanced Points Display */}
                <div className="bg-gradient-to-r from-emerald-50/80 via-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-emerald-400/40 shadow-xl hover:border-emerald-500/60 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center justify-center gap-4">
                    <div className="relative">
                      <Coins className="w-10 h-10 text-emerald-500 animate-spin" style={{animationDuration: '3s'}} />
                      <div className="absolute inset-0 bg-emerald-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-emerald-600 text-lg font-medium">Your Balance</p>
                      <p className="text-emerald-700 text-4xl font-black drop-shadow-lg">
                        {userPoints.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Gift Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                {giftTypes.map((gift, index) => {
                  const canAfford = userPoints >= gift.cost;
                  const rarityGradient = getRarityGradient(gift.rarity);
                  
                  return (
                    <Button
                      key={gift.type}
                      onClick={() => handleGiftSelect(gift)}
                      className={`p-6 h-auto flex-col gap-4 border-2 transition-all duration-500 transform hover:scale-110 hover:-translate-y-3 relative overflow-hidden group rounded-3xl ${
                        canAfford
                          ? `bg-gradient-to-br ${getRarityColor(gift.rarity)} border-white/50 hover:border-white/80 shadow-2xl hover:shadow-3xl backdrop-blur-sm`
                          : "bg-gray-200/60 border-red-400/50 opacity-50 cursor-not-allowed hover:scale-100 hover:translate-y-0"
                      }`}
                      disabled={!canAfford}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      {/* Enhanced Shine Effect */}
                      {canAfford && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          <div className={`absolute inset-0 bg-gradient-to-br ${rarityGradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10 scale-110`}></div>
                        </>
                      )}

                      <div className="relative z-10 space-y-4 text-center">
                        {/* Gift Icon with Animation */}
                        <div className="relative">
                          <div className="text-6xl drop-shadow-2xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 filter brightness-110">
                            {gift.icon}
                          </div>
                          {canAfford && gift.rarity === 'mythic' && (
                            <div className="absolute inset-0 animate-ping">
                              <div className="text-6xl opacity-75">{gift.icon}</div>
                            </div>
                          )}
                        </div>

                        {/* Cost and Rarity */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-2">
                            <Coins className="w-5 h-5 text-amber-600" />
                            <span className="text-gray-900 font-black text-xl drop-shadow-lg">
                              {gift.cost.toLocaleString()}
                            </span>
                          </div>

                          <Badge
                            className={`bg-gradient-to-r ${rarityGradient} text-white text-sm font-bold px-4 py-2 backdrop-blur-sm border border-white/30 hover:scale-105 transition-transform duration-200 shadow-lg`}
                          >
                            <div className="flex items-center gap-2">
                              {getRarityIcon(gift.rarity)}
                              {getRarityText(gift.rarity)}
                            </div>
                          </Badge>

                          {/* Affordability Indicator */}
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

              {/* Enhanced Action Buttons */}
              <div className="flex gap-6">
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
            /* Confirmation Screen */
            <div className="text-center space-y-8 py-8">
              <div className="relative">
                <h3 className="text-5xl font-black bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
                  Confirm Your Gift
                </h3>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 blur-3xl opacity-20 -z-10 animate-pulse"></div>
              </div>

              {/* Gift Preview */}
              <div className={`bg-gradient-to-br ${getRarityColor(selectedGift?.rarity)} rounded-3xl p-8 border-4 border-white/50 shadow-2xl transform ${isAnimating ? 'animate-bounce scale-110' : ''} transition-all duration-300`}>
                <div className="text-8xl mb-4 drop-shadow-2xl animate-pulse">
                  {selectedGift?.icon}
                </div>
                <div className="space-y-2">
                  <Badge className={`bg-gradient-to-r ${getRarityGradient(selectedGift?.rarity)} text-white text-lg font-bold px-6 py-2`}>
                    {getRarityText(selectedGift?.rarity)} Gift
                  </Badge>
                  <p className="text-2xl font-black text-gray-900">
                    {selectedGift?.cost.toLocaleString()} Points
                  </p>
                </div>
              </div>

              {/* Recipient Info */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-400/50 shadow-xl">
                <p className="text-lg text-gray-600 mb-2">Sending to</p>
                <p className="text-3xl font-black text-amber-600 drop-shadow-lg">
                  {selectedCompetitor.horseName}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-6">
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
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 text-white font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-xl transform hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <Send className="w-5 h-5" />
                    Send Gift
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes scale-in {
          0% { transform: scale(0.8) rotate(-5deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GiftSelectionModal;