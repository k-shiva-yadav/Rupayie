import {
  Animated,
  Easing,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "@/components/Themed";
import { CategorySelector } from "@/components/Two/SelectCategory";
import { useUserData } from "@/context/user";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/components/useColorScheme";

import AddRecurring from "@/components/Modals/AddRecurring";
import { formatAmount } from "@/utils/formatAmount";
import formatDateTimeSimple from "@/utils/formatDateTimeSimple";
import ReadRecurring from "@/components/Modals/ReadRecurring";
import intervalName from "@/constants/intervalName";
import moment from "moment";
import { useMessages } from "@/context/messages";
import MessagePopUp from "@/components/MessagePopUp";

interface Recurring {
  amount: number;
  note: string;
  image: string | null;
  
  _id: any;
  createdAt: Date;
  category: any;
  pushedIntoTransactions: boolean;
  people: {
    name: string;
    relation: string;
    _id: string;
    contact: number;
  };
  recuring: {
    count: number;
    pushedCount: number;
    interval: string;
    when: any;
  };
}

const Recurrings = () => {
  const { recurringTransactions } = useUserData();
  const { error, setError, messageText, setMessageText } = useMessages()

  const colorScheme = useColorScheme();
  const recurringBg = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";

  const slideAddModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen
  const slideEditModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen

  const [catName, setCatName] = useState("Spent");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [clickedRecurring, setClickedRecurring] = useState<Recurring>(
    recurringTransactions[0]
  );
  const [transactions, setTransactions] = useState(recurringTransactions);

  function switchRecurring(name: string) {
    setCatName(name);
  }

  const openAddRecurringModal = () => {
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

  const openEditRecurringModal = () => {
    setShowEditModal(true);

    setTimeout(() => {
      Animated.timing(slideEditModalAnim, {
        toValue: 0, // Slide up
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 100);
  };

  const handleCloseEditModal = () => {
    Animated.timing(slideEditModalAnim, {
      toValue: 700, // Move back down off-screen
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowEditModal(false);
    });
  };

  function handleOpenEditRecurring(category: Recurring) {
    setClickedRecurring(category);
    openEditRecurringModal();
  }

  useEffect(() => {
    setTransactions(
      recurringTransactions?.filter(
        ({ category }: any) => category.type == catName
      )
    );
  }, [catName, recurringTransactions]);

  // useEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => (
  //       <TouchableOpacity activeOpacity={0.5} onPress={openAddRecurringModal}>
  //         <Ionicons name="add-circle" size={30} color="#4FB92D" />
  //       </TouchableOpacity>
  //     ),
  //   });
  // }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: recurringBg }]}>
      <MessagePopUp
        error={error}
        messageText={messageText}
        setError={setError}
        setMessageText={setMessageText}
      />

      <View
        style={{ padding: 20, borderRadius: 20, margin: 15, marginBottom: 0 }}
      >
        <CategorySelector
          setClickedCategory={switchRecurring}
          clickedCategory={catName}
        />
      </View>

      <ScrollView style={styles.transactionContainer}>
        {transactions.length > 0 ? (
          transactions
            .filter(
              (recurring: Recurring) => recurring.category.type === catName
            )
            .map((recurring: Recurring) => {
              const {
                _id,
                amount,
                category,
                note,
                createdAt,
                pushedIntoTransactions,
                image,
                people,
                recuring,
              } = recurring;

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleOpenEditRecurring(recurring)}
                  key={_id}
                >
                  <RecurringTransCard
                    key={_id}
                    _id={_id}
                    amount={amount}
                    category={category}
                    note={note}
                    createdAt={createdAt}
                    pushedIntoTransactions={pushedIntoTransactions}
                    image={image}
                    people={people}
                    // recurring
                    count={recuring.count}
                    when={recuring.when}
                    pushedCount={recuring.pushedCount}
                    interval={recuring.interval}
                    intervalName={intervalName}
                  />
                </TouchableOpacity>
              );
            })
        ) : (
          <>
            <Text
              style={{
                marginVertical: 20,
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              No Record
            </Text>
            <Text style={{
              textAlign: "center",
              fontStyle: "italic",
              lineHeight: 22
            }}>
              Add by pressing on the
              <Text style={{ color: "#4FB92D" }}>
                {" green "}
              </Text>
              colored
              {"\n"}
              plus button on the right bottom.
            </Text>
          </>
        )}
      </ScrollView>

      <SafeAreaView
        style={{ position: "absolute", bottom: 20, right: 20, zIndex: 10 }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openAddRecurringModal}
          style={[styles.smallBox, { backgroundColor: "#4FB92D" }]}
        >
          <Ionicons name="add-circle" size={20} color={"#FFF"} />
          <Text style={[styles.addText, { color: "#FFF" }]}>Add Recurring</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {showAddModal && (
        <AddRecurring
          visible={showAddModal}
          slideModalAnim={slideAddModalAnim}
          handleCloseModal={handleCloseAddModal}
          clickedCategory={catName}
        />
      )}

      {showEditModal && (
        <ReadRecurring
          visible={showEditModal}
          slideModalAnim={slideEditModalAnim}
          handleCloseModal={handleCloseEditModal}
          recurringTrans={clickedRecurring}
          clickedCategory={catName}
        />
      )}
    </View>
  );
};

const RecurringTransCard = ({
  count,
  when,
  pushedCount,
  interval,
  amount,
  category,
  people,
  note,
  createdAt,
  // _id,
  // pushedIntoTransactions,
  // image,
  intervalName,
}: any) => {
  const { currencyObj } = useUserData();

  const addDateSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return `${day}th`;
    // Handle exceptions like 11th, 12th, 13th
    switch (day % 10) {
      case 1:
        return `${day}st`;
      case 2:
        return `${day}nd`;
      case 3:
        return `${day}rd`;
      default:
        return `${day}th`;
    }
  };

  const intervalTime =
    interval === intervalName.everyDay
      ? when.everyDay
      : interval === intervalName.everyWeek
        ? moment().day(when.everyWeek).format("dddd")
        : interval === intervalName.everyMonth
          ? addDateSuffix(when.everyMonth)
          : interval === intervalName.everyYear
            ? `${when.everyYear.date} ${moment.months(when.everyYear.month)}`
            : "No Time";

  const middleText =
    interval === intervalName.everyDay
      ? "at"
      : interval === intervalName.everyWeek
        ? "on"
        : interval === intervalName.everyMonth
          ? "on"
          : interval === intervalName.everyYear
            ? "on"
            : "No Time";

  return (
    <View style={styles.transactionsCard}>
      <SafeAreaView style={styles.flex_row_end_btw}>
        {/* Category */}
        <SafeAreaView style={styles.flex_row}>
          <View
            style={[
              styles.categoryCircle,
              { backgroundColor: category.hexColor },
            ]}
          ></View>

          <Text style={styles.text}>{category.name}</Text>
        </SafeAreaView>

        {/* Amount */}
        <Text style={styles.text}>{formatAmount(amount, currencyObj)}</Text>
      </SafeAreaView>

      <SafeAreaView style={[styles.flex_row_end_btw, { marginTop: 7 }]}>
        {/* Note */}
        <SafeAreaView style={{ width: "60%" }}>
          <Text numberOfLines={1} style={styles.smallText}>
            {category.type === "Lend" || category.type === "Borrowed"
              ? people?.name
              : note}
          </Text>
        </SafeAreaView>

        {/* Date */}
        <Text style={styles.createdAtText}>
          {formatDateTimeSimple(createdAt)}
        </Text>
      </SafeAreaView>

      <SafeAreaView
        style={[
          styles.flex_row_end_btw,
          styles.recurringContainer,
          { backgroundColor: `${category.hexColor}60` },
        ]}
      >
        {/* Date */}
        <Text
          numberOfLines={1}
          style={{
            fontSize: 10,
            width: "70%",
          }}
        >
          {interval} {middleText} {intervalTime}
        </Text>

        {/* Repeat */}
        <SafeAreaView>
          <Text numberOfLines={1} style={styles.createdAtText}>
            {`${pushedCount}/${count} Repeated`}
          </Text>
        </SafeAreaView>
      </SafeAreaView>
    </View>
  );
};

export default Recurrings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    // padding: 15,
    // paddingBottom: 0,
    position: "relative",
  },
  smallBox: {
    borderRadius: 30,
    padding: 7,
    gap: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 14,
  },
  categoryCircle: {
    width: 20,
    height: 20,
    borderRadius: 30,
  },
  addText: {
    fontWeight: 500,
    fontSize: 16,
    marginRight: 5,
  },
  transactionContainer: {
    gap: 10,
    height: "100%",
    marginTop: 10,
    paddingHorizontal: 15,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "transparent",
  },
  transactionsCard: {
    borderRadius: 10,
    paddingTop: 12,
    // paddingBottom: 12,
    marginBottom: 10,
  },
  flex_row_end_btw: {
    paddingHorizontal: 15,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  flex_row: {
    gap: 7,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  smallText: {
    fontSize: 12,
  },
  smallItalicText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  createdAtText: {
    fontSize: 10,
    textAlign: "right",
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
    marginTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
  recurringContainer: {
    marginTop: 7,
    paddingVertical: 5,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
});
