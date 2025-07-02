import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { FlatList } from 'react-native';
import moment from 'moment';
import { useColorScheme } from "@/components/useColorScheme";

const NumbersCarousel = ({ data, setSelectedDay, selectedDay, monthPicker, weekPicker, ampmPicker, }
    : { data: any; selectedDay: any; setSelectedDay: (value: any) => void; monthPicker?: boolean; weekPicker?: boolean; ampmPicker?: boolean; }) => {
    const colorScheme = useColorScheme();
    const [currentIndex, setCurrentIndex] = useState(
        data.includes(selectedDay) ? data.indexOf(selectedDay) : 0
    );

    const textColor = colorScheme === "dark" ? "#FFF" : "#000";
    const flatListRef = useRef<any>(null);
    const height = 40;

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / height);
        setCurrentIndex(index);

        // Delay state update to prevent flickering issues
        setSelectedDay(data[index]);
    };

    useEffect(() => {
        if (flatListRef.current) {
            setTimeout(() => {
                flatListRef.current.scrollToIndex({
                    index: currentIndex,
                    animated: false,
                });
            }, 200);
        }
    }, []);

    const renderItem = ({ item }: any) => {
        const isActive = item === selectedDay;

        return (
            <View
                style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: height,
                }}
            >
                <TouchableOpacity
                    onPress={() => setSelectedDay(item)}
                    disabled={ampmPicker && item == "" ? true : false}
                >
                    <Text
                        style={[
                            isActive ? styles.selected : styles.pickerItem,
                            {
                                backgroundColor: isActive ? "#4588DF" : "transparent",
                                color: isActive ? "#FFF" : textColor,
                                paddingHorizontal: 10,
                            },
                        ]}
                    >
                        {monthPicker
                            ? moment().month(item).format("MMMM")
                            : weekPicker
                                ? moment().day(item).format("dddd")
                                : ampmPicker
                                    ? item
                                    : item.toString().padStart(2, "0")}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <FlatList
            ref={flatListRef}
            data={data}
            keyExtractor={(item: any) => item.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            snapToInterval={height}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            initialScrollIndex={currentIndex}
            getItemLayout={(data, index) => ({
                length: height,
                offset: height * index,
                index,
            })}
            contentContainerStyle={{ alignItems: "center" }}
        />
    );
};

export default NumbersCarousel

const styles = StyleSheet.create({
    selected: {
        fontSize: 16,
        padding: 5,
        width: "auto",
        fontWeight: "bold",
        marginVertical: 5,
        borderRadius: 10,
        textAlign: "center",
    },
    pickerItem: {
        fontSize: 14,
        padding: 5,
        marginVertical: 5,
        textAlign: "center",
    },
})