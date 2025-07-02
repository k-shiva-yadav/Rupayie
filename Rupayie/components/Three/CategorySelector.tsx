import { SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { useColorScheme } from "@/components/useColorScheme";
import { FontAwesome6 } from '@expo/vector-icons';
import { useTransactionsCategory } from '@/context/transCategory'
import { Text } from '../Themed';

const CategorySelector = () => {
    const { sharedCategory, setSharedCategory, setClickedTransCategory } = useTransactionsCategory();

    const colorScheme = useColorScheme();
    const textColor = colorScheme === "dark" ? "#FFF" : "#000";
    const bgColor = colorScheme === "dark" ? "#000" : "#FFF";

    useEffect(() => {
        setClickedTransCategory(sharedCategory);
    }, [sharedCategory]);

    return (
        <SafeAreaView style={[styles.buttonsBackground, { backgroundColor: bgColor }]}>
            <Text style={styles.boldText}>Select Category</Text>

            <SafeAreaView style={styles.flex_row_btw}>
                {["Borrowed", "Lend"]
                    .map((button) => (
                        <TouchableOpacity
                            key={button}
                            onPress={() => setSharedCategory(button)}
                            activeOpacity={0.7}
                            style={[
                                styles.flex_row_btw, styles.button,
                                { width: "48%", backgroundColor: sharedCategory == button ? "#4588DF" : "#00000000", borderColor: sharedCategory === button ? "#4a99ff" : textColor }
                            ]}
                        >
                            <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: 500, color: sharedCategory === button ? "#FFF" : textColor }}>{button}</Text>
                            <FontAwesome6
                                name={button === "Borrowed"
                                    ? "credit-card"
                                    : "money-bills"}
                                color={sharedCategory === button ? "#FFF" : textColor}
                                size={20}
                            />
                        </TouchableOpacity>
                    ))
                }
            </SafeAreaView>
        </SafeAreaView>
    )
}

export default CategorySelector

const styles = StyleSheet.create({
    flex_row_btw: {
        gap: 10,
        display: "flex",
        flexDirection: "row",
        alignContent: "center",
        justifyContent: "space-between",
    },
    buttonsBackground: {
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
        marginHorizontal: 15,
    },
    button: {
        padding: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1
    },
    boldText: {
        fontSize: 18,
        fontWeight: 600,
        textAlign: "left",
        marginBottom: 20,
    },
})