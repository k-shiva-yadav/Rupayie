import { Animated, Easing, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef } from 'react'

const MessagePopUp = ({ error, messageText, setError, setMessageText }: {
    error: string;
    messageText: string;
    setError: (value: string) => void;
    setMessageText: (value: string) => void;
}) => {

    return (
        <>
            {error &&
                <AnimatedNotification message={error} type="error" onHide={() => setError("")} />
            }

            {messageText &&
                <AnimatedNotification message={messageText} type="success" onHide={() => setMessageText("")} />
            }
        </>
    )
};

const AnimatedNotification = ({ message, type, onHide }: { message: string; type: "success" | "error"; onHide: () => void }) => {
    const translateY = useRef(new Animated.Value(50)).current; // Start 50px below
    const opacity = useRef(new Animated.Value(0.5)).current; // Start with low opacity

    useEffect(() => {
        // Slide up & fade in
        Animated.timing(translateY, {
            toValue: 0, // Move slightly up
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();

        Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Auto-hide after 3 seconds
        const timer = setTimeout(() => {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => onHide());
            // Hide component after animation ends
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View
            style={[
                styles.notificationContainer,
                {
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <SafeAreaView style={[styles.notification, { backgroundColor: type === "success" ? "green" : "red", }]}>
                <Text style={styles.notificationText} numberOfLines={1} ellipsizeMode="tail">
                    {message}
                </Text>
            </SafeAreaView>
        </Animated.View>
    );
};

export default MessagePopUp

const styles = StyleSheet.create({
    notificationContainer: {
        alignSelf: "center",
        position: "absolute",
        zIndex: 100,
        left: 20,
        right: 20,
        bottom: 50, // Start from bottom
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom : 30 // to go above
    },
    notification: {
        padding: 5,
        paddingHorizontal: 15,
        borderRadius: 10,
    },
    notificationText: {
        textAlign: "center",
        fontSize: 14,
        fontWeight: 500,
        paddingHorizontal: 10,
        color: "#FFF"
    },
})