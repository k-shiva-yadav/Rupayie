import { StyleSheet, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import { Text, View } from "../Themed";
import { SafeAreaView } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import { Ionicons } from "@expo/vector-icons";

const Amount = ({
  totalBudget,
  setTotalBudget,
  showError,
  setShowError,
}: {
  totalBudget: number | null;
  setTotalBudget: (totalBudget: number) => void;
  showError: boolean;
  setShowError: (showError: boolean) => void;
}) => {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const placeholderColor = colorScheme === "dark" ? "#c2c2c2" : "#4d4d4d";
  const bgColor = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";

  const [showLimitError, setShowLimitError] = useState(false);
  const limit = 1000000000;

  useEffect(() => {
    if (totalBudget && totalBudget > limit) setShowLimitError(true);
    else setShowLimitError(false);
  }, [totalBudget]);

  useEffect(() => {
    if (totalBudget !== 0) setShowError(false);
  }, [totalBudget]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Limit Amount</Text>

      <SafeAreaView
        style={[
          styles.flex_row,
          styles.inputField,
          { backgroundColor: bgColor },
        ]}
      >
        <Ionicons name="cash" color={"#4FB92D"} size={20} />
        <TextInput
          placeholder="150.00"
          value={totalBudget === 0 ? "" : totalBudget?.toString()}
          placeholderTextColor={placeholderColor}
          style={{ color: textColor, flex: 1 }}
          keyboardType="number-pad"
          onChangeText={(text) => setTotalBudget(parseFloat(text) || 0)}
        />
      </SafeAreaView>

      {showLimitError && (
        <Text style={{ color: "red", marginTop: 10 }}>
          Limit should be less than {limit}!
        </Text>
      )}
      {showError && (
        <Text style={{ color: "red", marginTop: 10 }}>Enter Amount!</Text>
      )}
    </View>
  );
};

export default Amount;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 15,
  },
  flex_row: {
    gap: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  inputField: {
    padding: 12,
    borderRadius: 10,
  },
});
