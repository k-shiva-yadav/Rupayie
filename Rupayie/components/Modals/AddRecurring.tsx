import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Text, View } from "../Themed";
import { FontAwesome6 } from "@expo/vector-icons";
import { useUserData } from "@/context/user";
import CategoryPicker from "../Pickers/CategoryPicker";
import { useRecurringTransactions } from "@/context/recurringTransactions";
import { useAnalytics } from "@/context/analytics";
import { ScrollView } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import WhenPicker from "../Pickers/WhenPicker";
import CountPicker from "../Pickers/CountPicker";
import moment from "moment";
import PersonPicker from "../Pickers/PersonPicker";
import { useMessages } from "@/context/messages";
// import { useTransactionImage } from "@/context/image";
// import ImagePickerCompo from "../Pickers/ImagePicker";

interface Category {
  name: string;
  hexColor: string;
  _id: any;
  type: string;
  sign?: string;
}

interface People {
  name: string;
  relation: string;
  contact: number;
  _id: string;
}

interface When {
  everyDay: string;
  everyWeek: string;
  everyMonth: number;
  everyYear: {
    month: number;
    date: number;
  };
}

function paddingZero(number: number) {
  return number.toString().padStart(2, "0");
}

const AddRecurring = ({
  visible,
  handleCloseModal,
  slideModalAnim,
  clickedCategory,
}: {
  visible: boolean;
  handleCloseModal: () => void;
  slideModalAnim: any;
  clickedCategory: string;
}) => {
  const { fetchAnalytics } = useAnalytics();
  const { fetchUserDetails, categoriesList, peopleList, loadingUserDetails, userDetails } = useUserData();
  const { addNewRecurringTransaction, loadingRecurring } =
    useRecurringTransactions();
  const { setError, setMessageText } = useMessages()

  // const { deleteImage, uploadImage, imageUploading } = useTransactionImage();
  const filteredCategories = categoriesList.filter(
    (cat: Category) => cat.type === clickedCategory
  );

  const constWhen: When = {
    everyDay: "12:01 AM",
    everyWeek: moment().format("dddd"),
    everyMonth: new Date().getDate(),
    everyYear: {
      month: new Date().getMonth(),
      date: new Date().getDate(),
    },
  };

  const colorScheme = useColorScheme();
  const inputBg = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
  const textColor = colorScheme === "dark" ? "#FFF" : "#000";
  const placeholderColor = colorScheme === "dark" ? "#c2c2c2" : "#4d4d4d";

  const [count, setCount] = useState<number>(1);
  const [interval, setInterval] = useState<string>("Every month");
  const [when, setWhen] = useState<When>(constWhen);
  const [amount, setAmount] = useState<number | undefined>();
  const [note, setNote] = useState<string>("");
  const [category, setCategory] = useState<Category>(filteredCategories[0]);
  const [person, setPerson] = useState<People>(peopleList[0]);
  const [status, setStatus] = useState("-");

  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState("");

  const categoryName =
    clickedCategory === "Spent"
      ? "Expense"
      : clickedCategory === "Earned"
        ? "Earning"
        : clickedCategory === "Borrowed"
          ? "Loan"
          : "Lending";

  const userId = userDetails?.userId;

  function closeTheModal() {
    handleCloseModal();

    resetAllValues();
  }

  function resetAllValues() {
    setAmount(undefined);
    setNote("");
    setCategory(filteredCategories[0]);
    setStatus(clickedCategory == "Borrowed" ? "+" : "-");

    // delete imageURL
    // setImageURL(null);
    // setLocalImage(null);

    // error text
    setShowError(false);
    setErrorText("");
  }

  // function handleDeleteImage() {
  //   setLocalImage(null);
  // }

  function ValidateFields() {
    if (!amount) {
      setShowError(true);
      setErrorText("Enter Amount");
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

      // Ensure category has required fields
      let categoryToSend = category;
      if (category && (!category.sign || !category._id)) {
        categoryToSend = {
          ...category,
          sign: status,
          _id: category._id,
        };
      }

      // Only include person if it exists and is valid
      let personToSend = undefined;
      if ((clickedCategory === "Borrowed" || clickedCategory === "Lend") && person && person._id) {
        personToSend = person;
      }

      const values = {
        recuring: {
          count,
          interval,
          when,
          pushedCount: 0,
        },
        amount,
        note,
        createdAt: new Date(),
        category: categoryToSend,
        ...(personToSend ? { people: personToSend } : {}),
        pushedIntoTransactions: false,
      };

      await addNewRecurringTransaction(values, userId);
      await reFetchBoth();
      // Close modal
      closeTheModal();

      setMessageText("Successfully Added :)")
    } catch (error) {
      // Show error to user
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
  }, [clickedCategory]);

  useEffect(() => {
    setStatus(clickedCategory == "Borrowed" ? "+" : "-");
  }, [clickedCategory]);

  useEffect(() => {
    setShowError(false);
  }, [amount, note]);

  // useEffect(() => {
  //   console.log(status);
  // }, [status]);

  return (
    <ScrollView style={{ flex: 1 }}>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={closeTheModal}>
        <Pressable
          style={styles.modalContainer}
          onPress={closeTheModal}
          disabled={
            loadingRecurring
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
                <SafeAreaView
                  style={[styles.flex_row_btw, { marginBottom: 15 }]}
                >
                  <Text style={styles.title}>Add {categoryName} Recurring</Text>

                  {loadingRecurring ? (
                    <View style={styles.doneButton}>
                      <ActivityIndicator size="small" color={"#FFF"} />
                    </View>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={handleSave}
                      style={styles.doneButton}
                      disabled={loadingRecurring || loadingUserDetails}
                    >
                      <FontAwesome6
                        name="check"
                        color={"#FFF"}
                        style={styles.doneText}
                      />
                    </TouchableOpacity>
                  )}
                </SafeAreaView>

                {/* Category */}
                <CategoryPicker
                  category={category}
                  setCategory={setCategory}
                  filteredCategories={filteredCategories}
                  clickedTransCategory={clickedCategory}
                />

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

                  {(clickedCategory === "Borrowed" ||
                    clickedCategory === "Lend") &&
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

                {(clickedCategory === "Borrowed" ||
                  clickedCategory === "Lend") && (
                    <>
                      <PersonPicker
                        person={person}
                        setPerson={setPerson}
                        peopleList={peopleList}
                      />
                    </>
                  )}

                {/* Recurrin when */}
                <WhenPicker
                  interval={interval}
                  setInterval={setInterval}
                  when={when}
                  setWhen={setWhen}
                  constWhen={constWhen}
                />

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

                  {/* Count Picker */}
                  <CountPicker count={count} setCount={setCount} />      
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

export default AddRecurring;

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
  flex_row: {
    gap: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  statusButton: {
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 30,
    borderWidth: 1,
    // borderColor: "#FFF"
  },
});
