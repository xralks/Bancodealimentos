import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import CustomPicker from '../components/CustomPicker';

export default function AgregarLocatario({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [detallePedido, setDetallePedido] = useState([{ name: '' }]);
  const [availableProducts, setAvailableProducts] = useState([]);

  // Fetch products with stock greater than 0
  const fetchAvailableProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('post_productos')
        .select(`
          productos_id,
          productos:productos_id (
            nombrep
          ),
          cantidadp
        `)
        .gt('cantidadp', 0);

      if (error) {
        console.error('Error fetching products:', error.message);
        return;
      }

      setAvailableProducts(data.map(item => ({ label: item.productos.nombrep, value: item.productos.nombrep })));
    } catch (error) {
      console.error('Error fetching available products:', error);
    }
  };

  useEffect(() => {
    fetchAvailableProducts();
  }, []);

  const handleSave = async () => {
    
    if (!title.trim() || !content.trim() || detallePedido.some(item => !item.name)) {
      Alert.alert('Error', 'Por favor, complete todos los campos.');
      return;
    }

    
    const cantidadStr = detallePedido.map(item => `${item.name}`).join(', ');

    
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
          detalle_pedido: cantidadStr,
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
    
    const productAlreadySelected = detallePedido.some(item => item.name === value);
    if (productAlreadySelected) {
      Alert.alert('Error', 'Este producto ya ha sido seleccionado. Selecciona otro o simplemente quita el producto de la lista');
      return;
    }

    
    const newDetallePedido = [...detallePedido];
    newDetallePedido[index][field] = value;
    setDetallePedido(newDetallePedido);
  };

  const handleDeleteItem = (index) => {
    if (detallePedido.length > 1) {
      const newDetallePedido = detallePedido.filter((_, i) => i !== index);
      setDetallePedido(newDetallePedido);
    }
  };

  const handleAddItem = () => {
    setDetallePedido([...detallePedido, { name: '' }]);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View>
          <Image source={require('../assets/logo.png')} style={styles.Logo} />
        </View>
        <Text style={styles.heading}>Publica tu aviso aquí para notificar al Banco de Alimentos, y ellos se encargarán de gestionar la cantidad de alimentos que se entregarán.</Text>
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
        <View style={styles.containeraviso1}>
        <Text style={styles.titulo}>
          IMPORTANTE
            </Text>
          <Text style={styles.heading2}>
            Ten en cuenta que hay muchas instituciones solicitando alimentos, por lo que no todos los productos que pediste podrán ser entregados. Agradecemos tu comprensión y proceda a seleccionar los productos.
          </Text>
        </View>
        {detallePedido.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.productHeader}>
            <Text style={styles.productTitle}>Producto n°{index + 1}</Text>
              {index > 0 && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(index)}
                >
                  <Text style={styles.deleteButtonText}>Eliminar producto n°{index + 1}</Text>
                </TouchableOpacity>
              )}
            </View>
            <CustomPicker
              selectedValue={item.name}
              onValueChange={(value) => handleItemChange(index, 'name', value)}
              options={[{ label: 'Seleccione un producto', value: '' }, ...availableProducts]}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.buttonText}>Añadir otro +</Text>
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
    width: '50%',
    padding: 15,
    backgroundColor: '#56a039',
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
  containeraviso1: {
    backgroundColor: '#f0fbea',
    padding: 10,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 10, 
    borderWidth: 1,
    borderColor: '#77d353',
    shadowColor: '#000', 
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 9, 
    elevation: 5, 
  },
  heading2: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0f290a',
    paddingHorizontal: 10,
  },
  titulo:{
    fontSize:16,
    fontWeight:'500',
    color: '#2a581c',
    paddingHorizontal: 10,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
