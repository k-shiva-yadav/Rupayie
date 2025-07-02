import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Text, View } from "@/components/Themed";
import { TouchableOpacity } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import { FontAwesome6 } from "@expo/vector-icons";
import WheelColorPicker from 'react-native-wheel-color-picker';
// import { CategorySelector } from "../SelectCategory";

import categoryColors from "@/constants/categoryColors";
import { useCategory } from "@/context/categories";
import { useUserData } from "@/context/user";
import { useAnalytics } from "@/context/analytics";
import { useMessages } from "@/context/messages";
import axios from 'axios';
import * as ImagePicker from "expo-image-picker";

interface Category {
  name: string;
  hexColor: string;
  _id: any;
  type: string;
}

const AddCategory = ({
  visible,
  handleCloseModal,
  slideModalAnim,
  setCategory,
  clickedCategory,
  editingCategory,
}: {
  visible: boolean;
  handleCloseModal: () => void;
  slideModalAnim: any;
  setCategory: (category: Category) => void;
  clickedCategory: string;
  editingCategory?: Category;
}) => {
  const { categoriesList, fetchUserDetails, loadingUserDetails } = useUserData();
  const { fetchAnalytics } = useAnalytics();
  const { addNewCategory, loadingCategories, updateCategory } = useCategory();
  const { setError, setMessageText } = useMessages()

  const colorScheme = useColorScheme();
  const inputBg = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";
  const placeholderColor = colorScheme === "dark" ? "#c2c2c2" : "#4d4d4d";

  const [name, setName] = useState("");
  const [hexColor, setHexColor] = useState(categoryColors[0]);
  const [type, setType] = useState(clickedCategory);
  const [sign, setSign] = useState("-");

  const [showError, setShowError] = useState(false);
  const [showAlreadyExists, setShowAlreadyExists] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const Server_API = "http://192.168.1.21:2002/api"; // Use your PC's IP, not localhost

  function validateValues() {
    if (name === "") {
      setShowError(true);
      return false;
    }

    const alreadyExists = categoriesList.find(
      (cat: Category) => cat.name === name || cat.hexColor === hexColor
    );

    if (alreadyExists) {
      setShowAlreadyExists(true);
      return false;
    }

    return true;
  }

  async function handleSave() {
    try {
      const flag = validateValues();
      if (!flag) return;

      const values = {
        name,
        hexColor,
        type,
        sign,
      };

      let resultCategory;
      if (editingCategory) {
        resultCategory = await updateCategory(editingCategory._id, values);
      } else {
        resultCategory = await addNewCategory(values);
      }
      await reFetchBoth();

      setCategory(resultCategory);
      closeTheModal();

      setMessageText(editingCategory ? "Successfully Updated :)" : "Successfully Added :)")
    } catch (error) {
      closeTheModal();
      setError(editingCategory ? "Failed to Update :(" : "Failed to Add :(");
    }
  }

  function closeTheModal() {
    handleCloseModal();

    resetAllValues();
  }

  function resetAllValues() {
    setName("");
    setHexColor(categoryColors[0]);
    setType(clickedCategory);
    setSign("-");
  }

  async function reFetchBoth() {
    await fetchAnalytics();
    await fetchUserDetails();
  }

  useEffect(() => {
    if (type === "Earned" || type === "Borrowed") {
      setSign("+");
    } else {
      setSign("-");
    }
  }, [type]);

  useEffect(() => {
    setShowError(false);
  }, [name]);

  useEffect(() => {
    setShowAlreadyExists(false);
  }, [hexColor, type, name]);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setHexColor(editingCategory.hexColor);
      setType(editingCategory.type);
      setSign(editingCategory.sign || (editingCategory.type === "Earned" || editingCategory.type === "Borrowed" ? "+" : "-"));
    } else {
      resetAllValues();
    }
  }, [editingCategory, visible]);

  return (
    <ScrollView style={{ flex: 1, position: "absolute" }}>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={closeTheModal}>
        <Pressable
          style={styles.modalContainer}
          onPress={closeTheModal}
          disabled={loadingCategories}
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
                  <Text style={styles.title}>
                    Add {clickedCategory} Category
                  </Text>

                  {loadingCategories ? (
                    <View style={styles.doneButton}>
                      <ActivityIndicator size="small" color={"#FFF"} />
                    </View>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={handleSave}
                      style={styles.doneButton}
                      disabled={loadingUserDetails || loadingCategories}
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
                  placeholder="Category Name"
                  keyboardType="default"
                  placeholderTextColor={placeholderColor}
                  value={name}
                  numberOfLines={1}
                  onChangeText={(text) => setName(text)}
                />

                {showError && (
                  <Text
                    style={{
                      color: "red",
                      fontSize: 14,
                      textAlign: "left",
                      marginTop: -15,
                      marginLeft: 10,
                      marginBottom: 10,
                    }}
                  >
                    Enter name
                  </Text>
                )}

                {/* <SafeAreaView style={{ marginBottom: 20 }}>
                <CategorySelector
                  clickedCategory={type}
                  setClickedCategory={setType}
                />
              </SafeAreaView> */}

                <SafeAreaView style={{ marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => setShowColorPicker(true)}>
                    <View style={[styles.hexColor, { backgroundColor: hexColor, borderColor: '#888', borderWidth: 2 }]} />
                  </TouchableOpacity>
                  <Text style={{ marginLeft: 10, fontWeight: 'bold' }}>Select Color</Text>
                  <Modal visible={showColorPicker} transparent animationType="fade" onRequestClose={() => setShowColorPicker(false)}>
                    <View style={styles.colorPickerModalBg}>
                      <View style={styles.colorPickerModalContent}>
                        <WheelColorPicker
                          color={hexColor}
                          onColorChangeComplete={(color: string) => setHexColor(color)}
                          sliderHidden={true}
                        />
                       <TouchableOpacity onPress={() => setShowColorPicker(false)} style={styles.colorPickerCloseBtn}>
  <Text style={{ fontWeight: 'bold', color: '#000' }}>Close</Text>
</TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                </SafeAreaView>

                <SafeAreaView style={styles.flex_row_center}>
                  <View
                    style={[
                      styles.smallHexColor,
                      { backgroundColor: hexColor },
                    ]}
                  ></View>
                  <Text numberOfLines={1} style={{ fontWeight: 500, textAlign: "center", maxWidth: "50%" }}>
                    {name == "" ? "Category Name" : name}
                  </Text>
                </SafeAreaView>

                {showAlreadyExists && (
                  <Text
                    style={{
                      color: "orange",
                      fontSize: 14,
                      textAlign: "center",
                      marginTop: 10,
                    }}
                  >
                    Category With These Values Already Exists
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

export default AddCategory;

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
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  animatedView: {
    padding: 20,
    borderRadius: 15,
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
  flex_row: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  flex_row_center: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  inputField: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontWeight: 400,
    marginBottom: 20,
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
  hexColor: {
    height: 40,
    width: 40,
    borderRadius: 30,
    borderWidth: 3,
  },
  smallHexColor: {
    height: 15,
    width: 15,
    borderRadius: 30,
  },
  colorsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
    marginTop: 10,
  },
  colorPickerModalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    width: 320,
    minHeight: 350,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000',
  },
  colorPickerCloseBtn: {
    marginTop: 20,
    backgroundColor: '#4FB92D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
});
