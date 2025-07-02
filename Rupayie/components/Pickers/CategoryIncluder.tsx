import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Text, View } from "../Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useUserData } from "@/context/user";
import AddCategory from "../Modals/AddCategory";

interface IncludedCategory {
  budget: number;
  spent: number;
  included: boolean;
  _id: string;
  name: string;
  hexColor: string;
  sign: string;
  type: string;
}

const screenHeight = Dimensions.get("window").height;

const CategoryIncluder = ({
  visible,
  handleCloseModal,
  slideModalAnim,
  includedCategories,
  setIncludedCategories,
}: {
  visible: boolean;
  handleCloseModal: () => void;
  slideModalAnim: any;
  includedCategories: IncludedCategory[];
  setIncludedCategories: (includedCategories: any) => void;
}) => {
  const { categoriesList } = useUserData();

  const colorScheme = useColorScheme();
  const oppBgColor = colorScheme === "dark" ? "#000" : "#FFF";
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";

  const mergedCategories = categoriesList
    .filter((cat: IncludedCategory) => cat.type === "Spent")
    .map((cat: IncludedCategory) => {
      const existingCategory = includedCategories.find(
        (incCat) => incCat._id === cat._id
      );

      return {
        ...cat,
        included: existingCategory ? existingCategory.included : false, // Retain selection
        budget: existingCategory ? existingCategory.budget : 0, // Keep existing budget
        spent: existingCategory ? existingCategory.spent : 0, // Keep existing spent value
      };
    });

  const [catsCopy, setCatsCopy] = useState(mergedCategories);

  const includedCount = catsCopy?.reduce(
    (count: number, category: IncludedCategory) =>
      count + (category.included ? 1 : 0),
    0
  );

  function handleCategorySelect(category: IncludedCategory) {
    setCatsCopy((prev: IncludedCategory[]) =>
      prev.map((cat) =>
        cat._id === category._id ? { ...cat, included: !cat.included } : cat
      )
    );
  }

  function handleSaveIncludedCategories() {
    setIncludedCategories(catsCopy);
    handleCloseModal();
  }

  function handleSelectAll() {
    setCatsCopy((prev: IncludedCategory[]) =>
      prev.map((cat) => ({ ...cat, included: true }))
    );
  }

  function handleUnSelectAll() {
    setCatsCopy((prev: IncludedCategory[]) =>
      prev.map((cat) => ({ ...cat, included: false }))
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCloseModal}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable style={styles.modalContainer} onPress={handleCloseModal}>
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              <Animated.View
                style={[
                  styles.animatedView,
                  { backgroundColor: oppBgColor },
                  { transform: [{ translateY: slideModalAnim }] },
                ]}
              >
                {/* Heading */}
                <SafeAreaView
                  style={[styles.flex_row_btw, { marginBottom: 20 }]}
                >
                  <Text style={styles.title}>Select Included Categories</Text>

                  {/* Save button */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.doneButton}
                    onPress={handleSaveIncludedCategories}
                  >
                    <FontAwesome6
                      name="check"
                      color={"#FFF"}
                      style={styles.doneText}
                    />
                  </TouchableOpacity>
                </SafeAreaView>

                <SafeAreaView style={styles.flex_row_btw}>
                  <TouchableOpacity
                    style={[styles.flex_row, { gap: 5 }]}
                    onPress={
                      includedCount === includedCategories.length
                        ? handleUnSelectAll
                        : handleSelectAll
                    }
                    activeOpacity={0.5}
                  >
                    <Text>
                      {includedCount === includedCategories.length
                        ? "Unselect All"
                        : "Select All"}
                    </Text>
                    {includedCount === includedCategories.length ? (
                      <Ionicons name="checkbox" size={16} color="#4CAF50" />
                    ) : (
                      <Ionicons
                        name="square-outline"
                        size={16}
                        color={textColor}
                      />
                    )}
                  </TouchableOpacity>

                  <Text>{includedCount} categories selected</Text>
                </SafeAreaView>

                <ScrollView style={{ marginTop: 15 }}>
                  <SafeAreaView style={styles.flex_col}>
                    {catsCopy.length > 0 &&
                      catsCopy.map((cat: { _id: string }) => (
                        <CategoryCard
                          category={cat}
                          key={cat._id}
                          handleCategorySelect={handleCategorySelect}
                        />
                      ))}
                  </SafeAreaView>
                </ScrollView>
              </Animated.View>
            </Pressable>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const CategoryCard = ({
  category,
  handleCategorySelect,
}: {
  category: any;
  handleCategorySelect: (value: any) => void;
}) => {
  const { name, hexColor } = category;

  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";
  const bgColor = colorScheme === "dark" ? "#141414" : "#EDEDED";

  return (
    <Pressable
      style={[styles.categoryContainer, { backgroundColor: bgColor }]}
      onPress={() => handleCategorySelect(category)}
    >
      <SafeAreaView style={[styles.flex_row, { gap: 15 }]}>
        <View style={[styles.circle, { backgroundColor: hexColor }]} />
        <Text numberOfLines={1} style={{ maxWidth: "70%" }}>{name}</Text>
      </SafeAreaView>

      <TouchableOpacity
        onPress={() => handleCategorySelect(category)}
        style={styles.checkbox}
      >
        {category.included ? (
          <Ionicons name="checkbox" size={24} color="#4CAF50" />
        ) : (
          <Ionicons name="square-outline" size={24} color={textColor} />
        )}
      </TouchableOpacity>
    </Pressable>
  );
};

export default CategoryIncluder;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(29, 29, 29, 0.5)",
  },
  modalContent: {
    width: "100%",
    paddingHorizontal: 0,
    alignItems: "center",
  },
  animatedView: {
    width: "100%",
    height: screenHeight * 0.7, // 70% of screen height
    padding: 20,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
  },
  title: {
    fontWeight: 500,
    fontSize: 16,
  },
  flex_row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  flex_row_btw: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  inputField: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  flex_col: {
    gap: 10,
    display: "flex",
    flexDirection: "column",
  },
  circle: {
    height: 24,
    width: 24,
    borderRadius: 30,
  },
  categoryContainer: {
    padding: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkbox: {
    padding: 5,
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
});
