import { SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Text, View } from "../Themed";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/components/useColorScheme";
import moment from "moment";

const PeriodPicker = ({
  type,
  setPeriod,
}: {
  type: string;
  setPeriod: (value: any) => void;
}) => {
  const colorScheme = useColorScheme();
  const bgColor = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";

  const today = new Date();
  const year = today.getFullYear();
  const month = moment().format("MMMM");
  const [defaultDate, setDefaultDate] = useState<{
    monthAndYear?: { month: string; year: number };
    year?: number;
  } | null>(null);

  useEffect(() => {
    setDefaultDate(() =>
      type === "month"
        ? {
            monthAndYear: {
              month,
              year,
            },
          }
        : { year }
    );

    setPeriod(() =>
      type === "month"
        ? {
            monthAndYear: {
              month,
              year,
            },
          }
        : { year }
    );
  }, [type]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Budget for {type === "month" ? "Month" : "Year"}
      </Text>

      <SafeAreaView
        style={[
          styles.flex_row,
          styles.inputField,
          { backgroundColor: bgColor },
        ]}
        // activeOpacity={0.7}
      >
        <Ionicons name="calendar" color={"#4FB92D"} size={20} />
        <Text>
          {type === "month"
            ? defaultDate?.monthAndYear
              ? `${defaultDate?.monthAndYear?.month} ${defaultDate?.monthAndYear?.year}`
              : ``
            : defaultDate?.year
            ? `${defaultDate?.year}`
            : ``}
        </Text>
      </SafeAreaView>
    </View>
  );
};

export default PeriodPicker;

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
