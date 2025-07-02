const { useContext, useState } = require("react");
const { createContext } = require("react");

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    /** @type {[string|null, (v: string|null) => void]} */
    const [profilePhoto, setProfilePhoto] = useState(null);

    const setProfilePhotoWithLog = (value) => {
        console.log("ProfilePhoto Context: Setting profile photo:", value ? "Has value" : "No value");
        setProfilePhoto(value);
    };

    return (
        <ProfileContext.Provider
            value={{ profilePhoto, setProfilePhoto: setProfilePhotoWithLog }}
        >
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () =>
    useContext(ProfileContext);
