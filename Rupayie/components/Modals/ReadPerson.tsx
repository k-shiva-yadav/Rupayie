import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { Text, View } from "../Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { FontAwesome6 } from "@expo/vector-icons";
import { usePeople } from "@/context/people";
import { useUserData } from "@/context/user";
import { useMessages } from "@/context/messages";

interface Person {
  _id: string;
  name: string;
  contact: string | Number;
  relation: string;
}

const ReadPerson = ({
  visible,
  handleCloseModal,
  slideModalAnim,
  clickedPerson,
}: {
  visible: boolean;
  handleCloseModal: () => void;
  slideModalAnim: any;
  clickedPerson: Person;
}) => {
  const colorScheme = useColorScheme();
  const { fetchUserDetails, loadingUserDetails } = useUserData();
  const { saveEditedPerson, deletePerson, savingPerson, deletingPerson } =
    usePeople();
  const { setError, setMessageText } = useMessages()


  const inputBg = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";
  const placeholderColor = colorScheme === "dark" ? "#c2c2c2" : "#4d4d4d";

  const [name, setName] = useState(clickedPerson.name);
  const [contact, setContact] = useState(clickedPerson.contact);
  const [relation, setRelation] = useState(clickedPerson.relation);

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Something is Missing");

  function nothingChanged() {
    if (
      name === clickedPerson.name &&
      contact == clickedPerson.contact &&
      relation == clickedPerson.relation
    ) {
      return true;
    }

    return false;
  }

  function validateField() {
    if (name === "") {
      setErrorMessage("Name can't be empty");
      setShowError(true);
      return false;
    }
    if (relation === "") {
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

  async function handleSavingPerson() {
    try {
      const flag = validateField();
      if (!flag) return;

      if (nothingChanged()) {
        // close directly
        handleCloseModal();
      } else {
        const values = {
          name,
          contact,
          relation,
        };

        // save
        await saveEditedPerson(clickedPerson._id, values);
        // fetch
        await fetchUserDetails();
        // close
        handleCloseModal();

        setMessageText("Successfully Saved :)")
      }
    } catch (error) {
      handleCloseModal();

      setError("Failed to Save :(")
      // Alert.alert("Failed", "Failed to Save");
    }
  }

  async function handleDeletePerson() {
    try {
      await deletePerson(clickedPerson._id);
      // fetch
      await fetchUserDetails();
      handleCloseModal();

      setMessageText("Successfully Deleted :)")
    } catch (error) {
      handleCloseModal();

      setError("Failed to Delete :(")
      // Alert.alert("Failed", "Failed to Delete");
    }
  }

  useEffect(() => {
    if (name !== "") setShowError(false);
    if (!contact) setShowError(false);
    if (relation !== "") setShowError(false);
  }, [name, contact, relation]);

  return (
    <ScrollView style={{ flex: 1, position: "absolute" }}>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCloseModal}>
        <Pressable
          style={styles.modalContainer}
          onPress={handleCloseModal}
          disabled={savingPerson || deletingPerson}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContent}
          >
            <Animated.View
              style={[{ transform: [{ translateY: slideModalAnim }] }]}
            >
              <View style={styles.animatedView}>
                {/* Heading */}
                <SafeAreaView
                  style={[styles.flex_row_start_btw, { marginBottom: 15 }]}
                >
                  {deletingPerson ? (
                    <View
                      style={[styles.doneButton, { backgroundColor: "red" }]}
                    >
                      <ActivityIndicator size="small" color={"#FFF"} />
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={handleDeletePerson}
                      activeOpacity={0.5}
                      disabled={savingPerson || deletingPerson || loadingUserDetails}
                      style={[styles.doneButton, { backgroundColor: "red" }]}
                    >
                      <FontAwesome6
                        name="trash"
                        color={"#FFF"}
                        style={styles.doneText}
                      />
                    </TouchableOpacity>
                  )}

                  <Text numberOfLines={1} style={[styles.title, { maxWidth: "50%" }]}>
                    {clickedPerson.name}
                  </Text>

                  {savingPerson ? (
                    <View
                      style={[
                        styles.doneButton,
                        { backgroundColor: "#4FB92D" },
                      ]}
                    >
                      <ActivityIndicator size="small" color={"#FFF"} />
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={handleSavingPerson}
                      activeOpacity={0.5}
                      disabled={savingPerson || deletingPerson || loadingUserDetails}
                      style={[
                        styles.doneButton,
                        { backgroundColor: "#4FB92D" },
                      ]}
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
                  value={contact.toString()}
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

export default ReadPerson;

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
  flex_row_start_btw: {
    gap: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  doneButton: {
    borderRadius: 30,
    // backgroundColor: "#4FB92D",
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
