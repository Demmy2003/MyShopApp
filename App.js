// App.js

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapComponent from './app/components/MapComponent';
import CoffeeShopList from './app/components/ListComponent';
import SavedCoffeeshopsList from './app/components/SavedCoffeeshopsComponent';
import SettingsScreen from './app/components/SettingsComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './app/contexts/ThemeContext'; // Ensure correct import path
import { lightTheme, darkTheme } from './app/themes/LichtAndDarkTheme'; // Ensure correct import path

const Stack = createStackNavigator();

const AppContent = () => {
    let theme, toggleTheme;
    ({theme, toggleTheme} = useTheme());

    useEffect(() => {
        // Load saved mode from AsyncStorage on component mount
        loadMode();
    }, []);

    const loadMode = async () => {
        try {
            const savedMode = await AsyncStorage.getItem('theme');
            if (savedMode !== null) {
                toggleTheme(savedMode === 'dark');
            } else {
                toggleTheme(false); // Default to light mode if no mode saved
            }
        } catch (error) {
            console.error('Error loading theme mode from AsyncStorage:', error);
        }
    };

    useEffect(() => {
        console.log('Current Theme:', theme); // Log the current theme object
    }, [theme]);

    return (
        <NavigationContainer theme={theme}>
            <Stack.Navigator initialRouteName="Map">
                <Stack.Screen name="Map" component={MapComponent} />
                <Stack.Screen name="CoffeeShopList" component={CoffeeShopList} />
                <Stack.Screen name="SavedCoffeeshopsList" component={SavedCoffeeshopsList} />
                <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}
