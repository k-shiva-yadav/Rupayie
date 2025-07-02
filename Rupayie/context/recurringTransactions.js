import AsyncStorage from "@react-native-async-storage/async-storage";

const { createContext, useState, useContext } = require("react");

const Server_API = "http://192.168.68.102:2002/api";

const RecurringContext = createContext();

export const RecurringTransProvider = ({ children }) => {
  const [loadingRecurring, setLoadingRecurring] = useState(false);
  const [loadingRecurringDelete, setLoadingRecurringDelete] = useState(false);

  async function addNewRecurringTransaction(values, userId = null) {
    const storedUserId = userId || await AsyncStorage.getItem("loggedUserId");

    try {
      setLoadingRecurring(true);

      const response = await fetch(
        `${Server_API}/recuring-transactions/${storedUserId}`,
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

      console.log("Recurring Transaction Added Successfully");
    } catch (error) {
      console.log("Error Adding Recurring Transaction:", error);
      throw new Error("Error Adding Recurring Transaction");
    } finally {
      setLoadingRecurring(false);
    }
  }

  async function saveEditedRecurringTransaction(transactionId, values) {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      setLoadingRecurring(true);

      const response = await fetch(
        `${Server_API}/recuring-transactions/${storedUserId}/${transactionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to edit transaction");
      }

      // console.log("Recurring Transaction Editting Successfully");
    } catch (error) {
      console.log("Error Editting Recurring Transaction:", error);
      throw new Error("Error Editting Recurring Transaction");
    } finally {
      setLoadingRecurring(false);
    }
  }

  async function deleteRecurringTransaction(transactionId) {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      setLoadingRecurringDelete(true);

      const response = await fetch(
        `${Server_API}/recuring-transactions/${storedUserId}/${transactionId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete transaction");
      }

      // console.log("Recurring Transaction Delete Successfully");
    } catch (error) {
      console.log("Error Delete Recurring Transaction:", error);
      throw new Error("Error Delete Recurring Transaction");
    } finally {
      setLoadingRecurringDelete(false);
    }
  }

  return (
    <RecurringContext.Provider
      value={{
        loadingRecurring,
        loadingRecurringDelete,
        addNewRecurringTransaction,
        saveEditedRecurringTransaction,
        deleteRecurringTransaction,
      }}
    >
      {children}
    </RecurringContext.Provider>
  );
};

export const useRecurringTransactions = () => useContext(RecurringContext);
