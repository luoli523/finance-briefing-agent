import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

interface StockData {
  ticker: string;
  change: string;
  name: string;
}

interface DailyBriefingProps {
  date: string;
  gainers: StockData[];
  losers: StockData[];
  sentiment: string;
  headline: string;
}

// 颜色主题
const COLORS = {
  background: "#0a0a0f",
  primary: "#00d4ff",
  secondary: "#ff6b6b",
  green: "#00ff88",
  red: "#ff4757",
  text: "#ffffff",
  textMuted: "#8892b0",
  card: "#1a1a2e",
};

// 介绍场景
const IntroScene: React.FC<{ date: string }> = ({ date }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleY = spring({
    frame,
    fps,
    config: { damping: 100 },
  });

  const dateOpacity = interpolate(frame, [fps * 0.3, fps * 0.8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const lineWidth = interpolate(frame, [fps * 0.5, fps * 1.2], [0, 600], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.background} 0%, #16213e 100%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* 背景装饰 */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: `radial-gradient(circle at 50% 30%, ${COLORS.primary}20 0%, transparent 50%)`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `translateY(${(1 - titleY) * -100}px)`,
        }}
      >
        <div
          style={{
            fontSize: 48,
            color: COLORS.primary,
            fontWeight: "bold",
            opacity: titleOpacity,
            letterSpacing: 8,
            marginBottom: 20,
          }}
        >
          AI INDUSTRY
        </div>

        <div
          style={{
            fontSize: 120,
            color: COLORS.text,
            fontWeight: "bold",
            opacity: titleOpacity,
            textShadow: `0 0 40px ${COLORS.primary}80`,
          }}
        >
          每日简报
        </div>

        {/* 分隔线 */}
        <div
          style={{
            width: lineWidth,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${COLORS.primary}, transparent)`,
            marginTop: 40,
            marginBottom: 40,
          }}
        />

        <div
          style={{
            fontSize: 64,
            color: COLORS.textMuted,
            opacity: dateOpacity,
            fontWeight: 300,
          }}
        >
          {date}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 股票卡片组件
const StockCard: React.FC<{
  stock: StockData;
  index: number;
  isGainer: boolean;
}> = ({ stock, index, isGainer }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = index * 5;
  const slideIn = spring({
    frame: frame - delay,
    fps,
    config: { damping: 80 },
  });

  const color = isGainer ? COLORS.green : COLORS.red;
  const changeNum = parseFloat(stock.change.replace("%", ""));
  const barWidth = Math.min(Math.abs(changeNum) * 30, 400);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "24px 40px",
        marginBottom: 16,
        background: COLORS.card,
        borderRadius: 20,
        transform: `translateX(${(1 - slideIn) * 500}px)`,
        opacity: slideIn,
        borderLeft: `6px solid ${color}`,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 56,
            fontWeight: "bold",
            color: COLORS.text,
          }}
        >
          {stock.ticker}
        </div>
        <div
          style={{
            fontSize: 32,
            color: COLORS.textMuted,
            marginTop: 4,
          }}
        >
          {stock.name}
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontSize: 56,
            fontWeight: "bold",
            color,
          }}
        >
          {stock.change}
        </div>
        {/* 进度条 */}
        <div
          style={{
            width: 200,
            height: 8,
            background: "#333",
            borderRadius: 4,
            marginTop: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: barWidth * slideIn,
              height: "100%",
              background: color,
              borderRadius: 4,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// 涨幅榜场景
const GainersScene: React.FC<{ gainers: StockData[] }> = ({ gainers }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.background} 0%, #0f1923 100%)`,
        padding: 60,
      }}
    >
      {/* 背景装饰 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 400,
          height: 400,
          background: `radial-gradient(circle, ${COLORS.green}15 0%, transparent 70%)`,
        }}
      />

      <div
        style={{
          opacity: titleOpacity,
          marginBottom: 60,
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: "bold",
            color: COLORS.green,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span style={{ fontSize: 100 }}>📈</span>
          涨幅榜 TOP 5
        </div>
      </div>

      <div>
        {gainers.map((stock, index) => (
          <StockCard key={stock.ticker} stock={stock} index={index} isGainer />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 跌幅榜场景
const LosersScene: React.FC<{ losers: StockData[] }> = ({ losers }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.background} 0%, #190f0f 100%)`,
        padding: 60,
      }}
    >
      {/* 背景装饰 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 400,
          height: 400,
          background: `radial-gradient(circle, ${COLORS.red}15 0%, transparent 70%)`,
        }}
      />

      <div
        style={{
          opacity: titleOpacity,
          marginBottom: 60,
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: "bold",
            color: COLORS.red,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span style={{ fontSize: 100 }}>📉</span>
          跌幅榜 TOP 5
        </div>
      </div>

      <div>
        {losers.map((stock, index) => (
          <StockCard
            key={stock.ticker}
            stock={stock}
            index={index}
            isGainer={false}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 市场情绪场景
const SentimentScene: React.FC<{ sentiment: string; headline: string }> = ({
  sentiment,
  headline,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const circleScale = spring({
    frame,
    fps,
    config: { damping: 50 },
  });

  const textOpacity = interpolate(frame, [fps * 0.5, fps * 1], [0, 1], {
    extrapolateRight: "clamp",
  });

  const headlineOpacity = interpolate(frame, [fps * 1, fps * 1.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.background} 0%, #1a1a3e 100%)`,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      {/* 大圆圈装饰 */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          border: `4px solid ${COLORS.primary}30`,
          transform: `scale(${circleScale})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          border: `2px solid ${COLORS.primary}20`,
          transform: `scale(${circleScale * 0.9})`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 60,
            color: COLORS.textMuted,
            marginBottom: 20,
            opacity: textOpacity,
          }}
        >
          市场情绪
        </div>

        <div
          style={{
            fontSize: 120,
            fontWeight: "bold",
            color: COLORS.primary,
            textShadow: `0 0 60px ${COLORS.primary}60`,
            opacity: textOpacity,
            marginBottom: 80,
          }}
        >
          {sentiment}
        </div>

        <div
          style={{
            fontSize: 48,
            color: COLORS.textMuted,
            textAlign: "center",
            lineHeight: 1.5,
            opacity: headlineOpacity,
            maxWidth: 900,
          }}
        >
          📰 {headline}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 结束场景
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 100 },
  });

  const textOpacity = interpolate(frame, [fps * 0.3, fps * 0.8], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.background} 0%, #16213e 100%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* 光晕效果 */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.primary}20 0%, transparent 60%)`,
          transform: `scale(${scale})`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            fontSize: 100,
            marginBottom: 40,
          }}
        >
          📊
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: "bold",
            color: COLORS.text,
            opacity: textOpacity,
            marginBottom: 20,
          }}
        >
          关注获取更多
        </div>

        <div
          style={{
            fontSize: 48,
            color: COLORS.primary,
            opacity: textOpacity,
          }}
        >
          每日 AI 产业简报
        </div>

        <div
          style={{
            marginTop: 60,
            fontSize: 36,
            color: COLORS.textMuted,
            opacity: textOpacity,
          }}
        >
          数据仅供参考 · 投资需谨慎
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 主组件
export const DailyBriefing: React.FC<DailyBriefingProps> = ({
  date,
  gainers,
  losers,
  sentiment,
  headline,
}) => {
  const { fps } = useVideoConfig();

  // 场景时间分配 (总共30秒)
  const INTRO_DURATION = 4 * fps; // 4秒
  const GAINERS_DURATION = 8 * fps; // 8秒
  const LOSERS_DURATION = 8 * fps; // 8秒
  const SENTIMENT_DURATION = 6 * fps; // 6秒
  const OUTRO_DURATION = 4 * fps; // 4秒

  return (
    <AbsoluteFill style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* 介绍 */}
      <Sequence from={0} durationInFrames={INTRO_DURATION}>
        <IntroScene date={date} />
      </Sequence>

      {/* 涨幅榜 */}
      <Sequence from={INTRO_DURATION} durationInFrames={GAINERS_DURATION}>
        <GainersScene gainers={gainers} />
      </Sequence>

      {/* 跌幅榜 */}
      <Sequence
        from={INTRO_DURATION + GAINERS_DURATION}
        durationInFrames={LOSERS_DURATION}
      >
        <LosersScene losers={losers} />
      </Sequence>

      {/* 市场情绪 */}
      <Sequence
        from={INTRO_DURATION + GAINERS_DURATION + LOSERS_DURATION}
        durationInFrames={SENTIMENT_DURATION}
      >
        <SentimentScene sentiment={sentiment} headline={headline} />
      </Sequence>

      {/* 结束 */}
      <Sequence
        from={
          INTRO_DURATION +
          GAINERS_DURATION +
          LOSERS_DURATION +
          SENTIMENT_DURATION
        }
        durationInFrames={OUTRO_DURATION}
      >
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
