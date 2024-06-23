import React, {useEffect, useRef, useState} from 'react';
import { Modal, Text, StyleSheet, View, TextInput, TouchableWithoutFeedback, Animated, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from "../contexts/ThemeContext"; // Zorg voor het juiste importpad
import { lightMapStyle, darkMapStyle } from "../themes/LightDarkMap";

// Functie om gegevens van coffeeshops in Rotterdam op te halen uit een webservice
const loadCoffeeshopsData = async () => {
    try {
        const response = await fetch('https://stud.hosted.hr.nl/1055759/CoffeeShopDataRotterdam.JSON');
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

    const slideAnim = useRef(new Animated.Value(0)).current;

    // Functie voor het laden van coffeeshops, localstorage en locatie toestemming om de kaart voor te bereiden
    useEffect(() => {
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
            slideUp();
        }
    }, [route.params?.coffeeShop]);

    // Functie om coffeeshop lokaal op te slaan in AsyncStorage
    const saveCoffeeshop = async () => {

        // coffeeshop en bijbehorende notitie ophalen
        // selectedshop wordt ingesteld tijdens het klikken op een marker
        const newSavedCoffeeshop = { ...selectedShop, notes };

        // kijken of deze coffeeshop al eerder is opgeslagen
        const existingIndex = savedCoffeeshops.findIndex(shop => shop.name === selectedShop.name);

        let updatedSavedCoffeeshops = [...savedCoffeeshops];

        // als coffeeshop al bestaat deze updaten anders nieuwe opslaan
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
        // geselecteerde coffeeshop ophalen
        setSelectedShop(coffeeshop);
        // kijken of die bestaat
        const existingShop = savedCoffeeshops.find(shop => shop.name === coffeeshop.name);
        // Notities instellen als deze bestaan
        setNotes(existingShop ? existingShop.notes : '');
        setModalVisible(true);
        slideUp();
        // Geselecteerde marker instellen op basis van naam
        setSelectedMarker(coffeeshop.name);
    };

    // als je op close klikt of buiten het model klikt slide down aansturen
    const closeModal = () => {
        slideDown(() => {
            setModalVisible(false);
        });
    };

    // Functie om model omhoog te schuiven
    const slideUp = () => {
        Animated.timing(slideAnim, {        // getimede animatie met globale sideAnim waarde
            toValue: 1,                         // waarde op 1 (omhoog) zetten
            duration: 500,                      // 5 miliseconde
            useNativeDriver: true,
        }).start();
    };

    // Funnctie om model omlaag te schuiven met callback
    const slideDown = (callback) => {
        Animated.timing(slideAnim, {  // getimede animatie met sideAnim waarde
            toValue: 0,                     // waarde op 0 (omlaag) zetten
            duration: 300,                  // 3 miliseconde animatie
            useNativeDriver: true,          // native driver gebruiken
        }).start(callback);                 // starten en callback uitvoeren als hij klaar is
    };

    // animatiestijl definieren
    const slideInStyle = {
        // vertical transformeren (onder naar boven)
        transform: [{
            translateY: slideAnim.interpolate({        // y wordt aangepast aan slideAnim waarde
                inputRange: [0, 1],                         // slideAnim varieert tusesn 0 en 1
                outputRange: [500, 0],                      // output(y) veranderd tussen 500 (uit het scherm) en 0 (in het scherm)
            })
        }]
    };

    // Initiële regio als GPS niet is ingeschakeld
    const initialRegion = {
        latitude: 51.9225,
        longitude: 4.47917,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    // Bepalen van de regio waar de kaart heen gaat
    const region = selectedShop
        // eerst naar selected shop
        ? {
            latitude: selectedShop.latitude,
            longitude: selectedShop.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }
        // als geen selected coffeeshop is naar jouw huidige locatie
        : location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }
            // ook geen huidige locatie dan naar initial regio
            : initialRegion;

    // stylesheetje voor de buttons en modal
    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        map: {
            flex: 1,
        },
        modalOverlay: {
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        modalView: {
            margin: 20,
            borderWidth: 1,
            borderColor: theme.colors.btn,
            marginBottom: 0,
            backgroundColor: theme.colors.box,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 35,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 15,
            color: theme.colors.title
        },
        modalText: {
            color: theme.colors.txt
        },
        notesInput: {
            height: 40,
            borderColor: theme.colors.btn,
            color: "#fff",
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            marginBottom: 15,
            marginTop: 10,
            width: '100%',
            padding: 10,
            borderRadius: 5,
        },
        button: {
            marginVertical: 5,
            padding: 10,
            alignItems: 'center',
            backgroundColor: theme.colors.btn,
            borderRadius: 5,
            margin: 4,
        },
        buttonText: {
            color: theme.colors.title,
            fontWeight: 'bold',
        },
    });

    return (
        (
        <View style={styles.container}>
            {/*de kaart*/}
            <MapView
                style={styles.map}
                region={region}
                showsUserLocation={true}
                customMapStyle={theme.dark ? darkMapStyle : lightMapStyle}  // de kaart kleur op basis van het thema
            >
                {/*De markers voor coffeeshops*/}
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
                    />
                ))}
                {/*Locatie marker van de gebruiker*/}
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
            {/*kleine nav voor nagiveren naar verschillende pagina's*/}
            <Pressable style={styles.button} onPress={() => navigation.navigate('SavedCoffeeshopsList')}>
                <Text style={styles.buttonText}>Saved Coffee Shops</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => navigation.navigate('CoffeeShopList', { coffeeshops })}>
                <Text style={styles.buttonText}>Coffee Shops List</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => navigation.navigate('SettingsScreen')}>
                <Text style={styles.buttonText}>Settings</Text>
            </Pressable>
            {/*detail modal met slide effect*/}
            {selectedShop && (
                <Modal
                    transparent={true}
                    animationType="none"
                    visible={modalVisible}
                    onRequestClose={closeModal}
                >
                    <TouchableWithoutFeedback onPress={closeModal}>
                        <View style={styles.modalOverlay}>
                            <Animated.View style={[styles.modalView, slideInStyle]}>
                                {/*Details*/}
                                <Text style={styles.modalTitle}>{selectedShop?.name}</Text>
                                <Text style={styles.modalText}>Opening Hours: {selectedShop?.opening_time} - {selectedShop?.closing_time}</Text>
                                {/*Notitie invoer veld*/}
                                <TextInput
                                    style={styles.notesInput}
                                    onChangeText={setNotes}
                                    value={notes}
                                    placeholder="Enter your notes"
                                />
                                {/*Opslaan en sluit buttons*/}
                                <Pressable style={styles.button} onPress={saveCoffeeshop}>
                                    <Text style={styles.buttonText}>Save Coffee Shop</Text>
                                </Pressable>
                                <Pressable style={styles.button} onPress={closeModal}>
                                    <Text style={styles.buttonText}>Close</Text>
                                </Pressable>
                            </Animated.View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </View>
    ));
};


export default MapComponent;
