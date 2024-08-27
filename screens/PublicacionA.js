import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';

const PublicacionA = ({ route }) => {
  const { itemId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [publicacionData, setPublicacionData] = useState(null);
  const [authorFullName, setAuthorFullName] = useState('');
  const [authorAddress, setAuthorAddress] = useState('');
  const [authorType, setAuthorType] = useState('');
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    const fetchPublicacionData = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', itemId)
          .single();

        if (error) {
          throw error;
        }

        setPublicacionData(data);
        setIsAccepted(data.aceptada === 'aceptada');
        await fetchAuthorDetails(data.user_id);
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
      setAuthorType(data.tipo); 
    } catch (error) {
      console.error('Error fetching author details:', error.message);
    }
  };

  const handleAcceptPress = async () => {
    try {
      // Obtener el usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Usuario no autenticado');
      }

      
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
               
                const { error: updateError } = await supabase
                  .from('posts')
                  .update({ aceptada: isAccepted ? 'no aceptada' : 'aceptada' }) 
                  .eq('id', itemId);

                if (updateError) {
                  throw updateError;
                }

               
                setIsAccepted(!isAccepted);

                
                Alert.alert('Éxito', `Publicación ${isAccepted ? 'rechazada' : 'aceptada'} correctamente.`);
              } catch (error) {
                Alert.alert('Error', `No se pudo ${isAccepted ? 'rechazar' : 'aceptar'} la publicación.`);
                console.error('Error updating publicacion acceptance:', error.message);
              }
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert('Error', `No se pudo ${isAccepted ? 'rechazar' : 'aceptar'} la publicación.`);
      console.error('Error updating publicacion acceptance:', error.message);
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
          <Text style={styles.detailText}>Publicado por: {authorFullName}</Text>
          <Text style={styles.content}>{publicacionData.content}</Text>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailTextBold}>Fecha y Hora:</Text>
            <Text style={styles.detailText}>{formatDateTime(publicacionData.created_at)}</Text>
            {authorAddress ? (
              <>
                <Text style={styles.detailTextBold}>Ubicación:</Text>
                <Text style={styles.detailText}>{authorAddress}</Text>
              </>
            ) : null}
            {publicacionData.cantidad ? (
              <>
                <Text style={styles.detailTextBold}>Cantidad:</Text>
                <Text style={styles.detailText}>{publicacionData.cantidad}</Text>
              </>
            ) : null}
            {publicacionData.detalle_pedido ? (
              <>
                <Text style={styles.detailTextBold}>Detalle:</Text>
                <Text style={styles.detailText}>{publicacionData.detalle_pedido}</Text>
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
    marginBottom:12,
  },
  acceptButtonText: {
    fontSize: 18,
    color: '#fff',
  fontWeight: 'bold',
  },
});

export default PublicacionA;