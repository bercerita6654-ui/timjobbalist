import React from 'react';

interface CharacterAvatarIconProps {
  avatarId: string;
  gender?: 'male' | 'female';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const CharacterAvatarIcon: React.FC<CharacterAvatarIconProps> = ({
  avatarId,
  gender = 'male',
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-13 h-13 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  // Dedicated SVG character avatars
  switch (avatarId) {
    // === MALE AVATARS ===
    case 'male-leader':
      return (
        <div className={`rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 overflow-hidden ${sizeClasses[size]} ${className}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            <circle cx="20" cy="15" r="7" fill="#FCD34D" />
            <path d="M13 13C13 9 16 6 20 6C24 6 27 9 27 13C25 11 22 10 20 10C17 10 14 11 13 13Z" fill="#1E293B" />
            <circle cx="17.5" cy="15" r="1" fill="#0F172A" />
            <circle cx="22.5" cy="15" r="1" fill="#0F172A" />
            <path d="M18 18Q20 19.5 22 18" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
            {/* Glasses */}
            <rect x="15" y="13.5" width="4" height="3" rx="1" stroke="#334155" strokeWidth="1" fill="none" />
            <rect x="21" y="13.5" width="4" height="3" rx="1" stroke="#334155" strokeWidth="1" fill="none" />
            <line x1="19" y1="15" x2="21" y2="15" stroke="#334155" strokeWidth="1" />
            {/* Body: Navy Suit & Tie */}
            <path d="M9 36C9 28 14 24 20 24C26 24 31 28 31 36" fill="#1E1B4B" />
            <path d="M18 24L20 31L22 24" fill="#FFFFFF" />
            <path d="M19.5 27L20 34L20.5 27" stroke="#DC2626" strokeWidth="1.5" />
          </svg>
        </div>
      );

    case 'male-packing':
      return (
        <div className={`rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 overflow-hidden ${sizeClasses[size]} ${className}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            <circle cx="20" cy="16" r="7" fill="#FCD34D" />
            {/* Cap worn backwards / forward */}
            <path d="M12 14C12 9 16 7 20 7C24 7 28 9 28 14H12Z" fill="#0284C7" />
            <path d="M28 14L33 13" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
            <circle cx="17.5" cy="16" r="1" fill="#0F172A" />
            <circle cx="22.5" cy="16" r="1" fill="#0F172A" />
            <path d="M18 19Q20 20.5 22 19" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
            {/* Body: Logistics Work Vest */}
            <path d="M9 36C9 29 14 25 20 25C26 25 31 29 31 36" fill="#0369A1" />
            <rect x="14" y="27" width="12" height="9" rx="1" fill="#F59E0B" />
            <line x1="16" y1="31" x2="24" y2="31" stroke="#FFFFFF" strokeWidth="1.2" />
          </svg>
        </div>
      );

    case 'male-nota':
      return (
        <div className={`rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 overflow-hidden ${sizeClasses[size]} ${className}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            <circle cx="20" cy="15" r="7" fill="#FCD34D" />
            <path d="M13 13C13 8 16 6 20 6C25 6 27 9 27 14C23 11 18 11 13 13Z" fill="#334155" />
            <circle cx="17.5" cy="15" r="1" fill="#0F172A" />
            <circle cx="22.5" cy="15" r="1" fill="#0F172A" />
            <path d="M18 18Q20 19.5 22 18" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
            {/* Body: Blue Shirt with Pen Pocket */}
            <path d="M9 36C9 28 14 24 20 24C26 24 31 28 31 36" fill="#1D4ED8" />
            <path d="M18 24L20 28L22 24" fill="#FFFFFF" />
            <rect x="23" y="28" width="4" height="6" rx="1" fill="#1E40AF" />
            <line x1="25" y1="27" x2="25" y2="30" stroke="#FBBF24" strokeWidth="1" />
          </svg>
        </div>
      );

    case 'male-admin':
      return (
        <div className={`rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 overflow-hidden ${sizeClasses[size]} ${className}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            <circle cx="20" cy="15" r="7" fill="#FCD34D" />
            {/* Hair */}
            <path d="M13 14C13 8 17 6 20 6C23 6 27 8 27 14C24 11 17 11 13 14Z" fill="#18181B" />
            {/* Headset Communication */}
            <path d="M12 16C12 11 15 8 20 8C25 8 28 11 28 16" stroke="#475569" strokeWidth="1.5" fill="none" />
            <rect x="11" y="14" width="2.5" height="4" rx="1" fill="#0F172A" />
            <rect x="26.5" y="14" width="2.5" height="4" rx="1" fill="#0F172A" />
            <path d="M28 17L25 21H22" stroke="#475569" strokeWidth="1" />
            <circle cx="17.5" cy="15" r="1" fill="#0F172A" />
            <circle cx="22.5" cy="15" r="1" fill="#0F172A" />
            <path d="M18 18Q20 19.5 22 18" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
            {/* Body: Casual Polo */}
            <path d="M9 36C9 28 14 24 20 24C26 24 31 28 31 36" fill="#047857" />
            <path d="M17 24L20 27L23 24" fill="#A7F3D0" />
          </svg>
        </div>
      );

    case 'male-creative':
      return (
        <div className={`rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 overflow-hidden ${sizeClasses[size]} ${className}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            <circle cx="20" cy="15" r="7" fill="#FCD34D" />
            {/* Trendy Pompadour Hair */}
            <path d="M12 13C12 7 15 5 21 5C26 5 28 8 27 13C25 10 22 9 20 9C16 9 14 11 12 13Z" fill="#78350F" />
            <circle cx="17.5" cy="15" r="1" fill="#0F172A" />
            <circle cx="22.5" cy="15" r="1" fill="#0F172A" />
            <path d="M17.5 18Q20 20 22.5 18" stroke="#0F172A" strokeWidth="1.2" strokeLinecap="round" />
            {/* Body: Hoodie */}
            <path d="M9 36C9 28 14 24 20 24C26 24 31 28 31 36" fill="#7C3AED" />
            <path d="M18 24Q20 28 22 24" fill="#C4B5FD" />
          </svg>
        </div>
      );

    // === FEMALE AVATARS ===
    case 'female-admin':
      return (
        <div className={`rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 overflow-hidden ${sizeClasses[size]} ${className}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            {/* Hijab / Elegant Hair Wrap */}
            <path d="M12 18C12 9 15 6 20 6C25 6 28 9 28 18C28 23 25 25 20 25C15 25 12 23 12 18Z" fill="#9F1239" />
            {/* Face */}
            <circle cx="20" cy="15.5" r="5.5" fill="#FCD34D" />
            <circle cx="18" cy="15.5" r="0.9" fill="#0F172A" />
            <circle cx="22" cy="15.5" r="0.9" fill="#0F172A" />
            {/* Eyelashes & Smile */}
            <path d="M17 14L18 14.5" stroke="#0F172A" strokeWidth="0.8" />
            <path d="M23 14L22 14.5" stroke="#0F172A" strokeWidth="0.8" />
            <path d="M18.5 18Q20 19.2 21.5 18" stroke="#E11D48" strokeWidth="1" strokeLinecap="round" />
            {/* Body: Rose Blazer */}
            <path d="M9 36C9 28 14 24 20 24C26 24 31 28 31 36" fill="#BE123C" />
            <path d="M17 24L20 29L23 24" fill="#FFE4E6" />
          </svg>
        </div>
      );

    case 'female-live':
      return (
        <div className={`rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 overflow-hidden ${sizeClasses[size]} ${className}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            {/* Long Wavy Hair Behind */}
            <path d="M11 16C11 9 15 6 20 6C25 6 29 9 29 16C29 25 28 28 28 32H12C12 28 11 25 11 16Z" fill="#713F12" />
            <circle cx="20" cy="15" r="6" fill="#FDE68A" />
            {/* Hair bangs */}
            <path d="M13 12C16 10 24 10 27 12C26 9 23 7 20 7C17 7 14 9 13 12Z" fill="#713F12" />
            <circle cx="18" cy="15" r="1" fill="#0F172A" />
            <circle cx="22" cy="15" r="1" fill="#0F172A" />
            {/* Cute Blush */}
            <ellipse cx="16.5" cy="17" rx="1.5" ry="0.8" fill="#FDA4AF" />
            <ellipse cx="23.5" cy="17" rx="1.5" ry="0.8" fill="#FDA4AF" />
            <path d="M18.5 17.8Q20 19.3 21.5 17.8" stroke="#BE185D" strokeWidth="1" strokeLinecap="round" />
            {/* Hair Bow / Ribbon */}
            <path d="M24 8L27 6L26 9Z" fill="#EC4899" />
            {/* Body */}
            <path d="M9 36C9 28 14 24 20 24C26 24 31 28 31 36" fill="#DB2777" />
            <circle cx="20" cy="27" r="2" fill="#FDF2F8" />
          </svg>
        </div>
      );

    case 'female-katalog':
      return (
        <div className={`rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 overflow-hidden ${sizeClasses[size]} ${className}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            {/* Ponytail / Sleek Hair */}
            <circle cx="27" cy="11" r="3.5" fill="#1E293B" />
            <path d="M12 15C12 8 16 6 20 6C24 6 28 8 28 15C25 11 18 11 12 15Z" fill="#1E293B" />
            <circle cx="20" cy="15" r="6" fill="#FCD34D" />
            {/* Glasses */}
            <rect x="15.5" y="13.5" width="3.5" height="3" rx="1" stroke="#9333EA" strokeWidth="1" fill="none" />
            <rect x="21" y="13.5" width="3.5" height="3" rx="1" stroke="#9333EA" strokeWidth="1" fill="none" />
            <line x1="19" y1="15" x2="21" y2="15" stroke="#9333EA" strokeWidth="1" />
            <circle cx="17.2" cy="15" r="0.8" fill="#0F172A" />
            <circle cx="22.7" cy="15" r="0.8" fill="#0F172A" />
            <path d="M18.5 18Q20 19 21.5 18" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
            {/* Body: Purple Cardigan */}
            <path d="M9 36C9 28 14 24 20 24C26 24 31 28 31 36" fill="#7E22CE" />
            <path d="M17 24L20 29L23 24" fill="#F3E8FF" />
          </svg>
        </div>
      );

    case 'female-packing':
      return (
        <div className={`rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 overflow-hidden ${sizeClasses[size]} ${className}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            {/* Bandana / Work Wrap */}
            <path d="M12 14C12 8 16 6 20 6C24 6 28 8 28 14H12Z" fill="#D97706" />
            <line x1="12" y1="14" x2="28" y2="14" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="20" cy="16" r="6" fill="#FCD34D" />
            <circle cx="18" cy="16" r="1" fill="#0F172A" />
            <circle cx="22" cy="16" r="1" fill="#0F172A" />
            <path d="M18.5 19Q20 20.2 21.5 19" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
            {/* Body: Work Apron */}
            <path d="M9 36C9 28 14 25 20 25C26 25 31 28 31 36" fill="#B45309" />
            <rect x="15" y="27" width="10" height="9" rx="1" fill="#FEF3C7" />
          </svg>
        </div>
      );

    case 'female-finance':
      return (
        <div className={`rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 overflow-hidden ${sizeClasses[size]} ${className}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            {/* Elegant Bob Hair */}
            <path d="M12 16C12 9 15 6 20 6C25 6 28 9 28 16C28 21 27 23 27 23H13C13 23 12 21 12 16Z" fill="#1C1917" />
            <circle cx="20" cy="15" r="5.5" fill="#FCD34D" />
            <circle cx="18" cy="15" r="0.9" fill="#0F172A" />
            <circle cx="22" cy="15" r="0.9" fill="#0F172A" />
            <path d="M18.5 18Q20 19 21.5 18" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
            {/* Body: Emerald Blazer */}
            <path d="M9 36C9 28 14 24 20 24C26 24 31 28 31 36" fill="#0F766E" />
            <path d="M18 24L20 28L22 24" fill="#CCFBF1" />
          </svg>
        </div>
      );

    // Fallback: Default Clean Gender Avatar
    default:
      if (gender === 'female') {
        return (
          <div className={`rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 overflow-hidden ${sizeClasses[size]} ${className}`}>
            <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
              <circle cx="20" cy="15" r="6" fill="#FCD34D" />
              <path d="M12 16C12 8 16 6 20 6C24 6 28 8 28 16C27 21 27 22 27 22H13C13 22 12 21 12 16Z" fill="#881337" />
              <circle cx="18" cy="15" r="1" fill="#0F172A" />
              <circle cx="22" cy="15" r="1" fill="#0F172A" />
              <path d="M18.5 18Q20 19 21.5 18" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
              <path d="M9 36C9 28 14 24 20 24C26 24 31 28 31 36" fill="#9F1239" />
            </svg>
          </div>
        );
      }
      return (
        <div className={`rounded-xl bg-gradient-to-tr from-indigo-600 to-slate-700 text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 overflow-hidden ${sizeClasses[size]} ${className}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            <circle cx="20" cy="15" r="6.5" fill="#FCD34D" />
            <path d="M13 13C13 8 16 6 20 6C24 6 27 8 27 13C24 10 17 10 13 13Z" fill="#1E293B" />
            <circle cx="18" cy="15" r="1" fill="#0F172A" />
            <circle cx="22" cy="15" r="1" fill="#0F172A" />
            <path d="M18.5 18Q20 19.5 21.5 18" stroke="#0F172A" strokeWidth="1" strokeLinecap="round" />
            <path d="M9 36C9 28 14 24 20 24C26 24 31 28 31 36" fill="#312E81" />
          </svg>
        </div>
      );
  }
};
