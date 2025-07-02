const { useContext, useState, useEffect } = require("react");
const { createContext } = require("react");

const MessagesContext = createContext();

export const MessagesProvider = ({ children }) => {
    const [error, setError] = useState("");
    const [messageText, setMessageText] = useState("");

    useEffect(() => {
        if (messageText !== "") {
            setError("");
        }
    }, [messageText]);

    return (
        <MessagesContext.Provider
            value={{ error, setError, messageText, setMessageText }}
        >
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessages = () => useContext(MessagesContext);
