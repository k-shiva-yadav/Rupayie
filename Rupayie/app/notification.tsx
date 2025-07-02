import {
  Alert,
  Animated,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
import { Text, View } from "@/components/Themed";
import { ScrollView } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import { useUserData } from "@/context/user";
import { formatAmount } from "@/utils/formatAmount";
import { Ionicons } from "@expo/vector-icons";
import { Easing } from "react-native";
import { useNotifications } from "@/context/notification";
import { useMessages } from "@/context/messages";
import MessagePopUp from "@/components/MessagePopUp";
import ReadNotification from "@/components/Modals/ReadNotification";

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

interface Notification {
  _id: string;
  header: string;
  read: boolean;
  transaction: Transaction;
  type: string;
}

const Notification = () => {
  const { notificationsList, fetchUserDetails } = useUserData();
  const { setNotificationRead, deleteAllNotifications, cleaning, deleteMultipleNotifications } = useNotifications();
  const { error, setError, messageText, setMessageText } = useMessages()

  const colorScheme = useColorScheme();
  const bgCOlor = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";

  const [showTransaction, setShowTransaction] = useState<boolean>(false);
  const [modalTransaction, setModalTransaction] = useState<Notification>(
    notificationsList[0]
  );

  const [selectMode, setSelectMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const slideModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen

  async function handleModalOpen(notify: Notification) {
    try {
      setModalTransaction(notify);
      openModal();

      markNotificationRead(notify);
    } catch (error) {
      console.log("Failed to Set Read");
    }
  }

  async function markNotificationRead(txn: Notification) {
    if (!txn.read) {
      await setNotificationRead(txn._id, {
        ...txn.transaction,
        read: true,
      });

      // refetch
      await fetchUserDetails();
    }
  }
  async function handleDeletePress() {
    try {
      await deleteAllNotifications();

      // refetch
      await fetchUserDetails();
      setMessageText("Cleared Notifications :)")
    } catch (error) {
      setError("Failed Cleaning Notifications :(")
    }
  }

  async function handleSelectedNotificationsDelete() {
    try {
      await deleteMultipleNotifications(selectedNotifications);
      await fetchUserDetails();

      setMessageText("Selected notifications deleted :)");
      setSelectMode(false);
      setSelectedNotifications([]);
    } catch (error) {
      setError("Failed Cleaning Notifications :(");
    }
  }

  const openModal = () => {
    setShowTransaction(true);

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
      setShowTransaction(false);
    });
  };

  function handleDeleteButtonPress() {
    if (selectMode) {
      handleSelectedNotificationsDelete()
    } else {
      handleDeletePress();
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nid) => nid !== id) : [...prev, id]
    );
  };

  function handleCardPress(not: Notification) {
    try {
      if (selectMode) {
        toggleSelection(not._id);
      } else {
        handleModalOpen(not);
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  function handleOnLongPress(not: Notification) {
    try {
      setSelectMode(true);
      toggleSelection(not._id);
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  return (
    <View style={{ minHeight: "100%", flex: 1, position: 'relative' }}>
      <ScrollView style={{ flex: 1, }}>
        <View style={[styles.conatiner, { backgroundColor: bgCOlor, paddingBottom: 70 }]}>
          {notificationsList.length > 0 ? (
            notificationsList.map((not: Notification, index: number) => (
              <TouchableOpacity
                onLongPress={() => handleOnLongPress(not)}
                onPress={() => handleCardPress(not)}
                activeOpacity={0.7}
                key={index}
              >
                <NotificationCard
                  notification={not}
                  isSelected={selectedNotifications.includes(not._id)}
                  selectMode={selectMode}
                  onSelect={() => toggleSelection(not._id)}
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text
              style={{
                textAlign: "center",
                marginTop: 20,
                fontStyle: "italic",
              }}
            >
              No Notifications
            </Text>
          )}
        </View>
      </ScrollView>

      {notificationsList.length > 0 &&
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleDeleteButtonPress}
          style={{ position: "absolute", bottom: 0, width: "100%", padding: 12, backgroundColor: "#FFF" }}
        >
          <Text style={{ textAlign: "center", fontWeight: 500, color: "#000" }}>
            {cleaning ? "Processing..." : selectMode ? "Delete Selected" : "Clear Notifications"}
          </Text>
        </TouchableOpacity>
      }

      <MessagePopUp
        error={error}
        messageText={messageText}
        setError={setError}
        setMessageText={setMessageText}
      />

      {showTransaction && (
        <ReadNotification
          visible={showTransaction}
          slideModalAnim={slideModalAnim}
          handleCloseModal={handleCloseModal}
          notification={modalTransaction}
        />
      )}
    </View>
  );
};

const NotificationCard = ({ notification, selectMode, onSelect, isSelected }: { notification: Notification; selectMode: boolean; isSelected: boolean; onSelect: () => void }) => {
  const { currencyObj } = useUserData();

  return (
    <View style={styles.notificationCard}>
      <SafeAreaView style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>

        {selectMode && (
          <TouchableOpacity onPress={onSelect}>
            {/* <View style={{
              width: 25,
              height: 25,
              marginRight: 10,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: '#000',
              backgroundColor: isSelected ? '#4CAF50' : '#FFF',
            }} /> */}
            <Ionicons
              name={isSelected ? "checkbox" : "square-outline"}
              size={25}
              color={isSelected ? '#4CAF50' : '#FFF'}
              style={{
                marginRight: 10,
              }}
            />
          </TouchableOpacity>
        )}

        <SafeAreaView style={{ flex: 1 }}>
          <Text
            style={{
              marginBottom: 7,
              fontSize: 16,
              fontWeight: notification.read ? 400 : 600,
            }}
          >
            {notification.header}
          </Text>

          <SafeAreaView style={styles.flex_row_btw}>
            <SafeAreaView style={[styles.headerBox, { maxWidth: "50%" }]}>
              <View
                style={[
                  styles.categoryCircle,
                  { backgroundColor: notification.transaction.category.hexColor },
                ]}
              ></View>
              <Text numberOfLines={1} style={{ fontWeight: notification.read ? 400 : 600 }}>
                {notification.transaction.category.name}
              </Text>
            </SafeAreaView>

            <Text
              style={[styles.header, { fontWeight: notification.read ? 400 : 600 }]}
            >
              {formatAmount(notification.transaction.amount, currencyObj)}
              {notification.transaction.category.sign === "+" ? (
                <Ionicons name="arrow-down" size={14} />
              ) : (
                <Ionicons name="arrow-up" size={14} />
              )}
            </Text>
          </SafeAreaView>
        </SafeAreaView>
      </SafeAreaView>
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  conatiner: {
    flex: 1,
    minHeight: "100%",
    padding: 15,
    display: "flex",
    gap: 8,
  },
  header: {
    fontSize: 16,
  },
  categoryCircle: {
    width: 15,
    height: 15,
    borderRadius: 30,
  },
  flex_row_btw: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBox: {
    borderRadius: 30,
    gap: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  notificationCard: {
    borderRadius: 10,
    padding: 15,
  },
});
