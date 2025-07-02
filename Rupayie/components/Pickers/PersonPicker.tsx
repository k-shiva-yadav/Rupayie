import {
  Animated,
  Easing,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/components/useColorScheme";
import AddPerson from "../Modals/AddPerson";
import { Text, View } from "../Themed";

interface Person {
  name: string;
  contact: Number;
  relation: string;
  _id: string;
}

const PersonPicker = ({
  person,
  setPerson,
  peopleList,
}: {
  person: Person;
  setPerson: any;
  peopleList: Person[];
}) => {
  const colorScheme = useColorScheme();
  const inputBg = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";

  const [showPersonPicker, setShowPersonPicker] = useState(false);
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);

  const slidePickerAnim = useRef(new Animated.Value(200)).current; // Start position off-screen
  const slideAddModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen

  const openPersonPickerModal = () => {
    setShowPersonPicker(true);

    setTimeout(() => {
      Animated.timing(slidePickerAnim, {
        toValue: 0, // Slide up
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 100);
  };

  const closePersonPickerModal = () => {
    Animated.timing(slidePickerAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowPersonPicker(false);
    });
  };

  const handleConfirm = (selectedPerson: Person) => {
    Animated.timing(slidePickerAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setPerson(selectedPerson);
      setShowPersonPicker(false);
    });
  };

  const handleOpenAddNewCPersonModal = () => {
    closePersonPickerModal();
    openAddNewPersonModal();
  };

  const openAddNewPersonModal = () => {
    setShowAddPersonModal(true);

    setTimeout(() => {
      Animated.timing(slideAddModalAnim, {
        toValue: 0, // Slide up
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 100);
  };

  const handleCloseAddModal = () => {
    Animated.timing(slideAddModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowAddPersonModal(false);
    });
  };

  return (
    <>
      {peopleList.length > 0 ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openPersonPickerModal}
          style={[
            styles.smallBox,
            {
              backgroundColor: inputBg,
            },
          ]}
        >
          <Ionicons name="person" color={textColor} size={14} />
          <Text numberOfLines={1}>{person?.name} : {person?.relation}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openAddNewPersonModal}
          style={[
            styles.smallBox,
            {
              backgroundColor: inputBg,
            },
          ]}
        >
          <Ionicons name="add-circle" size={20} color={textColor} />
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      )}

      {showPersonPicker && (
        <Modal visible={showPersonPicker} transparent animationType="fade" onRequestClose={closePersonPickerModal}>
          <Pressable
            style={styles.modalContainer}
            onPress={closePersonPickerModal}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              <Animated.View
                style={[{ transform: [{ translateY: slidePickerAnim }] }]}
              >
                <View style={styles.pickerContainer}>
                  <SafeAreaView
                    style={[styles.flex_row_btw, { marginBottom: 10 }]}
                  >
                    <Text style={styles.title}>Pick Category</Text>

                    <TouchableOpacity onPress={closePersonPickerModal}>
                      <FontAwesome6 name="xmark" size={20} color={textColor} />
                    </TouchableOpacity>
                  </SafeAreaView>

                  <ScrollView style={{ width: "100%" }}>
                    {peopleList.length > 0 ? (
                      peopleList.map((person: Person) => (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          key={person._id}
                          onPress={() => handleConfirm(person)}
                          style={[
                            styles.smallBox,
                            {
                              backgroundColor: inputBg,
                            },
                          ]}
                        >
                          <Ionicons name="person" color={textColor} size={14} />
                          <Text numberOfLines={1}>{person?.name} : {person?.relation}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text
                        style={{
                          marginTop: 20,
                          textAlign: "center",
                          fontStyle: "italic",
                        }}
                      >
                        No Category
                      </Text>
                    )}
                  </ScrollView>

                  <SafeAreaView>
                    <TouchableOpacity
                      onPress={handleOpenAddNewCPersonModal}
                      activeOpacity={0.8}
                      style={[styles.addButton, { backgroundColor: "#4FB92D" }]}
                    >
                      <Ionicons name="add-circle" size={20} color="#FFF" />
                      <Text style={[styles.addText, { color: "#FFF" }]}>
                        Add
                      </Text>
                    </TouchableOpacity>
                  </SafeAreaView>
                </View>
              </Animated.View>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {showAddPersonModal && (
        <AddPerson
          visible={showAddPersonModal}
          slideModalAnim={slideAddModalAnim}
          handleCloseModal={handleCloseAddModal}
          setPerson={setPerson}
        />
      )}
    </>
  );
};

export default PersonPicker;

const styles = StyleSheet.create({
  smallBox: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  addText: {
    fontWeight: 500,
    fontSize: 16,
    marginRight: 5,
  },
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
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  pickerContainer: {
    padding: 20,
    borderRadius: 15,
    minHeight: 320,
    maxHeight: 400,
    overflowY: "scroll",
    borderWidth: 0.5,
    borderColor: "#666",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  flex_row_btw: {
    gap: 5,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addButton: {
    gap: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 20,
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
});
