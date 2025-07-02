import {
  Animated,
  Easing,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
import { Text, View } from "../Themed";
import { FontAwesome6 } from "@expo/vector-icons";
import { useColorScheme } from "@/components/useColorScheme";
import CategoryIncluder from "../Pickers/CategoryIncluder";

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

const IncludeCategories = ({
  includedCount,
  includedCategories,
  setIncludedCategories,
  showNoCatSelectedError,
}: {
  includedCount: number;
  includedCategories: IncludedCategory[];
  setIncludedCategories: (value: IncludedCategory[]) => void;
  showNoCatSelectedError: boolean;
}) => {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";

  const [showModal, setShowModal] = useState(false);
  const slideModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen

  const openCategoryIncluderModal = () => {
    setShowModal(true);

    setTimeout(() => {
      Animated.timing(slideModalAnim, {
        toValue: 0, // Slide up
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 100);
  };

  const closeCategoryIncluderModal = () => {
    Animated.timing(slideModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
    });
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={openCategoryIncluderModal}>
        <SafeAreaView style={styles.flex_row_btw}>
          <View>
            <Text style={styles.title}>Budget Categories</Text>
            {showNoCatSelectedError ? (
              <Text style={{ color: "red" }}>
                Select Atleast 1 Category!
              </Text>
            ) : (
              <Text
                numberOfLines={1}
                style={{ marginBottom: includedCount == 0 ? 0 : 15 }}
              >
                {includedCount === 0
                  ? "Select Categories to be Included in Budget"
                  : includedCount > 0 &&
                    includedCount !== includedCategories.length
                  ? `${includedCount} Categories Included in Budget`
                  : includedCount > 0 &&
                    includedCount === includedCategories.length &&
                    `All Categories Included in Budget`}
              </Text>
            )}
          </View>

          <View style={{ marginBottom: 15, marginRight: 5 }}>
            <FontAwesome6 name="chevron-right" size={20} color={textColor} />
          </View>
        </SafeAreaView>
      </Pressable>

      {includedCount !== 0 && (
        <IncludedCategoriesFlatList
          categoriesList={includedCategories.filter((cat) => !!cat.included)}
        />
      )}

      {showModal && (
        <CategoryIncluder
          includedCategories={includedCategories}
          setIncludedCategories={setIncludedCategories}
          visible={showModal}
          slideModalAnim={slideModalAnim}
          handleCloseModal={closeCategoryIncluderModal}
        />
      )}
    </View>
  );
};

const IncludedCategoriesFlatList = ({ categoriesList }: any) => {
  return (
    <FlatList
      data={categoriesList}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => <CategoryItem category={item} />}
      ItemSeparatorComponent={() => <View style={{ width: 25 }} />}
    />
  );
};

const CategoryItem = ({ category }: any) => {
  return (
    <View style={styles.categoryItem}>
      {/* Circular Hex Color Indicator */}
      <View style={[styles.circle, { backgroundColor: category.hexColor }]} />

      {/* IncludedCategory Name */}
      <Text numberOfLines={1} style={[styles.categoryText]}>
        {category.name}
      </Text>
    </View>
  );
};

export default IncludeCategories;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  categoryItem: {
    alignItems: "center",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 25, // Makes it circular
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 12,
    textAlign: "center",
    maxWidth: 70,
  },
  flex_row_btw: {
    gap: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
