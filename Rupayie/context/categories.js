import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { useContext } from "react";

const { createContext } = require("react");

const Server_API = "http://192.168.68.102:2002/api";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCategoryDelete, setLoadingCategoryDelete] = useState(false);

  async function addNewCategory(values) {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      setLoadingCategories(true);

      const response = await fetch(
        `${Server_API}/categories/${storedUserId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add category");
      }

      const data = await response.json();

      // console.log("Category Added Successfully");

      return data.category;
    } catch (error) {
      console.log("Error Adding Category:", error);
      throw new Error("Error Adding Category");
    } finally {
      setLoadingCategories(false);
    }
  }

  async function saveEditedCategory(categoryId, values) {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      setLoadingCategories(true);

      const response = await fetch(
        `${Server_API}/categories/${storedUserId}/${categoryId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to edit category");
      }

      // console.log("Category Editting Successfully");
    } catch (error) {
      console.log("Error Editting Category:", error);
      throw new Error("Error Editting Category");
    } finally {
      setLoadingCategories(false);
    }
  }

  async function deleteCategory(categoryId) {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      setLoadingCategoryDelete(true);

      const response = await fetch(
        `${Server_API}/categories/${storedUserId}/${categoryId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete category");
      }

      // console.log("Category Delete Successfully");
    } catch (error) {
      console.log("Error Delete Category:", error);
      throw new Error("Error Delete Category");
    } finally {
      setLoadingCategoryDelete(false);
    }
  }

  return (
    <CategoryContext.Provider
      value={{
        loadingCategories,
        loadingCategoryDelete,
        addNewCategory,
        saveEditedCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => useContext(CategoryContext);
