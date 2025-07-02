import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "@/components/Themed";
import { TouchableOpacity } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import { FontAwesome6 } from "@expo/vector-icons";

import { useTrash } from "@/context/trash";
import { useUserData } from "@/context/user";
import formatDateTimeSimple from "@/utils/formatDateTimeSimple";
import { formatAmount } from "@/utils/formatAmount";
import ReadTrash from "@/components/Modals/ReadTrash";
import ToggleSwitch from "@/components/ToggleSwitch";
import { useNavigation } from "expo-router";
import calculateDaysFrom from "@/utils/calculateDateFrom";
import { useMessages } from "@/context/messages";
import MessagePopUp from "@/components/MessagePopUp";

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
  deletedAt: Date;
}

const trash = () => {
  const { trashTransactions, fetchUserDetails, autoCleanTrash } = useUserData();
  const { emptyTrash, isTrashCleaning, autoCleanTrashAfterWeek } = useTrash();
  const { error, setError, messageText, setMessageText } = useMessages()

  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const bgColor = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
  const oppBgColor = colorScheme === "dark" ? "#000" : "#FFF";
  const textColor = colorScheme === "dark" ? "#fff" : "#000";

  const [toggleDeleteOlderthan7days, setToggleDeleteOlderthan7days] =
    useState(autoCleanTrash);

  const [showReadModal, setShowReadModal] = useState(false);
  const [showClickedReadModal, setClickedShowReadModal] = useState<Transaction>(
    trashTransactions[0]
  );
  const [refresh, setRefresh] = useState(false);

  const slideModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen

  const handleOpenModal = (trans: Transaction) => {
    setClickedShowReadModal(trans);
    openModal();
  };

  const handleEmptyTrash = () => {
    emptyTrash();
    fetchUserDetails();
  };

  async function refreshPage() {
    setRefresh(true);

    try {
      console.log("Fetching on Reload");

      await fetchUserDetails();
      setMessageText("Sucessfully Refreshed")
    } catch (error) {
      console.error("Error Refreshing: ", error);
      setError("Something Went Wrong!")
    } finally {
      setRefresh(false);
    }
  }

  const openModal = () => {
    setShowReadModal(true);

    setTimeout(() => {
      Animated.timing(slideModalAnim, {
        toValue: 0, // Slide up
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 100);
  };

  const handleCloseModal = () => {
    Animated.timing(slideModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowReadModal(false);
    });
  };

  async function handleSwitchAutoDeleteOlderThanWeek(flag: boolean) {
    setToggleDeleteOlderthan7days(flag);
    await autoCleanTrashAfterWeek(flag);
    await fetchUserDetails();
  }

  return (
    <>
      <SafeAreaView
        style={[
          styles.flex_row_btw,
          { backgroundColor: oppBgColor, padding: 15 },
        ]}
      >
        <Text style={{ width: "85%" }}>
          Automatically delete the trash transactions that have been in Trash
          for more tha 7 days
        </Text>
        <ToggleSwitch
          isOn={toggleDeleteOlderthan7days}
          setIsOn={handleSwitchAutoDeleteOlderThanWeek}
        />
      </SafeAreaView>

      <MessagePopUp
        error={error}
        messageText={messageText}
        setError={setError}
        setMessageText={setMessageText}
      />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refresh}
            onRefresh={() => refreshPage()}
            colors={["#000"]}
          />
        }
        style={[styles.conatiner, { backgroundColor: bgColor }]}
      >
        {isTrashCleaning && (
          <Text style={{ textAlign: "center", fontSize: 18, marginBottom: 10 }}>
            Deleting... <ActivityIndicator size={16} color={textColor} />
          </Text>
        )}

        <SafeAreaView
          style={{
            display: "flex",
            gap: 10,
            height: "100%",
            marginBottom: 100,
          }}
        >
          {trashTransactions.length > 0 ? (
            trashTransactions.map((trans: Transaction, index: number) => {
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  onPress={() => handleOpenModal(trans)}
                >
                  <TransactionCard
                    transaction={trans}
                    toggleDeleteOlderthan7days={toggleDeleteOlderthan7days}
                  />
                </TouchableOpacity>
              );
            })
          ) : (
            <SafeAreaView>
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 40,
                }}
              >
                <FontAwesome6 name="trash-can" size={40} color={textColor} />
              </Text>
              <Text
                style={{
                  marginTop: 20,
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                No Trash!
              </Text>
            </SafeAreaView>
          )}
        </SafeAreaView>
      </ScrollView>

      {trashTransactions.length > 0 &&
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleEmptyTrash}
          disabled={isTrashCleaning}
          style={{ position: "absolute", bottom: 0, width: "100%", padding: 12, backgroundColor: "#FFF" }}
        >
          <Text style={{ textAlign: "center", fontWeight: 500, color: "#000" }}>
            {isTrashCleaning ? "Cleaning..." : "Clear Trash"}
          </Text>
        </TouchableOpacity>
      }

      {showReadModal && (
        <ReadTrash
          visible={showReadModal}
          slideModalAnim={slideModalAnim}
          handleCloseModal={handleCloseModal}
          transaction={showClickedReadModal}
        />
      )}
    </>
  );
};

const TransactionCard = ({
  transaction,
  toggleDeleteOlderthan7days,
}: {
  transaction: Transaction;
  toggleDeleteOlderthan7days: boolean;
}) => {
  const {
    _id,
    amount,
    category,
    note,
    createdAt,
    pushedIntoTransactions,
    image,
    people,
    deletedAt,
  } = transaction;

  const { currencyObj } = useUserData();
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#FFF" : "#000";
  const lightText = colorScheme == "dark" ? "#D9D9D9" : "#5C5C5C";
  const textColor = colorScheme == "dark" ? "#FFF" : "#000";

  const isRecurring =
    (pushedIntoTransactions == false || pushedIntoTransactions == true) &&
    pushedIntoTransactions !== undefined;

  return (
    <View style={styles.transactionsCard}>
      <SafeAreaView style={styles.flex_row_end_btw}>
        {/* Category */}
        <SafeAreaView style={[styles.flex_row, { maxWidth: "60%" }]}>
          <View
            style={[
              styles.categoryCircle,
              { backgroundColor: category.hexColor },
            ]}
          ></View>

          <Text style={styles.text} numberOfLines={1}>{category.name}</Text>
        </SafeAreaView>

        {/* Amount */}
        <Text style={styles.text}>{formatAmount(amount, currencyObj)}</Text>
      </SafeAreaView>

      <SafeAreaView
        style={[
          styles.flex_row_end_btw,
          { paddingBottom: isRecurring ? 7 : 12, marginTop: 7 },
        ]}
      >
        {/* Note */}
        <SafeAreaView style={{ width: "45%" }}>
          {deletedAt && (
            <Text numberOfLines={1} style={styles.smallText}>
              {formatDateTimeSimple(createdAt)}
            </Text>
          )}
        </SafeAreaView>

        {/* Date */}
        {toggleDeleteOlderthan7days && deletedAt && (
          <Text
            style={[
              styles.createdAtText,
              { color: calculateDaysFrom(deletedAt) <= 1 ? "red" : textColor },
            ]}
          >
            {calculateDaysFrom(deletedAt)}{" "}
            {calculateDaysFrom(deletedAt) > 1 ? "Days Left " : "Day Left "}
          </Text>
        )}
      </SafeAreaView>

      {/* Auto added */}
      {isRecurring && (
        <>
          <SafeAreaView
            style={[
              styles.flex_row,
              styles.recurring,
              { backgroundColor: `${category.hexColor}60` },
            ]}
          >
            <FontAwesome6
              name="repeat"
              size={12}
              style={{ color: iconColor }}
            />
            <Text style={[styles.smallItalicText, { color: lightText }]}>
              Auto added by recurring
            </Text>
          </SafeAreaView>
        </>
      )}
    </View>
  );
};

export default trash;

const styles = StyleSheet.create({
  conatiner: {
    flex: 1,
    padding: 15,
    height: "100%",
  },
  transactionContainer: {
    gap: 10,
    marginBottom: 15,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "transparent",
  },
  heading: {
    fontWeight: 600,
    fontSize: 18,
  },
  text: {
    fontSize: 16,
  },
  smallText: {
    fontSize: 12,
  },
  smallItalicText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  createdAtText: {
    fontSize: 12,
    textAlign: "right",
  },
  flex_row: {
    gap: 7,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  flex_row_btw: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flex_row_start_btw: {
    width: "100%",
    display: "flex",
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  flex_row_end_btw: {
    paddingHorizontal: 15,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "#4FB92D",
  },
  addText: {
    fontWeight: 500,
    color: "#FFF",
  },
  transactionsCard: {
    borderRadius: 10,
    paddingTop: 12,
    paddingBottom: 0,
  },
  recurring: {
    paddingVertical: 4,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  categoryCircle: {
    width: 15,
    height: 15,
    borderRadius: 20,
  },
  cardSkeleton: {
    height: 65,
    borderRadius: 10,
    width: "100%",
    marginBottom: 10,
  },
  image: {
    borderRadius: 5,
    width: "100%",
    height: 60,
    overflow: "hidden",
    objectFit: "cover",
    backgroundColor: "#666666",
  },
  imageContainer: {
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
});

const cleanButtonStyles = StyleSheet.create({
  button: {
    paddingVertical: 7,
    borderRadius: 30,
    paddingHorizontal: 15,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
});
