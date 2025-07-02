import AsyncStorage from "@react-native-async-storage/async-storage";

const { useContext, createContext, useState } = require("react");

const Server_API = "http://192.168.68.102:2002/api";

const TransactionsContext = createContext();

export const TransactionsProvider = ({ children }) => {
    const [processing, setProcessing] = useState(false)
    const [processingDelete, setProcessingDelete] = useState(false)

    async function addNewTransaction(values) {
        const storedUserId = await AsyncStorage.getItem("loggedUserId");

        try {
            setProcessing(true)

            const response = await fetch(
                `${Server_API}/transactions/${storedUserId}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add transaction");
            }

            setProcessing(false);
            // console.log("Transaction Added Successfully");
        } catch (error) {
            setProcessing(false);
            console.log("Error Adding Transaction:", error);
            throw new Error("Error Adding Transaction");
        }
    }

    async function saveEditedTransaction(transactionId, values) {
        const storedUserId = await AsyncStorage.getItem("loggedUserId");
        
        try {
            setProcessing(true)

            const response = await fetch(
                `${Server_API}/transactions/${storedUserId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...values, transactionId }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to edit transaction");
            }

            setProcessing(false);
            // console.log("Transaction Editting Successfully");
        } catch (error) {
            setProcessing(false);
            console.log("Error Editting Transaction:", error);
            throw new Error("Error Editting Transaction");
        }
    }

    async function deleteTransaction(transactionId, createdAt) {
        const storedUserId = await AsyncStorage.getItem("loggedUserId");

        try {
            setProcessingDelete(true)

            const response = await fetch(
                `${Server_API}/transactions/${storedUserId}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ transactionId, createdAt }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete transaction");
            }

            setProcessingDelete(false);
            // console.log("Transaction Delete Successfully");
        } catch (error) {
            setProcessingDelete(false);
            console.log("Error Delete Transaction:", error);
            throw new Error("Error Delete Transaction");
        }
    }

    return (
        <TransactionsContext.Provider
            value={{ processing, processingDelete, addNewTransaction, saveEditedTransaction, deleteTransaction }}
        >
            {children}
        </TransactionsContext.Provider>
    );
};

export const useTransactions = () => useContext(TransactionsContext);
