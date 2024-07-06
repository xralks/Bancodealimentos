import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Switch, Image } from 'react-native';
import { supabase } from '../lib/supabase';

export default function UserProfile({ navigation }) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null); 
  const [condition, setCondition] = useState(false); 

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setUserId(user.id);

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('username, full_name, condition') 
          .eq('id', user.id)
          .single();

        if (profileError) {
          Alert.alert('Error', profileError.message);
        } else {
          setUsername(data.username);
          setFullName(data.full_name);
          setCondition(data.condition); 
        }
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({ username, full_name: fullName, condition }) 
      .eq('id', userId);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      navigation.goBack();
    }
  };

  const toggleSwitch = () => setCondition(previousState => !previousState);

  return (
    <View style={styles.container}>
        <Image
          source={require('../assets/postIma.jpg')}
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
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>
          {condition ? 'Soy vendedor' : 'Soy locatario'}
        </Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={condition ? "#77d353" : "#f4f3f4"}
          onValueChange={toggleSwitch}
          value={condition}
        />
      </View>
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 10,
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
