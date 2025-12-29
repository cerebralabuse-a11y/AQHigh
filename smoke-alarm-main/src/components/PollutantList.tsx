import { AlertTriangle, CheckCircle2, Wind, Thermometer, Droplets, Info } from "lucide-react";

interface Pollutant {
    value: number;
    name: string;
    unit: string;
    severity?: 'good' | 'moderate' | 'unhealthy';
}

interface PollutantListProps {
    pollutants: Record<string, Pollutant>;
}

const PollutantList = ({ pollutants }: PollutantListProps) => {
    const pollutantKeys = Object.keys(pollutants);

    if (pollutantKeys.length === 0) return null;

    const getIcon = (key: string) => {
        if (key === 't') return Thermometer;
        if (key === 'h') return Droplets;
        if (key === 'p') return Info;
        if (key === 'w' || key === 'wg') return Wind;
        return null;
    };

    return (
        <div className="w-full space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-sm font-medium text-foreground/50 uppercase tracking-wider pl-1">
                Current Metrics
            </h3>

            <div className="grid grid-cols-2 gap-3">
                {pollutantKeys.map((key) => {
                    const item = pollutants[key];
                    const isWeather = ['t', 'h', 'p', 'w', 'wg'].includes(key);
                    const Icon = getIcon(key);

                    let statusColor = "";
                    let statusBg = "";
                    let isHigh = false;

                    if (isWeather || !item.severity) {
                        // Neutral for weather
                        statusColor = "text-foreground/40";
                        statusBg = "bg-foreground/5";
                    } else {
                        // Use pre-calculated status
                        if (item.severity === 'good') {
                            statusColor = "text-green-500";
                            statusBg = "bg-green-500/10";
                        } else if (item.severity === 'moderate') {
                            statusColor = "text-yellow-500";
                            statusBg = "bg-yellow-500/10";
                        } else {
                            statusColor = "text-red-500";
                            statusBg = "bg-red-500/10";
                            isHigh = true;
                        }
                    }

                    return (
                        <div
                            key={key}
                            className={`
                                relative overflow-hidden
                                neumorphic-blend p-3 rounded-2xl flex flex-col gap-1 
                                transition-all duration-300 hover:scale-[1.02]
                                ${isHigh ? 'border border-red-500/30' : ''}
                            `}
                        >
                            {/* Glow effect for high pollutants */}
                            {isHigh && (
                                <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 blur-2xl -mr-8 -mt-8 pointer-events-none" />
                            )}

                            <div className="flex justify-between items-start">
                                <span className="text-sm font-bold text-foreground/80">
                                    {item.name}
                                </span>
                                {isWeather ? (
                                    Icon && <Icon className="w-3.5 h-3.5 text-foreground/40" />
                                ) : (
                                    isHigh ? (
                                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                    ) : (
                                        <CheckCircle2 className={`w-3.5 h-3.5 ${item.severity === 'good' ? 'text-green-500' : 'text-yellow-500'}`} />
                                    )
                                )}
                            </div>

                            <div className="flex items-end justify-between mt-1">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-display font-semibold text-foreground">
                                        {item.value}
                                    </span>
                                    <span className="text-xs font-medium text-foreground/40">
                                        {item.unit}
                                    </span>
                                </div>

                                {!isWeather && item.severity && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBg} ${statusColor} capitalize`}>
                                        {item.severity}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="text-[10px] text-foreground/30 text-center italic mt-2">
                All values converted to actual concentrations (µg/m³, ppb, etc.)
            </p>
        </div>
    );
};

export default PollutantList;
