import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Text, View } from "../Themed";
import { Modal } from "react-native";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native";
import { useTrash } from "@/context/trash";
import { useColorScheme } from "@/components/useColorScheme";
import { useUserData } from "@/context/user";
import { useAnalytics } from "@/context/analytics";
import formatDateTimeSimple from "@/utils/formatDateTimeSimple";
import { formatAmount } from "@/utils/formatAmount";
import calculateDaysFrom from "@/utils/calculateDateFrom";
import { useMessages } from "@/context/messages";

interface Transaction {
  _id: string;
  amount: number;
  category: {
    name: string;
    hexColor: string;
    sign: string;
    type: string;
    _id: string;
  };
  note: string;
  pushedIntoTransactions: boolean;
  
  people: {
    name: string;
    relation: string;
    contact: number;
    _id: string;
  };
  createdAt: Date;
  image: string;
  deletedAt?: Date;
}

const ReadTrash = ({
  visible,
  handleCloseModal,
  slideModalAnim,
  transaction,
}: {
  visible: boolean;
  handleCloseModal: () => void;
  slideModalAnim: any;
  transaction: Transaction;
}) => {
  const { fetchUserDetails, currencyObj, loadingUserDetails } = useUserData();
  const { fetchAnalytics } = useAnalytics();
  const { isTransDeleting, isReverting, deleteTranshTrans, revertTrashTransaction, } = useTrash();
  const { setError, setMessageText } = useMessages()

  const colorScheme = useColorScheme();
  const inputBg = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";

  const {
    _id,
    category,
    amount,
    note,
    people,
    image,
    pushedIntoTransactions,
    createdAt,
    deletedAt,
  } = transaction;

  async function handleDelete() {
    try {
      await deleteTranshTrans(_id, createdAt);
      await fetchBoth();
      handleCloseModal();

      setMessageText("Sucessfully Deleted :)");
    } catch (error) {
      handleCloseModal();

      setError("Failed to Delete :(");
      // Alert.alert("Failed", "Failed to Delete");
    }
  }

  async function handleRevert() {
    try {
      await revertTrashTransaction(_id, createdAt);
      await fetchBoth();
      handleCloseModal();

      setMessageText("Sucessfully Reverted :)");
    } catch (error) {
      handleCloseModal();

      setError("Failed to Revert :(");
      // Alert.alert("Failed", "Failed to Revert");
    }
  }

  async function fetchBoth() {
    await fetchUserDetails();
    await fetchAnalytics();
  }

  return (
    <ScrollView style={{ flex: 1, position: "absolute" }}>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCloseModal}>
        <Pressable
          style={styles.modalContainer}
          onPress={handleCloseModal}
          disabled={isTransDeleting || isReverting}
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
                  {isTransDeleting ? (
                    <View
                      style={[styles.doneButton, { backgroundColor: "red" }]}
                    >
                      <ActivityIndicator size="small" color={"#FFF"} />
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={handleDelete}
                      activeOpacity={0.5}
                      disabled={isReverting || loadingUserDetails || isTransDeleting}
                      style={[styles.doneButton, { backgroundColor: "red" }]}
                    >
                      <FontAwesome6
                        name="trash-can"
                        color={"#FFF"}
                        style={styles.doneText}
                      />
                    </TouchableOpacity>
                  )}

                  <Text style={[styles.title, { maxWidth: "50%" }]} numberOfLines={1}>Your {category.name}</Text>

                  {isReverting ? (
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
                      onPress={handleRevert}
                      activeOpacity={0.5}
                      disabled={isReverting || loadingUserDetails || isTransDeleting}
                      style={[
                        styles.doneButton,
                        { backgroundColor: "#4FB92D" },
                      ]}
                    >
                      <FontAwesome6
                        name="trash-arrow-up"
                        color={"#FFF"}
                        style={styles.doneText}
                      />
                    </TouchableOpacity>
                  )}
                </SafeAreaView>

                {/* Date */}
                <View style={[styles.inputField, { backgroundColor: inputBg }]}>
                  <Text>{formatDateTimeSimple(createdAt)}</Text>
                </View>

                {/* Amount */}
                <View style={[styles.inputField, { backgroundColor: inputBg }]}>
                  <Text>{formatAmount(amount, currencyObj)}</Text>
                </View>

                {/* Category */}
                <View
                  style={[
                    styles.smallBox,
                    {
                      backgroundColor: inputBg,
                      marginBottom: note || people || deletedAt ? 12 : 0,
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
                </View>

                {/* Person */}
                {people && (
                  <View
                    style={[
                      styles.smallBox,
                      {
                        backgroundColor: inputBg,
                        marginBottom: note || deletedAt ? 12 : 0,
                      },
                    ]}
                  >
                    <Ionicons name="person" color={textColor} size={14} />
                    <Text numberOfLines={1}>
                      {people?.name} : {people?.relation}
                    </Text>
                  </View>
                )}

                {/* Note */}
                {note && (
                  <View
                    style={[
                      styles.inputField,
                      {
                        backgroundColor: inputBg,
                        marginBottom: deletedAt ? 12 : 0,
                        marginTop: !people && !category ? 12 : 0,
                      },
                    ]}
                  >
                    <Text>Note: {note}</Text>
                  </View>
                )}

                {/* Deleted At */}
                {deletedAt && (
                  <SafeAreaView
                    style={[
                      styles.inputField,
                      {
                        backgroundColor: inputBg,
                        marginTop: !note && !people && !category ? 12 : 0,
                        marginBottom: 0,
                      },
                    ]}
                  >
                    <Text>
                      Deleted: {7 - calculateDaysFrom(deletedAt)}{" "}
                      {7 - calculateDaysFrom(deletedAt) > 1 ? "Days Back" : "Day Back"}
                    </Text>
                  </SafeAreaView>
                )}
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

export default ReadTrash;

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
    // overflowY: "scroll",
    borderWidth: 0.5,
    borderColor: "#666",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
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
  inputField: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 12,
    fontWeight: 400,
  },
  categoryCircle: {
    width: 15,
    height: 15,
    borderRadius: 20,
  },
  image: {
    borderRadius: 5,
    width: "100%",
    height: 120,
    overflow: "hidden",
    objectFit: "cover",
    backgroundColor: "#e3e3e3",
  },
  imageContainer: {
    position: "relative",
  },
});
