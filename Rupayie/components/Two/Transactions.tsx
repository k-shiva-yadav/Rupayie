import {
  Animated,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "../Themed";
import { SafeAreaView } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";

import { formatDate } from "@/utils/formatDateTimeSimple";
import { useTransactionsCategory } from "@/context/transCategory";
import { useUserData } from "@/context/user";
import { Easing } from "react-native";
import ReadTransaction from "@/components/Modals/ReadTransaction";
import { useTransactionFilter } from "@/context/filterTransByDate";
import { useTransactions } from "@/context/transactions";
import { TransactionCard } from "../TransactionCard";

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

const Transactions = () => {
  const colorScheme = useColorScheme();
  const { clickedTransCategory } = useTransactionsCategory();
  const { transactionsList, loadingUserDetails } = useUserData();
  const { transactionsFilter } = useTransactionFilter();
  const { processing } = useTransactions();

  const [transactions, setTransactions] =
    useState<Transaction[]>(transactionsList);
  const [clickedTransaction, setClickedTransaction] = useState<Transaction>();
  const [showClickedTransaction, setShowClickedTransaction] = useState(false);

  const loaderColor = colorScheme === "dark" ? "#2e2e2e" : "#e3e3e3";

  function handleTransView(transaction: Transaction) {
    setClickedTransaction(transaction);
    openModal();
  }

  const slideModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen

  const openModal = () => {
    setShowClickedTransaction(true);

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
      setShowClickedTransaction(false);
    });
  };

  useEffect(() => {
    const filteredTransactions = transactionsList
      ?.filter(({ category }: any) => category.type === clickedTransCategory)
      .filter(({ createdAt }: any) => {
        const createdAtDate = new Date(createdAt);
        const fromDate = new Date(transactionsFilter.from);
        const toDate = new Date(transactionsFilter.to);

        return createdAtDate >= fromDate && createdAtDate <= toDate;
      });

    setTransactions(filteredTransactions);
  }, [clickedTransCategory, transactionsList, transactionsFilter]);

  return (
    <>
      <View style={styles.container}>
        {!loadingUserDetails ? (
          <SafeAreaView style={styles.transactionContainer}>
            {transactions?.length > 0 ? (
              transactions.map((transaction: Transaction, index: number) => {
                const {
                  _id,
                  amount,
                  category,
                  note,
                  createdAt,
                  pushedIntoTransactions,
                  image,
                  people,
                } = transaction;

                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleTransView(transaction)}
                    key={index}
                  >
                    <TransactionCard
                      _id={_id}
                      amount={amount}
                      category={category}
                      note={note}
                      createdAt={createdAt}
                      pushedIntoTransactions={pushedIntoTransactions}
                      image={image}
                      people={people}
                    />
                  </TouchableOpacity>
                );
              })
            ) : (
              <>
                <Text
                  style={{
                    marginTop: 30,
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  No Record
                </Text>

                <Text
                  style={{
                    marginVertical: 10,
                    textAlign: "center",
                  }}>
                  {transactionsFilter.title === "Custom Range" ?
                    `For Range: ${formatDate(transactionsFilter.from)} - ${formatDate(transactionsFilter.to)}`
                    :
                    transactionsFilter.title
                  }
                </Text>

                <Text style={{
                  textAlign: "center",
                  fontStyle: "italic",
                  lineHeight: 22
                }}>
                  Add a new transaction by pressing
                  {"\n"}
                  on the
                  <Text style={{ color: "#4FB92D" }}>
                    {" green "}
                  </Text>
                  colored
                  {"\n"}
                  plus button on the right bottom.
                </Text>
              </>
            )}
          </SafeAreaView>
        ) : (
          <Skeleton loaderColor={loaderColor} />
        )}
      </View>

      {showClickedTransaction && clickedTransaction && (
        <ReadTransaction
          isVisible={showClickedTransaction}
          slideModalAnim={slideModalAnim}
          handleCloseModal={handleCloseModal}
          transaction={clickedTransaction}
        />
      )}
    </>
  );
};

export const Skeleton = ({ loaderColor }: { loaderColor: string }) => {
  return (
    <SafeAreaView style={{ marginTop: 0 }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <View
          key={index}
          style={[styles.cardSkeleton, { backgroundColor: loaderColor }]}
        ></View>
      ))}
    </SafeAreaView>
  )
}

export default Transactions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    marginBottom: 30,
  },
  transactionContainer: {
    gap: 10,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "transparent",
    marginTop: 0
  },
  heading: {
    fontWeight: 600,
    fontSize: 18,
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
