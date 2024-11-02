// MisDatos.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { supabase } from '../lib/supabase';

export default function UserProfile({ navigation }) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [tipo, setTipo] = useState('');
  const [direccion, setDireccion] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setUserId(user.id);

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('username, full_name, tipo, direccion')
          .eq('id', user.id)
          .single();

        if (profileError) {
          Alert.alert('Error', profileError.message);
        } else {
          setUsername(data.username);
          setFullName(data.full_name);
          setTipo(data.tipo);
          setDireccion(data.direccion);
        }
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({ username, full_name: fullName, direccion })
      .eq('id', userId);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/perfil.jpeg')}
        style={styles.profilePicture}
      />
      <Text style={styles.title}>Editar Perfil</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={[styles.input, styles.readOnlyInput]}
        placeholder="Dirección"
        value={direccion}
        editable={false}
      />
      <TextInput
        style={[styles.input, styles.readOnlyInput]}
        placeholder="Tipo"
        value={tipo === 'Administrador' ? 'Administrador' : tipo === 'Institucion' ? 'Institución' : 'Locatario'}
        editable={false}
      />
      <TouchableOpacity
        style={[styles.button, styles.cajaboton]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Guardando...' : 'Guardar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#e0f7fa',
    borderColor: '#77d353',
    paddingRight: 10,
  },
  readOnlyInput: {
    backgroundColor: '#f0f0f0',
    color: '#a0a0a0',
    borderColor: '#d0d0d0',
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
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#000',
  },
});
