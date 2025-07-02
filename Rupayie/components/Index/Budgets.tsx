import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Text, View } from "../Themed";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUserData } from "@/context/user";
import { useColorScheme } from "@/components/useColorScheme";
import { formatAmount } from "@/utils/formatAmount";
import DonutChart from "../Budget/LeftPercentDonutChart";
import { FontAwesome6 } from "@expo/vector-icons";
import moment from "moment";

const icon = require("@/assets/pages/addBudget.png");

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

interface Budget {
  type: string;
  period: {
    monthAndYear?: {
      month: string;
      year: number;
    };
    year?: number;
  };
  totalBudget: number;
  totalSpent: number;
  _id: string;
  categories: IncludedCategory[];
}

export default function Budgets({
  clickable,
  showMonthBudgetFlag,
}: {
  clickable?: boolean;
  showMonthBudgetFlag?: boolean;
}) {
  const { budgetList, currencyObj, loadingUserDetails } = useUserData();

  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const bgColor = colorScheme === "light" ? "#fff" : "#000";
  const placeholderColor = colorScheme === "dark" ? "#3D3D3D" : "#c4c4c4";

  const monthlyBudget = budgetList.find(
    (budget: Budget) => budget.type === "month" && budget.period.monthAndYear?.month === moment().format("MMMM")
  );
  const yearlyBudget = budgetList.find(
    (budget: Budget) => budget.type === "year" && budget.period.year?.toString() === moment().format("YYYY")
  );

  const [showMonthlyBudget, setShowMonthlyBudget] =
    useState(showMonthBudgetFlag);
  const [showBudget, setShowBudget] = useState<Budget>(
    showMonthBudgetFlag ? monthlyBudget : yearlyBudget
  );

  function showMonthBudget() {
    setShowMonthlyBudget(true);
    setShowBudget(monthlyBudget);
  }

  function showYearBudget() {
    setShowMonthlyBudget(false);
    setShowBudget(yearlyBudget);
  }

  function handleAddYearBudget() {
    router.push({ pathname: "/addBudget", params: { addBudgetFor: "year" } });
  }
  function handleAddMonthBudget() {
    router.push({ pathname: "/addBudget", params: { addBudgetFor: "month" } });
  }

  function handleShowBudget() {
    router.push({
      pathname: "/readBudget",
      params: { clickedBudget: JSON.stringify(showBudget) },
    });
  }

  function handleEditBudget() {
    router.push({
      pathname: "/editBudget",
      params: { clickedBudget: JSON.stringify(showBudget) },
    });
  }

  useEffect(() => {
    if (clickable) {
      if (monthlyBudget) {
        setShowMonthlyBudget(true);
        setShowBudget(monthlyBudget);
      } else if (yearlyBudget) {
        setShowMonthlyBudget(false);
        setShowBudget(yearlyBudget);
      }
    } else {
      if (showMonthBudgetFlag) {
        setShowMonthlyBudget(true);
        setShowBudget(monthlyBudget);
      } else {
        setShowMonthlyBudget(false);
        setShowBudget(yearlyBudget);
      }
    }
  }, [showMonthBudgetFlag, loadingUserDetails]);

  return (
    <>
      {!loadingUserDetails &&
        budgetList.length > 0 &&
        (monthlyBudget || yearlyBudget) ? (
        <>
          <SafeAreaView style={[styles.flex_row_btw, { marginBottom: 12 }]}>
            <Text
              style={[styles.header, { display: clickable ? "flex" : "none" }]}
            >
              Your Budgets
            </Text>

            {/* Switch Buttons */}
            {clickable && budgetList.length >= 2 && monthlyBudget && yearlyBudget && (
              <View style={[styles.flex_row, styles.switchContainer]}>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    {
                      backgroundColor: showMonthlyBudget
                        ? "#4588DF"
                        : "transparent",
                    },
                  ]}
                  onPress={showMonthBudget}
                  activeOpacity={0.5}
                >
                  <Text
                    style={{
                      color: showMonthlyBudget ? "#FFF" : textColor,
                      fontWeight: showMonthlyBudget ? 500 : 400,
                    }}
                  >
                    Monthly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    {
                      backgroundColor: !showMonthlyBudget
                        ? "#4588DF"
                        : "transparent",
                    },
                  ]}
                  onPress={showYearBudget}
                  activeOpacity={0.5}
                >
                  <Text
                    style={{
                      color: !showMonthlyBudget ? "#FFF" : textColor,
                      fontWeight: !showMonthlyBudget ? 500 : 400,
                    }}
                  >
                    Yearly
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>

          <TouchableOpacity
            disabled={!clickable}
            activeOpacity={0.7}
            onPress={handleShowBudget}
          >
            <View style={styles.budgetContainer}>
              {/* Top */}
              <SafeAreaView style={styles.flex_row_btw}>
                <Text style={styles.header}>
                  {showBudget?.type == "month"
                    ? `${showBudget?.period.monthAndYear?.month ?? "Unknown"} ${showBudget?.period.monthAndYear?.year ?? ""
                    }`
                    : `Year: ${showBudget?.period.year ?? "Unknown"}`}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleEditBudget}
                  style={styles.flex_row}
                >
                  <Text style={styles.mediumFont}>
                    <Text style={styles.greyText}>Budget:</Text>
                    {"  "}
                    {formatAmount(showBudget?.totalBudget, currencyObj)}
                  </Text>
                  <FontAwesome6 name="pen-clip" color={textColor} size={16} />
                </TouchableOpacity>
              </SafeAreaView>

              <SafeAreaView style={[styles.flex_row_btw, { marginTop: 15 }]}>
                <View>
                  <Text style={styles.greyText}>Total Spent:</Text>
                  <Text numberOfLines={1} style={styles.mediumFont}>
                    {formatAmount(showBudget?.totalSpent, currencyObj)}
                  </Text>
                  <Text style={[styles.greyText, { marginTop: 20 }]}>
                    Available Budget:
                  </Text>
                  <Text numberOfLines={1} style={styles.mediumFont}>
                    {formatAmount(
                      Math.max(
                        0,
                        showBudget?.totalBudget - showBudget?.totalSpent
                      ),
                      currencyObj
                    )}
                  </Text>
                </View>

                <DonutChart
                  percentage={Math.max(
                    0,
                    ((showBudget?.totalBudget - showBudget?.totalSpent) /
                      (showBudget?.totalBudget + showBudget?.totalSpent)) *
                    100
                  )}
                />
              </SafeAreaView>
            </View>
          </TouchableOpacity>

          {/* Add More Button */}
          <SafeAreaView
            style={{
              marginBottom: 20,
              marginTop: 10,
              display: clickable ? "flex" : "none",
            }}
          >
            {!monthlyBudget ? (
              <TouchableOpacity
                onPress={handleAddMonthBudget}
                activeOpacity={0.7}
                style={[styles.addMoreButton, { backgroundColor: bgColor }]}
              >
                <Text style={styles.addMoreButtonText}>
                  + Add Montly Budget
                </Text>
              </TouchableOpacity>
            ) : (
              !yearlyBudget && (
                <TouchableOpacity
                  onPress={handleAddYearBudget}
                  activeOpacity={0.7}
                  style={[styles.addMoreButton, { backgroundColor: bgColor }]}
                >
                  <Text style={styles.addMoreButtonText}>
                    + Add Yearly Budget
                  </Text>
                </TouchableOpacity>
              )
            )}
          </SafeAreaView>
        </>
      ) : (
        !loadingUserDetails && (
          <View style={[styles.container, { marginBottom: 15 }]}>
            <SafeAreaView style={styles.flex_row_btw}>
              <SafeAreaView style={styles.flex_col}>
                <Text style={styles.header}>No budget for this month ?</Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/addBudget")}
                >
                  <LinearGradient
                    colors={["#4588DF", "#4FB92D"]}
                    style={styles.button}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.buttonText}>Set Up Budget</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </SafeAreaView>

              <Image
                source={icon}
                style={{
                  width: 40,
                  height: 40,
                  marginRight: 10,
                  objectFit: "contain",
                }}
              />
            </SafeAreaView>
          </View>
        )
      )}

      {/* Skeletons */}
      {loadingUserDetails && !monthlyBudget && !yearlyBudget ? (
        <View
          style={[styles.smallSkelton, { backgroundColor: placeholderColor }]}
        />
      ) : (
        loadingUserDetails && (
          <>
            <SafeAreaView
              style={[styles.flex_row_btw, { marginBottom: 15, }]}
            >
              <View
                style={{
                  width: 120,
                  height: 25,
                  backgroundColor: placeholderColor,
                  borderRadius: 5,
                }}
              />
              <View
                style={{
                  width: 140,
                  height: 25,
                  backgroundColor: placeholderColor,
                  borderRadius: 5,
                }}
              />
            </SafeAreaView>

            <SafeAreaView style={{ marginBottom: 15 }}>
              <View
                style={{
                  height: 220,
                  width: "100%",
                  borderRadius: 10,
                  backgroundColor: placeholderColor,
                }}
              />
            </SafeAreaView>
          </>
        )
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 15,
  },
  budgetContainer: {
    padding: 20,
    borderRadius: 15,
  },
  header: {
    fontSize: 18,
    fontWeight: 500,
  },
  greyText: {
    color: "#8a8a8a",
    fontSize: 14,
  },
  title: {
    fontSize: 14,
  },
  mediumFont: {
    fontSize: 16,
    fontWeight: 500,
  },
  flex_row_btw: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flex_row: {
    gap: 7,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  flex_col: {
    gap: 15,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  button: {
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 7,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 500,
    color: "#fff",
  },
  switchContainer: {
    padding: 5,
    borderRadius: 10,
  },
  switchButton: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 5,
  },
  addMoreButton: {
    padding: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  addMoreButtonText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: 500,
  },
  smallSkelton: {
    width: "100%",
    height: 100,
    borderRadius: 15,
    marginBottom: 30,
    marginTop: 10,
  },
});
