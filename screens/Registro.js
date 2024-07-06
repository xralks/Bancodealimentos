// Registro.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { supabase } from '../lib/supabase'; 

const Registro = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setLoading(false);
      Alert.alert('Error', signUpError.message);
      return;
    }


    const { user } = signUpData;
    const { error: profileError } = await supabase
    setLoading(false);

    if (profileError) {
      Alert.alert('Error', profileError.message);
    } else {
      Alert.alert('Éxito', 'Verifica tu correo electrónico para completar el registro.');


      setEmail('');
      setPassword('');
      setConfirmPassword('');


      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingresa tus datos para crear tu cuenta de Banco de Alimentos.</Text>
      <View>
        <Image source={require('../assets/logo.png')} style={styles.Logo} />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar Contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
      />
      <TouchableOpacity
        style={[styles.button, styles.cajaboton]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Registrando...' : 'Registrar'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  Logo: {
    width: 130,
    height: 130,
    marginBottom:15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    position: 'absolute',
    top: 40,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#e0f7fa',
    borderColor: '#77d353',
    paddingRight: 10,
  },
  button: {
    padding: 15,
    backgroundColor: '#77d353',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cajaboton: {
    width: '80%',
  }
});

export default Registro;