import React from 'react';
import {View, Text, FlatList, StyleSheet, Pressable} from 'react-native';
import {useTheme} from "../contexts/ThemeContext";

const CoffeeShopList = ({ navigation, route }) => {
    // coffeeshops
    const { coffeeshops } = route.params;
    //thema ophalen
    const { theme } = useTheme();

// stylesheet in const zodat ik theme kan gebruiken
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            backgroundColor: theme.colors.box,
        },
        item: {
            margin: 10,
            padding: 20,
            backgroundColor: theme.colors.bg,
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.title
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
    });

    // checken of er coffeeshops zijn, anders weergeven in html
    if (!coffeeshops || !Array.isArray(coffeeshops)) {
        return (
            <View style={styles.container}>
                <Text>No coffee shops data available.</Text>
            </View>
        );
    }

    // wat de gebruiker te zien krijgt als er wel coffeeshops zijn
    return (
        <View style={styles.container}>
            {/*lijst van coffeeshops, vegelijkmaar met foreach*/}
            <FlatList
                data={coffeeshops}
                keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.title}>{item.name}</Text>
                        <Text style={styles.textInput}>{`Opening Hours: ${item.opening_time} - ${item.closing_time}`}</Text>
                        <Pressable style={styles.button} onPress={() => navigation.navigate('Map', { coffeeShop: item })}>
                            <Text style={styles.buttonText}>Show on Map</Text>
                        </Pressable>
                    </View>
                )}
            />
        </View>
    );
};



export default CoffeeShopList;
