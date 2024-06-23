// App.js

// react imports
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// user created imports
import MapComponent from './app/components/MapComponent';
import CoffeeShopList from './app/components/ListComponent';
import SavedCoffeeshopsList from './app/components/SavedCoffeeshopsComponent';
import SettingsScreen from './app/components/SettingsComponent';
import { ThemeProvider, useTheme } from './app/contexts/ThemeContext';

// hiermee kan je navigeren tussen de verschillende schermen
const Stack = createStackNavigator();

const AppContent = () => {
    // thema ophalen zodat de navbar ook een thema heeft
    let theme
    ({theme} = useTheme());

    return (
        // navbar met thema
        <NavigationContainer theme={theme}>
            <Stack.Navigator initialRouteName="Map">
                {/*// screens met unieke titel*/}
                <Stack.Screen name="Map" component={MapComponent} options={{ title: `My Shop Tracker` }} />
                <Stack.Screen name="CoffeeShopList" component={CoffeeShopList} options={{ title: `Coffee Shops` }} />
                <Stack.Screen name="SavedCoffeeshopsList" component={SavedCoffeeshopsList} options={{ title: `Saved Coffee Shops` }}/>
                <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: `Theme Settings` }}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default function App() {
    return (
        // thema provider toevoegen aan de app zodat je overal theme kan gebruiken
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}
