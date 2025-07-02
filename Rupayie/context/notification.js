import AsyncStorage from "@react-native-async-storage/async-storage";

const { useContext, useState } = require("react");
const { createContext } = require("react");

const Server_API = "http://192.168.68.102:2002/api";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [cleaning, setCleaning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function setNotificationRead(notificationId, values) {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      const response = await fetch(
        `${Server_API}/notifications/${storedUserId}/${notificationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to set read transaction");
      }

      // console.log("Transaction Set Read Successfully");
    } catch (error) {
      console.log("Error Setting Read Transaction: ", error);
      throw new Error("Error Setting Read Transaction");
    }
  }

  async function deleteAllNotifications() {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      setCleaning(true);
      const response = await fetch(
        `${Server_API}/notifications/${storedUserId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        setCleaning(false);
        throw new Error("Failed to delete notifications");
      }

      setCleaning(false);
      // console.log("Transaction Set Read Successfully");
    } catch (error) {
      setCleaning(false);
      console.log("Error Deleting Notifications: ", error);
      throw new Error("Error Deleting Notifications");
    }
  }

  async function deleteNotifications(notificationId) {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      setDeleting(true);
      const response = await fetch(
        `${Server_API}/notifications/${storedUserId}/${notificationId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        setDeleting(false);
        const errorData = await response.json();
        throw new Error("Failed to delete notification: ", errorData.message);
      }

      setDeleting(false);
    } catch (error) {
      setDeleting(false);
      console.log("Error Deleting Notification: ", error);
      throw new Error("Error Deleting Notification");
    }
  }

  async function deleteMultipleNotifications(arrayOfIds) {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      setDeleting(true);
      const response = await fetch(
        `${Server_API}/multiple/notifications/${storedUserId}`,
        {
          method: "DELETE",
          body: JSON.stringify({ notificationIds: arrayOfIds }),
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        setDeleting(false);
        throw new Error("Failed to delete multiple notifications");
      }

      setDeleting(false);

      // const data = await response.json();
      // console.log(data);
    } catch (error) {
      console.log("Error Deleting Multiple Notifications: ", error);
      throw new Error("Error Deleting Multiple Notifications");
    }
  }

  return (
    <NotificationContext.Provider value={{ cleaning, deleting, setNotificationRead, deleteAllNotifications, deleteNotifications, deleteMultipleNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
