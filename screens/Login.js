// Login.js
import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { supabase } from '../lib/supabase'; 

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

 
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setLoading(false);
      Alert.alert('Error', loginError.message);
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      setLoading(false);
      Alert.alert('Error', userError.message);
      return;
    }

    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, username, tipo') 
      .eq('id', user.id)
      .single();

    setLoading(false);

    if (profileError) {
      Alert.alert('Error', profileError.message);
      return;
    }

    if (!profile.full_name || !profile.username) {
      navigation.navigate('PrimerPaso'); 
    } else {
      if (profile.tipo === 'Administrador') {
        navigation.navigate('HomeA'); 
      } else {
        navigation.navigate('Home'); 
      }
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Image source={require('../assets/logoO.png')} style={styles.Logo} />
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
      <TouchableOpacity
        style={[styles.button, styles.cajaboton]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Iniciando...' : 'Iniciar Sesión'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Registro')}>
        <Text style={styles.registerText}>¿No tienes una cuenta? Regístrate aquí.</Text>
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
    width: 190,
    height: 200,
    borderColor: 'White',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
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
  registerLink: {
    marginTop: 20,
  },
  registerText: {
    fontSize: 16,
    color: '#77d353',
    marginTop: 20,
    fontWeight: 'bold',
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

export default Login;
