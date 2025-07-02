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
import { useColorScheme } from "@/components/useColorScheme";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "../Themed";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import AddCategory from "@/components/Modals/AddCategory";

interface Category {
  name: string;
  hexColor: string;
  _id: any;
  type: string;
}

const CategoryPicker = ({
  category,
  setCategory,
  filteredCategories,
  clickedTransCategory,
}: {
  category: Category | undefined;
  setCategory: (category: any) => void;
  filteredCategories: any[];
  clickedTransCategory: string;
}) => {
  const colorScheme = useColorScheme();
  const inputBg = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";

  const [showPicker, setShowPicker] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const slideModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen
  const slideAddModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen

  const openCategoryPickerModal = () => {
    setShowPicker(true);

    setTimeout(() => {
      Animated.timing(slideModalAnim, {
        toValue: 0, // Slide up
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 100);
  };

  const handleCloseCategoryPickerModal = () => {
    Animated.timing(slideModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowPicker(false);
    });
  };

  const handleConfirm = (selectedCategory: Category) => {
    Animated.timing(slideModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setCategory(selectedCategory);
      setShowPicker(false);
    });
  };

  const handleOpenAddNewCategroyModal = () => {
    handleCloseCategoryPickerModal();
    openAddCategoryModal();
  };

  const openAddCategoryModal = () => {
    setShowAddModal(true);

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
      setShowAddModal(false);
    });
  };

  return (
    <>
      {filteredCategories.length > 0 ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openCategoryPickerModal}
          style={[
            styles.smallBox,
            {
              backgroundColor: inputBg,
            },
          ]}
        >
          <View
            style={[
              styles.categoryCircle,
              { backgroundColor: category?.hexColor },
            ]}
          ></View>

          <Text numberOfLines={1} style={{ width: "85%" }}>{category?.name}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenAddNewCategroyModal}
          style={[
            styles.smallBox,
            {
              backgroundColor: inputBg,
            },
          ]}
        >
          <Ionicons name="add-circle" size={20} color={textColor} />
          <Text style={styles.addText}>Category</Text>
        </TouchableOpacity>
      )}

      {showPicker && (
        <Modal visible={showPicker} transparent animationType="fade" onRequestClose={handleCloseCategoryPickerModal}>
          <Pressable
            style={styles.modalContainer}
            onPress={handleCloseCategoryPickerModal}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              <Animated.View
                style={[{ transform: [{ translateY: slideModalAnim }] }]}
              >
                <View style={styles.pickerContainer}>
                  <SafeAreaView
                    style={[styles.flex_row_btw, { marginBottom: 10 }]}
                  >
                    <Text style={styles.title}>Pick Category</Text>

                    <TouchableOpacity onPress={handleCloseCategoryPickerModal}>
                      <FontAwesome6 name="xmark" size={20} color={textColor} />
                    </TouchableOpacity>
                  </SafeAreaView>

                  <ScrollView style={styles.categoriesContainer}>
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category: Category) => (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          key={category._id}
                          onPress={() => handleConfirm(category)}
                          style={[
                            styles.smallBox,
                            {
                              backgroundColor: inputBg,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.categoryCircle,
                              { backgroundColor: category.hexColor },
                            ]}
                          ></View>

                          <Text numberOfLines={1} style={{ width: "85%" }}>{category?.name}</Text>
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
                      onPress={handleOpenAddNewCategroyModal}
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

      {showAddModal && (
        <AddCategory
          visible={showAddModal}
          slideModalAnim={slideAddModalAnim}
          handleCloseModal={handleCloseAddModal}
          setCategory={setCategory}
          clickedCategory={clickedTransCategory}
        />
      )}
    </>
  );
};

export default CategoryPicker;

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
  categoriesContainer: {
    width: "100%",
  },
  categoryCircle: {
    width: 15,
    height: 15,
    borderRadius: 20,
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
  flex_row: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
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
  addText: {
    fontWeight: 400,
    fontSize: 16,
    marginRight: 5,
  },
});
