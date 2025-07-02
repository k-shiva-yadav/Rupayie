import { Easing, Image, RefreshControl, StatusBar, StyleSheet } from 'react-native'
import { Animated } from 'react-native';
import React, { useEffect, useRef, useState } from 'react'
import { Text, View } from '@/components/Themed'
import { useColorScheme } from "@/components/useColorScheme";

import Slider from '../slider';
import { ScrollView } from 'react-native';
import Header from '@/components/Header';
import MessagePopUp from '@/components/MessagePopUp';
import AddTransactionButton from '@/components/Two/AddButton';
import ExchangedRecords from '@/components/Three/ExchangedRecords';
import CategorySelector from '@/components/Three/CategorySelector';
import AddTransaction from '@/components/Modals/AddTransaction';
import { useUserData } from '@/context/user';
import { useMessages } from '@/context/messages';
import { useAnalytics } from '@/context/analytics';
import { useTransactionsCategory } from '@/context/transCategory';

const GradientImage = require("@/assets/pages/gradientBg.png");

const Four = () => {
    const colorScheme = useColorScheme();
    const { fetchAnalytics } = useAnalytics();
    const { fetchUserDetails } = useUserData();
    const { setClickedTransCategory, sharedCategory } = useTransactionsCategory()
    const { error, setError, messageText, setMessageText } = useMessages()

    const [sliderVisible, setSliderVisible] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    async function refreshPage() {
        setRefresh(true);

        try {
            console.log("Fetching on Reload");

            await fetchUserDetails();
            await fetchAnalytics();
        } catch (error) {
            console.error("Error Refreshing: ", error);
        } finally {
            setRefresh(false);
        }
    }

    function showSlider() {
        setSliderVisible(true);
    }
    function hideSlider() {
        setSliderVisible(false);
    }

    const slideModalAnim = useRef(new Animated.Value(200)).current; // Start position off-screen

    const handleCloseModal = () => {
        Animated.timing(slideModalAnim, {
            toValue: 700, // Move back down off-screen
            duration: 200,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            setShowAddModal(false);
        });
    };

    const openModal = () => {
        setClickedTransCategory(sharedCategory);

        setShowAddModal(true);
        Animated.timing(slideModalAnim, {
            toValue: 0, // Slide up to show the modal
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };

    return (
        <View
            style={[
                styles.conatiner,
                { backgroundColor: colorScheme === "dark" ? "#1C1C1C" : "#EDEDED" },
            ]}
        >
            <MessagePopUp
                error={error}
                messageText={messageText}
                setError={setError}
                setMessageText={setMessageText}
            />

            <Image
                source={GradientImage}
                style={{
                    position: "absolute",
                    zIndex: 0,
                    height: 170,
                    objectFit: "cover",
                }}
            />

            <StatusBar backgroundColor={"transparent"} />

            <View style={styles.bodyContainer}>
                <Header showSlider={showSlider} />

                {/* <SafeAreaView style={[styles.flex_row, { marginTop: statusBarHeight + 10, marginBottom: 15 }]}>
                    <TouchableOpacity activeOpacity={0.5} onPress={() => showSlider()}>
                        <FontAwesome
                            name="bars"
                            size={22}
                            style={{
                                color: textColor,
                                marginHorizontal: 15,
                            }}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Shared Records</Text>
                </SafeAreaView> */}

                <Slider isVisible={sliderVisible} hideSlider={hideSlider} />

                <CategorySelector />

                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refresh}
                            onRefresh={() => refreshPage()}
                            colors={["#000"]}
                        />
                    }
                    style={styles.paddings}>
                    <ExchangedRecords />
                </ScrollView>

                <AddTransactionButton handleClick={openModal} />

                <AddTransaction
                    isVisible={showAddModal}
                    slideModalAnim={slideModalAnim}
                    handleCloseModal={handleCloseModal}
                />
            </View>
        </View>
    )
}

export default Four

const styles = StyleSheet.create({
    conatiner: {
        flex: 1,
    },
    bodyContainer: {
        flex: 1,
        position: "relative",
        backgroundColor: "transparent",
    },
    paddings: {
        padding: 15,
        paddingTop: 0,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    headerText: {
        fontWeight: 600,
        fontSize: 22,
        marginTop: -5,
    },
    flex_row: {
        display: "flex",
        flexDirection: "row",
        gap: 15
    }
})