import { StyleSheet } from "react-native";
import React from "react";
import { formatAmount } from "@/utils/formatAmount";
import { useUserData } from "@/context/user";
import { Text, View } from "../Themed";

const TotalBudget = ({
  totalBudget,
  leftBudget,
}: {
  totalBudget: number;
  leftBudget: number;
}) => {
  const { currencyObj } = useUserData();

  return (
    <View style={[styles.flex_col, styles.box, { marginTop: 15 }]}>
      <View style={styles.flex_row_btw}>
        <Text style={{ color: "#8a8a8a" }}>Total Budget</Text>
        <Text style={{ color: "#8a8a8a" }}>Remaining</Text>
      </View>

      <View style={styles.flex_row_btw}>
        <Text style={styles.bigText}>
          {formatAmount(totalBudget, currencyObj)}
        </Text>
        <Text style={styles.bigText}>
          {formatAmount(leftBudget, currencyObj)}
        </Text>
      </View>
    </View>
  );
};

export default TotalBudget;

const styles = StyleSheet.create({
  flex_row_btw: {
    gap: 5,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flex_col: {
    gap: 5,
    display: "flex",
    flexDirection: "column",
  },
  box: {
    padding: 15,
    borderRadius: 10,
  },
  bigText: {
    fontSize: 18,
    fontWeight: 500,
  },
});
