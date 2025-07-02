import { StyleSheet } from "react-native";
import React from "react";
import { useColorScheme } from "@/components/useColorScheme";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

const LeftPercentDonutChart = React.memo(({ percentage }: { percentage: number }) => {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const placeholderColor = colorScheme === "dark" ? "#3D3D3D" : "#c4c4c4";

  const size = 150;
  const strokeWidth = 15;
  const center = size / 2;
  const radius = (size - strokeWidth * 2) / 2;
  const circum = 2 * Math.PI * radius;

  const safePercentage = Math.max(0, percentage);
  const strokeDashoffset = circum * (1 - safePercentage / 100);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background Circle */}
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={safePercentage === 0 ? "red" : placeholderColor}
        strokeWidth={strokeWidth}
        fill="none"
      />

      {/* Progress Circle (Static) */}
      <Circle
        cx={center}
        cy={center}
        r={radius}
        originX={center}
        originY={center}
        rotation={-90}
        strokeWidth={strokeWidth}
        strokeDasharray={circum}
        strokeDashoffset={strokeDashoffset}
        stroke={safePercentage === 0 ? "transparent" : "#4FB92D"}
        fill="none"
        strokeLinecap="butt"
      />

      {/* Centered Percentage Text */}
      <SvgText
        x={center}
        y={center + 2}
        fontSize="16"
        fill={textColor}
        textAnchor="middle"
        fontWeight="bold"
      >
        {`${safePercentage.toFixed(1)}%`}
      </SvgText>

      {/* "Left" Text Below */}
      <SvgText
        x={center}
        y={center + 18}
        fontSize="12"
        fill={textColor}
        textAnchor="middle"
      >
        Left
      </SvgText>
    </Svg>
  );
});

export default LeftPercentDonutChart;

const styles = StyleSheet.create({});
