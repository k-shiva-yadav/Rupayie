import { ScrollView, StyleSheet, RefreshControl, Platform, SafeAreaView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useColorScheme } from "@/components/useColorScheme";

import { Text, View } from "@/components/Themed";
// import Header from "@/components/Header";

import { useAnalytics } from "@/context/analytics";
import { StatusBar } from "react-native";
import { useUserData } from "@/context/user";
import Slider from "../slider";
import Filter from "@/components/Filter";
import AllTypesDonut from "@/components/Four/AllTypesDonut";
import TypesIndicator from "@/components/Four/TypesIndicators";
import TypesSquares from "@/components/Four/TypesSquares";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { FontAwesome } from "@expo/vector-icons";

// const GradientImage = require("@/assets/pages/gradientBg.png");

export default function TabThreeScreen() {
  const colorScheme = useColorScheme();
  const { fetchAnalytics } = useAnalytics();
  const { fetchUserDetails } = useUserData();

  const [refresh, setRefresh] = useState(false);
  const [sliderVisible, setSliderVisible] = useState(false);

  async function refreshPage() {
    setRefresh(true);

    try {
      console.log("Fetching on Reload");

      await fetchUserDetails();
      await fetchAnalytics();
    } catch (error) {
      console.error("Error Refreshing: ", error);
    } finally {
      setRefresh(false);
    }
  }

  function showSlider() {
    setSliderVisible(true);
  }
  function hideSlider() {
    setSliderVisible(false);
  }

  const statusBarHeight = Platform.OS === "ios" ? getStatusBarHeight() : StatusBar.currentHeight || 36;
  const textColor = colorScheme === "dark" ? "#fff" : "#000";

  return (
    <View
      style={[
        styles.conatiner,
        { backgroundColor: colorScheme === "dark" ? "#1C1C1C" : "#EDEDED" },
      ]}
    >
      <StatusBar backgroundColor={"transparent"} />

      <View style={styles.bodyContainer}>
        {/* <Header showSlider={showSlider} /> */}

        <SafeAreaView style={[styles.flex_row, { marginTop: statusBarHeight + 10, marginBottom: 15 }]}>
          <TouchableOpacity activeOpacity={0.5} onPress={() => showSlider()}>
            <FontAwesome
              name="bars"
              size={22}
              style={{
                color: textColor,
                marginHorizontal: 15,
              }}
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>Analytics</Text>
        </SafeAreaView>

        <Slider isVisible={sliderVisible} hideSlider={hideSlider} />

        <Filter tabTwoFlag={false} />

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              onRefresh={() => refreshPage()}
              colors={["#000"]}
            />
          }
          style={styles.paddings}
        >
          <AllTypesDonut />

          <TypesIndicator />

          <TypesSquares />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conatiner: {
    flex: 1,
  },
  bodyContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "transparent",
  },
  paddings: {
    padding: 15,
    paddingTop: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerText: {
    fontWeight: 600,
    fontSize: 22,
    marginTop: -5,
  },
  flex_row: {
    display: "flex",
    flexDirection: "row",
    gap: 15
  }
});
