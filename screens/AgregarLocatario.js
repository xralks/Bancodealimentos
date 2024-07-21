import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AgregarLocatario({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [cantidad, setCantidad] = useState('');

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !cantidad.trim()) {
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
          cantidad: cantidad.trim(),
          user_id: user.id 
        }
      ]);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Publicación agregada correctamente.', 'Tu publicación será notificada al Banco de Alimentos. Gracias por tu apoyo!!!');
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Image source={require('../assets/logo.png')} style={styles.Logo} />
      </View>
      <Text style={styles.heading}>Crea una publicación para dar aviso al Banco de Alimentos de lo que tienes para realizar una donación.</Text>
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
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Detalle (Detalla lo que tienes para donar)"
        value={cantidad}
        onChangeText={setCantidad}
        multiline
      />
      <Text style={styles.heading}>Carga tus imágenes</Text>
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
});
