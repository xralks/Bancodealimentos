import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Agregar({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = async () => {
    // Validar que el título y el contenido no sean nulos o vacíos
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
        { title: title.trim(), content: content.trim(), user_id: user.id }
      ]);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Éxito', 'Publicación agregada correctamente.');
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Agregar Publicación</Text>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Contenido"
        value={content}
        onChangeText={setContent}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar</Text>
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
  heading: {
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
