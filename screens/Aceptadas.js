// MisPublicaciones.js

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

const MisPublicaciones = () => {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
      } else {
        setUserId(user.id);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      async function fetchData() {
        try {
          const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) {
            throw error;
          }

          if (data) {
            setPosts(data);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error fetching posts:', error.message);
          setIsLoading(false); 
        }
      }

      fetchData();
    }
  }, [userId]);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image
        source={require('../assets/postIma.jpg')}
        style={styles.image}
      />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{item.content}</Text>
      <Text style={styles.createdAt}>{new Date(item.created_at).toLocaleString()}</Text>
      <TouchableOpacity style={styles.navButtonElim}>
        <Text style={styles.navButtonText}>Eliminar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButtonEdit}>
        <Text style={styles.navButtonText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#77d353" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#f0fbea',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#77d353',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color:'#0f290a',
  },
  content: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  createdAt: {
    fontSize: 14,
    color: '#254b1c',
    marginBottom: 5,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  navButtonElim: {
    backgroundColor: '#ed4646',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 5,
  },
  navButtonEdit: {
    backgroundColor: '#77d353',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 5,
  },
  navButtonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});

export default MisPublicaciones;
