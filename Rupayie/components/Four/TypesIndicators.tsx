import { SafeAreaView, StyleSheet } from "react-native";
import React, { useMemo } from "react";
import { Text, View } from "../Themed";
import { useUserData } from "@/context/user";

interface TypeSpent {
  type: string;
  spent: number;
}

interface Transaction {
  _id: string;
  amount: number;
  createdAt: Date;
  category: {
    type: "Spent" | "Earned" | "Borrowed" | "Lend";
    hexColor: string;
  };
}

// Define fixed colors for each transaction type
const typeColors: Record<string, string> = {
  Spent: "#FF6667",
  Earned: "#42D7B5",
  Borrowed: "#F8B501",
  Lend: "#1869FF",
};

const TypesIndicator = () => {
  const { transactionsList } = useUserData();

  // Aggregate total spent per type
  const typeSpending: TypeSpent[] = useMemo(() => {
    const spendingMap = new Map<string, TypeSpent>();

    transactionsList?.forEach((txn: Transaction) => {
      const { type } = txn.category;
      if (!spendingMap.has(type)) {
        spendingMap.set(type, { type, spent: 0 });
      }
      spendingMap.get(type)!.spent += txn.amount;
    });

    return Array.from(spendingMap.values());
  }, [transactionsList]);

  return (
    <SafeAreaView style={styles.container}>
      {typeSpending.length > 0 ? (
        typeSpending.map((typeData) => (
          <SafeAreaView style={styles.flex_row} key={typeData.type}>
            <View
              style={[
                styles.circle,
                { backgroundColor: typeColors[typeData.type] || "#CCC" },
              ]}
            />
            <Text style={{ fontSize: 12 }}>{typeData.type}</Text>
          </SafeAreaView>
        ))
      ) : (
        <></>
      )}
    </SafeAreaView>
  );
};

export default TypesIndicator;

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 10,
    rowGap: 5,
    columnGap: 20,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 30,
  },
  flex_row: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
});
