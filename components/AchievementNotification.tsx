import React, { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import type { Achievement } from '../lib/supabase';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-20 right-4 z-50 max-w-sm bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-xl shadow-2xl p-6 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-4">
        <div className="bg-white/20 p-3 rounded-full">
          <Trophy size={32} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">Achievement Unlocked!</h3>
          <p className="text-xl font-semibold mb-1">{achievement.name}</p>
          <p className="text-sm text-white/90 mb-2">{achievement.description}</p>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="bg-white/20 px-2 py-1 rounded">+{achievement.xp_reward} XP</span>
          </div>
        </div>
      </div>

      {/* Confetti animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10px',
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${1 + Math.random()}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

