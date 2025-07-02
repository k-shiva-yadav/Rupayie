import {
  Animated,
  Easing,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { useColorScheme } from "@/components/useColorScheme";

import { Text, View } from "@/components/Themed";
import Header from "@/components/Header";
import SelectCategory from "@/components/Two/SelectCategory";
import { ScrollView } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useAnalytics } from "@/context/analytics";
import Filter from "@/components/Filter";
import Transactions from "@/components/Two/Transactions";
import AddTransactionButton from "@/components/Two/AddButton";
import AddTransaction from "@/components/Modals/AddTransaction";
import { useUserData } from "@/context/user";
import Slider from "../slider";
import MessagePopUp from "@/components/MessagePopUp";
import { useMessages } from "@/context/messages";

const GradientImage = require("@/assets/pages/gradientBg.png");

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  const { fetchUserDetails } = useUserData();
  const { fetchAnalytics } = useAnalytics();
  const { error, setError, messageText, setMessageText } = useMessages()

  const [refresh, setRefresh] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sliderVisible, setSliderVisible] = useState(false);

  const slideModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen

  const handleCloseModal = () => {
    Animated.timing(slideModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowAddModal(false);
    });
  };

  const openModal = () => {
    setShowAddModal(true);
    Animated.timing(slideModalAnim, {
      toValue: 0, // Slide up to show the modal
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  async function refreshPage() {
    setRefresh(true);

    try {
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

  return (
    <View
      style={[
        styles.conatiner,
        { backgroundColor: colorScheme === "dark" ? "#1C1C1C" : "#EDEDED" },
      ]}
    >
      <MessagePopUp
        error={error}
        messageText={messageText}
        setError={setError}
        setMessageText={setMessageText}
      />

      <StatusBar backgroundColor={"transparent"} />

      <Image
        source={GradientImage}
        style={{
          position: "absolute",
          zIndex: 0,
          height: 180,
          objectFit: "cover",
        }}
      />

      <View style={styles.bodyContainer}>
        <Header showSlider={showSlider} />

        <Slider isVisible={sliderVisible} hideSlider={hideSlider} />

        <SelectCategory />

        <Filter tabTwoFlag={true} />

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
          <Transactions />
        </ScrollView>

        <AddTransactionButton handleClick={openModal} />

        <AddTransaction
          isVisible={showAddModal}
          slideModalAnim={slideModalAnim}
          handleCloseModal={handleCloseModal}
        />
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
});
