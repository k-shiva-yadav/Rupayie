import AsyncStorage from "@react-native-async-storage/async-storage";

// AsyncStorage.clear()

const { useContext, createContext, useState } = require("react");

const Server_API = "http://192.168.68.102:2002/api";

const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
  const [analytics, setAnalytics] = useState({
    totalSpent: 0,
    totalEarned: 0,
    totalAmount: 0,
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [failedFetching, setFailedFetching] = useState(false);

  const fetchAnalytics = async () => {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      const response = await fetch(`${Server_API}/analytics/${storedUserId}`);

      if (!response.ok) {
        setFailedFetching(true);
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      setLoadingAnalytics(false);
      setFailedFetching(false);
      setAnalytics(data);
      // console.log("Fetched Analytics");
    } catch (error) {
      setFailedFetching(true);
      console.log("Error Fetching Analytics Data: ", error);
      throw new Error("Error Fetching Analytics Data");
    }
  };

  return (
    <AnalyticsContext.Provider
      value={{ analytics, setAnalytics, loadingAnalytics, setLoadingAnalytics, fetchAnalytics, failedFetching }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => useContext(AnalyticsContext);
