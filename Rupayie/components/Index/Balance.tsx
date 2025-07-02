import React, { useEffect, useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet } from "react-native";
import { Text, View } from "../Themed";
import { formatAmount } from "@/utils/formatAmount";
import { useColorScheme } from "@/components/useColorScheme";

import Svg, { Circle, Rect, Text as SvgText } from "react-native-svg";

import moment from "moment";
import { useAnalytics } from "@/context/analytics";
import { useUserData } from "@/context/user";

interface DonutChartProps {
  amounts: { value: number; percentage: number; color: string }[];
}

function Balance() {
  const { currencyObj, loadingUserDetails } = useUserData();
  const { analytics } = useAnalytics();
  const { totalAmount, totalSpent, totalEarned, balance } = analytics;

  const colorScheme = useColorScheme();
  const placeholderColor = colorScheme === "dark" ? "#3D3D3D" : "#c4c4c4";

  const [clicked, setClicked] = useState<"Spent" | "Earned" | "Balance">(
    "Balance"
  );
  const monthName = moment().format("MMMM");

  const amounts = [
    {
      value: totalSpent,
      percentage: (totalSpent / totalAmount) * 100 || 0,
      color: "#4588DF", // blue
    },
    {
      value: totalEarned,
      percentage: (totalEarned / totalAmount) * 100 || 0,
      color: "#4FB92D", // green
    },
    { value: 0, percentage: 0, color: "" },
    // temp solution for inequal strokeWidth
  ];

  return (
    <View style={styles.container}>
      <View style={styles.flex_row_btw}>
        {["Balance", "Spent", "Earned"].map((item) => (
          <Pressable
            key={item}
            onPress={() => setClicked(item as "Spent" | "Earned" | "Balance")}
            style={[
              styles.button,
              {
                backgroundColor:
                  item === "Balance"
                    ? "#2A2C38"
                    : item === "Spent"
                      ? "#4588DF"
                      : "#4FB92D",
              },
            ]}
          >
            <Text style={styles.buttonText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {/* Balance Display */}
      <View style={[styles.flex_row_btw, { marginTop: 20 }]}>
        <SafeAreaView style={styles.flex_center}>
          {!loadingUserDetails ? (
            <Text numberOfLines={1} style={styles.boldText}>
              {clicked === "Balance"
                ? formatAmount(balance, currencyObj)
                : clicked === "Spent"
                  ? formatAmount(totalSpent, currencyObj)
                  : formatAmount(totalEarned, currencyObj)}
            </Text>
          ) : (
            <View
              style={{
                backgroundColor: placeholderColor,
                height: 30,
                width: 90,
                borderRadius: 10,
              }}
            />
          )}

          <Text style={styles.clicked}>{clicked}</Text>
        </SafeAreaView>

        <SafeAreaView style={styles.flex_center}>
          <DonutChart amounts={amounts} />

          <Text style={styles.monthText}>{monthName}</Text>
        </SafeAreaView>
      </View>
    </View>
  );
}

export default React.memo(Balance);

const DonutChart: React.FC<DonutChartProps> = React.memo(({ amounts }) => {
  const { loadingUserDetails } = useUserData();

  const colorScheme = useColorScheme();
  const placeholderColor = colorScheme === "dark" ? "#3D3D3D" : "#c4c4c4";

  const size = 140;
  const strokeWidth = 17;
  const center = size / 2;
  const radius = (size - strokeWidth * 2) / 2;
  const circum = 2 * Math.PI * radius;

  // ✅ Memoize the computed angles to prevent unnecessary re-renders
  const startingAngles = useMemo(() => {
    let angle = -90;
    return amounts.map((item) => {
      const currentAngle = angle;
      angle += (item.percentage / 100) * 360;
      return currentAngle;
    });
  }, [amounts]);

  const totalAmount = useMemo(
    () => amounts.reduce((total, item) => total + item.value, 0),
    [amounts]
  );

  return totalAmount > 0 ? (
    <Svg
      viewBox={`0 0 ${size} ${size}`}
      width={size + strokeWidth}
      height={size}
    >
      {amounts.map((item, index) => (
        <OneDonut
          key={index}
          center={center}
          radius={radius}
          circum={circum}
          percentage={loadingUserDetails ? 100 : item.percentage}
          angle={startingAngles[index]}
          strokeWidth={strokeWidth}
          color={loadingUserDetails ? placeholderColor : item.color}
          loadingUserDetails={loadingUserDetails}
        />
      ))
      }
    </Svg>
  ) :
    <Svg
      viewBox={`0 0 ${size} ${size}`}
      width={size + strokeWidth}
      height={size}
    >
      <OneDonut
        center={center}
        radius={radius}
        circum={circum}
        percentage={100}
        angle={90}
        strokeWidth={strokeWidth}
        color={placeholderColor}
        loadingUserDetails={loadingUserDetails}
        noData={true}
      />
    </Svg>
    ;
}, arePropsEqual);

// ✅ Custom Comparison Function for React.memo()
function arePropsEqual(prevProps: DonutChartProps, nextProps: DonutChartProps) {
  return (
    JSON.stringify(prevProps.amounts) === JSON.stringify(nextProps.amounts)
  );
}

const OneDonut = ({
  center,
  radius,
  strokeWidth,
  color,
  circum,
  percentage,
  angle,
  loadingUserDetails,
  noData
}: {
  color: string;
  radius: number;
  strokeWidth: number;
  center: number;
  circum: number;
  percentage: number;
  angle: number;
  loadingUserDetails?: boolean;
  noData?: boolean
}) => {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const percentBgColor = colorScheme === "dark" ? "#00000080" : "#ffffff70";

  // Calculate the position for text (along the perimeter)
  const angleForText = angle + (percentage / 100) * 180;
  const textX =
    center +
    (radius + strokeWidth / 2) * Math.cos((angleForText * Math.PI) / 180);
  const textY =
    center +
    (radius + strokeWidth / 2) * Math.sin((angleForText * Math.PI) / 180);

  // Background size & padding
  const textWidth = 40; // Increased width to fit category name
  const textHeight = 15; // Increased height for two lines
  const borderRadius = 8; // Rounded corners

  return (
    <>
      <Circle
        cy={center}
        cx={center}
        r={radius}
        originX={center}
        originY={center}
        rotation={angle}
        strokeWidth={strokeWidth}
        strokeDasharray={circum}
        strokeDashoffset={circum * (1 - percentage / 100)} // Static stroke offset
        stroke={color}
        fill="none"
        strokeLinecap="butt"
      />

      {!loadingUserDetails && percentage > 5 && !noData && (
        <>
          <Rect
            x={textX - textWidth / 2}
            y={textY - textHeight / 2 - 4}
            width={textWidth}
            height={textHeight}
            rx={borderRadius}
            ry={borderRadius}
            fill={percentBgColor}
          />

          <SvgText
            x={textX}
            y={textY}
            fontSize="10"
            fill={textColor}
            textAnchor="middle"
            fontWeight="400"
          >
            {`${percentage == 100 ? percentage : percentage?.toFixed(1)}%`}
          </SvgText>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  boldText: {
    fontSize: 24,
    fontWeight: 600,
    textAlign: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "500",
  },
  button: {
    width: "31%",
    borderRadius: 10,
    paddingVertical: 5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: "#fff",
  },
  flex_row_btw: {
    width: "100%",
    display: "flex",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  flex_center: {
    width: "50%",
    display: "flex",
    position: "relative",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  clicked: {
    textAlign: "center",
    marginTop: 7,
    color: "#838584",
  },
  monthText: {
    position: "absolute",
    fontSize: 12,
    fontWeight: 500,
  },
});
