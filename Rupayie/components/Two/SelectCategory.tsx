import { Pressable, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { useColorScheme } from "@/components/useColorScheme";

import { Text, View } from "../Themed";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTransactionsCategory } from "@/context/transCategory";

const SelectCategory = () => {
  const { clickedTransCategory, setClickedTransCategory } =
    useTransactionsCategory();

  function setClickedCategory(catName: string) {
    setClickedTransCategory(catName);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.boldText}>Select Category</Text>

      <CategorySelector
        clickedCategory={clickedTransCategory}
        setClickedCategory={setClickedCategory}
      />

      {/* <Text>{clickedCategory}</Text> */}
    </View>
  );
};

export function CategorySelector({
  clickedCategory,
  setClickedCategory,
}: {
  clickedCategory: string;
  setClickedCategory: (catName: string) => void;
}) {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";

  return (
    <View style={styles.flex_row_btw}>
      {["Spent", "Earned", "Borrowed", "Lend"].map((item) => (
        <TouchableOpacity
          key={item}
          activeOpacity={0.7}
          style={styles.buttonBox}
          disabled={clickedCategory === item}
          onPress={() => setClickedCategory(item)}
        >
          <FontAwesome6
            size={item === clickedCategory ? 22 : 20}
            color={item === clickedCategory ? "#FFF" : textColor}
            name={
              item === "Earned"
                ? "wallet"
                : item === "Spent"
                ? "coins"
                : item === "Borrowed"
                ? "credit-card"
                : "money-bills"
            }
            style={[
              styles.button,
              {
                backgroundColor:
                  clickedCategory === item
                    ? "#4FB92D" /* green */
                    : "#00000000" /* trans */,
              },
            ]}
          />

          <Text
            style={[
              styles.buttonText,
              {
                color:
                  clickedCategory === item
                    ? "#4FB92D" /* green */
                    : textColor /* color */,
              },
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default SelectCategory;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
    marginHorizontal: 15,
  },
  boldText: {
    fontSize: 18,
    fontWeight: 600,
    textAlign: "left",
    marginBottom: 20,
  },
  buttonBox: {
    gap: 5,
    width: "20%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    color: "#fff",
  },
  flex_row_btw: {
    width: "100%",
    display: "flex",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
});
