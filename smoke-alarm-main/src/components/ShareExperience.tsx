import { Share2, Camera, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { useRef, useState } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";

interface ShareExperienceProps {
    aqi: number;
    cigarettes: number;
    city: string;
}

const CigaretteIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 160 200" className={className}>
        <defs>
            <linearGradient id="staticFilterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D4A574" />
                <stop offset="50%" stopColor="#C4956A" />
                <stop offset="100%" stopColor="#B8895E" />
            </linearGradient>
            <linearGradient id="staticPaperGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FAFAFA" />
                <stop offset="50%" stopColor="#F5F5F5" />
                <stop offset="100%" stopColor="#EFEFEF" />
            </linearGradient>
            <linearGradient id="staticBurnGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF6B35" />
                <stop offset="50%" stopColor="#F7931E" />
                <stop offset="100%" stopColor="#E85D04" />
            </linearGradient>
        </defs>

        {/* Main cigarette body */}
        <g>
            {/* Filter section */}
            <rect x="55" y="130" width="50" height="50" rx="4" fill="url(#staticFilterGradient)" />
            <rect x="58" y="135" width="44" height="2" fill="#C8A06B" opacity="0.5" />
            <rect x="58" y="145" width="44" height="2" fill="#C8A06B" opacity="0.5" />
            <rect x="58" y="155" width="44" height="2" fill="#C8A06B" opacity="0.5" />
            <rect x="58" y="165" width="44" height="2" fill="#C8A06B" opacity="0.5" />

            {/* Paper section */}
            <rect x="55" y="40" width="50" height="90" rx="2" fill="url(#staticPaperGradient)" />

            {/* Burning end - No animation */}
            <rect x="55" y="30" width="50" height="15" rx="2" fill="url(#staticBurnGradient)" />
            <rect x="57" y="32" width="46" height="4" fill="#4A4A4A" opacity="0.3" rx="1" />
        </g>

        {/* Smoke wisps - No animation */}
        <g style={{ transformOrigin: '80px 30px' }}>
            <ellipse cx="75" cy="15" rx="8" ry="6" fill="#F4F4F5" opacity="0.4" />
            <ellipse cx="85" cy="8" rx="6" ry="5" fill="#F4F4F5" opacity="0.3" />
        </g>
    </svg>
);

const LungIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 220 220" className={className}>
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
        </defs>

        {/* Left Lung - Enhanced Boxy Design */}
        <g>
            <rect x="15" y="70" width="75" height="110" rx="10" fill="url(#lungGradientLeft)" />
            <rect x="20" y="70" width="65" height="40" rx="8" fill="url(#lungGradientLeft)" />
            <rect x="25" y="115" width="55" height="35" rx="6" fill="url(#lungGradientLeft)" />
            <rect x="20" y="155" width="60" height="25" rx="6" fill="url(#lungGradientLeft)" />
            <rect x="47" y="70" width="4" height="110" rx="2" fill="#FFE5E8" opacity="0.7" />
            <rect x="57" y="80" width="3" height="90" rx="1.5" fill="#FFE5E8" opacity="0.6" />
            <rect x="37" y="85" width="3" height="80" rx="1.5" fill="#FFE5E8" opacity="0.6" />
            <rect x="67" y="90" width="2" height="70" rx="1" fill="#FFE5E8" opacity="0.5" />
            <rect x="30" y="95" width="8" height="8" rx="1" fill="#FFE5E8" opacity="0.4" />
            <rect x="50" y="105" width="8" height="8" rx="1" fill="#FFE5E8" opacity="0.4" />
            <rect x="40" y="130" width="8" height="8" rx="1" fill="#FFE5E8" opacity="0.4" />
        </g>

        {/* Right Lung - Enhanced Boxy Design */}
        <g>
            <rect x="130" y="70" width="75" height="110" rx="10" fill="url(#lungGradientRight)" />
            <rect x="135" y="70" width="65" height="40" rx="8" fill="url(#lungGradientRight)" />
            <rect x="140" y="115" width="55" height="35" rx="6" fill="url(#lungGradientRight)" />
            <rect x="135" y="155" width="60" height="25" rx="6" fill="url(#lungGradientRight)" />
            <rect x="169" y="70" width="4" height="110" rx="2" fill="#FFE5E8" opacity="0.7" />
            <rect x="160" y="80" width="3" height="90" rx="1.5" fill="#FFE5E8" opacity="0.6" />
            <rect x="180" y="85" width="3" height="80" rx="1.5" fill="#FFE5E8" opacity="0.6" />
            <rect x="151" y="90" width="2" height="70" rx="1" fill="#FFE5E8" opacity="0.5" />
            <rect x="182" y="95" width="8" height="8" rx="1" fill="#FFE5E8" opacity="0.4" />
            <rect x="162" y="105" width="8" height="8" rx="1" fill="#FFE5E8" opacity="0.4" />
            <rect x="172" y="130" width="8" height="8" rx="1" fill="#FFE5E8" opacity="0.4" />
        </g>

        {/* Trachea/Windpipe - Enhanced Boxy */}
        <g>
            <rect x="100" y="45" width="20" height="35" rx="4" fill="url(#bronchiGradient)" />
            <rect x="102" y="52" width="16" height="3" rx="1.5" fill="#FFB3BA" opacity="0.5" />
            <rect x="102" y="58" width="16" height="3" rx="1.5" fill="#FFB3BA" opacity="0.5" />
            <rect x="102" y="64" width="16" height="3" rx="1.5" fill="#FFB3BA" opacity="0.5" />
            <rect x="102" y="70" width="16" height="3" rx="1.5" fill="#FFB3BA" opacity="0.5" />
        </g>
    </svg>
);

const ShareExperience = ({ aqi, cigarettes, city }: ShareExperienceProps) => {
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // If cigarettes < 1, we consider it healthy/0 for display purposes in the share card
    const isHealthy = cigarettes < 1;
    const displayCigarettes = 0; // "Round up to 0" as requested, for display when healthy

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setBackgroundImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCameraClick = () => {
        fileInputRef.current?.click();
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;

        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true, // Important for external images if any
                scale: 2, // Better quality
                backgroundColor: null,
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `aqhigh-experience-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Image saved!", {
                description: "Your experience card has been downloaded.",
            });
        } catch (error) {
            console.error("Error generating image:", error);
            toast.error("Failed to save image", {
                description: "Please try again later.",
            });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    className="w-full neumorphic-blend hover:bg-card/40 text-foreground rounded-2xl py-6 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                    variant="ghost"
                >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share Experience
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-none shadow-2xl">
                <div ref={cardRef} className="relative aspect-[4/5] w-full bg-slate-900 group">
                    {/* Background Image / Placeholder */}
                    {backgroundImage ? (
                        <img
                            src={backgroundImage}
                            alt="Experience background"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
                    )}

                    {/* Overlay Gradient for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Top Bar */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10">
                        <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            <span className="text-white/90 text-xs font-semibold uppercase tracking-wider">
                                AQHigh
                            </span>
                        </div>
                    </div>

                    {/* Strava-like Stats Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10 text-white">
                        <div className="flex flex-col gap-1 mb-6">
                            <h2 className="text-3xl font-bold font-display leading-none">
                                {city}
                            </h2>
                            <p className="text-white/60 text-sm font-medium uppercase tracking-wide">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-1">
                                    Air Quality
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold leading-none">
                                        {aqi}
                                    </span>
                                    <span className="text-sm font-medium text-white/80">AQI</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-1">
                                    {isHealthy ? "Breathing" : "Smoked"}
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-baseline gap-1">
                                        <span className={cn("text-4xl font-bold leading-none", isHealthy ? "text-green-400" : "text-orange-400")}>
                                            {isHealthy ? "Healthy" : cigarettes.toFixed(1)}
                                        </span>
                                        {!isHealthy && <span className="text-sm font-medium text-white/80">Cigs</span>}
                                    </div>
                                    <div className="w-8 h-10 -mt-2">
                                        {isHealthy ? (
                                            <LungIcon className="w-full h-full drop-shadow-lg" />
                                        ) : (
                                            <CigaretteIcon className="w-full h-full drop-shadow-lg" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls - These are visually hidden in the capture because of opacity-0 by default,
                        and html2canvas doesn't trigger hover.
                        However, to be safe, we can add data-html2canvas-ignore attribute if needed,
                        but usually opacity-0 works fine.
                        Actually, let's explicitly add the attribute to be safe.
                    */}
                    <div
                        className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        data-html2canvas-ignore="true"
                    >
                        {!backgroundImage && (
                            <Button
                                onClick={handleCameraClick}
                                variant="secondary"
                                size="icon"
                                className="rounded-full h-16 w-16 bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/50"
                            >
                                <Camera className="w-8 h-8 text-white" />
                            </Button>
                        )}
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />
                </div>

                {/* Footer Actions */}
                <div className="p-4 flex gap-3 bg-background/50 backdrop-blur-md">
                    <Button
                        variant="outline"
                        className="flex-1 border-foreground/10 hover:bg-foreground/5"
                        onClick={handleCameraClick}
                    >
                        <Camera className="w-4 h-4 mr-2" />
                        {backgroundImage ? 'Retake Photo' : 'Add Photo'}
                    </Button>
                    <Button
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={handleDownload}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Save Image
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareExperience;
