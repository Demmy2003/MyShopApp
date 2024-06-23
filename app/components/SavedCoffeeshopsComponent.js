import React, { useEffect, useState } from 'react';
import {View, Text, FlatList, StyleSheet, TextInput, Button, Alert, Pressable, Share} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

const SavedCoffeeshopsList = ({ navigation }) => {
    // thema ophalen
    const { theme } = useTheme();
    // opgeslagen coffeeshops
    const [savedCoffeeshops, setSavedCoffeeshops] = useState([]);
    // om te editen
    const [editingShop, setEditingShop] = useState(null);
    // de notities
    const [notes, setNotes] = useState('');

    // opgeslagen coffeeshops ophalen uit async storage
    useEffect(() => {
        const loadSavedCoffeeshops = async () => {
            try {
                // Saved coffeeshops data in variabele zetteb
                const savedData = await AsyncStorage.getItem('savedCoffeeshops');
                // Als er data is, parse deze in globale array
                if (savedData) {
                    setSavedCoffeeshops(JSON.parse(savedData));
                }
                // errortje voor als het fout gaat
            } catch (error) {
                console.error('Error loading saved coffee shops:', error);
            }
        };
        loadSavedCoffeeshops();
    }, []);

    // Notities opslaan
    const saveNotes = async (shop) => {
        // Alle saved coffeeshops en de aangepaste notities in array zetten
        const updatedShops = savedCoffeeshops.map(item =>
            item.name === shop.name ? { ...item, notes } : item
        );
        // bestaande array updaten
        setSavedCoffeeshops(updatedShops);
        // async storage updaten
        await AsyncStorage.setItem('savedCoffeeshops', JSON.stringify(updatedShops));
        // edititng view weer uit zetten
        setEditingShop(null);
    };

    // Parameter meegeven in navigatie om naar de juiste marker te gaan op de map
    const navigateToShopOnMap = (shop) => {
        navigation.navigate('Map', { coffeeShop: shop });
    };

    // coffeeshop verwijderen uit saved lijst
    const deleteShop = async (shop) => {
        // eerst een alert of de gebruiker het zeker weet
        Alert.alert(
            "Delete Coffee Shop",
            "Are you sure you want to delete this coffee shop from your saved list?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    // op delete de coffeeshop verwijderen uit de pagina array en async storage
                    text: "Delete", style: "destructive", onPress: async () => {
                        const updatedShops = savedCoffeeshops.filter(item => item.name !== shop.name);
                        setSavedCoffeeshops(updatedShops);
                        await AsyncStorage.setItem('savedCoffeeshops', JSON.stringify(updatedShops));
                    }
                }
            ]
        );
    };

    // Delen van notities
    const shareNotes = async (shop) => {
        try {
            // coffeeshop naam en jou notitie delen
            await Share.share({
                message: `Notes for ${shop.name}: ${shop.notes}`,
            });
            // errortje als dat niet goed gaat
        } catch (error) {
            console.error('Error sharing notes:', error);
        }
    };

    // stylesheet voor opgeslagen coffeeshop lijst
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingTop: 20,
            backgroundColor: theme.colors.bg,
        },
        item: {
            margin: 10,
            padding: 20,
            backgroundColor: theme.colors.box,
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.title
        },
        notesInput: {
            height: 40,
            borderColor: theme.colors.btn,
            color: "#fff",
            backgroundColor: theme.colors.bg,
            borderWidth: 1,
            marginBottom: 15,
            marginTop: 10,
            width: '100%',
            padding: 10,
            borderRadius: 5,
        },
        textInput: {
            color: theme.colors.text
        },
        textInputNotes: {
            color: theme.colors.text,
            marginTop: 10
        },
        buttonContainer: {
            flexDirection: 'row', // Arrange children horizontally
            justifyContent: 'space-between', // Space between items
            alignItems: 'center', // Align items vertically
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
        buttonDel: {
            marginVertical: 5,
            padding: 10,
            alignItems: 'center',
            backgroundColor: '#a10d0d',
            borderRadius: 5,
        },
        buttonTextDel: {
            color: "#fff",
            fontWeight: 'bold',
        },

    });

    const renderShop = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.textInput}>{`Opening Hours: ${item.opening_time} - ${item.closing_time}`}</Text>
            {editingShop && editingShop.name === item.name ? (
                // Laat edit zien als je op de edit knop hebt geklikt
                <>
                    <TextInput
                        style={styles.notesInput}
                        value={notes}
                        onChangeText={setNotes}
                    />
                    <Pressable style={styles.button} onPress={() => saveNotes(item)}>
                        <Text style={styles.buttonText}>Save</Text>
                    </Pressable>
                </>
            ) : (
                // laat notities, edit delete en share knop zien als je niet aan het editen bent
                <>
                    <Text style={styles.textInputNotes}>{`Notes:`}</Text>
                    <Text style={styles.textInput}>{item.notes}</Text>
                    <View style={styles.buttonContainer}>
                        <Pressable style={styles.button} onPress={() => {
                            setEditingShop(item);
                            setNotes(item.notes);
                        }}>
                            <Text style={styles.buttonText}>Edit Notes</Text>
                        </Pressable>
                        <Pressable style={styles.button} onPress={() => shareNotes(item)}>
                            <Text style={styles.buttonText}>Share Notes</Text>
                        </Pressable>
                        <Pressable style={styles.buttonDel} onPress={() => deleteShop(item)}>
                            <Text style={styles.buttonTextDel}>Delete</Text>
                        </Pressable>
                    </View>
                </>
            )}
            {/*Laat deze coffeeshop zien op de kaart*/}
            <Pressable style={styles.button} onPress={() => navigateToShopOnMap(item)}>
                <Text style={styles.buttonText}>View on Map</Text>
            </Pressable>
        </View>
    );


    return (
        <View style={styles.container}>
            {/*voor elke coffeeshop zon div aanmaken als hierboven*/}
            <FlatList
                data={savedCoffeeshops}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderShop}
            />
        </View>
    );
};


export default SavedCoffeeshopsList;
