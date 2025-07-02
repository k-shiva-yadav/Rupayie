import { Dimensions, SafeAreaView, StyleSheet } from "react-native";
import React, { useMemo } from "react";
import { Text, View } from "../Themed";
import { useUserData } from "@/context/user";
import { useColorScheme } from "@/components/useColorScheme";
import Svg, { Circle, Rect, Text as SvgText } from "react-native-svg";
import { useTransactionsCategory } from "@/context/transCategory";
import { useTransactionFilter } from "@/context/filterTransByDate";
import { formatAmount } from "@/utils/formatAmount";

interface Transaction {
  _id: string;
  amount: number;
  category: {
    name: string;
    hexColor: string;
    sign: string;
    type: string;
    _id: string;
  };
  createdAt: Date;
}

interface CategorySpent {
  _id: string;
  name: string;
  hexColor: string;
  spent: number;
}

const DonutChart = () => {
  const { donutCategory } = useTransactionsCategory();
  const { transactionsList } = useUserData();
  const { donutTransactionsFilter } = useTransactionFilter();

  // Filter transactions by category and date range
  const filteredTransactions = useMemo(() => {
    return transactionsList?.filter((txn: Transaction) => {
      const createdAtDate = new Date(txn.createdAt);
      const fromDate = new Date(donutTransactionsFilter.from);
      const toDate = new Date(donutTransactionsFilter.to);

      return (
        txn.category.type === donutCategory &&
        createdAtDate >= fromDate &&
        createdAtDate <= toDate
      );
    });
  }, [transactionsList, donutCategory, donutTransactionsFilter]);

  // Aggregate total amount spent per category (sign-aware)
  const categorySpending: CategorySpent[] = useMemo(() => {
    const spendingMap = new Map<string, CategorySpent>();

    filteredTransactions?.forEach((txn: Transaction) => {
      const { _id, name, hexColor, sign, type } = txn.category;

      if (!spendingMap.has(_id)) {
        spendingMap.set(_id, { _id, name, hexColor, spent: 0 });
      }

      const current = spendingMap.get(_id)!;

      if (type === "Borrowed") {
        current.spent += sign === "+" ? txn.amount : -txn.amount;
      } else if (type === "Lend") {
        current.spent += sign === "+" ? txn.amount : -txn.amount;
      } else if (type === "Spent") {
        current.spent -= txn.amount;
      } else if (type === "Earned") {
        current.spent += txn.amount;
      }
    });

    // ✅ Ensure values are always positive for graph display
    return Array.from(spendingMap.values()).map((entry) => ({
      ...entry,
      spent: Math.abs(entry.spent),
    }));
  }, [filteredTransactions]);


  return (
    <SafeAreaView
      style={{ display: "flex", alignItems: "center", marginTop: 10 }}
    >
      {categorySpending.length > 0 ? (
        <CategoryDonutChart categories={categorySpending} />
      ) : (
        <SafeAreaView style={{ marginVertical: 40 }}>
          <Text style={{ fontStyle: "italic" }}>
            No Data For {donutCategory}
          </Text>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
};

const CategoryDonutChart: React.FC<{ categories: CategorySpent[] }> =
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

      // Total amount spent across all categories
      const totalAmountSpent = useMemo(
        () => categories.reduce((total, item) => total + item.spent, 0),
        [categories]
      );

      // Calculate starting angles
      const startingAngles = useMemo(() => {
        let angle = -90;
        return categories.map((item) => {
          const currentAngle = angle;
          const percentage = totalAmountSpent
            ? (item.spent / totalAmountSpent) * 360
            : 0;
          angle += percentage;
          return currentAngle;
        });
      }, [categories, totalAmountSpent]);

      return (
        <SafeAreaView>
          {categories.length > 0 ? (
            <Svg
              viewBox={`0 0 ${size} ${size}`}
              width={size + strokeWidth}
              height={size}
            >
              {categories.map((item, index) => (
                <OneDonut
                  key={index}
                  center={center}
                  radius={radius}
                  circum={circum}
                  percentage={
                    totalAmountSpent === 0
                      ? 100
                      : (item.spent / totalAmountSpent) * 100
                  }
                  angle={startingAngles[index]}
                  strokeWidth={strokeWidth}
                  color={
                    totalAmountSpent === 0 ? placeholderColor : item.hexColor
                  }
                  totalAmountSpent={totalAmountSpent}
                />
              ))}
            </Svg>
          ) : (
            <SafeAreaView style={{ marginVertical: 40 }}>
              <Text style={{ fontStyle: "italic" }}>
                No Transaction Data Available
              </Text>
            </SafeAreaView>
          )}
        </SafeAreaView>
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
  totalAmountSpent,
}: {
  color: string;
  radius: number;
  strokeWidth: number;
  center: number;
  circum: number;
  percentage: number;
  angle: number;
  totalAmountSpent: number;
}) => {
  const { currencyObj } = useUserData();
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const percentBgColor = colorScheme === "dark" ? "#00000080" : "#ffffff70";

  const strokeDashoffset = circum * (1 - percentage / 100);
  const angleForText = angle + (percentage / 100) * 180;

  // Calculate the position for text
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

      <SvgText
        x={center}
        y={center + 2}
        fontSize="20"
        fill={textColor}
        textAnchor="middle"
        fontWeight="500"
      >
        {formatAmount(totalAmountSpent, currencyObj)}
      </SvgText>

      {percentage > 5 && (
        <>
          {/* Background Rectangle with Rounded Borders */}
          <Rect
            x={textX - textWidth / 2 + 5}
            y={textY - textHeight / 2}
            width={textWidth}
            height={textHeight}
            rx={borderRadius}
            ry={borderRadius}
            fill={percentBgColor}
          />

          {/* Percentage Text */}
          <SvgText
            x={textX}
            y={textY + 5}
            fontSize="12"
            fill={textColor}
            textAnchor="middle"
            fontWeight="bold"
          >
            {percentage == 100 ? percentage : percentage.toFixed(1)}
            <SvgText
              x={textX + 18}
              y={textY + 5}
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
    </>
  );
};

export default DonutChart;

const styles = StyleSheet.create({});
