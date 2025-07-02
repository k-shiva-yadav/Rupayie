import { Dimensions, SafeAreaView, StyleSheet } from "react-native";
import React, { useMemo } from "react";
import { Text, View } from "../Themed";
import { useUserData } from "@/context/user";
import { useColorScheme } from "@/components/useColorScheme";
import Svg, { Circle, Rect, Text as SvgText } from "react-native-svg";
import { useTransactionFilter } from "@/context/filterTransByDate";
import { formatDate } from "@/utils/formatDateTimeSimple";

interface Transaction {
  _id: string;
  amount: number;
  createdAt: Date;
  category: {
    type: "Spent" | "Earned" | "Borrowed" | "Lend";
    hexColor: string;
  };
}

interface TypeSpent {
  type: Transaction["category"]["type"];
  color: string;
  total: number;
}

const typeColors: Record<Transaction["category"]["type"], string> = {
  Spent: "#FF6667",
  Earned: "#42D7B5",
  Borrowed: "#F8B501",
  Lend: "#1869FF",
};

const AllTypesDonut: React.FC = () => {
  const { transactionsList, loadingUserDetails } = useUserData();
  const { donutTransactionsFilter } = useTransactionFilter();

  const colorScheme = useColorScheme();
  const placeholderColor = colorScheme === "dark" ? "#3D3D3D" : "#c4c4c4";
  const screenWidth = Dimensions.get("window").width;

  const size = screenWidth - 100;
  const strokeWidth = 35;
  const center = size / 2;
  const radius = (size - strokeWidth * 2) / 2;
  const circum = 2 * Math.PI * radius;

  const filteredTransactions = useMemo(() => {
    return transactionsList?.filter((txn: Transaction) => {
      const createdAtDate = new Date(txn.createdAt);
      const fromDate = new Date(donutTransactionsFilter.from);
      const toDate = new Date(donutTransactionsFilter.to);

      return createdAtDate >= fromDate && createdAtDate <= toDate;
    });
  }, [transactionsList, donutTransactionsFilter]);

  const typeSpending: TypeSpent[] = useMemo(() => {
    const spendingMap = new Map<Transaction["category"]["type"], TypeSpent>();

    filteredTransactions?.forEach((txn: Transaction) => {
      const typeKey = txn.category.type;
      const color = typeColors[typeKey]; // Use predefined colors

      if (!spendingMap.has(typeKey)) {
        spendingMap.set(typeKey, { type: typeKey, color, total: 0 });
      }

      spendingMap.get(typeKey)!.total += txn.amount;
    });

    return Array.from(spendingMap.values());
  }, [filteredTransactions]);

  const totalAmount = useMemo(
    () => typeSpending.reduce((sum, item) => sum + item.total, 0),
    [typeSpending]
  );

  const startingAngles = useMemo(() => {
    let angle = -90;
    return typeSpending.map((item) => {
      const currentAngle = angle;
      const percentage = totalAmount ? (item.total / totalAmount) * 360 : 0;
      angle += percentage;
      return currentAngle;
    });
  }, [typeSpending, totalAmount]);

  return (
    <SafeAreaView
      style={{ display: "flex", alignItems: "center", marginTop: 10 }}
    >
      {typeSpending.length > 0 ? (
        <Svg
          viewBox={`0 0 ${size} ${size}`}
          width={size + strokeWidth}
          height={size}
        >
          {typeSpending.map((item, index) => (
            <OneDonut
              key={index}
              center={center}
              radius={radius}
              circum={circum}
              percentage={(item.total / totalAmount) * 100}
              angle={startingAngles[index]}
              strokeWidth={strokeWidth}
              color={loadingUserDetails ? placeholderColor : item.color}
              loadingUserDetails={loadingUserDetails}
            />
          ))}
        </Svg>
      ) : (
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
      )}
    </SafeAreaView>
  );
};

interface OneDonutProps {
  center: number;
  radius: number;
  strokeWidth: number;
  color: string;
  circum: number;
  percentage: number;
  angle: number;
  loadingUserDetails: boolean;
  noData?: boolean
}

// const formatDateTimeSimple = (dateString: string | Date) => {
//   const date = new Date(dateString);
//   const day = String(date.getDate()).padStart(2, "0");
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const year = String(date.getFullYear()).slice(-2);

//   return `${day}/${month}/${year}`;
// };

const OneDonut: React.FC<OneDonutProps> = ({
  center,
  radius,
  strokeWidth,
  color,
  circum,
  percentage,
  angle,
  loadingUserDetails,
  noData
}) => {
  const { donutTransactionsFilter } = useTransactionFilter();

  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const percentBgColor = colorScheme === "dark" ? "#00000080" : "#ffffff70";

  const strokeDashoffset = circum * (1 - percentage / 100);
  const angleForText = angle + (percentage / 100) * 180;
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
      />

      <>
        <SvgText
          x={center}
          y={center + 2}
          fontSize="16"
          fill={textColor}
          textAnchor="middle"
          fontWeight="400"
        >
          {loadingUserDetails ? "Loading..." : noData ? "No Data" : donutTransactionsFilter.title}
        </SvgText>
        <SvgText
          x={center}
          y={center + 22}
          fontSize="12"
          fill={textColor}
          textAnchor="middle"
          fontWeight="400"
        >
          {donutTransactionsFilter.title === "Custom Range" ?
            `${formatDate(donutTransactionsFilter.from)} - ${formatDate(donutTransactionsFilter.to)}`
            :
            ""
          }
        </SvgText>
      </>

      {!loadingUserDetails && percentage > 5 && !noData && (
        <>
          <Rect
            x={textX - textWidth / 2 + 5}
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
            fontSize="12"
            fill={textColor}
            textAnchor="middle"
            fontWeight="bold"
          >
            {percentage == 100 ? percentage : percentage.toFixed(1)}%
          </SvgText>
        </>
      )}
    </>
  );
};

export default AllTypesDonut;

const styles = StyleSheet.create({});
