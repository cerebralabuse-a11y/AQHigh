import React, { useMemo } from 'react';

interface AnimeSkyBackgroundProps {
    aqi: number;
}

const AnimeSkyBackground: React.FC<AnimeSkyBackgroundProps> = ({ aqi }) => {
    const theme = useMemo(() => {
        if (aqi <= 50) {
            return {
                // Updated to match the "Makoto Shinkai" style reference: Cyan/Turquoise top, fading into pinkish horizon
                skyGradient: "from-[#4FACFE] via-[#00C6FB] to-[#FF9A9E]",
                cloudColor: "#FFFFFF",
                cloudShadow: "#FFC4CB", // Peach/Pink shadow
                sunColor: "#FFD700",
                rayColor: "rgba(255, 255, 255, 0.5)",
                atmosphere: "opacity-0",
                filter: "",
                cloudCount: 0,
                sparkleOpacity: 0.5
            };
        } else if (aqi <= 100) {
            return {
                skyGradient: "from-[#4CA1AF] via-[#C4E0E5] to-[#F6E0B5]",
                cloudColor: "#FFF8E7",
                cloudShadow: "#E6D5B8",
                sunColor: "#FFC65C",
                rayColor: "rgba(255, 236, 179, 0.3)",
                atmosphere: "bg-yellow-100/20 mix-blend-overlay",
                filter: "sepia(20%)",
                cloudCount: 0,
                sparkleOpacity: 0.3
            };
        } else if (aqi <= 200) {
            return {
                skyGradient: "from-[#2C3E50] via-[#FD746C] to-[#FF8235]",
                cloudColor: "#E0D7E5",
                cloudShadow: "#9A8C9E",
                sunColor: "#FF8C42",
                rayColor: "rgba(255, 140, 66, 0.2)",
                atmosphere: "bg-orange-500/10 mix-blend-multiply",
                filter: "contrast(110%)",
                cloudCount: 0,
                sparkleOpacity: 0.2
            };
        } else {
            // Hazardous: User requested "Vibrant colors like the clean state" but "remove clouds"
            // They want the intense, beautiful colors (Psychedelic pollution?)
            return {
                skyGradient: "from-[#4FACFE] via-[#00C6FB] to-[#FF9A9E]", // reused vibrant gradient
                cloudColor: "transparent",
                cloudShadow: "transparent",
                sunColor: "#FFD700",
                rayColor: "rgba(255, 255, 255, 0.5)",
                atmosphere: "bg-black/10 mix-blend-overlay",
                filter: "hue-rotate(-15deg) contrast(120%) saturate(150%)", // Make it "extreme" but colorful
                cloudCount: 0, // No clouds
                sparkleOpacity: 0.6
            };
        }
    }, [aqi]);

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-all duration-1000 bg-gradient-to-b ${theme.skyGradient} ${theme.filter}`}>
            {/* Sun / Light Source */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] rounded-full blur-[60px]"
                style={{ background: `radial-gradient(circle, ${theme.sunColor}, transparent 70%)` }} />

            {/* Sun Rays - CSS implementation using conical gradients or rotated divs */}
            <div className="absolute top-[-20%] right-[-20%] w-[100vh] h-[100vh] animate-slow-spin origin-center opacity-50 pointer-events-none">
                {/* Multiple rays */}
                {[...Array(6)].map((_, i) => (
                    <div key={i}
                        className="absolute top-1/2 left-1/2 w-full h-[60px] origin-left blur-xl"
                        style={{
                            background: `linear-gradient(90deg, ${theme.rayColor}, transparent)`,
                            transform: `rotate(${i * 60}deg) translateY(-50%)`,
                        }} />
                ))}
            </div>

            {/* Atmospheric Overlay */}
            <div className={`absolute inset-0 pointer-events-none z-20 ${theme.atmosphere}`} />

            {/* Clouds Layer 1 (Back, Slower) */}
            {theme.cloudCount > 0 && (
                <CloudLayer
                    count={Math.floor(theme.cloudCount * 0.6)}
                    baseColor={theme.cloudColor}
                    shadowColor={theme.cloudShadow}
                    speed={40}
                    scale={0.6}
                    opacity={0.8}
                    zIndex={10}
                />
            )}

            {/* Clouds Layer 2 (Front, Faster) */}
            {theme.cloudCount > 0 && (
                <CloudLayer
                    count={Math.ceil(theme.cloudCount * 0.4)}
                    baseColor={theme.cloudColor}
                    shadowColor={theme.cloudShadow}
                    speed={25}
                    scale={1.2}
                    opacity={0.9}
                    zIndex={20}
                />
            )}

            {/* Sparkles/Dust for Anime Feel */}
            <div className="absolute inset-0 z-30 pointer-events-none" style={{ opacity: theme.sparkleOpacity }}>
                {[...Array(15)].map((_, i) => (
                    <div key={i}
                        className="absolute rounded-full bg-white animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${Math.random() * 3 + 1}px`,
                            height: `${Math.random() * 3 + 1}px`,
                            animationDuration: `${Math.random() * 2 + 1}s`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

// Reusable Cloud Layer
const CloudLayer = ({ count, baseColor, shadowColor, speed, scale, opacity, zIndex }: any) => {
    const clouds = useMemo(() => {
        return [...Array(count)].map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 70 + 10,
            size: (0.8 + Math.random() * 0.6) * scale,
            delay: -Math.random() * speed,
            shape: Math.floor(Math.random() * 4) // Variated shapes including new one
        }));
    }, [count, scale, speed]);

    return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex }}>
            {clouds.map((cloud) => (
                <div key={cloud.id}
                    className="absolute animate-cloud-drift transition-colors duration-1000"
                    style={{
                        left: `${cloud.left}%`,
                        top: `${cloud.top}%`,
                        transform: `scale(${cloud.size})`,
                        animationDuration: `${speed + (Math.random() * 10)}s`,
                        animationDelay: `${cloud.delay}s`,
                        opacity: opacity
                    }}>
                    <AnimeCloudIcon base={baseColor} shadow={shadowColor} shape={cloud.shape} />
                </div>
            ))}
        </div>
    );
};

// Complex SVG Cloud Shapes 
const AnimeCloudIcon = ({ base, shadow, shape }: { base: string, shadow: string, shape: number }) => {
    // We can use filters to make them fluffy
    // In React SVG, filters need unique IDs if used multiple times, but here we can just use simple shapes
    // To get that "anime" look, we need rounded, billowing shapes with a bottom shadow

    return (
        <div className="relative w-64 h-32 filter drop-shadow-md" style={{ color: base }}>
            <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id={`cloudGrad_${shape}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={base} />
                        <stop offset="100%" stopColor={shadow} />
                    </linearGradient>
                </defs>

                <g fill={base}>
                    {shape === 0 && (
                        <path d="M152 66.5C149.1 47.6 132.8 33 113.5 33C96.9 33 82.3 42.9 76.5 58C74.6 57.4 72.5 57 70.5 57C51.5 57 36 72.5 36 91.5C36 110.5 51.5 126 70.5 126H154.5C173.5 126 189 110.5 189 91.5C189 74.1 176.4 59.7 159.9 56.8L152 66.5Z"
                            transform="translate(0, -20)" />
                    )}
                    {shape === 1 && (
                        <path d="M 50 80 A 30 30 0 0 1 100 80 A 40 40 0 0 1 170 80 A 25 25 0 0 1 190 95 Q 190 120 160 120 L 50 120 Q 20 120 20 95 A 25 25 0 0 1 50 80"
                            transform="translate(0, -20)" />
                    )}
                    {shape === 2 && (
                        <path d="M 40 90 A 30 30 0 0 1 90 70 A 40 45 0 0 1 160 85 A 30 30 0 0 1 180 110 L 40 110 Z"
                            transform="translate(0, -10)" />
                    )}
                    {shape === 3 && (
                        <path d="M 30 80 Q 50 50 80 50 T 130 50 T 170 80 T 190 110 L 30 110 Z"
                            transform="translate(0, -10)" />
                    )}
                </g>

                {/* Highlight/Shadow accent - Subtle gradient overlay */}
                <path d="M 50 115 Q 100 125 150 115" stroke={shadow} strokeWidth="3" fill="none" opacity="0.3" filter="blur(2px)" />
            </svg>
        </div>
    );
}

export default AnimeSkyBackground;
