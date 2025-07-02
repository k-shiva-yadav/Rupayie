import { SafeAreaView, StyleSheet } from 'react-native'
import React from 'react'
import { Text, View } from '../Themed'
import { useColorScheme } from "@/components/useColorScheme";

const EndText = () => {
    const colorScheme = useColorScheme();
    const placeholderColor = colorScheme === "dark" ? "#d6d6d6" : "#575757";

    return (
        <SafeAreaView style={{ marginVertical: 10, marginBottom: 40, marginLeft: 5 }}>
            <Text style={{ color: placeholderColor, fontSize: 18, fontWeight: 500 }}>
                Track, plan, and grow.
            </Text>

            <SafeAreaView style={styles.flex_row}>
                <Text numberOfLines={1} style={{ color: placeholderColor, fontSize: 28, fontWeight: 500, maxWidth: "90%" }}>
                    Your money, your rules
                </Text>

                <View style={styles.circle} />
            </SafeAreaView>
        </SafeAreaView>
    )
}

export default EndText

const styles = StyleSheet.create({
    circle: {
        width: 10,
        height: 10,
        borderRadius: 20,
        marginBottom: 6,
        backgroundColor: "#4FB92D"
    },
    flex_row: {
        gap: 5,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-end",
    }
})