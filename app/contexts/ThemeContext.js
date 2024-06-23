// ThemeContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../themes/LichtAndDarkTheme'; // Adjust the path as necessary

// maak een context aan voor thema info
const ThemeContext = createContext();

// haal het thema op dat is opgeslagen in de context
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// provider aanmaken voor beheren van thema's
export const ThemeProvider = ({ children }) => {
    // staat voor bepaling dark mode
    const [isDarkMode, setIsDarkMode] = useState(false);

    // thema data ophalen bij inladen van app
    useEffect(() => {
        const loadTheme = async () => {
            try {
                // modus uit async storage halen
                const savedMode = await AsyncStorage.getItem('theme');
                // darkmode instellen op basis van async
                setIsDarkMode(savedMode === 'dark');
            } catch (error) {
                console.error('Error loading theme:', error);
            }
        };

        loadTheme();
    }, []);

    // thema wisselen tussen light en donker
    const toggleTheme = async (value) => {
        try {
            // staat van darkmode updaten
            setIsDarkMode(value);
            // nieuwe staat in async storage zetten
            await AsyncStorage.setItem('theme', value ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    // thema bepalen op basis van huidige donekere staat, geresulteert uit async storage
    const theme = isDarkMode ? darkTheme : lightTheme;

    // geef thema en toggletheme door om later te gebruiken
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
