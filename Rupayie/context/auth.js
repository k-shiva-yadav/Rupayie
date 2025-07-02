import { createContext, useContext, useState } from "react";

const Server_API = "http://192.168.68.102:2002/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authenticating, setAuthenticating] = useState(false);

    const authenticatedUser = async (email) => {
        try {
            setAuthenticating(true);

            const response = await fetch(`${Server_API}/auth`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
            }

            return responseData;
        } catch (error) {
            console.error("Error Making User Login:", error);
            throw new Error(error.message || "Error Making User Login");
        } finally {
            setAuthenticating(false);
        }
    };

    return (
        <AuthContext.Provider value={{ authenticatedUser, authenticating }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
