import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import PeriodPicker from "@/components/Budget/PeriodPicker";
import SwitchType from "@/components/Budget/SwitchType";
import Amount from "@/components/Budget/Amount";
import IncludeCategories from "@/components/Budget/IncludeCategories";
import { useUserData } from "@/context/user";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useBudget } from "@/context/budget";
import TotalBudget from "@/components/Budget/TotalBudget";
import SetCategoryLimit from "@/components/Budget/SetCategoryLimit";
import { FontAwesome6 } from "@expo/vector-icons";
import { useMessages } from "@/context/messages";

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

interface Period {
  monthAndYear?: {
    month: string;
    year: number;
  };
  year?: number;
}

const AddBudget = () => {
  const { addNewBudget, budgetProcessing } = useBudget();
  const { categoriesList, fetchUserDetails, transactionsList } = useUserData();
  const { setError, setMessageText } = useMessages()

  const route = useLocalSearchParams();
  const { addBudgetFor } = route;
  const navigation = useNavigation();

  const colorScheme = useColorScheme();
  const bgColor = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";

  const [firstPage, setFirstPage] = useState(true);

  const [type, setType] = useState<string>(
    addBudgetFor === "year" ? "year" : "month"
  );
  const [period, setPeriod] = useState<Period>();
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [leftBudget, setLeftBudget] = useState<number>(0);
  const [includedCategories, setIncludedCategories] = useState<
    IncludedCategory[]
  >([]);

  const [showError, setShowError] = useState(false);
  const [showNoCatSelectedError, setShowNoCatSelectedError] = useState(false);

  const includedCount = includedCategories?.reduce(
    (count: number, category: IncludedCategory) =>
      count + (category.included ? 1 : 0),
    0
  );

  const budgetMonth = period?.monthAndYear?.month;
  const budgetYear = period?.monthAndYear?.year || period?.year;

  const totalSpentForIncludedCategories = transactionsList
    ?.filter((trans: Transaction) => {
      const transactionDate = new Date(trans.createdAt);
      const transactionMonth = transactionDate.toLocaleString("en-US", {
        month: "long",
      });
      const transactionYear = transactionDate.getFullYear();

      // Check if category is included
      const isIncludedCategory = includedCategories.some(
        (category) => category.included && category._id === trans.category._id
      );

      // If month & year are provided, filter by both
      if (budgetMonth && budgetYear) {
        return (
          isIncludedCategory &&
          transactionMonth === budgetMonth &&
          transactionYear === budgetYear
        );
      }

      // If only year is provided, filter by year
      if (budgetYear) {
        return isIncludedCategory && transactionYear === budgetYear;
      }

      return false;
    })
    .reduce((sum: number, trans: Transaction) => sum + trans.amount, 0);

  function handleNextClick() {
    if (!totalBudget) {
      setShowError(true);
      return;
    }

    setFirstPage(false);
  }

  async function handleSaveBudget() {
    try {

      const values = {
        type,
        period,
        totalBudget,
        totalSpent: totalSpentForIncludedCategories,
        categories: includedCategories,
      };

      await addNewBudget(values);
      await fetchUserDetails();
      navigation.goBack();

      setMessageText("Successfully Added Budget :)")
    } catch (error) {
      navigation.goBack();

      setError("Failed to Add Budget :(")
    }
  }

  useEffect(() => {
    if (includedCount > 0) setShowNoCatSelectedError(false);
  }, [includedCount]);

  useEffect(() => {
    if (categoriesList && Array.isArray(categoriesList)) {
      setIncludedCategories(
        categoriesList
          ?.filter((category: { type: string }) => category.type === "Spent")
          .map((category) => ({
            ...category,
            budget: 0,
            spent: 0,
            included: true,
          }))
      );
    }
  }, [categoriesList]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bgColor }}>
      {firstPage ? (
        <SafeAreaView
          style={[
            styles.container,
            {
              display: "flex",
              justifyContent: "space-between",
            },
          ]}
        >
          <SwitchType
            setType={setType}
            type={type}
            addBudgetFor={addBudgetFor}
          />
          <PeriodPicker type={type} setPeriod={setPeriod} />
          <Amount
            totalBudget={totalBudget}
            setTotalBudget={setTotalBudget}
            showError={showError}
            setShowError={setShowError}
          />
          <IncludeCategories
            includedCount={includedCount}
            includedCategories={includedCategories}
            setIncludedCategories={setIncludedCategories}
            showNoCatSelectedError={showNoCatSelectedError}
          />

          <TouchableOpacity
            activeOpacity={0.5}
            onPress={handleNextClick}
            style={[styles.nextButton, { backgroundColor: "#4FB92D" }]}
          >
            <Text style={[styles.nextText, { color: "#FFF" }]}>Next</Text>
          </TouchableOpacity>
        </SafeAreaView>
      ) : (
        <SafeAreaView style={styles.container}>
          <SafeAreaView style={[styles.flex_row, { alignItems: "flex-start" }]}>
            {/* Text */}
            <SafeAreaView style={{ flex: 1 }}>
              <Text style={styles.title}>
                Set Category-wise Limits{" "}
                <Text style={{ color: "#8a8a8a" }}>(Optional)</Text>
              </Text>
              <Text style={{ color: "#8a8a8a" }}>
                You can set limits for each category that you included in your
                budget, if you want.
              </Text>
            </SafeAreaView>

            {/* Save button */}
            <SafeAreaView style={styles.flex_row}>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={handleSaveBudget}
                style={styles.saveButton}
                disabled={budgetProcessing || leftBudget < 0}
              >
                {budgetProcessing ? (
                  <ActivityIndicator size="small" color={"#FFF"} />
                ) : (
                  <FontAwesome6
                    name="check"
                    color={"#FFF"}
                    style={{ fontSize: 24, fontWeight: 500 }}
                  />
                )}
              </TouchableOpacity>
            </SafeAreaView>
          </SafeAreaView>

          <TotalBudget totalBudget={totalBudget} leftBudget={leftBudget} />

          <SetCategoryLimit
            totalBudget={totalBudget}
            includedCount={includedCount}
            leftBudget={leftBudget}
            setLeftBudget={setLeftBudget}
            includedCategories={includedCategories}
            setIncludedCategories={setIncludedCategories}
            period={period}
          />
        </SafeAreaView>
      )}
    </ScrollView>
  );
};

export default AddBudget;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingBottom: 0,
  },
  nextButton: {
    padding: 7,
    borderRadius: 10,
    marginTop: 15,
    width: "100%",
  },
  nextText: {
    textAlign: "center",
    fontWeight: 600,
    fontSize: 18,
  },
  title: {
    fontSize: 16,
    fontWeight: 500,
  },
  flex_row_btw: {
    gap: 5,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flex_row: {
    gap: 10,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
  },
  saveButton: {
    borderRadius: 30,
    backgroundColor: "#4FB92D",
    alignSelf: "flex-end",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    width: 50,
  },
  doneButton: {
    borderRadius: 30,
    backgroundColor: "#4FB92D",
    alignSelf: "flex-end",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: 40,
    marginTop: -5,
    // marginBottom: 15,
  },
  doneText: {
    fontSize: 20,
    fontWeight: 500,
  },
});
