import { StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import React from "react";
import { Text, View } from "../Themed";
import { useColorScheme } from "@/components/useColorScheme";

const SwitchType = ({
  type,
  setType,
  addBudgetFor,
}: {
  type: string;
  setType: (type: string) => void;
  addBudgetFor: any | string;
}) => {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.flex_row}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setType("month")}
          disabled={type === "month" || addBudgetFor === "year"}
          style={[
            styles.button,
            {
              width: "49%",
              backgroundColor: type === "month" ? "#4FB92D" : "transparent",
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              {
                color:
                  type === "month"
                    ? "#FFF"
                    : addBudgetFor === "year"
                    ? "#888"
                    : textColor,
                fontWeight: type === "month" ? "bold" : 400,
              },
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={type === "year" || addBudgetFor === "month"}
          onPress={() => setType("year")}
          style={[
            styles.button,
            {
              width: "49%",
              backgroundColor: type === "year" ? "#4FB92D" : "transparent",
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              {
                color:
                  type === "year"
                    ? "#FFF"
                    : addBudgetFor === "month"
                    ? "#888"
                    : textColor,
                fontWeight: type === "year" ? "bold" : 400,
              },
            ]}
          >
            Yearly
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default SwitchType;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
  },
  flex_row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    borderRadius: 5,
    paddingVertical: 7,
  },
  buttonText: {
    textAlign: "center",
  },
});
