import { Composition } from "remotion";
import { DailyBriefing } from "./DailyBriefing";

// TikTok/Instagram Reels 尺寸: 1080x1920 (9:16)
const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
const DURATION_SECONDS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DailyBriefing"
      component={DailyBriefing}
      durationInFrames={DURATION_SECONDS * FPS}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{
        date: "2026-01-27",
        gainers: [
          { ticker: "CRWV", change: "+5.73%", name: "CoreWeave" },
          { ticker: "ANET", change: "+5.41%", name: "Arista Networks" },
          { ticker: "DDOG", change: "+5.00%", name: "Datadog" },
          { ticker: "MBLY", change: "+3.57%", name: "Mobileye" },
          { ticker: "STX", change: "+3.52%", name: "Seagate" },
        ],
        losers: [
          { ticker: "RKLB", change: "-9.47%", name: "Rocket Lab" },
          { ticker: "OKLO", change: "-6.07%", name: "Oklo" },
          { ticker: "INTC", change: "-5.76%", name: "Intel" },
          { ticker: "BE", change: "-3.64%", name: "Bloom Energy" },
          { ticker: "AMD", change: "-3.22%", name: "AMD" },
        ],
        sentiment: "主线乐观",
        headline: "市场聚焦苹果、Meta、微软财报，AI投资叙事升温",
      }}
    />
  );
};
