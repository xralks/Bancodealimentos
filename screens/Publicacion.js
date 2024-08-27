import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';

const Publicacion = ({ route }) => {
  const { itemId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [publicacionData, setPublicacionData] = useState(null);
  const [authorFullName, setAuthorFullName] = useState('');
  const [authorAddress, setAuthorAddress] = useState('');

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
        .select('full_name, direccion')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      setAuthorFullName(data.full_name);
      setAuthorAddress(data.direccion);
    } catch (error) {
      console.error('Error fetching author details:', error.message);
    }
  };

  const handleContactPress = () => {
    console.log('Contact button pressed');
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
            <Text style={styles.detailText}>Fecha y Hora: {formatDateTime(publicacionData.created_at)}</Text>
            <Text style={styles.detailText}>Dirección: {authorAddress}</Text>
            <Text style={styles.detailText}>Cantidad: {publicacionData.cantidad}</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.contactButton} onPress={() => handleContactPress()}>
          <Text style={styles.contactButtonText}>Contactar</Text>
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
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#777',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#77d353',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
    marginBottom:12,
  },
  contactButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Publicacion;
