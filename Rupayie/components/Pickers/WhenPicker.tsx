import {
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "../Themed";
import { SafeAreaView } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import { Animated } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

import moment from "moment";
import intervalName from "@/constants/intervalName";
import NumbersCarousel from "./NumbersCarousel";

interface When {
  everyDay: string;
  everyWeek: string;
  everyMonth: number;
  everyYear: {
    month: number;
    date: number;
  };
}

function paddingZero(number: number) {
  return number.toString().padStart(2, "0");
}

const WhenPicker = ({
  interval,
  setInterval,
  when,
  setWhen,
  constWhen,
}: {
  interval: string;
  setInterval: (interval: string) => void;
  when: When;
  setWhen: (when: any) => void;
  constWhen: When;
}) => {
  const colorScheme = useColorScheme();
  const inputBg = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
  const slideIntervalModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen
  const slideWhenModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen

  const [showIntervalPicker, setShowIntervalPicker] = useState(false);
  const [showWhenPicker, setShowWhenPicker] = useState(false);

  // Split the time into parts
  const [time, splittedPeriod] = constWhen.everyDay.split(" ");
  const [splittedHour, splittedMinute] = time.split(":");

  // Convert hour, minute and am pm to numbers
  const hour = parseInt(splittedHour, 10)
  const minute = parseInt(splittedMinute, 10)
  const amPm = splittedPeriod

  //  Month
  const [weekName, setWeekName] = useState<string>(constWhen.everyWeek);

  //  Month
  const [monthDate, setMonthDate] = useState<number>(constWhen.everyMonth);

  //  Year
  const [fullYear, setFullYear] = useState<{
    everyYear: { month: number; date: number };
  }>({
    everyYear: {
      month: constWhen.everyYear.month,
      date: constWhen.everyYear.date,
    },
  });

  const everyDayValue = when.everyDay ? when.everyDay : constWhen.everyDay;
  const everyWeekValue = when.everyWeek ? when.everyWeek : constWhen.everyWeek;
  const everyMonthValue = when.everyMonth
    ? paddingZero(when.everyMonth)
    : paddingZero(constWhen.everyMonth);
  const everyYearValue = `${when.everyYear
    ? paddingZero(when.everyYear.date)
    : paddingZero(constWhen.everyYear.date)
    } ${moment()
      .month(when.everyYear ? when.everyYear.month : constWhen.everyYear.month)
      .format("MMM")}`;

  const openIntervalModal = () => {
    setShowIntervalPicker(true);

    setTimeout(() => {
      Animated.timing(slideIntervalModalAnim, {
        toValue: 0, // Slide up
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 100);
  };

  const closeIntervalModal = () => {
    Animated.timing(slideIntervalModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowIntervalPicker(false);
    });
  };

  const openWhenModal = () => {
    setShowWhenPicker(true);

    setTimeout(() => {
      Animated.timing(slideWhenModalAnim, {
        toValue: 0, // Slide up
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 100);
  };

  const closeWhenModal = () => {
    Animated.timing(slideWhenModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowWhenPicker(false);
    });
  };

  useEffect(() => {
    let newWhen = {};

    if (interval === intervalName.everyDay) {
      newWhen = {
        everyDay: `${paddingZero(hour)}:${paddingZero(minute)} ${amPm}`,
      };
    } else if (interval === intervalName.everyWeek) {
      newWhen = {
        everyWeek: weekName,
      };
    } else if (interval === intervalName.everyMonth) {
      newWhen = {
        everyMonth: monthDate,
      };
    } else if (interval === intervalName.everyYear) {
      newWhen = {
        everyYear: {
          month: fullYear.everyYear?.month,
          date: fullYear.everyYear?.date,
        },
      };
    }

    setWhen(newWhen);
  }, [interval]);

  return (
    <View>
      <SafeAreaView style={styles.flex_row_btw}>
        <TouchableOpacity
          onPress={openIntervalModal}
          activeOpacity={0.7}
          style={[styles.inputField, { backgroundColor: inputBg, borderColor: "#4FB92D", borderWidth: 1 }]}
        >
          <Text numberOfLines={1}>{interval}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openWhenModal}
          activeOpacity={0.7}
          disabled={interval === intervalName.everyDay}
          style={[styles.inputField, { backgroundColor: inputBg, borderColor: "#4FB92D", borderWidth: 1 }]}
        >
          <Text numberOfLines={1}>
            {interval === intervalName.everyDay
              ? `${everyDayValue} (fixed)`
              : interval === intervalName.everyWeek
                ? everyWeekValue
                : interval === intervalName.everyMonth
                  ? everyMonthValue
                  : interval === intervalName.everyYear
                    ? everyYearValue
                    : "Select Time"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {showIntervalPicker && (
        <Modal visible={showIntervalPicker} transparent animationType="fade" onRequestClose={closeIntervalModal}>
          <Pressable style={styles.modalContainer} onPress={closeIntervalModal}>
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              <Animated.View
                style={[
                  { transform: [{ translateY: slideIntervalModalAnim }] },
                ]}
              >
                <View style={styles.pickerContainer}>
                  <IntervalSelector
                    interval={interval}
                    setInterval={setInterval}
                    closeIntervalModal={closeIntervalModal}
                  />
                </View>
              </Animated.View>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {showWhenPicker && (
        <Modal visible={showWhenPicker} transparent animationType="fade" onRequestClose={closeWhenModal}>
          <Pressable style={styles.modalContainer} onPress={closeWhenModal}>
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              <Animated.View
                style={[{ transform: [{ translateY: slideWhenModalAnim }] }]}
              >
                <View style={styles.pickerContainer}>
                  <WhenSelector
                    interval={interval}
                    setWhen={setWhen}
                    closeWhenModal={closeWhenModal}
                    hour={hour}
                    // setHour={setHour}
                    minute={minute}
                    // setMinute={setMinute}
                    amPm={amPm}
                    // setAmPm={setAmPm}
                    monthDate={monthDate}
                    setMonthDate={setMonthDate}
                    weekName={weekName}
                    setWeekName={setWeekName}
                    fullYear={fullYear}
                    setFullYear={setFullYear}
                  />
                </View>
              </Animated.View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const IntervalSelector = ({
  interval,
  setInterval,
  closeIntervalModal,
}: {
  interval: string;
  setInterval: (interval: string) => void;
  closeIntervalModal: () => void;
}) => {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";
  const placeholderColor = colorScheme === "light" ? "#c2c2c2" : "#292929";

  function handleConfirm(interval: string) {
    setInterval(interval);

    setTimeout(() => {
      closeIntervalModal();
    }, 500);
  }

  return (
    <>
      <SafeAreaView style={[styles.flex_row_btw, { marginBottom: 10 }]}>
        <Text style={styles.title}>Select Interval</Text>

        <TouchableOpacity onPress={closeIntervalModal}>
          <FontAwesome6 name="xmark" size={20} color={textColor} />
        </TouchableOpacity>
      </SafeAreaView>

      <SafeAreaView style={styles.flex_row_wrap}>
        {[
          intervalName.everyDay,
          intervalName.everyWeek,
          intervalName.everyMonth,
          intervalName.everyYear,
        ].map((option) => (
          <TouchableOpacity
            key={option}
            activeOpacity={0.7}
            onPress={() => handleConfirm(option)}
            style={[
              styles.intervalButton,
              {
                backgroundColor: placeholderColor,
                borderWidth: interval == option ? 2 : 0,
                borderColor: interval == option ? "#4588DF" : "transparent",
              },
            ]}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: interval == option ? 600 : 400,
              }}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </SafeAreaView>
    </>
  );
};

const WhenSelector = ({
  setWhen,
  interval,
  closeWhenModal,
  hour,
  // setHour,
  minute,
  // setMinute,
  amPm,
  // setAmPm,
  weekName,
  setWeekName,
  monthDate,
  setMonthDate,
  fullYear,
  setFullYear,
}: {
  interval: string;
  setWhen: any;
  closeWhenModal: () => void;
  hour: number;
  // setHour: (hour: number) => void;
  minute: number;
  // setMinute: (minute: number) => void;
  amPm: string;
  // setAmPm: (amPm: string) => void;
  weekName: string;
  setWeekName: (weekName: string) => void;
  monthDate: number;
  setMonthDate: (monthName: number) => void;
  fullYear: any;
  setFullYear: (fullYear: any) => void;
}) => {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";

  // Time for hour, min and am pm
  function setTime() {
    setWhen({
      everyDay: `${paddingZero(hour)}:${paddingZero(minute)} ${amPm}`,
    });

    closeWhenModal();
  }

  // Week
  function setWeek() {
    setWhen({
      everyWeek: weekName,
    });

    closeWhenModal();
  }

  // Month
  function setMonth() {
    setWhen({
      everyMonth: monthDate,
    });

    closeWhenModal();
  }

  // Month and Date for Year
  function setYearMonth(yearMonth: number) {
    setFullYear((prev: any) => ({
      everyYear: {
        ...prev.everyYear, // Preserve existing `date`
        month: yearMonth, // Update `month`
      },
    }));
  }
  function setYearDate(yearDate: number) {
    setFullYear((prev: any) => ({
      everyYear: {
        ...prev.everyYear, // Preserve existing `month`
        date: yearDate, // Update `date`
      },
    }));
  }
  function setYear() {
    setWhen({
      everyYear: {
        month: fullYear.everyYear.month,
        date: fullYear.everyYear.date,
      },
    });

    closeWhenModal();
  }

  return (
    <>
      <SafeAreaView style={[styles.flex_row_btw, { marginBottom: 10 }]}>
        <Text style={styles.title}>Select Interval</Text>

        <TouchableOpacity onPress={closeWhenModal}>
          <FontAwesome6 name="xmark" size={20} color={textColor} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* {interval === intervalName.everyDay && (
        <View style={styles.pickerRow}>
          <SafeAreaView style={[styles.scrollPicker]}>
            <NumbersCarousel
              data={Array.from({ length: 12 }, (_, i) => i + 1)} // Hours of the year (1-12)
              setSelectedDay={setHour}
              selectedDay={hour}
            />
          </SafeAreaView>
          <SafeAreaView style={[styles.scrollPicker]}>
            <NumbersCarousel
              data={Array.from({ length: 60 }, (_, i) => i)} // Hours of the year (0-59)
              setSelectedDay={setMinute}
              selectedDay={minute}
            />
          </SafeAreaView>
          <SafeAreaView style={[styles.scrollPicker]}>
            <NumbersCarousel
              data={amPm === "AM" ? ["AM", "PM"] : ["PM", "AM"]} // AM/PM selector
              setSelectedDay={setAmPm}
              selectedDay={amPm}
              ampmPicker={true} // Enable AM/PM picker
            />
          </SafeAreaView>
        </View>
      )} */}

      {interval === intervalName.everyWeek && (
        <SafeAreaView style={[styles.scrollPicker, { width: "100%" }]}>
          <NumbersCarousel
            data={["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]}
            setSelectedDay={setWeekName}
            selectedDay={weekName}
            weekPicker={true}
          />

        </SafeAreaView>
      )}

      {interval === intervalName.everyMonth && (
        <SafeAreaView style={[styles.scrollPicker, { width: "100%" }]}>
          <NumbersCarousel
            data={Array.from({ length: 28 }, (_, i) => i + 1)} // Days of the month (1-28)
            setSelectedDay={setMonthDate}
            selectedDay={monthDate}
          />
        </SafeAreaView>
      )}

      {interval === intervalName.everyYear && (
        <View style={styles.pickerRow}>
          <SafeAreaView style={[styles.scrollPicker, { width: "40%" }]}>
            <NumbersCarousel
              data={Array.from({ length: 28 }, (_, i) => i + 1)} // Days of the month (1-28)
              setSelectedDay={setYearDate}
              selectedDay={fullYear.everyYear.date}
            />
          </SafeAreaView>
          <SafeAreaView style={[styles.scrollPicker, { width: "40%" }]}>
            <NumbersCarousel
              data={Array.from({ length: 12 }, (_, i) => i)} // Months of the year (0-11)
              setSelectedDay={setYearMonth}
              selectedDay={fullYear.everyYear.month}
              monthPicker={true}
            />
          </SafeAreaView>
        </View>
      )}

      <View style={[styles.doneButton]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={
            interval === intervalName.everyDay
              ? setTime
              : interval === intervalName.everyMonth
                ? setMonth
                : interval === intervalName.everyWeek
                  ? setWeek
                  : setYear
          }
        >
          <Text style={styles.doneText}>DONE</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default WhenPicker;

const styles = StyleSheet.create({
  inputField: {
    width: "49%",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 12,
    fontWeight: 400,
  },
  flex_row_btw: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  flex_row_wrap: {
    rowGap: 7,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
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
  pickerContainer: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: "#666",
    minWidth: "100%",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  intervalButton: {
    padding: 10,
    borderRadius: 30,
    width: "49%",
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
