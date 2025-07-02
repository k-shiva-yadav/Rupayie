import { SafeAreaView, StyleSheet } from 'react-native'
import React, { useMemo } from 'react'
import { Text, View } from '../Themed'
import { useUserData } from '@/context/user'
import { useTransactionsCategory } from '@/context/transCategory';

interface Category {
    _id: string;
    name: string;
    hexColor: string;
    type: string;
}

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
    createdAt: Date;
}

interface CategorySpent {
    _id: string;
    name: string;
    hexColor: string;
    spent: number;
}

const CategoryIndicators = () => {
    const { categoriesList, transactionsList } = useUserData();
    const { donutCategory } = useTransactionsCategory()

    const filteredCategoryList: Category[] = categoriesList.filter((categ: Category) => categ.type == donutCategory);

    // Filter transactions based on category type
    const filteredTransactions = useMemo(
        () => transactionsList?.filter((txn: Transaction) => txn.category.type === donutCategory),
        [transactionsList, donutCategory]
    );

    // Aggregate total amount spent per category
    const categorySpending: CategorySpent[] = useMemo(() => {
        const spendingMap = new Map<string, CategorySpent>();

        filteredTransactions?.forEach((txn: Transaction) => {
            const { _id, name, hexColor } = txn.category;
            if (!spendingMap.has(_id)) {
                spendingMap.set(_id, { _id, name, hexColor, spent: 0 });
            }
            spendingMap.get(_id)!.spent += txn.amount;
        });

        return Array.from(spendingMap.values());
    }, [filteredTransactions]);

    return (
        <SafeAreaView style={styles.container}>
            {categorySpending.length > 0 ?
                filteredCategoryList.map((category: Category) => (
                    <SafeAreaView style={styles.flex_row} key={category._id}>
                        <View style={[styles.circle, { backgroundColor: category.hexColor }]} />
                        <Text style={{ fontSize: 12, maxWidth: "100%" }} numberOfLines={1}>{category.name}</Text>
                    </SafeAreaView>
                )) :
                <></>
            }
        </SafeAreaView>
    )
}

export default CategoryIndicators

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
        paddingHorizontal: 10,
        rowGap: 5,
        columnGap: 20,
        display: 'flex',
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
    },
    circle: {
        width: 10,
        height: 10,
        borderRadius: 30,
    },
    flex_row: {
        display: "flex",
        flexDirection: "row",
        gap: 5,
        alignItems: "center"
    }
})