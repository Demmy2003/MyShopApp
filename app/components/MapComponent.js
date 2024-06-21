import React, { useEffect, useState } from 'react';
import { Button, Modal, Text, StyleSheet, View, TextInput, TouchableWithoutFeedback } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Data van coffeeshops in rotterdam ophalen uit webservice
const loadCoffeeshopsData = async () => {
    try {
        const response = await fetch('https://stud.hosted.hr.nl/1055759/CoffeeShopDataRotterdam.JSON?t=${new Date().getTime()}');
        return await response.json();
    } catch (error) {
        console.error('Error fetching coffeeshop data:', error);
        return [];
    }
};

// Component van de kaart
const MapComponent = ({ navigation, route }) => {
    // jouw locatie
    const [location, setLocation] = useState(null);
    // locaties van coffeeshops
    const [coffeeshops, setCoffeeshops] = useState([]);
    // error
    const [errorMsg, setErrorMsg] = useState(null);
    // details
    const [selectedShop, setSelectedShop] = useState(null);
    // ga naar details vanuit coffeeshopList
    const [modalVisible, setModalVisible] = useState(false);
    // geselecteerde marker
    const [selectedMarker, setSelectedMarker] = useState(null);
    // notes
    const [notes, setNotes] = useState('');
    // saved coffee shops
    const [savedCoffeeshops, setSavedCoffeeshops] = useState([]);


    useEffect(() => {
        (async () => {
            try {
                // coffeeshop data ophalen
                const coffeeshopsData = await loadCoffeeshopsData();
                setCoffeeshops(coffeeshopsData);

                // toestemming vragen voor locatie gebruiken
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                    return;
                }

                // current location ophalen
                let location = await Location.getCurrentPositionAsync({});
                setLocation(location);

                // load saved coffee shops
                const savedData = await AsyncStorage.getItem('savedCoffeeshops');
                if (savedData) {
                    setSavedCoffeeshops(JSON.parse(savedData));
                }
            } catch (error) {
                console.error("Error in useEffect:", error);
            }
        })();
    }, []);

    // Detail pagina laten zien als je uit de lijst naar de coffeeshop gaat op de kaart
    useEffect(() => {
        if (route.params?.coffeeShop) {
            setSelectedShop(route.params.coffeeShop);
            setModalVisible(true);
        }
    }, [route.params?.coffeeShop]);


    // SLaat de coffeeshops locaal op in Async Storage
    const saveCoffeeshop = async () => {
        const newSavedCoffeeshop = { ...selectedShop, notes };
        const existingIndex = savedCoffeeshops.findIndex(shop => shop.name === selectedShop.name);
        let updatedSavedCoffeeshops = [...savedCoffeeshops];

        if (existingIndex >= 0) {
            updatedSavedCoffeeshops[existingIndex] = newSavedCoffeeshop;
        } else {
            updatedSavedCoffeeshops = [...updatedSavedCoffeeshops, newSavedCoffeeshop];
        }

        setSavedCoffeeshops(updatedSavedCoffeeshops);
        await AsyncStorage.setItem('savedCoffeeshops', JSON.stringify(updatedSavedCoffeeshops));
        setModalVisible(false);
    };

    const openModal = (coffeeshop) => {
        setSelectedShop(coffeeshop);
        const existingShop = savedCoffeeshops.find(shop => shop.name === coffeeshop.name);
        setNotes(existingShop ? existingShop.notes : ''); // Set notes if it exists
        setModalVisible(true);
        setSelectedMarker(coffeeshop.name); // Set selected marker name
    };

    // locatie die hij gebruikt als GPS uit staat
    const initialRegion = {
        latitude: 51.9225,
        longitude: 4.47917,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    // bepalen van de regio
    const region = selectedShop
        ? {
            latitude: selectedShop.latitude,
            longitude: selectedShop.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }
        : location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }
            : initialRegion;

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
                        onPress={() => openModal(coffeeshop)}
                        pinColor={selectedMarker === coffeeshop.name ? 'blue' : 'red'} // Check against selected marker name
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
            <Button
                title="View Coffee Shops List"
                onPress={() => navigation.navigate('CoffeeShopList', { coffeeshops })}
            />
            <Button
                title="View Saved Coffee Shops"
                onPress={() => navigation.navigate('SavedCoffeeshopsList')}
            />
            {selectedShop && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback onPress={() => {}}>
                                <View style={styles.modalView}>
                                    <Text style={styles.modalTitle}>{selectedShop.name}</Text>
                                    <Text>{`Opening Hours: ${selectedShop.opening_time} - ${selectedShop.closing_time}`}</Text>
                                    <Text>{`Address: ${selectedShop.address}`}</Text>
                                    <TextInput
                                        style={styles.notesInput}
                                        placeholder="Add notes"
                                        value={notes}
                                        onChangeText={setNotes}
                                    />
                                    <Button title="Save" onPress={saveCoffeeshop} />
                                    <Button title="Close" onPress={() => setModalVisible(false)} />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    notesInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        width: '100%',
        padding: 10,
    },
});

export default MapComponent;
