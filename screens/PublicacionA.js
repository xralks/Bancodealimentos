import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

const PublicacionA = ({ route }) => {
  const { itemId } = route.params;
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [publicacionData, setPublicacionData] = useState(null);
  const [authorFullName, setAuthorFullName] = useState('');
  const [authorAddress, setAuthorAddress] = useState('');
  const [authorType, setAuthorType] = useState(''); // Tipo de usuario (institución u otro)
  const [isAccepted, setIsAccepted] = useState(false);
  const [productosData, setProductosData] = useState([]);

  useEffect(() => {
    const fetchPublicacionData = async () => {
      try {
        const { data: postData, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', itemId)
          .single();

        if (error) {
          throw error;
        }

        setPublicacionData(postData);
        setIsAccepted(postData.aceptada === 'aceptada');
        await fetchAuthorDetails(postData.user_id);
        await fetchProductos(postData.user_id);
        setIsLoading(false);
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar la publicación.');
        console.error('Error fetching publicacion:', error.message);
      }
    };

    fetchPublicacionData();
  }, [itemId]);

  const fetchAuthorDetails = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, direccion, tipo')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

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
  
      if (error) {
        throw error;
      }
  
      setProductosData(data);
    } catch (error) {
      console.error('Error fetching productos:', error.message);
    }
  };

  const handleAcceptPress = async () => {
    try {
      Alert.alert(
        'Confirmar',
        `¿Estás seguro de que deseas ${isAccepted ? 'rechazar' : 'aceptar'} esta publicación?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Aceptar',
            onPress: async () => {
              try {
                let newAceptadaStatus = isAccepted ? 'no aceptada' : 'aceptada';
  
                // Verificamos si el autor es una institución, ignorando mayúsculas/minúsculas
                if (authorType.toLowerCase() === 'institución' && !isAccepted) {
                  newAceptadaStatus = 'institucionaceptada';
                }
  
                // Actualizar la publicación en la base de datos
                const { error: updateError } = await supabase
                  .from('posts')
                  .update({ aceptada: newAceptadaStatus })
                  .eq('id', itemId);
  
                if (updateError) {
                  throw updateError;
                }
  
                setIsAccepted(!isAccepted);
  
                Alert.alert('Éxito', `Publicación ${isAccepted ? 'rechazada' : newAceptadaStatus === 'institucionaceptada' ? 'aceptada como institución' : 'aceptada'} correctamente.`);
              } catch (error) {
                Alert.alert('Error', `No se pudo ${isAccepted ? 'rechazar' : 'aceptar'} la publicación.`);
                console.error('Error actualizando la publicación:', error.message);
              }
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert('Error', `No se pudo ${isAccepted ? 'rechazar' : 'aceptar'} la publicación.`);
      console.error('Error actualizando la publicación:', error.message);
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
        <Image
          source={require('../assets/postIma.jpg')}
          style={styles.image}
        />
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{publicacionData.title}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Usuario', { userId: publicacionData.user_id })}>
            <Text style={styles.detailText}>Publicado por: <Text style={styles.authorName}>{authorFullName}</Text></Text>
          </TouchableOpacity>
          <Text style={styles.content}>{publicacionData.content}</Text>
          {productosData.length > 0 ? (
              <>
                <Text style={styles.detailTextBold}>Productos:</Text>
                {productosData.map((producto, index) => (
                  <Text key={index} style={styles.detailText}>
                    {producto.productos.nombrep} - Cantidad: {producto.cantidadp} kg
                  </Text>
                ))}
              </>
            ) : null}
            {publicacionData.detalle_pedido ? (
              <>
                <Text style={styles.detailTextBold}>Detalle:</Text>
                <Text style={styles.detailText}>{publicacionData.detalle_pedido}</Text>
              </>
            ) : null}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailTextBold}>Fecha y Hora:</Text>
            <Text style={styles.detailText}>{formatDateTime(publicacionData.created_at)}</Text>
            {authorAddress ? (
              <>
                <Text style={styles.detailTextBold}>Ubicación:</Text>
                <Text style={styles.detailText}>{authorAddress}</Text>
              </>
            ) : null}
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={handleAcceptPress}
        >
          <Text style={styles.acceptButtonText}>
            {isAccepted ? 'Rechazar' : 'Aceptar'}   
          </Text>
        </TouchableOpacity>
      </View>
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
  detailTextBold: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#777',
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#777',
  },
  authorName: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#50b62c',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  acceptButton: {
    width: '80%',
    padding: 15,
    backgroundColor: '#77d353',
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default PublicacionA;
