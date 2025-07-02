import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Text, View } from "../Themed";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/components/useColorScheme";
import { useUserData } from "@/context/user";
import { formatAmount } from "@/utils/formatAmount";

const NotificationsFlatList = () => {
  const { notificationsList, currencyObj, loadingUserDetails } = useUserData();
  const colorScheme = useColorScheme();
  const placeholderColor = colorScheme === "dark" ? "#3D3D3D" : "#c4c4c4";

  const [activeCircle, setActiveCircle] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const screenWidth = Dimensions.get("window").width - 30; // Both sides 15 pixels

  // Welcome text data
  const welcomeTexts = [
    {
      createdAt: "0",
      header: "Hey, Welcome! ✨",
      note: "Welcome to the app! Manage your finances with ease.",
    },
    {
      createdAt: "1",
      header: "Simplify Your Tracking 📈",
      note: "Start reducing the time you spend noting all transactions in a book.",
    },
    {
      createdAt: "2",
      header: "Visual Insights 👀",
      note: "See the graphs with your income and spending colors for better clarity.",
    },
  ];

  // Limit the notifications to 7
  const notificationsToDisplay = notificationsList.slice(0, 7);

  const dataToShow =
    notificationsToDisplay.length > 0 ? notificationsToDisplay : welcomeTexts;

  useEffect(() => {
    if (notificationsToDisplay.length > 1) {
      const interval = setInterval(() => {
        setActiveCircle((prev) => {
          const nextIndex = (prev + 1) % notificationsToDisplay.length;
          flatListRef.current?.scrollToIndex({
            animated: true,
            index: nextIndex,
            viewPosition: 0.5,
          });
          return nextIndex;
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [notificationsToDisplay, loadingUserDetails]);

  const handleCirclePress = (index: number) => {
    setActiveCircle(index);
    flatListRef.current?.scrollToIndex({
      animated: true,
      index,
      viewPosition: 0.5
    });
  };

  const handleScrollEnd = (event: any) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / screenWidth
    );
    setActiveCircle(index);

    // Ensure the item snaps into the center
    flatListRef.current?.scrollToIndex({
      animated: true,
      index,
      viewPosition: 0.5,
    });
  };

  const renderNotificationItem = ({
    item,
  }: {
    item: (typeof notificationsToDisplay)[0];
  }) => (
    <View style={[styles.notificationCard, { width: screenWidth }]}>
      <View style={styles.flex_row_btw}>
        <SafeAreaView style={styles.flex_row}>
          <View
            style={[
              styles.categoryIndicator,
              { backgroundColor: item.transaction.category.hexColor },
            ]}
          />

          <Text style={styles.notificationHeader}>
            {item.transaction.category.name}
          </Text>
        </SafeAreaView>

        <Text style={styles.notificationAmount}>
          {formatAmount(item.transaction.amount, currencyObj)}
          {item.transaction.category.sign === "+" ? (
            <Ionicons name="arrow-down" size={14} />
          ) : (
            <Ionicons name="arrow-up" size={14} />
          )}
        </Text>
      </View>

      <Text style={styles.notificationNote}>{item.header}</Text>
    </View>
  );

  const renderWelcomeItem = ({ item }: { item: (typeof welcomeTexts)[0] }) => (
    <View style={[styles.notificationCard, { width: screenWidth }]}>
      <Text style={styles.notificationHeader}>{item.header}</Text>
      <Text style={styles.notificationNote}>{item.note}</Text>
    </View>
  );

  const renderSkeleton = () => (
    <View
      style={{
        height: 80,
        width: screenWidth,
        borderRadius: 10,
        backgroundColor: placeholderColor,
      }}
    />
  );

  const randomNumber = () => {
    return Math.random() * 10000;
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={dataToShow}
        keyExtractor={() => `item-${randomNumber()}-${Date.now()}`}
        renderItem={
          !loadingUserDetails
            ? notificationsToDisplay.length > 0
              ? renderNotificationItem
              : renderWelcomeItem
            : renderSkeleton
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        // onMomentumScrollEnd={(event) => {
        //   const index = Math.round(
        //     event.nativeEvent.contentOffset.x / screenWidth
        //   );
        //   setActiveCircle(index);
        // }}
        snapToAlignment="center"
        pagingEnabled
        onMomentumScrollEnd={handleScrollEnd}
      />

      {/* Circle Indicators */}
      <SafeAreaView style={[styles.flex_row, { marginTop: 15 }]}>
        {!loadingUserDetails && dataToShow.length > 0 ?
          dataToShow.map((_: any, index: number) => (
            <Pressable key={index} onPress={() => handleCirclePress(index)}>
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor:
                      activeCircle === index
                        ? "#4588DF"
                        : colorScheme == "dark"
                          ? "#3b3b3b"
                          : "#c2c2c2",
                  },
                ]}
              />
            </Pressable>
          ))
          : Array.from({ length: 3 }).map((_, index) => (
            <View
              key={index}
              style={[styles.circle, { backgroundColor: placeholderColor }]}
            ></View>
          ))}
      </SafeAreaView>
    </View>
  );
};

export default NotificationsFlatList;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  notificationCard: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#4588DF",
  },
  notificationHeader: {
    fontWeight: "600",
    fontSize: 16,
    color: "#fff",
  },
  notificationNote: {
    fontSize: 14,
    color: "#fff",
    marginTop: 5,
    fontWeight: 400,
  },
  flex_row: {
    gap: 7,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  flex_row_btw: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  categoryIndicator: {
    width: 15,
    height: 15,
    borderRadius: 20,
  },
  notificationAmount: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "500",
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: 10,
  },
});
