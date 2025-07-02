import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { useLocalSearchParams, useNavigation } from "expo-router";

import PeriodPicker from "@/components/Budget/PeriodPicker";
import Amount from "@/components/Budget/Amount";
import IncludeCategories from "@/components/Budget/IncludeCategories";
import TotalBudget from "@/components/Budget/TotalBudget";
import SetCategoryLimit from "@/components/Budget/SetCategoryLimit";
import { useUserData } from "@/context/user";
import { useBudget } from "@/context/budget";
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

const EditBudget = () => {
  const { saveEditedBudget, deleteBudget, budgetProcessing, budgetDeleting } =
    useBudget();
  const { fetchUserDetails, transactionsList, categoriesList } = useUserData();
  const { setError, setMessageText } = useMessages()

  const navigation = useNavigation();

  const route = useLocalSearchParams();
  const clickedBudget =
    typeof route.clickedBudget === "string"
      ? JSON.parse(route.clickedBudget)
      : route.clickedBudget;

  const { categories, _id, period, type, totalBudget }: Budget = clickedBudget;

  const colorScheme = useColorScheme();
  const bgColor = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";

  const [firstPage, setFirstPage] = useState(true);
  const [leftBudget, setLeftBudget] = useState<number>(0);

  //edited things
  const [editedPeriod, setEditedPeriod] = useState(period);
  const [editedTotalBudget, setEditedTotalBudget] =
    useState<number>(totalBudget);
  const [includedCategories, setIncludedCategories] =
    useState<IncludedCategory[]>(categories);

  const [showError, setShowError] = useState(false);
  const [showNoCatSelectedError, setShowNoCatSelectedError] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const includedCount = includedCategories?.reduce(
    (count: number, category: IncludedCategory) =>
      count + (category.included ? 1 : 0),
    0
  );

  const budgetMonth = editedPeriod?.monthAndYear?.month;
  const budgetYear = editedPeriod?.monthAndYear?.year || editedPeriod?.year;

  const totalSpentForIncludedCategories = transactionsList
    .filter((trans: Transaction) => {
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
    if (!editedTotalBudget) {
      setShowError(true);
      return;
    } else if (includedCount == 0) {
      setShowNoCatSelectedError(true);
      return;
    }

    setFirstPage(false);
  }

  function noChangesDone() {
    if (
      totalBudget === editedTotalBudget &&
      JSON.stringify(period) === JSON.stringify(editedPeriod) &&
      JSON.stringify(categories) === JSON.stringify(includedCategories)
    ) {
      return true;
    } else {
      return false;
    }
  }

  async function handleSaveBudget() {
    try {
      if (noChangesDone()) {
        navigation.goBack();
      } else {
        const values = {
          type,
          period: editedPeriod,
          totalBudget: editedTotalBudget,
          totalSpent: totalSpentForIncludedCategories,
          categories: includedCategories,
        };

        await saveEditedBudget(_id, values);
        await fetchUserDetails();
        setMessageText("Successfully Saved Budget :)");

        navigation.goBack();
      }
    } catch (error) {
      navigation.goBack();

      setError("Failed to Save Budget :(")
      // Alert.alert("Failed", "Failed to Save");
    }
  }

  async function handleBudgetDelete() {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this budget?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteBudget(_id);
              await fetchUserDetails();
              navigation.goBack();
              navigation.goBack();

              setMessageText("Successfully Deleted Budget :)")
            } catch (error) {
              console.log(error);

              setError("Failed to Delete Budget :(")
              // Alert.alert("Failed", "Failed to Delete");
            }
          },
          style: "destructive",
        },
      ]
    );
  }

  async function refreshPage() {
    setRefresh(true);

    try {
      console.log("Fetching on Reload");

      await fetchUserDetails();
    } catch (error) {
      console.error("Error Refreshing: ", error);
    } finally {
      setRefresh(false);
    }
  }

  useEffect(() => {
    if (includedCount > 0) setShowNoCatSelectedError(false);
  }, [includedCount]);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refresh}
          onRefresh={() => refreshPage()}
          colors={["#000"]}
        />
      }
      style={[styles.container, { backgroundColor: bgColor }]}
    >
      {firstPage ? (
        <>
          <PeriodPicker type={type} setPeriod={setEditedPeriod} />

          <Amount
            totalBudget={editedTotalBudget}
            setTotalBudget={setEditedTotalBudget}
            showError={showError}
            setShowError={setShowError}
          />

          <IncludeCategories
            includedCount={includedCount}
            includedCategories={includedCategories}
            setIncludedCategories={setIncludedCategories}
            showNoCatSelectedError={showNoCatSelectedError}
          />

          <SafeAreaView style={styles.flex_row}>
            {/* Delete */}
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: "red" }]}
              activeOpacity={0.5}
              onPress={handleBudgetDelete}
              disabled={budgetDeleting}
            >
              {budgetDeleting ? (
                <ActivityIndicator size="small" color={"#FFF"} />
              ) : (
                <FontAwesome6 name="trash" size={18} color={"#FFF"} />
              )}
            </TouchableOpacity>

            <Text style={{ marginTop: 15 }}> {`{ Or }`} </Text>

            {/* Next */}
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={handleNextClick}
              disabled={budgetDeleting}
              style={[styles.nextButton, { backgroundColor: "#4FB92D" }]}
            >
              <Text style={[styles.nextText, { color: "#FFF" }]}>Next</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </>
      ) : (
        <>
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

          <TotalBudget
            totalBudget={editedTotalBudget}
            leftBudget={leftBudget}
          />

          <SetCategoryLimit
            totalBudget={editedTotalBudget}
            includedCount={includedCount}
            leftBudget={leftBudget}
            setLeftBudget={setLeftBudget}
            includedCategories={includedCategories}
            setIncludedCategories={setIncludedCategories}
            period={editedPeriod}
          />
        </>
      )}
    </ScrollView>
  );
};

export default EditBudget;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    // paddingTop: 5,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 500,
  },
  nextButton: {
    padding: 7,
    borderRadius: 10,
    marginTop: 15,
    flex: 1,
    // width: "100%",
  },
  nextText: {
    textAlign: "center",
    fontWeight: 600,
    fontSize: 18,
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
    // marginTop: -5,
    // marginBottom: 15,
  },
  doneText: {
    fontSize: 20,
    fontWeight: 500,
  },
});
