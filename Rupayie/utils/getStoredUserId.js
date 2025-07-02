import AsyncStorage from "@react-native-async-storage/async-storage";

export default async function loggedUserId() {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    return storedUserId;
}