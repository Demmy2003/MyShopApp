import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapComponent from './app/components/MapComponent';
import CoffeeShopList from './app/components/ListComponent';
import SavedCoffeeshopsList from './app/components/SavedCoffeeshopsComponent'



const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Map">
                <Stack.Screen name="Map" component={MapComponent} />
                <Stack.Screen name="CoffeeShopList" component={CoffeeShopList} />
                <Stack.Screen name="SavedCoffeeshopsList" component={SavedCoffeeshopsList} />

            </Stack.Navigator>
        </NavigationContainer>
    );
}
