import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import CustomPicker from '../components/CustomPicker';

export default function AgregarLocatario({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [detallePedido, setDetallePedido] = useState([{ product_id: '', quantity: '' }]);
  const [productos, setProductos] = useState([]);

  // Cargar productos desde la base de datos al iniciar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase
        .from('productos')
        .select('id, nombrep, descripcion');
      
      if (error) {
        Alert.alert('Error', 'No se pudo cargar los productos');
      } else {
        setProductos(data);
      }
    };

    fetchProductos();
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || detallePedido.some(item => !item.product_id || !item.quantity)) {
      Alert.alert('Error', 'Por favor, complete todos los campos.');
      return;
    }

    // Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      Alert.alert('Error', userError.message);
      return;
    }

    // Inserción del post en la tabla `posts`
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert([
        { 
          title: title.trim(), 
          content: content.trim(),
          user_id: user.id 
        }
      ])
      .select();

    if (postError) {
      Alert.alert('Error', postError.message);
      return;
    }

    // Obtener el ID del post recién creado
    const postId = post[0].id;

    // Inserción de los productos en la tabla `post_productos`
    const detalleProductos = detallePedido.map(item => ({
      post_id: postId,
      productos_id: item.product_id,
      cantidadp: item.quantity
    }));

    const { error: detalleError } = await supabase
      .from('post_productos')
      .insert(detalleProductos);

    if (detalleError) {
      Alert.alert('Error', detalleError.message);
    } else {
      Alert.alert('Publicación agregada correctamente.', 'Tu publicación será notificada al Banco de Alimentos. ¡Gracias!');
      navigation.goBack();
    }
  };

  const handleItemChange = (index, field, value) => {
    const newDetallePedido = [...detallePedido];
    
    if (field === 'product_id') {
      // Verificar si el producto ya ha sido añadido
      const existeProductoDuplicado = newDetallePedido.some(
        (item, i) => item.product_id === value && i !== index
      );
      
      if (existeProductoDuplicado) {
        Alert.alert('Error', 'Este producto ya está en la lista. Elige otro o suma la cantidad total de Kg a donar del producto');
        return;
      }
    }

    newDetallePedido[index][field] = value;
    setDetallePedido(newDetallePedido);
  };

  const handleAddItem = () => {
    // Verifica si ya existe un producto en blanco (aún no seleccionado)
    const existeProductoDuplicado = detallePedido.some(item => item.product_id === '');

    if (existeProductoDuplicado) {
      Alert.alert('Error', 'Has añadido un producto vacio. Selecciona uno para añadir otro.');
      return;
    }

    setDetallePedido([...detallePedido, { product_id: '', quantity: '' }]);
  };

  const handleDeleteItem = (index) => {
    if (detallePedido.length > 1) {
      const newDetallePedido = detallePedido.filter((_, i) => i !== index);
      setDetallePedido(newDetallePedido);
    }
  };
  // Crear opciones de productos para el picker
  const productOptions = productos.map(producto => ({
    label: `${producto.nombrep} (${producto.descripcion})`,
    value: producto.id
  }));

  const getProductName = (productId) => {
    const product = productos.find(p => p.id === productId);
    return product ? product.nombrep : '';
  };

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
              selectedValue={getProductName(item.product_id)}
              onValueChange={(value) => handleItemChange(index, 'product_id', value)}
              options={productOptions}
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
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
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
