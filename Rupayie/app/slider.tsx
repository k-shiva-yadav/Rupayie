import {
  Animated as RNAnimated,
  Easing,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/components/useColorScheme";
import { Text } from "@/components/Themed";
import { useNavigation } from "@react-navigation/native";

import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from "react-native";

const Logo = require("@/assets/pages/RupayieLogo.png");

type RootStackParamList = {
  categories: undefined;
  recurrings: undefined;
  trash: undefined;
  people: undefined;
  settings: undefined;
};

const Slider = ({
  isVisible,
  hideSlider,
}: {
  isVisible: boolean;
  hideSlider: () => void;
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const colorScheme = useColorScheme();
  const bgColor = colorScheme === "light" ? "#FFF" : "#000";
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";

  const slideAnim = useRef(new RNAnimated.Value(300)).current; // Off-screen position

  useEffect(() => {
    if (isVisible) {
      RNAnimated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      RNAnimated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        hideSlider();
      });
    }
  }, [isVisible, slideAnim]);

  const closeModal = () => {
    RNAnimated.timing(slideAnim, {
      toValue: -300, // Move off-screen
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      hideSlider();
    });
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={closeModal}
    >
      <Pressable style={styles.modalOverlay} onPress={closeModal}>
        <RNAnimated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateX: slideAnim }],
              backgroundColor: bgColor,
            },
          ]}
        >
          <SafeAreaView style={styles.flex_row_start}>
            <Image
              source={Logo}
              style={{ width: "60%", height: 40, objectFit: "contain" }}
            />
          </SafeAreaView>

          <ScrollView>
            <TouchableOpacity
              onPress={() => {
                closeModal();
                navigation.navigate("categories");
              }}
              activeOpacity={0.5}
              style={styles.button}
            >
              <FontAwesome6 name="tag" color={textColor} size={18} />
              <Text style={styles.text}>Categories</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                closeModal();
                navigation.navigate("recurrings");
              }}
              activeOpacity={0.5}
              style={styles.button}
            >
              <FontAwesome6 name="repeat" color={textColor} size={18} />
              <Text style={styles.text}>Recurrings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                closeModal();
                navigation.navigate("people");
              }}
              activeOpacity={0.5}
              style={styles.button}
            >
              <Ionicons name="people" color={textColor} size={18} />
              <Text style={styles.text}>People</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                closeModal();
                navigation.navigate("trash");
              }}
              activeOpacity={0.5}
              style={styles.button}
            >
              <FontAwesome6 name="trash" color={textColor} size={18} />
              <Text style={styles.text}>Trash</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                closeModal();
                navigation.navigate("settings");
              }}
              activeOpacity={0.5}
              style={styles.button}
            >
              <FontAwesome6 name="gear" color={textColor} size={18} />
              <Text style={styles.text}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                closeModal();
                Linking.openURL(`https://play.google.com/store/apps/details?id=com.rupayie.app`);
              }}
              activeOpacity={0.5}
              style={[styles.button, { borderBottomWidth: 0.3 }]}
            >
              <FontAwesome6 name="gift" color={textColor} size={18} />
              <Text style={styles.text}>Review Us!</Text>
            </TouchableOpacity>
          </ScrollView>
        </RNAnimated.View>
      </Pressable>
    </Modal>
  );
};

export default Slider;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "flex-start",
    backgroundColor: "#00000050",
  },
  modalContent: {
    width: "65%",
    height: "100%",
    display: "flex",
    paddingVertical: 15,
    flexDirection: "column",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
    padding: 15,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    gap: 20,
    padding: 15,
    paddingHorizontal: 25,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#666666",
  },
  flex_row_start: {
    padding: 15,
    marginBottom: 15,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
});
