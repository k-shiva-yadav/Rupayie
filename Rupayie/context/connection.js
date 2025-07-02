import { createContext, useState } from "react";

const { useContext } = require("react");

const ConnectionContext = createContext();

export const ConnectionProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(true);

    return (
        <ConnectionContext.Provider value={{ isConnected, setIsConnected }}>
            {children}
        </ConnectionContext.Provider>
    )
}

export const useConnection = () => useContext(ConnectionContext);
