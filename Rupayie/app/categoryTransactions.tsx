import { Animated, Easing, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Text, View } from '@/components/Themed'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useUserData } from '@/context/user'
import { useColorScheme } from "@/components/useColorScheme";
import ReadTransaction from '@/components/Modals/ReadTransaction'
import { formatAmount } from '@/utils/formatAmount'
import { useTransactionsCategory } from '@/context/transCategory'
import { useTransactionFilter } from '@/context/filterTransByDate'
import { TransactionCard } from '@/components/TransactionCard'

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

const categoryTransactions = () => {
    const navigation = useNavigation()
    const route = useLocalSearchParams();

    const clickedCategory = typeof route.category === "string"
        ? JSON.parse(route.category)
        : route.clickedBudget;

    const colorScheme = useColorScheme();

    const { donutCategory, setClickedTransCategory } = useTransactionsCategory();
    const { loadingUserDetails, currencyObj, transactionsList } = useUserData();
    const { donutTransactionsFilter } = useTransactionFilter();

    const [categoryTransactionsList, setCategoryTransactionsList] = useState<Transaction[]>([]);

    const [clickedTransaction, setClickedTransaction] = useState<Transaction>();
    const [showClickedTransaction, setShowClickedTransaction] = useState(false);

    const loaderColor = colorScheme === "dark" ? "#2e2e2e" : "#e3e3e3";
    const bgColor = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";

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
        setClickedTransCategory(donutCategory);
    }, []);

    useEffect(() => {
        // Filter transactions based on category and date range
        const filtered = transactionsList
            ?.filter((transaction: Transaction) => transaction.category._id === clickedCategory._id)
            ?.filter(({ category }: any) => category.type === donutCategory)
            .filter(({ createdAt }: any) => {
                const createdAtDate = new Date(createdAt);
                const fromDate = new Date(donutTransactionsFilter.from);
                const toDate = new Date(donutTransactionsFilter.to);

                return createdAtDate >= fromDate && createdAtDate <= toDate;
            });

        setCategoryTransactionsList(filtered);
    }, [donutCategory, transactionsList, donutTransactionsFilter]);

    useEffect(() => {
        navigation.setOptions({
            title: `${clickedCategory.name}`,
            headerRight: () => (
                <Text style={{ fontWeight: 500, fontSize: 16 }}>
                    {formatAmount(clickedCategory.spent, currencyObj)}
                </Text>
            )
        })
    }, [route.category]);

    return (
        <ScrollView style={[styles.mainContainer, { backgroundColor: bgColor }]}>
            <SafeAreaView>
                <View style={styles.container}>
                    {!loadingUserDetails ? (
                        <SafeAreaView style={styles.transactionContainer}>
                            {categoryTransactionsList?.length > 0 ? (
                                categoryTransactionsList.map((transaction: Transaction) => {
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
                                            key={createdAt.toString()}
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
                                <Text
                                    style={{
                                        marginTop: 20,
                                        textAlign: "center",
                                        fontStyle: "italic",
                                    }}
                                >
                                    No Record
                                </Text>
                            )}
                        </SafeAreaView>
                    ) : (
                        Array.from({ length: 5 }).map((_, index) => (
                            <View
                                key={index}
                                style={[styles.cardSkeleton, { backgroundColor: loaderColor }]}
                            ></View>
                        ))
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
            </SafeAreaView>
        </ScrollView>
    )
}

export default categoryTransactions

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        padding: 15,
    },
    container: {
        flex: 1,
        backgroundColor: "transparent",
        marginBottom: 20,
    },
    transactionContainer: {
        gap: 10,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "transparent",
    },
    cardSkeleton: {
        height: 65,
        borderRadius: 10,
        width: "100%",
        marginBottom: 10,
    },
})