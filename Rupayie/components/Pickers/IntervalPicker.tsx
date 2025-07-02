import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { ScrollView } from "react-native";
import { Animated } from "react-native";

const IntervalPicker = ({
  isVisible,
  slideModalAnim,
  handleCloseModal,
}: {
  isVisible: boolean;
  slideModalAnim: any;
  handleCloseModal: any;
}) => {
  return (
    <ScrollView style={{ flex: 1 }}>
      <Modal visible={isVisible} transparent animationType="fade" onRequestClose={handleCloseModal}>
        <Pressable style={styles.modalContainer} onPress={handleCloseModal}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContent}
          >
            <Animated.View
              style={[{ transform: [{ translateY: slideModalAnim }] }]}
            >
              <View style={styles.animatedView}>
                <Text style={styles.title}>IntervalPicker</Text>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

export default IntervalPicker;

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    paddingVertical: 25,
    justifyContent: "center",
    backgroundColor: "rgba(29, 29, 29, 0.6)",
  },
  modalContent: {
    width: "100%",
    paddingHorizontal: 15,
    alignItems: "center",
  },
  animatedView: {
    minWidth: "100%",
    padding: 20,
    borderRadius: 15,
  },
});
