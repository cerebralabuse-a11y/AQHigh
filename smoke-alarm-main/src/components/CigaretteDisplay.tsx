import { useEffect, useState } from "react";

interface CigaretteDisplayProps {
  count: number;
  isActive: boolean;
}

const CigaretteDisplay = ({ count, isActive }: CigaretteDisplayProps) => {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setDisplayCount(count);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [count]);

  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center">
        {/* Boxy Healthy Lungs */}
        <div className="relative animate-float-slow scale-150">
          <svg width="220" height="220" viewBox="0 0 220 220" className="cigarette-icon">
            <defs>
              <linearGradient id="lungGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFC0CB" />
                <stop offset="30%" stopColor="#FFB3BA" />
                <stop offset="70%" stopColor="#FF9AA2" />
                <stop offset="100%" stopColor="#FF8A95" />
              </linearGradient>
              <linearGradient id="lungGradientRight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFC0CB" />
                <stop offset="30%" stopColor="#FFB3BA" />
                <stop offset="70%" stopColor="#FF9AA2" />
                <stop offset="100%" stopColor="#FF8A95" />
              </linearGradient>
              <linearGradient id="bronchiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFE5E8" />
                <stop offset="50%" stopColor="#FFD1D5" />
                <stop offset="100%" stopColor="#FFB3BA" />
              </linearGradient>
              <filter id="lungShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.15" />
              </filter>
            </defs>
            
            {/* Left Lung - Enhanced Boxy Design */}
            <g filter="url(#lungShadow)">
              {/* Main left lung body - larger and more defined */}
              <rect x="15" y="70" width="75" height="110" rx="10" fill="url(#lungGradientLeft)" />
              {/* Upper lobe - more prominent */}
              <rect x="20" y="70" width="65" height="40" rx="8" fill="url(#lungGradientLeft)" />
              {/* Middle lobe */}
              <rect x="25" y="115" width="55" height="35" rx="6" fill="url(#lungGradientLeft)" />
              {/* Lower lobe */}
              <rect x="20" y="155" width="60" height="25" rx="6" fill="url(#lungGradientLeft)" />
              {/* Bronchial tree - more detailed boxy branches */}
              <rect x="47" y="70" width="4" height="110" rx="2" fill="#FFE5E8" opacity="0.7" />
              <rect x="57" y="80" width="3" height="90" rx="1.5" fill="#FFE5E8" opacity="0.6" />
              <rect x="37" y="85" width="3" height="80" rx="1.5" fill="#FFE5E8" opacity="0.6" />
              <rect x="67" y="90" width="2" height="70" rx="1" fill="#FFE5E8" opacity="0.5" />
              {/* Alveoli - small boxy details */}
              <rect x="30" y="95" width="8" height="8" rx="1" fill="#FFE5E8" opacity="0.4" />
              <rect x="50" y="105" width="8" height="8" rx="1" fill="#FFE5E8" opacity="0.4" />
              <rect x="40" y="130" width="8" height="8" rx="1" fill="#FFE5E8" opacity="0.4" />
            </g>
            
            {/* Right Lung - Enhanced Boxy Design */}
            <g filter="url(#lungShadow)">
              {/* Main right lung body */}
              <rect x="130" y="70" width="75" height="110" rx="10" fill="url(#lungGradientRight)" />
              {/* Upper lobe */}
              <rect x="135" y="70" width="65" height="40" rx="8" fill="url(#lungGradientRight)" />
              {/* Middle lobe */}
              <rect x="140" y="115" width="55" height="35" rx="6" fill="url(#lungGradientRight)" />
              {/* Lower lobe */}
              <rect x="135" y="155" width="60" height="25" rx="6" fill="url(#lungGradientRight)" />
              {/* Bronchial tree */}
              <rect x="169" y="70" width="4" height="110" rx="2" fill="#FFE5E8" opacity="0.7" />
              <rect x="160" y="80" width="3" height="90" rx="1.5" fill="#FFE5E8" opacity="0.6" />
              <rect x="180" y="85" width="3" height="80" rx="1.5" fill="#FFE5E8" opacity="0.6" />
              <rect x="151" y="90" width="2" height="70" rx="1" fill="#FFE5E8" opacity="0.5" />
              {/* Alveoli */}
              <rect x="182" y="95" width="8" height="8" rx="1" fill="#FFE5E8" opacity="0.4" />
              <rect x="162" y="105" width="8" height="8" rx="1" fill="#FFE5E8" opacity="0.4" />
              <rect x="172" y="130" width="8" height="8" rx="1" fill="#FFE5E8" opacity="0.4" />
            </g>
            
            {/* Trachea/Windpipe - Enhanced Boxy */}
            <g filter="url(#lungShadow)">
              <rect x="100" y="45" width="20" height="35" rx="4" fill="url(#bronchiGradient)" />
              {/* Tracheal rings - more defined */}
              <rect x="102" y="52" width="16" height="3" rx="1.5" fill="#FFB3BA" opacity="0.5" />
              <rect x="102" y="58" width="16" height="3" rx="1.5" fill="#FFB3BA" opacity="0.5" />
              <rect x="102" y="64" width="16" height="3" rx="1.5" fill="#FFB3BA" opacity="0.5" />
              <rect x="102" y="70" width="16" height="3" rx="1.5" fill="#FFB3BA" opacity="0.5" />
            </g>
            
            {/* Healthy glow effect - more subtle */}
            <ellipse cx="110" cy="125" rx="100" ry="90" fill="#90EE90" opacity="0.08" />
          </svg>
        </div>
        
        {/* Health message */}
        <p className="mt-8 text-center text-sm text-foreground/60 max-w-[200px]">
          Clean air - healthy breathing!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {/* 3D-style Cigarette */}
      <div className="relative animate-float-slow scale-150">
        <svg width="160" height="200" viewBox="0 0 160 200" className="cigarette-icon">
          <defs>
            <linearGradient id="filterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4A574" />
              <stop offset="50%" stopColor="#C4956A" />
              <stop offset="100%" stopColor="#B8895E" />
            </linearGradient>
            <linearGradient id="paperGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FAFAFA" />
              <stop offset="50%" stopColor="#F5F5F5" />
              <stop offset="100%" stopColor="#EFEFEF" />
            </linearGradient>
            <linearGradient id="burnGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF6B35" />
              <stop offset="50%" stopColor="#F7931E" />
              <stop offset="100%" stopColor="#E85D04" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.15" />
            </filter>
          </defs>
          
          {/* Main cigarette body */}
          <g filter="url(#shadow)">
            {/* Filter section */}
            <rect x="55" y="130" width="50" height="50" rx="4" fill="url(#filterGradient)" />
            <rect x="58" y="135" width="44" height="2" fill="#C8A06B" opacity="0.5" />
            <rect x="58" y="145" width="44" height="2" fill="#C8A06B" opacity="0.5" />
            <rect x="58" y="155" width="44" height="2" fill="#C8A06B" opacity="0.5" />
            <rect x="58" y="165" width="44" height="2" fill="#C8A06B" opacity="0.5" />
            
            {/* Paper section */}
            <rect x="55" y="40" width="50" height="90" rx="2" fill="url(#paperGradient)" />
            
            {/* Burning end */}
            <rect x="55" y="30" width="50" height="15" rx="2" fill="url(#burnGradient)" className="animate-pulse-soft" />
            <rect x="57" y="32" width="46" height="4" fill="#4A4A4A" opacity="0.3" rx="1" />
          </g>
          
          {/* Smoke wisps */}
          <g className="animate-smoke" style={{ transformOrigin: '80px 30px' }}>
            <ellipse cx="75" cy="15" rx="8" ry="6" fill="currentColor" opacity="0.15" />
            <ellipse cx="85" cy="8" rx="6" ry="5" fill="currentColor" opacity="0.1" />
          </g>
        </svg>
        
        {/* Count badge */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass-card card-glow px-6 py-3 rounded-full shadow-lg">
          <span className="font-display text-3xl font-bold text-foreground text-glow">×{Math.ceil(count)}</span>
        </div>
      </div>
      
      {/* Health message */}
      <p className="mt-8 text-center text-sm text-foreground/60 max-w-[200px]">
        {getHealthMessage(count)}
      </p>
    </div>
  );
};

const getHealthMessage = (count: number): string => {
  if (count < 1) return "Relatively safe air today";
  if (count < 3) return "Light pollution exposure";
  if (count < 5) return "Moderate health impact";
  if (count < 10) return "Heavy pollution - mask recommended";
  if (count < 20) return "Severe exposure - stay indoors";
  return "Hazardous - avoid outdoor activity";
};

export default CigaretteDisplay;