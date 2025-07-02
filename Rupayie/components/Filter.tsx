import React, { useState, useEffect, useRef } from "react";
import {
  Easing,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import { Text, View } from "./Themed";
import { Ionicons } from "@expo/vector-icons";
import { useTransactionFilter } from "@/context/filterTransByDate";
import { useUserData } from "@/context/user";
import { Calendar } from "react-native-calendars";
import { ScrollView } from "react-native";
import { Animated } from "react-native";

interface Option {
  title: string;
  from: Date;
  to: Date;
}

const getMonthRange = (monthsAgo: number) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  return { from: start, to: end };
};

const getYearRange = (yearsAgo: number) => {
  const now = new Date();
  const start = new Date(now.getFullYear() - yearsAgo, 0, 1); // January 1st
  const end = new Date(now.getFullYear() - yearsAgo, 11, 31); // December 31st
  return { from: start, to: end };
};

const Filter = ({ tabTwoFlag, exportExcelFlag }: { tabTwoFlag?: boolean, exportExcelFlag?: boolean }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const textColor = isDarkMode ? "#FFF" : "#000";
  const oppTextColor = !isDarkMode ? "#FFF" : "#000";
  const backgroundColor = isDarkMode ? "#1C1C1C" : "#EDEDED";
  const highlightColor = isDarkMode ? "#4588DF" : "#4FB92D";

  const { setTransactionsFilter, setDonutTransactionsFilter, setExportTransactionsFilter } =
    useTransactionFilter();
  const { loadingUserDetails } = useUserData();

  const buttonsName: Option[] = [
    { title: "All Time", from: new Date(1999, 11, 31), to: new Date(new Date().setDate(new Date().getDate() + 1)) }, // tomorrow
    { title: "This Month", ...getMonthRange(0) },
    { title: "Last Month", ...getMonthRange(1) },
    { title: "Last 3 Months", from: getMonthRange(2).from, to: getMonthRange(0).to },
    { title: "Last 6 Months", from: getMonthRange(5).from, to: getMonthRange(0).to },
    { title: "This Year", ...getYearRange(0) },
    { title: "Last Year", ...getYearRange(1) },
    { title: "Custom Range", from: new Date(), to: new Date() },
  ];

  const [selectedOption, setSelectedOption] = useState<Option>(buttonsName[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [range, setRange] = useState<{ from: string | null; to: string | null }>({
    from: null,
    to: null,
  });

  const flatListRef = useRef<FlatList>(null);
  const slideModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen

  useEffect(() => {
    if (selectedOption.title !== "Custom Range") { // doesn't open calendar modal on every change
      handleOptionSelect(selectedOption, buttonsName.findIndex(btn => btn.title === selectedOption.title));
    }
  }, [loadingUserDetails]);

  const handleCloseModal = () => {
    Animated.timing(slideModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const handleOpenModal = () => {
    setModalVisible(true);
    Animated.timing(slideModalAnim, {
      toValue: 0, // Slide up to show the modal
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleOptionSelect = (btn: Option, index: number) => {
    if (btn.title === "Custom Range") {
      handleOpenModal();
      return;
    }

    setSelectedOption(btn);
    if (tabTwoFlag) {
      setTransactionsFilter(btn);
    } else if (!exportExcelFlag) {
      setDonutTransactionsFilter(btn);
    } else {
      setExportTransactionsFilter(btn)
    }

    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0,
    });
  };

  const handleDayPress = (day: any) => {
    if (!range.from || (range.from && range.to)) {
      setRange({ from: day.dateString, to: null });
    } else {
      setRange((prev) => ({
        ...prev,
        to: day.dateString,
      }));
    }
  };

  const applyCustomRange = () => {
    if (!range.from || !range.to) return;

    const from = new Date(range.from);
    from.setHours(0, 0, 0, 0); // Set time to 12:00 AM

    const to = new Date(range.to);
    to.setHours(23, 59, 59, 999); // Set time to 11:59 PM

    const customRange = { title: "Custom Range", from, to };

    setSelectedOption(customRange);
    if (tabTwoFlag) {
      setTransactionsFilter(customRange);
    } else if (!exportExcelFlag) {
      setDonutTransactionsFilter(customRange);
    } else {
      setExportTransactionsFilter(customRange)
    }

    setModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingHorizontal: exportExcelFlag ? 0 : 20 }]}>
      <Ionicons name="calendar" size={24} color={textColor} style={{ marginRight: 10 }} />
      <FlatList
        ref={flatListRef}
        horizontal
        data={buttonsName}
        keyExtractor={(item) => item.title}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.optionButton,
              {
                borderBottomWidth: 2.5,
                borderBottomColor:
                  item.title === selectedOption.title ?
                    "#4FB92D" : "transparent",
              },
            ]}
            activeOpacity={0.5}
            onPress={() => handleOptionSelect(item, index)}
          >
            <Text
              style={{
                color:
                  item.title === selectedOption.title ?
                    "#4FB92D" : textColor,
                fontWeight:
                  item.title === selectedOption.title ?
                    500 : 400
              }}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={0}
        getItemLayout={(data, index) => ({
          length: 90,
          offset: 90 * index,
          index,
        })}
      />

      {/* Custom Date Range Picker Modal */}
      <ScrollView style={{ flex: 1, position: "absolute" }}>
        <Modal
          visible={modalVisible}
          transparent
          onRequestClose={handleCloseModal}
          animationType="fade"
        >
          <Pressable
            style={styles.modalContainer}
            onPress={handleCloseModal}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={{ width: "100%" }}
            >
              <Animated.View
                style={[{ transform: [{ translateY: slideModalAnim }] }]}
              >
                <View style={styles.animatedView}>
                  <Calendar
                    markingType="period"
                    key={isDarkMode ? "dark" : "light"}
                    markedDates={{
                      [range.from || ""]: { startingDay: true, color: oppTextColor },
                      [range.to || ""]: { endingDay: true, color: oppTextColor },
                    }}
                    onDayPress={handleDayPress}
                    theme={{
                      backgroundColor: backgroundColor,
                      calendarBackground: backgroundColor,
                      textSectionTitleColor: textColor,
                      selectedDayBackgroundColor: highlightColor,
                      selectedDayTextColor: textColor,
                      todayTextColor: "#4588DF",
                      dayTextColor: textColor,
                      textDisabledColor: isDarkMode ? "#555" : "#ccc",
                      arrowColor: highlightColor,
                      monthTextColor: textColor,
                      textDayFontWeight: "400",
                      textMonthFontWeight: "bold",
                      textDayHeaderFontWeight: "bold",
                      textDayFontSize: 16,
                      textMonthFontSize: 18,
                      textDayHeaderFontSize: 14,
                    }}
                    style={{ borderRadius: 5 }}
                  />

                  <View style={{ backgroundColor: "#4588DF", marginTop: 10, borderRadius: 5, }}>
                    <TouchableOpacity activeOpacity={0.8} onPress={applyCustomRange} style={styles.applyButton}>
                      <Text style={{ color: "white", fontWeight: 500, textAlign: "center", fontSize: 16 }}>
                        Apply
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </SafeAreaView >
  );
};

export default Filter;

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    // paddingHorizontal: 20,
  },
  optionButton: {
    paddingRight: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
  animatedView: {
    minWidth: "100%",
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "#777",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#00000070",
    paddingHorizontal: 20,
  },
  applyButton: {
    width: "100%",
    padding: 7,
    backgroundColor: "#4588DF",
    borderRadius: 5,
  },
});
