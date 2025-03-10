import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';

const Publicacion = ({ route, navigation }) => {
  const { itemId } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [publicacionData, setPublicacionData] = useState(null);
  const [authorFullName, setAuthorFullName] = useState('');
  const [authorAddress, setAuthorAddress] = useState('');
  const [userType, setUserType] = useState(null);

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

      setUserType(data.tipo);
      fetchPublicacionData(itemId);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      Alert.alert('Error', error.message);
    }
  };

  const fetchPublicacionData = async (itemId) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;

      setPublicacionData(data);
      await fetchAuthorDetails(data.user_id);
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
        .select('full_name, direccion')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setAuthorFullName(data.full_name);
      setAuthorAddress(data.direccion);
    } catch (error) {
      console.error('Error fetching author details:', error.message);
    }
  };

  const handleButtonPress = () => {
    if (userType === 'Locatario') {
      navigation.navigate('AgregarLocatario');
    } else if (userType === 'Institución') {
      navigation.navigate('AgregarInstitucion');
    } else {
      Alert.alert('Error', 'Tipo de usuario no reconocido.');
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
          <View style={styles.containeraviso1}>
            <Text style={styles.titulo}>IMPORTANTE</Text>
            <Text style={styles.heading2}>
            {userType === 'Locatario' ? 'Esto es solo un aviso de Administración. Si eres locatario y deseas donar productos, deberás crear una publicación con los productos disponibles para la donación.' : 'Esto es solo un aviso de Administración. Si eres Institución y deseas recibir productos, deberás crear una publicación con los productos que se mencionan.'}
            </Text>
          </View>
          <Text style={styles.title}>{publicacionData.title}</Text>
          <Text style={styles.detailText}>Publicado por: (Admin) {authorFullName}</Text>
          <Text style={styles.content}>{publicacionData.content}</Text>
          <Text style={styles.detailText}>Productos: {publicacionData.cantidad}</Text>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>Fecha y Hora: {formatDateTime(publicacionData.created_at)}</Text>
            <Text style={styles.detailText}>Dirección: {authorAddress}</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.contactButton} onPress={handleButtonPress}>
          <Text style={styles.contactButtonText}>
            {userType === 'Locatario' ? 'Crear publicación' : 'Crear publicación'}
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
    marginBottom: 12,
  },
  contactButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
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
