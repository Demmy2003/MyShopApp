// SettingsScreen.js

import React, { useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext'; // Adjust the path as necessary

const SettingsScreen = () => {
    // theme en toggletheme ophalen uit themaContext
    const { theme, toggleTheme } = useTheme();

    // thema inladen als pagina inlaadt
    useEffect(() => {
        loadMode();
    }, []);


    // functiee om thema in te laden uit async
    const loadMode = async () => {
        try {
            // thema ophalen uit async
            const savedMode = await AsyncStorage.getItem('theme');
            // als waarde uit uit async storage komt, geef deze door aan thema
            if (savedMode !== null) {
                toggleTheme(savedMode === 'dark');
            } else {
                // anders zet thema op lightmode
                toggleTheme(false);
            }
        } catch (error) {
            console.error('Error loading theme mode from AsyncStorage:', error);
        }
    };

    // thema waarde veranderen bij schakelen van switch
    const handleModeChange = async (value) => {
        try {
            toggleTheme(value); // thema wijzigen op schakelaar waarde
            await AsyncStorage.setItem('theme', value ? 'dark' : 'light'); // thema opslaan in AsyncStorage
        } catch (error) {
            console.error('Error saving theme mode to AsyncStorage:', error); // errortje
        }
    };

    // stylesheetjee
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            backgroundColor: theme.colors.bg, // thema kleuren voor background
        },
        header: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 20,
            color: theme.colors.title, // thema kleuren voor title
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
            color: theme.colors.txt, // thema kleuren voor text
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Settings</Text>
            {/*Switch voor donkere vs lichte  thema*/}
            <View style={styles.option}>
                <Text style={styles.optionText}>Dark Mode</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#ac5b20" }}
                    thumbColor={theme.dark  ? "#ffb280" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={handleModeChange}
                    value={theme.dark }
                />
            </View>
            <View style={styles.option}>
                <Text style={styles.optionText}>Light Mode</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#774016" }}
                    thumbColor={!theme.dark  ? "#f49153" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={(value) => handleModeChange(!value)}
                    value={!theme.dark }
                />
            </View>
        </View>
    );
};

export default SettingsScreen;
