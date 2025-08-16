import React from 'react';
import Image from 'next/image';
import { Badge } from "../../src/components/ui/badge";
import { Button } from "../../src/components/ui/button";
import { Crown, Star, Gift, Zap, Flame, Trophy, Medal } from "lucide-react";

const CompetitorProfile = ({ 
  competitor, 
  giftTypes, 
  onSendGift, 
  getRarityColor,
  isAnimated = true,
  showGiftGrid = true,
  compact = false 
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
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    shadow: 'shadow-amber-500/50',
    border: 'border-amber-400',
    text: 'text-amber-600',
    bg: 'bg-amber-500'
  };
  
  const challengerColors = {
    gradient: 'from-purple-500 via-indigo-500 to-blue-500',
    shadow: 'shadow-purple-500/50',
    border: 'border-purple-400',
    text: 'text-purple-600',
    bg: 'bg-purple-500'
  };

  const colors = isChampion ? championColors : challengerColors;
  const profileSize = compact ? 'w-32 h-32 md:w-40 md:h-40' : 'w-48 h-48 md:w-64 md:h-64';

  // Filter and sort gifts for display
  const displayGifts = competitor.gifts
    ?.filter(gift => gift.count > 0)
    .sort((a, b) => {
      const aType = giftTypes?.find(gt => gt.type === a.type);
      const bType = giftTypes?.find(gt => gt.type === b.type);
      return (bType?.cost || 0) - (aType?.cost || 0);
    })
    .slice(0, compact ? 4 : 8) || [];

  const totalGiftsDisplay = competitor.totalGifts?.toLocaleString() || '0';

  return (
    <div className={`text-center relative group ${compact ? 'space-y-4' : 'space-y-6'}`}>
      {/* Rank Badge */}
      <div className={`absolute ${compact ? '-top-4' : '-top-8'} left-1/2 transform -translate-x-1/2 z-20`}>
        <div className={`bg-gradient-to-r ${colors.gradient} ${colors.shadow} rounded-full ${compact ? 'p-2' : 'p-3'} shadow-2xl border-2 border-white/50 backdrop-blur-sm ${isAnimated ? 'animate-pulse' : ''}`}>
          {isChampion ? (
            <Crown className={`${compact ? 'w-5 h-5' : 'w-8 h-8'} text-white drop-shadow-lg`} />
          ) : (
            <Medal className={`${compact ? 'w-5 h-5' : 'w-8 h-8'} text-white drop-shadow-lg`} />
          )}
        </div>
      </div>

      {/* Profile Image Container */}
      <div className={`relative ${compact ? 'mb-4' : 'mb-8'} group/image`}>
        {/* Glow Effects */}
        {isAnimated && (
          <>
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors.gradient} blur-3xl opacity-20 group-hover/image:opacity-40 transition-all duration-700 animate-pulse scale-110`}></div>
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors.gradient} blur-xl opacity-30 group-hover/image:opacity-50 transition-all duration-500 scale-105`}></div>
          </>
        )}

        {/* Main Profile Container */}
        <div className={`relative ${profileSize} rounded-full overflow-hidden border-4 ${colors.border} ${colors.shadow} shadow-2xl group-hover/image:scale-105 transition-all duration-300`}>
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
              <Image 
                src={competitor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(competitor.horseName || competitor.name)}&size=300&background=e5e7eb&color=374151`}
                alt={`${competitor.horseName || competitor.name} profile`}
                className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-700"
                width={300}
                height={300}
                onError={(e) => {
                  // Handle error by setting fallback image
                  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(competitor.horseName || competitor.name)}&size=300&background=e5e7eb&color=374151`;
                  if (e.target.src !== fallbackSrc) {
                    e.target.src = fallbackSrc;
                  }
                }}
              />
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${isChampion ? 'from-amber-500/10 to-transparent' : 'from-purple-500/10 to-transparent'}`}></div>
              
              {/* Animated Border */}
              {isAnimated && (
                <div className={`absolute inset-0 rounded-full border-2 border-white/30 animate-spin`} style={{ animationDuration: '8s' }}></div>
              )}
            </>
          )}
        </div>
        
        {/* Points Display */}
        <div className={`absolute ${compact ? '-top-2 -right-2' : '-top-6 -right-6'} bg-white/95 backdrop-blur-sm rounded-xl ${compact ? 'px-3 py-1' : 'px-4 py-2'} border-2 ${colors.border} shadow-xl transform hover:scale-110 transition-all duration-300`}>
          <div className="flex items-center gap-1">
            <Zap className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} ${colors.text} ${isAnimated ? 'animate-pulse' : ''}`} />
            <span className={`${colors.text} font-bold ${compact ? 'text-sm' : 'text-lg'}`}>
              {totalGiftsDisplay}
            </span>
          </div>
        </div>

        {/* Streak Indicator */}
        {competitor.streak && competitor.streak > 0 && (
          <div className={`absolute ${compact ? '-bottom-2' : '-bottom-4'} left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full ${compact ? 'px-3 py-1' : 'px-4 py-2'} shadow-lg border border-yellow-400/50 ${isAnimated ? 'animate-bounce' : ''}`}>
            <div className="flex items-center gap-1">
              <Flame className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-yellow-300`} />
              <span className={`text-white font-bold ${compact ? 'text-xs' : 'text-sm'}`}>
                {competitor.streak} streak
              </span>
            </div>
          </div>
        )}

        {/* Surprise Horse Available Indicator */}
        {competitor.surpriseHorseName && competitor.activeHorse !== 'surprise' && (
          <div className={`absolute ${compact ? '-bottom-2' : '-bottom-4'} ${compact ? 'right-2' : 'right-4'} bg-gradient-to-r from-purple-500 to-pink-500 rounded-full ${compact ? 'p-1' : 'p-2'} shadow-lg border border-purple-400/50 ${isAnimated ? 'animate-pulse' : ''}`}>
            <div className="text-white text-xs">🎁</div>
          </div>
        )}
      </div>

      {/* Competitor Info */}
      <div className={`${compact ? 'mb-3 space-y-1' : 'mb-6 space-y-2'}`}>
        <h3 className={`${compact ? 'text-xl' : 'text-3xl'} font-bold ${colors.text} drop-shadow-lg transform hover:scale-105 transition-all duration-300`}>
          {competitor.horseName || competitor.name}
        </h3>
        {competitor.horseName && competitor.name && (
          <p className={`text-gray-600 ${compact ? 'text-sm' : 'text-lg'} font-medium`}>
            {competitor.name}
          </p>
        )}
        <div className="flex justify-center">
          <Badge className={`bg-gradient-to-r ${colors.gradient} text-white ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'} font-semibold shadow-lg border border-white/30`}>
            <Trophy className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
            #{competitor.rank} {isChampion ? 'Champion' : 'Challenger'}
          </Badge>
        </div>
      </div>

      {/* Gift Counters Grid */}
      {showGiftGrid && displayGifts.length > 0 && (
        <div className={`grid ${compact ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-3'} ${compact ? 'mb-3 px-2' : 'mb-6 px-4'}`}>
          {displayGifts.map((gift) => {
            const giftType = giftTypes?.find(gt => gt.type === gift.type);
            const rarityColor = getRarityColor ? getRarityColor(giftType?.rarity || 'common') : 'from-gray-200 to-gray-300';
            
            return (
              <div 
                key={gift.type} 
                className={`relative bg-gradient-to-br ${rarityColor} ${compact ? 'p-2' : 'p-3'} rounded-xl shadow-md border border-white/50 transform hover:scale-110 transition-all duration-300 group/gift backdrop-blur-sm`}
                title={`${gift.type} (${gift.count})`}
              >
                <div className={`${compact ? 'text-lg' : 'text-2xl'} drop-shadow-lg transform group-hover/gift:scale-110 transition-transform duration-300`}>
                  {gift.icon}
                </div>
                <div className={`text-gray-800 font-bold ${compact ? 'text-sm' : 'text-base'} drop-shadow-sm`}>
                  {gift.count}
                </div>
                
                {/* High value indicator */}
                {gift.count > 10 && (
                  <div className={`absolute -top-1 -right-1 ${compact ? 'w-4 h-4' : 'w-5 h-5'} bg-yellow-400 rounded-full flex items-center justify-center ${isAnimated ? 'animate-bounce' : ''}`}>
                    <span className={`text-black ${compact ? 'text-xs' : 'text-sm'} font-bold`}>!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Send Gift Button */}
      <Button 
        onClick={() => onSendGift?.(competitor.id)}
        disabled={!onSendGift}
        className={`bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white font-bold ${compact ? 'px-6 py-3 text-sm' : 'px-8 py-4 text-lg'} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-white/30 backdrop-blur-sm group/button relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
      >
        {/* Button shine effect */}
        {isAnimated && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover/button:translate-x-full transition-transform duration-1000"></div>
        )}
        
        <div className="flex items-center gap-2 relative z-10">
          <Gift className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${isAnimated ? 'animate-pulse' : ''}`} />
          <span className="drop-shadow-sm">
            {compact ? 'Send Gift' : 'Send Epic Gift'}
          </span>
          <Zap className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${isAnimated ? 'animate-pulse' : ''}`} />
        </div>
      </Button>
    </div>
  );
};

export default CompetitorProfile;