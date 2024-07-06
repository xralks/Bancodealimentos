// MisPublicaciones.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';

const MisPublicaciones = () => {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);

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
          }
        } catch (error) {
          console.error('Error fetching posts:', error.message);
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
      <TouchableOpacity style={styles.navButton}>
        <Text style={styles.navButtonText}>Eliminar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton}>
        <Text style={styles.navButtonText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Últimos Posts</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    fontSize: 16,
    marginTop: 5,
    color: '#000',
  },
  createdAt: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
  image: {
    width: '100%',
    height: 130,
    marginBottom: 10,
  },
  navButtonText: {
    fontSize: 16,
    color: '#77d353',
    fontWeight: 'bold',
  },
});

export default MisPublicaciones;
