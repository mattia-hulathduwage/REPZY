import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";

export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Defs>
        <LinearGradient id="fl-grad" x1="0.1464" y1="0.1464" x2="0.8536" y2="0.8536">
          <Stop offset="0" stopColor="#DF6847" />
          <Stop offset="1" stopColor="#F4A261" />
        </LinearGradient>
      </Defs>
      <Rect width={1024} height={1024} rx={200} ry={200} fill="url(#fl-grad)" />
      <G transform="translate(301.6 270.5) scale(3.45)">
        <Path
          d="M44 0 L120 0 L120 38 L44 38 L44 52 L112 52 L112 90 L44 90 L44 102 L2 140 L2 38 Z"
          fill="#FFFFFF"
        />
      </G>
    </Svg>
  );
}
