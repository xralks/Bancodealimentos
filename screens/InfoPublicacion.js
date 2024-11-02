import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';

const Publicacion = ({ route, navigation }) => {
  const { itemId } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [publicacionData, setPublicacionData] = useState(null);
  const [authorFullName, setAuthorFullName] = useState('');
  const [authorAddress, setAuthorAddress] = useState('');
  const [authorType, setAuthorType] = useState(null);
  const [productosData, setProductosData] = useState([]);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    fetchProfile()
      .catch(error => console.error('Error in fetchProfile:', error));
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('tipo')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      fetchPublicacionData(itemId);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      Alert.alert('Error', error.message);
    }
  };

  const fetchPublicacionData = async (itemId) => {
    try {
      const { data: postData, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;

      setPublicacionData(postData);
      setIsAccepted(postData.aceptada === 'aceptada');
      await fetchAuthorDetails(postData.user_id);

      // Si el detalle_pedido está vacío, buscamos los productos
      if (!postData.detalle_pedido) {
        await fetchProductos(itemId);
      }

      setIsLoading(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la publicación.');
      console.error('Error fetching publicacion:', error.message);
    }
  };

  const fetchAuthorDetails = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, direccion, tipo')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setAuthorFullName(data.full_name);
      setAuthorAddress(data.direccion);
      setAuthorType(data.tipo); // Guardamos el tipo de usuario (institución u otro)
    } catch (error) {
      console.error('Error fetching author details:', error.message);
    }
  };

  const fetchProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('post_productos')
        .select(`
          cantidadp,
          productos (nombrep)
        `)
        .eq('post_id', itemId);

      if (error) throw error;

      setProductosData(data);
    } catch (error) {
      console.error('Error fetching productos:', error.message);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#94e175" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <Image source={require('../assets/postIma.jpg')} style={styles.image} />
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{publicacionData.title}</Text>
          <Text style={styles.detailText}>Publicado por: {authorFullName} (yo)</Text>
          <Text style={styles.content}>{publicacionData.content}</Text>
          {publicacionData.detalle_pedido ? (
              <>
                <Text style={styles.detailTextBold}>Productos:</Text>
                <Text style={styles.detailText}>{publicacionData.detalle_pedido}</Text>
              </>
            ) : (
              
              productosData.length > 0 && (
                <>
                  <Text style={styles.detailTextBold}>Productos:</Text>
                  {productosData.map((producto, index) => (
                    <Text key={index} style={styles.detailText}>
                      {producto.productos.nombrep} - Cantidad: {producto.cantidadp} KG
                    </Text>
                  ))}
                </>
              )
            )}

          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>Fecha y Hora: {formatDateTime(publicacionData.created_at)}</Text>
            <Text style={styles.detailText}>Dirección: {authorAddress}</Text>
          </View>

          <View style={styles.containeraviso1}>
            <Text style={styles.titulo}>Recordatorio</Text>
            <Text style={styles.heading2}>
              Esto es solo una muestra de tu publicación
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const formatDateTime = (dateTime) => {
  const dateObj = new Date(dateTime);
  const date = dateObj.toLocaleDateString();
  const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  content: {
    fontSize: 18,
    marginBottom: 20,
    lineHeight: 24,
    color: '#555',
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 15,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#777',
  },
  detailTextBold: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
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
  titulo: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2a581c',
    paddingHorizontal: 10,
  },
});

export default Publicacion;
