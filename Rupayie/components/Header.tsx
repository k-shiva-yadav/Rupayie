import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Text, View } from "./Themed";
import { Link } from "expo-router";
import { FontAwesome, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useUserData } from "@/context/user";
import { useProfile } from "@/context/profilePhoto";
import { getStatusBarHeight } from "react-native-status-bar-height";

const girl1 = require("@/assets/profile/g1.png");
const girl2 = require("@/assets/profile/g2.png");
const girl3 = require("@/assets/profile/g3.png");
const girl4 = require("@/assets/profile/g4.png");
const girl5 = require("@/assets/profile/g5.png");
const girl6 = require("@/assets/profile/g6.png");
const girl7 = require("@/assets/profile/g7.png");
const boy1 = require("@/assets/profile/b1.png");
const boy2 = require("@/assets/profile/b2.png");
const boy3 = require("@/assets/profile/b3.png");
const boy4 = require("@/assets/profile/b4.png");
const boy6 = require("@/assets/profile/b6.png");
const boy7 = require("@/assets/profile/b7.png");

const Header = ({ showSlider }: { showSlider: any }) => {
  const { userDetails, loadingUserDetails } = useUserData();
  const { profilePhoto, setProfilePhoto } = useProfile();

  useEffect(() => {
    console.log("Header: userDetails?.userImage:", userDetails?.userImage ? "Has image" : "No image");
    if (userDetails?.userImage) {
      // Check if it's a base64 string (custom uploaded image)
      if (typeof userDetails.userImage === 'string' && userDetails.userImage.startsWith('data:')) {
        console.log("Header: Setting base64 image");
        setProfilePhoto(userDetails.userImage);
      } else {
        // Check if it's a local asset
        const matchedImage = [girl1, girl2, girl3, girl4, girl5, girl6, girl7, boy1, boy2, boy3, boy4, boy6, boy7]
          .find((img) => img == userDetails?.userImage);
        console.log("Header: Setting local asset image");
        setProfilePhoto(matchedImage);
      }
    } else {
      console.log("Header: Setting no image");
      setProfilePhoto(null);
    }
  }, [userDetails, loadingUserDetails]);

  const statusBarHeight = Platform.OS === "ios" ? getStatusBarHeight() : StatusBar.currentHeight || 36;

  return (
    <View style={[styles.container, { marginTop: statusBarHeight }]}>
      <TouchableOpacity activeOpacity={0.5} onPress={() => showSlider()}>
        <FontAwesome
          name="bars"
          size={22}
          style={{
            color: "#fff",
            padding: 10
          }}
        />
      </TouchableOpacity>

      <SafeAreaView style={styles.flex_row}>
        <Link href="/search" asChild>
          <FontAwesome6
            name="magnifying-glass-dollar"
            size={22}
            style={{
              color: "#fff",
              padding: 10
            }}
          />
        </Link>
        <Link href="/notification" asChild>
          <FontAwesome
            name="bell"
            size={22}
            style={{
              color: "#fff",
              padding: 10
            }}
          />
        </Link>
        <Link href="/profile" asChild>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.imageContainer,
              {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <>
              {!loadingUserDetails && profilePhoto ? (
                <Image
                  source={
                    typeof profilePhoto === 'string' 
                      ? { uri: profilePhoto }
                      : profilePhoto
                  }
                  style={[
                    styles.imageContainer,
                    {
                      borderColor: "#fff",
                      marginHorizontal: 10
                    },
                  ]}
                  resizeMode="cover"
                />
              ) : (
                (loadingUserDetails || !profilePhoto) && (
                  <SafeAreaView
                    style={[
                      styles.imageContainer,
                      {
                        borderColor: "#fff",
                        marginHorizontal: 10
                      },
                    ]}
                  >
                    <Ionicons
                      name="person"
                      size={18}
                      style={{ color: "#fff" }}
                    />
                  </SafeAreaView>
                )
              )}
            </>
          </TouchableOpacity>
        </Link>
      </SafeAreaView>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 5,
    marginBottom: 5,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  flex_row: {
    gap: 0,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: 30,
    height: 30,
    borderWidth: 2,
    borderRadius: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
