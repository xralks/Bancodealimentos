import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import CustomPicker from '../components/CustomPicker';

export default function AgregarLocatario({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [detallePedido, setDetallePedido] = useState([{ type: '', name: '', quantity: '' }]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || detallePedido.some(item => !item.type || !item.name || !item.quantity)) {
      Alert.alert('Error', 'Por favor, complete todos los campos.');
      return;
    }

   
    const cantidadStr = detallePedido.map(item => `${item.type}: ${item.name} (${item.quantity} kg)`).join(', ');

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
          cantidad: cantidadStr,  
          user_id: user.id 
        }
      ]);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Publicación agregada correctamente.', 'Tu publicación será notificada al Banco de Alimentos. ¡Gracias!');
      navigation.goBack();
    }
  };

  const handleItemChange = (index, field, value) => {
    const newDetallePedido = [...detallePedido];
    newDetallePedido[index][field] = value;
    setDetallePedido(newDetallePedido);
  };

  const handleAddItem = () => {
    setDetallePedido([...detallePedido, { type: '', name: '', quantity: '' }]);
  };

  // Opciones para el picker
  const typeOptions = [
    { label: 'Seleccione tipo de producto', value: '' },
    { label: 'Fruta', value: 'Fruta' },
    { label: 'Verdura', value: 'Verdura' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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

        {detallePedido.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={styles.productTitle}>Producto n°{index + 1}</Text>
            <CustomPicker 
              selectedValue={item.type}
              onValueChange={(value) => handleItemChange(index, 'type', value)}
              options={typeOptions}
            />
            <TextInput
              style={styles.input}
              placeholder="Nombre fruta o verdura"
              value={item.name}
              onChangeText={(value) => handleItemChange(index, 'name', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Cantidad en kg"
              keyboardType="numeric"
              value={item.quantity}
              onChangeText={(value) => handleItemChange(index, 'quantity', value)}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.buttonText}>Añadir otro</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>PUBLICAR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  container: {
    width: '100%',
    alignItems: 'center',
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
    fontSize: 16,
    marginBottom: 20,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderColor: '#77d353',
  },
  itemContainer: {
    width: '100%',
    marginBottom: 20,
  },
  addButton: {
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
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#77d353',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
});
