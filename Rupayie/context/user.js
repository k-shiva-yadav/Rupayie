import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";

const { useContext, createContext, useState } = require("react");

// const Server_API = "https://expense-trackerr-server.vercel.app/api";
const Server_API = "http://192.168.68.102:2002/api";

const UserContext = createContext();

export const UserDetailsProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState();
  const [transactionsList, setTransactionsList] = useState();
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [trashTransactions, setTrashTransactions] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  const [categoriesList, setCategoriessList] = useState([]);
  const [peopleList, setPeopleList] = useState([]);
  const [budgetList, setBudgetList] = useState([]);
  const [sharedLinks, setSharedLinkst] = useState([]);
  const [currencyObj, setCurrencyObj] = useState({
    symbol: "₹",
    side: "left",
    decimalSeparator: ".",
    thousandSeparator: ",",
  });
  const [autoCleanTrash, setAutoCleanTrash] = useState(false);
  const [biometricFlag, setBiometricFlag] = useState(false);

  const [loadingUserDetails, setLoadingUserDetails] = useState(true);
  const [savingUserName, setSavingUserName] = useState(false);
  const [savingUserProfile, setSavingUserProfile] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const [error, setError] = useState(null);

  const fetchUserDetails = async () => {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      setLoadingUserDetails(true);

      const response = await fetch(`${Server_API}/users/${storedUserId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setUserDetails(data);
      setLoadingUserDetails(false);
      
      console.log("User Context: Fetched user details, userImage:", data.userImage ? "Has image" : "No image");

      setTransactionsList(
        data.transactions.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      setRecentTransactions(
        data.transactions
          .slice(0, 5)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      );
      setRecurringTransactions(
        data.recuringTransactions
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      );
      setNotificationsList(
        data.notifications.reverse()
        // .sort(
        //   (a, b) =>
        //     new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        // )
      );
      setTrashTransactions(
        data.trash.sort(
          (a, b) =>
            new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
        )
      );

      setSharedLinkst(data.sharedLinks);
      setCategoriessList(data.categories);
      setPeopleList(data.people);
      setBudgetList(data.budgets);
      setCurrencyObj(data.settings.currency);
      setAutoCleanTrash(data.settings.autoCleanTrash);
      setBiometricFlag(data.biometric);

      // console.log("Fetched User Details");
    } catch (error) {
      console.log("Error Fetching User Details Data: ", error);
      throw new Error("Error Fetching User Details Data");
    }
  };

  const updateUserDetails = async (values, field) => {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      if (field === "name") setSavingUserName(true);
      else setSavingUserProfile(true);

      const response = await fetch(
        `${Server_API}/users/${storedUserId}/`,
        {
          method: "PUT",
          body: JSON.stringify(values),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user details");
      }

      setSavingUserName(false)
      setSavingUserProfile(false)
      // console.log("User Details Updated Successfully");
    } catch (error) {
      setSavingUserName(false)
      setSavingUserProfile(false)
      console.error("Error Updating User Details Data: ", error);
      throw new Error("Error Updating User Details Data");
    }
  }

  async function handleBiometricToggle(biometricFlag) {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      const response = await fetch(
        `${Server_API}/users/${storedUserId}`,
        {
          method: "PUT",
          body: JSON.stringify({ biometric: biometricFlag }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to Toggled Biometric");
      }

      const data = await response.json();

      // console.log("Sucessfully Toggled Biometric to: ", data.settings.autoCleanTrash)
    } catch (error) {
      console.log("Error Turning Switching Biometric:", error);
      throw new Error("Error Turning Switching Biometric");
    }
  }

  async function deletAccount() {
    const storedUserId = await AsyncStorage.getItem("loggedUserId");

    try {
      setDeletingUser(true);

      const response = await fetch(
        `${Server_API}/users/${storedUserId}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        setDeletingUser(false);
        throw new Error("Failed to delete user: ", response.status);
      }

      setDeletingUser(false);
      return true;
    } catch (error) {
      setDeletingUser(false);
      console.error("Error Deleting User: ", error);
      return false;
    }
  }

  const pickImageFromFiles = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        const base64Image = `data:image/png;base64,${selectedAsset.base64}`;
        setUserProfile({ uri: selectedAsset.uri });
        setSelectedImageBase64(base64Image);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  async function handleSaveProfile() {
    try {
      if (userProfile === userDetails?.userImage) {
        setShowProfilePicker(false);
        return;
      }

      let imageUrl = userProfile;
      if (selectedImageBase64) {
        // Upload to backend
        const res = await axios.post(
          `${Server_API}/users/${userDetails.userId}/upload-profile-image`,
          { image: selectedImageBase64 }
        );
        imageUrl = res.data.userImage;
      }

      setProfilePhoto(typeof imageUrl === "string" ? imageUrl : imageUrl?.uri || null);
      setShowProfilePicker(false);

      await updateUserDetails(
        { ...userDetails, userImage: typeof imageUrl === "string" ? imageUrl : imageUrl?.uri || null },
        "profile"
      );
      await fetchUserDetails();

      setMessageText("Successfully Saved Avatar :)")
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error || JSON.stringify(error.response.data));
      } else if (error.request) {
        setError("No response from server. Check your network and backend.");
      } else {
        setError("Error: " + error.message);
      }
    }
  }

  return (
    <UserContext.Provider
      value={{
        userDetails,
        setUserDetails,
        loadingUserDetails,
        setLoadingUserDetails,
        savingUserName,
        savingUserProfile,
        fetchUserDetails,
        updateUserDetails,
        deletingUser,
        deletAccount,
        transactionsList,
        recentTransactions,
        recurringTransactions,
        trashTransactions,
        notificationsList,
        sharedLinks,
        categoriesList,
        peopleList,
        budgetList,
        currencyObj,
        autoCleanTrash,
        biometricFlag,
        handleBiometricToggle,
        pickImageFromFiles,
        handleSaveProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserData = () => useContext(UserContext);
