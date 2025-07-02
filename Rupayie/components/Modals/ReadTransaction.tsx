import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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
import { ScrollView } from "react-native";
import { useTransactions } from "@/context/transactions";
import { useAnalytics } from "@/context/analytics";
import PersonPicker from "../Pickers/PersonPicker";
import { useMessages } from "@/context/messages";
import { formatAmount } from "@/utils/formatAmount";

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
}

interface Category {
  name: string;
  hexColor: string;
  _id: any;
  type: string;
  sign: string;
}

const ReadTransaction = ({
  isVisible,
  slideModalAnim,
  handleCloseModal,
  transaction,
}: {
  isVisible: boolean;
  slideModalAnim: any;
  handleCloseModal: any;
  transaction: Transaction;
}) => {
  const colorScheme = useColorScheme();
  const { fetchAnalytics } = useAnalytics();
  const { categoriesList, peopleList, fetchUserDetails, loadingUserDetails, currencyObj } = useUserData();
  const { clickedTransCategory } = useTransactionsCategory();
  const { deleteTransaction, saveEditedTransaction, processing, processingDelete, } = useTransactions();
  const { setError, setMessageText } = useMessages()

  const filteredCategories = categoriesList.filter(
    (cat: Category) => cat.type === clickedTransCategory
  );

  const [amount, setAmount] = useState<number | null>(transaction?.amount);
  const [note, setNote] = useState<string>(transaction?.note || "");
  const [category, setCategory] = useState(transaction?.category);
  const [people, setPeople] = useState(transaction?.people);
  const [categorySign, setCategorySign] = useState(transaction?.category.sign);

  const [date, setDate] = useState(new Date(transaction?.createdAt));

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
    setAmount(null);
    setNote("");
    setCategory(categoriesList[0]);
    setCategorySign(categoriesList[0].sign);
    setDate(new Date());

    // delete image
    // setImageURI(null);
    // setLocalImage(null);
  }

  const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
  };

  // function handleDeleteImage() {
  //   setLocalImage(null);
  //   setImageURI(null);
  //   setImageRemoved(true);
  // }

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

  function noChangesDone() {
    if (
      amount === transaction.amount &&
      note === transaction.note &&
      category.sign === categorySign &&
      new Date(date).toISOString() ===
      new Date(transaction.createdAt).toISOString() &&
      JSON.stringify(people) === JSON.stringify(transaction.people) &&
      JSON.stringify(category) === JSON.stringify(transaction.category)
    )
      return true;

    return false;
  }

  async function handleSave() {
    try {
      const flag = ValidateFields();
      if (!flag) return;

      const values = {
        amount,
        note,
        createdAt: transaction.createdAt,
        editedCreatedAt: date,
        ...(clickedTransCategory === "Borrowed" ||
          clickedTransCategory === "Lend"
          ? {
            people,
            category: { ...category, sign: categorySign }
          }
          : { category }),
        pushedIntoTransactions: transaction?.pushedIntoTransactions,
      };

      if (noChangesDone()) {
        closeTheModal();
        return;
      }

      // Save transaction and refresh
      await saveEditedTransaction(transaction._id, values);
      await reFetchBoth();
      closeTheModal();

      setMessageText("Successfully Saved :)");
    } catch (error) {
      closeTheModal();
      console.log(error);

      setError("Failed to Save :(")
      // Alert.alert("Failed", "Failed to Save");
    }
  }

  async function handleDelete() {
    try {
      await deleteTransaction(transaction._id, transaction.createdAt);
      await reFetchBoth();

      closeTheModal();

      setMessageText("Successfully Moved to Trash :)");
      // setImageURI(null);
    } catch (error) {
      closeTheModal();

      setError("Failed to Trash :(")
      // Alert.alert("Failed", "Failed to Delete");
    }
  }

  async function reFetchBoth() {
    await fetchAnalytics();
    await fetchUserDetails();
  }

  useEffect(() => {
    setNote(transaction.note);
    // setImageURI(transaction.image);

    setAmount(transaction.amount);
    setCategory(transaction.category);
    setCategorySign(transaction.category.sign);
    setDate(new Date(transaction.createdAt));
    setPeople(transaction.people);
  }, []);

  return (
    <ScrollView style={{ flex: 1, position: "absolute" }}>
      <Modal visible={isVisible} transparent animationType="fade" onRequestClose={closeTheModal}>
        <Pressable
          style={styles.modalContainer}
          onPress={closeTheModal}
          disabled={
            processing || processingDelete
            // || imageUploading
          }
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
                  {processingDelete ? (
                    <View
                      style={[styles.doneButton, { backgroundColor: "red" }]}
                    >
                      <ActivityIndicator size="small" color={"#FFF"} />
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={handleDelete}
                      activeOpacity={0.5}
                      disabled={
                        processing || processingDelete || loadingUserDetails
                        //  || imageUploading
                      }
                      style={[styles.doneButton, { backgroundColor: "red" }]}
                    >
                      <FontAwesome6
                        name="trash"
                        color={"#FFF"}
                        style={styles.doneText}
                      />
                    </TouchableOpacity>
                  )}

                  <Text style={[styles.title, { maxWidth: "50%" }]} numberOfLines={1}>Your {categoryName}</Text>

                  {processing ? (
                    // || imageUploading
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
                      onPress={handleSave}
                      activeOpacity={0.5}
                      disabled={processing || processingDelete || loadingUserDetails}
                      style={[
                        styles.doneButton,
                        { backgroundColor: "#4FB92D", },
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
                    value={amount !== null ? amount.toString() : ""}
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
                          key={sign}
                          onPress={() => setCategorySign(sign)}
                          style={[styles.categorySignButton, {
                            marginTop: -10,
                            borderColor: categorySign == "+" ? sign == "+" ? "#FFF" : textColor : sign == "-" ? "#FFF" : textColor,
                            backgroundColor: categorySign == "+" ? sign == "+" ? "#4FB92D" : "transparent" : sign == "-" ? "#DE0B24" : "transparent",
                          }]}
                        >
                          <Text>
                            <FontAwesome6
                              name={sign == "+" ? "arrow-down" : "arrow-up"}
                              color={categorySign == "+" ? sign == "+" ? "#FFF" : textColor : sign == "-" ? "#FFF" : textColor}
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
                        person={people}
                        setPerson={setPeople}
                        peopleList={peopleList}
                      />

                      <SafeAreaView style={{ marginBottom: 12, marginHorizontal: 10 }}>
                        <Text numberOfLines={1}>{formatAmount(amount ? amount : 0, currencyObj)} {categorySign == "+" ? `was received from ${people?.name}` : `was transfered to ${people?.name}`} </Text>
                      </SafeAreaView>
                    </>
                  )}

                {/* Note */}
                <SafeAreaView style={styles.flex_row_btw}>
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

                  {/* Upload image */}
                  {/* <ImagePicker image={localImage} setImage={setLocalImage} /> */}
                </SafeAreaView>

                {/* {localImage && (
                  <SafeAreaView style={styles.imageContainer}>
                    <Image source={{ uri: localImage }} style={styles.image} />

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleDeleteImage}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                      <FontAwesome6 name="xmark" color={"#FFF"} size={16} />
                    </TouchableOpacity>
                  </SafeAreaView>
                )} */}

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

export default ReadTransaction;

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
    alignItems: "center",
    justifyContent: "center",
  },
  flex_row_btw: {
    gap: 5,
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
  categorySignButton: {
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 30,
    borderWidth: 1,
    // borderColor: "#FFF",
  },
});
