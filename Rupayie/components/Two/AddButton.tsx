import { Pressable, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Text } from "react-native";

const AddTransactionButton = ({ handleClick }: { handleClick: () => void }) => {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      style={[
        styles.roundButton,
        { backgroundColor: pressed ? "#47a329" : "#4FB92D" },
      ]}
      onPress={handleClick}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <Text style={styles.addButtonText}>+</Text>
    </Pressable>
  );
};

export default AddTransactionButton;

const styles = StyleSheet.create({
  roundButton: {
    position: "absolute",
    zIndex: 10,
    bottom: 20,
    right: 20,
    width: 45,
    height: 45,
    borderRadius: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4FB92D",
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: 500,
    color: "#FFF",
  },
});
