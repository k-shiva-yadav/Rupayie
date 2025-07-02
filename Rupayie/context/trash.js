import AsyncStorage from "@react-native-async-storage/async-storage";

const { useContext, createContext, useState } = require("react");

const Server_API = "http://192.168.68.102:2002/api";

const TranshContext = createContext();

export const TranshProvider = ({ children }) => {
  const [isTransDeleting, setIsTransDeleting] = useState(false);
  const [isTrashCleaning, setIsTrashCleaning] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [autoDeleteStatus, setAutoDeleteStatus] = useState(false);

  async function deleteTranshTrans(transactionId, createdAt) {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      setIsTransDeleting(true);

      const response = await fetch(
        `${Server_API}/trash/${storedUserId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId, createdAt }),
        }
      );

      if (!response.ok) {
        setIsTransDeleting(false);
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete transaction");
      }

      setIsTransDeleting(false);
      // console.log("Transaction Deleted from Trash Successfully");
    } catch (error) {
      console.log("Error Delete Transaction from Trash: ", error)
      throw new Error("Error Delete Transaction from Trash")
    }
  }

  async function emptyTrash() {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      setIsTrashCleaning(true);
      const response = await fetch(
        `${Server_API}/empty-trash/${storedUserId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        setIsTrashCleaning(false);
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to clean trash");
      }

      setIsTrashCleaning(false);
      // console.log("Trash Cleaned Successfully");
    } catch (error) {
      console.log("Error Cleaning Trash: ", error);
      throw new Error("Error Cleaning Trash");
    }
  }

  async function revertTrashTransaction(transactionId, createdAt) {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      setIsReverting(true);

      const response = await fetch(
        `${Server_API}/trash/revert/${storedUserId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId, createdAt }),
        }
      );

      if (!response.ok) {
        setIsReverting(false);
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to revert transaction");
      }

      setIsReverting(false);
      // console.log("Transaction Reverted from Trash Successfully");
    } catch (error) {
      console.log("Error Delete Transaction from Trash:", error);
      throw new Error("Error Delete Transaction from Trash");
    }
  }

  async function autoCleanTrashAfterWeek(autoCleanFlag) {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      const response = await fetch(
        `${Server_API}/users/${storedUserId}`,
        {
          method: "PUT",
          body: JSON.stringify({ settings: { autoCleanTrash: autoCleanFlag } }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to Turn On Trash Clean After a Week");
      }

      const data = await response.json();

      // console.log("Sucessfully Turned On Trash Clean After a Week to: ", data.settings.autoCleanTrash)
    } catch (error) {
      console.log("Error Turning On Trash Clean After a Week:", error);
      throw new Error("Error Turning On Trash Clean After a Week");
    }
  }

  return (
    <TranshContext.Provider
      value={{
        deleteTranshTrans,
        emptyTrash,
        isTransDeleting,
        isTrashCleaning,
        isReverting,
        revertTrashTransaction,
        autoDeleteStatus,
        autoCleanTrashAfterWeek
      }}
    >
      {children}
    </TranshContext.Provider>
  );
};

export const useTrash = () => useContext(TranshContext);
