import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';

const Usuario = ({ route }) => {
  const { userId } = route.params; 
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('username, full_name, tipo, direccion')
          .eq('id', userId)
          .single();

        if (userError) {
          throw userError;
        }

        setUserData(userData);


        const { count, error: postError } = await supabase
          .from('posts')
          .select('*', { count: 'exact' })
          .eq('user_id', userId);

        if (postError) {
          throw postError;
        }

        setPostCount(count);
        setIsLoading(false);
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar los detalles del usuario.');
        console.error('Error fetching user data:', error.message);
      }
    };

    fetchUserData();
  }, [userId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#94e175" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.userContainer}>
        <Text style={styles.label}>Nombre Completo:</Text>
        <Text style={styles.value}>{userData.full_name}</Text>
        <Text style={styles.label}>Nombre de Usuario:</Text>
        <Text style={styles.value}>{userData.username}</Text>
        <Text style={styles.label}>Tipo de Usuario:</Text>
        <Text style={styles.value}>{userData.tipo}</Text>
        {userData.direccion ? (
          <>
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.value}>{userData.direccion}</Text>
          </>
        ) : null}

        <Text style={styles.label}>Cantidad de Publicaciones:</Text>
        <Text style={styles.value}>{postCount}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },
  value: {
    fontSize: 18,
    marginBottom: 15,
    color: '#333',
  },
});

export default Usuario;
