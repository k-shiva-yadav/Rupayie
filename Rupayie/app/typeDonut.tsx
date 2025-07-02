import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import CategoryChart from "@/components/Four/CategoryChart";
import CategoryIndicators from "@/components/Four/CategoryIndicators";
import CategoryTransactions from "@/components/Four/CategoryTransactions";
import { useColorScheme } from "@/components/useColorScheme";
import { useNavigation } from "expo-router";
import { useTransactionsCategory } from "@/context/transCategory";
import { useTransactionFilter } from "@/context/filterTransByDate";

const TypeDonut = () => {
  const { donutCategory } = useTransactionsCategory();
  const { donutTransactionsFilter } = useTransactionFilter();

  const colorScheme = useColorScheme();
  const bgColor = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";

  const navigation = useNavigation();

  const statusName =
    donutCategory == "Spent"
      ? "Spendings"
      : donutCategory == "Earned"
      ? "Earning"
      : donutCategory == "Borrowed"
      ? "Borrowings"
      : "Lendings";

  useEffect(() => {
    navigation.setOptions({
      title: `Your ${statusName} For ${donutTransactionsFilter.title}`,
    });
  }, []);

  return (
    <ScrollView style={[styles.conatiner, { backgroundColor: bgColor }]}>
      <CategoryChart />

      <CategoryIndicators />

      <CategoryTransactions />
    </ScrollView>
  );
};

export default TypeDonut;

const styles = StyleSheet.create({
  conatiner: {
    padding: 15,
    flex: 1,
  },
});
