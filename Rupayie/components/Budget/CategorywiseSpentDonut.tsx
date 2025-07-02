import { Dimensions, StyleSheet } from "react-native";
import React, { useMemo } from "react";
import { View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Svg, { Circle, Rect, Text as SvgText } from "react-native-svg";
import { formatAmount } from "@/utils/formatAmount";
import { useUserData } from "@/context/user";

interface IncludedCategory {
  budget: number;
  spent: number;
  included: boolean;
  _id: string;
  name: string;
  hexColor: string;
  sign: string;
  type: string;
}

const CategorywiseSpentDonut: React.FC<{ categories: IncludedCategory[] }> =
  React.memo(
    ({ categories }) => {
      const colorScheme = useColorScheme();
      const placeholderColor = colorScheme === "dark" ? "#3D3D3D" : "#c4c4c4";
      const screenWidth = Dimensions.get("window").width;

      const size = screenWidth - 100;
      const strokeWidth = 35;
      const center = size / 2;
      const radius = (size - strokeWidth * 2) / 2;
      const circum = 2 * Math.PI * radius;

      // Filter only included categories
      const filteredCategories = useMemo(
        () => categories.filter((item) => item.included),
        [categories]
      );

      // Calculate total amount spent from included categories
      const totalAmountSpent = useMemo(
        () => filteredCategories.reduce((total, item) => total + item.spent, 0),
        [filteredCategories]
      );

      // Calculate starting angles
      const startingAngles = useMemo(() => {
        let angle = -90;
        return filteredCategories.map((item) => {
          const currentAngle = angle;
          const percentage = totalAmountSpent
            ? (item.spent / totalAmountSpent) * 360
            : 0;
          angle += percentage;
          return currentAngle;
        });
      }, [filteredCategories, totalAmountSpent]);

      return (
        <View>
          <Svg
            viewBox={`0 0 ${size} ${size}`}
            width={size + strokeWidth}
            height={size}
          >
            {totalAmountSpent === 0 ? (
              <OneDonut
                center={center}
                radius={radius}
                circum={circum}
                percentage={100}
                angle={startingAngles[0] || 0}
                strokeWidth={strokeWidth}
                color={placeholderColor}
                placeholder={true}
                totalAmountSpent={totalAmountSpent}
              />
            ) : (
              filteredCategories.map((item, index) => (
                <OneDonut
                  key={index}
                  center={center}
                  radius={radius}
                  circum={circum}
                  percentage={(item.spent / totalAmountSpent) * 100}
                  angle={startingAngles[index]}
                  strokeWidth={strokeWidth}
                  color={item.hexColor}
                  totalAmountSpent={totalAmountSpent}
                />
              ))
            )}
          </Svg>
        </View>
      );
    },
    (prevProps, nextProps) =>
      JSON.stringify(prevProps.categories) ===
      JSON.stringify(nextProps.categories)
  );

const OneDonut = ({
  center,
  radius,
  strokeWidth,
  color,
  circum,
  percentage,
  angle,
  placeholder,
  totalAmountSpent,
}: {
  color: string;
  radius: number;
  strokeWidth: number;
  center: number;
  circum: number;
  percentage: number;
  angle: number;
  placeholder?: boolean;
  totalAmountSpent: number;
}) => {
  const { currencyObj } = useUserData();

  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const percentBgColor = colorScheme === "dark" ? "#00000080" : "#ffffff70";

  const strokeDashoffset = circum * (1 - percentage / 100);
  const angleForText = angle + (percentage / 100) * 180;

  // Calculate the position for text (along the perimeter)
  const textX =
    center +
    (radius + strokeWidth / 2) * Math.cos((angleForText * Math.PI) / 180);
  const textY =
    center +
    (radius + strokeWidth / 2) * Math.sin((angleForText * Math.PI) / 180);

  // Background size & padding
  const textWidth = 60; // Increased width to fit category name
  const textHeight = 20; // Increased height for two lines
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
        strokeDashoffset={strokeDashoffset}
        stroke={color}
        fill="none"
        strokeLinecap="butt"
      />

      {totalAmountSpent > 0 &&
        <SvgText
          x={center}
          y={center + 2}
          fontSize="18"
          fill={textColor}
          textAnchor="middle"
          fontWeight="400"
        >
          {formatAmount(totalAmountSpent, currencyObj)}
        </SvgText>
      }

      {!placeholder && percentage > 5 && (
        <>
          <Rect
            x={textX - textWidth / 2 + 2}
            y={textY - textHeight / 2}
            width={textWidth}
            height={textHeight}
            rx={borderRadius}
            ry={borderRadius}
            fill={percentBgColor}
          />

          <SvgText
            x={textX}
            y={textY + 5}
            fontWeight="bold"
            fontSize="10"
            fill={textColor}
            textAnchor="middle"
          >
            {percentage == 100 ? percentage : percentage.toFixed(1)}
            <SvgText
              x={textX + 16}
              y={textY + 6}
              fontSize="12"
              fill={textColor}
              textAnchor="middle"
              fontWeight="bold"
            >
              %
            </SvgText>
          </SvgText>
        </>
      )}

      {placeholder && (
        <SvgText
          x={center}
          y={center + 5}
          fontSize="20"
          fill={textColor}
          textAnchor="middle"
        >
          {`0.0%`}
        </SvgText>
      )}
    </>
  );
};

export default CategorywiseSpentDonut;

const styles = StyleSheet.create({});
