import React, { useEffect, useState } from 'react';
import {View, Text, FlatList, StyleSheet, TextInput, Button, Alert, Pressable} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

const SavedCoffeeshopsList = ({ navigation }) => {
    const { theme } = useTheme();
    const [savedCoffeeshops, setSavedCoffeeshops] = useState([]);
    const [editingShop, setEditingShop] = useState(null);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const loadSavedCoffeeshops = async () => {
            try {
                const savedData = await AsyncStorage.getItem('savedCoffeeshops');
                if (savedData) {
                    setSavedCoffeeshops(JSON.parse(savedData));
                }
            } catch (error) {
                console.error('Error loading saved coffee shops:', error);
            }
        };

        loadSavedCoffeeshops();
    }, []);

    // Notities opslaan
    const saveNotes = async (shop) => {
        const updatedShops = savedCoffeeshops.map(item =>
            item.name === shop.name ? { ...item, notes } : item
        );
        setSavedCoffeeshops(updatedShops);
        await AsyncStorage.setItem('savedCoffeeshops', JSON.stringify(updatedShops));
        setEditingShop(null);
    };

    const navigateToShopOnMap = (shop) => {
        navigation.navigate('Map', { coffeeShop: shop });
    };

    const deleteShop = async (shop) => {
        Alert.alert(
            "Delete Coffee Shop",
            "Are you sure you want to delete this coffee shop from your saved list?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: async () => {
                        const updatedShops = savedCoffeeshops.filter(item => item.name !== shop.name);
                        setSavedCoffeeshops(updatedShops);
                        await AsyncStorage.setItem('savedCoffeeshops', JSON.stringify(updatedShops));
                    }
                }
            ]
        );
    };

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
            borderColor: 'gray',
            borderWidth: 1,
            marginBottom: 15,
            width: '100%',
            padding: 10,
            backgroundColor: theme.colors.bg,
            color: theme.colors.text
        },
        textInput: {
            color: theme.colors.text
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
        }
    });

    const renderShop = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.textInput}>{`Opening Hours: ${item.opening_time} - ${item.closing_time}`}</Text>
            {editingShop && editingShop.name === item.name ? (
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
                <>
                    <Text style={styles.textInput}>{`Notes: ${item.notes}`}</Text>
                    <Pressable style={styles.button} onPress={() => {
                        setEditingShop(item);
                        setNotes(item.notes);
                    }}>
                        <Text style={styles.buttonText}>Edit Notes</Text>
                    </Pressable>
                </>
            )}
            <Pressable style={styles.button} onPress={() => navigateToShopOnMap(item)}>
                <Text style={styles.buttonText}>View on Map</Text>
            </Pressable>
            <Pressable style={styles.buttonDel} onPress={() => deleteShop(item)}>
                <Text style={styles.buttonTextDel}>Delete</Text>
            </Pressable>
        </View>
    );


    return (
        <View style={styles.container}>
            <FlatList
                data={savedCoffeeshops}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderShop}
            />
        </View>
    );
};


export default SavedCoffeeshopsList;
