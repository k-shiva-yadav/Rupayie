import AsyncStorage from "@react-native-async-storage/async-storage";

// AsyncStorage.clear()

const { useContext, createContext, useState } = require("react");

const Server_API = "http://192.168.68.102:2002/api";

const ExportTransactions = createContext();

export const ExportTransactionsProvider = ({ children }) => {
  const [loadingExport, setLoadingExport] = useState(true);

  const exportTransactionsIntoExcel = async () => {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      const response = await fetch(`${Server_API}/export-transactions/${storedUserId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      setLoadingExport(false);
      console.log(data);
    } catch (error) {
      console.log("Error Exporting Data: ", error);
      throw new Error("Error Exporting Data");
    }
  };

  return (
    <ExportTransactions.Provider
      value={{ loadingExport, exportTransactionsIntoExcel }}
    >
      {children}
    </ExportTransactions.Provider>
  );
};

export const useExportTransactions = () => useContext(ExportTransactions);
