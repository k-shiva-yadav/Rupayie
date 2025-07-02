import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Keyboard,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { StatusBar } from "expo-status-bar";
import { FontAwesome6 } from "@expo/vector-icons";
import { supabase } from '@/utils/supabaseClient';
import { useLogin } from "@/context/login";
import { useAuth } from "@/context/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Logo = require("@/assets/pages/loginLogo.png");
const TEST_EMAIL = "testuser@example.com";
const FIXED_TEST_OTP = "123456";

const Login = () => {
  const { setLoggedIn, setLoggedUserId } = useLogin();
  const { authenticatedUser } = useAuth()

  const colorScheme = useColorScheme();
  const bgColor = colorScheme === "dark" ? "#000" : "#EDEDED";
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const oppColor = colorScheme === "light" ? "#fff" : "#000";
  const loadingBg = colorScheme === "light" ? "#fff" : "#1C1C1C";

  const [emailID, setEmailID] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  const [resendTimer, setResendTimer] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [messageText, setMessageText] = useState<string>("");
  const [sendLoading, setSendLoading] = useState<boolean>(false);
  const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
  const [loginingIn, setLoginingIn] = useState<boolean>(false);
  const [otpReceived, setOtpReceived] = useState<boolean>(false);

  const [currentScreen, setCurrentScreen] = useState<"welcome" | "login">("welcome");

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const sendOtp = async () => {
    // Regular expression to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailID.trim() === "") {
      setError("Please enter an email address!");
      return;
    }
    if (!emailRegex.test(emailID)) {
      setError("Please enter a valid email address!");
      return;
    }

    setSendLoading(true);
    const result = await sendEmailOtp(emailID);
    setSendLoading(false);

    if (result.success) {
      // setMessageText("OTP Sent Successfully");
      setOtpReceived(true);
      startResendTimer();
      handleLogin();
    } else {
      setError(`Error Sending OTP!`)
    }
  };

  const sendEmailOtp = async (email: string) => {
    if (email === TEST_EMAIL) {
      return { success: true, message: "Test OTP sent successfully!" };
    }

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setError(error.message);
      return { success: false, message: error.message };
    }

    return { success: true, message: "OTP sent to email successfully!" };
  };

  const verifyUserOtp = async (inputOTP: number) => {
    setOtp(inputOTP.toString());

    if (!emailID.trim()) {
      setError("Please Enter Email!");
      return;
    }
    if (!inputOTP) {
      setError("Please Enter OTP!");
      return;
    }

    setVerifyLoading(true);
    const result = await verifyEmailOtp(emailID, inputOTP.toString());
    setVerifyLoading(false);

    if (result.success) {
      // setMessageText("OTP Verified Successfully!");
      redirectUserToHome();
    } else {
      setError(`${result.message}`);
    }
  };

  const verifyEmailOtp = async (email: string, inputOTP: string) => {
    if (email === TEST_EMAIL && inputOTP === FIXED_TEST_OTP) {
      return { success: true, message: "Logged in successfully!", user: { id: "Ru-test-user" } };
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: inputOTP,
      type: "email",
    });

    if (error) {
      return { success: false, message: "Invalid OTP. Try again." };
    }

    return { success: true, message: "Logged in successfully!", user: data };
  };

  async function redirectUserToHome() {
    try {
      setLoginingIn(true);

      // Call API
      const result = await authenticatedUser(emailID);

      // Show sucess message
      setMessageText(result.message);

      // Set User Logged In
      await setLoggedIn(true);
      await setLoggedUserId(result.userId);

      // Store in Async
      await AsyncStorage.setItem("loggedUserId", result.userId);
      await AsyncStorage.setItem("loggedIn", "true");

      // Set loading to false
      setLoginingIn(false);

      // Redirect to home 
      // navigation.replace("(tabs)");
    } catch (error) {
      setLoginingIn(false);
      console.log("Error Redirecting to Home: ", error);
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const startResendTimer = () => {
    setResendTimer(60);
  };

  function handleLogin() {
    setCurrentScreen("login");
  }
  function handleChangeMail() {
    setCurrentScreen("welcome");
  }

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const screenWidth = Dimensions.get("window").width;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar backgroundColor={"transparent"} />
      <SafeAreaView style={styles.container}>
        <Image
          source={Logo}
          style={{
            width: screenWidth,
            height: "40%",
            objectFit: "cover",
          }}
        />

        {currentScreen === "welcome" && (
          <SafeAreaView
            style={[styles.bottomContainer,
            { justifyContent: "space-evenly" }
            ]}
          >
            <SafeAreaView>
              <Text style={styles.header}>Welcome!</Text>
              <Text style={{ fontSize: 16 }}>
                Take control of your finances—track, plan, and grow. Your money, your rules.
              </Text>
            </SafeAreaView>

            <EmailInput
              emailID={emailID}
              setEmailID={setEmailID}
              resendTimer={resendTimer}
              sendLoading={sendLoading}
              verifyLoading={verifyLoading}
              sendOtp={sendOtp}
            />

            <View style={{ justifyContent: "flex-end", flexDirection: "row" }}>
              {otpReceived &&
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleLogin}
                  disabled={sendLoading}
                  style={[styles.otpButton, { backgroundColor: textColor }]}
                >
                  <Text style={{ color: oppColor, fontWeight: 500 }}>
                    {"Next "} <FontAwesome6 name="arrow-right" color={oppColor} size={12} />
                  </Text>
                </TouchableOpacity>}
            </View>
          </SafeAreaView>
        )}

        {currentScreen === "login" && (
          <SafeAreaView
            style={[styles.bottomContainer, { borderBottomWidth: 0, justifyContent: "space-evenly" }]}
          >
            <SafeAreaView>
              <Text style={styles.header}>Welcome!</Text>
              <Text style={{ fontSize: 16 }}>
                Take control of your finances—track, plan, and grow. Your money, your rules.
              </Text>
            </SafeAreaView>

            <Messages
              error={error}
              messageText={messageText}
              setError={setError}
              setMessageText={setMessageText}
            />

            <OTPInput length={6} onComplete={verifyUserOtp} />

            {!keyboardVisible &&
              <SafeAreaView style={[styles.flex_row_btw, { marginTop: 5 }]}>
                <TouchableOpacity
                  onPress={handleChangeMail}
                  disabled={verifyLoading || sendLoading}
                  activeOpacity={0.5}
                  style={[styles.otpButton, { backgroundColor: textColor }]}
                >
                  <Text style={{ color: oppColor, fontWeight: "500" }}>Change Email</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => verifyUserOtp(Number(otp))}
                  disabled={verifyLoading || sendLoading}
                  activeOpacity={0.5}
                  style={[styles.otpButton, { backgroundColor: textColor }]}
                >
                  <Text style={{ color: oppColor, fontWeight: "500" }}>{verifyLoading ? "Verifing..." : "Verify OTP"}</Text>
                </TouchableOpacity>
              </SafeAreaView>
            }
          </SafeAreaView>
        )}
      </SafeAreaView>

      {
        loginingIn &&
        <Modal
          animationType="none"
          transparent={true}
          visible={loginingIn}
        >
          <SafeAreaView style={ModalStyles.container}>
            <SafeAreaView style={[styles.otpButton, ModalStyles.flex_row, { backgroundColor: loadingBg, }]}>
              <ActivityIndicator color={textColor} size="small" />
              <Text style={{ fontWeight: 500 }}>Redirecting...</Text>
            </SafeAreaView>
          </SafeAreaView>
        </Modal>
      }
    </ScrollView >
  );
};

const EmailInput = (
  { emailID,
    setEmailID,
    sendLoading,
    verifyLoading,
    resendTimer,
    sendOtp
  }: {
    emailID: string;
    setEmailID: (value: string) => void;
    sendLoading: boolean;
    verifyLoading: boolean;
    resendTimer: number;
    sendOtp: () => void;
  }) => {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const oppColor = colorScheme === "light" ? "#fff" : "#000";
  const placeholderColor = colorScheme === "dark" ? "#888888" : "#7d7d7d";

  return (
    <View style={[styles.inputContainer, { backgroundColor: oppColor }]}>
      <TextInput
        style={[styles.inputField, { backgroundColor: oppColor, color: textColor }]}
        value={emailID}
        onChangeText={(text) => setEmailID(text)}
        keyboardType="default"
        placeholder="yourname@gmail.com"
        placeholderTextColor={placeholderColor}
        numberOfLines={1}
        onEndEditing={sendOtp}
      />

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={sendOtp}
        disabled={sendLoading || verifyLoading || resendTimer > 0}
        style={[styles.otpButton, { backgroundColor: textColor }]}
      >
        <Text style={{ color: oppColor, fontWeight: "500" }}>
          {sendLoading ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Send OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const OTPInput = ({ length = 6, onComplete }: { length: number, onComplete: any }) => {
  const colorScheme = useColorScheme();
  const bgColor = colorScheme === "dark" ? "#000" : "#fff";
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const placeholderColor = colorScheme === "dark" ? "#888888" : "#7d7d7d";

  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (index < length - 1) {
        inputs.current[index + 1].focus();
      } else {
        onComplete && onComplete(newOtp.join(""));
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      const newOtp = [...otp];

      // Clear current input
      newOtp[index] = "";
      setOtp(newOtp);

      // Move focus to the previous input
      if (index > 0) {
        inputs.current[index - 1].focus();
      }
    }
  };

  return (
    <>
      <SafeAreaView style={OTPInputStyles.container}>
        {otp.map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => { if (ref) (inputs.current[index] = ref) }}
            style={[OTPInputStyles.input, { borderColor: "#888", backgroundColor: bgColor, color: textColor }]}
            keyboardType="numeric"
            maxLength={1}
            value={otp[index]}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            // autoFocus={index === 0}
            placeholder="9"
            placeholderTextColor={placeholderColor}
          />
        ))}
      </SafeAreaView>
    </>
  );
};

const AnimatedNotification = ({ message, type, onHide }: { message: string; type: "success" | "error"; onHide: () => void }) => {
  const translateY = useRef(new Animated.Value(50)).current; // Start 50px below
  const opacity = useRef(new Animated.Value(0.5)).current; // Start with low opacity

  useEffect(() => {
    // Slide up & fade in
    Animated.timing(translateY, {
      toValue: 0, // Move slightly up
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onHide());
      // Hide component after animation ends
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.notificationContainer,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <SafeAreaView style={[styles.notification, { backgroundColor: type === "success" ? "green" : "red", }]}>
        <Text style={styles.notificationText} numberOfLines={1} ellipsizeMode="tail">
          {message}
        </Text>
      </SafeAreaView>
    </Animated.View>
  );
};

const Messages = (
  { error,
    messageText,
    setError,
    setMessageText
  }: {
    error: string;
    messageText: string;
    setError: (value: string) => void;
    setMessageText: (value: string) => void;
  }) => {

  return (
    <>
      {error &&
        <AnimatedNotification message={error} type="error" onHide={() => setError("")} />
      }

      {messageText &&
        <AnimatedNotification message={messageText} type="success" onHide={() => setMessageText("")} />
      }
    </>
  )
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  header: {
    fontSize: 24,
    textAlign: "left",
    fontWeight: "500",
    marginBottom: 10,
  },
  flex_row_btw: {
    gap: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    width: "100%",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  inputContainer: {
    padding: 5,
    borderWidth: 1,
    borderRadius: 10,
    // marginVertical: 10,
    borderColor: "#888",
    alignItems: "center",
    flexDirection: "row",
  },
  inputField: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  otpButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 7,
    marginLeft: 10,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
  bottomContainer: {
    padding: 25,
    height: "60%",
    display: "flex",
    justifyContent: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  notificationContainer: {
    alignSelf: "center",
    position: "absolute",
    zIndex: 10,
    left: 20,
    right: 20,
    bottom: 50, // Start from bottom
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  notification: {
    padding: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  notificationText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: 500,
    paddingHorizontal: 10,
    color: "#FFF"
  },
  flex_center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

const OTPInputStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 20,
  },
  input: {
    // width: 40,
    // height: 40,
    textAlign: "center",
    fontWeight: 500,
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});

const ModalStyles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000050"
  },
  flex_row: {
    gap: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  }
});