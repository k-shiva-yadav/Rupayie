import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { SafeAreaView } from "react-native";
import { useUserData } from "@/context/user";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTransactionsCategory } from "@/context/transCategory";
import DateAndTimePicker from "../Pickers/DateAndTimePicker";
import CategoryPicker from "../Pickers/CategoryPicker";
// import ImagePicker from "../Pickers/ImagePicker";
// import { Image } from "react-native";
// import { useTransactionImage } from "@/context/image";
import { useTransactions } from "@/context/transactions";
import { useCategory } from "@/context/categories";
import { useAnalytics } from "@/context/analytics";
import PersonPicker from "../Pickers/PersonPicker";
import { useMessages } from "@/context/messages";
import { formatAmount } from "@/utils/formatAmount";

interface Category {
  name: string;
  hexColor: string;
  _id: any;
  type: string;
  sign: string;
}

interface Person {
  name: string;
  contact: Number;
  relation: string;
  _id: string;
}

const AddTransaction = ({
  isVisible,
  slideModalAnim,
  handleCloseModal,
}: {
  isVisible: boolean;
  slideModalAnim: any;
  handleCloseModal: any;
}) => {
  const colorScheme = useColorScheme();
  const { categoriesList, peopleList, fetchUserDetails, loadingUserDetails, currencyObj } = useUserData();
  const { fetchAnalytics } = useAnalytics();
  const { loadingCategories } = useCategory();
  const { clickedTransCategory } = useTransactionsCategory();
  const { addNewTransaction, processing } = useTransactions();
  const { setError, setMessageText } = useMessages()

  // const { deleteImage, uploadImage, imageUploading } = useTransactionImage();
  const filteredCategories = categoriesList.filter(
    (cat: Category) => cat.type === clickedTransCategory
  );

  const [amount, setAmount] = useState<number>();
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState<Category>(filteredCategories[0]);
  const [person, setPerson] = useState<Person>(peopleList[0]);
  const [status, setStatus] = useState("-");

  // const [imageURL, setImageURL] = useState(null);
  // const [localImage, setLocalImage] = useState(null);

  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState("");

  const categoryName =
    clickedTransCategory === "Spent"
      ? "Expense"
      : clickedTransCategory === "Earned"
        ? "Earning"
        : clickedTransCategory === "Borrowed"
          ? "Loan"
          : "Lending";

  const textColor = colorScheme === "dark" ? "#FFF" : "#000";
  const placeholderColor = colorScheme === "dark" ? "#c2c2c2" : "#4d4d4d";
  const inputBg = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";

  function closeTheModal() {
    handleCloseModal();

    resetAllValues();
  }

  function resetAllValues() {
    setAmount(undefined);
    setNote("");
    setCategory(filteredCategories[0]);
    setStatus(clickedTransCategory == "Borrowed" ? "+" : "-");
    setDate(new Date());

    // error text
    setShowError(false);
    setErrorText("");
  }

  const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
  };

  function ValidateFields() {
    if (!amount) {
      setShowError(true);
      setErrorText("Enter Amount");
      return false;
    }

    // Get today's date without the time part
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Normalize time to midnight

    // Get selected date without the time part
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      setShowError(true);
      setErrorText("Can't select a future date");
      return false;
    }

    if (!category) {
      setShowError(true);
      setErrorText("Add a category");
      return false;
    }

    return true;
  }

  async function handleSave() {
    try {
      const flag = ValidateFields();
      if (!flag) return;

      // Ensure category has required fields for Lend/Borrowed
      let categoryToSend = category;
      if ((clickedTransCategory === "Borrowed" || clickedTransCategory === "Lend") && category) {
        categoryToSend = {
          ...category,
          sign: status,
          _id: category._id,
          type: clickedTransCategory,
        };
      }

      // Only include person if it exists and is valid
      let personToSend = undefined;
      if ((clickedTransCategory === "Borrowed" || clickedTransCategory === "Lend") && person && person._id) {
        personToSend = person;
      }

      const values = {
        amount,
        note,
        createdAt: date,
        ...(personToSend ? { people: personToSend } : {}),
        category: categoryToSend,
      };

      await addNewTransaction(values);
      await reFetchBoth();

      // Close modal
      closeTheModal();

      setMessageText("Successfully Added :)")
    } catch (error) {
      // Show real backend error message if available
      setShowError(true);
      setErrorText((error as Error).message || "Failed to Add :(");
      setError((error as Error).message || "Failed to Add :(");
    }
  }

  async function reFetchBoth() {
    await fetchAnalytics();
    await fetchUserDetails();
  }

  useEffect(() => {
    setCategory(filteredCategories[0]);
    setPerson(peopleList[0])
  }, [clickedTransCategory, loadingCategories, loadingUserDetails]);

  useEffect(() => {
    setShowError(false);
  }, [amount, note]);

  useEffect(() => {
    setStatus(clickedTransCategory == "Borrowed" ? "+" : "-");
  }, [clickedTransCategory]);

  return (
    <ScrollView style={{ flex: 1, position: "absolute" }}>
      <Modal visible={isVisible} transparent animationType="fade" onRequestClose={closeTheModal}>
        <Pressable
          style={styles.modalContainer}
          onPress={closeTheModal}
          disabled={processing}
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
                  style={[styles.flex_row_btw, { marginBottom: 15 }]}
                >
                  <Text style={styles.title}>Add Your {categoryName}</Text>

                  {processing ? (
                    <View style={styles.doneButton}>
                      <ActivityIndicator size="small" color={"#FFF"} />
                    </View>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={handleSave}
                      style={styles.doneButton}
                      disabled={processing || loadingUserDetails}
                    >
                      <FontAwesome6
                        name="check"
                        color={"#FFF"}
                        style={styles.doneText}
                      />
                    </TouchableOpacity>
                  )}
                </SafeAreaView>

                {/* Date */}
                <DateAndTimePicker date={date} handleConfirm={handleConfirm} />

                {/* Amount */}
                <SafeAreaView style={styles.flex_row}>
                  <TextInput
                    style={[
                      styles.inputField,
                      { backgroundColor: inputBg, color: textColor, flex: 1 },
                    ]}
                    placeholder="Amount"
                    keyboardType="numeric"
                    placeholderTextColor={placeholderColor}
                    value={amount !== undefined ? amount.toString() : ""}
                    onChangeText={(text) => {
                      const numericValue =
                        parseInt(text.replace(/[^0-9]/g, ""), 10) || 0;
                      setAmount(numericValue);
                    }}
                  />

                  {(clickedTransCategory === "Borrowed" ||
                    clickedTransCategory === "Lend") &&
                    <SafeAreaView style={styles.flex_row}>
                      {["+", "-"].map((sign) => (
                        <TouchableOpacity
                          onPress={() => setStatus(sign)}
                          key={sign}
                          style={[styles.statusButton, {
                            borderColor: status == "+" ? sign == "+" ? "#FFF" : textColor : sign == "-" ? "#FFF" : textColor,
                            backgroundColor: status == "+" ? sign == "+" ? "#4FB92D" : "transparent" : sign == "-" ? "#DE0B24" : "transparent",
                          }]}
                        >
                          <Text>
                            <FontAwesome6
                              name={sign == "+" ? "arrow-down" : "arrow-up"}
                              color={status == "+" ? sign == "+" ? "#FFF" : textColor : sign == "-" ? "#FFF" : textColor}
                              size={14}
                            />
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </SafeAreaView>
                  }
                </SafeAreaView>

                {/* Category */}
                <CategoryPicker
                  category={category}
                  setCategory={setCategory}
                  filteredCategories={filteredCategories}
                  clickedTransCategory={clickedTransCategory}
                />

                {(clickedTransCategory === "Borrowed" ||
                  clickedTransCategory === "Lend") && (
                    <>
                      <PersonPicker
                        person={person}
                        setPerson={setPerson}
                        peopleList={peopleList}
                      />

                      <SafeAreaView style={{ marginBottom: 12, marginHorizontal: 10 }}>
                        <Text numberOfLines={1}>{formatAmount(amount ? amount : 0, currencyObj)} {status == "+" ? `Received from ${person?.name}` : `Transfered to ${person?.name}`} </Text>
                      </SafeAreaView>
                    </>
                  )}

                {/* Note */}
                <SafeAreaView style={styles.flex_row_center_btw}>
                  <TextInput
                    style={[
                      styles.inputField,
                      {
                        flex: 1,
                        backgroundColor: inputBg,
                        color: textColor,
                        marginBottom: 0,
                      },
                    ]}
                    numberOfLines={1}
                    keyboardType="default"
                    placeholder="Note (Optional)"
                    placeholderTextColor={placeholderColor}
                    value={note}
                    onChangeText={(text) => setNote(text)}
                  />
                </SafeAreaView>

                <SafeAreaView>
                  {showError && (
                    <Text
                      style={{
                        color: "red",
                        fontSize: 14,
                        textAlign: "center",
                        marginTop: 15,
                      }}
                    >
                      {errorText}
                    </Text>
                  )}
                </SafeAreaView>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

export default AddTransaction;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingVertical: 25,
    justifyContent: "center",
    backgroundColor: "rgba(29, 29, 29, 0.4)",
  },
  modalContent: {
    width: "100%",
    paddingHorizontal: 15,
    alignItems: "center",
  },
  animatedView: {
    minWidth: "100%",
    padding: 20,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: "#777",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
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
  flex_row: {
    gap: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  flex_row_btw: {
    gap: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  flex_row_center_btw: {
    gap: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    marginTop: 15,
    position: "relative",
  },
  removeButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 7,
    padding: 5,
    borderRadius: 5,
    backgroundColor: "#666666",
  },
  removeText: {
    fontWeight: 500,
    color: "#fff",
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
  statusButton: {
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 30,
    borderWidth: 1,
    // borderColor: "#FFF"
  },
});
