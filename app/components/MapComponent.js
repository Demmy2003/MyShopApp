import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const loadCoffeeshopsData = async () => {
    try {
        const response = await fetch('https://stud.hosted.hr.nl/1055759/CoffeeShopDataRotterdam.JSON?t=${new Date().getTime()}');
        const data = await response.json();
        console.log("Fetched museum data:", data);
        return data;
    } catch (error) {
        console.error('Error fetching museum data:', error);
        return [];
    }
};

const MapComponent = () => {
    const [location, setLocation] = useState(null);
    const [coffeeshops, setCoffeeshops] = useState([]);
    const [errorMsg, setErrorMsg] = useState(null);


    useEffect(() => {
        (async () => {
            try {
                // Load coffeeshops data
                const coffeeshopsData = await loadCoffeeshopsData();
                setCoffeeshops(coffeeshopsData);

                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
                setLocation(location);
            } catch (error) {
                console.error("Error in useEffect:", error);
            }
        })();
    }, []);

    const region = location
        ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        }
        : {
            latitude: 51.9225,
            longitude: 4.47917,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        };

    return (
        <View style={styles.container}>
            <MapView style={styles.map} region={region} showsUserLocation={true}>
                {Array.isArray(coffeeshops) && coffeeshops.map((coffeeshop, index) => (
                    <Marker
                        key={index}
                        coordinate={{
                            latitude: coffeeshop.latitude,
                            longitude: coffeeshop.longitude,
                        }}
                        title={coffeeshop.name}
                        description={`Opening Hours: ${coffeeshop.opening_time} - ${coffeeshop.closing_time}`}
                    />
                ))}
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        title="Your Location"
                    />
                )}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});

console.log('test')

export default MapComponent;