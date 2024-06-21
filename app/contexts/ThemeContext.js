import React, { createContext, useState, useEffect, useContext } from 'react';
import { AsyncStorage } from 'react-native';

// Create a context for the theme
const ThemeContext = createContext();

// Custom hook to access the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false); // Default is light mode

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const themeValue = await AsyncStorage.getItem('theme');
                if (themeValue !== null) {
                    setIsDarkMode(themeValue === 'dark');
                }
            } catch (error) {
                console.error('Error loading theme:', error);
            }
        };

        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        try {
            await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const theme = {
        isDarkMode,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};
