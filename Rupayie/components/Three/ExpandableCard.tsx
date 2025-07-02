import { ActivityIndicator, SafeAreaView, Share, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Text, View } from '../Themed'
import { useColorScheme } from "@/components/useColorScheme";
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { formatAmount } from '@/utils/formatAmount';
import { formatDate } from '@/utils/formatDateTimeSimple';
import { useUserData } from '@/context/user';
import { useMessages } from '@/context/messages';
import { useSharedLinks } from '@/context/sharedLinks';

interface People {
    name: string;
    _id: string;
    relation: string;
    contact: string;
}

interface Transaction {
    _id: string;
    amount: number;
    createdAt: Date;
    category: {
        type: "Spent" | "Earned" | "Borrowed" | "Lend";
        hexColor: string;
        sign: "+" | "-";
        name: string;
        _id: string;
    };
}

interface SharedLink {
    _id: string;
    peopleId: string;
    categoryId: string;
    token: string;
}

const ExpandableCard = ({
    people,
    transactions,
    categoryName,
}: {
    people: People;
    transactions: Transaction[];
    categoryName: string;
}) => {
    const { name } = people;
    const { currencyObj, sharedLinks, fetchUserDetails } = useUserData();
    const { creatingLink, createNewShareLink } = useSharedLinks()
    const { setError, setMessageText } = useMessages();
    const colorScheme = useColorScheme();

    const textColor = colorScheme === "dark" ? "#FFF" : "#000";
    const oppTextColor = colorScheme === "light" ? "#FFF" : "#000";

    const [expand, setExpand] = useState(false);

    const totalBalance = transactions.reduce((sum, txn) =>
        txn.category.sign === "+" ? sum + txn.amount : sum - txn.amount, 0);

    const totalTaken = transactions.reduce((sum, txn) =>
        txn.category.sign === "+" ? sum + txn.amount : sum, 0);

    const totalGiven = transactions.reduce((sum, txn) =>
        txn.category.sign === "-" ? sum + txn.amount : sum, 0);

    const categoryColor = transactions[0]?.category?.hexColor || "#000";

    const link = sharedLinks.find(
        (link: SharedLink) =>
            link.categoryId === transactions[0]?.category._id &&
            link.peopleId === people._id
    );

    function handleLinkShare(token: string) {
        Share.share({
            message: `Hey, checkout this link: https://www.rupayie.com/shared/${token}`,
            title: "Sharing Link"
        })
    }

    async function generateNewLink() {
        try {
            const values = {
                peopleId: people._id,
                categoryId: transactions[0].category._id
            }

            const newLink = await createNewShareLink(values);
            Share.share({
                message: `Hey, checkout this link: https://www.rupayie.com/shared/${newLink.token}`,
                title: "Sharing Link"
            })
            await fetchUserDetails();

            setMessageText("You Got New Link to Share :)")
        } catch (error) {
            setError("Error Generating New Link :(");
            console.log("Error Generating New Link: ", error);
        }
    }

    return (
        <View style={styles.card}>
            <TouchableOpacity
                onPress={() => setExpand(prev => !prev)}
                activeOpacity={0.7}
            >
                <SafeAreaView style={[styles.flex_row_btw, { marginBottom: 5 }]}>
                    <Text numberOfLines={1} style={styles.nameText}>{name}</Text>
                    <Text numberOfLines={1} style={styles.nameText}>
                        {formatAmount(totalBalance, currencyObj)}
                    </Text>
                </SafeAreaView>

                <SafeAreaView style={styles.flex_row_btw}>
                    <SafeAreaView style={[styles.flex_row, { maxWidth: "50%" }]}>
                        <View style={[styles.dot, { backgroundColor: categoryColor }]} />
                        <Text numberOfLines={1}>{categoryName}</Text>
                    </SafeAreaView>
                    <FontAwesome6
                        size={16}
                        color={textColor}
                        name={expand ? "caret-down" : "caret-right"}
                    />
                </SafeAreaView>
            </TouchableOpacity>

            {expand && (
                <SafeAreaView style={[styles.flex_col, styles.expandedCont]}>
                    <SafeAreaView style={styles.flex_row_btw}>
                        <Text style={[styles.tableHeader, { textAlign: "left" }]}>Date</Text>
                        <Text style={[styles.tableHeader, { textAlign: "right" }]}>You Got</Text>
                        <Text style={[styles.tableHeader, { textAlign: "right" }]}>You Gave</Text>
                    </SafeAreaView>

                    {transactions.reduce((acc: JSX.Element[], txn, idx) => {
                        const previousBalance = acc.length > 0 ? acc[acc.length - 1].props.balance : 0;
                        const newBalance =
                            txn.category.sign === '+' ? previousBalance + txn.amount : previousBalance - txn.amount;

                        acc.push(
                            <TableRow
                                key={txn._id}
                                txn={txn}
                                balance={newBalance}
                            />
                        );

                        return acc;
                    }, [])}

                    <SafeAreaView style={[styles.flex_row_btw, styles.totalRow]}>
                        <Text style={[styles.tableHeader, { textAlign: "left" }]}>Total</Text>
                        <Text style={[styles.tableHeader, { textAlign: "right" }]}>
                            {formatAmount(totalTaken, currencyObj)}
                        </Text>
                        <Text style={[styles.tableHeader, { textAlign: "right" }]}>
                            {formatAmount(totalGiven, currencyObj)}
                        </Text>
                    </SafeAreaView>

                    <SafeAreaView style={{ marginTop: 10 }}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            disabled={creatingLink}
                            onPress={() => link ? handleLinkShare(link.token) : generateNewLink()}
                            style={[styles.flex_row, styles.shareButton, { backgroundColor: textColor }]}
                        >
                            <Text style={{ fontWeight: "500", color: oppTextColor }}>Share</Text>
                            {creatingLink ?
                                <ActivityIndicator color={oppTextColor} size={14} />
                                :
                                <Ionicons name="share-social" color={oppTextColor} size={16} />
                            }
                        </TouchableOpacity>
                    </SafeAreaView>
                </SafeAreaView>
            )}
        </View>
    );
};

const TableRow = ({ txn, balance }: { txn: Transaction; balance: number }) => {
    const { currencyObj } = useUserData();
    return (
        <SafeAreaView style={styles.flex_row_btw}>
            <Text style={{ width: "33%", textAlign: "left" }}>{formatDate(txn.createdAt)}</Text>
            <Text style={{ width: "33%", textAlign: "right" }}>
                {txn.category.sign === "+" ? formatAmount(txn.amount, currencyObj) : "-"}
            </Text>
            <Text style={{ width: "33%", textAlign: "right" }}>
                {txn.category.sign === "-" ? formatAmount(txn.amount, currencyObj) : "-"}
            </Text>
        </SafeAreaView>
    );
};

export default ExpandableCard;

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 10,
    },
    flex_col: {
        display: "flex",
        gap: 7,
    },
    flex_row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    },
    flex_row_btw: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 20,
        marginRight: 6,
    },
    expandedCont: {
        borderTopColor: "#888888",
        borderTopWidth: 0.5,
        marginTop: 10,
        paddingTop: 10,
    },
    tableHeader: {
        width: "33%",
        fontWeight: "500",
    },
    totalRow: {
        borderTopColor: "#888",
        borderTopWidth: 0.5,
        paddingTop: 5,
    },
    nameText: {
        fontSize: 16,
        fontWeight: "500",
        maxWidth: "50%",
    },
    shareButton: {
        paddingHorizontal: 7,
        paddingVertical: 5,
        borderRadius: 5,
        justifyContent: "center",
    },
});
