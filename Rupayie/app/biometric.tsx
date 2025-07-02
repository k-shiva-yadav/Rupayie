import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet, Image } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { useColorScheme } from "@/components/useColorScheme";
import { StatusBar } from "expo-status-bar";

const Logo = require("@/assets/pages/RupayieLogo.png");

const FingerprintAuth = ({ onAuthSuccess }: { onAuthSuccess: () => void }) => {
  const colorScheme = useColorScheme();
  const bgColor = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";

  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  // Check if the device supports fingerprint authentication
  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setIsBiometricAvailable(compatible);
  };

  // Handle biometric authentication
  const handleBiometricAuth = async () => {
    const savedBiometrics = await LocalAuthentication.isEnrolledAsync();

    if (!savedBiometrics) {
      return Alert.alert("No Biometrics", "Please enroll in biometrics first.");
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate with Fingerprint",
      fallbackLabel: "Use Passcode",
    });

    if (result.success) {
      onAuthSuccess();
      //   Alert.alert("Success", "Authenticated Successfully!");
    } else {
      console.log("Authentication Failed");
      // Alert.alert("Failed", "Authentication Failed");
    }
  };

  useEffect(() => {
    handleBiometricAuth();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar backgroundColor={"transparent"} />

      {isBiometricAvailable ? (
        <>
          <Image
            source={Logo}
            style={{
              width: "60%",
              height: 50,
              objectFit: "contain",
              marginBottom: 20,
            }}
          />
          <Button
            title="Unlock with Fingerprint"
            onPress={handleBiometricAuth}
          />
        </>
      ) : (
        <Text>Biometric authentication is not available on this device.</Text>
      )}
    </View>
  );
};

export default FingerprintAuth;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 10,
  },
});
