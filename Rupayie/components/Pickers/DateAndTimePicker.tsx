import React, { useRef, useState } from "react";
import {
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { Text, View } from "../Themed";
import { useColorScheme } from "@/components/useColorScheme";
import formatDateTimeSimple from "@/utils/formatDateTimeSimple";
import { Easing } from "react-native";
import { SafeAreaView } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import NumbersCarousel from "@/components/Pickers/NumbersCarousel";

const DateAndTimePicker = ({
  date,
  handleConfirm: handleDateAndTimeConfirm,
}: {
  date: Date;
  handleConfirm: (value: Date) => void;
}) => {
  const colorScheme = useColorScheme();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // States for manual selection
  const [selectedDay, setSelectedDay] = useState(date.getDate());
  const [selectedMonth, setSelectedMonth] = useState(date.getMonth());
  const [selectedYear, setSelectedYear] = useState(date.getFullYear());
  const [selectedHour, setSelectedHour] = useState(
    date.getHours() % 12 || 12 // Convert to 12-hour format
  );
  const [selectedMinute, setSelectedMinute] = useState(date.getMinutes());
  const [selectedAmPm, setSelectedAmPm] = useState(
    selectedHour >= 12 ? "PM" : "AM"
  );

  const [formatedDate, formatedTime] = formatDateTimeSimple(date).split(",");

  const slideDateModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen
  const slideTimeModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen

  const inputBg = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";

  const openDateModal = () => {
    setShowDatePicker(true);

    setTimeout(() => {
      Animated.timing(slideDateModalAnim, {
        toValue: 0, // Slide up
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 100);
  };

  const closeDateModal = () => {
    Animated.timing(slideDateModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowDatePicker(false);
      handleDateAndTimeConfirm(date ? date : new Date());
    });
  };

  const openTimeModal = () => {
    setShowTimePicker(true);

    setTimeout(() => {
      Animated.timing(slideTimeModalAnim, {
        toValue: 0, // Slide up
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 100);
  };

  const closeTimeModal = () => {
    Animated.timing(slideTimeModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowTimePicker(false);
      handleDateAndTimeConfirm(date ? date : new Date());
    });
  };

  const handleDateConfirm = () => {
    Animated.timing(slideDateModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowDatePicker(false);
      openTimeModal();
    });
  };

  const handleTimeConfirm = () => {
    Animated.timing(slideTimeModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      const finalHour =
        selectedAmPm === "PM"
          ? selectedHour === 12
            ? 12
            : selectedHour + 12
          : selectedHour === 12
            ? 0
            : selectedHour;

      const newDate = new Date(selectedYear, selectedMonth, selectedDay, finalHour, selectedMinute, 0, 0);

      handleDateAndTimeConfirm(newDate);
      setShowTimePicker(false);
    });
  };

  return (
    <>
      <TouchableOpacity
        onPress={openDateModal}
        activeOpacity={0.7}
        style={[styles.smallBox, { backgroundColor: inputBg }]}
      >
        <Text>{formatedDate}, {formatedTime}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={closeDateModal}>
          <Pressable style={styles.modalContainer} onPress={closeDateModal}>
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              <Animated.View
                style={[{ transform: [{ translateY: slideDateModalAnim }] }]}
              >
                <View style={styles.pickerContainer}>
                  <SafeAreaView
                    style={[styles.flex_row_btw, { marginBottom: 10 }]}
                  >
                    <Text style={styles.title}>Pick a Date</Text>

                    <TouchableOpacity onPress={closeDateModal}>
                      <FontAwesome6 name="xmark" size={20} color={textColor} />
                    </TouchableOpacity>
                  </SafeAreaView>

                  {/* Pickers */}
                  <View style={styles.pickerRow}>
                    <SafeAreaView style={[styles.scrollPicker]}>
                      <NumbersCarousel
                        data={Array.from({ length: 31 }, (_, i) => i + 1)} // Days of the month (1-31)
                        setSelectedDay={setSelectedDay}
                        selectedDay={selectedDay}
                      />
                    </SafeAreaView>

                    <SafeAreaView style={[styles.scrollPicker]}>
                      <NumbersCarousel
                        data={Array.from({ length: 12 }, (_, i) => i)} // Months of the year (0-11)
                        setSelectedDay={setSelectedMonth}
                        selectedDay={selectedMonth}
                        monthPicker={true}
                      />
                    </SafeAreaView>

                    <SafeAreaView style={[styles.scrollPicker]}>
                      <NumbersCarousel
                        data={Array.from(
                          { length: 50 },
                          (_, i) => new Date().getFullYear() - i
                        )} // Year range
                        setSelectedDay={setSelectedYear}
                        selectedDay={selectedYear}
                      />
                    </SafeAreaView>
                  </View>

                  <View style={[styles.doneButton]}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleDateConfirm}
                    >
                      <Text style={styles.doneText}>DONE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {showTimePicker && (
        <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={closeTimeModal}>
          <Pressable style={styles.modalContainer} onPress={closeTimeModal}>
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              <Animated.View
                style={[{ transform: [{ translateY: slideTimeModalAnim }] }]}
              >
                <View style={styles.pickerContainer}>
                  <View style={styles.pickerRow}>
                    <SafeAreaView style={[styles.scrollPicker]}>
                      <NumbersCarousel
                        data={Array.from({ length: 12 }, (_, i) => i + 1)} // Hours of the year (1-12)
                        setSelectedDay={setSelectedHour}
                        selectedDay={selectedHour}
                      />
                    </SafeAreaView>
                    <SafeAreaView style={[styles.scrollPicker]}>
                      <NumbersCarousel
                        data={Array.from({ length: 60 }, (_, i) => i)} // Hours of the year (0-59)
                        setSelectedDay={setSelectedMinute}
                        selectedDay={selectedMinute}
                      />
                    </SafeAreaView>
                    <SafeAreaView style={[styles.scrollPicker]}>
                      <NumbersCarousel
                        data={selectedAmPm === "AM" ? ["AM", "PM"] : ["PM", "AM"]} // AM/PM selector
                        setSelectedDay={setSelectedAmPm}
                        selectedDay={selectedAmPm}
                        ampmPicker={true} // Enable AM/PM picker
                      />
                    </SafeAreaView>
                  </View>

                  <View style={[styles.doneButton]}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleTimeConfirm}
                    >
                      <Text style={styles.doneText}>DONE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
};


export default DateAndTimePicker;

const styles = StyleSheet.create({
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
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  smallBox: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 10,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
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
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
    width: "80%",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
  },
  pickerContainer: {
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#666",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    // backgroundColor: "#4588DF", //blue
  },
  scrollPicker: {
    width: "30%",
    height: 200,
    borderRadius: 5,
    marginHorizontal: 5,
    paddingVertical: 10,
  },
  doneButton: {
    padding: 10,
    marginTop: 15,
    width: "100%",
    borderRadius: 20,
    backgroundColor: "#4588DF", //blue
  },
  doneText: {
    fontWeight: 500,
    textAlign: "center",
    color: "#FFF",
  },
});
