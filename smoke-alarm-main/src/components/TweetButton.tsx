import { Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TweetButtonProps {
  cigaretteCount: number;
  aqi: number;
  city: string;
  isCleanAir?: boolean;
}

const TweetButton = ({ cigaretteCount, aqi, city, isCleanAir = false }: TweetButtonProps) => {
  const generateTweetText = () => {
    if (isCleanAir) {
      const cleanMessages = [
        `🫁 Just checked my AQI in ${city}: ${aqi}\n\nClean air! Breathing healthy today 🌿\n\nThis is how it should be everywhere!\n\n#AirQuality #CleanAir #ClimateAction`,
        `✨ Good news: ${city} has clean air today!\n\nAQI: ${aqi} - Healthy breathing 🫁\n\nLet's keep it this way!\n\n#AirQuality #PublicHealth`,
        `🌱 ${city} is breathing easy today!\n\nAQI: ${aqi} - Clean air, healthy lungs 🫁\n\nMore cities should follow this example!\n\n#CleanAir #AirQuality #ClimateAction`,
        `💚 Clean air alert: ${city} has AQI ${aqi} today!\n\nHealthy breathing, healthy living 🫁\n\nThis is what we're fighting for!\n\n#AirQuality #CleanAir`,
      ];
      return cleanMessages[Math.floor(Math.random() * cleanMessages.length)];
    }

    const messages = [
      `🚬 Just checked my AQI in ${city}: ${aqi}\n\nThat's equivalent to smoking ${cigaretteCount.toFixed(1)} cigarettes TODAY.\n\nBut sure, let's keep arguing about straws 🙃\n\n#AirQuality #ClimateChange`,
      `🌫️ Plot twist: I don't smoke, but ${city}'s air made me smoke ${cigaretteCount.toFixed(1)} cigarettes today anyway.\n\nAQI: ${aqi}\n\nLove that for us 💀\n\n#AirPollution #PublicHealth`,
      `POV: You're health-conscious and avoid smoking\n\nThe air in ${city} (AQI ${aqi}): "Best I can do is ${cigaretteCount.toFixed(1)} cigarettes"\n\n🚬🫁✨\n\n#AirQuality`,
      `📊 My daily stats:\n☕ Coffees: 2\n🚬 Cigarettes smoked: 0\n🌫️ Cigarettes from breathing in ${city}: ${cigaretteCount.toFixed(1)}\n\nAQI: ${aqi}\n\nWe live in a society 🤡\n\n#ClimateAction`,
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleTweet = () => {
    const tweetText = generateTweetText();
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    
    window.open(tweetUrl, '_blank', 'width=550,height=420');
    
    toast.success("Tweet composed!", {
      description: isCleanAir ? "Share the good news!" : "Share the harsh reality with the world",
    });
  };

  return (
    <Button
      onClick={handleTweet}
      className="w-full neumorphic-blend hover:bg-card/40 text-foreground rounded-2xl py-6 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
      variant="ghost"
    >
      <Twitter className="w-5 h-5 mr-2" />
      {isCleanAir ? "Share Good News" : "Share This Reality"}
    </Button>
  );
};

export default TweetButton;