const { useContext, useState } = require("react");
const { createContext } = require("react");

const Server_API = "http://192.168.68.102:2002/api";

const TransactionImageContext = createContext();

export const TransactionImageProvider = ({ children }) => {
  const [imageUploading, setImageUploading] = useState(false);

  async function uploadExistingTransImage(
    transactionId,
    imageURI,
    existingImageURL
  ) {
    try {
      setImageUploading(true);

      // Step 1: Delete Existing Image if it Exists
      if (existingImageURL) {
        const deleteResponse = await fetch(
          `${Server_API}/transaction-image/${storedUserId}/${transactionId}/?imageURL=${existingImageURL}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageURL: existingImageURL }),
          }
        );

        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete existing image`);
        }
        console.log("Existing image deleted successfully");
      }

      // Step 2: Upload New Image
      const formData = new FormData();
      const response = await fetch(imageURI);
      const blob = await response.blob();
      const fileName = `image_${Date.now()}.jpg`;

      formData.append("file", {
        uri: imageURI,
        type: blob.type || "image/jpeg",
        name: fileName,
      });

      const uploadResponse = await fetch(
        `${Server_API}/transaction-image/${storedUserId}/${transactionId}`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image.");
      }

      const uploadResult = await uploadResponse.json();
      console.log(
        "Image uploaded successfully:",
        uploadResult.user_transaction_image
      );

      return uploadResult.user_transaction_image;
    } catch (error) {
      console.error("Image Upload Error:", error);
      throw error;
    } finally {
      setImageUploading(false);
    }
  }

  async function deleteExistingTransImage(transactionId, imageURI) {
    try {
      setImageUploading(true);

      // Step 1: Delete Existing Image if it Exists
      const deleteResponse = await fetch(
        `${Server_API}/transaction-image/${storedUserId}/${transactionId}/?imageURL=${imageURI}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageURI }),
        }
      );

      if (!deleteResponse.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete existing image`);
      }

      console.log("Existing image deleted successfully");
    } catch (error) {
      console.log("Image Delete Error:", error);
      throw new Error("Image Delete Error");
    } finally {
      setImageUploading(false);
    }
  }

  async function deleteImage(imageURL) {
    try {
      if (!imageURL) return;

      const deleteResponse = await fetch(
        `${Server_API}/only-image/?imageURL=${imageURL}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageURL }),
        }
      );

      if (!deleteResponse.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete image.`);
      }

      console.log("Only Image deleted successfully:", imageURL);

      return null;
    } catch (error) {
      console.log("Error Deleting Image:", error);
      throw new Error("Error Deleting Image");
    }
  }

  async function uploadImage(imageURL) {
    try {
      setImageUploading(true);

      if (!imageURL) return;

      const formData = new FormData();
      const response = await fetch(imageURL);
      const blob = await response.blob();
      const fileName = `image_${Date.now()}.jpg`;

      formData.append("file", {
        uri: imageURL,
        type: blob.type || "image/jpeg",
        name: fileName,
      });

      const uploadResponse = await fetch(`${Server_API}/only-image`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!uploadResponse.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload image.");
      }

      const uploadResult = await uploadResponse.json();
      console.log("Only Image uploaded successfully:", uploadResult.image);

      return uploadResult.image;
    } catch (error) {
      console.log("Error Uploading Image:", error);
      throw new Error("Error Uploading Image");
    } finally {
      setImageUploading(false);
    }
  }

  return (
    <TransactionImageContext.Provider
      value={{
        uploadExistingTransImage,
        deleteExistingTransImage,
        imageUploading,
        uploadImage,
        deleteImage,
      }}
    >
      {children}
    </TransactionImageContext.Provider>
  );
};

export const useTransactionImage = () => useContext(TransactionImageContext);
