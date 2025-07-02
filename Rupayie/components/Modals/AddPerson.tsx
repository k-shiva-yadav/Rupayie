import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Text, View } from "../Themed";
import { useUserData } from "@/context/user";
import { useColorScheme } from "@/components/useColorScheme";
import { FontAwesome6 } from "@expo/vector-icons";
import { usePeople } from "@/context/people";
import { useMessages } from "@/context/messages";

const AddPerson = ({
  visible,
  handleCloseModal,
  slideModalAnim,
  setPerson,
}: {
  visible: boolean;
  handleCloseModal: () => void;
  slideModalAnim: any;
  setPerson: (value: any) => void;
}) => {
  const colorScheme = useColorScheme();
  const { fetchUserDetails, loadingUserDetails } = useUserData();
  const { addPerson, savingPerson } = usePeople();
  const { setError, setMessageText } = useMessages()

  const inputBg = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";
  const placeholderColor = colorScheme === "dark" ? "#c2c2c2" : "#4d4d4d";

  const [name, setName] = useState("");
  const [contact, setContact] = useState<any>();
  const [relation, setRelation] = useState("");

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Something is Missing");

  function validateField() {
    if (name == "") {
      setErrorMessage("Name can't be empty");
      setShowError(true);
      return false;
    }
    if (relation == "") {
      setErrorMessage("Relation can't be empty");
      setShowError(true);
      return false;
    }
    if (!contact) {
      setErrorMessage("Contact can't be empty");
      setShowError(true);
      return false;
    }
    if (!/^\d{10}$/.test(String(contact))) {
      setErrorMessage("Invalid Contact! Not a 10 digit Number");
      setShowError(true);
      return false;
    }

    return true;
  }

  async function handleAddNewPerson() {
    try {
      const flag = validateField();
      if (!flag) return;

      const values = {
        name,
        contact,
        relation,
      };

      // add person
      const addedPerson = await addPerson(values);
      setPerson(addedPerson);

      // and fetch
      await fetchUserDetails();
      // close
      closeTheModal();

      setMessageText("Successfully Added :)")
    } catch (error) {
      closeTheModal();

      setError("Failed to Add :(")
      // Alert.alert("Failed", "Failed to Add");
    }
  }

  function closeTheModal() {
    setName("");
    setContact("");
    setRelation("");

    handleCloseModal();
  }

  useEffect(() => {
    if (name !== "") setShowError(false);
    if (!contact) setShowError(false);
    if (relation !== "") setShowError(false);
  }, [name, contact, relation]);

  return (
    <ScrollView style={{ flex: 1, position: "absolute" }}>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={closeTheModal}>
        <Pressable
          style={styles.modalContainer}
          disabled={savingPerson}
          onPress={closeTheModal}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContent}
          >
            <Animated.View
              style={[{ transform: [{ translateY: slideModalAnim }] }]}
            >
              <View style={styles.animatedView}>
                <SafeAreaView
                  style={[styles.flex_row_btw, { marginBottom: 15 }]}
                >
                  <Text style={styles.title}>Add Person</Text>

                  {savingPerson ? (
                    <View style={styles.doneButton}>
                      <ActivityIndicator size="small" color={"#FFF"} />
                    </View>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={handleAddNewPerson}
                      style={styles.doneButton}
                      disabled={savingPerson || loadingUserDetails}
                    >
                      <FontAwesome6
                        name="check"
                        color={"#FFF"}
                        style={styles.doneText}
                      />
                    </TouchableOpacity>
                  )}
                </SafeAreaView>

                <TextInput
                  style={[
                    styles.inputField,
                    { backgroundColor: inputBg, color: textColor },
                  ]}
                  placeholder="Person Name"
                  keyboardType="default"
                  placeholderTextColor={placeholderColor}
                  value={name}
                  numberOfLines={1}
                  onChangeText={(text) => setName(text)}
                />
                <TextInput
                  style={[
                    styles.inputField,
                    { backgroundColor: inputBg, color: textColor },
                  ]}
                  placeholder={`Relation with ${!name ? "Person" : name}`}
                  keyboardType="default"
                  placeholderTextColor={placeholderColor}
                  value={relation}
                  numberOfLines={1}
                  onChangeText={(text) => setRelation(text)}
                />

                <TextInput
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: inputBg,
                      color: textColor,
                      marginBottom: 0,
                    },
                  ]}
                  placeholder="Contact"
                  keyboardType="numeric"
                  placeholderTextColor={placeholderColor}
                  value={contact}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, "");
                    setContact(numericValue);
                  }}
                />

                {showError && (
                  <Text
                    style={{
                      color: "red",
                      fontSize: 14,
                      textAlign: "center",
                      marginTop: 10,
                    }}
                  >
                    {errorMessage}
                  </Text>
                )}
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

export default AddPerson;

const styles = StyleSheet.create({
  modalContent: {
    width: "100%",
    // marginBottom: 100,
  },
  modalContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    paddingHorizontal: 15,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  animatedView: {
    padding: 20,
    borderRadius: 15,
    overflowY: "scroll",
    borderWidth: 0.5,
    borderColor: "#666",
  },
  inputField: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 12,
    fontWeight: 400,
  },
  flex_row_btw: {
    gap: 5,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  doneButton: {
    borderRadius: 30,
    backgroundColor: "#4FB92D",
    alignSelf: "flex-end",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: 40,
    marginTop: -5,
    // marginBottom: 15,
  },
  doneText: {
    fontSize: 20,
    fontWeight: 500,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
});
