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
} from "react-native";
import React, { useEffect, useState } from "react";
import { Text, View } from "@/components/Themed";
import { TouchableOpacity } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import { FontAwesome6 } from "@expo/vector-icons";
import WheelColorPicker from 'react-native-wheel-color-picker';

import categoryColors from "@/constants/categoryColors";
import { useCategory } from "@/context/categories";
import { useUserData } from "@/context/user";
import { useAnalytics } from "@/context/analytics";
import { useMessages } from "@/context/messages";

interface Category {
  name: string;
  hexColor: string;
  _id: any;
  type: string;
  sign: string;
}

const ReadCategory = ({
  visible,
  handleCloseModal,
  slideModalAnim,
  category,
}: {
  visible: boolean;
  handleCloseModal: () => void;
  slideModalAnim: any;
  category: Category;
}) => {
  const { categoriesList, fetchUserDetails, loadingUserDetails, userDetails } = useUserData();
  const { fetchAnalytics } = useAnalytics();
  const { saveEditedCategory, deleteCategory, loadingCategories, loadingCategoryDelete, } = useCategory();
  const { setError, setMessageText } = useMessages()

  const colorScheme = useColorScheme();
  const inputBg = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";
  const placeholderColor = colorScheme === "dark" ? "#c2c2c2" : "#4d4d4d";

  const [name, setName] = useState(category.name);
  const [hexColor, setHexColor] = useState(category.hexColor);
  const [type, setType] = useState(category.type);
  const [sign, setSign] = useState(category.sign);

  const [showError, setShowError] = useState(false);
  const [showAlreadyExists, setShowAlreadyExists] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  function validateValues() {
    if (name === "") {
      setShowError(true);
      return false;
    }

    const alreadyExists = categoriesList
      .filter((cat: Category) => cat._id !== category._id)
      .find((cat: Category) => cat.name === name || cat.hexColor === hexColor);

    if (alreadyExists) {
      setShowAlreadyExists(true);
      return false;
    }

    return true;
  }

  function noChangesDone() {
    if (name === category.name && hexColor === category.hexColor) return true;
    return false;
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

      if (noChangesDone()) {
        // close directly
        closeTheModal();
      } else {
        //save
        await saveEditedCategory(category._id, values);
        // re fetch
        await reFetchBoth();
        // then close
        closeTheModal();

        setMessageText("Successfully Saved :)");
      }

    } catch (error) {
      closeTheModal();

      setError("Failed to Save :(");
      // Alert.alert("Failed", "Failed to Save");
    }
  }

  function closeTheModal() {
    handleCloseModal();

    resetAllValues();
  }

  function resetAllValues() {
    setName("");
    setHexColor(categoryColors[0]);
    setType(category.type);
    setSign("-");
  }

  async function reFetchBoth() {
    await fetchAnalytics();
    await fetchUserDetails();
  }

  async function handleDelete() {
    try {
      await deleteCategory(category._id);

      await reFetchBoth();
      closeTheModal();

      setMessageText("Sucessfully Deleted :)");
    } catch (error) {
      closeTheModal();

      setError("Failed to Delete :(");
      // Alert.alert("Failed", "Failed to Delete");
    }
  }

  useEffect(() => {
    if (category.type === "Earned" || category.type === "Borrowed") {
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
    setName(category.name);
    setHexColor(category.hexColor);
    setType(category.type);
    setSign(category.sign);
  }, [category]);

  return (
    <ScrollView style={{ flex: 1 }}>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={closeTheModal}>
        <Pressable
          style={styles.modalContainer}
          onPress={closeTheModal}
          disabled={loadingCategories || loadingCategoryDelete}
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
                  style={[styles.flex_row_start_btw, { marginBottom: 15 }]}
                >
                  {loadingCategoryDelete ? (
                    <View
                      style={[styles.doneButton, { backgroundColor: "red" }]}
                    >
                      <ActivityIndicator size="small" color={"#FFF"} />
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={handleDelete}
                      activeOpacity={0.5}
                      disabled={loadingCategories || loadingCategoryDelete || loadingUserDetails}
                      style={[styles.doneButton, { backgroundColor: "red" }]}
                    >
                      <FontAwesome6
                        name="trash"
                        color={"#FFF"}
                        style={styles.doneText}
                      />
                    </TouchableOpacity>
                  )}

                  <Text style={[styles.title, { maxWidth: "50%" }]} numberOfLines={1}>Edit {category.name}</Text>

                  {loadingCategories ? (
                    <View style={styles.doneButton}>
                      <ActivityIndicator size="small" color={"#FFF"} />
                    </View>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={handleSave}
                      disabled={loadingCategoryDelete || loadingCategories || loadingUserDetails}
                      style={styles.doneButton}
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
                    category={type}
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
                        <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Select Color</Text>
                        <WheelColorPicker
                          color={hexColor}
                          onColorChangeComplete={(color: string) => setHexColor(color)}
                          sliderHidden={true}
                        />
                        <TouchableOpacity onPress={() => setShowColorPicker(false)} style={styles.colorPickerCloseBtn}>
                          <Text style={{ color: '#000', fontWeight: 'bold' }}>Close</Text>
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

const ColorPicker = ({
  hexColor,
  setHexColor,
}: {
  hexColor: string;
  setHexColor: (hexColor: string) => void;
}) => {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.colorsContainer}>
        {categoryColors.map((color) => (
          <TouchableOpacity
            key={color}
            activeOpacity={0.5}
            onPress={() => setHexColor(color)}
          >
            <View
              style={[
                styles.hexColor,
                {
                  backgroundColor: color,
                  borderColor: hexColor === color ? textColor : "transparent",
                },
              ]}
            ></View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default ReadCategory;

const styles = StyleSheet.create({
  modalContent: {
    width: "100%",
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
  flex_row_start_btw: {
    gap: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  colorPickerModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 400,
    justifyContent: 'center',
  },
  colorPickerCloseBtn: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});
