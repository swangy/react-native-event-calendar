import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const EmptyEvent = () => (
  <View style={styles.container} />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    elevation: 6,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4.65,
    shadowOffset: { width: 0, height: 4 },
  },
});

export default EmptyEvent;
