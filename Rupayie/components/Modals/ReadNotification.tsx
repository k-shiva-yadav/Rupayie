import {
    ActivityIndicator,
    Alert,
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import React from "react";
import { Text, View } from "../Themed";
import { Modal } from "react-native";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import { useUserData } from "@/context/user";
import { useAnalytics } from "@/context/analytics";
import formatDateTimeSimple from "@/utils/formatDateTimeSimple";
import { formatAmount } from "@/utils/formatAmount";
import { useMessages } from "@/context/messages";
import { useNotifications } from "@/context/notification";

interface Notification {
    _id: string;
    header: string;
    type: string;
    transaction: {
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
    }
}

const ReadNotification = ({
    visible,
    handleCloseModal,
    slideModalAnim,
    notification,
}: {
    visible: boolean;
    handleCloseModal: () => void;
    slideModalAnim: any;
    notification: Notification;
}) => {
    const { fetchUserDetails, currencyObj, loadingUserDetails } = useUserData();
    const { fetchAnalytics } = useAnalytics();
    const { setError, setMessageText } = useMessages();
    const { deleting, deleteNotifications } = useNotifications()

    const colorScheme = useColorScheme();
    const inputBg = colorScheme === "dark" ? "#1C1C1C" : "#EDEDED";
    const textColor = colorScheme === "dark" ? "#FFF" : "#000";

    const { transaction, _id } = notification;
    const { category, amount, note, people, createdAt, } = transaction

    async function handleDelete() {
        try {
            await deleteNotifications(_id);
            await fetchBoth();
            handleCloseModal();

            setMessageText("Sucessfully Deleted :)");
        } catch (error) {
            handleCloseModal();

            setError("Failed to Delete :(");
            // Alert.alert("Failed", "Failed to Delete");
        }
    }

    async function fetchBoth() {
        await fetchUserDetails();
        await fetchAnalytics();
    }

    return (
        <ScrollView style={{ flex: 1, position: "absolute" }}>
            <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCloseModal}>
                <Pressable
                    style={styles.modalContainer}
                    onPress={handleCloseModal}
                    disabled={deleting}
                >
                    <Pressable
                        onPress={(e) => e.stopPropagation()}
                        style={styles.modalContent}
                    >
                        <Animated.View
                            style={[{ transform: [{ translateY: slideModalAnim }] }]}
                        >
                            <View style={styles.animatedView}>
                                <SafeAreaView
                                    style={[styles.flex_row_start_btw, { marginBottom: 15 }]}
                                >
                                    <Text style={[styles.title, { maxWidth: "50%" }]} numberOfLines={1}>Your Notification</Text>

                                    {deleting ? (
                                        <View
                                            style={[styles.doneButton, { backgroundColor: "red" }]}
                                        >
                                            <ActivityIndicator size="small" color={"#FFF"} />
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={handleDelete}
                                            activeOpacity={0.5}
                                            disabled={loadingUserDetails || deleting}
                                            style={[styles.doneButton, { backgroundColor: "red" }]}
                                        >
                                            <FontAwesome6
                                                name="trash-can"
                                                color={"#FFF"}
                                                style={styles.doneText}
                                            />
                                        </TouchableOpacity>
                                    )}
                                </SafeAreaView>

                                {/* Date */}
                                <View style={[styles.inputField, { backgroundColor: inputBg }]}>
                                    <Text>{formatDateTimeSimple(createdAt)}</Text>
                                </View>

                                {/* Amount */}
                                <View style={[styles.inputField, { backgroundColor: inputBg }]}>
                                    <Text>{formatAmount(amount, currencyObj)}</Text>
                                </View>

                                {/* Category */}
                                <View
                                    style={[
                                        styles.smallBox,
                                        {
                                            backgroundColor: inputBg,
                                            marginBottom: note || people ? 12 : 0,
                                        },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.categoryCircle,
                                            { backgroundColor: category?.hexColor },
                                        ]}
                                    ></View>

                                    <Text numberOfLines={1} style={{ width: "85%" }}>{category?.name}</Text>
                                </View>

                                {/* Person */}
                                {people && (
                                    <View
                                        style={[
                                            styles.smallBox,
                                            {
                                                backgroundColor: inputBg,
                                                marginBottom: note ? 12 : 0,
                                            },
                                        ]}
                                    >
                                        <Ionicons name="person" color={textColor} size={14} />
                                        <Text numberOfLines={1}>
                                            {people?.name} : {people?.relation}
                                        </Text>
                                    </View>
                                )}

                                {/* Note */}
                                {note && (
                                    <View
                                        style={[
                                            styles.inputField,
                                            {
                                                backgroundColor: inputBg,
                                                marginBottom: 12,
                                                marginTop: !people && !category ? 12 : 0,
                                            },
                                        ]}
                                    >
                                        <Text>Note: {note}</Text>
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    </Pressable>
                </Pressable>
            </Modal>
        </ScrollView>
    );
};

export default ReadNotification;

const styles = StyleSheet.create({
    modalContent: {
        width: "100%",
        // marginBottom: 100,
    },
    modalContainer: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        paddingHorizontal: 15,
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    animatedView: {
        padding: 20,
        borderRadius: 15,
        // overflowY: "scroll",
        borderWidth: 0.5,
        borderColor: "#666",
    },
    title: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 10,
    },
    flex_row_start_btw: {
        gap: 5,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    doneButton: {
        borderRadius: 30,
        // backgroundColor: "#4FB92D",
        alignSelf: "flex-end",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 40,
        width: 40,
        marginTop: -5,
        // marginBottom: 15,
    },
    doneText: {
        fontSize: 20,
        fontWeight: 500,
    },
    smallBox: {
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 12,
        gap: 10,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    inputField: {
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 12,
        fontWeight: 400,
    },
    categoryCircle: {
        width: 15,
        height: 15,
        borderRadius: 20,
    },
    image: {
        borderRadius: 5,
        width: "100%",
        height: 120,
        overflow: "hidden",
        objectFit: "cover",
        backgroundColor: "#e3e3e3",
    },
    imageContainer: {
        position: "relative",
    },
});
