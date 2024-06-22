import React, { useEffect, useState } from 'react';
import { Modal, Text, StyleSheet, View, TextInput, TouchableWithoutFeedback, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from "../contexts/ThemeContext"; // Zorg voor het juiste importpad
import { lightMapStyle, darkMapStyle } from "../themes/LightDarkMap"; // Zorg voor het juiste importpad

// Functie om gegevens van coffeeshops in Rotterdam op te halen uit een webservice
const loadCoffeeshopsData = async () => {
    try {
        const response = await fetch('https://stud.hosted.hr.nl/1055759/CoffeeShopDataRotterdam.JSON?t=${new Date().getTime()}');
        return await response.json();
    } catch (error) {
        console.error('Fout bij ophalen van coffeeshopgegevens:', error);
        return [];
    }
};

// Component voor de kaart
const MapComponent = ({ navigation, route }) => {
    // Staat voor de locatie van de gebruiker
    const [location, setLocation] = useState(null);
    // Staat voor de locaties van coffeeshops
    const [coffeeshops, setCoffeeshops] = useState([]);
    // Staat voor eventuele foutmeldingen
    const [errorMsg, setErrorMsg] = useState(null);
    // Staat voor geselecteerde coffeeshop details
    const [selectedShop, setSelectedShop] = useState(null);
    // Staat voor zichtbaarheid van de modale weergave
    const [modalVisible, setModalVisible] = useState(false);
    // Staat voor de geselecteerde marker op de kaart
    const [selectedMarker, setSelectedMarker] = useState(null);
    // Staat voor notities van de coffeeshop
    const [notes, setNotes] = useState('');
    // Staat voor opgeslagen coffeeshops
    const [savedCoffeeshops, setSavedCoffeeshops] = useState([]);

    const { theme } = useTheme(); // Gebruik het thema uit de themacontext

    useEffect(() => {
        // Functie voor het laden van initialisaties bij het mounten van het component
        (async () => {
            try {
                // Ophalen van coffeeshopgegevens
                const coffeeshopsData = await loadCoffeeshopsData();
                setCoffeeshops(coffeeshopsData);

                // Vragen om toestemming voor locatiegebruik
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Toestemming voor locatiegebruik geweigerd');
                    return;
                }

                // Huidige locatie ophalen
                let location = await Location.getCurrentPositionAsync({});
                setLocation(location);

                // Ophalen van opgeslagen coffeeshops
                const savedData = await AsyncStorage.getItem('savedCoffeeshops');
                if (savedData) {
                    setSavedCoffeeshops(JSON.parse(savedData));
                }
            } catch (error) {
                console.error("Fout in useEffect:", error);
            }
        })();
    }, []);

    // Effect om de detailpagina te tonen bij selecteren van coffeeshop vanuit de lijst
    useEffect(() => {
        if (route.params?.coffeeShop) {
            setSelectedShop(route.params.coffeeShop);
            setModalVisible(true);
        }
    }, [route.params?.coffeeShop]);

    // Functie om coffeeshop lokaal op te slaan in AsyncStorage
    const saveCoffeeshop = async () => {

        // coffeeshop en bijbehorende notitie ophalen
        const newSavedCoffeeshop = { ...selectedShop, notes };

        // kijken of deze coffeeshop al eerder is opgeslagen
        const existingIndex = savedCoffeeshops.findIndex(shop => shop.name === selectedShop.name);

        let updatedSavedCoffeeshops = [...savedCoffeeshops];

        if (existingIndex >= 0) {
            updatedSavedCoffeeshops[existingIndex] = newSavedCoffeeshop;
        } else {
            updatedSavedCoffeeshops = [...updatedSavedCoffeeshops, newSavedCoffeeshop];
        }

        // coffeeshop lokaal opslaan in async storage
        setSavedCoffeeshops(updatedSavedCoffeeshops);
        await AsyncStorage.setItem('savedCoffeeshops', JSON.stringify(updatedSavedCoffeeshops));
        setModalVisible(false);
    };

    // Functie voor het openen van de modale weergave met details van coffeeshop
    const openModal = (coffeeshop) => {
        setSelectedShop(coffeeshop);
        const existingShop = savedCoffeeshops.find(shop => shop.name === coffeeshop.name);
        setNotes(existingShop ? existingShop.notes : ''); // Notities instellen als deze bestaan
        setModalVisible(true);
        setSelectedMarker(coffeeshop.name); // Geselecteerde marker instellen op basis van naam
    };

    // Initiële regio als GPS niet is ingeschakeld
    const initialRegion = {
        latitude: 51.9225,
        longitude: 4.47917,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    // Bepalen van de regio voor de kaart
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
            backgroundColor: theme.colors.box,
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
            color: theme.colors.title
        },
        modalText: {
            color: theme.colors.text
        },
        notesInput: {
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            marginBottom: 15,
            width: '100%',
            padding: 10,
        },
        button: {
            marginVertical: 5,
            padding: 10,
            alignItems: 'center',
            backgroundColor: theme.colors.btn,
            borderRadius: 5,
        },
        buttonText: {
            color: theme.colors.title,
            fontWeight: 'bold',
        },
    });

    return (
        (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={region}
                showsUserLocation={true}
                customMapStyle={theme.dark ? darkMapStyle : lightMapStyle}
            >
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
            <Pressable style={styles.button} onPress={() => navigation.navigate('SavedCoffeeshopsList')}>
                <Text style={styles.buttonText}>Saved Coffee Shops</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => navigation.navigate('CoffeeShopList', { coffeeshops })}>
                <Text style={styles.buttonText}>Coffee Shops List</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => navigation.navigate('SettingsScreen')}>
                <Text style={styles.buttonText}>Settings</Text>
            </Pressable>
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
                                    <Text style={styles.modalText}>{`Opening Hours: ${selectedShop.opening_time} - ${selectedShop.closing_time}`}</Text>
                                    <Text style={styles.modalText}>{`Address: ${selectedShop.address}`}</Text>
                                    <TextInput
                                        style={styles.notesInput}
                                        placeholder="Add notes"
                                        value={notes}
                                        onChangeText={setNotes}
                                    />
                                    <Pressable style={styles.button} onPress={() => {saveCoffeeshop}}>
                                        <Text style={styles.buttonText}>Save</Text>
                                    </Pressable>
                                    <Pressable style={styles.button} onPress={() => setModalVisible(false)}>
                                        <Text style={styles.buttonText}>Close</Text>
                                    </Pressable>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </View>
    ));
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
