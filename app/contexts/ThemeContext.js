// ThemeContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../themes/LichtAndDarkTheme'; // Adjust the path as necessary

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedMode = await AsyncStorage.getItem('theme');
                setIsDarkMode(savedMode === 'dark');
            } catch (error) {
                console.error('Error loading theme:', error);
            }
        };

        loadTheme();
    }, []);

    const toggleTheme = async (value) => {
        try {
            setIsDarkMode(value);
            await AsyncStorage.setItem('theme', value ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
