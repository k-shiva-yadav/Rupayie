import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useMemo } from 'react'
import { Text, View } from '../Themed'
import { useColorScheme } from "@/components/useColorScheme";
import { formatAmount } from '@/utils/formatAmount';
import { useUserData } from '@/context/user';
import { Ionicons } from '@expo/vector-icons';

interface Transaction {
    _id: string;
    amount: number;
    createdAt: Date;
    category: {
        type: "Spent" | "Earned" | "Borrowed" | "Lend";
        hexColor: string;
        sign: "+" | "-";
    };
}

interface TypeSpent {
    type: Transaction["category"]["type"];
    color: string;
    total: number;
}

const WalletBalance = ({ spendings }: { spendings: TypeSpent[] }) => {
    const { currencyObj, loadingUserDetails } = useUserData()
    const colorScheme = useColorScheme();
    const bgColor = colorScheme === "dark" ? "#2A2C38" : "#FFF";
    const textColor = colorScheme === "dark" ? "#000" : "#FFF";
    const oppTextColor = colorScheme === "dark" ? "#FFF" : "#000";
    const [selectedTypes, setSelectedTypes] = React.useState<TypeSpent["type"][]>(["Earned", "Spent"]);

    // Toggle selection
    const toggleType = (type: TypeSpent["type"]) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    // Calculate balance from selected types
    const netBalance = useMemo(() => {
        return spendings
            .filter(s => selectedTypes.includes(s.type))
            .reduce((acc, curr) => {
                // Simple logic: Spent/Borrowed subtract, Earned/Lend add
                const isSubtract = curr.type === "Spent" || curr.type === "Lend";
                return isSubtract ? acc - curr.total : acc + curr.total;
            }, 0);
    }, [selectedTypes, spendings]);

    return !loadingUserDetails ? (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollButtons}
            >
                {spendings.map((btn) => {
                    const isSelected = selectedTypes.includes(btn.type);
                    return (
                        <TouchableOpacity
                            key={btn.type}
                            style={[
                                styles.button,
                                styles.flex_row,
                                { backgroundColor: isSelected ? btn.color : "#55555560" },
                            ]}
                            activeOpacity={0.7}
                            onPress={() => toggleType(btn.type)}
                        >
                            <Text style={[
                                styles.buttonText,
                                {
                                    fontWeight: isSelected ? "500" : "400",
                                    color: isSelected ? textColor : oppTextColor
                                }
                            ]}>
                                {btn.type}
                            </Text>
                            {isSelected && (
                                <Ionicons name="close-circle" size={18} color={textColor} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <SafeAreaView style={styles.flex_row_btw}>
                <Text>Net Balance</Text>
                <Text style={styles.balanceText}>
                    {formatAmount(netBalance, currencyObj)}
                </Text>
            </SafeAreaView>
        </View>
    ) : (
        <View
            style={[
                styles.container,
                { backgroundColor: bgColor, height: 95 }
            ]}
        />
    );
};

export default WalletBalance;

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        borderRadius: 10,
        padding: 15
    },
    scrollButtons: {
        flexDirection: "row",
        gap: 10,
        paddingBottom: 15
    },
    flex_row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 10
    },
    flex_row_btw: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "space-between",
    },
    button: {
        paddingVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 14,
    },
    balanceText: {
        fontSize: 18,
        fontWeight: "500"
    }
});
