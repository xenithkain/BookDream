import React, { createContext, useState, useContext } from "react";

const UserSettingsContext = createContext();

export const UserSettingsProvider = ({children}) => {
    const [userColors, setUserColors] = useState({
        mainColor: '#ffffff',
        secondaryColor: '#000000'
    })

    const changeColors = (newColors) => {
        setUserColors(newColors);
        document.documentElement.style.setProperty('--main-color', userColors.mainColor);
        document.documentElement.style.setProperty('--secondary-color', userColors.secondaryColor);

    }

    return (
        <UserSettingsContext.Provider value={{userColors, changeColors}}>
            {children}
        </UserSettingsContext.Provider>
    );
}

export const UseUserSettings = () => useContext(UserSettingsContext);