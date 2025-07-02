import {
  Image,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Button,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useColorScheme } from "@/components/useColorScheme";

import { Text, View } from "@/components/Themed";
import Balance from "@/components/Index/Balance";
import Budgets from "@/components/Index/Budgets";
import Header from "@/components/Header";
import Greeting from "@/components/Index/Greeting";
import NotificationsFlatList from "@/components/Index/NotificationsFlatList";
import RecentTransFlatList from "@/components/Index/RecentTransFlatList";

import { useAnalytics } from "@/context/analytics";
import { StatusBar } from "expo-status-bar";
import { useUserData } from "@/context/user";
import Slider from "../slider";
import moment from "moment";
import { useBudget } from "@/context/budget";
import MessagePopUp from "@/components/MessagePopUp";
import { useMessages } from "@/context/messages";
import EndText from "@/components/Index/EndText";

const GradientImage = require("@/assets/pages/gradientBg.png");

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
  note: string;
  pushedIntoTransactions: boolean;
  people: {
    name: string;
    relation: string;
    contact: number;
    _id: string;
  };
  createdAt: Date;
  image: string;
}

export default function TabOne() {
  const colorScheme = useColorScheme();
  const { fetchAnalytics } = useAnalytics();
  const { fetchUserDetails, loadingUserDetails, transactionsList, budgetList } = useUserData();
  const { saveEditedBudget } = useBudget();
  const { error, setError, messageText, setMessageText } = useMessages()

  const [sliderVisible, setSliderVisible] = useState(false);
  const [refresh, setRefresh] = useState(false);

  async function refreshPage() {
    setRefresh(true);

    try {
      console.log("Fetching on Reload");

      await fetchAnalytics();
      await fetchUserDetails();
      setMessageText("Sucessfully Refreshed")
    } catch (error) {
      console.error("Error Refreshing: ", error);
      setError("Something Went Wrong!")
    } finally {
      setRefresh(false);
    }
  }

  function showSlider() {
    setSliderVisible(true);
  }
  function hideSlider() {
    setSliderVisible(false);
  }

  const transactionsHash = useMemo(() => JSON.stringify(
    transactionsList?.map((txn: Transaction) => (txn))
  ), [transactionsList]);

  useEffect(() => {

    if (!loadingUserDetails) updateBudgets();
  }, [transactionsList?.length, transactionsHash]);

  useEffect(() => {
    setMessageText("Welcome!");
  }, [])

  async function updateBudgets() {
    try {
      const budgetMonth = moment().format('MMMM');
      const budgetYear = moment().format('YYYY');

      // Find matching monthly and yearly budgets
      const monthlyBudget: Budget = budgetList.find(
        (budget: Budget) =>
          budget.type === "month" &&
          budget.period.monthAndYear?.month === budgetMonth &&
          budget.period.monthAndYear?.year.toString() === budgetYear
      );

      const yearlyBudget: Budget = budgetList.find(
        (budget: Budget) =>
          budget.type === "year" && budget.period.year?.toString() === budgetYear
      );

      if (!monthlyBudget && !yearlyBudget) {
        console.log("No budgets found for this period.");
        return;
      }

      // Function to update spent amounts in a given budget
      const updateBudgetSpent = (budget: Budget) => {
        let totalSpent = 0;

        budget.categories = budget.categories.map((category) => {
          if (!category.included) {
            return { ...category, budget: 0, spent: 0 }; // Reset for excluded categories
          }

          const categorySpent = transactionsList
            .filter((trans: Transaction) => {
              const transactionDate = moment(trans.createdAt);
              const transactionMonth = transactionDate.format('MMMM');
              const transactionYear = transactionDate.format('YYYY');

              return (
                trans.category._id === category._id &&
                ((budget.type === "month" &&
                  transactionMonth === budgetMonth &&
                  transactionYear === budgetYear) ||
                  (budget.type === "year" && transactionYear === budgetYear))
              );
            })
            .reduce((sum: number, trans: Transaction) => sum + trans.amount, 0);

          totalSpent += categorySpent; // Accumulate total spent

          return { ...category, spent: categorySpent };
        });

        return totalSpent;
      };

      let totalSpentMonthly = monthlyBudget ? updateBudgetSpent(monthlyBudget) : 0;
      let totalSpentYearly = yearlyBudget ? updateBudgetSpent(yearlyBudget) : 0;

      const monthBudgetValues = {
        totalSpent: totalSpentMonthly,
        categories: monthlyBudget?.categories,
      };
      const yearBudgetValues = {
        totalSpent: totalSpentYearly,
        categories: yearlyBudget?.categories,
      };

      if (monthlyBudget) await saveEditedBudget(monthlyBudget._id, monthBudgetValues)
      if (yearlyBudget) await saveEditedBudget(yearlyBudget._id, yearBudgetValues)
      console.log(
        "Sucessfully Saved Budget:",
        `${monthlyBudget ? "Month Spent of " + `${totalSpentMonthly}`
          : yearlyBudget ? " and Year Spent of " + `${totalSpentYearly}`
            : ""}`
      );
    } catch (error) {
      console.error("Error updating budgets:", error);
    }
  }

  return (
    <View
      style={[
        styles.conatiner,
        { backgroundColor: colorScheme === "dark" ? "#1C1C1C" : "#EDEDED" },
      ]}
    >
      <MessagePopUp
        error={error}
        messageText={messageText}
        setError={setError}
        setMessageText={setMessageText}
      />

      <StatusBar backgroundColor={"transparent"} />

      <Image
        source={GradientImage}
        style={{
          position: "absolute",
          zIndex: 0,
          height: 250,
          objectFit: "cover",
        }}
      />

      <View style={styles.bodyContainer}>
        <Header showSlider={showSlider} />

        <Slider isVisible={sliderVisible} hideSlider={hideSlider} />

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              onRefresh={() => refreshPage()}
              colors={["#000"]}
            />
          }
          style={styles.paddings}
        >
          <Greeting />

          <Balance />

          <NotificationsFlatList />

          <RecentTransFlatList />

          <Budgets clickable />

          <EndText />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conatiner: {
    flex: 1,
  },
  bodyContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "transparent",
  },
  paddings: {
    padding: 15,
    paddingTop: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
