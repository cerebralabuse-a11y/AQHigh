import { Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Pollutant {
  value: number;
  name: string;
  unit: string;
  severity?: 'good' | 'moderate' | 'unhealthy';
}

interface TweetButtonProps {
  cigaretteCount: number;
  aqi: number;
  city: string;
  pollutants: Record<string, Pollutant>;
}

const TweetButton = ({ cigaretteCount, aqi, city, pollutants }: TweetButtonProps) => {
  const getDominantPollutant = () => {
    const relevantPollutants = Object.values(pollutants).filter(p => p.severity);
    if (relevantPollutants.length === 0) return null;

    // Sort by severity weight
    const severityWeight = { 'unhealthy': 3, 'moderate': 2, 'good': 1 };

    return relevantPollutants.sort((a, b) => {
      const weightA = severityWeight[a.severity || 'good'] || 0;
      const weightB = severityWeight[b.severity || 'good'] || 0;
      return weightB - weightA;
    })[0];
  };

  const generateTweetText = () => {
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const dominant = getDominantPollutant();
    const isHealthy = aqi <= 50;

    const statusText = isHealthy
      ? `✨ Status: Clean Air & Healthy Atmosphere`
      : dominant
        ? `⚠️ Highest Pollutant: ${dominant.name} (${dominant.value}${dominant.unit})`
        : `⚠️ PM2.5: ${pollutants['pm2_5']?.value || 'N/A'}${pollutants['pm2_5']?.unit || ''}`;

    const cigText = cigaretteCount >= 1
      ? `🚬 Cigarette Equivalent: ${Math.ceil(cigaretteCount)} cigs/day\n`
      : `🫁 Breathing: Healthy\n`;

    return `Today's Air Quality in ${city}\n\n` +
      `🌍 AQI: ${aqi}\n` +
      `${cigText}` +
      `${statusText}\n` +
      `📅 ${date}\n\n` +
      `#AQHigh #AirQuality #OpenWeather #ClimateAction`;
  };

  const handleTweet = () => {
    const tweetText = generateTweetText();
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

    window.open(tweetUrl, '_blank', 'width=550,height=420');

    toast.success("Tweet composed!", {
      description: "Ready to share your local air quality stats.",
    });
  };

  return (
    <Button
      onClick={handleTweet}
      className="w-full neumorphic-blend hover:bg-card/40 text-foreground rounded-2xl py-6 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
      variant="ghost"
    >
      <Twitter className="w-5 h-5 mr-2" />
      Share Update
    </Button>
  );
};

export default TweetButton;