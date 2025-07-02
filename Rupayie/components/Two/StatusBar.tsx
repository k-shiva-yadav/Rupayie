import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  PanResponder,
  Animated,
} from "react-native";
import { Text } from "../Themed";

const StatusBarComponent = ({ textColor }: { textColor: string }) => {
  const [progress, setProgress] = useState(2); // Default stage is "Started"
  const translateX = new Animated.Value(0); // Track swipe movement

  const stages = [
    { label: "Cancelled", color: "grey" },
    { label: "Started", color: "#ff9500" },
    { label: "In Progress", color: "#0cb800" },
    { label: "Paused", color: "#7374c9" },
    { label: "Completed", color: "#0004db" },
  ];

  const handleStagePress = (index: number) => {
    setProgress(index); // Update progress on tap
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      translateX.setValue(gestureState.dx);
    },
    onPanResponderRelease: (_, gestureState) => {
      const swipeThreshold = 30; // Minimum swipe distance

      if (gestureState.dx > swipeThreshold && progress < stages.length - 1) {
        setProgress(progress + 1); // Move right
      } else if (gestureState.dx < -swipeThreshold && progress > 0) {
        setProgress(progress - 1); // Move left
      }

      Animated.spring(translateX, {
        toValue: 0, // Reset swipe position
        useNativeDriver: true,
      }).start();
    },
  });

  return (
    <>
      <Text>Status: {stages[progress].label}</Text>

      <View style={styles.container}>
        {/* Progress Bar */}
        <View style={styles.progressBarContainer} {...panResponder.panHandlers}>
          {/* Background Stick */}
          <View
            style={[
              styles.backgroundStick,
              {
                width: `${(progress / (stages.length - 1)) * 100}%`,
                backgroundColor: stages[progress].color, // Dynamic color
              },
            ]}
          />

          {/* Progress Steps */}
          {stages.map((stage, index) => (
            <Pressable
              key={index}
              style={[
                styles.progressStep,
                {
                  backgroundColor: stage.color,
                  width: index === progress ? 25 : 12,
                  height: index === progress ? 25 : 12,
                  borderWidth: index === progress ? 0 : 1,
                  borderColor: index === progress ? "" : textColor,
                },
              ]}
              onPress={() => handleStagePress(index)}
            />
          ))}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
    marginBottom: 25,
  },
  progressBarContainer: {
    width: "95%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    // height: 40,
    borderRadius: 30,
    position: "relative",
    justifyContent: "space-between",
  },
  backgroundStick: {
    height: 5,
    zIndex: -1,
    left: 0,
    top: "40%",
    position: "absolute",
    borderRadius: 30,
  },
  progressStep: {
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
});

export default StatusBarComponent;
