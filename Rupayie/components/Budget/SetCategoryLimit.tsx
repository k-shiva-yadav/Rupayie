import { SafeAreaView, StyleSheet, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import { Text, View } from "../Themed";
import { useColorScheme } from "@/components/useColorScheme";
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

interface Params {
  totalBudget: number;
  leftBudget: number;
  setLeftBudget: (leftBudget: number) => void;
  includedCategories: IncludedCategory[];
  setIncludedCategories: (
    callback: (prev: IncludedCategory[]) => IncludedCategory[]
  ) => void;
  includedCount: number;
  period?: {
    monthAndYear?: {
      month: string;
      year: number;
    };
    year?: number;
  };
}

const SetCategoryLimit = ({
  totalBudget,
  leftBudget,
  setLeftBudget,
  includedCategories,
  setIncludedCategories,
  includedCount,
  period,
}: Params) => {
  const { transactionsList } = useUserData();

  const budgetMonth = period?.monthAndYear?.month;
  const budgetYear =
    period?.monthAndYear?.year ?? period?.year ?? new Date().getFullYear();

  useEffect(() => {
    setIncludedCategories((prev) =>
      prev.map((cat) => {
        const categorySpent = transactionsList
          .filter((trans: Transaction) => {
            const transDate = new Date(trans.createdAt);
            const transMonth = transDate.toLocaleString("en-US", {
              month: "long",
            });
            const transYear = transDate.getFullYear();

            // Match budget's month & year if available, otherwise just match the year
            return (
              trans.category._id === cat._id &&
              ((budgetMonth &&
                budgetYear &&
                transMonth === budgetMonth &&
                transYear === budgetYear) ||
                (!budgetMonth && transYear === budgetYear))
            );
          })
          .reduce((sum: number, trans: Transaction) => sum + trans.amount, 0);

        return cat.included
          ? { ...cat, spent: categorySpent } // Set spent amount
          : { ...cat, budget: 0, spent: 0 }; // Reset for excluded categories
      })
    );
  }, [transactionsList, period]);

  return (
    <>
      <Text numberOfLines={1} style={{ marginVertical: 15 }}>
        {includedCount === 0
          ? "No Categories Included in Budget"
          : includedCount > 0 && includedCount !== includedCategories.length
            ? `${includedCount} Categories Included in Budget`
            : includedCount > 0 &&
            includedCount === includedCategories.length &&
            `All Categories Included in Budget`}
      </Text>

      <SafeAreaView style={[styles.flex_col, { marginBottom: 30 }]}>
        {includedCategories
          .filter((cat: IncludedCategory) => !!cat.included) // Only show included ones
          .map((category: IncludedCategory) => (
            <CategoryLimitSetter
              key={category._id}
              totalBudget={totalBudget}
              category={category}
              includedCategories={includedCategories}
              setIncludedCategories={setIncludedCategories}
              leftBudget={leftBudget}
              setLeftBudget={setLeftBudget}
            />
          ))}
      </SafeAreaView>
    </>
  );
};

const CategoryLimitSetter = ({
  totalBudget,
  category,
  setIncludedCategories,
  includedCategories,
  leftBudget,
  setLeftBudget,
}: {
  totalBudget: number;
  category: IncludedCategory;
  includedCategories: IncludedCategory[];
  setIncludedCategories: (
    callback: (prev: IncludedCategory[]) => IncludedCategory[]
  ) => void;
  leftBudget: number;
  setLeftBudget: (leftBudget: number) => void;
}) => {
  const colorScheme = useColorScheme();
  const bgColor = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";
  const placeholderColor = colorScheme === "dark" ? "#c2c2c2" : "#4d4d4d";

  const [catLimit, setCatLimit] = useState<number>(category.budget);

  function handleCatLimitEntry(limit: number) {
    if (isNaN(limit)) limit = 0;

    // Ensure the entered limit doesn't exceed total budget
    let newLimit = Math.min(limit, totalBudget);

    // Ensure the new limit doesn't exceed the available left budget
    if (newLimit > leftBudget + category.budget) {
      newLimit = leftBudget + category.budget;
    }

    setCatLimit(newLimit);

    setIncludedCategories((prev) => {
      if (!Array.isArray(prev)) return [];

      const updatedCategories = prev.map((cat) =>
        cat._id === category._id ? { ...cat, budget: newLimit } : cat
      );

      // Recalculate left budget only for included categories
      const newLeftBudget =
        totalBudget -
        updatedCategories
          .filter((cat) => cat.included)
          .reduce((sum, cat) => sum + cat.budget, 0);

      setLeftBudget(newLeftBudget);
      return updatedCategories;
    });
  }

  useEffect(() => {
    const newLeftBudget =
      totalBudget -
      includedCategories
        .filter((cat) => cat.included)
        .reduce((sum, cat) => sum + cat.budget, 0);

    setLeftBudget(newLeftBudget);
  }, [catLimit, leftBudget]);

  return (
    <View style={[styles.flex_row_btw, styles.box]}>
      <View style={[styles.flex_row, { maxWidth: "40%" }]}>
        <View style={[styles.circle, { backgroundColor: category.hexColor }]} />
        <Text numberOfLines={1}>{category.name}</Text>
      </View>

      <TextInput
        style={[
          styles.amountInput,
          { color: textColor, backgroundColor: bgColor },
        ]}
        value={catLimit == 0 ? "" : catLimit.toString()}
        keyboardType="numeric"
        placeholder={"No Limit"}
        placeholderTextColor={placeholderColor}
        onChangeText={(text) => handleCatLimitEntry(parseFloat(text))}
      />
    </View>
  );
};

export default SetCategoryLimit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingBottom: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: 500,
  },
  bigText: {
    fontSize: 18,
    fontWeight: 500,
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
  flex_row_btw: {
    gap: 5,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flex_col: {
    gap: 10,
    display: "flex",
    flexDirection: "column",
  },
  flex_row: {
    gap: 10,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
  },
  saveAndNextBtn: {
    padding: 7,
    borderRadius: 10,
    width: "48.5%",
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
  box: {
    paddingLeft: 15,
    paddingRight: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  circle: {
    width: 25,
    height: 25,
    borderRadius: 25, // Makes it circular
  },
  categoryText: {
    fontSize: 12,
    textAlign: "center",
    maxWidth: 70,
  },
  amountInput: {
    textAlign: "center",
    minWidth: 90,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
});
