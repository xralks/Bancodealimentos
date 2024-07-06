// Welcome.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function Welcome({ navigation }) {
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logoO.png')}
        style={styles.logo}
      />
      <TouchableOpacity style={styles.button} onPress={navigateToLogin}>
        <Text style={styles.buttonText}>Comenzar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 190,
    height: 200,
    bordercolor: 'White',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 30,
  },
  button: {
    padding: 15,
    backgroundColor: '#77d353',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
