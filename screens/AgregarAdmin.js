import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Switch } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AgregarAdmin({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dirigido, setDirigido] = useState(false); // Estado para dirigido

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Por favor, complete todos los campos.');
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      Alert.alert('Error', userError.message);
      return;
    }

    const { error } = await supabase
      .from('posts')
      .insert([
        { 
          title: title.trim(), 
          content: content.trim(), 
          dirigido: dirigido, // Guardar el estado dirigido
          user_id: user.id 
        }
      ]);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Publicación agregada correctamente.', 'Tu publicación será notificada a los Locatarios. Gracias!!!');
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Image source={require('../assets/logo.png')} style={styles.Logo} />
      </View>
      <Text style={styles.heading}>Crea una Publicación</Text>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Descripción de tu publicación"
        value={content}
        onChangeText={setContent}
        multiline
      />
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>
          Dirigido a: {dirigido ? 'Institución' : 'Locatarios'}
        </Text>
        <Switch
          value={dirigido}
          onValueChange={(value) => setDirigido(value)}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>PUBLICAR</Text>
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
    backgroundColor: '#fff',
  },
  Logo: {
    width: 150,
    height: 160,
    borderColor: 'White',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
  },
  heading: {
    fontSize: 18,
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
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#77d353',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  switchContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#333',
  },
});
