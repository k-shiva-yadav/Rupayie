import { SafeAreaView, StyleSheet } from 'react-native';
import React from 'react';
import { Text } from '../Themed';
import { useColorScheme } from "@/components/useColorScheme";

import { useUserData } from '@/context/user';
import ExpandableCard from './ExpandableCard';
import { Skeleton } from '../Two/Transactions';
import { useTransactionsCategory } from '@/context/transCategory';

interface People {
    name: string;
    _id: string;
    relation: string;
    contact: string;
}

const ExchangedRecords = () => {
    const { transactionsList, peopleList, loadingUserDetails } = useUserData();
    const { sharedCategory } = useTransactionsCategory();

    const colorScheme = useColorScheme();
    const loaderColor = colorScheme === "dark" ? "#2e2e2e" : "#e3e3e3";

    if (loadingUserDetails) {
        return <Skeleton loaderColor={loaderColor} />;
    }

    if (!transactionsList || transactionsList.length === 0) {
        return (
            <Text style={styles.noRecordText}>No Record</Text>
        );
    }

    // Handle null peopleList by creating a fallback
    const allPeople = peopleList && peopleList.length > 0 ? peopleList : [];

    // Create a map for peopleId to person info
    const peopleMap = Object.fromEntries(
        allPeople.map((person: People) => [person._id, person])
    );

    // Group transactions by personId and then by category
    const groupedByPerson: Record<string, Record<string, any[]>> = {};

    transactionsList.forEach((txn: { category: { _id: string; type: string; name: string; }, people: { _id: string } }) => {
        if (txn.category?.type !== sharedCategory) return;

        const personId = txn.people?._id || "unassigned";
        const categoryName = txn.category?.name || "Uncategorized";

        if (!groupedByPerson[personId]) {
            groupedByPerson[personId] = {};
        }

        if (!groupedByPerson[personId][categoryName]) {
            groupedByPerson[personId][categoryName] = [];
        }

        groupedByPerson[personId][categoryName].push(txn);
    });

    return (
        <SafeAreaView style={{ marginBottom: 30 }}>
            <SafeAreaView style={styles.flex_col}>
                {Object.entries(groupedByPerson).map(([personId, categories]) => {
                    const person = peopleMap[personId] || {
                        _id: "unassigned",
                        name: "Unassigned",
                        relation: "N/A",
                        contact: "N/A",
                    };

                    return Object.entries(categories).map(([categoryName, txns]) => (
                        <ExpandableCard
                            key={`${personId}-${categoryName}`}
                            people={person}
                            categoryName={categoryName}
                            transactions={txns.sort(
                                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                            )}
                        />
                    ));
                })}
            </SafeAreaView>
        </SafeAreaView>
    );
};

export default ExchangedRecords;

const styles = StyleSheet.create({
    flex_col: {
        display: "flex",
        gap: 10,
    },
    noRecordText: {
        marginTop: 50,
        textAlign: "center",
        fontStyle: "italic",
    }
});
