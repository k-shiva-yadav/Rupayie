import React, { createContext, useContext, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Server_API = "http://192.168.68.102:2002/api";

const SharedLinksContext = createContext();

export const SharedLinksProvider = ({ children }) => {
    const [creatingLink, setCreatingLink] = useState(false);

    const createNewShareLink = async (values) => {
        try {
            const storedUserId = await AsyncStorage.getItem("loggedUserId");
            if (!storedUserId) throw new Error("User not logged in");

            const params = { ...values, userId: storedUserId };
            setCreatingLink(true);

            const response = await fetch(`${Server_API}/share/share-link`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create link");
            }

            return data.data;
        } catch (error) {
            console.error("Error Creating Link:", error);
            throw new Error("Error Creating Link");
        } finally {
            setCreatingLink(false);
        }
    };

    return (
        <SharedLinksContext.Provider value={{ creatingLink, createNewShareLink }}>
            {children}
        </SharedLinksContext.Provider>
    );
};

export const useSharedLinks = () => {
    const context = useContext(SharedLinksContext);
    if (!context) {
        throw new Error("useSharedLinks must be used within a SharedLinksProvider");
    }
    return context;
};
