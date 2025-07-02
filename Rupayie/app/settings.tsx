import { AppState, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useColorScheme } from "@/components/useColorScheme";
import ToggleSwitch from "@/components/ToggleSwitch";
import { useUserData } from "@/context/user";
import { useTrash } from "@/context/trash";
import { Text, View } from "@/components/Themed";
import * as LocalAuthentication from "expo-local-authentication";
import ExportExcel from "@/components/Settings/ExportExcel";
import Filter from "@/components/Filter";
import DeleteAccount from "@/components/Settings/DeleteAccount";

const Settings = () => {
  const colorScheme = useColorScheme();
  const bgColor = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
  const oppBgColor = colorScheme === "dark" ? "#000" : "#FFF";
  const { fetchUserDetails, autoCleanTrash, biometricFlag, handleBiometricToggle } = useUserData();
  const { autoCleanTrashAfterWeek } = useTrash();

  const [toggleDeleteOlderthan7days, setToggleDeleteOlderthan7days] = useState(autoCleanTrash);
  const biometricRef = useRef(biometricFlag);
  const [biometricOnStatus, setBiometricOnStatus] = useState(biometricFlag);

  async function handleSwitchAutoDeleteOlderThanWeek(flag: boolean) {
    setToggleDeleteOlderthan7days(flag);
    await autoCleanTrashAfterWeek(flag);
    await fetchUserDetails();
  }

  async function handleBiometricToggleSwitch(flag: boolean) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to change security settings",
      fallbackLabel: "Use Passcode",
    });

    if (result.success) {
      biometricRef.current = flag;
      setBiometricOnStatus(flag);
      await handleBiometricToggle(flag);
      await fetchUserDetails();
    } else {
      setBiometricOnStatus(biometricRef.current);
    }
  }

  useEffect(() => {
    biometricRef.current = biometricFlag;
    setBiometricOnStatus(biometricFlag);
  }, [biometricFlag]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active") {
        await fetchUserDetails();
        setBiometricOnStatus(biometricRef.current);
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bgColor }}>
      <SafeAreaView style={[styles.container, { backgroundColor: oppBgColor }]}>
        <Text style={styles.title}>Trash</Text>
        <View style={[styles.flex_row_btw, { flex: 1 }]}>
          <Text style={{ width: "85%" }}>
            Automatically delete the trash transactions that have been in Trash for more than 7 days
          </Text>
          <ToggleSwitch
            isOn={toggleDeleteOlderthan7days}
            setIsOn={handleSwitchAutoDeleteOlderThanWeek}
          />
        </View>
      </SafeAreaView>

      <SafeAreaView style={[styles.container, { backgroundColor: oppBgColor }]}>
        <Text style={styles.title}>Security</Text>
        <View style={[styles.flex_row_btw, { flex: 1 }]}>
          <Text style={{ width: "85%" }}>Secure Lock</Text>
          <ToggleSwitch
            isOn={biometricOnStatus}
            setIsOn={handleBiometricToggleSwitch}
          />
        </View>
      </SafeAreaView>

      <SafeAreaView style={[styles.container, { backgroundColor: oppBgColor }]}>
        <Text style={styles.title}>Export Your Transactions</Text>

        <Filter exportExcelFlag />
        <ExportExcel />
      </SafeAreaView>

      <SafeAreaView style={[styles.container, { backgroundColor: oppBgColor }]}>
        <Text style={styles.title}>Account Deletion</Text>

        <DeleteAccount />
      </SafeAreaView>
    </ScrollView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 15,
    color: "#4588DF",
  },
  flex_row_btw: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  container: {
    padding: 15,
    marginBottom: 15,
    paddingBottom: 20,
  },
});
