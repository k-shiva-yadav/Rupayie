import {
  Image,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Text, View } from "@/components/Themed";
import ProfilePicker from "@/components/Pickers/ProfilePicker";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/components/useColorScheme";
import { useProfile } from "@/context/profilePhoto";
import { useUserData } from "@/context/user";
import { useNavigation } from "expo-router";
import { StackNavigationProp } from "@react-navigation/stack";
import { useLogin } from "@/context/login";
import { useAnalytics } from "@/context/analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMessages } from "@/context/messages";
import MessagePopUp from "@/components/MessagePopUp";
import axios from 'axios';


type RootStackParamList = {
  login: undefined;
};

const Server_API = "http://192.168.68.102:2002/api"; // Use your PC's IP, not localhost

const profile = () => {
  const {
    userDetails,
    updateUserDetails,
    fetchUserDetails,
    savingUserName,
    savingUserProfile,
  } = useUserData();
  const { setProfilePhoto } = useProfile();
  const { setLoggedIn, setLoggedUserId } = useLogin();
  const { setUserDetails, loadingUserDetails } = useUserData();
  const { setAnalytics } = useAnalytics();
  const { error, setError, messageText, setMessageText } = useMessages()
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);


  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const oppColor = colorScheme === "light" ? "#fff" : "#000";
  const placeholderColor = colorScheme === "dark" ? "#c2c2c2" : "#4d4d4d";
  const bgColor = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";

  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [showUserNameSaveBtn, setShowUserNameSaveBtn] = useState(false);
  const [userName, setUserName] = useState(userDetails?.name);
  const [userProfile, setUserProfile] = useState(userDetails?.userImage);

const pickImageFromFiles = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      const base64Image = `data:image/png;base64,${selectedAsset.base64}`;
      setSelectedImageBase64(base64Image);
      // Immediately save after picking
      await handleSaveProfile(base64Image);
    }
  } catch (error) {
    if (error instanceof Error) {
      setError("Error picking image: " + error.message);
    } else {
      setError("Error picking image");
    }
  }
};



  function handlePenClick() {
    setShowProfilePicker(!showProfilePicker);
  }

  async function handleSaveName() {
    try {
      await updateUserDetails({ ...userDetails, name: userName }, "name");
      await fetchUserDetails();
      setShowUserNameSaveBtn(false);

      setMessageText("Successfully Saved Name :)");
    } catch (error) {
      setError("Failed to Save Name :(");
    }
  }

  async function handleSaveProfile(newBase64Image = null) {
    try {
      let imageUrl = userDetails?.userImage;
      if (newBase64Image) {
        // Upload to backend
        const res = await axios.post(
          `${Server_API}/users/${userDetails.userId}/upload-profile-image`,
          { image: newBase64Image }
        );
        imageUrl = res.data.userImage;
      } else if (selectedImageBase64) {
        // Fallback for manual save
        const res = await axios.post(
          `${Server_API}/users/${userDetails.userId}/upload-profile-image`,
          { image: selectedImageBase64 }
        );
        imageUrl = res.data.userImage;
      }

      setProfilePhoto(typeof imageUrl === "string" ? imageUrl : null);
      setShowProfilePicker(false);

      await updateUserDetails(
        { ...userDetails, userImage: typeof imageUrl === "string" ? imageUrl : null },
        "profile"
      );
      await fetchUserDetails(); // This will update userProfile via useEffect

      setMessageText("Successfully Saved Avatar :)")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setError(error.response.data.error || JSON.stringify(error.response.data));
        } else if (error.request) {
          setError("No response from server. Check your network and backend.");
        } else {
          setError("Error: " + error.message);
        }
      } else if (error instanceof Error) {
        setError("Error: " + error.message);
      } else {
        setError("Unknown error occurred");
      }
    }
  }

  async function handleLogout() {
    setLoggedIn(false);
    setLoggedUserId("");

    // Clear User Data
    setUserDetails(null);
    setAnalytics({
      totalSpent: 0,
      totalEarned: 0,
      totalAmount: 0,
    });

    // clear async 
    await AsyncStorage.clear();

    navigation.goBack();
  }

  async function handleLogoutPress() {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to Logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, I'm Sure.",
          onPress: () => handleLogout(),
          style: "destructive",
        },
      ]
    );
  }

  useEffect(() => {
    setUserName(userDetails?.name);
    setUserProfile(userDetails?.userImage);
    console.log("Profile image updated:", userDetails?.userImage ? "Has image" : "No image");
  }, [userDetails, loadingUserDetails]);

  useEffect(() => {
    setShowUserNameSaveBtn(userName === userDetails?.name ? false : true);
  }, [userName, loadingUserDetails]);

  return (
    <View style={{ flex: 1 }}>
      <MessagePopUp
        error={error}
        messageText={messageText}
        setError={setError}
        setMessageText={setMessageText}
      />

      <ScrollView style={{ flex: 1 }}>
        <View style={[styles.container, { backgroundColor: bgColor }]}>
          {/* <SafeAreaView style={styles.flex_row_btw}>
            Edit Avatar
            <TouchableOpacity
              style={[
                styles.flex_row,
                styles.logoutButton,
                { backgroundColor: !showProfilePicker ? textColor : "#4FB92D", alignSelf: "flex-end" },
              ]}
              onPress={!showProfilePicker ? handlePenClick : handleSaveProfile}
              activeOpacity={0.7}
              disabled={savingUserProfile}
            >
              <Text style={{ color: showProfilePicker ? textColor : oppColor, fontWeight: 500 }} >
                {showProfilePicker ? "Save" : savingUserProfile ? "Saving..." : "Edit Avatar"}
              </Text>
              {!savingUserProfile ? (
                <FontAwesome6
                  size={16}
                  color={showProfilePicker ? textColor : oppColor}
                  name={!showProfilePicker ? "pen" : "check"}
                />) : (
                <ActivityIndicator size="small" color={showProfilePicker ? textColor : oppColor} />
              )}
            </TouchableOpacity>

            Logout
            <TouchableOpacity
              style={[
                styles.flex_row,
                styles.logoutButton,
                { backgroundColor: textColor, alignSelf: "flex-end" },
              ]}
              activeOpacity={0.7}
              onPress={handleLogoutPress}
            >
              <Text style={{ color: oppColor, fontWeight: 500 }} >Logout</Text>

              <FontAwesome6
                size={16}
                color={oppColor}
                name="arrow-right-from-bracket"
              />
            </TouchableOpacity>
          </SafeAreaView> */}
<SafeAreaView style={{ flexDirection: "row", justifyContent: "flex-end", padding: 10 }}>
  <TouchableOpacity
    style={[
      styles.flex_row,
      styles.logoutButton,
      { backgroundColor: textColor }
    ]}
    activeOpacity={0.7}
    onPress={handleLogoutPress}
  >
    <Text style={{ color: oppColor, fontWeight: "500" }}>Logout</Text>
    <FontAwesome6
      size={16}
      color={oppColor}
      name="arrow-right-from-bracket"
    />
  </TouchableOpacity>
</SafeAreaView>


          <SafeAreaView style={{ width: 120, height: 120, alignSelf: 'center', marginVertical: 20, backgroundColor: 'transparent' }}>
  <View style={{ width: 120, height: 120, position: 'relative', backgroundColor: 'transparent' }}>

              <TouchableOpacity
                style={{ width: '100%', height: '100%' }}
                activeOpacity={0.8}
                onPress={pickImageFromFiles}
              >
                {userProfile ? (
                  <Image
                    source={
                      typeof userProfile === 'string'
                        ? { uri: userProfile }
                        : userProfile
                    }
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.image,
                      styles.center,
                      { borderColor: textColor },
                    ]}
                  >
                    <Ionicons
                      name="person"
                      size={60}
                      style={{ color: textColor }}
                    />
                  </View>
                )}
                {/* Camera icon overlay */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 20,
                    right: 10,
                  
                    borderRadius: 18,
                    padding: 4,
                    elevation: 3,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  pointerEvents="box-none"
                >
                  <Ionicons name="camera" size={30} color="#4FB92D" />
                </View>
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <SafeAreaView style={[styles.flex_row, { alignSelf: "center" }]}>
            <View style={[styles.inputField, { backgroundColor: oppColor, maxWidth: "60%" , marginTop: 10}]}>
              <TextInput
                style={{ color: textColor, fontWeight: 600}}
                placeholder="Your Name"
                value={userName}
                numberOfLines={1}
                onChangeText={(text) => setUserName(text)}
                placeholderTextColor={placeholderColor}
              />
            </View>

            {showUserNameSaveBtn && userName?.trim("") !== "" && (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={handleSaveName}
                disabled={savingUserName}
                style={[
                  styles.doneButton,
                  { marginLeft: 5, alignSelf: "center" },
                ]}
              >
                {!savingUserName ? (
                  <FontAwesome6
                    name={"check"}
                    size={20}
                    color={"#FFF"}
                    style={styles.doneText}
                  />
                ) : (
                  <ActivityIndicator size="small" color={"#FFF"} />
                )}
              </TouchableOpacity>
            )}
          </SafeAreaView>

          <SafeAreaView style={{ marginTop: 10 }}>
            <View style={[styles.inputField, { backgroundColor: oppColor, alignSelf: "center", }]}>
              <Text style={{ color: textColor, fontWeight: 600, textAlign: "center" }}>{userDetails?.email}</Text>
            </View>
          </SafeAreaView>

          {showProfilePicker && (
            <SafeAreaView style={{ padding: 30 }}>
              {/* Show current custom image if it exists */}
              {/* {userProfile && typeof userProfile === 'string' && userProfile.startsWith('data:') && (
                <SafeAreaView style={{ marginBottom: 20, alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>Current Custom Image</Text>
                  <Image
                    source={{ uri: userProfile }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      borderWidth: 3,
                      borderColor: "#4588DF"
                    }}
                    resizeMode="cover"
                  />
                </SafeAreaView>
              )} */}
              
              {/* <ProfilePicker
                currentImage={userProfile}
                setCurrentImage={setUserProfile}
              /> */}
              <TouchableOpacity
                onPress={pickImageFromFiles}
                style={{
                  marginTop: 20,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  backgroundColor: "#4FB92D",
                  borderRadius: 10,
                  alignSelf: "center"
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>From Files</Text>
              </TouchableOpacity>

            </SafeAreaView>
          )}
        </View>
      </ScrollView >
    </View >
  );
};

export default profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "100%",
    padding: 15,
  },
  center: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  flex_row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  flex_row_btw: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pen: {
    position: "absolute",
    right: 0,
    top: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  inputField: {
    width: "auto",
    minWidth: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    borderWidth: 2,
    borderRadius: 100,
    backgroundColor: 'transparent',
  },
  doneButton: {
    height: 40,
    width: 40,
    borderRadius: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4FB92D",
    // marginBottom: 15,
  },
  doneText: {
    fontSize: 20,
    fontWeight: 500,
  },
  logoutButton: {
    gap: 10,
    alignItems: "center",
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#4FB92D",
    // backgroundColor: '#e3e3e3',
    backgroundColor: 'transparent',
    alignSelf: 'center',
    overflow: 'hidden',
  },
});
