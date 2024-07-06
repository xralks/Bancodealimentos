import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function UserProfile({ navigation }) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null); 

  useEffect(() => {

    const fetchProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setUserId(user.id); 

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          Alert.alert('Error', profileError.message);
        } else {
          setUsername(data.username);
          setFullName(data.full_name);
        }
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({ username, full_name: fullName })
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
      <Button title={loading ? 'Guardando...' : 'Guardar'} onPress={handleSave} disabled={loading} />
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
});
