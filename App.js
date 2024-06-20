import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapComponent from "./app/components/MapComponent";

export default function App() {
    return (
        <View style={styles.container}>
            <MapComponent />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});