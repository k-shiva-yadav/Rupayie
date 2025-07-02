import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useState, useContext } from "react";

const Server_API = "http://192.168.68.102:2002/api";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState([]);

  async function searchForKeyWord(keyWord) {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      setIsSearching(true);
      const response = await fetch(
        `${Server_API}/search/${storedUserId}/${keyWord}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch search results.");
      }

      const data = await response.json();
      setSearchResult(data);
      setIsSearching(false);
    } catch (error) {
      console.error("Error Searching:", error.message);
      setSearchResult([]);
    }
  }

  return (
    <SearchContext.Provider
      value={{ isSearching, searchResult, searchForKeyWord }}
    >
      {children}
    </SearchContext.Provider>
  );
};

// Custom Hook
export const useSearch = () => useContext(SearchContext);
