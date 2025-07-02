import {
  ActivityIndicator,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
import { useColorScheme } from "@/components/useColorScheme";
import { Text, View } from "../Themed";
import { Animated } from "react-native";
import { SafeAreaView } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import NumbersCarousel from "./NumbersCarousel";

const CountPicker = ({
  count,
  setCount,
}: {
  count: number;
  setCount: (count: number) => void;
}) => {
  const colorScheme = useColorScheme();
  const bgColor = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";

  const slideModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen

  const [showPicker, setShowPicker] = useState(false);
  const [countCopy, setCountCopy] = useState(count);

  function handleConfirm() {
    setCount(countCopy);
    handleCloseAddModal();
  }

  const openAddCategoryModal = () => {
    setShowPicker(true);

    setTimeout(() => {
      Animated.timing(slideModalAnim, {
        toValue: 0, // Slide up
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 100);
  };

  const handleCloseAddModal = () => {
    Animated.timing(slideModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowPicker(false);
      // reset
      setCountCopy(count);
    });
  };

  return (
    <>
      <TouchableOpacity
        onPress={openAddCategoryModal}
        style={[
          styles.inputField,
          { backgroundColor: bgColor, borderWidth: 1.5, borderColor: "#4588DF" },
        ]}
        activeOpacity={0.7}
      >
        <Text>
          {count} {count > 1 ? "Times" : "Time"}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <Modal visible={showPicker} transparent animationType="fade" onRequestClose={handleCloseAddModal}>
          <Pressable
            style={styles.modalContainer}
            onPress={handleCloseAddModal}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              <Animated.View
                style={[{ transform: [{ translateY: slideModalAnim }] }]}
              >
                <View style={styles.pickerContainer}>
                  <SafeAreaView
                    style={[styles.flex_row_btw, { marginBottom: 10 }]}
                  >
                    <Text style={styles.title}>No. of Counts to Repeat</Text>

                    <TouchableOpacity style={{}} onPress={handleCloseAddModal}>
                      <FontAwesome6 name="xmark" size={20} color={textColor} />
                    </TouchableOpacity>
                  </SafeAreaView>

                  <SafeAreaView style={[styles.scrollPicker]}>
                    <NumbersCarousel
                      data={Array.from({ length: 36 }, (_, i) => i + 1)}
                      setSelectedDay={setCountCopy}
                      selectedDay={countCopy}
                    />
                  </SafeAreaView>

                  <SafeAreaView style={styles.doneButton}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleConfirm}
                    >
                      <Text style={styles.doneText}>DONE</Text>
                    </TouchableOpacity>
                  </SafeAreaView>
                </View>
              </Animated.View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
};

export default CountPicker;

const styles = StyleSheet.create({
  inputField: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontWeight: 400,
  },
  modalContent: {
    width: "100%",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    paddingHorizontal: 15,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  pickerContainer: {
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#666",
    width: "100%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  scrollPicker: {
    width: "30%",
    height: 200,
    borderRadius: 5,
    marginHorizontal: 5,
    paddingVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  flex_row_btw: {
    gap: 5,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  doneButton: {
    padding: 10,
    marginTop: 15,
    minWidth: "100%",
    borderRadius: 20,
    backgroundColor: "#4588DF", //blue
  },
  doneText: {
    fontWeight: 500,
    textAlign: "center",
    color: "#FFF",
  },
});
