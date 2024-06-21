import React from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';

const CoffeeShopList = ({ navigation, route }) => {
    const { coffeeshops } = route.params;

    if (!coffeeshops || !Array.isArray(coffeeshops)) {
        return (
            <View style={styles.container}>
                <Text>No coffee shops data available.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={coffeeshops}
                keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.title}>{item.name}</Text>
                        <Text>{`Opening Hours: ${item.opening_time} - ${item.closing_time}`}</Text>
                        <Button
                            title="Show on Map"
                            onPress={() => navigation.navigate('Map', { coffeeShop: item })}
                        />
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CoffeeShopList;
