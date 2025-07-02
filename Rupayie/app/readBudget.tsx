import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import React, { useCallback, useState } from "react";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import Budgets from "@/components/Index/Budgets";
import { formatAmount } from "@/utils/formatAmount";
import { useUserData } from "@/context/user";
import { Ionicons } from "@expo/vector-icons";
import CategorywiseSpentDonut from "@/components/Budget/CategorywiseSpentDonut";
import { useMessages } from "@/context/messages";
import MessagePopUp from "@/components/MessagePopUp";

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

const ReadBudget = () => {
  const { currencyObj, budgetList } = useUserData();
  const { error, setError, messageText, setMessageText } = useMessages()

  const route = useLocalSearchParams();
  const clickedBudget =
    typeof route.clickedBudget === "string"
      ? JSON.parse(route.clickedBudget)
      : route.clickedBudget;

  const [updatedBudget, setUpdatedBudget] = useState<Budget>(clickedBudget);

  const { categories, _id, period, type, totalSpent, totalBudget }: Budget =
    updatedBudget;

  const colorScheme = useColorScheme();
  const bgColor = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";

  const includedCount = categories?.reduce(
    (count: number, category: IncludedCategory) =>
      count + (category.included ? 1 : 0),
    0
  );

  const filteredCategories = categories
    .filter((cat: IncludedCategory) => cat.included && cat.budget > 0)

  // To update the budget details after coming back from editBudget
  useFocusEffect(
    useCallback(() => {
      if (clickedBudget) {
        const parsedBudget = clickedBudget;
        const latestBudget = budgetList.find(
          (budget: Budget) => budget._id === parsedBudget._id
        );
        setUpdatedBudget(latestBudget || parsedBudget);
      }
    }, [budgetList, route.params])
  );

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <MessagePopUp
        error={error}
        messageText={messageText}
        setError={setError}
        setMessageText={setMessageText}
      />

      <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>

        {/* Budget details */}
        <Budgets showMonthBudgetFlag={type == "month" ? true : false} />

        {includedCount > 0 && (
          <>
            <SafeAreaView style={[styles.flex_row_btw, { marginTop: 15 }]}>
              <Text style={styles.title}>Budgeted Categories</Text>

              <Text>{includedCount} categories</Text>
            </SafeAreaView>

            <SafeAreaView
              style={{
                gap: 10,
                display: "flex",
                marginVertical: filteredCategories.length > 0 ? 15 : 8,
              }}
            >
              {filteredCategories.map((category: IncludedCategory) => {
                const {
                  name,
                  _id,
                  hexColor,
                  spent,
                  budget,
                }: IncludedCategory = category;

                return (
                  <View key={_id} style={styles.cat_box}>
                    <SafeAreaView style={styles.flex_row_btw}>
                      <View>
                        <View style={[styles.flex_row, { maxWidth: "80%" }]}>
                          <View
                            style={[
                              styles.catCircle,
                              { backgroundColor: hexColor },
                            ]}
                          />
                          <Text numberOfLines={1} style={{ fontSize: 16 }}>{name}</Text>
                        </View>

                        <SafeAreaView style={[styles.flex_row, { gap: 2 }]}>
                          <Text>Budget: </Text>
                          <Text style={{ color: "#8a8a8a", marginTop: 5 }}>
                            {formatAmount(budget, currencyObj)}
                          </Text>
                        </SafeAreaView>
                      </View>

                      <View>
                        <Text style={{ fontSize: 16, textAlign: "right" }}>
                          {formatAmount(spent, currencyObj)}
                        </Text>
                        <Text
                          style={{
                            color: "#8a8a8a",
                            marginTop: 5,
                            textAlign: "right",
                          }}
                        >
                          Spent
                        </Text>
                      </View>
                    </SafeAreaView>

                    {budget < spent ? (
                      <View style={[styles.flex_row, { marginTop: 10 }]}>
                        <Ionicons
                          name="alert-circle-sharp"
                          color={"red"}
                          size={16}
                        />
                        <SafeAreaView style={[styles.flex_row, { gap: 4 }]}>
                          <Text style={{ fontSize: 12 }}>
                            You've crossed your limit by
                          </Text>
                          <Text style={{ color: "red" }}>
                            {formatAmount(spent - budget, currencyObj)}
                          </Text>
                        </SafeAreaView>
                      </View>
                    ) : (
                      <View style={[styles.flex_row, { marginTop: 10 }]}>
                        <Ionicons
                          name="checkmark-done"
                          color={"#4FB92D"}
                          size={16}
                        />
                        <SafeAreaView style={[styles.flex_row, { gap: 4 }]}>
                          <Text style={{ fontSize: 12 }}>You are </Text>
                          <Text style={{ color: "#4FB92D" }}>
                            {formatAmount(budget - spent, currencyObj)}
                          </Text>
                          <Text> under your limit</Text>
                        </SafeAreaView>
                      </View>
                    )}
                  </View>
                );
              })}
            </SafeAreaView>

            <View style={[styles.cat_box, { marginBottom: 20 }]}>
              <SafeAreaView
                style={[styles.flex_row, { justifyContent: "center" }]}
              >
                <CategorywiseSpentDonut categories={categories} />
              </SafeAreaView>

              <SafeAreaView style={{ display: "flex", gap: 20, marginTop: 20 }}>
                {categories.map((cat: IncludedCategory) => {
                  const { name, spent, included, hexColor, _id } = cat;

                  return (
                    included && (
                      <SafeAreaView
                        key={_id}
                        style={[styles.flex_row_btw, { width: "100%" }]}
                      >
                        <View style={styles.flex_row}>
                          <View
                            style={[
                              styles.bigCatCircle,
                              { backgroundColor: hexColor },
                            ]}
                          />
                          <Text numberOfLines={1} style={{ width: "60%" }}>
                            {name}
                          </Text>
                        </View>

                        <Text>{formatAmount(spent, currencyObj)}</Text>
                      </SafeAreaView>
                    )
                  );
                })}
              </SafeAreaView>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ReadBudget;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingTop: 5,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 500,
  },
  cat_box: {
    borderRadius: 15,
    padding: 15,
  },
  flex_row: {
    gap: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  catCircle: {
    width: 20,
    height: 20,
    borderRadius: 30,
  },
  bigCatCircle: {
    width: 30,
    height: 30,
    borderRadius: 30,
  },
  flex_row_btw: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
});
