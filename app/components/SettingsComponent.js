// SettingsScreen.js

import React, { useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext'; // Adjust the path as necessary

const SettingsScreen = () => {
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
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

    const handleModeChange = async (value) => {
        try {
            toggleTheme(value); // Toggle theme based on mode change
            await AsyncStorage.setItem('theme', value ? 'dark' : 'light'); // Save mode to AsyncStorage
        } catch (error) {
            console.error('Error saving theme mode to AsyncStorage:', error);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            backgroundColor: theme.colors.bg, // Use theme colors for background
        },
        header: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 20,
            color: theme.colors.title, // Use theme colors for text
        },
        option: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
        },
        optionText: {
            fontSize: 18,
            color: theme.colors.txt, // Use theme colors for text
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Settings</Text>
            <View style={styles.option}>
                <Text style={styles.optionText}>Dark Mode</Text>
                <Switch
                    value={theme.mode === 'dark'}
                    onValueChange={handleModeChange}
                    trackColor={{ false: "#767577", true: "#ac5b20" }}
                    thumbColor={theme.mode === 'dark' ? "#ffb280" : "#f4f3f4"}
                />
            </View>
            <View style={styles.option}>
                <Text style={styles.optionText}>Light Mode</Text>
                <Switch
                    value={theme.mode === 'light'}
                    onValueChange={(value) => handleModeChange(!value)}
                    trackColor={{ false: "#767577", true: "#774016" }}
                    thumbColor={theme.mode === 'light' ? "#f49153" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                />
            </View>
        </View>
    );
};

export default SettingsScreen;
