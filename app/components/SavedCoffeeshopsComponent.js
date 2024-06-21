import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SavedCoffeeshopsList = ({ navigation }) => {
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

    const renderShop = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.title}>{item.name}</Text>
            <Text>{`Opening Hours: ${item.opening_time} - ${item.closing_time}`}</Text>
            <Text>{`Address: ${item.address}`}</Text>
            {editingShop && editingShop.name === item.name ? (
                <>
                    <TextInput
                        style={styles.notesInput}
                        value={notes}
                        onChangeText={setNotes}
                    />
                    <Button title="Save" onPress={() => saveNotes(item)} />
                </>
            ) : (
                <>
                    <Text>{`Notes: ${item.notes}`}</Text>
                    <Button title="Edit Notes" onPress={() => {
                        setEditingShop(item);
                        setNotes(item.notes);
                    }} />
                </>
            )}
            <Button title="View on Map" onPress={() => navigateToShopOnMap(item)} />
            <Button title="Delete" onPress={() => deleteShop(item)} />
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        backgroundColor: '#fff',
    },
    item: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
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

export default SavedCoffeeshopsList;
