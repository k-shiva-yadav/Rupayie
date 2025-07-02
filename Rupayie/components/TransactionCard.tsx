import { StyleSheet } from 'react-native'
import React from 'react'
import { FontAwesome6 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native';
import { useTransactionsCategory } from '@/context/transCategory';
import { useUserData } from '@/context/user';
import { useColorScheme } from "@/components/useColorScheme";
import { formatAmount } from '@/utils/formatAmount';
import formatDateTimeSimple from '@/utils/formatDateTimeSimple';
import { Text, View } from './Themed';

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

export const TransactionCard = ({
    _id,
    amount,
    category,
    note,
    createdAt,
    pushedIntoTransactions,
    image,
    people,
}: Transaction) => {
    const { clickedTransCategory } = useTransactionsCategory();

    const { currencyObj } = useUserData();
    const colorScheme = useColorScheme();
    const iconColor = colorScheme === "dark" ? "#FFF" : "#000";
    const lightText = colorScheme == "dark" ? "#D9D9D9" : "#5C5C5C";

    const isRecurring =
        (pushedIntoTransactions == false || pushedIntoTransactions == true) &&
        pushedIntoTransactions !== undefined;

    return (
        <View style={styles.transactionsCard}>
            <SafeAreaView style={styles.flex_row_end_btw}>
                {/* Category */}
                <SafeAreaView style={[styles.flex_row, { maxWidth: "50%" }]}>
                    <View
                        style={[
                            styles.categoryCircle,
                            { backgroundColor: category.hexColor },
                        ]}
                    ></View>

                    <Text style={styles.text} numberOfLines={1}>{category.name}</Text>
                </SafeAreaView>

                {/* Amount */}
                <Text style={[styles.text, { maxWidth: "40%" }]} numberOfLines={1}>{formatAmount(amount, currencyObj)}</Text>
            </SafeAreaView>

            <SafeAreaView
                style={[
                    styles.flex_row_end_btw,
                    { paddingBottom: isRecurring ? 7 : 12, marginTop: 7 },
                ]}
            >
                {/* Note */}
                {clickedTransCategory === "Borrowed" ||
                    clickedTransCategory === "Lend" ? (
                    <SafeAreaView
                        style={{
                            width: "60%",
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "wrap",
                        }}
                    >
                        <Text numberOfLines={1} style={styles.smallText}>
                            {`${category.sign == "+" ? "From" : " To"} ${people?.name}`}
                        </Text>
                    </SafeAreaView>
                ) : (
                    <SafeAreaView style={{ width: "60%" }}>
                        <Text numberOfLines={1} style={styles.smallText}>
                            {note}
                        </Text>
                    </SafeAreaView>
                )}

                {/* Date */}
                <Text style={styles.createdAtText}>
                    {formatDateTimeSimple(createdAt)}
                </Text>
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

const styles = StyleSheet.create({
    transactionsCard: {
        borderRadius: 10,
        paddingTop: 12,
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
        fontSize: 10,
        textAlign: "right",
    },
    flex_row: {
        gap: 7,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
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
})