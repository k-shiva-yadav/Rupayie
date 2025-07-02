import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [loggedUserId, setLoggedUserId] = useState("");

    // Load values from AsyncStorage on app start
    useEffect(() => {
        const loadLoginState = async () => {
            try {
                const storedLoggedIn = await AsyncStorage.getItem("loggedIn");
                const storedUserId = await AsyncStorage.getItem("loggedUserId");

                if (storedLoggedIn !== null) setLoggedIn(JSON.parse(storedLoggedIn));
                if (storedUserId !== null) setLoggedUserId(storedUserId);
            } catch (error) {
                console.error("Error loading login state from AsyncStorage:", error);
            }
        };

        loadLoginState();
    }, []);

    // Save values in AsyncStorage when they change
    useEffect(() => {
        const saveLoginState = async () => {
            try {
                if (loggedIn !== false) {
                    await AsyncStorage.setItem("loggedIn", JSON.stringify(loggedIn));
                }
                if (loggedUserId !== "") {
                    await AsyncStorage.setItem("loggedUserId", loggedUserId);
                }
            } catch (error) {
                console.error("Error saving login state to AsyncStorage:", error);
            }
        };

        saveLoginState();
    }, [loggedIn, loggedUserId]);

    return (
        <LoginContext.Provider value={{ loggedIn, setLoggedIn, loggedUserId, setLoggedUserId }}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLogin = () => useContext(LoginContext);
